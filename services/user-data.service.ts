// user-data.service.ts — repository 邊界
//
// 對外介面與 firestore.service.ts 盡量一致，讓 useFirestoreSync 與設定頁只依賴這層。
// 策略：
//   Writes → Supabase-first，成功後鏡像 Firestore；Supabase 失敗則 fallback Firestore
//   Reads  → Supabase-first；Supabase 回 null 時 fallback Firestore（保留舊用戶路徑）

import {
  createOrUpdateUser as firestoreCreateOrUpdateUser,
  saveProgressToCloud as firestoreSaveProgressToCloud,
  deleteProgress as firestoreDeleteProgress,
  saveTestRun as firestoreSaveTestRun,
  saveUserPreferences as firestoreSaveUserPreferences,
  completeUserProfileSetup as firestoreCompleteUserProfileSetup,
  createFirestoreTestRunId,
  getUser as firestoreGetUser,
  getUserPreferences as firestoreGetUserPreferences,
  loadProgressFromCloud as firestoreLoadProgress,
  getTestRuns as firestoreGetTestRuns,
  getLatestTestRun as firestoreGetLatestTestRun,
  getSharedTestResult as firestoreGetSharedTestResult,
} from './firestore.service';

import {
  upsertUser,
  saveQuizProgressToSupabase,
  deleteQuizProgressFromSupabase,
  saveTestRunToSupabase,
  saveUserPreferencesToSupabase,
  completeUserProfileSetupToSupabase,
  getUserFromSupabase,
  getUserPreferencesFromSupabase,
  loadQuizProgressFromSupabase,
  getTestRunsFromSupabase,
  getLatestTestRunFromSupabase,
  getSharedTestResultFromSupabase,
} from './supabase-user.service';

import { CURRENT_QUIZ_VERSION } from '../constants/versions';
import type { UserDocument, QuizProgress, TestRun, UserProfile, UserProfileSetupInput } from '../types';

// ─── Internal helpers ─────────────────────────────────────────────────────────

const logWriteFailure = (source: 'Supabase' | 'Firestore', method: string, reason: unknown) => {
  console.error(`[user-data] ${method}: ${source} write failed`, reason);
};

const generateShareId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}${random}`.toUpperCase();
};

const mirrorToFirestore = async (
  method: string,
  action: () => Promise<void>
): Promise<boolean> => {
  try {
    await action();
    return true;
  } catch (error) {
    logWriteFailure('Firestore', method, error);
    return false;
  }
};

const fallbackToFirestore = async <T>(
  method: string,
  action: () => Promise<T>
): Promise<T> => {
  try {
    const value = await action();
    console.warn('[user-data] %s: source=firestore-fallback', method);
    return value;
  } catch (error) {
    logWriteFailure('Firestore', method, error);
    throw error;
  }
};

// ─── Reads: Supabase-first, Firestore fallback ────────────────────────────────

export const getUser = async (uid: string): Promise<UserDocument | null> => {
  try {
    const user = await getUserFromSupabase(uid);
    if (user != null) return user;
  } catch (err) {
    console.error('[user-data] getUser: Supabase failed', err);
  }
  console.log('[user-data] getUser: source=firestore-fallback uid=%s', uid);
  return firestoreGetUser(uid);
};

export const loadProgressFromCloud = async (
  uid: string,
  quizVersion: string = CURRENT_QUIZ_VERSION
): Promise<QuizProgress | null> => {
  try {
    const progress = await loadQuizProgressFromSupabase(uid, quizVersion);
    if (progress != null) return progress;
  } catch (err) {
    console.error('[user-data] loadProgressFromCloud: Supabase failed', err);
  }
  console.log('[user-data] loadProgressFromCloud: source=firestore-fallback uid=%s', uid);
  return firestoreLoadProgress(uid, quizVersion);
};

export const getUserPreferences = async (
  uid: string
): Promise<UserProfile['preferences'] | null> => {
  try {
    const preferences = await getUserPreferencesFromSupabase(uid);
    if (preferences != null) return preferences;
  } catch (err) {
    console.error('[user-data] getUserPreferences: Supabase failed', err);
  }
  console.log('[user-data] getUserPreferences: source=firestore-fallback uid=%s', uid);
  return firestoreGetUserPreferences(uid);
};

export const getTestRuns = async (uid: string): Promise<TestRun[]> => {
  try {
    const runs = await getTestRunsFromSupabase(uid);
    if (runs.length > 0) return runs;
  } catch (err) {
    console.error('[user-data] getTestRuns: Supabase failed', err);
  }
  console.log('[user-data] getTestRuns: source=firestore-fallback uid=%s', uid);
  return firestoreGetTestRuns(uid);
};

export const getLatestTestRun = async (uid: string): Promise<TestRun | null> => {
  try {
    const run = await getLatestTestRunFromSupabase(uid);
    if (run != null) return run;
  } catch (err) {
    console.error('[user-data] getLatestTestRun: Supabase failed', err);
  }
  console.log('[user-data] getLatestTestRun: source=firestore-fallback uid=%s', uid);
  return firestoreGetLatestTestRun(uid);
};

export const getSharedTestResult = async (shareId: string): Promise<TestRun | null> => {
  try {
    const run = await getSharedTestResultFromSupabase(shareId);
    if (run != null) return run;
  } catch (err) {
    console.error('[user-data] getSharedTestResult: Supabase failed', err);
  }
  console.log('[user-data] getSharedTestResult: source=firestore-fallback shareId=%s', shareId);
  return firestoreGetSharedTestResult(shareId);
};

// ─── Writes: Supabase-first with Firestore fallback ──────────────────────────

export const createOrUpdateUser = async (
  uid: string,
  data: Partial<UserDocument>
): Promise<void> => {
  const supabaseOk = await upsertUser(uid, {
    displayName: data.displayName,
    email: data.email,
    profile: data.profile ? (data.profile as unknown as Record<string, unknown>) : undefined,
  });

  if (supabaseOk) {
    const firestoreOk = await mirrorToFirestore('createOrUpdateUser', () =>
      firestoreCreateOrUpdateUser(uid, data, { skipSupabaseMirror: true })
    );

    if (!firestoreOk) {
      console.warn('[user-data] createOrUpdateUser: firestore mirror failed uid=%s', uid);
    }
    return;
  }

  await fallbackToFirestore('createOrUpdateUser', () =>
    firestoreCreateOrUpdateUser(uid, data, { skipSupabaseMirror: true })
  );
};

export const saveProgressToCloud = async (
  uid: string,
  progress: Omit<QuizProgress, 'uid'>
): Promise<void> => {
  const supabaseOk = await saveQuizProgressToSupabase(uid, progress);

  if (supabaseOk) {
    const firestoreOk = await mirrorToFirestore('saveProgressToCloud', () =>
      firestoreSaveProgressToCloud(uid, progress, { skipSupabaseMirror: true })
    );

    if (!firestoreOk) {
      console.warn('[user-data] saveProgressToCloud: firestore mirror failed uid=%s quizVersion=%s', uid, progress.quizVersion);
    }
    return;
  }

  await fallbackToFirestore('saveProgressToCloud', () =>
    firestoreSaveProgressToCloud(uid, progress, { skipSupabaseMirror: true })
  );
};

export const deleteProgress = async (
  uid: string,
  quizVersion: string = CURRENT_QUIZ_VERSION
): Promise<void> => {
  const supabaseOk = await deleteQuizProgressFromSupabase(uid, quizVersion);

  if (supabaseOk) {
    const firestoreOk = await mirrorToFirestore('deleteProgress', () =>
      firestoreDeleteProgress(uid, quizVersion, { skipSupabaseMirror: true })
    );

    if (!firestoreOk) {
      console.warn('[user-data] deleteProgress: firestore mirror failed uid=%s quizVersion=%s', uid, quizVersion);
    }
    return;
  }

  await fallbackToFirestore('deleteProgress', () =>
    firestoreDeleteProgress(uid, quizVersion, { skipSupabaseMirror: true })
  );
};

export const saveUserPreferences = async (
  uid: string,
  preferences: UserProfile['preferences']
): Promise<void> => {
  const supabaseOk = await saveUserPreferencesToSupabase(uid, preferences);

  if (supabaseOk) {
    const firestoreOk = await mirrorToFirestore('saveUserPreferences', () =>
      firestoreSaveUserPreferences(uid, preferences, { skipSupabaseMirror: true })
    );

    if (!firestoreOk) {
      console.warn('[user-data] saveUserPreferences: firestore mirror failed uid=%s', uid);
    }
    return;
  }

  await fallbackToFirestore('saveUserPreferences', () =>
    firestoreSaveUserPreferences(uid, preferences, { skipSupabaseMirror: true })
  );
};

export const completeUserProfileSetup = async (
  uid: string,
  input: UserProfileSetupInput
): Promise<void> => {
  const supabaseOk = await completeUserProfileSetupToSupabase(uid, input);

  if (supabaseOk) {
    const firestoreOk = await mirrorToFirestore('completeUserProfileSetup', () =>
      firestoreCompleteUserProfileSetup(uid, input, { skipSupabaseMirror: true })
    );

    if (!firestoreOk) {
      console.warn('[user-data] completeUserProfileSetup: firestore mirror failed uid=%s', uid);
    }
    return;
  }

  await fallbackToFirestore('completeUserProfileSetup', () =>
    firestoreCompleteUserProfileSetup(uid, input, { skipSupabaseMirror: true })
  );
};

export const saveTestRun = async (
  run: Omit<TestRun, 'id'>
): Promise<string> => {
  const finishedAt = run.finishedAt || Date.now();
  const runId = createFirestoreTestRunId();
  const shareId = generateShareId();
  const shareUrl = `https://kiwimu.com/r/${shareId}`;
  const normalizedRun: Omit<TestRun, 'id'> = {
    ...run,
    finishedAt,
  };

  const supabaseOk = await saveTestRunToSupabase(runId, normalizedRun, shareId, shareUrl);

  if (supabaseOk) {
    const firestoreOk = await mirrorToFirestore('saveTestRun', () =>
      firestoreSaveTestRun(normalizedRun, {
        preferredId: runId,
        preferredShareId: shareId,
        preferredShareUrl: shareUrl,
        preferredFinishedAt: finishedAt,
        skipSupabaseMirror: true,
      }).then(() => undefined)
    );

    if (!firestoreOk) {
      console.warn('[user-data] saveTestRun: firestore mirror failed uid=%s runId=%s', run.uid, runId);
    }

    return runId;
  }

  return fallbackToFirestore('saveTestRun', () =>
    firestoreSaveTestRun(normalizedRun, {
      preferredId: runId,
      preferredShareId: shareId,
      preferredShareUrl: shareUrl,
      preferredFinishedAt: finishedAt,
      skipSupabaseMirror: true,
    })
  );
};
