import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  buildAppBaseUrl,
  buildV2OrderCookie,
  clearV2PendingOrderCookie,
  parseMbtiTypeFromOrderId,
} from '../../linePay.js';
import { fulfillLinePayOrder } from '../../linePayFulfillment.js';

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

  const result = await fulfillLinePayOrder({
    orderId,
    transactionId,
    typeFromQuery,
    sourceFromQuery: getQueryStringValue(req.query.source),
  });

  const mbtiType = result.mbtiType || parseMbtiTypeFromOrderId(orderId) || typeFromQuery;

  if (!mbtiType) {
    return res.redirect(302, `${appBaseUrl}/read?checkout=error`);
  }

  if (result.ok) {
    res.setHeader('Set-Cookie', [
      buildV2OrderCookie(orderId),
      clearV2PendingOrderCookie(),
    ]);
    return res.redirect(302, buildCheckoutSuccessUrl(appBaseUrl, mbtiType, result.source));
  }

  if (result.reason === 'cancelled') {
    res.setHeader('Set-Cookie', clearV2PendingOrderCookie());
    return res.redirect(302, `${appBaseUrl}/read/${encodeURIComponent(mbtiType)}?checkout=cancelled`);
  }

  return res.redirect(302, buildCheckoutErrorUrl(appBaseUrl, mbtiType, result.reason));
}
