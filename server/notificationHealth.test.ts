import { beforeEach, expect, it, vi } from 'vitest';
const { user, economy } = vi.hoisted(() => ({ user: vi.fn(), economy: vi.fn() }));
vi.mock('./supabase/user-admin.js', () => ({ getUserAdminDb: user }));
vi.mock('./economy/supabaseAdmin.js', () => ({ getEconomyAdminClient: economy }));
import { readNotificationHealth } from './notificationHealth';
function client(result: { count?: number | null; error?: unknown } = { count: 2 }) {
  const query: any = { then: (resolve: any) => Promise.resolve(result).then(resolve) };
  for (const method of ['eq', 'lt', 'lte', 'gt', 'is', 'abortSignal']) query[method] = vi.fn().mockReturnValue(query);
  const select = vi.fn().mockReturnValue(query);
  const from = vi.fn().mockReturnValue({ select });
  const schema = vi.fn().mockReturnValue({ from });
  return { db: { schema }, schema, from, select, query };
}
beforeEach(() => vi.resetAllMocks());
it('uses the correct clients/public schema and HEAD counts, with every retry category', async () => {
  const payments = client(); const quizzes = client();
  user.mockReturnValue(payments.db); economy.mockReturnValue(quizzes.db);
  const data = await readNotificationHealth(new Date('2026-10-10T00:00:00.000Z'));
  expect(data.sources.receipts.counts).toEqual({ pending: 2, sending: 2, sent: 2, failed: 2, review: 2 });
  expect(data.sources.quiz.retry).toEqual({ due: 2, scheduled: 2, missingTime: 2 });
  expect(new Set(payments.from.mock.calls.map(([table]) => table))).toEqual(new Set(['v2_payment_receipts', 'v2_merchant_notifications']));
  expect(new Set(quizzes.from.mock.calls.map(([table]) => table))).toEqual(new Set(['quiz_completion_notifications']));
  for (const c of [payments, quizzes]) {
    expect(c.schema.mock.calls.every(([schema]) => schema === 'public')).toBe(true);
    expect(c.select.mock.calls.every(([columns, options]) => columns === 'status' && options.head === true && options.count === 'exact')).toBe(true);
    expect(c.query.lt).toHaveBeenCalledWith('updated_at', '2026-10-09T23:55:00.000Z');
  }
  expect(quizzes.query.is).toHaveBeenCalledWith('retry_at', null);
});
it.each([{ count: null }, { count: -1 }, { error: { message: 'secret' }, count: 0 }])('marks unavailable counts as unknown', async result => {
  user.mockReturnValue(client(result).db); economy.mockReturnValue(null);
  const data = await readNotificationHealth();
  expect(Object.values(data.sources).every(source => source.availability === 'unavailable' && source.counts === null)).toBe(true);
  expect(JSON.stringify(data)).not.toContain('secret');
});
