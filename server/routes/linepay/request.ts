import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  buildAppBaseUrl,
  buildLinePayApiPath,
  buildV2LinePayOrderId,
  getLinePayConfig,
  isLinePaySuccessCode,
  requestLinePay,
  type LinePayPaymentRequestInfo,
  V2_REPORT_CURRENCY,
  V2_REPORT_PRICE_TWD,
} from '../../linePay.js';
import { createLinePayOrder, updateLinePayOrder } from '../../linePayOrderStore.js';
import {
  getBearerToken,
  jsonBodySize,
  requestOriginMatchesHost,
} from '../../economy/requestSecurity.js';
import { getUserAdminDb } from '../../supabase/user-admin.js';

function getOrigin(req: VercelRequest) {
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'localhost:5173';
  return `${proto}://${host}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  if (process.env.V2_CHECKOUT_ENABLED !== 'true') {
    return res.status(503).json({ ok: false, error: 'V2 checkout is not open yet' });
  }
  if (!requestOriginMatchesHost(req)) {
    return res.status(403).json({ ok: false, error: 'Forbidden origin' });
  }
  if (jsonBodySize(req.body) > 4_096) {
    return res.status(413).json({ ok: false, error: 'Request body too large' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const { mbtiType: rawMbtiType, source: rawSource = 'direct' } = body as {
    mbtiType?: string;
    source?: string;
  };
  const mbtiType = typeof rawMbtiType === 'string' ? rawMbtiType.trim().toUpperCase() : '';
  const source = typeof rawSource === 'string' ? rawSource.trim().slice(0, 80) || 'direct' : 'direct';

  if (!/^[A-Z]{4}-[AT]$/.test(mbtiType)) {
    return res.status(400).json({ ok: false, error: 'Invalid mbtiType' });
  }

  // Never trust a user id supplied by the browser. If the buyer is signed in,
  // derive the id from the verified Supabase access token; anonymous checkout
  // remains supported with a null user id and the high-entropy order proof.
  let userUid = '';
  const bearerToken = getBearerToken(req);
  if (bearerToken) {
    const admin = getUserAdminDb();
    if (!admin) {
      return res.status(503).json({ ok: false, error: 'Auth service unavailable' });
    }
    const { data: authData, error: authError } = await admin.auth.getUser(bearerToken);
    if (authError || !authData.user) {
      return res.status(401).json({ ok: false, error: 'Invalid session' });
    }
    userUid = authData.user.id;
  }

  const orderId = buildV2LinePayOrderId(mbtiType);

  try {
    getLinePayConfig();

    const origin = getOrigin(req);
    const appBaseUrl = buildAppBaseUrl(origin);
    const apiPath = buildLinePayApiPath('/payments/request');
    const sharedRedirectParams = `mbtiType=${encodeURIComponent(mbtiType)}&source=${encodeURIComponent(source)}&orderId=${encodeURIComponent(orderId)}`;
    const payload = {
      amount: V2_REPORT_PRICE_TWD,
      currency: V2_REPORT_CURRENCY,
      orderId,
      packages: [
        {
          id: orderId,
          amount: V2_REPORT_PRICE_TWD,
          name: 'Kiwimu V2 Report',
          products: [
            {
              id: `v2-report-${mbtiType}`,
              name: `Kiwimu V2 深度報告 ${mbtiType}`,
              quantity: 1,
              price: V2_REPORT_PRICE_TWD,
            },
          ],
        },
      ],
      redirectUrls: {
        confirmUrl: `${appBaseUrl}/api/linepay/confirm?${sharedRedirectParams}`,
        cancelUrl: `${appBaseUrl}/api/linepay/cancel?${sharedRedirectParams}`,
      },
    };

    const orderCreated = await createLinePayOrder({
      orderId,
      mbtiType,
      source,
      userUid,
      amount: V2_REPORT_PRICE_TWD,
      currency: V2_REPORT_CURRENCY,
      requestPayload: payload as Record<string, unknown>,
    });

    if (!orderCreated) {
      return res.status(500).json({
        ok: false,
        error: 'LINE Pay order store is not available',
      });
    }

    const result = await requestLinePay<LinePayPaymentRequestInfo>({
      method: 'POST',
      apiPath,
      data: payload,
    });

    if (!isLinePaySuccessCode(result.returnCode) || !result.info?.paymentUrl?.web) {
      await updateLinePayOrder(orderId, {
        status: 'request_failed',
        line_return_code: result.returnCode,
        line_return_message: result.returnMessage,
        request_response: result as unknown as Record<string, unknown>,
        last_error: result.returnMessage || 'LINE Pay request failed',
      }, { expectedStatuses: ['created'] });

      return res.status(400).json({
        ok: false,
        error: result.returnMessage || 'LINE Pay request failed',
        returnCode: result.returnCode,
      });
    }

    const requestPersisted = await updateLinePayOrder(orderId, {
      status: 'requested',
      line_transaction_id: result.info.transactionId,
      line_return_code: result.returnCode,
      line_return_message: result.returnMessage,
      request_response: result as unknown as Record<string, unknown>,
      requested_at: new Date().toISOString(),
      last_error: null,
    }, { expectedStatuses: ['created'] });

    if (!requestPersisted) {
      console.error('[LINE PAY] request succeeded but transaction persistence failed', {
        orderId,
        transactionId: result.info.transactionId,
      });
      return res.status(503).json({
        ok: false,
        error: 'Failed to persist payment session',
      });
    }

    return res.status(200).json({
      ok: true,
      paymentUrl: result.info.paymentUrl.web,
    });
  } catch (error) {
    await updateLinePayOrder(orderId, {
      status: 'request_failed',
      last_error: error instanceof Error ? error.message : 'Failed to create LINE Pay request',
    }, { expectedStatuses: ['created', 'request_failed'] });
    console.error('[LINE PAY] request error', error);
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to create LINE Pay request',
    });
  }
}
