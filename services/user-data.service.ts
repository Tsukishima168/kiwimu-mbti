// user-data.service.ts — repository 邊界
//
// 對外介面與 firestore.service.ts 盡量一致，讓 useFirestoreSync 與設定頁只依賴這層。
// 策略：
//   Writes → Supabase-first，成功後鏡像 Firestore；Supabase 失敗則 fallback Firestore
//   Reads  → 保守 arbitration，只有 parity OK 才採用 Supabase
//
// Firebase uid ↔ Supabase uid 不一致的舊用戶：Supabase 命中失敗時維持 Firestore fallback。

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
  getSharedTestResultFromSupabase,
} from './supabase-user.service';

import { CURRENT_QUIZ_VERSION } from '../constants/versions';
import type { UserDocument, QuizProgress, TestRun, UserProfile, UserProfileSetupInput } from '../types';

// ─── Reads: Supabase-first ────────────────────────────────────────────────────

type SettledValue<T> = PromiseSettledResult<T>;

const logReadFailure = (source: 'Supabase' | 'Firestore', method: string, reason: unknown) => {
  console.error(`[user-data] ${method}: ${source} read failed`, reason);
};

const logWriteFailure = (source: 'Supabase' | 'Firestore', method: string, reason: unknown) => {
  console.error(`[user-data] ${method}: ${source} write failed`, reason);
};

const getSettledValue = <T>(result: SettledValue<T>, source: 'Supabase' | 'Firestore', method: string): T | null => {
  if (result.status === 'fulfilled') {
    return result.value;
  }

  logReadFailure(source, method, result.reason);
  return null;
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

const sortTestRunsByFinishedAtDesc = (runs: TestRun[]): TestRun[] =>
  [...runs].sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0));

const getUserSignature = (user: UserDocument | null): string => JSON.stringify(user ? {
  uid: user.uid,
  displayName: user.displayName ?? null,
  email: user.email ?? null,
  createdAt: user.createdAt,
  lastActiveAt: user.lastActiveAt,
  profile: user.profile ?? null,
} : null);

const getQuizProgressSignature = (progress: QuizProgress | null): string => JSON.stringify(progress ? {
  uid: progress.uid,
  answers: progress.answers,
  currentIndex: progress.currentIndex,
  quizVersion: progress.quizVersion,
  updatedAt: progress.updatedAt,
} : null);

const getUserPreferencesSignature = (
  preferences: UserProfile['preferences'] | null
): string => JSON.stringify(preferences ?? null);

const getTestRunSignature = (run: TestRun): string => JSON.stringify({
  id: run.id ?? null,
  uid: run.uid,
  mbtiType: run.mbtiType ?? null,
  resultType: run.resultType,
  suffix: run.suffix,
  scores: run.scores,
  quizVersion: run.quizVersion,
  scoringVersion: run.scoringVersion,
  dessertCatalogVersion: run.dessertCatalogVersion,
  finishedAt: run.finishedAt,
  shareId: run.shareId ?? null,
  shareUrl: run.shareUrl ?? null,
  isPublic: run.isPublic ?? true,
});

const hasExactTestRunParity = (supabaseRuns: TestRun[], firestoreRuns: TestRun[]): boolean => {
  if (supabaseRuns.length !== firestoreRuns.length) {
    return false;
  }

  return supabaseRuns.every((run, index) => getTestRunSignature(run) === getTestRunSignature(firestoreRuns[index]));
};

const choosePreferredSingle = <T>(
  method: string,
  identifierLabel: string,
  identifier: string,
  supabaseValue: T | null,
  firestoreValue: T | null,
  getSignature: (value: T | null) => string
): T | null => {
  if (supabaseValue == null && firestoreValue == null) {
    return null;
  }

  if (firestoreValue == null) {
    console.log('[user-data] %s: source=supabase (firestore-empty %s=%s)', method, identifierLabel, identifier);
    return supabaseValue;
  }

  if (supabaseValue == null) {
    console.log('[user-data] %s: source=firestore (supabase-empty %s=%s)', method, identifierLabel, identifier);
    return firestoreValue;
  }

  if (getSignature(supabaseValue) === getSignature(firestoreValue)) {
    console.log('[user-data] %s: source=supabase (parity-ok %s=%s)', method, identifierLabel, identifier);
    return supabaseValue;
  }

  console.warn('[user-data] %s: source=firestore (parity-mismatch %s=%s)', method, identifierLabel, identifier);
  return firestoreValue;
};

const loadPreferredTestRuns = async (uid: string): Promise<TestRun[]> => {
  const [supabaseResult, firestoreResult] = await Promise.allSettled([
    getTestRunsFromSupabase(uid),
    firestoreGetTestRuns(uid),
  ]);

  const supabaseRuns = sortTestRunsByFinishedAtDesc(
    getSettledValue(supabaseResult, 'Supabase', 'getTestRuns') ?? []
  );
  const firestoreRuns = sortTestRunsByFinishedAtDesc(
    getSettledValue(firestoreResult, 'Firestore', 'getTestRuns') ?? []
  );

  if (supabaseRuns.length === 0 && firestoreRuns.length === 0) {
    return [];
  }

  if (firestoreRuns.length === 0) {
    console.log('[user-data] getTestRuns: source=supabase (firestore-empty uid=%s)', uid);
    return supabaseRuns;
  }

  if (supabaseRuns.length === 0) {
    console.log('[user-data] getTestRuns: source=firestore (supabase-empty uid=%s)', uid);
    return firestoreRuns;
  }

  if (hasExactTestRunParity(supabaseRuns, firestoreRuns)) {
    console.log('[user-data] getTestRuns: source=supabase (parity-ok uid=%s count=%d)', uid, supabaseRuns.length);
    return supabaseRuns;
  }

  console.warn(
    '[user-data] getTestRuns: source=firestore (parity-mismatch uid=%s supabase=%d firestore=%d)',
    uid,
    supabaseRuns.length,
    firestoreRuns.length
  );
  return firestoreRuns;
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

export const getUser = async (uid: string): Promise<UserDocument | null> => {
  const [supabaseResult, firestoreResult] = await Promise.allSettled([
    getUserFromSupabase(uid),
    firestoreGetUser(uid),
  ]);

  const supabaseUser = getSettledValue(supabaseResult, 'Supabase', 'getUser');
  const firestoreUser = getSettledValue(firestoreResult, 'Firestore', 'getUser');

  return choosePreferredSingle('getUser', 'uid', uid, supabaseUser, firestoreUser, getUserSignature);
};

export const loadProgressFromCloud = async (
  uid: string,
  quizVersion: string = CURRENT_QUIZ_VERSION
): Promise<QuizProgress | null> => {
  const [supabaseResult, firestoreResult] = await Promise.allSettled([
    loadQuizProgressFromSupabase(uid, quizVersion),
    firestoreLoadProgress(uid, quizVersion),
  ]);

  const supabaseProgress = getSettledValue(supabaseResult, 'Supabase', 'loadProgressFromCloud');
  const firestoreProgress = getSettledValue(firestoreResult, 'Firestore', 'loadProgressFromCloud');

  return choosePreferredSingle(
    'loadProgressFromCloud',
    'uid',
    uid,
    supabaseProgress,
    firestoreProgress,
    getQuizProgressSignature
  );
};

export const getUserPreferences = async (
  uid: string
): Promise<UserProfile['preferences'] | null> => {
  const [supabaseResult, firestoreResult] = await Promise.allSettled([
    getUserPreferencesFromSupabase(uid),
    firestoreGetUserPreferences(uid),
  ]);

  const supabasePreferences = getSettledValue(supabaseResult, 'Supabase', 'getUserPreferences');
  const firestorePreferences = getSettledValue(firestoreResult, 'Firestore', 'getUserPreferences');

  return choosePreferredSingle(
    'getUserPreferences',
    'uid',
    uid,
    supabasePreferences,
    firestorePreferences,
    getUserPreferencesSignature
  );
};

export const getTestRuns = async (uid: string): Promise<TestRun[]> => {
  return loadPreferredTestRuns(uid);
};

export const getLatestTestRun = async (uid: string): Promise<TestRun | null> => {
  const runs = await loadPreferredTestRuns(uid);
  return runs[0] ?? null;
};

export const getSharedTestResult = async (shareId: string): Promise<TestRun | null> => {
  const [supabaseResult, firestoreResult] = await Promise.allSettled([
    getSharedTestResultFromSupabase(shareId),
    firestoreGetSharedTestResult(shareId),
  ]);

  const supabaseRun = getSettledValue(supabaseResult, 'Supabase', 'getSharedTestResult');
  const firestoreRun = getSettledValue(firestoreResult, 'Firestore', 'getSharedTestResult');

  return choosePreferredSingle(
    'getSharedTestResult',
    'shareId',
    shareId,
    supabaseRun,
    firestoreRun,
    (run) => JSON.stringify(run ? getTestRunSignature(run) : null)
  );
};
