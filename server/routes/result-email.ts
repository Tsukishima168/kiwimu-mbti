import { createHash } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jsonBodySize, requestOriginMatchesHost } from '../economy/requestSecurity.js';
import { getVerifiedV2User } from '../v2Account.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
  if (!requestOriginMatchesHost(req)) return res.status(403).json({ ok: false, code: 'FORBIDDEN_ORIGIN' });
  if (jsonBodySize(req.body) > 1_024) return res.status(413).json({ ok: false, code: 'BODY_TOO_LARGE' });
  const identity = await getVerifiedV2User(req);
  if (!identity.user) return res.status(identity.code === 'AUTH_UNAVAILABLE' ? 503 : 401).json({ ok: false, code: identity.code });
  if (!identity.user.email || !identity.user.email_confirmed_at) return res.status(422).json({ ok: false, code: 'VERIFIED_EMAIL_REQUIRED' });
  const type = typeof req.body?.mbtiType === 'string' ? req.body.mbtiType.trim().toUpperCase() : '';
  const variant = req.body?.variant;
  if (!/^[EI][NS][TF][JP]$/.test(type) || !['A', 'T'].includes(variant)) return res.status(400).json({ ok: false, code: 'INVALID_RESULT' });
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!key || !from) return res.status(503).json({ ok: false, code: 'EMAIL_UNAVAILABLE' });
  const fullCode = `${type}-${variant}`;
  // No client-provided recipient, subject, HTML, or URLs reach the mail provider.
  const text = `你的 Kiwimu 測驗已完成。\n\n人格類型：${fullCode}\n\n回到 Kiwimu：https://kiwimu.com/\n已購 V2 報告：https://kiwimu.com/read/library\n\n這是一份自我探索的閱讀提示。已購報告請用購買時的同一個帳號登入查看。`;
  const day = new Date().toISOString().slice(0, 10);
  const dedupe = createHash('sha256').update(`quiz-result/${identity.user.id}/${fullCode}/${day}`).digest('hex');
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `quiz-result/${dedupe}` },
      body: JSON.stringify({ from, to: [identity.user.email], subject: `你的 Kiwimu 測驗結果：${fullCode}`, text }),
      signal: AbortSignal.timeout(8_000),
    });
    const result = await response.json().catch(() => ({})) as { id?: unknown };
    if (!response.ok || typeof result.id !== 'string') return res.status(502).json({ ok: false, code: 'EMAIL_SEND_FAILED' });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ ok: false, code: 'EMAIL_SEND_FAILED' });
  }
}
