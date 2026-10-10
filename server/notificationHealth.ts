import { getUserAdminDb } from './supabase/user-admin.js';
import { getEconomyAdminClient } from './economy/supabaseAdmin.js';

const SOURCES = {
  receipts: { table: 'v2_payment_receipts', statuses: ['pending', 'sending', 'sent', 'failed', 'review'] },
  merchant: { table: 'v2_merchant_notifications', statuses: ['pending', 'sending', 'sent', 'failed', 'review'] },
  quiz: { table: 'quiz_completion_notifications', statuses: ['sending', 'sent', 'review', 'retry'] },
} as const;
type NotificationSource = {
  availability: 'available' | 'unavailable';
  counts: Record<string, number> | null;
  staleSending: number | null;
  retry: { due: number; scheduled: number; missingTime: number } | null;
};

// Counts only. Never read recipients, payloads, order IDs, or completion IDs.
export async function readNotificationHealth(now = new Date()) {
  const paymentDb = getUserAdminDb();
  const quizDb = getEconomyAdminClient();
  const staleBefore = new Date(now.getTime() - 5 * 60_000).toISOString();
  const sources = Object.fromEntries(await Promise.all(Object.entries(SOURCES).map(async ([name, config]): Promise<[string, NotificationSource]> => {
    const db = name === 'quiz' ? quizDb : paymentDb;
    if (!db) return [name, { availability: 'unavailable', counts: null, staleSending: null, retry: null }];
    const signal = AbortSignal.timeout(4_000);
    const count = async (filter: (query: any) => any): Promise<number> => {
      const query = db.schema('public').from(config.table).select('status', { head: true, count: 'exact' });
      const result = await filter(query).abortSignal(signal);
      if (result.error || !Number.isSafeInteger(result.count) || result.count < 0) throw new Error('COUNT_UNAVAILABLE');
      return result.count;
    };
    try {
      const entries = await Promise.all(config.statuses.map(async status => [status, await count(q => q.eq('status', status))]));
      const staleSending = await count(q => q.eq('status', 'sending').lt('updated_at', staleBefore));
      const retry = name === 'quiz' ? {
        due: await count(q => q.eq('status', 'retry').lte('retry_at', now.toISOString())),
        scheduled: await count(q => q.eq('status', 'retry').gt('retry_at', now.toISOString())),
        missingTime: await count(q => q.eq('status', 'retry').is('retry_at', null)),
      } : null;
      return [name, { availability: 'available', counts: Object.fromEntries(entries), staleSending, retry }];
    } catch {
      return [name, { availability: 'unavailable', counts: null, staleSending: null, retry: null }];
    }
  })));
  return {
    version: 1,
    generatedAt: now.toISOString(),
    scope: 'recorded-notifications',
    providerAcceptanceOnly: true,
    sources,
  };
}
