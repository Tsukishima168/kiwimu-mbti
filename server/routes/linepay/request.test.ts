import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const mocks = vi.hoisted(() => ({
  createLinePayOrder: vi.fn(),
  updateLinePayOrder: vi.fn(),
  requestLinePay: vi.fn(),
  getUserAdminDb: vi.fn(),
  isV2PaymentReceiptReady: vi.fn(),
  isV2MerchantNotificationReady: vi.fn(),
}));

vi.mock('../../linePay.js', async importOriginal => ({
  ...await importOriginal<typeof import('../../linePay.js')>(),
  buildAppBaseUrl: () => 'https://kiwimu.com',
  buildLinePayApiPath: () => '/v3/payments/request',
  buildV2LinePayOrderId: (mbtiType: string) => `V2-${mbtiType}-1788920000000-${'a'.repeat(32)}`,
  buildV2PendingOrderCookie: (orderId: string) => `__Host-kiwimu-v2-pending-order=${orderId}; HttpOnly; Secure`,
  getLinePayConfig: () => ({}),
  isLinePaySuccessCode: (code: string) => code === '0000',
  requestLinePay: mocks.requestLinePay,
}));
vi.mock('../../linePayOrderStore.js', () => ({
  createLinePayOrder: mocks.createLinePayOrder,
  updateLinePayOrder: mocks.updateLinePayOrder,
}));
vi.mock('../../supabase/user-admin.js', () => ({
  getUserAdminDb: mocks.getUserAdminDb,
}));
vi.mock('../../v2PaymentReceipt.js', () => ({ isV2PaymentReceiptReady: mocks.isV2PaymentReceiptReady }));
vi.mock('../../v2MerchantNotification.js', () => ({ isV2MerchantNotificationReady: mocks.isV2MerchantNotificationReady }));

import handler from './request';

function request(overrides: Partial<VercelRequest> = {}): VercelRequest {
  return {
    method: 'POST',
    headers: {
      origin: 'https://kiwimu.com',
      host: 'kiwimu.com',
      'sec-fetch-site': 'same-origin',
    },
    body: { mbtiType: 'ESTJ-A', source: 'test', userUid: 'spoofed-user' },
    ...overrides,
  } as unknown as VercelRequest;
}

function response() {
  const state: { status?: number; body?: any; headers: Record<string, unknown> } = { headers: {} };
  const res = {
    setHeader(name: string, value: unknown) { state.headers[name] = value; return res; },
    status(code: number) { state.status = code; return res; },
    json(body: unknown) { state.body = body; return res; },
    end() { return res; },
  } as unknown as VercelResponse;
  return { res, state };
}

function verifiedPurchaseRequest(mbtiType: unknown) {
  mocks.getUserAdminDb.mockReturnValue({
    auth: { getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'verified-user', email: 'buyer@example.com', email_confirmed_at: '2026-10-02T00:00:00Z' } },
      error: null,
    }) },
  });
  return request({
    headers: { origin: 'https://kiwimu.com', host: 'kiwimu.com', authorization: 'Bearer valid-token' },
    body: { mbtiType, source: 'test' },
  });
}

describe('POST /api/linepay/request security', () => {
  const originalGate = process.env.V2_CHECKOUT_ENABLED;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.V2_CHECKOUT_ENABLED = 'true';
    mocks.createLinePayOrder.mockResolvedValue(true);
    mocks.updateLinePayOrder.mockResolvedValue(true);
    mocks.requestLinePay.mockResolvedValue({
      returnCode: '0000',
      returnMessage: 'Success',
      info: {
        transactionId: 'line-tx-1',
        paymentUrl: { web: 'https://sandbox-web-pay.line.me/checkout' },
      },
    });
    mocks.getUserAdminDb.mockReturnValue(null);
    mocks.isV2PaymentReceiptReady.mockResolvedValue(true);
    mocks.isV2MerchantNotificationReady.mockResolvedValue(true);
  });

  afterEach(() => {
    if (originalGate === undefined) delete process.env.V2_CHECKOUT_ENABLED;
    else process.env.V2_CHECKOUT_ENABLED = originalGate;
  });

  it.each([
    'AAAA-A', 'ASTJ-A', 'EATJ-A', 'ESAJ-A', 'ESTA-A', 'ESTJ-X',
    'ESTJ', 'ESTJ-AA', 'ESTJ-A-extra', '', null, undefined, 123, ['ESTJ-A'],
  ])('rejects an unsupported report type %j before any checkout side effect', async (mbtiType) => {
    const { res, state } = response();
    await handler(verifiedPurchaseRequest(mbtiType), res);

    expect(state.status).toBe(400);
    expect(state.body).toEqual({ ok: false, error: 'Invalid mbtiType' });
    expect(mocks.getUserAdminDb).not.toHaveBeenCalled();
    expect(mocks.isV2PaymentReceiptReady).not.toHaveBeenCalled();
    expect(mocks.createLinePayOrder).not.toHaveBeenCalled();
    expect(mocks.updateLinePayOrder).not.toHaveBeenCalled();
    expect(mocks.requestLinePay).not.toHaveBeenCalled();
    expect(state.headers['Set-Cookie']).toBeUndefined();
  });

  it.each([
    'ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP',
    'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ',
  ].flatMap(type => [`${type}-A`, `${type}-T`]))('creates a payment session for supported report %s', async (mbtiType) => {
    const { res, state } = response();
    await handler(verifiedPurchaseRequest(mbtiType), res);

    expect(state.status).toBe(200);
    expect(mocks.createLinePayOrder).toHaveBeenCalledOnce();
    expect(mocks.createLinePayOrder).toHaveBeenCalledWith(expect.objectContaining({
      mbtiType, userUid: 'verified-user', amount: 99, currency: 'TWD',
    }));
    expect(mocks.requestLinePay).toHaveBeenCalledOnce();
    expect(mocks.requestLinePay).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        orderId: `V2-${mbtiType}-1788920000000-${'a'.repeat(32)}`,
        amount: 99, currency: 'TWD',
        packages: [expect.objectContaining({
          amount: 99,
          products: [expect.objectContaining({ price: 99, quantity: 1 })],
        })],
      }),
    }));
    expect(state.headers['Set-Cookie']).toContain(`V2-${mbtiType}-`);
  });

  it('tags the LINE Pay request with the MBTI branch so merchant console orders are distinguishable', async () => {
    const { res, state } = response();
    await handler(verifiedPurchaseRequest('ESTJ-A'), res);

    expect(state.status).toBe(200);
    expect(mocks.requestLinePay).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        options: { extra: { branchName: 'Kiwimu MBTI', branchId: 'mbti' } },
      }),
    }));
    expect(mocks.createLinePayOrder).toHaveBeenCalledWith(expect.objectContaining({
      requestPayload: expect.objectContaining({
        options: { extra: { branchName: 'Kiwimu MBTI', branchId: 'mbti' } },
      }),
    }));
  });

  it('normalizes case and surrounding whitespace for a supported report type', async () => {
    const { res, state } = response();
    await handler(verifiedPurchaseRequest('  intj-t  '), res);

    expect(state.status).toBe(200);
    expect(mocks.createLinePayOrder).toHaveBeenCalledWith(expect.objectContaining({ mbtiType: 'INTJ-T' }));
  });

  it('does not create an order while merchant notifications are unavailable', async () => {
    mocks.isV2MerchantNotificationReady.mockResolvedValue(false);
    const { res, state } = response();
    await handler(verifiedPurchaseRequest('ESTJ-A'), res);
    expect(state.status).toBe(503);
    expect(state.body.code).toBe('NOTIFICATIONS_UNAVAILABLE');
    expect(mocks.createLinePayOrder).not.toHaveBeenCalled();
    expect(mocks.requestLinePay).not.toHaveBeenCalled();
  });

  it('keeps checkout closed unless the server gate is explicitly enabled', async () => {
    delete process.env.V2_CHECKOUT_ENABLED;
    const { res, state } = response();
    await handler(request(), res);

    expect(state.status).toBe(503);
    expect(mocks.createLinePayOrder).not.toHaveBeenCalled();
  });

  it('requires login and does not bind a browser-supplied user id', async () => {
    const { res, state } = response();
    await handler(request(), res);

    expect(state.status).toBe(401);
    expect(state.body.code).toBe('AUTH_REQUIRED');
    expect(mocks.createLinePayOrder).not.toHaveBeenCalled();
    expect(mocks.requestLinePay).not.toHaveBeenCalled();
  });

  it('binds the order only to the user verified from the bearer token', async () => {
    mocks.getUserAdminDb.mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'verified-user', email: 'buyer@example.com', email_confirmed_at: '2026-10-02T00:00:00Z' } }, error: null }) },
    });
    const { res, state } = response();
    await handler(request({
      headers: {
        origin: 'https://kiwimu.com',
        host: 'kiwimu.com',
        'sec-fetch-site': 'same-origin',
        authorization: 'Bearer valid-token',
      },
    }), res);

    expect(state.status).toBe(200);
    expect(mocks.createLinePayOrder).toHaveBeenCalledWith(expect.objectContaining({ userUid: 'verified-user' }));
    expect(state.headers['Set-Cookie']).toContain('__Host-kiwimu-v2-pending-order=');
  });

  it('does not charge an account without a verified email', async () => {
    mocks.getUserAdminDb.mockReturnValue({ auth: { getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'verified-user', email: 'buyer@example.com', email_confirmed_at: null } }, error: null,
    }) } });
    const { res, state } = response();
    await handler(request({ headers: { origin: 'https://kiwimu.com', host: 'kiwimu.com', authorization: 'Bearer token' } }), res);
    expect(state.status).toBe(422);
    expect(mocks.requestLinePay).not.toHaveBeenCalled();
  });

  it('does not charge before notification credentials and the delivery store are ready', async () => {
    mocks.getUserAdminDb.mockReturnValue({ auth: { getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'buyer', email: 'buyer@example.com', email_confirmed_at: '2026-10-01T00:00:00Z' } }, error: null,
    }) } });
    mocks.isV2PaymentReceiptReady.mockResolvedValue(false);
    const { res, state } = response();
    await handler(request({ headers: { origin: 'https://kiwimu.com', host: 'kiwimu.com', authorization: 'Bearer token' } }), res);
    expect(state.status).toBe(503);
    expect(state.body.code).toBe('NOTIFICATIONS_UNAVAILABLE');
    expect(mocks.requestLinePay).not.toHaveBeenCalled();
    expect(mocks.createLinePayOrder).not.toHaveBeenCalled();
  });
});
