import { createHash, randomUUID } from 'node:crypto';
import { getLinePayOrder } from './linePayOrderStore.js';
import { getUserAdminDb } from './supabase/user-admin.js';

export type ReceiptStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'review';
export type PaymentReceipt = {
  order_id: string;
  reference: string;
  user_uid: string;
  recipient: string;
  sender: string;
  mbti_type: string;
  amount: number;
  currency: string;
  paid_at: string;
  status: ReceiptStatus;
  first_attempt_at: string | null;
};

export function paymentReceiptReference(orderId: string): string {
  return `KW-${createHash('sha256').update(orderId).digest('hex').slice(0, 24).toUpperCase()}`;
}

export async function isV2PaymentReceiptReady(): Promise<boolean> {
  if (!process.env.RESEND_API_KEY?.trim() || !process.env.EMAIL_FROM?.trim()) return false;
  try {
    const db = getUserAdminDb();
    if (!db) return false;
    const { error } = await db.schema('public').from('v2_payment_receipts')
      .select('order_id', { head: true }).limit(0);
    return !error;
  } catch { return false; }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
}

export function buildPaymentReceiptEmail(receipt: PaymentReceipt) {
  const reportUrl = `https://kiwimu.com/read/${encodeURIComponent(receipt.mbti_type)}`;
  const libraryUrl = 'https://kiwimu.com/read/library';
  const amount = `${receipt.currency === 'TWD' ? 'NT$' : receipt.currency + ' '}${receipt.amount}`;
  const text = `你的 Kiwimu 深度報告已解鎖\n\n報告：${receipt.mbti_type}\n付款金額：${amount}\n付款紀錄：${receipt.reference}\n\n打開報告：${reportUrl}\n我的報告：${libraryUrl}\n\n請使用購買時的同一個帳號登入。換手機或電腦，也可以從「我的報告」繼續閱讀。\n若無法查看，請先確認登入的帳號；你可以在我的報告查看付款紀錄。`;
  const html = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"></head><body style="margin:0;background:#f5f3ec;color:#18281d;font-family:Arial,sans-serif;line-height:1.8"><main style="max-width:560px;margin:0 auto;padding:36px 24px"><p style="letter-spacing:2px;font-size:12px">KIWIMU · QUIET ATLAS</p><h1 style="font-size:26px;line-height:1.5">你的深度報告，已經準備好了。</h1><p>謝謝你留一段時間給自己。這份報告已保存到你的帳號，隨時可以回來讀。</p><p>報告：<strong>${escapeHtml(receipt.mbti_type)}</strong><br>付款金額：${escapeHtml(amount)}<br>付款紀錄：${escapeHtml(receipt.reference)}</p><p><a href="${reportUrl}" style="display:inline-block;background:#18281d;color:#fff9ee;padding:12px 22px;text-decoration:none;border-radius:8px">打開我的報告 ↗</a></p><p>請使用購買時的同一個帳號登入。換手機或電腦，也能從<a href="${libraryUrl}">我的報告</a>繼續閱讀。</p><p style="font-size:14px">若無法查看，請先確認登入的帳號；付款紀錄也保存在「我的報告」裡。</p></main></body></html>`;
  return { from: receipt.sender, to: [receipt.recipient], subject: `你的 Kiwimu ${receipt.mbti_type} 深度報告已解鎖`, text, html };
}

// Called only with server-verified order ids. Failures never change payment truth.
export async function sendV2PaymentReceipt(orderId: string): Promise<ReceiptStatus> {
  let receipt: PaymentReceipt | null = null;
  let leaseId = '';
  let db: any;
  const table = () => db.schema('public').from('v2_payment_receipts');
  try {
    db = getUserAdminDb();
    if (!db) return 'pending';
    const order = await getLinePayOrder(orderId);
    if (!order || order.status !== 'confirmed' || !order.user_uid) return 'pending';
    const { data, error } = await db.auth.admin.getUserById(order.user_uid);
    const user = data?.user;
    if (error || !user?.email || !user.email_confirmed_at || user.is_anonymous) return 'pending';
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const sender = process.env.EMAIL_FROM?.trim();
    // Never use Resend's test sender for customer purchases.
    if (!apiKey || !sender) return 'pending';

    const { error: insertError } = await table().upsert({
      order_id: orderId,
      reference: paymentReceiptReference(orderId),
      user_uid: user.id,
      recipient: user.email,
      sender,
      mbti_type: order.mbti_type,
      amount: order.amount,
      currency: order.currency,
      paid_at: order.confirmed_at || order.created_at,
    }, { onConflict: 'order_id', ignoreDuplicates: true });
    if (insertError) return 'pending';

    const { data: stored, error: readError } = await table().select('*').eq('order_id', orderId).maybeSingle();
    if (readError || !stored) return 'pending';
    receipt = stored as PaymentReceipt;
    if (receipt.status === 'sent' || receipt.status === 'review') return receipt.status;

    // Resend keeps idempotency keys for 24h. An unacknowledged attempt outside
    // that window needs review, rather than risking another email.
    if (receipt.first_attempt_at && Date.now() - Date.parse(receipt.first_attempt_at) > 23 * 60 * 60 * 1000) {
      await table().update({ status: 'review', error_code: 'DELIVERY_REVIEW_REQUIRED' })
        .eq('order_id', orderId).neq('status', 'sent');
      return 'review';
    }

    const now = new Date().toISOString();
    const retryAfter = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    leaseId = randomUUID();
    const { data: claimed, error: claimError } = await table().update({
      status: 'sending', lease_id: leaseId, claimed_at: now,
      first_attempt_at: receipt.first_attempt_at || now, updated_at: now, error_code: null,
    }).eq('order_id', orderId)
      .or(`status.eq.pending,and(status.in.(failed,sending),claimed_at.lt.${retryAfter})`)
      .select('*').maybeSingle();
    if (claimError || !claimed) return receipt.status;
    receipt = claimed as PaymentReceipt;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json',
        'Idempotency-Key': `v2-payment-receipt/${receipt.reference}`,
      },
      body: JSON.stringify(buildPaymentReceiptEmail(receipt)),
      signal: AbortSignal.timeout(8_000),
    });
    const result = await response.json().catch(() => null);
    const status: ReceiptStatus = response.ok && typeof result?.id === 'string' ? 'sent' : 'failed';
    const { error: persistError } = await table().update({
      status, sent_at: status === 'sent' ? new Date().toISOString() : null,
      provider_message_id: status === 'sent' ? result.id : null,
      error_code: status === 'failed' ? `RESEND_HTTP_${response.status}` : null,
      updated_at: new Date().toISOString(),
    }).eq('order_id', orderId).eq('lease_id', leaseId);
    // If send succeeded but DB acknowledgement failed, leave the lease and
    // retry with exactly the same recipient/payload/idempotency key later.
    return persistError ? 'sending' : status;
  } catch {
    if (db && receipt && leaseId) {
      try {
        await table().update({ status: 'failed', error_code: 'SEND_UNCERTAIN' })
          .eq('order_id', orderId).eq('lease_id', leaseId).neq('status', 'sent');
      } catch { /* A failed delivery log must not change a successful payment. */ }
    }
    console.error('[v2 receipt] delivery attempt failed');
    return 'failed';
  }
}

export async function getV2ReceiptStatuses(userId: string): Promise<Map<string, ReceiptStatus>> {
  const db = getUserAdminDb();
  if (!db) return new Map();
  const { data, error } = await db.schema('public').from('v2_payment_receipts')
    .select('order_id,status').eq('user_uid', userId);
  return error ? new Map() : new Map((data || []).map((row: { order_id: string; status: ReceiptStatus }) => [row.order_id, row.status]));
}
