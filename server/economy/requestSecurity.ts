import type { VercelRequest } from '@vercel/node';

export function requestOriginMatchesHost(request: VercelRequest): boolean {
  const origin = request.headers.origin;
  if (!origin || Array.isArray(origin)) return false;

  const fetchSite = request.headers['sec-fetch-site'];
  if (fetchSite && fetchSite !== 'same-origin') return false;

  const forwardedHost = request.headers['x-forwarded-host'];
  const host = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || request.headers.host)
    ?.split(',')[0]
    .trim()
    .toLowerCase();
  if (!host) return false;

  try {
    return new URL(origin).host.toLowerCase() === host;
  } catch {
    return false;
  }
}

export function getBearerToken(request: VercelRequest): string | null {
  const value = request.headers.authorization;
  if (!value || Array.isArray(value)) return null;
  const match = value.match(/^Bearer ([A-Za-z0-9._~-]+)$/);
  return match?.[1] ?? null;
}

export function jsonBodySize(value: unknown): number {
  try {
    return Buffer.byteLength(JSON.stringify(value), 'utf8');
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}
