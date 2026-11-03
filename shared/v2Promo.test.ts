import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  isV2FreePromoActive,
  V2_FREE_PROMO_END_LABEL,
  V2_FREE_PROMO_ENDS_AT,
  V2_FREE_PROMO_ENDS_AT_MS,
} from './v2Promo';

describe('V2 free promo window', () => {
  it.each([
    ['2026-12-31T23:59:59.999+08:00', true],
    ['2026-12-31T15:59:59.999Z', true],
    ['2026-12-31T23:59:59.000+08:00', true],
    // The previous end (2026-12-01 00:00 Taipei) must now be open: the extension took effect.
    ['2026-12-01T00:00:00.000+08:00', true],
    ['2026-11-30T16:00:00.000Z', true],
    ['2026-12-15T12:00:00.000+08:00', true],
    ['2027-01-01T00:00:00.000+08:00', false],
    ['2026-12-31T16:00:00.000Z', false],
    ['2027-01-01T23:59:59.000+08:00', false],
  ])('at %s the window is open: %s', (instant, open) => {
    expect(isV2FreePromoActive(Date.parse(instant))).toBe(open);
  });

  it('is independent of the runtime time zone and rejects invalid clocks', () => {
    expect(V2_FREE_PROMO_ENDS_AT_MS).toBe(Date.UTC(2026, 11, 31, 16, 0, 0));
    expect(V2_FREE_PROMO_END_LABEL).toBe('2026/12/31 23:59');
    expect(isV2FreePromoActive(Number.NaN)).toBe(false);
  });

  it('matches the constant in the database end guard', () => {
    // The latest migration that (re)defines the guard wins, so a later extension only needs a new
    // migration plus the constant in v2Promo.ts, not an edit here.
    const dir = new URL('../supabase/migrations/', import.meta.url);
    const files = readdirSync(dir).filter(name => name.endsWith('.sql')).sort()
      .filter(name => readFileSync(new URL(name, dir), 'utf8').includes('v2_promo_unlocks_before_end'));
    expect(files.length).toBeGreaterThan(0);
    const migration = readFileSync(new URL(files[files.length - 1], dir), 'utf8');
    const match = migration.match(/created_at < TIMESTAMPTZ '([^']+)'/);
    expect(match).not.toBeNull();
    const dbEnd = Date.parse(match![1].replace(' ', 'T').replace(/\+08$/, '+08:00'));
    expect(dbEnd).toBe(Date.parse(V2_FREE_PROMO_ENDS_AT));
  });
});
