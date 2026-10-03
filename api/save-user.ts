import type { VercelRequest, VercelResponse } from '@vercel/node';

// The Firebase/Sheet login logger has no current caller. Supabase SSO owns
// account identity; keep the old URL closed without reading Google credentials.
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  return res.status(410).json({ ok: false, code: 'ENDPOINT_RETIRED' });
}
