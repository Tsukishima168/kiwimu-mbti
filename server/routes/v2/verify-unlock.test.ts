import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const mocks = vi.hoisted(() => ({ getLinePayOrder: vi.fn() }));
vi.mock('../../linePayOrderStore.js', () => ({
  getLinePayOrder: mocks.getLinePayOrder,
}));

import handler from './verify-unlock';

const ORDER_ID = `V2-INFJ-T-1788920000000-${'b'.repeat(32)}`;

function request(body: Record<string, unknown>, cookie = ''): VercelRequest {
  return {
    method: 'POST',
    headers: {
      origin: 'https://kiwimu.com',
      host: 'kiwimu.com',
      'sec-fetch-site': 'same-origin',
      ...(cookie ? { cookie } : {}),
    },
    body,
  } as unknown as VercelRequest;
}

function response() {
  const state: { status?: number; body?: unknown } = {};
  const res = {
    setHeader() { return res; },
    status(code: number) { state.status = code; return res; },
    json(body: unknown) { state.body = body; return res; },
  } as unknown as VercelResponse;
  return { res, state };
}

describe('POST /api/v2/verify-unlock', () => {
  beforeEach(() => vi.clearAllMocks());

  it('confirms only a paid order for the requested report type', async () => {
    mocks.getLinePayOrder.mockResolvedValue({
      order_id: ORDER_ID,
      mbti_type: 'INFJ-T',
      status: 'confirmed',
      confirmed_at: '2026-09-09T00:00:00.000Z',
    });
    const { res, state } = response();

    await handler(request(
      { mbtiType: 'INFJ-T' },
      `__Host-kiwimu-v2-order=${ORDER_ID}`,
    ), res);

    expect(state.status).toBe(200);
    expect(state.body).toMatchObject({ ok: true, data: { mbtiType: 'INFJ-T' } });
    expect(state.body).not.toMatchObject({ data: { orderId: expect.anything() } });
  });

  it('rejects a valid order used for a different report type', async () => {
    mocks.getLinePayOrder.mockResolvedValue({
      order_id: ORDER_ID,
      mbti_type: 'INFJ-T',
      status: 'confirmed',
    });
    const { res, state } = response();

    await handler(request({ orderId: ORDER_ID, mbtiType: 'ESTJ-A' }), res);

    expect(state.status).toBe(403);
    expect(state.body).toMatchObject({ code: 'NOT_CONFIRMED' });
  });
});
