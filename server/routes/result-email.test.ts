import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
const mocks = vi.hoisted(() => ({ identity: vi.fn() }));
vi.mock('../v2Account.js', () => ({ getVerifiedV2User: mocks.identity }));
import handler from './result-email';

function req(body: unknown = { mbtiType: 'ESTJ', variant: 'A' }, headers = { host: 'kiwimu.com', origin: 'https://kiwimu.com' }) {
  return { method: 'POST', headers, body } as VercelRequest;
}
function res() {
  const state = { status: 0, body: null as any };
  const response = { setHeader: vi.fn(), status(code: number) { state.status = code; return response; }, json(body: unknown) { state.body = body; return response; } } as unknown as VercelResponse;
  return { response, state };
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.identity.mockResolvedValue({ user: { id: 'buyer-id', email: 'buyer@example.com', email_confirmed_at: '2026-10-01' } });
  vi.stubEnv('RESEND_API_KEY', 'fake-test-key');
  vi.stubEnv('EMAIL_FROM', 'Kiwimu <reports@example.com>');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'test-id' }) }));
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('result email recipient and content', () => {
  it('uses the verified account and server template, ignoring arbitrary mail fields', async () => {
    const { response, state } = res();
    await handler(req({ mbtiType: 'ESTJ', variant: 'A', to: 'victim@example.com', subject: 'malicious', html: '<script>evil</script>' }), response);
    expect(state.status).toBe(200);
    const options = vi.mocked(fetch).mock.calls[0][1]!;
    const payload = JSON.parse(String(options.body));
    expect(payload.to).toEqual(['buyer@example.com']);
    expect(payload.subject).toBe('你的 Kiwimu 測驗結果：ESTJ-A');
    expect(payload.html).toBeUndefined();
    expect(payload.text).toContain('https://kiwimu.com/read/library');
    expect(JSON.stringify(payload)).not.toMatch(/victim|malicious|script/);
    expect((options.headers as Record<string, string>)['Idempotency-Key']).toMatch(/^quiz-result\/[a-f0-9]{64}$/);
  });
  it('rejects the old arbitrary mail contract', async () => {
    const { response, state } = res();
    await handler(req({ to: 'victim@example.com', subject: 'anything', text: 'anything' }), response);
    expect(state.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('rejects anonymous requests', async () => {
    mocks.identity.mockResolvedValue({ code: 'AUTH_REQUIRED' });
    const { response, state } = res();
    await handler(req(), response);
    expect(state.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('rejects cross-site requests before checking credentials', async () => {
    const { response, state } = res();
    await handler(req(undefined, { host: 'kiwimu.com', origin: 'https://other.example' }), response);
    expect(state.status).toBe(403);
    expect(mocks.identity).not.toHaveBeenCalled();
  });
  it('requires a configured sender without falling back to a testing address', async () => {
    vi.stubEnv('EMAIL_FROM', '');
    const { response, state } = res();
    await handler(req(), response);
    expect(state.status).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('does not send to an unverified email', async () => {
    mocks.identity.mockResolvedValue({ user: { id: 'buyer-id', email: 'buyer@example.com' } });
    const { response, state } = res();
    await handler(req(), response);
    expect(state.status).toBe(422);
    expect(fetch).not.toHaveBeenCalled();
  });
});
