import { beforeEach, describe, expect, it, vi } from 'vitest';
const { read } = vi.hoisted(() => ({ read: vi.fn() }));
vi.mock('../../notificationHealth.js', () => ({ readNotificationHealth: read }));
import handler from './notification-health';
function response() {
  return { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
}
const token = 'test-only-token-0123456789-abcdefgh';
beforeEach(() => { vi.resetAllMocks(); vi.stubEnv('NOTIFICATION_HEALTH_TOKEN', token); });
describe('private notification count endpoint', () => {
  it.each(['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'])('rejects %s before reading', async method => {
    const res = response();
    await handler({ method, headers: {} } as any, res as any);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(read).not.toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'GET');
  });
  it.each([undefined, '', 'short', ' '.repeat(40)])('fails closed without a strong configuration', async value => {
    vi.stubEnv('NOTIFICATION_HEALTH_TOKEN', value);
    const res = response();
    await handler({ method: 'GET', headers: { authorization: `Bearer ${token}` } } as any, res as any);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(read).not.toHaveBeenCalled();
  });
  it.each([undefined, 'Bearer incorrect', [`Bearer ${token}`], `Bearer ${token}, Bearer ${token}`, `Basic ${token}`, `Bearer ${token}\n`])('rejects invalid authorization before reading', async authorization => {
    const res = response();
    await handler({ method: 'GET', headers: { authorization } } as any, res as any);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(read).not.toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'private, no-store, max-age=0');
    expect(res.setHeader.mock.calls.some(([key]) => /access-control/i.test(key))).toBe(false);
  });
  it('retains unknown sources instead of reporting healthy zeros', async () => {
    const data = { sources: { quiz: { availability: 'available' }, receipts: { availability: 'unavailable', counts: null } } };
    read.mockResolvedValue(data);
    const res = response();
    await handler({ method: 'GET', headers: { authorization: `Bearer ${token}` } } as any, res as any);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true, data });
  });
  it('returns unavailable without exposing provider errors', async () => {
    read.mockRejectedValue(new Error('sensitive-provider-detail'));
    const res = response();
    await handler({ method: 'GET', headers: { authorization: `Bearer ${token}` } } as any, res as any);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(JSON.stringify(res.json.mock.calls)).not.toContain('sensitive-provider-detail');
  });
});
