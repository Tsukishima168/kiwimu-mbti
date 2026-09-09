import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const mocks = vi.hoisted(() => ({
  getLinePayOrder: vi.fn(),
  hasConfirmedLinePayOrderForUser: vi.fn(),
  getUserAdminDb: vi.fn(),
}));

vi.mock('../../linePayOrderStore.js', () => ({
  getLinePayOrder: mocks.getLinePayOrder,
  hasConfirmedLinePayOrderForUser: mocks.hasConfirmedLinePayOrderForUser,
}));
vi.mock('../../supabase/user-admin.js', () => ({
  getUserAdminDb: mocks.getUserAdminDb,
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

describe('POST /api/v2/report', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserAdminDb.mockReturnValue(null);
    mocks.hasConfirmedLinePayOrderForUser.mockResolvedValue(false);
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
