import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jsonBodySize, requestOriginMatchesHost } from '../../economy/requestSecurity.js';
import { getVerifiedV2User } from '../../v2Account.js';
import { readV2OrderIdCookie } from '../../linePay.js';
import { getLinePayOrder, listConfirmedLinePayOrdersForUser } from '../../linePayOrderStore.js';
import { getV2ReceiptStatuses, paymentReceiptReference } from '../../v2PaymentReceipt.js';
import { listV2PromoUnlocksForUser } from '../../v2PromoStore.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
  if (!requestOriginMatchesHost(req)) return res.status(403).json({ ok: false, code: 'FORBIDDEN_ORIGIN' });
  if (jsonBodySize(req.body) > 1_024) return res.status(413).json({ ok: false, code: 'BODY_TOO_LARGE' });
  const identity = await getVerifiedV2User(req);
  if (!identity.user) return res.status(identity.code === 'AUTH_UNAVAILABLE' ? 503 : 401).json({ ok: false, code: identity.code });
  try {
    const orders = await listConfirmedLinePayOrdersForUser(identity.user.id);
    if (!orders) return res.status(503).json({ ok: false, code: 'STORE_UNAVAILABLE' });
    const statuses = await getV2ReceiptStatuses(identity.user.id);
    const reports = orders.map(order => ({
      mbtiType: order.mbti_type,
      amount: order.amount,
      currency: order.currency,
      purchasedAt: order.confirmed_at,
      reference: paymentReceiptReference(order.order_id),
      receiptStatus: statuses.get(order.order_id) || 'pending',
    }));
    const cookieOrderId = readV2OrderIdCookie(req.headers.cookie);
    const cookieOrder = cookieOrderId ? await getLinePayOrder(cookieOrderId) : null;
    const claimableReport = cookieOrder?.status === 'confirmed' && !cookieOrder.user_uid
      ? { mbtiType: cookieOrder.mbti_type, amount: cookieOrder.amount, currency: cookieOrder.currency }
      : null;
    // Free promo unlocks are listed separately: no amount, payment reference or receipt.
    // They are additive, so a paid-only library keeps its exact response shape, and a
    // promo lookup failure never breaks the paid library.
    const promoUnlocks = await listV2PromoUnlocksForUser(identity.user.id);
    const paidTypes = new Set(orders.map(order => order.mbti_type));
    const grants = (promoUnlocks || [])
      .filter(unlock => !paidTypes.has(unlock.mbti_type))
      .map(unlock => ({ mbtiType: unlock.mbti_type, claimedAt: unlock.created_at }));
    return res.status(200).json({
      ok: true,
      data: {
        reports,
        claimableReport,
        ...(grants.length ? { grants } : {}),
        ...(promoUnlocks === undefined ? { grantsUnavailable: true } : {}),
      },
    });
  } catch {
    return res.status(503).json({ ok: false, code: 'STORE_UNAVAILABLE' });
  }
}
