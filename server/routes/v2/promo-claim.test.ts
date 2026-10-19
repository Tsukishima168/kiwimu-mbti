import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  hasPaid: vi.fn(),
  hasPromo: vi.fn(),
  insert: vi.fn(),
  notify: vi.fn(),
  sendReceipt: vi.fn(),
  sendMerchant: vi.fn(),
}));

vi.mock('../../supabase/user-admin.js', () => ({ getUserAdminDb: () => ({ auth: { getUser: mocks.getUser } }) }));
vi.mock('../../linePayOrderStore.js', () => ({ hasConfirmedLinePayOrderForUser: mocks.hasPaid }));
vi.mock('../../v2PromoStore.js', () => ({ hasV2PromoUnlock: mocks.hasPromo, insertV2PromoUnlock: mocks.insert }));
// Payment notifications are mocked so any call from the promo route is observable.
vi.mock('../../v2PaymentNotifications.js', () => ({ notifyV2Payment: mocks.notify }));
vi.mock('../../v2PaymentReceipt.js', () => ({ sendV2PaymentReceipt: mocks.sendReceipt }));
vi.mock('../../v2MerchantNotification.js', () => ({ sendV2MerchantNotification: mocks.sendMerchant }));

import handler from './promo-claim';

const user = { id: 'account-a', email: 'reader@example.com', email_confirmed_at: '2026-10-01T00:00:00Z', is_anonymous: false };

function req(overrides: Partial<VercelRequest> = {}): VercelRequest {
  return {
    method: 'POST',
    headers: { host: 'kiwimu.com', origin: 'https://kiwimu.com', 'sec-fetch-site': 'same-origin', authorization: 'Bearer token-a' },
    body: { mbtiType: 'ESTJ-A', source: 'quiz' },
    ...overrides,
  } as unknown as VercelRequest;
}

function res() {
  const state = { status: 0, body: null as any, headers: {} as Record<string, unknown> };
  const response = {
    setHeader(name: string, value: unknown) { state.headers[name] = value; return response; },
    status(code: number) { state.status = code; return response; },
    json(body: unknown) { state.body = body; return response; },
  } as unknown as VercelResponse;
  return { response, state };
}

async function claimAt(isoInstant: string, request = req()) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(isoInstant));
  const { response, state } = res();
  await handler(request, response);
  return state;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user }, error: null });
  mocks.hasPaid.mockResolvedValue(false);
  mocks.hasPromo.mockResolvedValue(false);
  mocks.insert.mockResolvedValue({ status: 'created', claimedAt: '2026-11-30T15:59:59.999Z' });
});

afterEach(() => {
  vi.useRealTimers();
  // The promo path is not a payment: no receipt email and no merchant Discord message, ever.
  expect(mocks.notify).not.toHaveBeenCalled();
  expect(mocks.sendReceipt).not.toHaveBeenCalled();
  expect(mocks.sendMerchant).not.toHaveBeenCalled();
});

describe('POST /api/v2/promo-claim window', () => {
  it.each([
    '2026-11-30T23:59:59.999+08:00',
    '2026-11-30T15:59:59.999Z',
    '2026-10-20T09:00:00+08:00',
  ])('accepts a new claim at %s', async (instant) => {
    const state = await claimAt(instant);
    expect(state.status).toBe(200);
    expect(state.body).toEqual({
      ok: true,
      data: { mbtiType: 'ESTJ-A', access: 'promo', created: true, claimedAt: '2026-11-30T15:59:59.999Z' },
    });
    expect(state.headers['Cache-Control']).toBe('private, no-store, max-age=0');
  });

  it.each([
    '2026-12-01T00:00:00.000+08:00',
    '2026-11-30T16:00:00.000Z',
    '2026-12-01T23:59:59.000+08:00',
    '2027-06-01T00:00:00+08:00',
  ])('rejects a new claim at %s using server time only', async (instant) => {
    const state = await claimAt(instant);
    expect(state.status).toBe(403);
    expect(state.body).toEqual({ ok: false, code: 'PROMO_ENDED', endsAt: '2026-12-01T00:00:00+08:00' });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('treats a DB end-guard rejection as the end of the promo', async () => {
    mocks.insert.mockResolvedValue({ status: 'ended' });
    const state = await claimAt('2026-11-30T23:59:59.999+08:00');
    expect(state.status).toBe(403);
    expect(state.body).toMatchObject({ code: 'PROMO_ENDED' });
  });
});

describe('POST /api/v2/promo-claim existing access', () => {
  it('returns an existing promo unlock after the window without inserting', async () => {
    mocks.hasPromo.mockResolvedValue(true);
    const state = await claimAt('2027-01-01T00:00:00+08:00');
    expect(state.status).toBe(200);
    expect(state.body).toEqual({ ok: true, data: { mbtiType: 'ESTJ-A', access: 'promo', created: false } });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('is idempotent: a repeated claim during the window does not insert again', async () => {
    mocks.hasPromo.mockResolvedValue(true);
    const state = await claimAt('2026-11-01T12:00:00+08:00');
    expect(state.body).toEqual({ ok: true, data: { mbtiType: 'ESTJ-A', access: 'promo', created: false } });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('is idempotent when two claims race and the second hits the primary key', async () => {
    mocks.insert.mockResolvedValue({ status: 'exists' });
    const state = await claimAt('2026-11-01T12:00:00+08:00');
    expect(state.status).toBe(200);
    expect(state.body).toEqual({ ok: true, data: { mbtiType: 'ESTJ-A', access: 'promo', created: false } });
  });

  it.each(['2026-11-01T12:00:00+08:00', '2027-01-01T00:00:00+08:00'])(
    'returns paid access for an already-paid account at %s without touching the promo table',
    async (instant) => {
      mocks.hasPaid.mockResolvedValue(true);
      const state = await claimAt(instant);
      expect(state.status).toBe(200);
      expect(state.body).toEqual({ ok: true, data: { mbtiType: 'ESTJ-A', access: 'paid', created: false } });
      expect(mocks.hasPaid).toHaveBeenCalledWith('account-a', 'ESTJ-A');
      expect(mocks.hasPromo).not.toHaveBeenCalled();
      expect(mocks.insert).not.toHaveBeenCalled();
    },
  );
});

describe('POST /api/v2/promo-claim identity', () => {
  it('binds the grant to the verified token account, never to ids in the body', async () => {
    const state = await claimAt('2026-11-01T12:00:00+08:00', req({
      body: { mbtiType: ' estj-a ', source: 'quiz', userId: 'account-b', user_uid: 'account-b' },
    }));
    expect(state.status).toBe(200);
    expect(mocks.insert).toHaveBeenCalledWith({ userId: 'account-a', mbtiType: 'ESTJ-A', source: 'quiz' });
  });

  it('stores an unsafe source as null instead of rejecting the claim', async () => {
    await claimAt('2026-11-01T12:00:00+08:00', req({ body: { mbtiType: 'ESTJ-A', source: '<script>' } }));
    expect(mocks.insert).toHaveBeenCalledWith({ userId: 'account-a', mbtiType: 'ESTJ-A', source: null });
  });

  it('requires a session token (401) and does not touch any store', async () => {
    const headers = { ...req().headers } as Record<string, string>;
    delete headers.authorization;
    const state = await claimAt('2026-11-01T12:00:00+08:00', req({ headers }));
    expect(state.status).toBe(401);
    expect(state.body).toEqual({ ok: false, code: 'AUTH_REQUIRED' });
    expect(mocks.getUser).not.toHaveBeenCalled();
    expect(mocks.hasPaid).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('rejects an invalid token with 401', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: new AuthApiError('invalid token', 401, undefined) });
    const state = await claimAt('2026-11-01T12:00:00+08:00');
    expect(state.status).toBe(401);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('rejects an anonymous Supabase session with 401', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { ...user, is_anonymous: true } }, error: null });
    const state = await claimAt('2026-11-01T12:00:00+08:00');
    expect(state.status).toBe(401);
    expect(state.body).toEqual({ ok: false, code: 'AUTH_REQUIRED' });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it.each([
    { label: 'unverified email', patch: { email_confirmed_at: null } },
    { label: 'missing email', patch: { email: null } },
  ])('rejects an account with $label with 403', async ({ patch }) => {
    mocks.getUser.mockResolvedValue({ data: { user: { ...user, ...patch } }, error: null });
    const state = await claimAt('2026-11-01T12:00:00+08:00');
    expect(state.status).toBe(403);
    expect(state.body).toEqual({ ok: false, code: 'VERIFIED_EMAIL_REQUIRED' });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('keeps an auth outage retryable (503) without granting anything', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: new AuthRetryableFetchError('network', 0) });
    const state = await claimAt('2026-11-01T12:00:00+08:00');
    expect(state.status).toBe(503);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('blocks cross-origin requests before verifying the account', async () => {
    const state = await claimAt('2026-11-01T12:00:00+08:00', req({
      headers: { ...req().headers, origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' },
    }));
    expect(state.status).toBe(403);
    expect(state.body).toEqual({ ok: false, code: 'FORBIDDEN_ORIGIN' });
    expect(mocks.getUser).not.toHaveBeenCalled();
  });

  it.each([
    { label: 'GET', overrides: { method: 'GET' }, status: 405 },
    { label: 'unknown type', overrides: { body: { mbtiType: 'ABCD-A' } }, status: 400 },
    { label: 'oversized body', overrides: { body: { mbtiType: 'ESTJ-A', source: 'x'.repeat(2_000) } }, status: 413 },
  ])('rejects $label', async ({ overrides, status }) => {
    const state = await claimAt('2026-11-01T12:00:00+08:00', req(overrides as Partial<VercelRequest>));
    expect(state.status).toBe(status);
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});

describe('POST /api/v2/promo-claim store failures', () => {
  it.each([
    { label: 'paid lookup', setup: () => mocks.hasPaid.mockResolvedValue(undefined) },
    { label: 'promo lookup', setup: () => mocks.hasPromo.mockResolvedValue(undefined) },
    { label: 'insert', setup: () => mocks.insert.mockResolvedValue({ status: 'unavailable' }) },
  ])('fails closed with 503 when the $label is unavailable', async ({ setup }) => {
    setup();
    const state = await claimAt('2026-11-01T12:00:00+08:00');
    expect(state.status).toBe(503);
    expect(state.body).toEqual({ ok: false, code: 'STORE_UNAVAILABLE' });
  });
});
