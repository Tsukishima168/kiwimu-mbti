// Supabase 用戶資料服務
// 寫入 Moon Island Supabase 的 mbti schema。
//
// 策略：Supabase-only。Firebase / Firestore 已不再是 runtime fallback。
// 所有函數永不 throw — repository 邊界由 user-data.service.ts 決定是否升級錯誤。

import { userDb } from '../supabase/user-client';
import type {
  QuizProgress,
  TestRun,
  UserDocument,
  UserProfile,
  UserProfileSetupInput,
  Option,
  Score,
} from '../types';
import type { UserBehaviorData } from '../utils/userDataCollector';

// ─── Users ────────────────────────────────────────────────────────────────────

/**
 * 建立或更新用戶（對應 firestore createOrUpdateUser）
 */
export const upsertUser = async (
  uid: string,
  data: { displayName?: string; email?: string; profile?: Record<string, unknown> }
): Promise<boolean> => {
  if (!userDb) return false;
  try {
    const payload: Record<string, unknown> = {
      uid,
      last_active_at: new Date().toISOString(),
    };

    if (data.displayName !== undefined) {
      payload.display_name = data.displayName ?? null;
    }

    if (data.email !== undefined) {
      payload.email = data.email ?? null;
    }

    if (data.profile !== undefined) {
      payload.profile = data.profile;
    }

    const { error } = await userDb
      .from('users')
      .upsert(payload, { onConflict: 'uid' });
    if (error) {
      console.error('[Supabase] upsertUser error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] upsertUser exception:', err);
    return false;
  }
};

const getRawUserRowFromSupabase = async (uid: string): Promise<Record<string, unknown> | null> => {
  if (!userDb) return null;
  try {
    const { data, error } = await userDb
      .from('users')
      .select('uid, display_name, email, profile, last_active_at, created_at')
      .eq('uid', uid)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Record<string, unknown>;
  } catch (err) {
    console.error('[Supabase] getRawUserRowFromSupabase exception:', err);
    return null;
  }
};

const mergeUserProfile = (
  existingProfile: UserProfile | undefined,
  profilePatch: Partial<UserProfile>
): UserProfile => ({
  ...(existingProfile ?? {}),
  ...profilePatch,
  preferences: {
    ...(existingProfile?.preferences ?? {}),
    ...(profilePatch.preferences ?? {}),
    notifications: {
      ...(existingProfile?.preferences?.notifications ?? {}),
      ...(profilePatch.preferences?.notifications ?? {}),
    },
    privacy: {
      ...(existingProfile?.preferences?.privacy ?? {}),
      ...(profilePatch.preferences?.privacy ?? {}),
    },
  } as UserProfile['preferences'],
  setup: profilePatch.setup === undefined
    ? existingProfile?.setup
    : {
      ...(existingProfile?.setup ?? {}),
      ...profilePatch.setup,
    },
});

// ─── Quiz Progress ─────────────────────────────────────────────────────────────

/**
 * 儲存測驗進度（對應 firestore saveProgressToCloud）
 */
export const saveQuizProgressToSupabase = async (
  uid: string,
  progress: Omit<QuizProgress, 'uid'>
): Promise<boolean> => {
  if (!userDb) return false;
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
    if (error) {
      console.error('[Supabase] saveQuizProgressToSupabase error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] saveQuizProgressToSupabase exception:', err);
    return false;
  }
};

/**
 * 刪除測驗進度（對應 firestore deleteProgress）
 */
export const deleteQuizProgressFromSupabase = async (
  uid: string,
  quizVersion: string
): Promise<boolean> => {
  if (!userDb) return false;
  try {
    const id = `${uid}_${quizVersion}`;
    const { error } = await userDb
      .from('quiz_progress')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('[Supabase] deleteQuizProgressFromSupabase error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] deleteQuizProgressFromSupabase exception:', err);
    return false;
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
): Promise<boolean> => {
  if (!userDb) return false;
  try {
    // 先確保用戶存在（外鍵約束）
    const userOk = await upsertUser(run.uid, {});
    if (!userOk) {
      return false;
    }

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
      return false; // 不寫 share_link（主記錄失敗）
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

    if (linkError) {
      console.error('[Supabase] saveTestRunToSupabase (share_link) error:', linkError.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] saveTestRunToSupabase exception:', err);
    return false;
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

// ─── READ operations ──────────────────────────────────────────────────────────

/**
 * 讀取用戶資料（Supabase primary read）
 */
export const getUserFromSupabase = async (uid: string): Promise<UserDocument | null> => {
  const row = await getRawUserRowFromSupabase(uid);
  if (!row) return null;
  return {
    uid: row.uid as string,
    displayName: (row.display_name as string | null) ?? undefined,
    email: (row.email as string | null) ?? undefined,
    createdAt: row.created_at ? new Date(row.created_at as string).getTime() : 0,
    lastActiveAt: new Date(row.last_active_at as string).getTime() || 0,
    profile: row.profile as UserProfile | undefined,
  };
};

export const getUserProfileFromSupabase = async (uid: string): Promise<UserProfile | null> => {
  const row = await getRawUserRowFromSupabase(uid);
  return (row?.profile as UserProfile | undefined) ?? null;
};

export const getUserPreferencesFromSupabase = async (
  uid: string
): Promise<UserProfile['preferences'] | null> => {
  const profile = await getUserProfileFromSupabase(uid);
  return profile?.preferences ?? null;
};

export const saveUserPreferencesToSupabase = async (
  uid: string,
  preferences: UserProfile['preferences']
): Promise<boolean> => {
  if (!userDb) return false;
  try {
    const existing = await getRawUserRowFromSupabase(uid);
    const existingProfile = existing?.profile as UserProfile | undefined;
    const profile = mergeUserProfile(existingProfile, { preferences });

    return await upsertUser(uid, {
      displayName: (existing?.display_name as string | null) ?? undefined,
      email: (existing?.email as string | null) ?? undefined,
      profile: profile as unknown as Record<string, unknown>,
    });
  } catch (err) {
    console.error('[Supabase] saveUserPreferencesToSupabase exception:', err);
    return false;
  }
};

export const completeUserProfileSetupToSupabase = async (
  uid: string,
  input: UserProfileSetupInput
): Promise<boolean> => {
  if (!userDb) return false;
  try {
    const existing = await getRawUserRowFromSupabase(uid);
    const existingProfile = existing?.profile as UserProfile | undefined;
    const profile = mergeUserProfile(existingProfile, {
      setup: {
        nickname: input.displayName,
        birthday: input.birthday ?? null,
        city: input.city ?? null,
        interests: input.interests,
        completed: true,
        completedAt: Date.now(),
      },
    });

    return await upsertUser(uid, {
      displayName: input.displayName,
      email: input.email ?? ((existing?.email as string | null) ?? undefined),
      profile: profile as unknown as Record<string, unknown>,
    });
  } catch (err) {
    console.error('[Supabase] completeUserProfileSetupToSupabase exception:', err);
    return false;
  }
};

/**
 * 讀取測驗進度（Supabase primary read）
 */
export const loadQuizProgressFromSupabase = async (
  uid: string,
  quizVersion: string
): Promise<QuizProgress | null> => {
  if (!userDb) return null;
  try {
    const id = `${uid}_${quizVersion}`;
    const { data, error } = await userDb
      .from('quiz_progress')
      .select('uid, answers, current_index, quiz_version, updated_at')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    const row = data as Record<string, unknown>;
    return {
      uid: row.uid as string,
      answers: row.answers as Option[],
      currentIndex: row.current_index as number,
      quizVersion: row.quiz_version as string,
      updatedAt: new Date(row.updated_at as string).getTime() || 0,
    };
  } catch (err) {
    console.error('[Supabase] loadQuizProgressFromSupabase exception:', err);
    return null;
  }
};

/**
 * 讀取所有測驗結果（Supabase primary read）
 */
export const getTestRunsFromSupabase = async (uid: string): Promise<TestRun[]> => {
  if (!userDb) return [];
  try {
    const { data, error } = await userDb
      .from('test_runs')
      .select('id, uid, mbti_type, result_type, suffix, scores, quiz_version, scoring_version, dessert_catalog_version, finished_at, share_id, share_url, is_public')
      .eq('uid', uid)
      .order('finished_at', { ascending: false });
    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map(row => ({
      id: row.id as string,
      uid: row.uid as string,
      mbtiType: (row.mbti_type as string | null) ?? undefined,
      resultType: row.result_type as string,
      suffix: row.suffix as 'A' | 'T',
      scores: row.scores as Score,
      quizVersion: row.quiz_version as string,
      scoringVersion: row.scoring_version as string,
      dessertCatalogVersion: row.dessert_catalog_version as string,
      finishedAt: new Date(row.finished_at as string).getTime() || 0,
      shareId: (row.share_id as string | null) ?? undefined,
      shareUrl: (row.share_url as string | null) ?? undefined,
      isPublic: (row.is_public as boolean | null) ?? true,
    }));
  } catch (err) {
    console.error('[Supabase] getTestRunsFromSupabase exception:', err);
    return [];
  }
};

/**
 * 讀取最新測驗結果（Supabase primary read）
 */
export const getLatestTestRunFromSupabase = async (uid: string): Promise<TestRun | null> => {
  if (!userDb) return null;
  try {
    const { data, error } = await userDb
      .from('test_runs')
      .select('id, uid, mbti_type, result_type, suffix, scores, quiz_version, scoring_version, dessert_catalog_version, finished_at, share_id, share_url, is_public')
      .eq('uid', uid)
      .order('finished_at', { ascending: false })
      .limit(1)
      .single();
    if (error || !data) return null;
    const row = data as Record<string, unknown>;
    return {
      id: row.id as string,
      uid: row.uid as string,
      mbtiType: (row.mbti_type as string | null) ?? undefined,
      resultType: row.result_type as string,
      suffix: row.suffix as 'A' | 'T',
      scores: row.scores as Score,
      quizVersion: row.quiz_version as string,
      scoringVersion: row.scoring_version as string,
      dessertCatalogVersion: row.dessert_catalog_version as string,
      finishedAt: new Date(row.finished_at as string).getTime() || 0,
      shareId: (row.share_id as string | null) ?? undefined,
      shareUrl: (row.share_url as string | null) ?? undefined,
      isPublic: (row.is_public as boolean | null) ?? true,
    };
  } catch (err) {
    console.error('[Supabase] getLatestTestRunFromSupabase exception:', err);
    return null;
  }
};

/**
 * 透過 shareId 讀取分享結果（Supabase primary read）
 */
export const getSharedTestResultFromSupabase = async (shareId: string): Promise<TestRun | null> => {
  if (!userDb) return null;
  try {
    // 先查 share_links 拿 test_id
    const { data: linkData, error: linkError } = await userDb
      .from('share_links')
      .select('test_id')
      .eq('share_id', shareId)
      .single();
    if (linkError || !linkData) return null;
    const testId = (linkData as Record<string, unknown>).test_id as string;

    // 再查 test_runs
    const { data, error } = await userDb
      .from('test_runs')
      .select('id, uid, mbti_type, result_type, suffix, scores, quiz_version, scoring_version, dessert_catalog_version, finished_at, share_id, share_url, is_public')
      .eq('id', testId)
      .single();
    if (error || !data) return null;
    const row = data as Record<string, unknown>;
    if (row.is_public === false) return null;
    return {
      id: row.id as string,
      uid: row.uid as string,
      mbtiType: (row.mbti_type as string | null) ?? undefined,
      resultType: row.result_type as string,
      suffix: row.suffix as 'A' | 'T',
      scores: row.scores as Score,
      quizVersion: row.quiz_version as string,
      scoringVersion: row.scoring_version as string,
      dessertCatalogVersion: row.dessert_catalog_version as string,
      finishedAt: new Date(row.finished_at as string).getTime() || 0,
      shareId: (row.share_id as string | null) ?? undefined,
      shareUrl: (row.share_url as string | null) ?? undefined,
      isPublic: (row.is_public as boolean | null) ?? true,
    };
  } catch (err) {
    console.error('[Supabase] getSharedTestResultFromSupabase exception:', err);
    return null;
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
