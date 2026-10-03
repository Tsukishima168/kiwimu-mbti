import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ client: vi.fn(), session: vi.fn() }));
vi.mock('./supabaseAuthBridge', () => ({ getAuthSupabaseClient: mocks.client }));
import { sendDiscordNotification } from './discord';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.client.mockReturnValue({ auth: { getSession: mocks.session } });
  mocks.session.mockResolvedValue({ data: { session: { access_token: 'mock-session-token', user: { id: 'current-account' } } }, error: null });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('quiz Discord caller', () => {
  it('sends the account bearer with only canonical type, locale and funnel', async () => {
    await sendDiscordNotification('INTJ', 'A', 'ja', 'current-account', {
      funnel: 'v1', personalityNameOverride: '@everyone client text', userId: 'victim-account',
      path: '/private', sessionId: 'private-session', source: 'untrusted-source',
    });
    expect(fetch).toHaveBeenCalledOnce();
    expect(vi.mocked(fetch).mock.calls[0]).toEqual(['/api/notify-discord', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer mock-session-token' },
      body: JSON.stringify({ resultType: 'INTJ-A', locale: 'ja', metadata: { funnel: 'v1' } }),
    }]);
  });

  it.each([
    { data: { session: null }, error: null },
    { data: { session: { access_token: 'anonymous-token', user: { is_anonymous: true } } }, error: null },
    { data: { session: { access_token: '', user: { id: 'current-account' } } }, error: null },
    { data: { session: { access_token: 'expired-token', user: { id: 'current-account' } } }, error: new Error('auth unavailable') },
  ])('skips unavailable or anonymous sessions without blocking the free quiz (%#)', async session => {
    mocks.session.mockResolvedValue(session);
    await expect(sendDiscordNotification('INTJ', 'A')).resolves.toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('skips a quiz callback for a previous account', async () => {
    await sendDiscordNotification('INTJ', 'A', 'zh', 'previous-account');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('supports the explore caller with no app UID when an account session exists', async () => {
    await sendDiscordNotification('ENFP', 'T', 'zh', undefined, { funnel: 'v1_5' });
    expect(fetch).toHaveBeenCalledOnce();
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body))).toEqual({ resultType: 'ENFP-T', locale: 'zh', metadata: { funnel: 'v1_5' } });
  });

  it('keeps session and delivery failures from throwing into quiz completion', async () => {
    mocks.session.mockRejectedValueOnce(new Error('session unavailable'));
    await expect(sendDiscordNotification('INTJ', 'A')).resolves.toBeUndefined();
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('offline'));
    await expect(sendDiscordNotification('INTJ', 'A')).resolves.toBeUndefined();
  });

  it('does not read or forward an external error payload', async () => {
    const json = vi.fn();
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 503, json } as unknown as Response);
    await sendDiscordNotification('INTJ', 'A');
    expect(json).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenLastCalledWith('Discord notification failed:', 503);
  });
});
