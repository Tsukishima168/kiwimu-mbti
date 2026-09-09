import { describe, expect, it } from 'vitest';
import type { VercelRequest } from '@vercel/node';
import { getBearerToken, requestOriginMatchesHost } from './requestSecurity';

function request(headers: Record<string, string | string[]>): VercelRequest {
  return { headers } as unknown as VercelRequest;
}

describe('requestOriginMatchesHost', () => {
  it('accepts a same-origin browser request', () => {
    expect(requestOriginMatchesHost(request({
      origin: 'https://kiwimu.com',
      'sec-fetch-site': 'same-origin',
      host: 'kiwimu.com',
    }))).toBe(true);
  });

  it('rejects a request with no Origin header', () => {
    expect(requestOriginMatchesHost(request({ host: 'kiwimu.com' }))).toBe(false);
  });

  it('rejects an Origin belonging to another host', () => {
    expect(requestOriginMatchesHost(request({
      origin: 'https://evil.example',
      'sec-fetch-site': 'cross-site',
      host: 'kiwimu.com',
    }))).toBe(false);
  });

  it('rejects a cross-site fetch even when the Origin is spoofed to match', () => {
    expect(requestOriginMatchesHost(request({
      origin: 'https://kiwimu.com',
      'sec-fetch-site': 'cross-site',
      host: 'kiwimu.com',
    }))).toBe(false);
  });

  // Sec-Fetch-Site is absent both on non-browser clients and on browsers that
  // predate fetch metadata, so this check cannot tell them apart and accepts
  // both. Tightening it would lock out the older in-app browsers this product
  // depends on while stopping nobody: any client can send both headers. Treat
  // this as a CSRF control, never as proof of who is calling.
  // api/economy/mbti-completed.ts:36 uses it as its only gate, so the real
  // limit on abuse is the rate limit named in docs/ECONOMY_V2_ADAPTER.md.
  it('cannot distinguish a non-browser caller that omits Sec-Fetch-Site', () => {
    expect(requestOriginMatchesHost(request({
      origin: 'https://kiwimu.com',
      host: 'kiwimu.com',
    }))).toBe(true);
  });

  it('honours the forwarded host in front of a proxy', () => {
    expect(requestOriginMatchesHost(request({
      origin: 'https://kiwimu.com',
      'sec-fetch-site': 'same-origin',
      'x-forwarded-host': 'kiwimu.com, internal.vercel.app',
      host: 'internal.vercel.app',
    }))).toBe(true);
  });
});

describe('getBearerToken', () => {
  it('extracts a well-formed bearer token', () => {
    expect(getBearerToken(request({ authorization: 'Bearer abc.def-ghi~jkl_mno' })))
      .toBe('abc.def-ghi~jkl_mno');
  });

  it('returns null for a missing or malformed header', () => {
    expect(getBearerToken(request({}))).toBeNull();
    expect(getBearerToken(request({ authorization: 'Basic abc' }))).toBeNull();
    expect(getBearerToken(request({ authorization: 'Bearer' }))).toBeNull();
    expect(getBearerToken(request({ authorization: ['Bearer a', 'Bearer b'] }))).toBeNull();
  });
});
