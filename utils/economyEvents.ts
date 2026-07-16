import type { Option } from '../types';
import type { EconomyResponse, MbtiQuizVersion } from '../shared/economy';
import {
  MBTI_ATTEMPT_PROOF_PATTERN,
  UUID_PATTERN,
  parseEconomyResponse,
} from '../shared/economy';
import { getAuthSupabaseClient } from './supabaseAuthBridge';
import { rememberPendingEconomyClaim } from './economyClaims';

type AnswerIndex = 0 | 1;

interface EconomyQuestion {
  options: readonly [
    { value: Option['value'] },
    { value: Option['value'] },
  ];
}

export interface ReportMbtiCompletedInput {
  answers: Option[];
  questionBank: readonly EconomyQuestion[];
  quizVersion: MbtiQuizVersion;
}

export interface MbtiEconomyOutboxEntry {
  completionId: string;
  quizVersion: MbtiQuizVersion;
  answerIndices: AnswerIndex[];
  attemptProof: string | null;
  attemptNotBefore: number | null;
  attemptExpiresAt: number | null;
  createdAt: number;
  attempts: number;
  nextAttemptAt: number;
}

interface StoredMbtiAttempt {
  proof: string;
  expiresAt: number;
  notBefore: number;
}

const OUTBOX_KEY = 'kiwimu_economy_mbti_outbox_v1';
const ATTEMPT_KEY_PREFIX = 'kiwimu_economy_mbti_attempt_v1:';
const REQUEST_TIMEOUT_MS = 3_000;
const AUTH_TIMEOUT_MS = 1_000;
const MAX_OUTBOX_ENTRIES = 10;
const MAX_OUTBOX_AGE_MS = 7 * 24 * 60 * 60 * 1_000;
const RETRY_MAX_MS = 5 * 60 * 1_000;

let flushPromise: Promise<EconomyResponse | null> | null = null;
let retryTimer: ReturnType<typeof globalThis.setTimeout> | null = null;
const attemptPromises = new Map<MbtiQuizVersion, Promise<StoredMbtiAttempt | null>>();

export function encodeAnswerIndices(
  answers: Option[],
  questionBank: readonly EconomyQuestion[],
): AnswerIndex[] | null {
  if (answers.length !== questionBank.length) return null;

  const encoded: AnswerIndex[] = [];
  for (let index = 0; index < questionBank.length; index += 1) {
    const selected = answers[index]?.value;
    const optionIndex = questionBank[index].options.findIndex(option => option.value === selected);
    if (optionIndex !== 0 && optionIndex !== 1) return null;
    encoded.push(optionIndex);
  }
  return encoded;
}

export function buildMbtiCompletionRequest(
  input: ReportMbtiCompletedInput,
  completionId: string,
  attemptProof: string,
): Record<string, unknown> | null {
  if (!UUID_PATTERN.test(completionId) || !MBTI_ATTEMPT_PROOF_PATTERN.test(attemptProof)) return null;
  const answerIndices = encodeAnswerIndices(input.answers, input.questionBank);
  if (!answerIndices) return null;

  return {
    attempt_proof: attemptProof,
    completion_id: completionId,
    quiz_version: input.quizVersion,
    answer_indices: answerIndices,
  };
}

function isQuizVersion(value: unknown): value is MbtiQuizVersion {
  return value === 'v1-40' || value === 'v2-tw-40';
}

function parseOutboxEntry(value: unknown): MbtiEconomyOutboxEntry | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const entry = value as Partial<MbtiEconomyOutboxEntry>;
  if (
    typeof entry.completionId !== 'string' ||
    !UUID_PATTERN.test(entry.completionId) ||
    !isQuizVersion(entry.quizVersion) ||
    !Array.isArray(entry.answerIndices) ||
    entry.answerIndices.length !== 40 ||
    !entry.answerIndices.every(answer => answer === 0 || answer === 1) ||
    (entry.attemptProof !== null &&
      (typeof entry.attemptProof !== 'string' || !MBTI_ATTEMPT_PROOF_PATTERN.test(entry.attemptProof))) ||
    (entry.attemptNotBefore !== null &&
      (typeof entry.attemptNotBefore !== 'number' || !Number.isFinite(entry.attemptNotBefore))) ||
    (entry.attemptExpiresAt !== null &&
      (typeof entry.attemptExpiresAt !== 'number' || !Number.isFinite(entry.attemptExpiresAt))) ||
    typeof entry.createdAt !== 'number' ||
    !Number.isFinite(entry.createdAt) ||
    typeof entry.attempts !== 'number' ||
    !Number.isSafeInteger(entry.attempts) ||
    entry.attempts < 0 ||
    typeof entry.nextAttemptAt !== 'number' ||
    !Number.isFinite(entry.nextAttemptAt)
  ) {
    return null;
  }

  return entry as MbtiEconomyOutboxEntry;
}

function getStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function readMbtiEconomyOutbox(now = Date.now()): MbtiEconomyOutboxEntry[] {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(OUTBOX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(parseOutboxEntry)
      .filter((entry): entry is MbtiEconomyOutboxEntry =>
        Boolean(entry && now - entry.createdAt <= MAX_OUTBOX_AGE_MS))
      .slice(-MAX_OUTBOX_ENTRIES);
  } catch {
    return [];
  }
}

function writeOutbox(entries: MbtiEconomyOutboxEntry[]): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(OUTBOX_KEY, JSON.stringify(entries.slice(-MAX_OUTBOX_ENTRIES)));
    return true;
  } catch {
    return false;
  }
}

function readAttempt(quizVersion: MbtiQuizVersion, now = Date.now()): StoredMbtiAttempt | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(`${ATTEMPT_KEY_PREFIX}${quizVersion}`);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<StoredMbtiAttempt>;
    if (
      typeof value.proof !== 'string' ||
      !MBTI_ATTEMPT_PROOF_PATTERN.test(value.proof) ||
      typeof value.expiresAt !== 'number' ||
      value.expiresAt <= now ||
      typeof value.notBefore !== 'number' ||
      !Number.isFinite(value.notBefore)
    ) {
      storage.removeItem(`${ATTEMPT_KEY_PREFIX}${quizVersion}`);
      return null;
    }
    return value as StoredMbtiAttempt;
  } catch {
    return null;
  }
}

function writeAttempt(quizVersion: MbtiQuizVersion, attempt: StoredMbtiAttempt): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(`${ATTEMPT_KEY_PREFIX}${quizVersion}`, JSON.stringify(attempt));
    return true;
  } catch {
    return false;
  }
}

function clearAttempt(quizVersion: MbtiQuizVersion, proof: string) {
  const storage = getStorage();
  if (!storage) return;
  try {
    const current = readAttempt(quizVersion);
    if (current?.proof === proof) {
      storage.removeItem(`${ATTEMPT_KEY_PREFIX}${quizVersion}`);
    }
  } catch {
    // Storage can be disabled or cleared concurrently.
  }
}

async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number): Promise<T | null> {
  let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;
  try {
    return await Promise.race([
      Promise.resolve(promise),
      new Promise<null>(resolve => {
        timeoutId = globalThis.setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId !== null) globalThis.clearTimeout(timeoutId);
  }
}

async function getAccessToken(): Promise<string | null> {
  const authClient = getAuthSupabaseClient();
  if (!authClient) return null;
  try {
    const result = await withTimeout(authClient.auth.getSession(), AUTH_TIMEOUT_MS);
    return result?.data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

async function postEconomy(path: string, body: Record<string, unknown>): Promise<EconomyResponse | null> {
  const accessToken = await getAccessToken();
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      credentials: 'same-origin',
      keepalive: path.endsWith('/mbti-completed'),
      signal: controller.signal,
      body: JSON.stringify(body),
    });
    if (response.status >= 500) return null;
    const payload: unknown = await response.json();
    return parseEconomyResponse(payload);
  } catch {
    return null;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

async function issueAttempt(quizVersion: MbtiQuizVersion): Promise<StoredMbtiAttempt | null> {
  const response = await postEconomy('/api/economy/mbti-attempt', { quiz_version: quizVersion });
  if (!response?.ok) return null;

  const proof = response.data.attempt_proof;
  const expiresAt = response.data.expires_at;
  const notBefore = response.data.not_before;
  if (
    typeof proof !== 'string' ||
    !MBTI_ATTEMPT_PROOF_PATTERN.test(proof) ||
    typeof expiresAt !== 'string' ||
    !Number.isFinite(Date.parse(expiresAt)) ||
    Date.parse(expiresAt) <= Date.now() ||
    typeof notBefore !== 'string' ||
    !Number.isFinite(Date.parse(notBefore))
  ) {
    return null;
  }

  const attempt = {
    proof,
    expiresAt: Date.parse(expiresAt),
    notBefore: Date.parse(notBefore),
  } satisfies StoredMbtiAttempt;
  writeAttempt(quizVersion, attempt);
  return attempt;
}

export function prepareMbtiAttempt(quizVersion: MbtiQuizVersion): Promise<StoredMbtiAttempt | null> {
  const existing = readAttempt(quizVersion);
  if (existing) return Promise.resolve(existing);
  const pending = attemptPromises.get(quizVersion);
  if (pending) return pending;

  const request = issueAttempt(quizVersion).finally(() => {
    attemptPromises.delete(quizVersion);
  });
  attemptPromises.set(quizVersion, request);
  return request;
}

function scheduleNextFlush(entries: MbtiEconomyOutboxEntry[]) {
  if (retryTimer !== null) globalThis.clearTimeout(retryTimer);
  const next = entries.reduce<number | null>(
    (earliest, entry) => earliest === null || entry.nextAttemptAt < earliest ? entry.nextAttemptAt : earliest,
    null,
  );
  if (next === null) {
    retryTimer = null;
    return;
  }
  retryTimer = globalThis.setTimeout(() => {
    retryTimer = null;
    void flushMbtiEconomyOutbox();
  }, Math.max(0, next - Date.now()));
}

function retryEntry(entry: MbtiEconomyOutboxEntry, now = Date.now()) {
  entry.attempts += 1;
  entry.nextAttemptAt = now + Math.min(2 ** Math.min(entry.attempts, 8) * 1_000, RETRY_MAX_MS);
}

async function flushOutbox(): Promise<EconomyResponse | null> {
  const entries = readMbtiEconomyOutbox();
  const initialIds = new Set(entries.map(entry => entry.completionId));
  let lastResponse: EconomyResponse | null = null;

  for (let index = 0; index < entries.length;) {
    const entry = entries[index];
    const now = Date.now();
    if (entry.nextAttemptAt > now) {
      index += 1;
      continue;
    }

    let attempt = entry.attemptProof && entry.attemptNotBefore !== null &&
      entry.attemptExpiresAt !== null && entry.attemptExpiresAt > now
      ? { proof: entry.attemptProof, notBefore: entry.attemptNotBefore, expiresAt: entry.attemptExpiresAt }
      : null;
    if (!attempt || !MBTI_ATTEMPT_PROOF_PATTERN.test(attempt.proof)) {
      attempt = await prepareMbtiAttempt(entry.quizVersion);
      if (!attempt) {
        retryEntry(entry);
        index += 1;
        continue;
      }
      entry.attemptProof = attempt.proof;
      entry.attemptNotBefore = attempt.notBefore;
      entry.attemptExpiresAt = attempt.expiresAt;
    }

    if (attempt.notBefore > now) {
      entry.nextAttemptAt = attempt.notBefore;
      index += 1;
      continue;
    }

    const body = {
      attempt_proof: attempt.proof,
      completion_id: entry.completionId,
      quiz_version: entry.quizVersion,
      answer_indices: entry.answerIndices,
    };
    const response = await postEconomy('/api/economy/mbti-completed', body);
    if (!response || response.code === 'ROLLOUT_DISABLED') {
      retryEntry(entry);
      index += 1;
      continue;
    }

    const claimId = response.data.claim_id;
    const expiresAt = response.data.expires_at;
    if (
      response.code === 'AUTH_REQUIRED' &&
      typeof claimId === 'string' &&
      UUID_PATTERN.test(claimId) &&
      typeof expiresAt === 'string'
    ) {
      rememberPendingEconomyClaim(claimId, expiresAt);
    }

    lastResponse = response;
    clearAttempt(entry.quizVersion, attempt.proof);
    entries.splice(index, 1);
  }

  // A second completion can be queued while this flush awaits the network.
  // Merge entries not present in the original snapshot so the final write
  // cannot erase a newly persisted completion.
  const appendedDuringFlush = readMbtiEconomyOutbox()
    .filter(entry => !initialIds.has(entry.completionId));
  const mergedEntries = [...entries, ...appendedDuringFlush]
    .slice(-MAX_OUTBOX_ENTRIES);
  writeOutbox(mergedEntries);
  scheduleNextFlush(mergedEntries);
  return lastResponse;
}

export function flushMbtiEconomyOutbox(): Promise<EconomyResponse | null> {
  if (flushPromise) return flushPromise;
  flushPromise = flushOutbox().finally(() => {
    flushPromise = null;
  });
  return flushPromise;
}

export function queueMbtiCompleted(input: ReportMbtiCompletedInput): string | null {
  const completionId = crypto.randomUUID();
  const answerIndices = encodeAnswerIndices(input.answers, input.questionBank);
  if (!answerIndices) return null;

  const attempt = readAttempt(input.quizVersion);
  const entry: MbtiEconomyOutboxEntry = {
    completionId,
    quizVersion: input.quizVersion,
    answerIndices,
    attemptProof: attempt?.proof ?? null,
    attemptNotBefore: attempt?.notBefore ?? null,
    attemptExpiresAt: attempt?.expiresAt ?? null,
    createdAt: Date.now(),
    attempts: 0,
    nextAttemptAt: Date.now(),
  };
  const entries = readMbtiEconomyOutbox();
  entries.push(entry);
  if (!writeOutbox(entries)) return null;
  void flushMbtiEconomyOutbox();
  return completionId;
}

export async function reportMbtiCompleted(
  input: ReportMbtiCompletedInput,
): Promise<EconomyResponse | null> {
  const completionId = queueMbtiCompleted(input);
  if (!completionId) return null;
  return flushMbtiEconomyOutbox();
}

export function installMbtiEconomyOutboxRetry(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => undefined;
  const flush = () => void flushMbtiEconomyOutbox();
  const onVisibility = () => {
    if (document.visibilityState === 'visible') flush();
  };
  window.addEventListener('online', flush);
  window.addEventListener('focus', flush);
  document.addEventListener('visibilitychange', onVisibility);
  flush();
  return () => {
    window.removeEventListener('online', flush);
    window.removeEventListener('focus', flush);
    document.removeEventListener('visibilitychange', onVisibility);
    if (retryTimer !== null) {
      globalThis.clearTimeout(retryTimer);
      retryTimer = null;
    }
  };
}
