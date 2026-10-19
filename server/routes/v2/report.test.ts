import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';

const mocks = vi.hoisted(() => ({
  getLinePayOrder: vi.fn(),
  hasConfirmedLinePayOrderForUser: vi.fn(),
  getUserAdminDb: vi.fn(),
  hasV2PromoUnlock: vi.fn(),
}));

vi.mock('../../linePayOrderStore.js', () => ({
  getLinePayOrder: mocks.getLinePayOrder,
  hasConfirmedLinePayOrderForUser: mocks.hasConfirmedLinePayOrderForUser,
}));
vi.mock('../../supabase/user-admin.js', () => ({
  getUserAdminDb: mocks.getUserAdminDb,
}));
// The free-promo table is a separate store; paid-path cases below see "no promo grant".
vi.mock('../../v2PromoStore.js', () => ({
  hasV2PromoUnlock: mocks.hasV2PromoUnlock,
}));

import handler from './report';

const ORDER_ID = `V2-ESTJ-A-1788920000000-${'a'.repeat(32)}`;

function request(overrides: Partial<VercelRequest> = {}): VercelRequest {
  return {
    method: 'POST',
    headers: {
      origin: 'https://kiwimu.com',
      host: 'kiwimu.com',
      'sec-fetch-site': 'same-origin',
      'x-v2-order-id': ORDER_ID,
    },
    body: { mbtiType: 'ESTJ-A' },
    ...overrides,
  } as unknown as VercelRequest;
}

function response() {
  const state: { status?: number; body?: unknown; headers: Record<string, unknown> } = { headers: {} };
  const res = {
    setHeader(name: string, value: unknown) { state.headers[name] = value; return res; },
    status(code: number) { state.status = code; return res; },
    json(body: unknown) { state.body = body; return res; },
  } as unknown as VercelResponse;
  return { res, state };
}

function verifiedAccountRequest(headers: VercelRequest['headers'] = {}) {
  mocks.getUserAdminDb.mockReturnValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }) },
  });
  return request({
    headers: { host: 'kiwimu.com', origin: 'https://kiwimu.com', authorization: 'Bearer valid-token', ...headers },
  });
}

describe('POST /api/v2/report', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getLinePayOrder.mockResolvedValue(null);
    mocks.getUserAdminDb.mockReturnValue(null);
    mocks.hasConfirmedLinePayOrderForUser.mockResolvedValue(false);
    mocks.hasV2PromoUnlock.mockResolvedValue(false);
  });

  it('returns the purchased report and its A/T counterpart for a matching confirmed order', async () => {
    mocks.getLinePayOrder.mockResolvedValue({
      order_id: ORDER_ID,
      mbti_type: 'ESTJ-A',
      status: 'confirmed',
    });
    const { res, state } = response();

    await handler(request(), res);

    expect(state.status).toBe(200);
    expect(state.headers['Cache-Control']).toBe('private, no-store, max-age=0');
    expect(state.body).toMatchObject({
      ok: true,
      data: {
        report: { fullCode: 'ESTJ-A' },
        oppositeReport: { fullCode: 'ESTJ-T' },
      },
    });
  });

  it.each([
    { order: undefined, status: 503, code: 'STORE_UNAVAILABLE' },
    { order: null, status: 403, code: 'ENTITLEMENT_REQUIRED' },
  ])('classifies an anonymous order lookup as $code without report data or clearing its proof', async ({ order, status, code }) => {
    mocks.getLinePayOrder.mockResolvedValue(order);
    const { res, state } = response();
    await handler(request({ headers: {
      host: 'kiwimu.com', origin: 'https://kiwimu.com', cookie: `__Host-kiwimu-v2-order=${ORDER_ID}`,
    } }), res);

    expect(state.status).toBe(status);
    expect(state.body).toEqual({ ok: false, code });
    expect(state.headers['Set-Cookie']).toBeUndefined();
    expect(mocks.getLinePayOrder).toHaveBeenCalledWith(ORDER_ID);
    expect(mocks.hasConfirmedLinePayOrderForUser).not.toHaveBeenCalled();
  });

  it('recovers an anonymous purchased report after its order store becomes available', async () => {
    mocks.getLinePayOrder.mockResolvedValueOnce(undefined).mockResolvedValueOnce({
      order_id: ORDER_ID, mbti_type: 'ESTJ-A', status: 'confirmed', user_uid: null,
    });
    const anonymousRequest = request({ headers: {
      host: 'kiwimu.com', origin: 'https://kiwimu.com', cookie: `__Host-kiwimu-v2-order=${ORDER_ID}`,
    } });
    const unavailable = response();
    await handler(anonymousRequest, unavailable.res);

    expect(unavailable.state.status).toBe(503);
    expect(unavailable.state.body).toEqual({ ok: false, code: 'STORE_UNAVAILABLE' });
    expect(unavailable.state.headers['Set-Cookie']).toBeUndefined();

    const retry = response();
    await handler(anonymousRequest, retry.res);
    expect(retry.state.status).toBe(200);
    expect(retry.state.body).toMatchObject({ ok: true, data: { report: { fullCode: 'ESTJ-A' } } });
    expect(mocks.getLinePayOrder).toHaveBeenCalledTimes(2);
    expect(mocks.hasConfirmedLinePayOrderForUser).not.toHaveBeenCalled();
  });

  it('does not let one order read another MBTI report', async () => {
    mocks.getLinePayOrder.mockResolvedValue({
      order_id: ORDER_ID,
      mbti_type: 'ESTJ-A',
      status: 'confirmed',
    });
    const { res, state } = response();

    await handler(request({ body: { mbtiType: 'INFJ-A' } }), res);

    expect(state.status).toBe(403);
    expect(state.body).toMatchObject({ code: 'ENTITLEMENT_REQUIRED' });
  });

  it('opens the purchased report on a new device using only the authenticated account', async () => {
    mocks.getUserAdminDb.mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }) },
    });
    mocks.hasConfirmedLinePayOrderForUser.mockResolvedValue(true);
    const { res, state } = response();
    await handler(request({ headers: { host: 'kiwimu.com', origin: 'https://kiwimu.com', authorization: 'Bearer valid-token' } }), res);
    expect(state.status).toBe(200);
    expect(mocks.hasConfirmedLinePayOrderForUser).toHaveBeenCalledWith('user-1', 'ESTJ-A');
    expect(mocks.getLinePayOrder).not.toHaveBeenCalled();
  });

  it.each([{}, { cookie: `__Host-kiwimu-v2-order=${ORDER_ID}` }])('returns a retryable store failure without report data when the account purchase lookup is unavailable (%j)', async (headers) => {
    mocks.hasConfirmedLinePayOrderForUser.mockResolvedValue(undefined);
    mocks.getLinePayOrder.mockResolvedValue({ order_id: ORDER_ID, mbti_type: 'ESTJ-A', status: 'confirmed' });
    const { res, state } = response();

    await handler(verifiedAccountRequest(headers), res);

    expect(state.status).toBe(503);
    expect(state.body).toEqual({ ok: false, code: 'STORE_UNAVAILABLE' });
    expect(mocks.hasConfirmedLinePayOrderForUser).toHaveBeenCalledWith('user-1', 'ESTJ-A');
    expect(mocks.getLinePayOrder).not.toHaveBeenCalled();
  });

  it('recovers the purchased report when a retry can verify the account purchase', async () => {
    mocks.hasConfirmedLinePayOrderForUser.mockResolvedValueOnce(undefined).mockResolvedValueOnce(true);
    const accountRequest = verifiedAccountRequest();
    const unavailable = response();
    await handler(accountRequest, unavailable.res);

    expect(unavailable.state.status).toBe(503);
    expect(unavailable.state.body).toEqual({ ok: false, code: 'STORE_UNAVAILABLE' });

    const retry = response();
    await handler(accountRequest, retry.res);
    expect(retry.state.status).toBe(200);
    expect(retry.state.body).toMatchObject({ ok: true, data: { report: { fullCode: 'ESTJ-A' } } });
    expect(mocks.hasConfirmedLinePayOrderForUser).toHaveBeenCalledTimes(2);
    expect(mocks.getLinePayOrder).not.toHaveBeenCalled();
  });

  it('denies an account with no confirmed purchase and no anonymous order proof', async () => {
    const { res, state } = response();
    await handler(verifiedAccountRequest(), res);

    expect(state.status).toBe(403);
    expect(state.body).toEqual({ ok: false, code: 'ENTITLEMENT_REQUIRED' });
    expect(mocks.getLinePayOrder).not.toHaveBeenCalled();
  });

  it.each([
    { label: 'missing admin client', error: null, missingAdmin: true },
    { label: 'auth network failure', error: new AuthRetryableFetchError('network failure', 0) },
    { label: 'auth service unavailable', error: new AuthRetryableFetchError('unavailable', 503) },
    { label: 'auth API server failure', error: new AuthApiError('server error', 500, undefined) },
  ])('returns a retryable failure for $label without falling back to order proof', async ({ error, missingAdmin }) => {
    mocks.getUserAdminDb.mockReturnValue(missingAdmin ? null : {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error }) },
    });
    const { res, state } = response();
    await handler(request({ headers: {
      host: 'kiwimu.com', origin: 'https://kiwimu.com', authorization: 'Bearer valid-token',
      cookie: `__Host-kiwimu-v2-order=${ORDER_ID}`,
    } }), res);
    expect(state.status).toBe(503);
    expect(state.body).toEqual({ ok: false, code: 'STORE_UNAVAILABLE' });
    expect(state.headers['Set-Cookie']).toBeUndefined();
    expect(mocks.getLinePayOrder).not.toHaveBeenCalled();
    expect(mocks.hasConfirmedLinePayOrderForUser).not.toHaveBeenCalled();
  });

  it('keeps an invalid auth token denied instead of reporting a temporary service failure', async () => {
    mocks.getUserAdminDb.mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new AuthApiError('invalid token', 401, undefined) }) },
    });
    const { res, state } = response();
    await handler(request({ headers: {
      host: 'kiwimu.com', origin: 'https://kiwimu.com', authorization: 'Bearer invalid-token',
    } }), res);
    expect(state.status).toBe(403);
    expect(state.body).toEqual({ ok: false, code: 'ENTITLEMENT_REQUIRED' });
    expect(mocks.hasConfirmedLinePayOrderForUser).not.toHaveBeenCalled();
  });

  it('does not unlock another account-bound order after a negative account purchase lookup', async () => {
    mocks.getLinePayOrder.mockResolvedValue({ order_id: ORDER_ID, mbti_type: 'ESTJ-A', status: 'confirmed', user_uid: 'user-2' });
    const { res, state } = response();
    await handler(verifiedAccountRequest({ cookie: `__Host-kiwimu-v2-order=${ORDER_ID}` }), res);

    expect(state.status).toBe(403);
    expect(state.body).toEqual({ ok: false, code: 'ENTITLEMENT_REQUIRED' });
  });

  it('does not keep account-bound content open through a cookie after logout', async () => {
    mocks.getLinePayOrder.mockResolvedValue({ order_id: ORDER_ID, mbti_type: 'ESTJ-A', status: 'confirmed', user_uid: 'user-1' });
    const { res, state } = response();
    await handler(request(), res);
    expect(state.status).toBe(403);
  });

  it('rejects a locally invented or legacy short order proof', async () => {
    const { res, state } = response();
    const legacyOrder = `V2-ESTJ-A-1788920000000-${'a'.repeat(8)}`;

    await handler(request({
      headers: {
        origin: 'https://kiwimu.com',
        host: 'kiwimu.com',
        'sec-fetch-site': 'same-origin',
        'x-v2-order-id': legacyOrder,
      },
    }), res);

    expect(state.status).toBe(403);
    expect(mocks.getLinePayOrder).not.toHaveBeenCalled();
  });

  it('falls back to a confirmed order cookie when a signed-in account has no matching purchase', async () => {
    mocks.getUserAdminDb.mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }) },
    });
    mocks.getLinePayOrder.mockResolvedValue({
      order_id: ORDER_ID,
      mbti_type: 'ESTJ-A',
      status: 'confirmed',
    });
    const { res, state } = response();

    await handler(request({
      headers: {
        origin: 'https://kiwimu.com',
        host: 'kiwimu.com',
        'sec-fetch-site': 'same-origin',
        authorization: 'Bearer valid-token',
        cookie: `__Host-kiwimu-v2-order=${ORDER_ID}`,
      },
    }), res);

    expect(state.status).toBe(200);
    expect(mocks.hasConfirmedLinePayOrderForUser).toHaveBeenCalledWith('user-1', 'ESTJ-A');
    expect(mocks.getLinePayOrder).toHaveBeenCalledWith(ORDER_ID);
  });
});

describe('POST /api/v2/report with the free promo', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
    mocks.getLinePayOrder.mockResolvedValue(null);
    mocks.getUserAdminDb.mockReturnValue(null);
    mocks.hasConfirmedLinePayOrderForUser.mockResolvedValue(false);
    mocks.hasV2PromoUnlock.mockResolvedValue(false);
  });

  it('reads the full report from a stored promo grant, tagged as promo access', async () => {
    mocks.hasV2PromoUnlock.mockResolvedValue(true);
    const { res, state } = response();
    await handler(verifiedAccountRequest(), res);
    expect(state.status).toBe(200);
    expect(state.body).toMatchObject({ ok: true, data: { access: 'promo', report: { fullCode: 'ESTJ-A' }, oppositeReport: { fullCode: 'ESTJ-T' } } });
    expect(mocks.hasV2PromoUnlock).toHaveBeenCalledWith('user-1', 'ESTJ-A');
  });

  it('keeps reading a promo grant after the window has closed', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-03-01T12:00:00+08:00'));
    mocks.hasV2PromoUnlock.mockResolvedValue(true);
    const { res, state } = response();
    await handler(verifiedAccountRequest(), res);
    vi.useRealTimers();
    expect(state.status).toBe(200);
    expect(state.body).toMatchObject({ ok: true, data: { access: 'promo' } });
  });

  it('never grants from the window alone: a signed-in account without a stored grant stays locked', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-15T12:00:00+08:00'));
    const { res, state } = response();
    await handler(verifiedAccountRequest(), res);
    vi.useRealTimers();
    expect(state.status).toBe(403);
    expect(state.body).toEqual({ ok: false, code: 'ENTITLEMENT_REQUIRED' });
  });

  it('asks the promo store only for the requested type', async () => {
    mocks.hasV2PromoUnlock.mockImplementation(async (_user: string, type: string) => type === 'ESTJ-T');
    const { res, state } = response();
    await handler(verifiedAccountRequest(), res);
    expect(state.status).toBe(403);
    expect(mocks.hasV2PromoUnlock).toHaveBeenCalledWith('user-1', 'ESTJ-A');
  });

  it('fails closed with a retryable error when the promo store is unavailable', async () => {
    mocks.hasV2PromoUnlock.mockResolvedValue(undefined);
    const { res, state } = response();
    await handler(verifiedAccountRequest(), res);
    expect(state.status).toBe(503);
    expect(state.body).toEqual({ ok: false, code: 'STORE_UNAVAILABLE' });
  });

  it('does not consult the promo store without a signed-in account', async () => {
    const { res, state } = response();
    await handler(request(), res);
    expect(state.status).toBe(403);
    expect(mocks.hasV2PromoUnlock).not.toHaveBeenCalled();
  });

  it('does not grant promo access to an anonymous session even if a row existed', async () => {
    mocks.hasV2PromoUnlock.mockResolvedValue(true);
    mocks.getUserAdminDb.mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'anon-1', is_anonymous: true } }, error: null }) },
    });
    const { res, state } = response();
    await handler(request({ headers: { host: 'kiwimu.com', origin: 'https://kiwimu.com', authorization: 'Bearer anon-token' } }), res);
    expect(state.status).toBe(403);
    expect(mocks.hasV2PromoUnlock).not.toHaveBeenCalled();
  });

  it('paid regression: a paid account gets the exact paid response and never touches the promo store', async () => {
    mocks.hasConfirmedLinePayOrderForUser.mockResolvedValue(true);
    const { res, state } = response();
    await handler(verifiedAccountRequest(), res);
    expect(state.status).toBe(200);
    const body = state.body as { ok: boolean; code: string; data: Record<string, unknown> };
    expect(Object.keys(body.data).sort()).toEqual(['oppositeReport', 'report']);
    expect(body).toMatchObject({ ok: true, code: 'OK', data: { report: { fullCode: 'ESTJ-A' }, oppositeReport: { fullCode: 'ESTJ-T' } } });
    expect(mocks.hasV2PromoUnlock).not.toHaveBeenCalled();
  });

  it('paid regression: an anonymous order proof keeps its exact response and skips the promo store', async () => {
    mocks.getLinePayOrder.mockResolvedValue({ order_id: ORDER_ID, mbti_type: 'ESTJ-A', status: 'confirmed', user_uid: null });
    const { res, state } = response();
    await handler(request(), res);
    expect(state.status).toBe(200);
    expect(Object.keys((state.body as { data: object }).data).sort()).toEqual(['oppositeReport', 'report']);
    expect(mocks.hasV2PromoUnlock).not.toHaveBeenCalled();
  });
});
