import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ getOrder: vi.fn(), getUserById: vi.fn(), db: vi.fn() }));
vi.mock('./linePayOrderStore.js', () => ({ getLinePayOrder: mocks.getOrder }));
vi.mock('./supabase/user-admin.js', () => ({ getUserAdminDb: mocks.db }));
import { buildPaymentReceiptEmail, paymentReceiptReference, sendV2PaymentReceipt, type PaymentReceipt } from './v2PaymentReceipt';

const ORDER_ID = `V2-ESTJ-A-1790932352889-${'a'.repeat(32)}`;
const storedReceipt = (): PaymentReceipt => ({
  order_id: ORDER_ID, reference: paymentReceiptReference(ORDER_ID), user_uid: 'buyer',
  recipient: 'buyer@example.com', sender: 'Kiwimu <reports@example.com>',
  mbti_type: 'ESTJ-A', amount: 49, currency: 'TWD', paid_at: '2026-10-02T09:20:00Z', status: 'pending', first_attempt_at: null,
});
const responses: { data: any; error: any }[] = [];
const queries: { operation: string; payload?: any; filters: any[] }[] = [];
function table() {
  const q = { operation: '', payload: undefined as any, filters: [] as any[] };
  queries.push(q);
  const chain: any = {
    upsert(p: any, options: any) { q.operation = 'upsert'; q.payload = { p, options }; return chain; },
    update(p: any) { q.operation = 'update'; q.payload = p; return chain; },
    select() { return chain; },
    eq(k: string, v: unknown) { q.filters.push(['eq', k, v]); return chain; },
    neq(k: string, v: unknown) { q.filters.push(['neq', k, v]); return chain; },
    or(filter: string) { q.filters.push(['or', filter]); return chain; },
    maybeSingle() { return chain; },
    then(resolve: any, reject: any) { return Promise.resolve(responses.shift() || { data: null, error: null }).then(resolve, reject); },
  };
  return chain;
}
beforeEach(() => {
  vi.clearAllMocks(); queries.length = 0; responses.length = 0;
  vi.stubEnv('RESEND_API_KEY', 'test-key'); vi.stubEnv('EMAIL_FROM', 'Kiwimu <reports@example.com>');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ id: 'email-1' }) }));
  mocks.db.mockReturnValue({ schema: () => ({ from: table }), auth: { admin: { getUserById: mocks.getUserById } } });
  mocks.getOrder.mockResolvedValue({ order_id: ORDER_ID, status: 'confirmed', user_uid: 'buyer', mbti_type: 'ESTJ-A', amount: 49, currency: 'TWD', confirmed_at: '2026-10-02T09:20:00Z' });
  mocks.getUserById.mockResolvedValue({ data: { user: { id: 'buyer', email: 'buyer@example.com', email_confirmed_at: '2026-10-01T00:00:00Z' } }, error: null });
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('payment notification safety and delivery', () => {
  it('sends an account login link and display reference without leaking a payment proof', () => {
    const message = buildPaymentReceiptEmail(storedReceipt());
    expect(message.text).toContain('NT$49');
    expect(message.html).toContain('https://kiwimu.com/read/ESTJ-A');
    expect(message.html).toContain('https://kiwimu.com/read/library');
    expect(message.text).toContain('同一個帳號登入');
    expect(JSON.stringify(message)).not.toContain(ORDER_ID);
    expect(JSON.stringify(message)).not.toContain('unlock=');
  });

  it.each([{ status: 'requested', user_uid: 'buyer' }, { status: 'confirmed', user_uid: null }])('does not send for unpaid or anonymous purchases', async values => {
    mocks.getOrder.mockResolvedValue(values);
    expect(await sendV2PaymentReceipt(ORDER_ID)).toBe('pending');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not use an unverified email or test sender fallback', async () => {
    vi.stubEnv('EMAIL_FROM', '');
    expect(await sendV2PaymentReceipt(ORDER_ID)).toBe('pending');
    expect(fetch).not.toHaveBeenCalled();
    vi.stubEnv('EMAIL_FROM', 'Kiwimu <reports@example.com>');
    mocks.getUserById.mockResolvedValue({ data: { user: { id: 'buyer', email: 'buyer@example.com', email_confirmed_at: null } } });
    expect(await sendV2PaymentReceipt(ORDER_ID)).toBe('pending');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('claims one delivery lease, uses a stable provider idempotency key and persists sent', async () => {
    responses.push({ data: null, error: null }, { data: storedReceipt(), error: null }, { data: storedReceipt(), error: null }, { data: null, error: null });
    expect(await sendV2PaymentReceipt(ORDER_ID)).toBe('sent');
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, options] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect((options!.headers as any)['Idempotency-Key']).toBe(`v2-payment-receipt/${paymentReceiptReference(ORDER_ID)}`);
    expect(JSON.parse(options!.body as string).to).toEqual(['buyer@example.com']);
    expect(queries[0].payload.options.ignoreDuplicates).toBe(true);
    expect(queries.at(-1)!.payload.status).toBe('sent');
    expect(queries.at(-1)!.filters).toContainEqual(['eq', 'lease_id', expect.any(String)]);
  });

  it('never sends a persisted sent receipt again, even after the provider 24h window', async () => {
    responses.push({ data: null, error: null }, { data: { ...storedReceipt(), status: 'sent', first_attempt_at: '2026-01-01T00:00:00Z' }, error: null });
    expect(await sendV2PaymentReceipt(ORDER_ID)).toBe('sent');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not send when another callback holds the active lease', async () => {
    responses.push({ data: null, error: null }, { data: storedReceipt(), error: null }, { data: null, error: null });
    await sendV2PaymentReceipt(ORDER_ID);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('records provider failure without throwing or modifying the confirmed order', async () => {
    responses.push({ data: null, error: null }, { data: storedReceipt(), error: null }, { data: storedReceipt(), error: null }, { data: null, error: null });
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 429, json: async () => ({ message: 'rate limited' }) } as Response);
    expect(await sendV2PaymentReceipt(ORDER_ID)).toBe('failed');
    expect(queries.at(-1)!.payload).toMatchObject({ status: 'failed', error_code: 'RESEND_HTTP_429' });
  });

  it('retains uncertain failures for retry without throwing into the payment flow', async () => {
    responses.push({ data: null, error: null }, { data: storedReceipt(), error: null }, { data: storedReceipt(), error: null }, { data: null, error: null });
    vi.mocked(fetch).mockRejectedValue(new Error('connection lost'));
    expect(await sendV2PaymentReceipt(ORDER_ID)).toBe('failed');
    expect(queries.at(-1)!.payload.error_code).toBe('SEND_UNCERTAIN');
  });

  it('requests review instead of duplicating an uncertain receipt after 24h', async () => {
    responses.push({ data: null, error: null }, { data: { ...storedReceipt(), status: 'sending', first_attempt_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString() }, error: null }, { data: null, error: null });
    expect(await sendV2PaymentReceipt(ORDER_ID)).toBe('review');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not overwrite a recipient snapshot when the auth account email changes', async () => {
    mocks.getUserById.mockResolvedValue({ data: { user: { id: 'buyer', email: 'new@example.com', email_confirmed_at: '2026-10-01T00:00:00Z' } } });
    responses.push({ data: null, error: null }, { data: storedReceipt(), error: null }, { data: storedReceipt(), error: null }, { data: null, error: null });
    await sendV2PaymentReceipt(ORDER_ID);
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string).to).toEqual(['buyer@example.com']);
  });
});
