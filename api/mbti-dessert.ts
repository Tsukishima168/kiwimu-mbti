import type { VercelRequest, VercelResponse } from '@vercel/node';

const SHOP_MENU_MBTI_API_URL =
  process.env.SHOP_MENU_MBTI_API_URL ||
  process.env.SHOP_MENU_RESOLVE_URL ||
  'https://shop.kiwimu.com/api/menu/mbti';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, data: null, message: 'Method not allowed' });
  }

  const mbtiType = String(req.query.mbti || '').trim().toUpperCase();
  if (!mbtiType) {
    return res.status(400).json({ success: false, data: null, message: 'Missing mbti query parameter' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const upstreamBase = SHOP_MENU_MBTI_API_URL.endsWith('/')
      ? SHOP_MENU_MBTI_API_URL.slice(0, -1)
      : SHOP_MENU_MBTI_API_URL;
    const upstreamUrl = `${upstreamBase}/${encodeURIComponent(mbtiType)}`;

    const upstream = await fetch(upstreamUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    const payload = await upstream.json().catch(() => null);

    if (!upstream.ok) {
      return res.status(502).json({
        success: false,
        data: null,
        message: `Upstream MBTI dessert API failed with HTTP ${upstream.status}`,
        upstream: payload,
      });
    }

    if (!payload?.success || !payload.data) {
      return res.status(502).json({
        success: false,
        data: null,
        message: 'Upstream MBTI dessert API returned an invalid payload',
      });
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(payload);
  } catch (error) {
    console.error('[mbti-dessert] Failed to resolve unified dessert contract:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to resolve unified dessert contract',
    });
  } finally {
    clearTimeout(timeout);
  }
}
