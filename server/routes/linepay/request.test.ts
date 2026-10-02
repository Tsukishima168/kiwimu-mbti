import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const mocks = vi.hoisted(() => ({
  createLinePayOrder: vi.fn(),
  updateLinePayOrder: vi.fn(),
  requestLinePay: vi.fn(),
  getUserAdminDb: vi.fn(),
  isV2PaymentReceiptReady: vi.fn(),
}));

vi.mock('../../linePay.js', () => ({
  buildAppBaseUrl: () => 'https://kiwimu.com',
  buildLinePayApiPath: () => '/v3/payments/request',
  buildV2LinePayOrderId: () => `V2-ESTJ-A-1788920000000-${'a'.repeat(32)}`,
  buildV2PendingOrderCookie: (orderId: string) => `__Host-kiwimu-v2-pending-order=${orderId}; HttpOnly; Secure`,
  getLinePayConfig: () => ({}),
  isLinePaySuccessCode: (code: string) => code === '0000',
  requestLinePay: mocks.requestLinePay,
  V2_REPORT_CURRENCY: 'TWD',
  V2_REPORT_PRICE_TWD: 49,
}));
vi.mock('../../linePayOrderStore.js', () => ({
  createLinePayOrder: mocks.createLinePayOrder,
  updateLinePayOrder: mocks.updateLinePayOrder,
}));
vi.mock('../../supabase/user-admin.js', () => ({
  getUserAdminDb: mocks.getUserAdminDb,
}));
vi.mock('../../v2PaymentReceipt.js', () => ({ isV2PaymentReceiptReady: mocks.isV2PaymentReceiptReady }));

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
  });

  afterEach(() => {
    if (originalGate === undefined) delete process.env.V2_CHECKOUT_ENABLED;
    else process.env.V2_CHECKOUT_ENABLED = originalGate;
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
