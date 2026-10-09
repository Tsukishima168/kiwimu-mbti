import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseQuizNotification } from '../shared/quizNotification.js';
import { jsonBodySize, requestOriginMatchesHost } from '../server/economy/requestSecurity.js';
import { getVerifiedV2User } from '../server/v2Account.js';
import { deliverQuizCompletion, getQuizNotificationConfig, quizClientHash } from '../server/quizCompletionNotification.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
  if (!requestOriginMatchesHost(req)) return res.status(403).json({ ok: false, code: 'FORBIDDEN_ORIGIN' });
  if (jsonBodySize(req.body) > 4_096) return res.status(413).json({ ok: false, code: 'BODY_TOO_LARGE' });
  const input = parseQuizNotification(req.body);
  if (!input) return res.status(400).json({ ok: false, code: 'INVALID_COMPLETION' });
  // Previews/local QA never create production notifications, even with production credentials.
  if (process.env.VERCEL_ENV !== 'production') return res.status(202).json({ ok: true, status: 'disabled' });
  if (!['https://kiwimu.com', 'https://www.kiwimu.com'].includes(String(req.headers.origin))
    || !['kiwimu.com', 'www.kiwimu.com'].includes(String(req.headers.host))) {
    return res.status(403).json({ ok: false, code: 'FORBIDDEN_ORIGIN' });
  }
  const config = getQuizNotificationConfig();
  const clientHash = config && quizClientHash(req, config.token);
  if (!config || !clientHash) return res.status(503).json({ ok: false, code: 'NOTIFICATION_UNAVAILABLE' });
  let loggedIn = false;
  if (req.headers.authorization) {
    const identity = await getVerifiedV2User(req);
    if (!identity.user) return res.status(identity.code === 'AUTH_UNAVAILABLE' ? 503 : 401).json({ ok: false, code: identity.code });
    loggedIn = true;
  }
  const { status, retryAfter } = await deliverQuizCompletion(input, loggedIn, clientHash, config);
  if (status === 'unavailable') return res.status(503).json({ ok: false, code: 'NOTIFICATION_UNAVAILABLE' });
  if (status === 'limited' || status === 'retry') {
    res.setHeader('Retry-After', String(retryAfter || 3600));
    return res.status(429).json({ ok: false, code: 'RATE_LIMITED' });
  }
  if (status === 'conflict') return res.status(409).json({ ok: false, code: 'COMPLETION_CONFLICT' });
  return res.status(status === 'review' ? 202 : 200).json({ ok: true, status });
}
