import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  buildAppBaseUrl,
  buildLinePayApiPath,
  buildV2OrderCookie,
  isLinePaySuccessCode,
  parseMbtiTypeFromOrderId,
  requestLinePay,
  V2_REPORT_CURRENCY,
  V2_REPORT_PRICE_TWD,
} from '../../server/linePay.js';
import {
  getLinePayOrder,
  updateLinePayOrder,
} from '../../server/linePayOrderStore.js';
import { getUserAdminDb } from '../../server/supabase/user-admin.js';

function getOrigin(req: VercelRequest) {
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'localhost:5173';
  return `${proto}://${host}`;
}

function buildCheckoutErrorUrl(appBaseUrl: string, mbtiType: string, reason?: string) {
  const params = new URLSearchParams({
    checkout: 'error',
  });

  if (reason) {
    params.set('reason', reason);
  }

  return `${appBaseUrl}/read/${encodeURIComponent(mbtiType)}?${params.toString()}`;
}

function buildCheckoutSuccessUrl(appBaseUrl: string, mbtiType: string, source: string) {
  const params = new URLSearchParams({ unlock: 'success', source });
  return `${appBaseUrl}/read/${encodeURIComponent(mbtiType)}?${params.toString()}`;
}

function getQueryStringValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const orderId = getQueryStringValue(req.query.orderId);
  const transactionId = getQueryStringValue(req.query.transactionId);
  const typeFromQuery = getQueryStringValue(req.query.mbtiType);
  const appBaseUrl = buildAppBaseUrl(getOrigin(req));

  if (!orderId || !transactionId) {
    return res.redirect(
      302,
      `${appBaseUrl}/read${typeFromQuery ? `/${encodeURIComponent(typeFromQuery)}` : ''}?checkout=error`,
    );
  }

  try {
    const storedOrder = await getLinePayOrder(orderId);
    const mbtiType = storedOrder?.mbti_type || parseMbtiTypeFromOrderId(orderId) || typeFromQuery;
    const source =
      storedOrder?.source ||
      getQueryStringValue(req.query.source) ||
      'linepay';
    // The request endpoint stores only a server-verified Supabase user id.
    // Never recover identity from redirect query parameters.
    const userUid = storedOrder?.user_uid || '';

    if (!mbtiType) {
      return res.redirect(302, `${appBaseUrl}/read?checkout=error`);
    }

    if (storedOrder === undefined) {
      console.error('[LINE PAY] confirm blocked: order store unavailable', { orderId, transactionId });
      return res.redirect(302, buildCheckoutErrorUrl(appBaseUrl, mbtiType, 'store_unavailable'));
    }

    if (storedOrder === null) {
      console.error('[LINE PAY] confirm blocked: order not found', { orderId, transactionId });
      return res.redirect(302, buildCheckoutErrorUrl(appBaseUrl, mbtiType, 'order_not_found'));
    }

    if (storedOrder?.status === 'cancelled') {
      return res.redirect(302, `${appBaseUrl}/read/${encodeURIComponent(mbtiType)}?checkout=cancelled`);
    }

    if (storedOrder.status === 'confirmed') {
      res.setHeader('Set-Cookie', buildV2OrderCookie(orderId));
      return res.redirect(302, buildCheckoutSuccessUrl(appBaseUrl, mbtiType, source));
    }

    if (
      storedOrder?.line_transaction_id &&
      storedOrder.line_transaction_id !== transactionId
    ) {
      await updateLinePayOrder(orderId, {
        status: 'confirm_failed',
        last_error: `transaction_id_mismatch:${transactionId}`,
      }, { expectedStatuses: ['created', 'requested', 'request_failed', 'confirm_failed'] });
      console.error('[LINE PAY] confirm blocked: transaction mismatch', {
        orderId,
        expectedTransactionId: storedOrder.line_transaction_id,
        transactionId,
      });
      return res.redirect(
        302,
        buildCheckoutErrorUrl(appBaseUrl, mbtiType, 'transaction_mismatch'),
      );
    }

    const amount = storedOrder.amount ?? V2_REPORT_PRICE_TWD;
    const currency = storedOrder.currency ?? V2_REPORT_CURRENCY;
    const apiPath = buildLinePayApiPath(`/payments/${transactionId}/confirm`);
    const result = await requestLinePay({
      method: 'POST',
      apiPath,
      data: {
        amount,
        currency,
      },
    });

    if (!isLinePaySuccessCode(result.returnCode)) {
      await updateLinePayOrder(orderId, {
        status: 'confirm_failed',
        line_transaction_id: transactionId,
        line_return_code: result.returnCode,
        line_return_message: result.returnMessage,
        confirm_response: result as unknown as Record<string, unknown>,
        last_error: result.returnMessage || 'LINE Pay confirm failed',
      }, { expectedStatuses: ['created', 'requested', 'request_failed', 'confirm_failed'] });
      console.error('[LINE PAY] confirm failed', result);
      return res.redirect(
        302,
        buildCheckoutErrorUrl(appBaseUrl, mbtiType, 'confirm_failed'),
      );
    }

    const confirmedPersisted = await updateLinePayOrder(orderId, {
      status: 'confirmed',
      line_transaction_id: transactionId,
      line_return_code: result.returnCode,
      line_return_message: result.returnMessage,
      confirm_response: result as unknown as Record<string, unknown>,
      confirmed_at: new Date().toISOString(),
      last_error: null,
    }, {
      // A successful provider confirmation is the payment truth. It may win a
      // near-simultaneous browser cancel, while failure/cancel writes are never
      // allowed to overwrite an already confirmed order.
      expectedStatuses: ['created', 'requested', 'request_failed', 'confirm_failed', 'cancelled'],
    });

    if (!confirmedPersisted) {
      const latestOrder = await getLinePayOrder(orderId);
      if (latestOrder?.status !== 'confirmed') {
        console.error('[LINE PAY] payment confirmed but order persistence failed', {
          orderId,
          transactionId,
        });
        return res.redirect(302, buildCheckoutErrorUrl(appBaseUrl, mbtiType, 'confirmation_pending'));
      }
    }

    if (userUid) {
      try {
        const adminDb = getUserAdminDb();
        if (adminDb) {
          const unlockedAt = new Date().toISOString();
          const { error } = await adminDb
            .schema('public')
            .from('profiles')
            .update({
              v2_unlocked_at: unlockedAt,
              updated_at: unlockedAt,
            })
            .eq('id', userUid);

          if (error) {
            console.error('[LINE PAY] failed to persist v2_unlocked_at', error);
          }
        }
      } catch (dbError) {
        console.error('[LINE PAY] Supabase update error', dbError);
      }
    }

    res.setHeader('Set-Cookie', buildV2OrderCookie(orderId));
    return res.redirect(302, buildCheckoutSuccessUrl(appBaseUrl, mbtiType, source));
  } catch (error) {
    console.error('[LINE PAY] confirm error', error);
    await updateLinePayOrder(orderId, {
      status: 'confirm_failed',
      line_transaction_id: transactionId || null,
      last_error: error instanceof Error ? error.message : 'LINE Pay confirm error',
    }, { expectedStatuses: ['created', 'requested', 'request_failed', 'confirm_failed'] });
    const mbtiType = parseMbtiTypeFromOrderId(orderId) || typeFromQuery;
    return res.redirect(
      302,
      mbtiType
        ? buildCheckoutErrorUrl(appBaseUrl, mbtiType, 'confirm_exception')
        : `${appBaseUrl}/read?checkout=error`,
    );
  }
}
