import type { VercelRequest, VercelResponse } from '@vercel/node';

// No current caller owns this legacy arbitrary guild/member role writer.
// Account linking remains available through the verified Supabase flow.
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  return res.status(410).json({ ok: false, code: 'ENDPOINT_RETIRED' });
}
