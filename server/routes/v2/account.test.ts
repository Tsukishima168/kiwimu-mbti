import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(), getLinePayOrder: vi.fn(), listOrders: vi.fn(), claimOrder: vi.fn(),
  sendReceipt: vi.fn(), receiptStatuses: vi.fn(),
}));
vi.mock('../../supabase/user-admin.js', () => ({ getUserAdminDb: () => ({ auth: { getUser: mocks.getUser } }) }));
vi.mock('../../linePayOrderStore.js', () => ({
  getLinePayOrder: mocks.getLinePayOrder,
  listConfirmedLinePayOrdersForUser: mocks.listOrders,
  claimAnonymousLinePayOrder: mocks.claimOrder,
}));
vi.mock('../../v2PaymentReceipt.js', async original => ({
  ...await original<typeof import('../../v2PaymentReceipt')>(),
  sendV2PaymentReceipt: mocks.sendReceipt,
  getV2ReceiptStatuses: mocks.receiptStatuses,
}));

import myReports from './my-reports';
import claimReport from './claim-report';
import receiptHandler from './receipt';
import { paymentReceiptReference } from '../../v2PaymentReceipt';

const ORDER_ID = `V2-ESTJ-A-1790932352889-${'a'.repeat(32)}`;
const order = { order_id: ORDER_ID, mbti_type: 'ESTJ-A', amount: 49, currency: 'TWD', status: 'confirmed', user_uid: 'account-a', confirmed_at: '2026-10-02T09:20:00Z' };
const user = { id: 'account-a', email: 'buyer@example.com', email_confirmed_at: '2026-10-01T00:00:00Z' };
function req(overrides: Partial<VercelRequest> = {}) {
  return { method: 'POST', headers: { host: 'kiwimu.com', origin: 'https://kiwimu.com', authorization: 'Bearer token-a' }, body: {}, ...overrides } as VercelRequest;
}
function res() {
  const state = { status: 0, body: null as any, headers: {} as Record<string, unknown> };
  const response = {
    setHeader(k: string, v: unknown) { state.headers[k] = v; return response; },
    status(code: number) { state.status = code; return response; },
    json(body: unknown) { state.body = body; return response; },
  } as unknown as VercelResponse;
  return { response, state };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user }, error: null });
  mocks.listOrders.mockResolvedValue([order]);
  mocks.getLinePayOrder.mockResolvedValue(order);
  mocks.claimOrder.mockResolvedValue(true);
  mocks.sendReceipt.mockResolvedValue('sent');
  mocks.receiptStatuses.mockResolvedValue(new Map([[ORDER_ID, 'sent']]));
});

describe('account report library', () => {
  it('queries only the verified account and returns no payment proof or provider data', async () => {
    const { response, state } = res();
    await myReports(req({ body: { userUid: 'account-b' } }), response);
    expect(state.status).toBe(200);
    expect(mocks.listOrders).toHaveBeenCalledWith('account-a');
    expect(state.body.data.reports[0]).toMatchObject({ mbtiType: 'ESTJ-A', amount: 49, receiptStatus: 'sent' });
    expect(JSON.stringify(state.body)).not.toContain(ORDER_ID);
    expect(JSON.stringify(state.body)).not.toContain('user_uid');
    expect(state.headers['Cache-Control']).toContain('no-store');
  });

  it('shows an unclaimed purchase only from a confirmed HttpOnly cookie', async () => {
    mocks.getLinePayOrder.mockResolvedValue({ ...order, user_uid: null });
    const { response, state } = res();
    await myReports(req({ headers: { ...req().headers, cookie: `__Host-kiwimu-v2-order=${ORDER_ID}` } }), response);
    expect(state.body.data.claimableReport).toMatchObject({ mbtiType: 'ESTJ-A', amount: 49 });
    expect(mocks.claimOrder).not.toHaveBeenCalled();
  });

  it('does not advertise a report owned by a different account as claimable', async () => {
    mocks.getLinePayOrder.mockResolvedValue({ ...order, user_uid: 'account-b' });
    const { response, state } = res();
    await myReports(req({ headers: { ...req().headers, cookie: `__Host-kiwimu-v2-order=${ORDER_ID}` } }), response);
    expect(state.body.data.claimableReport).toBeNull();
  });

  it('fails closed when the order database is unavailable', async () => {
    mocks.listOrders.mockResolvedValue(undefined);
    const { response, state } = res();
    await myReports(req(), response);
    expect(state.status).toBe(503);
  });
});

describe('legacy purchase claim', () => {
  const withCookie = () => req({ headers: { ...req().headers, cookie: `__Host-kiwimu-v2-order=${ORDER_ID}` }, body: { userUid: 'account-b' } });
  it('binds a confirmed anonymous order to the authenticated account and sends its receipt', async () => {
    mocks.getLinePayOrder.mockResolvedValue({ ...order, user_uid: null });
    const { response, state } = res();
    await claimReport(withCookie(), response);
    expect(state.status).toBe(200);
    expect(mocks.claimOrder).toHaveBeenCalledWith(ORDER_ID, 'account-a');
    expect(mocks.sendReceipt).toHaveBeenCalledWith(ORDER_ID);
    expect(JSON.stringify(state.body)).not.toContain(ORDER_ID);
  });

  it('does not accept order proof sent in the body or a header', async () => {
    const { response, state } = res();
    await claimReport(req({ body: { orderId: ORDER_ID }, headers: { ...req().headers, 'x-v2-order-id': ORDER_ID } }), response);
    expect(state.status).toBe(400);
    expect(mocks.claimOrder).not.toHaveBeenCalled();
  });

  it.each(['requested', 'cancelled', 'confirm_failed'])('cannot claim an unpaid %s order', async status => {
    mocks.getLinePayOrder.mockResolvedValue({ ...order, user_uid: null, status });
    const { response, state } = res();
    await claimReport(withCookie(), response);
    expect(state.status).toBe(403);
    expect(mocks.claimOrder).not.toHaveBeenCalled();
  });

  it('never transfers an already claimed order to another account', async () => {
    mocks.getLinePayOrder.mockResolvedValue({ ...order, user_uid: 'account-b' });
    const { response, state } = res();
    await claimReport(withCookie(), response);
    expect(state.status).toBe(409);
    expect(mocks.claimOrder).not.toHaveBeenCalled();
    expect(mocks.sendReceipt).not.toHaveBeenCalled();
  });

  it('reports a conflicting concurrent claim without reporting success', async () => {
    mocks.getLinePayOrder.mockResolvedValue({ ...order, user_uid: null });
    mocks.claimOrder.mockResolvedValue(false);
    const { response, state } = res();
    await claimReport(withCookie(), response);
    expect(state.status).toBe(409);
    expect(mocks.sendReceipt).not.toHaveBeenCalled();
  });
});

describe('payment receipt retry', () => {
  it('retries only a confirmed purchase found under the verified account', async () => {
    const { response, state } = res();
    await receiptHandler(req({ body: { reference: paymentReceiptReference(ORDER_ID), to: 'someone-else@example.com' } }), response);
    expect(state.status).toBe(200);
    expect(mocks.listOrders).toHaveBeenCalledWith('account-a');
    expect(mocks.sendReceipt).toHaveBeenCalledWith(ORDER_ID);
  });

  it('does not use a receipt reference as an entitlement for another account', async () => {
    mocks.listOrders.mockResolvedValue([]);
    const { response, state } = res();
    await receiptHandler(req({ body: { reference: paymentReceiptReference(ORDER_ID) } }), response);
    expect(state.status).toBe(404);
    expect(mocks.sendReceipt).not.toHaveBeenCalled();
  });
});

describe.each([['list', myReports], ['claim', claimReport], ['receipt', receiptHandler]] as const)('%s account endpoint boundaries', (_name, handler) => {
  it('requires a valid session, not a mirror cookie', async () => {
    const { response, state } = res();
    await handler(req({ headers: { host: 'kiwimu.com', origin: 'https://kiwimu.com', cookie: 'kiwimu_uid=account-a' } }), response);
    expect(state.status).toBe(401);
  });
  it('blocks cross-origin requests before looking up the account', async () => {
    const { response, state } = res();
    await handler(req({ headers: { ...req().headers, origin: 'https://other.example' } }), response);
    expect(state.status).toBe(403);
    expect(mocks.getUser).not.toHaveBeenCalled();
  });
  it('rejects invalid and anonymous auth sessions', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { ...user, is_anonymous: true } }, error: null });
    const { response, state } = res();
    await handler(req(), response);
    expect(state.status).toBe(401);
    expect(mocks.listOrders).not.toHaveBeenCalled();
  });
});
