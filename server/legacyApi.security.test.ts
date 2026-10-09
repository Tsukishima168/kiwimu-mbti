import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const mocks = vi.hoisted(() => ({
  identity: vi.fn(), state: vi.fn(), upsert: vi.fn(), used: vi.fn(), log: vi.fn(),
  sheet: vi.fn(), jwt: vi.fn(),
}));
vi.mock('./v2Account.js', () => ({ getVerifiedV2User: mocks.identity }));
vi.mock('./discord/discord-data.service.js', () => ({
  getDiscordLinkState: mocks.state, upsertDiscordLink: mocks.upsert,
  markDiscordLinkStateUsed: mocks.used, logDiscordAction: mocks.log,
}));
vi.mock('google-spreadsheet', () => ({ GoogleSpreadsheet: mocks.sheet }));
vi.mock('google-auth-library', () => ({ JWT: mocks.jwt }));

import saveUser from '../api/save-user';
import completeLink from '../api/discord/link/complete';
import assignRole from '../api/discord/assign-role';

const linkState = '11111111-1111-4111-8111-111111111111';
const origin = { host: 'kiwimu.com', origin: 'https://kiwimu.com', authorization: 'Bearer mock-account-token' };
function req(body: unknown = {}, headers: Record<string, string> = origin, method = 'POST') {
  return { method, headers, body } as VercelRequest;
}
function res() {
  const state = { status: 0, body: null as unknown };
  const response = {
    setHeader: vi.fn(),
    status(code: number) { state.status = code; return response; },
    json(body: unknown) { state.body = body; return response; },
  } as unknown as VercelResponse;
  return { response, state };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.identity.mockResolvedValue({ user: {
    id: 'verified-account', email: 'account@example.com', email_confirmed_at: '2026-10-01',
    user_metadata: { full_name: 'Verified profile' },
  } });
  mocks.state.mockResolvedValue({ state: linkState, discordUserId: 'own-discord', guildId: 'own-guild', used: false, expiresAt: Date.now() + 600_000 });
  mocks.upsert.mockResolvedValue(true);
  mocks.used.mockResolvedValue(true);
  mocks.log.mockResolvedValue(undefined);
  vi.stubEnv('DISCORD_TOKEN', 'fake-test-bot-token');
  vi.stubEnv('DISCORD_BOT_TOKEN', 'fake-test-bot-token');
  vi.stubEnv('SUPABASE_USER_URL', '');
  vi.stubEnv('VITE_SUPABASE_USER_URL', '');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'mock-message' }) }));
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('Discord account ownership', () => {
  it('requires verified auth before looking up an otherwise valid Discord state', async () => {
    mocks.identity.mockResolvedValue({ code: 'AUTH_REQUIRED' });
    const { response, state } = res();
    await completeLink(req({ state: linkState, appUid: 'victim-account' }), response);
    expect(state.status).toBe(401);
    expect(mocks.state).not.toHaveBeenCalled();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it('binds only the verified Supabase account, ignoring all forged account fields', async () => {
    const { response, state } = res();
    await completeLink(req({ state: linkState, appUid: 'victim-account', firebaseUid: 'other-victim',
      email: 'victim@example.com', displayName: 'Victim' }), response);
    expect(state.status).toBe(200);
    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({
      discordUserId: 'own-discord', appUid: 'verified-account', email: 'account@example.com', displayName: 'Verified profile',
    }));
    expect(mocks.used).toHaveBeenCalledWith(linkState, 'verified-account');
    expect(mocks.log).toHaveBeenCalledWith(expect.objectContaining({ appUid: 'verified-account' }));
  });

  it('accepts the new state-only body for an authenticated caller', async () => {
    const { response, state } = res();
    await completeLink(req({ state: linkState }), response);
    expect(state.status).toBe(200);
    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({ appUid: 'verified-account' }));
  });

  it.each([
    { headers: { ...origin, origin: 'https://other.example' }, body: { state: linkState }, code: 403 },
    { headers: origin, body: { state: linkState, extra: 'x'.repeat(2_000) }, code: 413 },
    { headers: origin, body: { state: ['not-a-string'] }, code: 400 },
    { headers: origin, body: { state: 'x'.repeat(129) }, code: 400 },
  ])('rejects unsafe link request before state lookup ($code)', async fixture => {
    const { response, state } = res();
    await completeLink(req(fixture.body, fixture.headers), response);
    expect(state.status).toBe(fixture.code);
    expect(mocks.state).not.toHaveBeenCalled();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it.each([
    { value: null, code: 404 },
    { value: { used: true, expiresAt: Date.now() + 600_000 }, code: 409 },
    { value: { used: false, expiresAt: Date.now() - 1_000 }, code: 410 },
    { value: { used: false, expiresAt: undefined }, code: 410 },
  ])('rejects absent, used, expired or malformed state ($code)', async fixture => {
    mocks.state.mockResolvedValue(fixture.value);
    const { response, state } = res();
    await completeLink(req({ state: linkState }), response);
    expect(state.status).toBe(fixture.code);
    expect(mocks.upsert).not.toHaveBeenCalled();
    expect(mocks.used).not.toHaveBeenCalled();
  });

  it('returns auth outage without looking up state or writing links', async () => {
    mocks.identity.mockResolvedValue({ code: 'AUTH_UNAVAILABLE' });
    const { response, state } = res();
    await completeLink(req({ state: linkState }), response);
    expect(state.status).toBe(503);
    expect(mocks.state).not.toHaveBeenCalled();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
});

describe('retired Sheet login endpoint', () => {
  it.each(['POST', 'GET', 'PUT'])('always returns 410 for %s without loading Google credentials', async method => {
    const { response, state } = res();
    await saveUser(req({ uid: 'victim-account', email: 'victim@example.com' }, {}, method), response);
    expect(state.status).toBe(410);
    expect(mocks.sheet).not.toHaveBeenCalled();
    expect(mocks.jwt).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('retired arbitrary Discord role endpoint', () => {
  it.each(['POST', 'GET', 'PUT'])('always returns 410 for %s without any Discord lookup or mutation', async method => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => [
      { id: 'new-role', name: '🎯 INTJ 戰略策劃家' },
      { id: 'old-role', name: '🌈 INFP 治癒系詩人' },
      { id: 'completed-role', name: '🥉 測驗完成者' },
    ] } as Response).mockResolvedValueOnce({ ok: true, json: async () => [
      { id: 'new-role', name: '🎯 INTJ 戰略策劃家' },
      { id: 'old-role', name: '🌈 INFP 治癒系詩人' },
      { id: 'completed-role', name: '🥉 測驗完成者' },
    ] } as Response).mockResolvedValueOnce({ ok: true, json: async () => ({ roles: ['old-role'] }) } as Response);
    const { response, state } = res();
    await assignRole(req({ discordUserId: 'victim-discord', guildId: 'other-guild', mbtiType: 'INTJ-A' }, {}, method), response);
    expect(state.status).toBe(410);
    expect(fetch).not.toHaveBeenCalled();
  });
});
