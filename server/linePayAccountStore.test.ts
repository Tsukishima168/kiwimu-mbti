import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ db: vi.fn() }));
vi.mock('./supabase/user-admin.js', () => ({ getUserAdminDb: mocks.db }));
import { claimAnonymousLinePayOrder, listConfirmedLinePayOrdersForUser } from './linePayOrderStore';

type Row = { order_id: string; user_uid: string | null; status: string; mbti_type: string; confirmed_at: string; created_at: string };
let rows: Row[];
let storeUnavailable = false;
function query(schema: string) {
  let filters: Array<(row: Row) => boolean> = [];
  let patch: Partial<Row> | null = null;
  let single = false;
  const chain: any = {
    select() { return chain; },
    update(value: Partial<Row>) { patch = value; return chain; },
    eq(key: keyof Row, value: unknown) { filters.push(row => row[key] === value); return chain; },
    is(key: keyof Row, value: unknown) { filters.push(row => row[key] === value); return chain; },
    order() { return chain; }, limit() { return chain; },
    maybeSingle() { single = true; return chain; },
    then(resolve: any) {
      if (schema !== 'public' || storeUnavailable) return Promise.resolve({ data: null, error: { code: 'UNAVAILABLE' } }).then(resolve);
      const matches = rows.filter(row => filters.every(filter => filter(row)));
      if (patch) for (const row of matches) Object.assign(row, patch);
      return Promise.resolve({ data: single ? matches[0] || null : matches, error: null }).then(resolve);
    },
  };
  return chain;
}
beforeEach(() => {
  storeUnavailable = false;
  rows = [{ order_id: 'order-a', user_uid: null, status: 'confirmed', mbti_type: 'ESTJ-A', confirmed_at: '2026-10-02T00:00:00Z', created_at: '2026-10-02T00:00:00Z' }];
  mocks.db.mockReturnValue({ schema: (schema: string) => ({ from: () => query(schema) }) });
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('purchase ownership persistence', () => {
  it('lets exactly one competing account claim an anonymous order', async () => {
    const [a, b] = await Promise.all([claimAnonymousLinePayOrder('order-a', 'account-a'), claimAnonymousLinePayOrder('order-a', 'account-b')]);
    expect(a).toBe(true);
    expect(b).toBe(false);
    expect(rows[0].user_uid).toBe('account-a');
  });

  it('keeps same-owner retries idempotent without allowing an owner transfer', async () => {
    rows[0].user_uid = 'account-a';
    expect(await claimAnonymousLinePayOrder('order-a', 'account-a')).toBe(true);
    expect(await claimAnonymousLinePayOrder('order-a', 'account-b')).toBe(false);
    expect(rows[0].user_uid).toBe('account-a');
  });

  it('never attaches an unpaid order', async () => {
    rows[0].status = 'requested';
    expect(await claimAnonymousLinePayOrder('order-a', 'account-a')).toBe(false);
    expect(rows[0].user_uid).toBeNull();
  });

  it('lists only confirmed orders belonging to the requested verified account', async () => {
    rows[0].user_uid = 'account-a';
    rows.push({ ...rows[0], order_id: 'order-b', user_uid: 'account-b' }, { ...rows[0], order_id: 'order-c', status: 'cancelled' });
    expect((await listConfirmedLinePayOrdersForUser('account-a'))!.map(row => row.order_id)).toEqual(['order-a']);
  });

  it('fails closed instead of reporting an empty library when the current store is unavailable', async () => {
    storeUnavailable = true;
    expect(await listConfirmedLinePayOrdersForUser('account-a')).toBeUndefined();
    expect(await claimAnonymousLinePayOrder('order-a', 'account-a')).toBe(false);
  });
});
