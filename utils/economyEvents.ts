import type { Option } from '../types';
import type { EconomyResponse, MbtiQuizVersion } from '../shared/economy';
import { parseEconomyResponse, UUID_PATTERN } from '../shared/economy';
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

interface ReportMbtiCompletedOptions {
  retry?: boolean;
}

const REQUEST_TIMEOUT_MS = 3_000;

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
): Record<string, unknown> | null {
  if (!UUID_PATTERN.test(completionId)) return null;
  const answerIndices = encodeAnswerIndices(input.answers, input.questionBank);
  if (!answerIndices) return null;

  return {
    completion_id: completionId,
    quiz_version: input.quizVersion,
    answer_indices: answerIndices,
  };
}

async function fetchEconomyEvent(
  body: Record<string, unknown>,
  accessToken: string | null,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch('/api/economy/mbti-completed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      credentials: 'same-origin',
      keepalive: true,
      signal: controller.signal,
      body: JSON.stringify(body),
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function reportMbtiCompleted(
  input: ReportMbtiCompletedInput,
  options: ReportMbtiCompletedOptions = {},
): Promise<EconomyResponse | null> {
  try {
    const completionId = crypto.randomUUID();
    const requestBody = buildMbtiCompletionRequest(input, completionId);
    if (!requestBody) return null;

    const authClient = getAuthSupabaseClient();
    let accessToken: string | null = null;
    if (authClient) {
      try {
        const { data: { session } } = await authClient.auth.getSession();
        accessToken = session?.access_token ?? null;
      } catch {
        // The server will issue an anonymous pending claim when auth storage is unavailable.
      }
    }

    let response: Response | null = null;
    const maxAttempts = options.retry === false ? 1 : 2;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        response = await fetchEconomyEvent(requestBody, accessToken);
        if (response.status < 500) break;
      } catch {
        if (attempt === maxAttempts - 1) return null;
      }
    }
    if (!response) return null;

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      return null;
    }

    const parsed = parseEconomyResponse(payload);
    if (!parsed) return null;

    const claimId = parsed.data.claim_id;
    const expiresAt = parsed.data.expires_at;
    if (
      parsed.code === 'AUTH_REQUIRED' &&
      typeof claimId === 'string' &&
      UUID_PATTERN.test(claimId) &&
      typeof expiresAt === 'string'
    ) {
      rememberPendingEconomyClaim(claimId, expiresAt);
    }

    return parsed;
  } catch {
    return null;
  }
}
