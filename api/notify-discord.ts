import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jsonBodySize, requestOriginMatchesHost } from '../server/economy/requestSecurity.js';
import { getVerifiedV2User } from '../server/v2Account.js';

const DISCORD_API_URL = 'https://discord.com/api/v10';
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1466020032310939823';
const DETAIL_CHANNEL_ID = process.env.DISCORD_DETAIL_CHANNEL_ID || process.env.DISCORD_EVENTS_CHANNEL_ID || CHANNEL_ID;
const LOCALES = {
  zh: { emoji: '🎉', color: 0xFF6B9D, header: '新成員誕生！', footer: 'KIWIMU MBTI Lab', country: '🇹🇼 台灣' },
  ja: { emoji: '🌈', color: 0xFF69B4, header: '新しい仲間が誕生しました！', footer: 'KIWIMU MBTI Lab 日本版', country: '🇯🇵 日本' },
  ko: { emoji: '✨', color: 0xFF1493, header: '새로운 멤버가 탄생했습니다!', footer: 'KIWIMU MBTI Lab 한국판', country: '🇰🇷 韓國' },
  en: { emoji: '🚀', color: 0x0099FF, header: 'New Member Joined!', footer: 'KIWIMU MBTI Lab', country: '🌍 Global' },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
  if (!requestOriginMatchesHost(req)) return res.status(403).json({ ok: false, code: 'FORBIDDEN_ORIGIN' });
  if (jsonBodySize(req.body) > 4_096) return res.status(413).json({ ok: false, code: 'BODY_TOO_LARGE' });
  const identity = await getVerifiedV2User(req);
  if (!identity.user) return res.status(identity.code === 'AUTH_UNAVAILABLE' ? 503 : 401).json({ ok: false, code: identity.code });

  const resultType = typeof req.body?.resultType === 'string' ? req.body.resultType : '';
  if (!/^[EI][NS][TF][JP]-[AT]$/.test(resultType)) return res.status(400).json({ ok: false, code: 'INVALID_RESULT' });
  const locale = typeof req.body?.locale === 'string' && Object.hasOwn(LOCALES, req.body.locale) ? req.body.locale as keyof typeof LOCALES : 'zh';
  const localeConfig = LOCALES[locale];
  const funnel = req.body?.metadata?.funnel === 'v1_5' ? 'v1_5' : 'v1';
  const funnelLabel = funnel === 'v1_5' ? 'V1.5 快測' : 'V1 完整版';
  const botToken = (process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN)?.trim();
  if (!botToken) return res.status(503).json({ ok: false, code: 'DISCORD_UNAVAILABLE' });

  // This endpoint reports a client-declared result, never a verified purchase.
  // No arbitrary name, text, account ID, path or session ID reaches Discord.
  const timestamp = new Date().toISOString();
  const summaryPayload = {
    allowed_mentions: { parse: [] },
    embeds: [{
      title: `${localeConfig.emoji} ${localeConfig.header}`,
      description: `**${resultType}**\n\n來自 **${funnelLabel}** 的新完成回報。`,
      color: localeConfig.color,
      fields: [
        { name: '🌍 Market / 市場', value: localeConfig.country, inline: true },
        { name: '🎯 Type / 類型', value: resultType, inline: true },
        { name: '🪜 Funnel / 漏斗', value: funnelLabel, inline: true },
      ],
      footer: { text: localeConfig.footer },
      timestamp,
    }],
  };
  const detailPayload = {
    allowed_mentions: { parse: [] },
    embeds: [{
      title: `🧾 Completion Detail · ${resultType}`,
      color: 0x2F3136,
      fields: [
        { name: 'funnel', value: funnel, inline: true },
        { name: 'stage', value: 'result', inline: true },
        { name: 'logged_in', value: 'true', inline: true },
      ],
      timestamp,
    }],
  };

  const send = async (channelId: string, payload: unknown): Promise<string> => {
    const response = await fetch(`${DISCORD_API_URL}/channels/${channelId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bot ${botToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8_000),
    });
    const body = await response.json().catch(() => ({})) as { id?: unknown };
    if (!response.ok || typeof body.id !== 'string') throw new Error('DISCORD_SEND_FAILED');
    return body.id;
  };

  try {
    const [messageId, detailMessageId] = await Promise.all([send(CHANNEL_ID, summaryPayload), send(DETAIL_CHANNEL_ID, detailPayload)]);
    return res.status(200).json({ ok: true, status: 'sent', messageId, detailMessageId });
  } catch {
    return res.status(502).json({ ok: false, code: 'DISCORD_SEND_FAILED' });
  }
}
