import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const mocks = vi.hoisted(() => ({
  createLinePayOrder: vi.fn(),
  updateLinePayOrder: vi.fn(),
  requestLinePay: vi.fn(),
  getUserAdminDb: vi.fn(),
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
  V2_REPORT_PRICE_TWD: 149,
}));
vi.mock('../../linePayOrderStore.js', () => ({
  createLinePayOrder: mocks.createLinePayOrder,
  updateLinePayOrder: mocks.updateLinePayOrder,
}));
vi.mock('../../supabase/user-admin.js', () => ({
  getUserAdminDb: mocks.getUserAdminDb,
}));

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

  it('ignores a browser-supplied user id for anonymous checkout', async () => {
    const { res, state } = response();
    await handler(request(), res);

    expect(state.status).toBe(200);
    expect(mocks.createLinePayOrder).toHaveBeenCalledWith(expect.objectContaining({ userUid: null }));
    expect(state.headers['Set-Cookie']).toContain('__Host-kiwimu-v2-pending-order=');
  });

  it('binds the order only to the user verified from the bearer token', async () => {
    mocks.getUserAdminDb.mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'verified-user' } }, error: null }) },
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
  });
});
