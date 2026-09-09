import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getLinePayOrder } from '../../linePayOrderStore.js';
import {
  readV2OrderIdCookie,
  V2_LINE_PAY_ORDER_PATTERN,
} from '../../linePay.js';
import { jsonBodySize, requestOriginMatchesHost } from '../../economy/requestSecurity.js';

/**
 * POST /api/v2/verify-unlock { mbtiType }
 *
 * The LINE Pay confirm handler stores the high-entropy order proof in an
 * HttpOnly cookie and redirects with a non-secret success marker. The client
 * asks here before caching an entitlement; the order id never enters the page
 * URL or analytics payload.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  if (!requestOriginMatchesHost(req)) {
    return res.status(403).json({ ok: false, code: 'FORBIDDEN_ORIGIN' });
  }
  if (jsonBodySize(req.body) > 1_024) {
    return res.status(413).json({ ok: false, code: 'BODY_TOO_LARGE' });
  }

  const legacyOrderId = typeof req.body?.orderId === 'string' ? req.body.orderId.trim() : '';
  const orderId = readV2OrderIdCookie(req.headers.cookie) || legacyOrderId;
  const mbtiType = typeof req.body?.mbtiType === 'string'
    ? req.body.mbtiType.trim().toUpperCase()
    : '';

  if (!V2_LINE_PAY_ORDER_PATTERN.test(orderId)) {
    return res.status(400).json({ ok: false, code: 'INVALID_ORDER_ID' });
  }
  if (!/^[A-Z]{4}-[AT]$/.test(mbtiType)) {
    return res.status(400).json({ ok: false, code: 'INVALID_MBTI_TYPE' });
  }

  const order = await getLinePayOrder(orderId);

  // undefined = store unavailable (missing env / DB error). Fail closed rather
  // than handing out an entitlement we could not verify.
  if (order === undefined) {
    console.error('[v2 verify-unlock] order store unavailable', { orderId });
    return res.status(503).json({ ok: false, code: 'STORE_UNAVAILABLE' });
  }

  if (
    !order
    || order.status !== 'confirmed'
    || order.mbti_type.toUpperCase() !== mbtiType
  ) {
    return res.status(403).json({ ok: false, code: 'NOT_CONFIRMED' });
  }

  return res.status(200).json({
    ok: true,
    code: 'OK',
    data: {
      mbtiType: order.mbti_type,
      confirmedAt: order.confirmed_at,
    },
  });
}
