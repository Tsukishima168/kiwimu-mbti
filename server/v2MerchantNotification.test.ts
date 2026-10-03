import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ order: vi.fn(), db: vi.fn() }));
vi.mock('./linePayOrderStore.js', () => ({ getLinePayOrder: mocks.order }));
vi.mock('./supabase/user-admin.js', () => ({ getUserAdminDb: mocks.db }));
import { buildMerchantPaymentMessage, isV2MerchantNotificationReady, sendV2MerchantNotification } from './v2MerchantNotification';

const ORDER_ID = `V2-ESTJ-A-1790932352889-${'a'.repeat(32)}`;
const CHANNEL = '123456789012345678';
const order = () => ({
  order_id: ORDER_ID, status: 'confirmed', mbti_type: 'ESTJ-A', amount: 49, currency: 'TWD',
  confirmed_at: '2026-10-02T09:20:00Z', created_at: '2026-10-02T09:15:00Z',
  user_uid: 'private-owner', source: 'private-source', request_response: { paymentUrl: 'private-payment-url' },
});
const stored = (status = 'pending', claimed_at: string | null = null) => ({
  order_id: ORDER_ID, channel_id: CHANNEL, payload: buildMerchantPaymentMessage(order()), status, claimed_at,
});
const responses: { data: any; error: any }[] = [];
const queries: { operation: string; payload?: any; filters: any[] }[] = [];
function table() {
  const q = { operation: '', payload: undefined as any, filters: [] as any[] };
  queries.push(q);
  const chain: any = {
    upsert(p: any, options: any) { q.operation = 'upsert'; q.payload = { p, options }; return chain; },
    update(p: any) { q.operation = 'update'; q.payload = p; return chain; },
    select() { return chain; }, limit() { return chain; },
    eq(k: string, v: unknown) { q.filters.push(['eq', k, v]); return chain; },
    neq(k: string, v: unknown) { q.filters.push(['neq', k, v]); return chain; },
    in(k: string, v: unknown) { q.filters.push(['in', k, v]); return chain; },
    or(value: string) { q.filters.push(['or', value]); return chain; },
    maybeSingle() { return chain; },
    then(resolve: any, reject: any) { return Promise.resolve(responses.shift() || { data: null, error: null }).then(resolve, reject); },
  };
  return chain;
}
const ok = (data: any = null) => ({ data, error: null });
beforeEach(() => {
  vi.clearAllMocks(); queries.length = 0; responses.length = 0;
  vi.stubEnv('DISCORD_TOKEN', 'test-bot-token'); vi.stubEnv('DISCORD_PAYMENT_CHANNEL_ID', CHANNEL);
  mocks.db.mockReturnValue({ schema: () => ({ from: table }) });
  mocks.order.mockResolvedValue(order());
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ id: '987654321098765432', channel_id: CHANNEL }) }));
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('merchant notifications', () => {
  it.each([49, 99])('reports the stored NT$%s payment without buyer identity or purchase proof', amount => {
    const message = buildMerchantPaymentMessage({ ...order(), amount });
    const serialized = JSON.stringify(message);
    expect(serialized).toContain(`NT$${amount}`);
    expect(serialized).toContain('KW-');
    for (const privateValue of [ORDER_ID, 'private-owner', 'private-source', 'private-payment-url']) expect(serialized).not.toContain(privateValue);
    expect(message.allowed_mentions).toEqual({ parse: [] });
    expect(message.nonce).toHaveLength(24);
    expect(message.enforce_nonce).toBe(true);
  });

  it.each(['created', 'requested', 'cancelled', 'confirm_failed', 'request_failed'])('does not send for %s orders', async status => {
    mocks.order.mockResolvedValue({ ...order(), status });
    expect(await sendV2MerchantNotification(ORDER_ID)).toBe('pending');
    expect(fetch).not.toHaveBeenCalled();
    expect(queries).toHaveLength(0);
  });

  it('requires an explicit merchant channel and a ready private delivery table', async () => {
    vi.stubEnv('DISCORD_PAYMENT_CHANNEL_ID', '');
    expect(await isV2MerchantNotificationReady()).toBe(false);
    expect(await sendV2MerchantNotification(ORDER_ID)).toBe('pending');
    expect(mocks.db).not.toHaveBeenCalled();
    vi.stubEnv('DISCORD_PAYMENT_CHANNEL_ID', CHANNEL);
    responses.push({ data: null, error: { code: 'MISSING_TABLE' } });
    expect(await isV2MerchantNotificationReady()).toBe(false);
    responses.push(ok());
    expect(await isV2MerchantNotificationReady()).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('claims one lease and persists the actual provider message', async () => {
    responses.push(ok(), ok(stored()), ok(stored('sending')), ok({ status: 'sent' }));
    expect(await sendV2MerchantNotification(ORDER_ID)).toBe('sent');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(queries[0].payload.options).toMatchObject({ ignoreDuplicates: true });
    expect(queries[2].filters).toContainEqual(['or', expect.stringContaining('and(status.eq.failed,claimed_at.lt.')]);
    expect(queries.at(-1)!.filters).toContainEqual(['eq', 'lease_id', expect.any(String)]);
    expect(queries.at(-1)!.payload).toMatchObject({ status: 'sent', provider_message_id: '987654321098765432' });
  });

  it.each(['sent', 'review'])('never reposts a persisted %s notification', async status => {
    responses.push(ok(), ok(stored(status)));
    expect(await sendV2MerchantNotification(ORDER_ID)).toBe(status);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not send when another callback wins the lease', async () => {
    responses.push(ok(), ok(stored()), ok(null));
    await sendV2MerchantNotification(ORDER_ID);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('keeps an active send and sends stale uncertain delivery to manual review', async () => {
    responses.push(ok(), ok(stored('sending', new Date().toISOString())));
    expect(await sendV2MerchantNotification(ORDER_ID)).toBe('sending');
    responses.push(ok(), ok(stored('sending', new Date(Date.now() - 120_000).toISOString())), ok());
    expect(await sendV2MerchantNotification(ORDER_ID)).toBe('review');
    expect(fetch).not.toHaveBeenCalled();
    expect(queries.at(-1)!.filters).toContainEqual(['eq', 'status', 'sending']);
  });

  it('does not automatically retry after transport uncertainty', async () => {
    responses.push(ok(), ok(stored()), ok(stored('sending')), ok());
    vi.mocked(fetch).mockRejectedValue(new Error('connection lost after send'));
    expect(await sendV2MerchantNotification(ORDER_ID)).toBe('review');
    expect(queries.at(-1)!.payload).toMatchObject({ status: 'review', error_code: 'DELIVERY_UNCERTAIN' });
    responses.push(ok(), ok(stored('review')));
    expect(await sendV2MerchantNotification(ORDER_ID)).toBe('review');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('does not advertise sent when the acknowledgement cannot be persisted', async () => {
    responses.push(ok(), ok(stored()), ok(stored('sending')), { data: null, error: { code: 'DB_UNAVAILABLE' } });
    expect(await sendV2MerchantNotification(ORDER_ID)).toBe('review');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('does not advertise sent when the conditional acknowledgement writes no row', async () => {
    responses.push(ok(), ok(stored()), ok(stored('sending')), ok(null));
    expect(await sendV2MerchantNotification(ORDER_ID)).toBe('review');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it.each([403, 429])('backs off a definite HTTP %s rejection', async status => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status, json: async () => ({ code: 50013 }) } as Response);
    responses.push(ok(), ok(stored()), ok(stored('sending')), ok({ status: 'failed' }));
    expect(await sendV2MerchantNotification(ORDER_ID)).toBe('failed');
    responses.push(ok(), ok(stored('failed', new Date().toISOString())));
    expect(await sendV2MerchantNotification(ORDER_ID)).toBe('failed');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it.each([{ ok: false, status: 502, result: {} }, { ok: true, status: 200, result: {} }])('requires review for an ambiguous provider acknowledgement %j', async value => {
    vi.mocked(fetch).mockResolvedValue({ ok: value.ok, status: value.status, json: async () => value.result } as Response);
    responses.push(ok(), ok(stored()), ok(stored('sending')), ok());
    expect(await sendV2MerchantNotification(ORDER_ID)).toBe('review');
  });

  it('keeps the original channel and payload when configuration later changes', async () => {
    vi.stubEnv('DISCORD_PAYMENT_CHANNEL_ID', '234567890123456789');
    responses.push(ok(), ok(stored()), ok(stored('sending')), ok());
    await sendV2MerchantNotification(ORDER_ID);
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe(`https://discord.com/api/v10/channels/${CHANNEL}/messages`);
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string)).toEqual(stored().payload);
  });
});
