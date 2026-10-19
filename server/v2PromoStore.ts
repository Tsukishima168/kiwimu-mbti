import { V2_FREE_PROMO_ID } from '../shared/v2Promo.js';
import { getUserAdminDb } from './supabase/user-admin.js';

// 限時免費解鎖紀錄。這張表不是付款：不進 line_pay_orders、不計營收，
// 任何讀寫路徑都不會呼叫 notifyV2Payment（收據 Email／商家 Discord）。
const V2_PROMO_UNLOCKS_TABLE = 'v2_promo_unlocks';
const END_GUARD_CONSTRAINT = 'v2_promo_unlocks_before_end';
// 表尚未建立（migration 未套用）時，讀取視為「沒有免費解鎖」：仍是拒絕存取，
// 不讓付費使用者的報告與我的報告因為新表缺席而變成 503。
const MISSING_RELATION_CODES = new Set(['42P01', 'PGRST205']);

type StoreError = { code?: string; message?: string } | null | undefined;

export type V2PromoUnlockRecord = {
  mbti_type: string;
  created_at: string;
};

export type V2PromoInsertResult =
  | { status: 'created'; claimedAt: string }
  | { status: 'exists' }
  | { status: 'ended' }
  | { status: 'unavailable' };

const promoUnlocks = (db: ReturnType<typeof getUserAdminDb>) =>
  db.schema('public').from(V2_PROMO_UNLOCKS_TABLE);

function isMissingTable(error: StoreError): boolean {
  return Boolean(error?.code && MISSING_RELATION_CODES.has(error.code));
}

export async function hasV2PromoUnlock(userId: string, mbtiType: string): Promise<boolean | undefined> {
  const db = getUserAdminDb();
  if (!db) return undefined;
  try {
    const { data, error } = await promoUnlocks(db)
      .select('mbti_type')
      .eq('user_uid', userId)
      .eq('mbti_type', mbtiType)
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error('[v2 promo] entitlement lookup failed', { code: (error as StoreError)?.code });
      return isMissingTable(error) ? false : undefined;
    }
    return Boolean(data);
  } catch (error) {
    console.error('[v2 promo] entitlement lookup threw', error);
    return undefined;
  }
}

export async function listV2PromoUnlocksForUser(userId: string): Promise<V2PromoUnlockRecord[] | undefined> {
  const db = getUserAdminDb();
  if (!db) return undefined;
  try {
    const { data, error } = await promoUnlocks(db)
      .select('mbti_type,created_at')
      .eq('user_uid', userId)
      .order('created_at', { ascending: false })
      .limit(32);
    if (error) {
      console.error('[v2 promo] library lookup failed', { code: (error as StoreError)?.code });
      return isMissingTable(error) ? [] : undefined;
    }
    return (data || []) as V2PromoUnlockRecord[];
  } catch (error) {
    console.error('[v2 promo] library lookup threw', error);
    return undefined;
  }
}

// created_at 不由 API 提供：DB 以預設值帶入，並以常數 CHECK 擋下結束後的列。
export async function insertV2PromoUnlock(input: {
  userId: string;
  mbtiType: string;
  source: string | null;
}): Promise<V2PromoInsertResult> {
  const db = getUserAdminDb();
  if (!db) return { status: 'unavailable' };
  try {
    const { data, error } = await promoUnlocks(db)
      .insert({
        user_uid: input.userId,
        mbti_type: input.mbtiType,
        promo_id: V2_FREE_PROMO_ID,
        source: input.source,
      })
      .select('created_at')
      .maybeSingle();
    if (!error && data?.created_at) return { status: 'created', claimedAt: data.created_at };
    const storeError = error as StoreError;
    if (storeError?.code === '23505') return { status: 'exists' };
    if (storeError?.code === '23514' && storeError.message?.includes(END_GUARD_CONSTRAINT)) {
      return { status: 'ended' };
    }
    console.error('[v2 promo] insert failed', { code: storeError?.code });
    return { status: 'unavailable' };
  } catch (error) {
    console.error('[v2 promo] insert threw', error);
    return { status: 'unavailable' };
  }
}
