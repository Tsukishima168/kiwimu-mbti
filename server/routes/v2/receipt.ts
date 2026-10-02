import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jsonBodySize, requestOriginMatchesHost } from '../../economy/requestSecurity.js';
import { getVerifiedV2User } from '../../v2Account.js';
import { listConfirmedLinePayOrdersForUser } from '../../linePayOrderStore.js';
import { paymentReceiptReference, sendV2PaymentReceipt } from '../../v2PaymentReceipt.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
  if (!requestOriginMatchesHost(req)) return res.status(403).json({ ok: false, code: 'FORBIDDEN_ORIGIN' });
  if (jsonBodySize(req.body) > 1_024) return res.status(413).json({ ok: false, code: 'BODY_TOO_LARGE' });
  const identity = await getVerifiedV2User(req);
  if (!identity.user) return res.status(identity.code === 'AUTH_UNAVAILABLE' ? 503 : 401).json({ ok: false, code: identity.code });
  const reference = typeof req.body?.reference === 'string' ? req.body.reference : '';
  if (!/^KW-[A-F0-9]{24}$/.test(reference)) return res.status(400).json({ ok: false, code: 'INVALID_REFERENCE' });
  try {
    const orders = await listConfirmedLinePayOrdersForUser(identity.user.id);
    if (!orders) return res.status(503).json({ ok: false, code: 'STORE_UNAVAILABLE' });
    // The reference is a display identifier, never a bearer proof.
    const order = orders.find(item => paymentReceiptReference(item.order_id) === reference);
    if (!order) return res.status(404).json({ ok: false, code: 'PURCHASE_NOT_FOUND' });
    const receiptStatus = await sendV2PaymentReceipt(order.order_id);
    return res.status(200).json({ ok: true, data: { receiptStatus } });
  } catch {
    return res.status(503).json({ ok: false, code: 'STORE_UNAVAILABLE' });
  }
}
