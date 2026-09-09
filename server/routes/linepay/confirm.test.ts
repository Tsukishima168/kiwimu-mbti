import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const mocks = vi.hoisted(() => ({
  getLinePayOrder: vi.fn(),
  updateLinePayOrder: vi.fn(),
  requestLinePay: vi.fn(),
}));

vi.mock('../../linePay.js', () => ({
  buildAppBaseUrl: () => 'https://kiwimu.com',
  buildLinePayApiPath: () => '/v3/payments/line-tx-1/confirm',
  buildV2OrderCookie: (orderId: string) => `__Host-kiwimu-v2-order=${orderId}; HttpOnly; Secure`,
  isLinePaySuccessCode: (code: string) => code === '0000',
  parseMbtiTypeFromOrderId: () => 'ESTJ-A',
  requestLinePay: mocks.requestLinePay,
  V2_REPORT_CURRENCY: 'TWD',
  V2_REPORT_PRICE_TWD: 149,
}));
vi.mock('../../linePayOrderStore.js', () => ({
  getLinePayOrder: mocks.getLinePayOrder,
  updateLinePayOrder: mocks.updateLinePayOrder,
}));
vi.mock('../../supabase/user-admin.js', () => ({ getUserAdminDb: () => null }));

import handler from './confirm';

const ORDER_ID = `V2-ESTJ-A-1788920000000-${'a'.repeat(32)}`;

function request(): VercelRequest {
  return {
    method: 'GET',
    headers: { host: 'kiwimu.com', 'x-forwarded-proto': 'https' },
    query: { orderId: ORDER_ID, transactionId: 'line-tx-1', mbtiType: 'ESTJ-A', source: 'test' },
  } as unknown as VercelRequest;
}

function response() {
  const state: { status?: number; location?: string; headers: Record<string, unknown> } = { headers: {} };
  const res = {
    setHeader(name: string, value: unknown) { state.headers[name] = value; return res; },
    status(code: number) { state.status = code; return res; },
    json() { return res; },
    redirect(code: number, location: string) { state.status = code; state.location = location; return res; },
  } as unknown as VercelResponse;
  return { res, state };
}

describe('GET /api/linepay/confirm security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requestLinePay.mockResolvedValue({ returnCode: '0000', returnMessage: 'Success' });
  });

  it('fails closed before charging when the order store is unavailable', async () => {
    mocks.getLinePayOrder.mockResolvedValue(undefined);
    const { res, state } = response();
    await handler(request(), res);

    expect(state.location).toContain('reason=store_unavailable');
    expect(mocks.requestLinePay).not.toHaveBeenCalled();
  });

  it('does not report unlock success when the confirmed state cannot be persisted', async () => {
    mocks.getLinePayOrder
      .mockResolvedValueOnce({
        order_id: ORDER_ID,
        mbti_type: 'ESTJ-A',
        source: 'test',
        user_uid: null,
        status: 'requested',
        amount: 149,
        currency: 'TWD',
        line_transaction_id: 'line-tx-1',
      })
      .mockResolvedValueOnce({ status: 'requested' });
    mocks.updateLinePayOrder.mockResolvedValue(false);
    const { res, state } = response();
    await handler(request(), res);

    expect(state.location).toContain('reason=confirmation_pending');
    expect(state.headers['Set-Cookie']).toBeUndefined();
    expect(mocks.updateLinePayOrder).toHaveBeenCalledWith(
      ORDER_ID,
      expect.objectContaining({ status: 'confirmed' }),
      expect.objectContaining({ expectedStatuses: expect.not.arrayContaining(['confirmed']) }),
    );
  });

  it('treats confirmed as terminal and returns a cookie without another provider call', async () => {
    mocks.getLinePayOrder.mockResolvedValue({
      order_id: ORDER_ID,
      mbti_type: 'ESTJ-A',
      source: 'test',
      user_uid: null,
      status: 'confirmed',
      amount: 149,
      currency: 'TWD',
      line_transaction_id: 'line-tx-1',
    });
    const { res, state } = response();
    await handler(request(), res);

    expect(state.location).toBe('https://kiwimu.com/read/ESTJ-A?unlock=success&source=test');
    expect(state.location).not.toContain('order_id');
    expect(state.headers['Set-Cookie']).toContain('HttpOnly');
    expect(mocks.requestLinePay).not.toHaveBeenCalled();
  });
});
