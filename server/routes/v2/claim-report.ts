import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jsonBodySize, requestOriginMatchesHost } from '../../economy/requestSecurity.js';
import { getVerifiedV2User } from '../../v2Account.js';
import { readV2OrderIdCookie } from '../../linePay.js';
import { claimAnonymousLinePayOrder, getLinePayOrder } from '../../linePayOrderStore.js';
import { notifyV2Payment } from '../../v2PaymentNotifications.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
  if (!requestOriginMatchesHost(req)) return res.status(403).json({ ok: false, code: 'FORBIDDEN_ORIGIN' });
  if (jsonBodySize(req.body) > 1_024) return res.status(413).json({ ok: false, code: 'BODY_TOO_LARGE' });
  const identity = await getVerifiedV2User(req);
  if (!identity.user) return res.status(identity.code === 'AUTH_UNAVAILABLE' ? 503 : 401).json({ ok: false, code: identity.code });
  if (!identity.user.email || !identity.user.email_confirmed_at) return res.status(422).json({ ok: false, code: 'VERIFIED_EMAIL_REQUIRED' });
  // Only the current browser's HttpOnly payment proof can claim a legacy order.
  // Body/header order ids or user ids are deliberately ignored.
  const orderId = readV2OrderIdCookie(req.headers.cookie);
  if (!orderId) return res.status(400).json({ ok: false, code: 'NO_PURCHASE_PROOF' });
  try {
    const order = await getLinePayOrder(orderId);
    if (order === undefined) return res.status(503).json({ ok: false, code: 'STORE_UNAVAILABLE' });
    if (!order || order.status !== 'confirmed') return res.status(403).json({ ok: false, code: 'NOT_CONFIRMED' });
    if (order.user_uid && order.user_uid !== identity.user.id) return res.status(409).json({ ok: false, code: 'ALREADY_LINKED' });
    if (!await claimAnonymousLinePayOrder(orderId, identity.user.id)) return res.status(409).json({ ok: false, code: 'CLAIM_CONFLICT' });
    const receiptStatus = await notifyV2Payment(orderId);
    return res.status(200).json({ ok: true, data: { mbtiType: order.mbti_type, receiptStatus } });
  } catch {
    return res.status(503).json({ ok: false, code: 'STORE_UNAVAILABLE' });
  }
}
