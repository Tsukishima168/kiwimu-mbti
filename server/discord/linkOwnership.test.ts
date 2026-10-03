import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const mocks = vi.hoisted(() => ({ db: vi.fn() }));
vi.mock('../supabase/user-admin.js', () => ({ getUserAdminDb: mocks.db }));
vi.mock('../v2Account.js', () => ({ getVerifiedV2User: async (req: VercelRequest) => ({ user: {
  id: req.headers.authorization?.slice(7), user_metadata: {},
} }) }));
import handler from '../../api/discord/link/complete';

const firstState = '11111111-1111-4111-8111-111111111111';
const secondState = '22222222-2222-4222-8222-222222222222';
type Row = Record<string, unknown>;

function database() {
  const rows: Record<string, Row[]> = { discord_link_states: [firstState, secondState].map(state => ({
    state, discord_user_id: 'own-discord', guild_id: 'own-guild',
    expires_at: new Date(Date.now() + 600_000).toISOString(), created_at: new Date().toISOString(), used: false,
  })), discord_links: [], discord_actions: [] };
  let failure = '';
  let failureCode = 'SYNTHETIC_DB_ERROR';
  class Query {
    filters: ((row: Row) => boolean)[] = [];
    operation = 'read';
    payload: Row = {};
    constructor(readonly table: string) {}
    select() { return this; }
    eq(key: string, value: unknown) { this.filters.push(row => row[key] === value); return this; }
    gt(key: string, value: unknown) { this.filters.push(row => String(row[key]) > String(value)); return this; }
    update(value: Row) { this.operation = 'update'; this.payload = value; return this; }
    insert(value: Row) { this.operation = 'insert'; this.payload = value; return this; }
    upsert(value: Row) { this.operation = 'upsert'; this.payload = value; return this; }
    async run() {
      if (failure === `${this.table}:${this.operation}`) return { data: null, error: { code: failureCode, message: 'synthetic unavailable' } };
      const table = rows[this.table];
      if (this.operation === 'insert' || this.operation === 'upsert') {
        const existing = this.table === 'discord_links' ? table.find(row => row.link_id === this.payload.link_id) : undefined;
        if (existing && this.operation === 'insert') return { data: null, error: { code: '23505', message: 'synthetic unique conflict' } };
        if (existing) Object.assign(existing, this.payload);
        else table.push({ ...this.payload });
        return { data: { ...this.payload }, error: null };
      }
      const matched = table.filter(row => this.filters.every(predicate => predicate(row)));
      if (this.operation === 'update') for (const row of matched) Object.assign(row, this.payload);
      return { data: matched[0] ? { ...matched[0] } : null, error: null };
    }
    maybeSingle() { return this.run(); }
    single() { return this.run(); }
    then(resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) { return this.run().then(resolve, reject); }
  }
  return { rows, db: { from: (table: string) => new Query(table) }, fail: (operation: string, code = 'SYNTHETIC_DB_ERROR') => { failure = operation; failureCode = code; } };
}

async function link(account: string, state = firstState) {
  const result = { status: 0, body: null as unknown };
  const res = { setHeader() {}, status(code: number) { result.status = code; return res; }, json(body: unknown) { result.body = body; return res; } } as unknown as VercelResponse;
  await handler({ method: 'POST', headers: { host: 'kiwimu.com', origin: 'https://kiwimu.com', authorization: `Bearer ${account}` }, body: { state } } as VercelRequest, res);
  return result;
}

beforeEach(() => { vi.clearAllMocks(); vi.spyOn(console, 'error').mockImplementation(() => {}); });
afterEach(() => { vi.restoreAllMocks(); });

describe('Discord link ownership with actual handler and data service', () => {
  it('allows only one owner to consume the same state concurrently', async () => {
    const fixture = database(); mocks.db.mockReturnValue(fixture.db);
    const outcomes = await Promise.all([link('account-a'), link('account-b')]);
    expect(outcomes.map(result => result.status).sort()).toEqual([200, 409]);
    const winner = outcomes[0].status === 200 ? 'account-a' : 'account-b';
    expect(fixture.rows.discord_links).toHaveLength(1);
    expect(fixture.rows.discord_links[0].app_uid).toBe(winner);
    expect(fixture.rows.discord_link_states[0].app_uid).toBe(winner);
  });

  it('prevents different valid states for one Discord account from overwriting the first owner', async () => {
    const fixture = database(); mocks.db.mockReturnValue(fixture.db);
    const outcomes = await Promise.all([link('account-a'), link('account-b', secondState)]);
    expect(outcomes.map(result => result.status).sort()).toEqual([200, 409]);
    const winner = outcomes[0].status === 200 ? 'account-a' : 'account-b';
    expect(fixture.rows.discord_links).toHaveLength(1);
    expect(fixture.rows.discord_links[0].app_uid).toBe(winner);
  });

  it('requires Discord unlink before a new owner can take over an existing link', async () => {
    const fixture = database(); mocks.db.mockReturnValue(fixture.db);
    fixture.rows.discord_links.push({ link_id: 'own-guild_own-discord', app_uid: 'original-owner', display_name: 'Original profile' });
    expect((await link('other-owner')).status).toBe(409);
    expect(fixture.rows.discord_links[0]).toEqual({ link_id: 'own-guild_own-discord', app_uid: 'original-owner', display_name: 'Original profile' });
  });

  it('allows an existing owner to link idempotently with a new valid state', async () => {
    const fixture = database(); mocks.db.mockReturnValue(fixture.db);
    expect((await link('account-a')).status).toBe(200);
    expect((await link('account-a', secondState)).status).toBe(200);
    expect(fixture.rows.discord_links).toHaveLength(1);
    expect(fixture.rows.discord_links[0].app_uid).toBe('account-a');
  });

  it.each(['discord_link_states:read', 'discord_link_states:update', 'discord_links:insert'])('reports %s failure instead of false success', async operation => {
    const fixture = database(); fixture.fail(operation); mocks.db.mockReturnValue(fixture.db);
    expect((await link('account-a')).status).toBe(503);
    expect(fixture.rows.discord_links).toHaveLength(0);
  });

  it('does not create any link when auth is valid but the data store is unavailable', async () => {
    mocks.db.mockReturnValue(null);
    expect((await link('account-a')).status).toBe(503);
  });

  it.each(['42P01', 'PGRST205'])('returns 503 when Discord link tables are absent (%s)', async code => {
    const fixture = database(); fixture.fail('discord_link_states:read', code); mocks.db.mockReturnValue(fixture.db);
    const outcome = await link('account-a');
    expect(outcome.status).toBe(503);
    expect(outcome.body).toMatchObject({ ok: false, code: 'DISCORD_STORE_UNAVAILABLE' });
    expect(fixture.rows.discord_links).toHaveLength(0);
  });

  it('leaves a state consumed after an insert failure and requires a new Discord link', async () => {
    const fixture = database(); fixture.fail('discord_links:insert'); mocks.db.mockReturnValue(fixture.db);
    expect((await link('account-a')).status).toBe(503);
    expect(fixture.rows.discord_link_states[0].used).toBe(true);
    expect((await link('account-b')).status).toBe(409);
    expect(fixture.rows.discord_links).toHaveLength(0);
  });
});
