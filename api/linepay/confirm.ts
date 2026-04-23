import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  buildAppBaseUrl,
  buildLinePayApiPath,
  isLinePaySuccessCode,
  parseMbtiTypeFromOrderId,
  requestLinePay,
} from '../../server/linePay';
import {
  getLinePayOrder,
  isLinePayOrderStoreAvailable,
  updateLinePayOrder,
} from '../../server/linePayOrderStore';
import { getUserAdminDb } from '../../server/supabase/user-admin';

const V2_PRICE_TWD = 149;
const V2_CURRENCY = 'TWD';

function getOrigin(req: VercelRequest) {
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'localhost:5173';
  return `${proto}://${host}`;
}

function buildCheckoutErrorUrl(appBaseUrl: string, mbtiType: string, orderId: string, reason?: string) {
  const params = new URLSearchParams({
    checkout: 'error',
    order_id: orderId,
  });

  if (reason) {
    params.set('reason', reason);
  }

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
    const orderStoreEnabled = isLinePayOrderStoreAvailable();
    const storedOrder = await getLinePayOrder(orderId);
    const mbtiType =
      storedOrder?.mbti_type || parseMbtiTypeFromOrderId(orderId) || typeFromQuery;
    const source =
      storedOrder?.source ||
      getQueryStringValue(req.query.source) ||
      'linepay';
    const userUid =
      storedOrder?.user_uid ||
      getQueryStringValue(req.query.userUid);

    if (!mbtiType) {
      return res.redirect(302, `${appBaseUrl}/read?checkout=error`);
    }

    if (orderStoreEnabled && storedOrder === null) {
      console.error('[LINE PAY] confirm blocked: order not found', { orderId, transactionId });
      return res.redirect(302, buildCheckoutErrorUrl(appBaseUrl, mbtiType, orderId, 'order_not_found'));
    }

    if (storedOrder?.status === 'cancelled') {
      return res.redirect(302, `${appBaseUrl}/read/${encodeURIComponent(mbtiType)}?checkout=cancelled&order_id=${encodeURIComponent(orderId)}`);
    }

    if (
      storedOrder?.line_transaction_id &&
      storedOrder.line_transaction_id !== transactionId
    ) {
      await updateLinePayOrder(orderId, {
        status: 'confirm_failed',
        last_error: `transaction_id_mismatch:${transactionId}`,
      });
      console.error('[LINE PAY] confirm blocked: transaction mismatch', {
        orderId,
        expectedTransactionId: storedOrder.line_transaction_id,
        transactionId,
      });
      return res.redirect(
        302,
        buildCheckoutErrorUrl(appBaseUrl, mbtiType, orderId, 'transaction_mismatch'),
      );
    }

    if (storedOrder?.status === 'confirmed') {
      return res.redirect(
        302,
        `${appBaseUrl}/read/${encodeURIComponent(mbtiType)}?unlock=success&order_id=${encodeURIComponent(orderId)}&transaction_id=${encodeURIComponent(transactionId)}&source=${encodeURIComponent(source)}`,
      );
    }

    const amount = storedOrder?.amount ?? V2_PRICE_TWD;
    const currency = storedOrder?.currency ?? V2_CURRENCY;
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
      });
      console.error('[LINE PAY] confirm failed', result);
      return res.redirect(
        302,
        buildCheckoutErrorUrl(appBaseUrl, mbtiType, orderId, 'confirm_failed'),
      );
    }

    await updateLinePayOrder(orderId, {
      status: 'confirmed',
      line_transaction_id: transactionId,
      line_return_code: result.returnCode,
      line_return_message: result.returnMessage,
      confirm_response: result as unknown as Record<string, unknown>,
      confirmed_at: new Date().toISOString(),
      last_error: null,
    });

    if (userUid) {
      try {
        const adminDb = getUserAdminDb();
        if (adminDb) {
          const unlockedAt = new Date().toISOString();
          const { error } = await adminDb
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

    return res.redirect(
      302,
      `${appBaseUrl}/read/${encodeURIComponent(mbtiType)}?unlock=success&order_id=${encodeURIComponent(orderId)}&transaction_id=${encodeURIComponent(transactionId)}&source=${encodeURIComponent(source)}`,
    );
  } catch (error) {
    console.error('[LINE PAY] confirm error', error);
    await updateLinePayOrder(orderId, {
      status: 'confirm_failed',
      line_transaction_id: transactionId || null,
      last_error: error instanceof Error ? error.message : 'LINE Pay confirm error',
    });
    const mbtiType = parseMbtiTypeFromOrderId(orderId) || typeFromQuery;
    return res.redirect(
      302,
      mbtiType
        ? buildCheckoutErrorUrl(appBaseUrl, mbtiType, orderId, 'confirm_exception')
        : `${appBaseUrl}/read?checkout=error`,
    );
  }
}
