import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ORDER_ID = `V2-ESTJ-A-1788920000000-${'a'.repeat(32)}`;

const mocks = vi.hoisted(() => ({
  getLinePayOrder: vi.fn(),
  updateLinePayOrder: vi.fn(),
  requestLinePay: vi.fn(),
  fulfillLinePayOrder: vi.fn(),
  persistV2UnlockForUser: vi.fn(),
}));

vi.mock('../../linePay.js', () => ({
  buildAppBaseUrl: () => 'https://kiwimu.com',
  buildLinePayApiPath: (pathname: string) => `/v3${pathname}`,
  buildV2OrderCookie: (orderId: string) => `__Host-kiwimu-v2-order=${orderId}; HttpOnly; Secure`,
  clearV2PendingOrderCookie: () => '__Host-kiwimu-v2-pending-order=; Max-Age=0',
  readV2PendingOrderIdCookie: (cookie?: string) =>
    cookie?.includes('__Host-kiwimu-v2-pending-order=') ? ORDER_ID : '',
  requestLinePay: mocks.requestLinePay,
}));
vi.mock('../../linePayOrderStore.js', () => ({
  getLinePayOrder: mocks.getLinePayOrder,
  updateLinePayOrder: mocks.updateLinePayOrder,
}));
vi.mock('../../linePayFulfillment.js', () => ({
  fulfillLinePayOrder: mocks.fulfillLinePayOrder,
  persistV2UnlockForUser: mocks.persistV2UnlockForUser,
}));

import handler from './status';

function request(overrides: Partial<VercelRequest> = {}): VercelRequest {
  return {
    method: 'POST',
    headers: {
      origin: 'https://kiwimu.com',
      host: 'kiwimu.com',
      'sec-fetch-site': 'same-origin',
      cookie: `__Host-kiwimu-v2-pending-order=${ORDER_ID}`,
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
    end() { return res; },
  } as unknown as VercelResponse;
  return { res, state };
}

function storedOrder(overrides: Record<string, unknown> = {}) {
  return {
    order_id: ORDER_ID,
    mbti_type: 'ESTJ-A',
    source: 'test',
    user_uid: null,
    status: 'requested',
    amount: 149,
    currency: 'TWD',
    line_transaction_id: 'line-tx-1',
    ...overrides,
  };
}

describe('POST /api/linepay/status', () => {
  const originalGate = process.env.V2_CHECKOUT_ENABLED;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.V2_CHECKOUT_ENABLED = 'true';
    mocks.getLinePayOrder.mockResolvedValue(storedOrder());
    mocks.updateLinePayOrder.mockResolvedValue(true);
  });

  afterEach(() => {
    if (originalGate === undefined) delete process.env.V2_CHECKOUT_ENABLED;
    else process.env.V2_CHECKOUT_ENABLED = originalGate;
  });

  it('requires the pending order cookie', async () => {
    const { res, state } = response();

    await handler(request({ headers: { origin: 'https://kiwimu.com', host: 'kiwimu.com', 'sec-fetch-site': 'same-origin' } }), res);

    expect(state.status).toBe(400);
    expect(state.body).toMatchObject({ code: 'NO_PENDING_ORDER' });
    expect(mocks.getLinePayOrder).not.toHaveBeenCalled();
  });

  it('keeps the report locked while LINE Pay authentication is pending', async () => {
    mocks.requestLinePay.mockResolvedValue({ returnCode: '0000', returnMessage: 'success' });
    const { res, state } = response();

    await handler(request(), res);

    expect(state.status).toBe(202);
    expect(state.body).toMatchObject({ code: 'AUTH_PENDING' });
    expect(mocks.fulfillLinePayOrder).not.toHaveBeenCalled();
  });

  it('confirms the order when LINE Pay reports authentication is ready', async () => {
    mocks.requestLinePay.mockResolvedValue({ returnCode: '0110', returnMessage: 'ready' });
    mocks.fulfillLinePayOrder.mockResolvedValue({
      ok: true,
      orderId: ORDER_ID,
      mbtiType: 'ESTJ-A',
      source: 'test',
    });
    const { res, state } = response();

    await handler(request(), res);

    expect(mocks.requestLinePay).toHaveBeenCalledWith({
      method: 'GET',
      apiPath: '/v3/payments/requests/line-tx-1/check',
    });
    expect(mocks.fulfillLinePayOrder).toHaveBeenCalledWith({
      orderId: ORDER_ID,
      transactionId: 'line-tx-1',
      typeFromQuery: 'ESTJ-A',
      sourceFromQuery: 'test',
    });
    expect(state.status).toBe(200);
    expect(state.headers['Set-Cookie']).toEqual([
      expect.stringContaining('__Host-kiwimu-v2-order='),
      expect.stringContaining('Max-Age=0'),
    ]);
    expect(state.body).toMatchObject({
      ok: true,
      data: {
        mbtiType: 'ESTJ-A',
        redirectUrl: 'https://kiwimu.com/read/ESTJ-A?unlock=success&source=test',
      },
    });
  });

  it('accepts an already completed provider status as payment truth', async () => {
    mocks.requestLinePay.mockResolvedValue({ returnCode: '0123', returnMessage: 'completed' });
    const { res, state } = response();

    await handler(request(), res);

    expect(state.status).toBe(200);
    expect(mocks.updateLinePayOrder).toHaveBeenCalledWith(
      ORDER_ID,
      expect.objectContaining({ status: 'confirmed', line_return_code: '0123' }),
      expect.objectContaining({ expectedStatuses: expect.arrayContaining(['requested']) }),
    );
    expect(mocks.persistV2UnlockForUser).toHaveBeenCalledWith(null);
    expect(state.body).toMatchObject({ ok: true, data: { status: 'confirmed' } });
  });

  it('clears the pending proof when LINE Pay reports cancellation or timeout', async () => {
    mocks.requestLinePay.mockResolvedValue({ returnCode: '0121', returnMessage: 'cancelled' });
    const { res, state } = response();

    await handler(request(), res);

    expect(state.status).toBe(409);
    expect(state.body).toMatchObject({ code: 'PAYMENT_CANCELLED' });
    expect(state.headers['Set-Cookie']).toContain('Max-Age=0');
    expect(mocks.updateLinePayOrder).toHaveBeenCalledWith(
      ORDER_ID,
      expect.objectContaining({ status: 'cancelled' }),
      { expectedStatuses: ['created', 'requested', 'request_failed', 'confirm_failed'] },
    );
  });

  it('does not let a pending order unlock a different report type', async () => {
    mocks.getLinePayOrder.mockResolvedValue(storedOrder({ mbti_type: 'INFJ-A' }));
    const { res, state } = response();

    await handler(request(), res);

    expect(state.status).toBe(403);
    expect(state.body).toMatchObject({ code: 'ORDER_TYPE_MISMATCH' });
    expect(mocks.requestLinePay).not.toHaveBeenCalled();
  });
});
