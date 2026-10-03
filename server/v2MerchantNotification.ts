import { createHash, randomUUID } from 'node:crypto';
import { V2_LINE_PAY_ORDER_PATTERN } from './linePay.js';
import { getLinePayOrder, type LinePayOrderRecord } from './linePayOrderStore.js';
import { getUserAdminDb } from './supabase/user-admin.js';
import type { ReceiptStatus } from './v2PaymentReceipt.js';

type MerchantNotification = {
  order_id: string;
  channel_id: string;
  payload: ReturnType<typeof buildMerchantPaymentMessage>;
  status: ReceiptStatus;
  claimed_at: string | null;
};

function configuration() {
  const channelId = process.env.DISCORD_PAYMENT_CHANNEL_ID?.trim();
  const token = (process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN)?.trim();
  return channelId && /^\d{17,20}$/.test(channelId) && token ? { channelId, token } : null;
}

export async function isV2MerchantNotificationReady(): Promise<boolean> {
  if (!configuration()) return false;
  try {
    const db = getUserAdminDb();
    if (!db) return false;
    const { error } = await db.schema('public').from('v2_merchant_notifications')
      .select('order_id', { head: true }).limit(0);
    return !error;
  } catch { return false; }
}

export function buildMerchantPaymentMessage(order: Pick<LinePayOrderRecord, 'order_id' | 'mbti_type' | 'amount' | 'currency' | 'confirmed_at' | 'created_at'>) {
  const digest = createHash('sha256').update(order.order_id).digest('hex');
  return {
    content: 'Kiwimu 深度報告｜付款已確認',
    embeds: [{
      title: `${order.mbti_type} 深度報告`,
      color: 0x4b7355,
      fields: [
        { name: '付款金額', value: `NT$${order.amount}`, inline: true },
        { name: '付款參考碼', value: `KW-${digest.slice(0, 24).toUpperCase()}` },
        { name: '付款時間（台灣）', value: new Date(order.confirmed_at || order.created_at).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false }) },
      ],
      footer: { text: '已確認付款；客戶報告與通知信由各自流程處理。' },
    }],
    allowed_mentions: { parse: [] as string[] },
    nonce: digest.slice(0, 24),
    enforce_nonce: true,
  };
}

// Server-confirmed orders only. An uncertain send requires review: Discord's
// nonce window is short, so a later automatic retry could create a duplicate.
export async function sendV2MerchantNotification(orderId: string): Promise<ReceiptStatus> {
  const config = configuration();
  if (!config || !V2_LINE_PAY_ORDER_PATTERN.test(orderId)) return 'pending';
  let db: ReturnType<typeof getUserAdminDb> = null;
  let leaseId = '';
  try {
    db = getUserAdminDb();
    if (!db) return 'pending';
    const table = () => db!.schema('public').from('v2_merchant_notifications');
    const order = await getLinePayOrder(orderId);
    if (!order || order.status !== 'confirmed' || order.currency !== 'TWD'
      || !Number.isSafeInteger(order.amount) || order.amount <= 0
      || !/^[EI][NS][TF][JP]-[AT]$/.test(order.mbti_type)) return 'pending';

    const { error: insertError } = await table().upsert({
      order_id: orderId, channel_id: config.channelId, payload: buildMerchantPaymentMessage(order),
    }, { onConflict: 'order_id', ignoreDuplicates: true });
    if (insertError) return 'pending';
    const { data, error: readError } = await table().select('*').eq('order_id', orderId).maybeSingle();
    if (readError || !data) return 'pending';
    const stored = data as MerchantNotification;
    if (stored.status === 'sent' || stored.status === 'review') return stored.status;
    if (stored.status === 'sending') {
      if (stored.claimed_at && Date.now() - Date.parse(stored.claimed_at) < 60_000) return 'sending';
      await table().update({ status: 'review', error_code: 'DELIVERY_UNCERTAIN', updated_at: new Date().toISOString() })
        .eq('order_id', orderId).eq('status', 'sending');
      return 'review';
    }
    // A definite rejection can be retried, with a five minute backoff.
    if (stored.status === 'failed' && stored.claimed_at
      && Date.now() - Date.parse(stored.claimed_at) < 5 * 60_000) return 'failed';

    leaseId = randomUUID();
    const now = new Date().toISOString();
    const retryAfter = new Date(Date.now() - 5 * 60_000).toISOString();
    const { data: claimed, error: claimError } = await table().update({
      status: 'sending', lease_id: leaseId, claimed_at: now, updated_at: now, error_code: null,
    }).eq('order_id', orderId)
      .or(`status.eq.pending,and(status.eq.failed,claimed_at.lt.${retryAfter})`)
      .select('*').maybeSingle();
    if (claimError || !claimed) return stored.status;
    const snapshot = claimed as MerchantNotification;
    const response = await fetch(`https://discord.com/api/v10/channels/${snapshot.channel_id}/messages`, {
      method: 'POST', headers: { Authorization: `Bot ${config.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshot.payload), signal: AbortSignal.timeout(8_000),
    });
    const result = await response.json().catch(() => null);
    const accepted = response.ok && /^\d{17,20}$/.test(result?.id || '') && result?.channel_id === snapshot.channel_id;
    const rejected = !response.ok && response.status >= 400 && response.status < 500;
    const status: ReceiptStatus = accepted ? 'sent' : rejected ? 'failed' : 'review';
    const { data: persisted, error: persistError } = await table().update({
      status, sent_at: accepted ? new Date().toISOString() : null,
      provider_message_id: accepted ? result.id : null,
      error_code: accepted ? null : `DISCORD_HTTP_${response.status}`,
      updated_at: new Date().toISOString(),
    }).eq('order_id', orderId).eq('lease_id', leaseId).eq('status', 'sending').select('status').maybeSingle();
    return persistError || !persisted ? 'review' : status;
  } catch {
    if (db && leaseId) {
      try {
        await db.schema('public').from('v2_merchant_notifications')
          .update({ status: 'review', error_code: 'DELIVERY_UNCERTAIN', updated_at: new Date().toISOString() })
          .eq('order_id', orderId).eq('lease_id', leaseId).neq('status', 'sent');
      } catch { /* Keep payment success separate from notification failure. */ }
    }
    console.error('[v2 merchant notification] delivery needs review');
    return 'review';
  }
}
