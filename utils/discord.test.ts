import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { QuizNotificationInput } from '../shared/quizNotification';
const mocks = vi.hoisted(() => ({ client: vi.fn(), session: vi.fn() }));
vi.mock('./supabaseAuthBridge', () => ({ getAuthSupabaseClient: mocks.client }));
import { QUESTIONS } from '../constants';
import { V2_TAIWAN_QUESTIONS } from '../data/v2TaiwanQuestions.generated';
import { exploreTranslations } from '../i18n/exploreTranslations';
import { calculateExploreResult } from '../data/questions-explore';
import { quizResult } from '../server/quizCompletionNotification';

let api: typeof import('./discord');
let storage: Storage;
const ID = '11111111-1111-4111-8111-111111111111';
const request = (funnel: QuizNotificationInput['funnel'] = 'v1') => ({
  funnel, locale: 'zh' as const, answerIndices: Array(funnel === 'v1_5' ? 5 : 40).fill(0) as (0 | 1)[],
});
beforeEach(async () => {
  vi.useFakeTimers(); vi.resetModules(); vi.clearAllMocks();
  const values = new Map<string, string>();
  storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); },
    removeItem: key => { values.delete(key); }, clear: () => values.clear(), key: () => null, length: 0 };
  vi.stubGlobal('localStorage', storage);
  mocks.client.mockReturnValue({ auth: { getSession: mocks.session } });
  mocks.session.mockResolvedValue({ data: { session: null }, error: null });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 })));
  api = await import('./discord');
});
afterEach(async () => { vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it.each(['v1', 'v1_5', 'v2'] as const)('sends %s completion as an anonymous visitor with no identity data', async funnel => {
  api.queueQuizCompletionNotification(request(funnel), ID); await api.flushQuizNotifications();
  expect(fetch).toHaveBeenCalledOnce();
  const [path, options] = vi.mocked(fetch).mock.calls[0];
  expect(path).toBe('/api/notify-discord'); expect(options?.keepalive).toBe(true);
  expect(options?.headers).toEqual({ 'Content-Type': 'application/json' });
  expect(JSON.parse(String(options?.body))).toEqual({ completionId: ID, ...request(funnel) });
});
it('attaches only the bearer for a registered member, never account IDs', async () => {
  mocks.session.mockResolvedValue({ data: { session: { access_token: 'synthetic-session', user: { id: 'synthetic-user' } } }, error: null });
  api.queueQuizCompletionNotification(request(), ID); await api.flushQuizNotifications();
  expect(vi.mocked(fetch).mock.calls[0][1]?.headers).toMatchObject({ Authorization: 'Bearer synthetic-session' });
  expect(String(vi.mocked(fetch).mock.calls[0][1]?.body)).not.toContain('synthetic-user');
});
it.each([
  { data: { session: null }, error: null },
  { data: { session: { access_token: 'synthetic-anonymous-session', user: { is_anonymous: true } } }, error: null },
  { data: { session: null }, error: new Error('auth outage') },
])('permits unauthenticated completion without requiring Supabase login (%#)', async session => {
  mocks.session.mockResolvedValue(session); api.queueQuizCompletionNotification(request(), ID); await api.flushQuizNotifications();
  expect(fetch).toHaveBeenCalledOnce(); expect(vi.mocked(fetch).mock.calls[0][1]?.headers).not.toHaveProperty('Authorization');
});
it('keeps auth SDK failures and timeouts from blocking notifications/results', async () => {
  mocks.session.mockImplementation(() => new Promise(() => {}));
  expect(() => api.queueQuizCompletionNotification(request(), ID)).not.toThrow();
  await vi.advanceTimersByTimeAsync(1_001); await api.flushQuizNotifications(); expect(fetch).toHaveBeenCalledOnce();
});
it('keeps retry UUIDs stable after a transient failure', async () => {
  vi.mocked(fetch).mockRejectedValueOnce(new Error('offline'));
  api.queueQuizCompletionNotification(request(), ID); await api.flushQuizNotifications();
  expect(JSON.parse(storage.getItem('kiwimu_quiz_notifications_v1')!)).toHaveLength(1);
  await vi.advanceTimersByTimeAsync(2_001); await api.flushQuizNotifications();
  expect(vi.mocked(fetch).mock.calls.map(call => JSON.parse(String(call[1]?.body)).completionId)).toEqual([ID, ID]);
  expect(JSON.parse(storage.getItem('kiwimu_quiz_notifications_v1')!)).toHaveLength(0);
});
it('recovers persisted outbox across reload using its original UUID', async () => {
  vi.mocked(fetch).mockRejectedValueOnce(new Error('offline')); api.queueQuizCompletionNotification(request(), ID);
  await api.flushQuizNotifications(); vi.resetModules(); const reloaded = await import('./discord');
  await vi.advanceTimersByTimeAsync(2_001); await reloaded.flushQuizNotifications();
  expect(vi.mocked(fetch).mock.calls.every(call => JSON.parse(String(call[1]?.body)).completionId === ID)).toBe(true);
});
it.each([200, 202, 400, 403, 409])('does not retry terminal HTTP %i', async status => {
  vi.mocked(fetch).mockResolvedValue(new Response('{}', { status }));
  api.queueQuizCompletionNotification(request(), ID); await api.flushQuizNotifications(); await vi.advanceTimersByTimeAsync(5_000);
  expect(fetch).toHaveBeenCalledOnce();
});
it('falls back to anonymous when the provided session expired, with the same UUID', async () => {
  mocks.session.mockResolvedValue({ data: { session: { access_token: 'synthetic-expired-session', user: { id: 'synthetic-user' } } }, error: null });
  vi.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 401 }));
  api.queueQuizCompletionNotification(request(), ID); await api.flushQuizNotifications();
  const calls = vi.mocked(fetch).mock.calls; expect(calls).toHaveLength(2);
  expect(calls[1][1]?.headers).not.toHaveProperty('Authorization'); expect(calls[0][1]?.body).toBe(calls[1][1]?.body);
});
it('honors the rate-limit delay without retrying in a tight loop', async () => {
  vi.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 429, headers: { 'Retry-After': '3600' } }));
  api.queueQuizCompletionNotification(request(), ID); await api.flushQuizNotifications();
  await vi.advanceTimersByTimeAsync(60_000); expect(fetch).toHaveBeenCalledOnce();
  await vi.advanceTimersByTimeAsync(3_540_001); await api.flushQuizNotifications(); expect(fetch).toHaveBeenCalledTimes(2);
});
it('retains an in-progress completion until the provider rejection has been retried', async () => {
  vi.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 429, headers: { 'Retry-After': '30' } }))
    .mockResolvedValueOnce(new Response('{}', { status: 429, headers: { 'Retry-After': '2' } }));
  api.queueQuizCompletionNotification(request(), ID); await api.flushQuizNotifications();
  expect(JSON.parse(storage.getItem('kiwimu_quiz_notifications_v1')!)).toHaveLength(1);
  await vi.advanceTimersByTimeAsync(30_001); await api.flushQuizNotifications();
  expect(JSON.parse(storage.getItem('kiwimu_quiz_notifications_v1')!)).toHaveLength(1);
  await vi.advanceTimersByTimeAsync(2_001); await api.flushQuizNotifications();
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(JSON.parse(storage.getItem('kiwimu_quiz_notifications_v1')!)).toHaveLength(0);
});
it('supports storage-disabled visits without throwing', async () => {
  vi.stubGlobal('localStorage', { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } });
  api.queueQuizCompletionNotification(request(), ID); await api.flushQuizNotifications(); expect(fetch).toHaveBeenCalledOnce();
});
it('does not lose an entry when quota blocks writes but stale storage remains readable', async () => {
  vi.stubGlobal('localStorage', { getItem() { return '[]'; }, setItem() { throw new Error('QuotaExceededError'); } });
  api.queueQuizCompletionNotification(request(), ID); await api.flushQuizNotifications(); expect(fetch).toHaveBeenCalledOnce();
});
it('does not lose a new completion while an earlier one awaits the network', async () => {
  let done: (response: Response) => void = () => {};
  vi.mocked(fetch).mockImplementationOnce(() => new Promise(resolve => { done = resolve; }));
  api.queueQuizCompletionNotification(request(), ID);
  await vi.advanceTimersByTimeAsync(0);
  const next = '22222222-2222-4222-8222-222222222222'; api.queueQuizCompletionNotification(request('v2'), next);
  done(new Response('{}', { status: 200 })); await api.flushQuizNotifications();
  await vi.advanceTimersByTimeAsync(1); await api.flushQuizNotifications();
  expect(vi.mocked(fetch).mock.calls.map(call => JSON.parse(String(call[1]?.body)).completionId)).toEqual([ID, next]);
});
it('retires the old result-only caller to prevent duplicate V1 notifications', async () => {
  await api.sendDiscordNotification('INTJ', 'A', 'zh', undefined, { funnel: 'v1' }); expect(fetch).not.toHaveBeenCalled();
});

// Use the real shared completion caller, not a mirror of the new implementation.
it.each([['v1-40', 'v1', QUESTIONS], ['v2-tw-40', 'v2', V2_TAIWAN_QUESTIONS]] as const)(
  'queues %s notifications even if Economy rollout/storage is unavailable', async (quizVersion, funnel, bank) => {
    const events = await import('./economyEvents');
    vi.stubGlobal('localStorage', { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } });
    mocks.client.mockReturnValue(null);
    expect(events.queueMbtiCompleted({ answers: bank.map(q => q.options[0]), questionBank: bank, quizVersion })).toBeNull();
    await api.flushQuizNotifications(); expect(fetch).toHaveBeenCalledOnce();
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body))).toMatchObject({ funnel, answerIndices: Array(40).fill(0) });
  });
it('matches translated Explore A/B option order to server results for every state', () => {
  for (const locale of ['zh', 'en', 'ja', 'ko'] as const) for (const version of ['A', 'B'] as const) for (let mask = 0; mask < 32; mask++) {
    const quiz = exploreTranslations[locale].quizzes[version];
    const indices = quiz.questions.map((_, i) => ((mask >> i) & 1) as 0 | 1);
    const answers = Object.fromEntries(quiz.questions.map((q, i) => [q.id, q.options[indices[i]].value]));
    const result = calculateExploreResult(answers);
    expect(quizResult({ completionId: ID, funnel: 'v1_5', locale, answerIndices: indices })).toBe(`${result.mbtiType}-${result.suffix}`);
  }
});
it('uses the V1 language preference while keeping the Taiwan V2 quiz in zh', async () => {
  storage.setItem('kiwimu_language', 'ja'); mocks.client.mockReturnValue(null);
  const events = await import('./economyEvents');
  events.queueMbtiCompleted({ answers: QUESTIONS.map(q => q.options[0]), questionBank: QUESTIONS, quizVersion: 'v1-40' });
  await api.flushQuizNotifications();
  expect(JSON.parse(String(vi.mocked(fetch).mock.calls.find(call => call[0] === '/api/notify-discord')![1]?.body)).locale).toBe('ja');
});
