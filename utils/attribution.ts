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
// (map/shop repos) — not implemented here. The one read here is
// resolveEntryFrom(): the GA4 `entry_from` landing parameter (index.html).

const COOKIE_NAME = 'kw_attr';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const MAX_AGE_MS = MAX_AGE_SECONDS * 1000;
const MBTI_PATTERN = /^[EI][NS][TF][JP](-[AT])?$/;

// v1.1 修訂：寫入端每個值上限 64 字；from 必須符合 ^[a-z0-9_]+$。
const MAX_VALUE_LENGTH = 64;
const FROM_PATTERN = /^[a-z0-9_]+$/;

function capLength(value: string): string {
  return value.length > MAX_VALUE_LENGTH ? value.slice(0, MAX_VALUE_LENGTH) : value;
}

function capOrUndefined(value: string | null): string | undefined {
  if (!value) return undefined;
  return capLength(value);
}

/**
 * Validates + caps a `from` value per R4 v1.1: lowercase alphanumeric and
 * underscore only, <=64 chars. Anything else is treated as absent rather
 * than written malformed into the shared cookie.
 */
function sanitizeFromValue(value: string): string | undefined {
  const capped = capLength(value);
  return FROM_PATTERN.test(capped) ? capped : undefined;
}

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
    // A malformed `from` (fails ^[a-z0-9_]+$ after the 64-char cap) is
    // dropped rather than written — and we do NOT fall back to utm_source
    // capture, since a from= link is never also an external ad click.
    const sanitizedFrom = sanitizeFromValue(from);
    if (sanitizedFrom) {
      next.from = sanitizedFrom;
      next.from_ts = Date.now();
      changed = true;
    }
  } else if (utmSource) {
    const isStale = !next.ts || Date.now() - next.ts > MAX_AGE_MS;
    if (!next.src || isStale) {
      // Whole-group capture from a single source (the current URL) — never
      // mixed field-by-field with whatever the cookie already held.
      next.src = capLength(utmSource);
      next.med = capOrUndefined(params.get('utm_medium'));
      next.cmp = capOrUndefined(params.get('utm_campaign'));
      next.cnt = capOrUndefined(params.get('utm_content'));
      next.trm = capOrUndefined(params.get('utm_term'));
      next.land = capLength(window.location.hostname);
      next.ts = Date.now();
      changed = true;
    }
  }

  if (changed) persistAttribution(next);
}

/**
 * GA4 `entry_from` freshness window: a cookie-sourced `from` is only trusted
 * for a landing that happens < 30 minutes after it was written.
 */
export const ENTRY_FROM_WINDOW_MS = 30 * 60 * 1000;

/**
 * Resolves the GA4 `entry_from` event parameter for THIS landing (read-only —
 * never writes the cookie). Must be called before the URL is cleaned:
 *  1. URL query has `from` → that value (must match ^[a-z0-9_]{1,64}$ after the
 *     64-char cap; a malformed value yields undefined and does NOT fall back to
 *     the cookie, since this landing did carry a from= link).
 *  2. Otherwise kw_attr.from, only if kw_attr.from_ts is < 30 minutes old.
 *  3. Otherwise undefined (omit the parameter).
 * Never throws.
 */
export function resolveEntryFrom(
  search: string = typeof window !== 'undefined' ? window.location.search : '',
  now: number = Date.now(),
): string | undefined {
  try {
    const urlFrom = new URLSearchParams(search).get('from');
    if (urlFrom) return sanitizeFromValue(urlFrom);

    const { from, from_ts: fromTs } = readAttribution();
    if (typeof from !== 'string' || typeof fromTs !== 'number' || !Number.isFinite(fromTs)) return undefined;
    const age = now - fromTs;
    if (age < 0 || age >= ENTRY_FROM_WINDOW_MS) return undefined;
    return sanitizeFromValue(from);
  } catch {
    return undefined;
  }
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
  persistAttribution({ ...current, mbti: capLength(mbtiType), mbti_ts: Date.now() });
}

export { MBTI_PATTERN };
