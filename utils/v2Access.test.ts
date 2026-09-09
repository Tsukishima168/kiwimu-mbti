import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearV2Entitlement,
  hasV2UnlockQuery,
  readCachedV2Entitlement,
  setV2Entitlement,
} from './v2Access';

const q = (search: string) => new URLSearchParams(search);

describe('hasV2UnlockQuery', () => {
  // `?unlock=success` used to be honoured on trust, so appending it to any
  // report URL unlocked every paid chapter for free. Purchases now go through
  // /api/v2/verify-unlock, which checks the order actually reached `confirmed`.
  // This must stay false no matter what the caller passes.
  it('never grants an unlock from the success query alone', () => {
    expect(hasV2UnlockQuery(q('unlock=success'))).toBe(false);
    expect(hasV2UnlockQuery(q('unlock=success'), { allowPreview: true })).toBe(false);
    expect(hasV2UnlockQuery(q('unlock=success&order_id=V2-INTJ-A-1-deadbeef'))).toBe(false);
  });

  it('honours the dev preview only when the caller allows it', () => {
    expect(hasV2UnlockQuery(q('unlock=preview'), { allowPreview: true })).toBe(true);
    expect(hasV2UnlockQuery(q('unlock=preview'), { allowPreview: false })).toBe(false);
  });

  it('ignores unrelated or absent unlock params', () => {
    expect(hasV2UnlockQuery(q(''), { allowPreview: true })).toBe(false);
    expect(hasV2UnlockQuery(q('unlock=yes'), { allowPreview: true })).toBe(false);
    expect(hasV2UnlockQuery(q('checkout=success'), { allowPreview: true })).toBe(false);
  });
});

describe('V2 entitlement cache', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('fails closed instead of crashing when storage reads are blocked', () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('blocked'); } });
    expect(readCachedV2Entitlement()).toEqual({ status: 'locked' });
  });

  it('keeps the current page usable when storage writes and cleanup are blocked', () => {
    vi.stubGlobal('localStorage', {
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    });
    expect(setV2Entitlement({ status: 'unlocked' })).toBe(false);
    expect(() => clearV2Entitlement()).not.toThrow();
  });
});
