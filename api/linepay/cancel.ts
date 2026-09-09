import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  buildAppBaseUrl,
  buildV2OrderCookie,
  parseMbtiTypeFromOrderId,
} from '../../server/linePay.js';
import { getLinePayOrder, updateLinePayOrder } from '../../server/linePayOrderStore.js';

function getOrigin(req: VercelRequest) {
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'localhost:5173';
  return `${proto}://${host}`;
}

function getQueryStringValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const orderId = getQueryStringValue(req.query.orderId);
  const typeFromQuery = getQueryStringValue(req.query.mbtiType);
  const storedOrder = orderId ? await getLinePayOrder(orderId) : null;
  const mbtiType = storedOrder?.mbti_type || parseMbtiTypeFromOrderId(orderId) || typeFromQuery;
  const appBaseUrl = buildAppBaseUrl(getOrigin(req));

  if (storedOrder?.status === 'confirmed') {
    res.setHeader('Set-Cookie', buildV2OrderCookie(orderId));
    return res.redirect(
      302,
      `${appBaseUrl}/read/${encodeURIComponent(mbtiType)}?unlock=success`,
    );
  }

  const nextUrl = mbtiType
    ? `${appBaseUrl}/read/${encodeURIComponent(mbtiType)}?checkout=cancelled`
    : `${appBaseUrl}/read?checkout=cancelled`;

  if (orderId && storedOrder) {
    await updateLinePayOrder(orderId, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancel_context: {
        mbtiType,
        source: getQueryStringValue(req.query.source) || 'linepay',
      },
      last_error: null,
    }, { expectedStatuses: ['created', 'requested', 'request_failed', 'confirm_failed'] });
  }

  return res.redirect(302, nextUrl);
}
