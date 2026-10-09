import { createHash, createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import type { VercelRequest } from '@vercel/node';
import type { QuizNotificationInput } from '../shared/quizNotification.js';
import { calculateMbtiResult, getEconomyQuestionBank } from './economy/mbtiCompletion.js';
import { getEconomyAdminClient } from './economy/supabaseAdmin.js';

export function getQuizNotificationConfig() {
  const token = (process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN)?.trim();
  const channelId = process.env.DISCORD_CHANNEL_ID?.trim() || process.env.DISCORD_PAYMENT_CHANNEL_ID?.trim() || '1466020032310939823';
  const detail = process.env.DISCORD_DETAIL_CHANNEL_ID?.trim() || process.env.DISCORD_EVENTS_CHANNEL_ID?.trim() || channelId;
  return token && [channelId, detail].every(id => /^\d{17,20}$/.test(id))
    ? { token, channels: [...new Set([channelId, detail])] } : null;
}

export function quizClientHash(req: VercelRequest, secret: string): string | null {
  const value = req.headers['x-vercel-forwarded-for'];
  if (typeof value !== 'string' || !isIP(value.trim())) return null;
  return createHmac('sha256', secret).update(`quiz-notification-ip/v1:${value.trim()}`).digest('hex');
}

export function quizResult(input: QuizNotificationInput): string {
  if (input.funnel === 'v1_5') {
    const pairs = [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P'], ['A', 'T']];
    return `${input.answerIndices.slice(0, 4).map((answer, index) => pairs[index][answer]).join('')}-${pairs[4][input.answerIndices[4]]}`;
  }
  const result = calculateMbtiResult(getEconomyQuestionBank(input.funnel === 'v2' ? 'v2-tw-40' : 'v1-40'), input.answerIndices);
  return `${result.resultType}-${result.variant}`;
}

export function buildQuizCompletionMessage(input: QuizNotificationInput, loggedIn: boolean, channelId: string) {
  const label = { v1: 'V1 完整測驗', v1_5: 'V1.5 五題快測', v2: 'V2 生活情境測驗' }[input.funnel];
  const locale = { zh: '繁體中文', en: 'English', ja: '日本語', ko: '한국어' }[input.locale];
  return {
    content: 'Kiwimu｜測驗完成回報',
    embeds: [{ title: `${label} · ${quizResult(input)}`, color: 0x4b7355,
      fields: [
        { name: '測驗版本', value: label, inline: true },
        { name: '結果', value: quizResult(input), inline: true },
        { name: '語言', value: locale, inline: true },
        { name: '身份', value: loggedIn ? '已登入會員' : '未登入訪客', inline: true },
      ],
      footer: { text: '依提交答案計算；此為完成回報，不代表付款或新增會員。' },
    }],
    allowed_mentions: { parse: [] as string[] },
    nonce: createHash('sha256').update(`quiz/${input.completionId}/${channelId}`).digest('hex').slice(0, 24),
    enforce_nonce: true,
  };
}

export type QuizDeliveryResult = { status: 'sent' | 'review' | 'duplicate' | 'conflict' | 'limited' | 'retry' | 'unavailable'; retryAfter?: number };

export async function deliverQuizCompletion(input: QuizNotificationInput, loggedIn: boolean, clientHash: string,
  config: NonNullable<ReturnType<typeof getQuizNotificationConfig>>,
): Promise<QuizDeliveryResult> {
  const db = getEconomyAdminClient();
  if (!db) return { status: 'unavailable' };
  try {
    const evidenceHash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
    const { data, error } = await db.schema('public').rpc('claim_quiz_completion_notification', {
      p_completion_id: input.completionId, p_evidence_hash: evidenceHash, p_client_hash: clientHash,
    });
    if (error || !data) return { status: 'unavailable' };
    if (data.status === 'duplicate' || data.status === 'conflict' || data.status === 'limited') return { status: data.status };
    if (data.status === 'retry' && Number.isFinite(data.retryAfter)) return { status: 'retry', retryAfter: Math.max(1, Math.min(data.retryAfter, 3600)) };
    if (data.status !== 'claimed' || !Array.isArray(data.deliveredChannels)
      || !data.deliveredChannels.every((id: unknown) => typeof id === 'string' && /^\d{17,20}$/.test(id))) return { status: 'unavailable' };

    const delivered = new Set<string>(data.deliveredChannels);
    const channels = config.channels.filter(id => !delivered.has(id));
    // Only definite provider 429 rejection can be retried. Successful channels are never sent again.
    const outcomes = await Promise.allSettled(channels.map(async channelId => {
      const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST', headers: { Authorization: `Bot ${config.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(buildQuizCompletionMessage(input, loggedIn, channelId)), signal: AbortSignal.timeout(8_000),
      });
      const body = await response.json().catch(() => null);
      if (response.ok && /^\d{17,20}$/.test(body?.id || '') && body?.channel_id === channelId) {
        delivered.add(channelId); return { status: 'sent' as const };
      }
      if (response.status === 429) {
        const seconds = Number(body?.retry_after ?? response.headers?.get('Retry-After'));
        return { status: 'retry' as const, retryAfter: Number.isFinite(seconds) && seconds > 0 ? Math.min(Math.ceil(seconds), 3600) : 60 };
      }
      return { status: 'review' as const };
    }));
    const uncertain = outcomes.some(item => item.status === 'rejected' || item.value.status === 'review');
    const retryAfter = Math.max(0, ...outcomes.map(item => item.status === 'fulfilled' && item.value.status === 'retry' ? item.value.retryAfter : 0));
    const status = uncertain ? 'review' : retryAfter > 0 ? 'retry' : 'sent';
    const { data: updated, error: updateError } = await db.schema('public').from('quiz_completion_notifications')
      .update({ status, delivered_channels: [...delivered], retry_at: status === 'retry' ? new Date(Date.now() + retryAfter * 1_000).toISOString() : null,
        updated_at: new Date().toISOString() }).eq('completion_id', input.completionId)
      .eq('status', 'sending').select('completion_id').maybeSingle();
    if (updateError || !updated) return { status: 'review' };
    if (status === 'review') console.warn('[quiz notification] delivery requires review');
    return { status, ...(status === 'retry' ? { retryAfter } : {}) };
  } catch {
    // Retry the same UUID: a committed reservation blocks a second provider delivery.
    return { status: 'unavailable' };
  }
}
