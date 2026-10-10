import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let sessionCache: (typeof import('./sessionCache'))['sessionCache'];
beforeEach(async () => {
  vi.resetModules();
  ({ sessionCache } = await import('./sessionCache'));
});

afterEach(() => vi.unstubAllGlobals());

// Regression: ISSUE-002 — denied sessionStorage prevented startup and result display.
// Found by /qa on 2026-10-09.
// Report: /Users/pensoair/.codex/visualizations/2026/10/09/kiwimu-mbti-acceptance/REPORT.md
describe('optional session cache', () => {
  it('preserves successful browser reads, writes and removal', () => {
    const data = new Map<string, string>();
    vi.stubGlobal('window', { sessionStorage: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
      removeItem: (key: string) => data.delete(key),
    } });
    expect(sessionCache.setItem('last_quiz_scores', '{"E":8}')).toBe(true);
    expect(sessionCache.getItem('last_quiz_scores')).toBe('{"E":8}');
    expect(sessionCache.removeItem('last_quiz_scores')).toBe(true);
    expect(sessionCache.getItem('last_quiz_scores')).toBeNull();
  });

  it('does not throw when access to the storage object itself is denied', () => {
    vi.stubGlobal('window', Object.defineProperty({}, 'sessionStorage', {
      get() { throw new Error('SecurityError'); },
    }));
    expect(sessionCache.getItem('result')).toBeNull();
    expect(sessionCache.setItem('result', 'new')).toBe(false);
    expect(sessionCache.removeItem('result')).toBe(false);
  });

  it('does not report success when readable storage rejects writes and removal', () => {
    vi.stubGlobal('window', { sessionStorage: {
      getItem: () => 'old',
      setItem: () => { throw new Error('QuotaExceededError'); },
      removeItem: () => { throw new Error('SecurityError'); },
    } });
    expect(sessionCache.getItem('result')).toBe('old');
    expect(sessionCache.setItem('result', 'new')).toBe(false);
    expect(sessionCache.getItem('result')).toBe('new');
    expect(sessionCache.removeItem('result')).toBe(false);
    expect(sessionCache.getItem('result')).toBeNull();
  });

  it('returns no cached result if reads throw', () => {
    vi.stubGlobal('window', { sessionStorage: {
      getItem: () => { throw new Error('SecurityError'); },
      setItem: vi.fn(), removeItem: vi.fn(),
    } });
    expect(sessionCache.getItem('result')).toBeNull();
  });

  it('keeps this page usable without pretending an in-memory result was persisted', () => {
    vi.stubGlobal('window', Object.defineProperty({}, 'sessionStorage', {
      get() { throw new Error('SecurityError'); },
    }));
    expect(sessionCache.setItem('last_quiz_result', '{"id":"ESTJ"}')).toBe(false);
    expect(sessionCache.getItem('last_quiz_result')).toBe('{"id":"ESTJ"}');
    expect(sessionCache.removeItem('last_quiz_result')).toBe(false);
    expect(sessionCache.getItem('last_quiz_result')).toBeNull();
  });

  it('resumes using browser storage if a subsequent write succeeds', () => {
    const store = new Map<string, string>();
    let denied = true;
    vi.stubGlobal('window', { sessionStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => { if (denied) throw new Error('quota'); store.set(key, value); },
      removeItem: (key: string) => store.delete(key),
    } });
    expect(sessionCache.setItem('result', 'temporary')).toBe(false);
    denied = false;
    expect(sessionCache.setItem('result', 'persisted')).toBe(true);
    expect(store.get('result')).toBe('persisted');
    expect(sessionCache.getItem('result')).toBe('persisted');
    sessionCache.removeItem('result');
    expect(sessionCache.getItem('result')).toBeNull();
  });
});
