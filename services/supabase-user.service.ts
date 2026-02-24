// Supabase 用戶資料服務
// 鏡像 firestore.service.ts 的寫入操作，寫入 Moon Island Supabase
//
// 策略：Firebase 為主，Supabase 為副（過渡期雙寫）
// 所有函數永不 throw — Supabase 失敗只 log，不影響主流程

import { userDb } from '../supabase/user-client';
import type { QuizProgress, TestRun } from '../types';
import type { UserBehaviorData } from '../utils/userDataCollector';

// ─── Users ────────────────────────────────────────────────────────────────────

/**
 * 建立或更新用戶（對應 firestore createOrUpdateUser）
 */
export const upsertUser = async (
  uid: string,
  data: { displayName?: string; email?: string; profile?: Record<string, unknown> }
): Promise<void> => {
  if (!userDb) return;
  try {
    const { error } = await userDb
      .from('users')
      .upsert(
        {
          uid,
          display_name: data.displayName ?? null,
          email: data.email ?? null,
          profile: data.profile ?? {},
          last_active_at: new Date().toISOString(),
        },
        { onConflict: 'uid' }
      );
    if (error) console.error('[Supabase] upsertUser error:', error.message);
  } catch (err) {
    console.error('[Supabase] upsertUser exception:', err);
  }
};

// ─── Quiz Progress ─────────────────────────────────────────────────────────────

/**
 * 儲存測驗進度（對應 firestore saveProgressToCloud）
 */
export const saveQuizProgressToSupabase = async (
  uid: string,
  progress: Omit<QuizProgress, 'uid'>
): Promise<void> => {
  if (!userDb) return;
  try {
    const id = `${uid}_${progress.quizVersion}`;
    const { error } = await userDb
      .from('quiz_progress')
      .upsert(
        {
          id,
          uid,
          answers: progress.answers,
          current_index: progress.currentIndex,
          quiz_version: progress.quizVersion,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    if (error) console.error('[Supabase] saveQuizProgressToSupabase error:', error.message);
  } catch (err) {
    console.error('[Supabase] saveQuizProgressToSupabase exception:', err);
  }
};

/**
 * 刪除測驗進度（對應 firestore deleteProgress）
 */
export const deleteQuizProgressFromSupabase = async (
  uid: string,
  quizVersion: string
): Promise<void> => {
  if (!userDb) return;
  try {
    const id = `${uid}_${quizVersion}`;
    const { error } = await userDb
      .from('quiz_progress')
      .delete()
      .eq('id', id);
    if (error) console.error('[Supabase] deleteQuizProgressFromSupabase error:', error.message);
  } catch (err) {
    console.error('[Supabase] deleteQuizProgressFromSupabase exception:', err);
  }
};

// ─── Test Runs ─────────────────────────────────────────────────────────────────

/**
 * 儲存測驗結果 + 分享連結（對應 firestore saveTestRun）
 */
export const saveTestRunToSupabase = async (
  testId: string,
  run: Omit<TestRun, 'id'>,
  shareId: string,
  shareUrl: string
): Promise<void> => {
  if (!userDb) return;
  try {
    // 先確保用戶存在（外鍵約束）
    await upsertUser(run.uid, {});

    // 寫入測驗結果
    const { error: runError } = await userDb
      .from('test_runs')
      .insert({
        id: testId,
        uid: run.uid,
        mbti_type: run.mbtiType ?? null,
        result_type: run.resultType,
        suffix: run.suffix,
        scores: run.scores,
        quiz_version: run.quizVersion,
        scoring_version: run.scoringVersion,
        dessert_catalog_version: run.dessertCatalogVersion,
        finished_at: run.finishedAt ? new Date(run.finishedAt as number).toISOString() : new Date().toISOString(),
        share_id: shareId,
        share_url: shareUrl,
        is_public: true,
      });

    if (runError) {
      console.error('[Supabase] saveTestRunToSupabase (run) error:', runError.message);
      return; // 不寫 share_link（主記錄失敗）
    }

    // 寫入分享連結
    const { error: linkError } = await userDb
      .from('share_links')
      .insert({
        share_id: shareId,
        uid: run.uid,
        test_id: testId,
        mbti_type: run.mbtiType ?? null,
        created_at: new Date().toISOString(),
      });

    if (linkError) console.error('[Supabase] saveTestRunToSupabase (share_link) error:', linkError.message);
  } catch (err) {
    console.error('[Supabase] saveTestRunToSupabase exception:', err);
  }
};

// ─── User Behaviors ────────────────────────────────────────────────────────────

/**
 * 儲存用戶行為（對應 userDataCollector saveUserBehavior）
 */
export const saveUserBehaviorToSupabase = async (
  uid: string,
  data: Partial<UserBehaviorData>
): Promise<void> => {
  if (!userDb) return;
  try {
    const { error } = await userDb
      .from('user_behaviors')
      .insert({
        uid,
        session_id: data.sessionId ?? null,
        event_timestamp: data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString(),
        user_agent: data.userAgent ?? null,
        referrer: data.referrer ?? null,
        utm_source: data.utmSource ?? null,
        utm_medium: data.utmMedium ?? null,
        utm_campaign: data.utmCampaign ?? null,
        mbti_type: data.mbtiType ?? null,
        variant: data.variant ?? null,
        completion_time: data.completionTime ?? null,
        actions: data.actions ?? [],
        device: data.device ?? {},
      });
    if (error) console.error('[Supabase] saveUserBehaviorToSupabase error:', error.message);
  } catch (err) {
    console.error('[Supabase] saveUserBehaviorToSupabase exception:', err);
  }
};

// ─── User Stats ────────────────────────────────────────────────────────────────

/**
 * 更新用戶統計（對應 userDataCollector updateUserStats）
 * 注意：Firebase 用 increment()，Supabase 要先讀再寫
 */
export const upsertUserStats = async (
  uid: string,
  mbtiType?: string,
  variant?: string,
  utmSource?: string
): Promise<void> => {
  if (!userDb) return;
  try {
    // 讀取現有統計
    const { data: existing } = await userDb
      .from('user_stats')
      .select('total_sessions, mbti_types, sources')
      .eq('uid', uid)
      .single();

    const totalSessions = ((existing?.total_sessions as number) ?? 0) + 1;

    // 合併 mbtiTypes 計數
    const mbtiTypes: Record<string, number> = (existing?.mbti_types as Record<string, number>) ?? {};
    if (mbtiType) {
      mbtiTypes[mbtiType] = (mbtiTypes[mbtiType] ?? 0) + 1;
    }

    // 合併來源計數
    const sources: Record<string, number> = (existing?.sources as Record<string, number>) ?? {};
    if (utmSource) {
      sources[utmSource] = (sources[utmSource] ?? 0) + 1;
    }

    const { error } = await userDb
      .from('user_stats')
      .upsert(
        {
          uid,
          last_active: new Date().toISOString(),
          total_sessions: totalSessions,
          last_mbti_type: mbtiType ?? null,
          last_variant: variant ?? null,
          mbti_types: mbtiTypes,
          sources,
        },
        { onConflict: 'uid' }
      );

    if (error) console.error('[Supabase] upsertUserStats error:', error.message);
  } catch (err) {
    console.error('[Supabase] upsertUserStats exception:', err);
  }
};
