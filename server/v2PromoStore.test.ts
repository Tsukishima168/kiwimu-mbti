import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ result: { data: null as unknown, error: null as unknown }, calls: [] as Array<[string, unknown[]]> }));

// A chainable stand-in for the supabase-js query builder that records every call.
function builder() {
  const chain: Record<string, unknown> = {};
  for (const method of ['schema', 'from', 'select', 'eq', 'limit', 'order', 'insert']) {
    chain[method] = (...args: unknown[]) => { mocks.calls.push([method, args]); return chain; };
  }
  chain.maybeSingle = async () => mocks.result;
  chain.then = (resolve: (value: unknown) => unknown) => resolve(mocks.result);
  return chain;
}

vi.mock('./supabase/user-admin.js', () => ({ getUserAdminDb: () => builder() }));

import { hasV2PromoUnlock, insertV2PromoUnlock, listV2PromoUnlocksForUser } from './v2PromoStore';

beforeEach(() => {
  mocks.result = { data: null, error: null };
  mocks.calls = [];
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('v2 promo store', () => {
  it('inserts only the grant columns and lets the database set created_at', async () => {
    mocks.result = { data: { created_at: '2026-11-01T00:00:00Z' }, error: null };
    await expect(insertV2PromoUnlock({ userId: 'account-a', mbtiType: 'ESTJ-A', source: 'quiz' }))
      .resolves.toEqual({ status: 'created', claimedAt: '2026-11-01T00:00:00Z' });
    expect(mocks.calls).toContainEqual(['schema', ['public']]);
    expect(mocks.calls).toContainEqual(['from', ['v2_promo_unlocks']]);
    expect(mocks.calls).toContainEqual(['insert', [{ user_uid: 'account-a', mbti_type: 'ESTJ-A', promo_id: 'v2_free_202611', source: 'quiz' }]]);
  });

  it.each([
    { error: { code: '23505', message: 'duplicate key value violates unique constraint "v2_promo_unlocks_pkey"' }, status: 'exists' },
    { error: { code: '23514', message: 'new row for relation "v2_promo_unlocks" violates check constraint "v2_promo_unlocks_before_end"' }, status: 'ended' },
    { error: { code: '23514', message: 'violates check constraint "v2_promo_unlocks_source_check"' }, status: 'unavailable' },
    { error: { code: '42P01', message: 'relation does not exist' }, status: 'unavailable' },
    { error: { code: '08006', message: 'connection failure' }, status: 'unavailable' },
  ])('maps insert error $error.code to $status', async ({ error, status }) => {
    mocks.result = { data: null, error };
    await expect(insertV2PromoUnlock({ userId: 'account-a', mbtiType: 'ESTJ-A', source: null }))
      .resolves.toEqual({ status });
  });

  it('looks up a grant for one account and one type only', async () => {
    mocks.result = { data: { mbti_type: 'ESTJ-A' }, error: null };
    await expect(hasV2PromoUnlock('account-a', 'ESTJ-A')).resolves.toBe(true);
    expect(mocks.calls).toContainEqual(['eq', ['user_uid', 'account-a']]);
    expect(mocks.calls).toContainEqual(['eq', ['mbti_type', 'ESTJ-A']]);
  });

  it('denies when the lookup succeeds but finds no row (data: null, error: null)', async () => {
    mocks.result = { data: null, error: null };
    await expect(hasV2PromoUnlock('account-a', 'ESTJ-A')).resolves.toBe(false);
  });

  it.each([
    { error: { code: '08006', message: 'connection failure' }, expected: undefined },
    { error: { code: '42501', message: 'permission denied' }, expected: undefined },
    { error: { message: 'no code' }, expected: undefined },
    { error: { code: '42P01', message: 'relation does not exist' }, expected: false },
  ])('never grants when data is null and the lookup errored ($error.message)', async ({ error, expected }) => {
    mocks.result = { data: null, error };
    const result = await hasV2PromoUnlock('account-a', 'ESTJ-A');
    expect(result).not.toBe(true);
    expect(result).toBe(expected);
  });

  it.each([
    { error: { code: 'PGRST205' }, expected: false },
    { error: { code: '42P01' }, expected: false },
    { error: { code: '08006' }, expected: undefined },
  ])('treats lookup error $error.code as $expected (missing table denies, outages are retryable)', async ({ error, expected }) => {
    mocks.result = { data: null, error };
    await expect(hasV2PromoUnlock('account-a', 'ESTJ-A')).resolves.toBe(expected);
  });

  it('lists an account library and reports outages as undefined', async () => {
    mocks.result = { data: [{ mbti_type: 'INFP-T', created_at: '2026-11-20T03:00:00Z' }], error: null };
    await expect(listV2PromoUnlocksForUser('account-a')).resolves.toEqual([{ mbti_type: 'INFP-T', created_at: '2026-11-20T03:00:00Z' }]);
    mocks.result = { data: null, error: { code: '08006' } };
    await expect(listV2PromoUnlocksForUser('account-a')).resolves.toBeUndefined();
    mocks.result = { data: null, error: { code: 'PGRST205' } };
    await expect(listV2PromoUnlocksForUser('account-a')).resolves.toEqual([]);
  });
});
