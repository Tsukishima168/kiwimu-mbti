import { createHash, timingSafeEqual } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readNotificationHealth } from '../../notificationHealth.js';

const digest = (value: string) => createHash('sha256').update(value).digest();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
  }
  const expected = process.env.NOTIFICATION_HEALTH_TOKEN;
  if (!expected || expected.length < 32 || expected.length > 256 || /\s/.test(expected)) {
    return res.status(503).json({ ok: false, code: 'MONITOR_NOT_CONFIGURED' });
  }
  const authorization = req.headers.authorization;
  const candidate = typeof authorization === 'string' && authorization.length <= 263
    ? /^Bearer ([^\s,]+)$/.exec(authorization)?.[1] : undefined;
  if (!candidate || !timingSafeEqual(digest(candidate), digest(expected))) {
    return res.status(401).json({ ok: false, code: 'UNAUTHORIZED' });
  }
  try {
    const data = await readNotificationHealth();
    const available = Object.values(data.sources).some(source => source.availability === 'available');
    return res.status(available ? 200 : 503).json({ ok: available, data });
  } catch {
    return res.status(503).json({ ok: false, code: 'SUMMARY_UNAVAILABLE' });
  }
}
