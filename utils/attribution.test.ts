import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class FakeCookieJar {
  private store = new Map<string, string>();

  get cookie(): string {
    return Array.from(this.store.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
  }

  set cookie(assignment: string) {
    // Only care about name=value for this fake jar; ignore domain/path/etc attrs.
    const [pair] = assignment.split(';');
    const eq = pair.indexOf('=');
    if (eq === -1) return;
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    this.store.set(name, value);
  }
}

function stubEnv(hostname: string, search: string) {
  const jar = new FakeCookieJar();
  vi.stubGlobal('document', jar as unknown as Document);
  vi.stubGlobal('window', {
    location: { hostname, search },
  });
  return jar;
}

describe('attribution (kw_attr writer)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('does not write on a non-kiwimu.com host', async () => {
    const jar = stubEnv('localhost', '?utm_source=ig&utm_medium=story');
    const { captureAttributionFromUrl, readAttribution } = await import('./attribution');
    captureAttributionFromUrl();
    expect(jar.cookie).toBe('');
    expect(readAttribution()).toEqual({});
  });

  it('captures external UTM as first touch when no existing src', async () => {
    stubEnv('kiwimu.com', '?utm_source=ig&utm_medium=story&utm_campaign=launch');
    const { captureAttributionFromUrl, readAttribution } = await import('./attribution');
    captureAttributionFromUrl();
    const data = readAttribution();
    expect(data.src).toBe('ig');
    expect(data.med).toBe('story');
    expect(data.cmp).toBe('launch');
    expect(data.land).toBe('kiwimu.com');
    expect(typeof data.ts).toBe('number');
  });

  it('does not overwrite an existing, fresh first touch', async () => {
    stubEnv('kiwimu.com', '?utm_source=ig');
    const mod = await import('./attribution');
    mod.captureAttributionFromUrl();
    const first = mod.readAttribution();

    // Re-run with a different utm_source; should be ignored (still fresh).
    (window as any).location.search = '?utm_source=fb';
    mod.captureAttributionFromUrl();
    const second = mod.readAttribution();
    expect(second.src).toBe(first.src);
    expect(second.ts).toBe(first.ts);
  });

  it('overwrites from/from_ts on every load that carries a from param', async () => {
    stubEnv('map.kiwimu.com', '?from=passport_nav');
    const mod = await import('./attribution');
    mod.captureAttributionFromUrl();
    expect(mod.readAttribution().from).toBe('passport_nav');

    (window as any).location.search = '?from=hub_nav';
    mod.captureAttributionFromUrl();
    expect(mod.readAttribution().from).toBe('hub_nav');
  });

  it('records a valid mbti result and ignores an invalid one', async () => {
    stubEnv('kiwimu.com', '');
    const mod = await import('./attribution');
    mod.recordMbtiResult('INFP-A');
    expect(mod.readAttribution().mbti).toBe('INFP-A');

    mod.recordMbtiResult('not-a-real-code');
    // Still the last valid value — invalid input must be ignored, not clear it.
    expect(mod.readAttribution().mbti).toBe('INFP-A');
  });

  it('treats a corrupt cookie as empty attribution data', async () => {
    const jar = stubEnv('kiwimu.com', '');
    jar.cookie = 'kw_attr=%7Bnot-json';
    const { readAttribution } = await import('./attribution');
    expect(readAttribution()).toEqual({});
  });

  // v1.1 修訂：寫入端每個值上限 64 字；from 必須符合 ^[a-z0-9_]+$
  it('rejects a from value with disallowed characters instead of writing it', async () => {
    stubEnv('kiwimu.com', '?from=Hub-Nav!');
    const mod = await import('./attribution');
    mod.captureAttributionFromUrl();
    expect(mod.readAttribution().from).toBeUndefined();
  });

  it('accepts a from value made only of lowercase letters, digits and underscore', async () => {
    stubEnv('kiwimu.com', '?from=mbti_result_dessert_v2');
    const mod = await import('./attribution');
    mod.captureAttributionFromUrl();
    expect(mod.readAttribution().from).toBe('mbti_result_dessert_v2');
  });

  it('caps from at 64 chars, re-validating the truncated value', async () => {
    const longValid = 'a'.repeat(80); // all valid chars, just too long
    stubEnv('kiwimu.com', `?from=${longValid}`);
    const mod = await import('./attribution');
    mod.captureAttributionFromUrl();
    expect(mod.readAttribution().from).toBe('a'.repeat(64));
  });

  it('caps each utm field at 64 chars on first-touch capture', async () => {
    const longSrc = 's'.repeat(100);
    const longCampaign = 'c'.repeat(100);
    stubEnv('kiwimu.com', `?utm_source=${longSrc}&utm_campaign=${longCampaign}`);
    const mod = await import('./attribution');
    mod.captureAttributionFromUrl();
    const data = mod.readAttribution();
    expect(data.src).toBe('s'.repeat(64));
    expect(data.cmp).toBe('c'.repeat(64));
  });

  it('caps a recorded mbti value at 64 chars', async () => {
    stubEnv('kiwimu.com', '');
    const mod = await import('./attribution');
    // Regex-valid but pathological length input is still capped defensively.
    mod.recordMbtiResult('INFP-A');
    expect((mod.readAttribution().mbti || '').length).toBeLessThanOrEqual(64);
  });
});

describe('resolveEntryFrom (GA4 entry_from landing parameter)', () => {
  afterEach(() => vi.unstubAllGlobals());

  const NOW = 1_800_000_000_000;
  const cookieWith = (obj: Record<string, unknown>) => `kw_attr=${encodeURIComponent(JSON.stringify(obj))}`;

  it('uses the from value in the original URL query', async () => {
    stubEnv('kiwimu.com', '?from=map_universe_rail&utm_source=ig');
    const { resolveEntryFrom } = await import('./attribution');
    expect(resolveEntryFrom('?from=map_universe_rail&utm_source=ig', NOW)).toBe('map_universe_rail');
  });

  it('prefers the URL from over a fresh cookie from', async () => {
    const jar = stubEnv('kiwimu.com', '');
    jar.cookie = cookieWith({ from: 'hub_nav', from_ts: NOW - 1000 });
    const { resolveEntryFrom } = await import('./attribution');
    expect(resolveEntryFrom('?from=passport_nav', NOW)).toBe('passport_nav');
  });

  it('falls back to kw_attr.from when from_ts is under 30 minutes old', async () => {
    const jar = stubEnv('kiwimu.com', '');
    jar.cookie = cookieWith({ from: 'hub_nav', from_ts: NOW - 29 * 60 * 1000 });
    const { resolveEntryFrom } = await import('./attribution');
    expect(resolveEntryFrom('', NOW)).toBe('hub_nav');
  });

  it('omits the cookie from at exactly 30 minutes and beyond', async () => {
    const jar = stubEnv('kiwimu.com', '');
    jar.cookie = cookieWith({ from: 'hub_nav', from_ts: NOW - 30 * 60 * 1000 });
    const { resolveEntryFrom } = await import('./attribution');
    expect(resolveEntryFrom('', NOW)).toBeUndefined();
    expect(resolveEntryFrom('', NOW + 60_000)).toBeUndefined();
  });

  it('omits the cookie from when from_ts is missing, non-numeric or in the future', async () => {
    const jar = stubEnv('kiwimu.com', '');
    const { resolveEntryFrom } = await import('./attribution');
    jar.cookie = cookieWith({ from: 'hub_nav' });
    expect(resolveEntryFrom('', NOW)).toBeUndefined();
    jar.cookie = cookieWith({ from: 'hub_nav', from_ts: 'yesterday' });
    expect(resolveEntryFrom('', NOW)).toBeUndefined();
    jar.cookie = cookieWith({ from: 'hub_nav', from_ts: NOW + 5000 });
    expect(resolveEntryFrom('', NOW)).toBeUndefined();
  });

  it('omits a malformed cookie from and a corrupt cookie', async () => {
    const jar = stubEnv('kiwimu.com', '');
    const { resolveEntryFrom } = await import('./attribution');
    jar.cookie = cookieWith({ from: 'Hub-Nav!', from_ts: NOW - 1000 });
    expect(resolveEntryFrom('', NOW)).toBeUndefined();
    jar.cookie = 'kw_attr=%7Bnot-json';
    expect(resolveEntryFrom('', NOW)).toBeUndefined();
  });

  it('omits a malformed URL from without falling back to the cookie', async () => {
    const jar = stubEnv('kiwimu.com', '');
    jar.cookie = cookieWith({ from: 'hub_nav', from_ts: NOW - 1000 });
    const { resolveEntryFrom } = await import('./attribution');
    expect(resolveEntryFrom('?from=Bad-Value!', NOW)).toBeUndefined();
  });

  it('returns undefined with no URL from and no cookie', async () => {
    stubEnv('kiwimu.com', '');
    const { resolveEntryFrom } = await import('./attribution');
    expect(resolveEntryFrom('?utm_source=ig', NOW)).toBeUndefined();
  });

  it('caps an over-long valid URL from at 64 chars so it matches ^[a-z0-9_]{1,64}$', async () => {
    stubEnv('kiwimu.com', '');
    const { resolveEntryFrom } = await import('./attribution');
    const out = resolveEntryFrom(`?from=${'a'.repeat(80)}`, NOW);
    expect(out).toBe('a'.repeat(64));
    expect(out).toMatch(/^[a-z0-9_]{1,64}$/);
  });
});
