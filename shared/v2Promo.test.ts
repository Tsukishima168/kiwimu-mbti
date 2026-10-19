import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isV2FreePromoActive, V2_FREE_PROMO_ENDS_AT, V2_FREE_PROMO_ENDS_AT_MS } from './v2Promo';

describe('V2 free promo window', () => {
  it.each([
    ['2026-11-30T23:59:59.999+08:00', true],
    ['2026-11-30T15:59:59.999Z', true],
    ['2026-11-30T23:59:59.000+08:00', true],
    ['2026-12-01T00:00:00.000+08:00', false],
    ['2026-11-30T16:00:00.000Z', false],
    ['2026-12-01T23:59:59.000+08:00', false],
  ])('at %s the window is open: %s', (instant, open) => {
    expect(isV2FreePromoActive(Date.parse(instant))).toBe(open);
  });

  it('is independent of the runtime time zone and rejects invalid clocks', () => {
    expect(V2_FREE_PROMO_ENDS_AT_MS).toBe(Date.UTC(2026, 10, 30, 16, 0, 0));
    expect(isV2FreePromoActive(Number.NaN)).toBe(false);
  });

  it('matches the constant in the database end guard', () => {
    const migration = readFileSync(new URL('../supabase/migrations/20261020100000_v2_promo_unlocks.sql', import.meta.url), 'utf8');
    const match = migration.match(/created_at < TIMESTAMPTZ '([^']+)'/);
    expect(match).not.toBeNull();
    const dbEnd = Date.parse(match![1].replace(' ', 'T').replace(/\+08$/, '+08:00'));
    expect(dbEnd).toBe(Date.parse(V2_FREE_PROMO_ENDS_AT));
  });
});
