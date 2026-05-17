import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  buildAppBaseUrl,
  buildLinePayApiPath,
  buildV2LinePayOrderId,
  getLinePayConfig,
  isLinePaySuccessCode,
  requestLinePay,
  type LinePayPaymentRequestInfo,
} from '../../server/linePay.js';
import { createLinePayOrder, updateLinePayOrder } from '../../server/linePayOrderStore.js';

const V2_PRICE_TWD = 149;
const V2_CURRENCY = 'TWD';

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

  const { mbtiType, source = 'direct' } = req.body as {
    mbtiType?: string;
    source?: string;
    userUid?: string;
  };
  const userUid = typeof req.body?.userUid === 'string' ? req.body.userUid : '';

  if (!mbtiType || typeof mbtiType !== 'string') {
    return res.status(400).json({ ok: false, error: 'Missing mbtiType' });
  }

  const orderId = buildV2LinePayOrderId(mbtiType);

  try {
    getLinePayConfig();

    const origin = getOrigin(req);
    const appBaseUrl = buildAppBaseUrl(origin);
    const apiPath = buildLinePayApiPath('/payments/request');
    const sharedRedirectParams = `mbtiType=${encodeURIComponent(mbtiType)}&source=${encodeURIComponent(source)}&orderId=${encodeURIComponent(orderId)}${userUid ? `&userUid=${encodeURIComponent(userUid)}` : ''}`;
    const payload = {
      amount: V2_PRICE_TWD,
      currency: V2_CURRENCY,
      orderId,
      packages: [
        {
          id: orderId,
          amount: V2_PRICE_TWD,
          name: 'Kiwimu V2 Report',
          products: [
            {
              id: `v2-report-${mbtiType}`,
              name: `Kiwimu V2 深度報告 ${mbtiType}`,
              quantity: 1,
              price: V2_PRICE_TWD,
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
      amount: V2_PRICE_TWD,
      currency: V2_CURRENCY,
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
      });

      return res.status(400).json({
        ok: false,
        error: result.returnMessage || 'LINE Pay request failed',
        returnCode: result.returnCode,
      });
    }

    await updateLinePayOrder(orderId, {
      status: 'requested',
      line_transaction_id: result.info.transactionId,
      line_return_code: result.returnCode,
      line_return_message: result.returnMessage,
      request_response: result as unknown as Record<string, unknown>,
      requested_at: new Date().toISOString(),
      last_error: null,
    });

    return res.status(200).json({
      ok: true,
      orderId,
      transactionId: result.info.transactionId,
      paymentUrl: result.info.paymentUrl.web,
      appPaymentUrl: result.info.paymentUrl.app || null,
    });
  } catch (error) {
    await updateLinePayOrder(orderId, {
      status: 'request_failed',
      last_error: error instanceof Error ? error.message : 'Failed to create LINE Pay request',
    });
    console.error('[LINE PAY] request error', error);
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to create LINE Pay request',
    });
  }
}
