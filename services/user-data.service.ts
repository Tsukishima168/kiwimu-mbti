// user-data.service.ts — repository 邊界
//
// Phase 4b: Reads → 純 Supabase，移除 Firestore fallback

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

const generateRunId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}${random}`;
};

const generateShareId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}${random}`.toUpperCase();
};

// ─── Reads: Supabase only ─────────────────────────────────────────────────────

export const getUser = async (uid: string): Promise<UserDocument | null> => {
  try {
    return await getUserFromSupabase(uid);
  } catch (err) {
    console.error('[user-data] getUser: Supabase failed', err);
    return null;
  }
};

export const loadProgressFromCloud = async (
  uid: string,
  quizVersion: string = CURRENT_QUIZ_VERSION
): Promise<QuizProgress | null> => {
  try {
    return await loadQuizProgressFromSupabase(uid, quizVersion);
  } catch (err) {
    console.error('[user-data] loadProgressFromCloud: Supabase failed', err);
    return null;
  }
};

export const getUserPreferences = async (
  uid: string
): Promise<UserProfile['preferences'] | null> => {
  try {
    return await getUserPreferencesFromSupabase(uid);
  } catch (err) {
    console.error('[user-data] getUserPreferences: Supabase failed', err);
    return null;
  }
};

export const getTestRuns = async (uid: string): Promise<TestRun[]> => {
  try {
    return await getTestRunsFromSupabase(uid);
  } catch (err) {
    console.error('[user-data] getTestRuns: Supabase failed', err);
    return [];
  }
};

export const getLatestTestRun = async (uid: string): Promise<TestRun | null> => {
  try {
    return await getLatestTestRunFromSupabase(uid);
  } catch (err) {
    console.error('[user-data] getLatestTestRun: Supabase failed', err);
    return null;
  }
};

export const getSharedTestResult = async (shareId: string): Promise<TestRun | null> => {
  try {
    return await getSharedTestResultFromSupabase(shareId);
  } catch (err) {
    console.error('[user-data] getSharedTestResult: Supabase failed', err);
    return null;
  }
};

// ─── Writes: Supabase only ────────────────────────────────────────────────────

export const createOrUpdateUser = async (
  uid: string,
  data: Partial<UserDocument>
): Promise<void> => {
  const ok = await upsertUser(uid, {
    displayName: data.displayName,
    email: data.email,
    profile: data.profile ? (data.profile as unknown as Record<string, unknown>) : undefined,
  });
  if (!ok) {
    throw new Error(`[user-data] createOrUpdateUser: Supabase write failed uid=${uid}`);
  }
};

export const saveProgressToCloud = async (
  uid: string,
  progress: Omit<QuizProgress, 'uid'>
): Promise<void> => {
  const ok = await saveQuizProgressToSupabase(uid, progress);
  if (!ok) {
    throw new Error(`[user-data] saveProgressToCloud: Supabase write failed uid=${uid} quizVersion=${progress.quizVersion}`);
  }
};

export const deleteProgress = async (
  uid: string,
  quizVersion: string = CURRENT_QUIZ_VERSION
): Promise<void> => {
  const ok = await deleteQuizProgressFromSupabase(uid, quizVersion);
  if (!ok) {
    throw new Error(`[user-data] deleteProgress: Supabase write failed uid=${uid} quizVersion=${quizVersion}`);
  }
};

export const saveUserPreferences = async (
  uid: string,
  preferences: UserProfile['preferences']
): Promise<void> => {
  const ok = await saveUserPreferencesToSupabase(uid, preferences);
  if (!ok) {
    throw new Error(`[user-data] saveUserPreferences: Supabase write failed uid=${uid}`);
  }
};

export const completeUserProfileSetup = async (
  uid: string,
  input: UserProfileSetupInput
): Promise<void> => {
  const ok = await completeUserProfileSetupToSupabase(uid, input);
  if (!ok) {
    throw new Error(`[user-data] completeUserProfileSetup: Supabase write failed uid=${uid}`);
  }
};

export const saveTestRun = async (
  run: Omit<TestRun, 'id'>
): Promise<string> => {
  const finishedAt = run.finishedAt || Date.now();
  const runId = generateRunId();
  const shareId = generateShareId();
  const shareUrl = `https://kiwimu.com/r/${shareId}`;
  const normalizedRun: Omit<TestRun, 'id'> = { ...run, finishedAt };

  const ok = await saveTestRunToSupabase(runId, normalizedRun, shareId, shareUrl);
  if (!ok) {
    throw new Error(`[user-data] saveTestRun: Supabase write failed uid=${run.uid} runId=${runId}`);
  }

  return runId;
};
