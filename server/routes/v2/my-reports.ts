import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jsonBodySize, requestOriginMatchesHost } from '../../economy/requestSecurity.js';
import { getVerifiedV2User } from '../../v2Account.js';
import { readV2OrderIdCookie } from '../../linePay.js';
import { getLinePayOrder, listConfirmedLinePayOrdersForUser } from '../../linePayOrderStore.js';
import { getV2ReceiptStatuses, paymentReceiptReference } from '../../v2PaymentReceipt.js';

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
    return res.status(200).json({ ok: true, data: { reports, claimableReport } });
  } catch {
    return res.status(503).json({ ok: false, code: 'STORE_UNAVAILABLE' });
  }
}
