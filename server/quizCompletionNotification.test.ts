import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { QUESTIONS } from '../constants';
import { V2_TAIWAN_QUESTIONS } from '../data/v2TaiwanQuestions.generated';
import { calculateResults, getVariant } from '../utils/logic';
import { parseQuizNotification, type QuizNotificationInput } from '../shared/quizNotification';
const mocks = vi.hoisted(() => ({ db: vi.fn(), rpc: vi.fn(), persist: vi.fn(), identity: vi.fn() }));
vi.mock('./economy/supabaseAdmin.js', () => ({ getEconomyAdminClient: mocks.db }));
vi.mock('./v2Account.js', () => ({ getVerifiedV2User: mocks.identity }));
import notify from '../api/notify-discord';
import { buildQuizCompletionMessage, deliverQuizCompletion, getQuizNotificationConfig, quizClientHash, quizResult } from './quizCompletionNotification';

const ID = '11111111-1111-4111-8111-111111111111';
const CHANNEL = '1466020032310939823';
const input = (funnel: QuizNotificationInput['funnel'] = 'v1'): QuizNotificationInput => ({
  completionId: ID, funnel, locale: 'zh', answerIndices: Array(funnel === 'v1_5' ? 5 : 40).fill(0),
});
const headers = { host: 'kiwimu.com', origin: 'https://kiwimu.com', 'x-vercel-forwarded-for': '192.0.2.10' };
function request(body: unknown = input(), extra = {}, method = 'POST'): VercelRequest {
  return { method, headers: { ...headers, ...extra }, body } as unknown as VercelRequest;
}
function response() {
  const state = { status: 0, body: null as any };
  const res = { setHeader: vi.fn(), status(code: number) { state.status = code; return res; },
    json(body: unknown) { state.body = body; return res; } } as unknown as VercelResponse;
  return { state, res };
}
function db() {
  const chain: any = { update: vi.fn(() => chain), eq: vi.fn(() => chain), select: vi.fn(() => chain), maybeSingle: mocks.persist };
  return { schema: vi.fn(() => ({ rpc: mocks.rpc, from: vi.fn(() => chain) })) };
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('VERCEL_ENV', 'production');
  vi.stubEnv('DISCORD_BOT_TOKEN', 'synthetic-test-bot');
  vi.stubEnv('DISCORD_TOKEN', '');
  vi.stubEnv('DISCORD_CHANNEL_ID', CHANNEL);
  vi.stubEnv('DISCORD_DETAIL_CHANNEL_ID', ''); vi.stubEnv('DISCORD_EVENTS_CHANNEL_ID', '');
  mocks.db.mockReturnValue(db());
  mocks.rpc.mockResolvedValue({ data: { status: 'claimed', deliveredChannels: [] }, error: null });
  mocks.persist.mockResolvedValue({ data: { completion_id: ID }, error: null });
  mocks.identity.mockResolvedValue({ user: { id: 'synthetic-user', email: 'synthetic@example.invalid' } });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200,
    json: async () => ({ id: '1555794895313300000', channel_id: CHANNEL }) }));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('completion scoring matches actual quizzes', () => {
  for (let mask = 0; mask < 32; mask++) {
    const indices = Array.from({ length: 5 }, (_, i) => ((mask >> i) & 1) as 0 | 1);
    const expected = ['EI', 'SN', 'TF', 'JP'].map((pair, i) => pair[indices[i]]).join('') + '-' + 'AT'[indices[4]];
    it(`computes all three versions correctly for ${expected}`, () => {
      expect(quizResult({ ...input('v1_5'), answerIndices: indices })).toBe(expected);
      for (const [funnel, bank] of [['v1', QUESTIONS], ['v2', V2_TAIWAN_QUESTIONS]] as const) {
        const answers = bank.map((q, i) => q.options[indices[Math.floor(i / 8)]]);
        const { type, scores } = calculateResults(answers, bank);
        const calculated = `${type}-${getVariant(scores)}`;
        expect(calculated).toBe(expected);
        expect(quizResult({ ...input(funnel), answerIndices: bank.map((_, i) => indices[Math.floor(i / 8)]) })).toBe(calculated);
      }
    });
  }
  it('handles weighted mixed answers like both full quiz banks', () => {
    for (const [funnel, bank] of [['v1', QUESTIONS], ['v2', V2_TAIWAN_QUESTIONS]] as const) {
      for (let shift = 0; shift < 40; shift++) {
        const indices = bank.map((_, i) => ((i + shift) % 3 === 0 ? 0 : 1) as 0 | 1);
        const { type, scores } = calculateResults(bank.map((q, i) => q.options[indices[i]]), bank);
        expect(quizResult({ ...input(funnel), answerIndices: indices })).toBe(`${type}-${getVariant(scores)}`);
      }
    }
  });
});

describe('strict notification contract', () => {
  it.each([null, [], {}, { resultType: 'INTJ-A' }, { ...input(), funnel: 'paid' }, { ...input(), locale: '@everyone' },
    { ...input(), completionId: 'broken' }, { ...input(), answerIndices: [0] }, { ...input(), answerIndices: Array(40).fill(2) },
    { ...input(), amount: 99 }, { ...input(), userId: 'another-user' }])('rejects malformed/privileged input (%#)', value => {
    expect(parseQuizNotification(value)).toBeNull();
  });
  it('canonicalizes UUID casing and input key order', () => {
    const canonical = input();
    expect(parseQuizNotification({ answerIndices: canonical.answerIndices, locale: 'zh', funnel: 'v1', completionId: ID.toUpperCase() })).toEqual(canonical);
  });
  it.each(['zh', 'en', 'ja', 'ko'] as const)('only bounded %s template data reaches Discord', locale => {
    const payload = buildQuizCompletionMessage({ ...input(), locale }, false, CHANNEL);
    expect(payload.allowed_mentions).toEqual({ parse: [] });
    expect(payload.enforce_nonce).toBe(true);
    expect(payload.nonce).toHaveLength(24);
    expect(JSON.stringify(payload)).not.toMatch(/synthetic-user|example.invalid|192\.0\.2|answerIndices|completionId/);
    expect(JSON.stringify(payload)).toContain('未登入訪客');
    expect(JSON.stringify(payload)).toContain('不代表付款或新增會員');
  });
});

describe('endpoint authorization and delivery', () => {
  it.each(['v1', 'v1_5', 'v2'] as const)('delivers anonymous %s without logging in or duplicating the fallback channel', async funnel => {
    const { res, state } = response();
    await notify(request(input(funnel)), res);
    expect(state).toMatchObject({ status: 200, body: { ok: true, status: 'sent' } });
    expect(mocks.identity).not.toHaveBeenCalled(); expect(fetch).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenCalledWith('claim_quiz_completion_notification', {
      p_completion_id: ID, p_client_hash: expect.stringMatching(/^[a-f0-9]{64}$/), p_evidence_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
  });
  it('uses verified membership only, without disclosing customer identity', async () => {
    const { res, state } = response(); await notify(request(input(), { authorization: 'Bearer synthetic-session' }), res);
    expect(state.status).toBe(200); expect(mocks.identity).toHaveBeenCalledOnce();
    const body = String(vi.mocked(fetch).mock.calls[0][1]?.body);
    expect(body).toContain('已登入會員'); expect(body).not.toContain('synthetic-user'); expect(body).not.toContain('example.invalid');
  });
  it.each([['AUTH_REQUIRED', 401], ['AUTH_UNAVAILABLE', 503]] as const)('fails closed for provided bearer: %s', async (code, status) => {
    mocks.identity.mockResolvedValue({ code }); const { res, state } = response();
    await notify(request(input(), { authorization: 'Bearer bad-session' }), res);
    expect(state.status).toBe(status); expect(mocks.rpc).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
  });
  it.each(['preview', 'development', ''])('disables delivery on %s despite configured bot credentials', async env => {
    vi.stubEnv('VERCEL_ENV', env); const { res, state } = response(); await notify(request(), res);
    expect(state.status).toBe(202); expect(mocks.db).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
  });
  it.each([
    { origin: 'https://other.invalid' }, { origin: '' }, { origin: 'http://kiwimu.com' },
    { host: 'preview.vercel.app', origin: 'https://preview.vercel.app' },
    { origin: 'https://kiwimu.com', host: 'hostile.invalid', 'x-forwarded-host': 'kiwimu.com' },
    { 'sec-fetch-site': 'cross-site' },
  ])('rejects unsafe origin/host (%#)', async extra => {
    const { res, state } = response(); await notify(request(input(), extra), res);
    expect(state.status).toBe(403); expect(fetch).not.toHaveBeenCalled(); expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it.each(['', 'not-an-IP', '192.0.2.1, 192.0.2.2'])('fails closed if trusted IP is %s', async ip => {
    const { res, state } = response(); await notify(request(input(), { 'x-vercel-forwarded-for': ip }), res);
    expect(state.status).toBe(503); expect(fetch).not.toHaveBeenCalled(); expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it('does not use client spoofable headers as an IP fallback', () => {
    expect(quizClientHash(request(input(), { 'x-vercel-forwarded-for': '', 'x-forwarded-for': '192.0.2.30' }), 'synthetic')).toBeNull();
    expect(quizClientHash(request(input(), { 'x-vercel-forwarded-for': '2001:db8::1' }), 'synthetic')).toMatch(/^[a-f0-9]{64}$/);
  });
  it('limits body size before DB/delivery', async () => {
    const { res, state } = response(); await notify(request({ ...input(), extra: 'a'.repeat(5_000) }), res);
    expect(state.status).toBe(413); expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it.each(['GET', 'HEAD', 'OPTIONS', 'DELETE'])('refuses %s without notification side effects', async method => {
    const { res, state } = response(); await notify(request(input(), {}, method), res);
    expect(state.status).toBe(405); expect(fetch).not.toHaveBeenCalled(); expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it.each([['duplicate', 200], ['conflict', 409], ['limited', 429]] as const)('never sends when DB returns %s', async (data, status) => {
    mocks.rpc.mockResolvedValue({ data: { status: data }, error: null }); const { res, state } = response(); await notify(request(), res);
    expect(state.status).toBe(status); expect(fetch).not.toHaveBeenCalled();
  });
  it.each([null, { code: 'DB_UNAVAILABLE' }])('never sends without durable reservation (%#)', async error => {
    mocks.rpc.mockResolvedValue({ data: null, error }); const { res, state } = response(); await notify(request(), res);
    expect(state.status).toBe(503); expect(fetch).not.toHaveBeenCalled();
  });
  it('returns review on an uncertain send, and does not auto retry its reservation', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('synthetic-network-failure'));
    const { res, state } = response(); await notify(request(), res);
    expect(state).toMatchObject({ status: 202, body: { status: 'review' } });
    mocks.rpc.mockResolvedValue({ data: { status: 'duplicate' }, error: null }); await notify(request(), response().res);
    expect(fetch).toHaveBeenCalledOnce();
  });
  it.each([{ id: '1555794895313300000', channel_id: 'other-channel' }, { id: 'not-an-id', channel_id: CHANNEL }])('rejects incorrect provider receipts (%#)', async body => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, status: 200, json: async () => body } as Response);
    const { res, state } = response(); await notify(request(), res);
    expect(state.body.status).toBe('review');
  });
  it('does not resend a successful summary when detail delivery fails', async () => {
    vi.stubEnv('DISCORD_DETAIL_CHANNEL_ID', '1555794895313300001');
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ id: '1555794895313300000', channel_id: CHANNEL }) } as Response)
      .mockRejectedValueOnce(new Error('detail timeout'));
    const { res, state } = response(); await notify(request(), res); expect(state.body.status).toBe('review');
    const bodies = vi.mocked(fetch).mock.calls.map(call => JSON.parse(String(call[1]?.body)));
    expect(bodies[0].nonce).not.toBe(bodies[1].nonce);
    mocks.rpc.mockResolvedValue({ data: { status: 'duplicate' }, error: null }); await notify(request(), response().res);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('treats persistence failure after send as review', async () => {
    mocks.persist.mockResolvedValue({ data: null, error: { code: 'DB_UNAVAILABLE' } });
    expect(await deliverQuizCompletion(input(), false, 'a'.repeat(64), getQuizNotificationConfig()!)).toEqual({ status: 'review' });
  });
  it('honors Discord 429 and retries only channels not already accepted', async () => {
    const detail = '1555794895313300001';
    vi.stubEnv('DISCORD_DETAIL_CHANNEL_ID', detail);
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ id: '1555794895313300000', channel_id: CHANNEL }) } as Response)
      .mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({ retry_after: 2.5 }) } as Response);
    const { res, state } = response(); await notify(request(), res);
    expect(state.status).toBe(429); expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '3');
    mocks.rpc.mockResolvedValueOnce({ data: { status: 'retry', retryAfter: 2 }, error: null });
    await notify(request(), response().res); expect(fetch).toHaveBeenCalledTimes(2);
    mocks.rpc.mockResolvedValueOnce({ data: { status: 'claimed', deliveredChannels: [CHANNEL] }, error: null });
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ id: '1555794895313300002', channel_id: detail }) } as Response);
    const next = response(); await notify(request(), next.res);
    expect(next.state.body.status).toBe('sent'); expect(fetch).toHaveBeenCalledTimes(3);
    expect(String(vi.mocked(fetch).mock.calls[2][0])).toContain(detail);
  });
  it('uses the already configured private payment channel when no quiz channel is set', () => {
    vi.stubEnv('DISCORD_CHANNEL_ID', ''); vi.stubEnv('DISCORD_PAYMENT_CHANNEL_ID', '1555794895313300003');
    expect(getQuizNotificationConfig()?.channels).toEqual(['1555794895313300003']);
  });
});
