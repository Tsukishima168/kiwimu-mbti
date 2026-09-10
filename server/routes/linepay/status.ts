import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  buildAppBaseUrl,
  buildLinePayApiPath,
  buildV2OrderCookie,
  clearV2PendingOrderCookie,
  readV2PendingOrderIdCookie,
  requestLinePay,
} from '../../linePay.js';
import {
  getLinePayOrder,
  updateLinePayOrder,
} from '../../linePayOrderStore.js';
import { fulfillLinePayOrder, persistV2UnlockForUser } from '../../linePayFulfillment.js';
import {
  jsonBodySize,
  requestOriginMatchesHost,
} from '../../economy/requestSecurity.js';

const AUTH_PENDING_CODE = '0000';
const AUTH_READY_CODE = '0110';
const AUTH_CANCELLED_CODE = '0121';
const AUTH_FAILED_CODE = '0122';
const PAYMENT_COMPLETED_CODE = '0123';

function getOrigin(req: VercelRequest) {
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'localhost:5173';
  return `${proto}://${host}`;
}

function buildCheckoutSuccessUrl(appBaseUrl: string, mbtiType: string, source: string) {
  const params = new URLSearchParams({ unlock: 'success', source });
  return `${appBaseUrl}/read/${encodeURIComponent(mbtiType)}?${params.toString()}`;
}

function setConfirmedCookies(res: VercelResponse, orderId: string) {
  res.setHeader('Set-Cookie', [
    buildV2OrderCookie(orderId),
    clearV2PendingOrderCookie(),
  ]);
}

function setClearedPendingCookie(res: VercelResponse) {
  res.setHeader('Set-Cookie', clearV2PendingOrderCookie());
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  if (process.env.V2_CHECKOUT_ENABLED !== 'true') {
    return res.status(503).json({ ok: false, code: 'CHECKOUT_CLOSED' });
  }

  if (!requestOriginMatchesHost(req)) {
    return res.status(403).json({ ok: false, code: 'FORBIDDEN_ORIGIN' });
  }

  if (jsonBodySize(req.body) > 4_096) {
    return res.status(413).json({ ok: false, code: 'BODY_TOO_LARGE' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const requestedType = typeof (body as { mbtiType?: unknown }).mbtiType === 'string'
    ? (body as { mbtiType: string }).mbtiType.trim().toUpperCase()
    : '';

  if (!/^[A-Z]{4}-[AT]$/.test(requestedType)) {
    return res.status(400).json({ ok: false, code: 'INVALID_MBTI_TYPE' });
  }

  const orderId = readV2PendingOrderIdCookie(req.headers.cookie);
  if (!orderId) {
    return res.status(400).json({ ok: false, code: 'NO_PENDING_ORDER' });
  }

  const storedOrder = await getLinePayOrder(orderId);
  if (storedOrder === undefined) {
    return res.status(503).json({ ok: false, code: 'STORE_UNAVAILABLE' });
  }
  if (storedOrder === null) {
    setClearedPendingCookie(res);
    return res.status(404).json({ ok: false, code: 'ORDER_NOT_FOUND' });
  }

  if (storedOrder.mbti_type !== requestedType) {
    return res.status(403).json({ ok: false, code: 'ORDER_TYPE_MISMATCH' });
  }

  const appBaseUrl = buildAppBaseUrl(getOrigin(req));
  const source = storedOrder.source || 'linepay';

  if (storedOrder.status === 'confirmed') {
    setConfirmedCookies(res, orderId);
    return res.status(200).json({
      ok: true,
      data: {
        mbtiType: storedOrder.mbti_type,
        status: 'confirmed',
        redirectUrl: buildCheckoutSuccessUrl(appBaseUrl, storedOrder.mbti_type, source),
      },
    });
  }

  if (storedOrder.status === 'cancelled') {
    setClearedPendingCookie(res);
    return res.status(409).json({ ok: false, code: 'PAYMENT_CANCELLED' });
  }

  const transactionId = storedOrder.line_transaction_id;
  if (!transactionId) {
    return res.status(409).json({ ok: false, code: 'PAYMENT_NOT_REQUESTED' });
  }

  try {
    const checkResult = await requestLinePay({
      method: 'GET',
      apiPath: buildLinePayApiPath(`/payments/requests/${transactionId}/check`),
    });

    if (checkResult.returnCode === AUTH_PENDING_CODE) {
      return res.status(202).json({ ok: false, code: 'AUTH_PENDING' });
    }

    if (checkResult.returnCode === AUTH_CANCELLED_CODE) {
      await updateLinePayOrder(orderId, {
        status: 'cancelled',
        line_return_code: checkResult.returnCode,
        line_return_message: checkResult.returnMessage,
        cancel_context: checkResult as unknown as Record<string, unknown>,
        cancelled_at: new Date().toISOString(),
        last_error: checkResult.returnMessage || 'LINE Pay authentication cancelled',
      }, { expectedStatuses: ['created', 'requested', 'request_failed', 'confirm_failed'] });
      setClearedPendingCookie(res);
      return res.status(409).json({ ok: false, code: 'PAYMENT_CANCELLED' });
    }

    if (checkResult.returnCode === AUTH_FAILED_CODE) {
      await updateLinePayOrder(orderId, {
        status: 'confirm_failed',
        line_return_code: checkResult.returnCode,
        line_return_message: checkResult.returnMessage,
        confirm_response: checkResult as unknown as Record<string, unknown>,
        last_error: checkResult.returnMessage || 'LINE Pay authentication failed',
      }, { expectedStatuses: ['created', 'requested', 'request_failed', 'confirm_failed'] });
      setClearedPendingCookie(res);
      return res.status(409).json({ ok: false, code: 'PAYMENT_FAILED' });
    }

    if (checkResult.returnCode === PAYMENT_COMPLETED_CODE) {
      const persisted = await updateLinePayOrder(orderId, {
        status: 'confirmed',
        line_transaction_id: transactionId,
        line_return_code: checkResult.returnCode,
        line_return_message: checkResult.returnMessage,
        confirm_response: checkResult as unknown as Record<string, unknown>,
        confirmed_at: new Date().toISOString(),
        last_error: null,
      }, { expectedStatuses: ['created', 'requested', 'request_failed', 'confirm_failed', 'cancelled'] });

      if (!persisted) {
        const latestOrder = await getLinePayOrder(orderId);
        if (latestOrder?.status !== 'confirmed') {
          return res.status(409).json({ ok: false, code: 'CONFIRMATION_PENDING' });
        }
      }

      await persistV2UnlockForUser(storedOrder.user_uid);
      setConfirmedCookies(res, orderId);
      return res.status(200).json({
        ok: true,
        data: {
          mbtiType: storedOrder.mbti_type,
          status: 'confirmed',
          redirectUrl: buildCheckoutSuccessUrl(appBaseUrl, storedOrder.mbti_type, source),
        },
      });
    }

    if (checkResult.returnCode !== AUTH_READY_CODE) {
      return res.status(409).json({
        ok: false,
        code: 'PAYMENT_NOT_READY',
        providerCode: checkResult.returnCode,
      });
    }

    const fulfilled = await fulfillLinePayOrder({
      orderId,
      transactionId,
      typeFromQuery: storedOrder.mbti_type,
      sourceFromQuery: source,
    });

    if (!fulfilled.ok) {
      if (fulfilled.reason === 'cancelled') {
        setClearedPendingCookie(res);
      }
      return res.status(409).json({ ok: false, code: fulfilled.reason.toUpperCase() });
    }

    setConfirmedCookies(res, orderId);
    return res.status(200).json({
      ok: true,
      data: {
        mbtiType: fulfilled.mbtiType,
        status: 'confirmed',
        redirectUrl: buildCheckoutSuccessUrl(appBaseUrl, fulfilled.mbtiType, fulfilled.source),
      },
    });
  } catch (error) {
    console.error('[LINE PAY] status check error', error);
    return res.status(502).json({ ok: false, code: 'STATUS_CHECK_FAILED' });
  }
}
