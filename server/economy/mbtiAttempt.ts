import type { MbtiQuizVersion } from '../../shared/economy.js';
import { isPlainRecord } from '../../shared/economy.js';

const ALLOWED_KEYS = new Set(['quiz_version']);

export interface ParsedMbtiAttemptRequest {
  quizVersion: MbtiQuizVersion;
}

export function isMbtiQuizVersion(value: unknown): value is MbtiQuizVersion {
  return value === 'v1-40' || value === 'v2-tw-40';
}

export function parseMbtiAttemptRequest(value: unknown): ParsedMbtiAttemptRequest | null {
  if (!isPlainRecord(value)) return null;
  if (Object.keys(value).some(key => !ALLOWED_KEYS.has(key))) return null;
  if (!isMbtiQuizVersion(value.quiz_version)) return null;

  return { quizVersion: value.quiz_version };
}
