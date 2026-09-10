import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const mocks = vi.hoisted(() => ({
  getLinePayOrder: vi.fn(),
  updateLinePayOrder: vi.fn(),
}));

vi.mock('../../linePay.js', () => ({
  buildAppBaseUrl: () => 'https://kiwimu.com',
  buildV2OrderCookie: (orderId: string) => `__Host-kiwimu-v2-order=${orderId}; HttpOnly; Secure`,
  clearV2PendingOrderCookie: () => '__Host-kiwimu-v2-pending-order=; Max-Age=0',
  parseMbtiTypeFromOrderId: () => 'ESTJ-A',
}));
vi.mock('../../linePayOrderStore.js', () => ({
  getLinePayOrder: mocks.getLinePayOrder,
  updateLinePayOrder: mocks.updateLinePayOrder,
}));

import handler from './cancel';

const ORDER_ID = `V2-ESTJ-A-1788920000000-${'a'.repeat(32)}`;

function request(): VercelRequest {
  return {
    method: 'GET',
    headers: { host: 'kiwimu.com', 'x-forwarded-proto': 'https' },
    query: { orderId: ORDER_ID, mbtiType: 'ESTJ-A', source: 'test' },
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

describe('GET /api/linepay/cancel security', () => {
  beforeEach(() => vi.clearAllMocks());

  it('cannot downgrade a confirmed payment to cancelled', async () => {
    mocks.getLinePayOrder.mockResolvedValue({
      order_id: ORDER_ID,
      mbti_type: 'ESTJ-A',
      status: 'confirmed',
    });
    const { res, state } = response();
    await handler(request(), res);

    expect(mocks.updateLinePayOrder).not.toHaveBeenCalled();
    expect(state.location).toBe('https://kiwimu.com/read/ESTJ-A?unlock=success');
    expect(state.headers['Set-Cookie']).toEqual([
      expect.stringContaining('HttpOnly'),
      expect.stringContaining('Max-Age=0'),
    ]);
  });

  it('uses a conditional transition for a cancellable order', async () => {
    mocks.getLinePayOrder.mockResolvedValue({
      order_id: ORDER_ID,
      mbti_type: 'ESTJ-A',
      status: 'requested',
    });
    mocks.updateLinePayOrder.mockResolvedValue(true);
    const { res, state } = response();
    await handler(request(), res);

    expect(state.location).toBe('https://kiwimu.com/read/ESTJ-A?checkout=cancelled');
    expect(state.headers['Set-Cookie']).toContain('Max-Age=0');
    expect(mocks.updateLinePayOrder).toHaveBeenCalledWith(
      ORDER_ID,
      expect.objectContaining({ status: 'cancelled' }),
      { expectedStatuses: ['created', 'requested', 'request_failed', 'confirm_failed'] },
    );
  });
});
