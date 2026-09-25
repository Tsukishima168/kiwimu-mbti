// R4: First-touch attribution cookie shared across all *.kiwimu.com sites.
// Contract (see UPGRADE_SPEC.md R4, shared by all five Kiwimu repos):
//   - cookie name `kw_attr`, value = encodeURIComponent(JSON.stringify(obj))
//   - only written when hostname ends with `kiwimu.com`
//   - domain=.kiwimu.com; path=/; max-age=2592000 (30d); SameSite=Lax; Secure
//   - fields (all optional): src med cmp cnt trm land ts mbti mbti_ts from from_ts
//
// This repo (kiwimu-com) is a WRITER only: it captures external UTM first-touch,
// the most recent `from` (internal cross-site entry), and the quiz result mbti
// code. Reading/consuming the cookie for order attribution happens downstream
// (map/shop repos) — not implemented here.

const COOKIE_NAME = 'kw_attr';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const MAX_AGE_MS = MAX_AGE_SECONDS * 1000;
const MBTI_PATTERN = /^[EI][NS][TF][JP](-[AT])?$/;

export interface KwAttrData {
  src?: string;
  med?: string;
  cmp?: string;
  cnt?: string;
  trm?: string;
  land?: string;
  ts?: number;
  mbti?: string;
  mbti_ts?: number;
  from?: string;
  from_ts?: number;
}

function isKiwimuHost(hostname: string): boolean {
  return hostname === 'kiwimu.com' || hostname.endsWith('.kiwimu.com');
}

function readRawCookie(name: string): string | undefined {
  if (typeof document === 'undefined' || !document.cookie) return undefined;
  const escaped = name.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&');
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + escaped + '=([^;]*)'));
  return match ? match[1] : undefined;
}

function writeRawCookie(value: string): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  if (!isKiwimuHost(window.location.hostname)) return;

  document.cookie = `${COOKIE_NAME}=${value}; domain=.kiwimu.com; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax; Secure`;
}

/**
 * Reads and parses the current kw_attr cookie. Never throws — a missing or
 * corrupt cookie is treated as "no attribution data" per R4.
 */
export function readAttribution(): KwAttrData {
  const raw = readRawCookie(COOKIE_NAME);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return parsed && typeof parsed === 'object' ? parsed as KwAttrData : {};
  } catch {
    return {};
  }
}

function persistAttribution(data: KwAttrData): void {
  try {
    writeRawCookie(encodeURIComponent(JSON.stringify(data)));
  } catch {
    // Cookie writes must never break the app (quota, disabled storage, etc.)
  }
}

/**
 * Call once per app load. Implements the R4 write rules:
 *  - URL has `from` (no `utm_source` required) → overwrite from/from_ts.
 *  - Otherwise, URL has `utm_source` and no `from` → write src/med/cmp/cnt/trm/
 *    land/ts as first-touch, but only if the cookie has no `src` yet, or the
 *    existing `ts` is older than 30 days. Never overwrites an existing,
 *    still-fresh first touch.
 */
export function captureAttributionFromUrl(search: string = typeof window !== 'undefined' ? window.location.search : ''): void {
  if (typeof window === 'undefined') return;
  if (!isKiwimuHost(window.location.hostname)) return;

  const params = new URLSearchParams(search);
  const from = params.get('from');
  const utmSource = params.get('utm_source');

  if (!from && !utmSource) return;

  const current = readAttribution();
  const next: KwAttrData = { ...current };
  let changed = false;

  if (from) {
    next.from = from;
    next.from_ts = Date.now();
    changed = true;
  } else if (utmSource) {
    const isStale = !next.ts || Date.now() - next.ts > MAX_AGE_MS;
    if (!next.src || isStale) {
      next.src = utmSource;
      next.med = params.get('utm_medium') || undefined;
      next.cmp = params.get('utm_campaign') || undefined;
      next.cnt = params.get('utm_content') || undefined;
      next.trm = params.get('utm_term') || undefined;
      next.land = window.location.hostname;
      next.ts = Date.now();
      changed = true;
    }
  }

  if (changed) persistAttribution(next);
}

/**
 * Call when the quiz produces a result. Overwrites mbti/mbti_ts. Invalid or
 * malformed codes are silently ignored — this must never block quiz
 * completion.
 */
export function recordMbtiResult(mbtiType: string): void {
  if (typeof window === 'undefined') return;
  if (!isKiwimuHost(window.location.hostname)) return;
  if (!mbtiType || !MBTI_PATTERN.test(mbtiType)) return;

  const current = readAttribution();
  persistAttribution({ ...current, mbti: mbtiType, mbti_ts: Date.now() });
}

export { MBTI_PATTERN };
