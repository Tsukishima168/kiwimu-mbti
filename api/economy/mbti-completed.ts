import { randomUUID } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseEconomyResponse, type EconomyResponseCode } from '../../shared/economy.js';
import { parseMbtiAttemptRequest } from '../../server/economy/mbtiAttempt.js';
import { parseMbtiCompletion } from '../../server/economy/mbtiCompletion.js';
import {
  getBearerToken,
  jsonBodySize,
  requestOriginMatchesHost,
} from '../../server/economy/requestSecurity.js';
import { getEconomyAdminClient } from '../../server/economy/supabaseAdmin.js';

const MAX_REQUEST_BYTES = 4_096;
const ATTEMPT_TTL_MS = 2 * 60 * 60 * 1_000;
const PENDING_CLAIM_TTL_MS = 7 * 24 * 60 * 60 * 1_000;

function economyResponse(
  response: VercelResponse,
  status: number,
  requestId: string,
  code: EconomyResponseCode,
  data: Record<string, unknown> = {},
) {
  return response.status(status).json({ ok: code === 'OK', code, request_id: requestId, data });
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const requestId = randomUUID();
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');

  if (request.method === 'OPTIONS') return response.status(204).end();
  if (request.method !== 'POST') {
    return economyResponse(response, 405, requestId, 'NOT_ELIGIBLE');
  }
  if (!requestOriginMatchesHost(request)) {
    return economyResponse(response, 403, requestId, 'INVALID_PROOF');
  }

  if (jsonBodySize(request.body) > MAX_REQUEST_BYTES) {
    return economyResponse(response, 400, requestId, 'INVALID_PROOF');
  }

  const attemptRequest = parseMbtiAttemptRequest(request.body);
  const completion = attemptRequest ? null : parseMbtiCompletion(request.body);
  if (!attemptRequest && !completion) {
    return economyResponse(response, 400, requestId, 'INVALID_PROOF');
  }

  const admin = getEconomyAdminClient();
  if (!admin) {
    return economyResponse(response, 503, requestId, 'ROLLOUT_DISABLED');
  }

  const bearerToken = getBearerToken(request);
  let actorUserId: string | null = null;
  if (request.headers.authorization && !bearerToken) {
    return economyResponse(response, 401, requestId, 'AUTH_REQUIRED');
  }
  if (bearerToken) {
    const { data: authData, error: authError } = await admin.auth.getUser(bearerToken);
    if (authError || !authData.user) {
      return economyResponse(response, 401, requestId, 'AUTH_REQUIRED');
    }
    actorUserId = authData.user.id;
  }

  const rpcResult = attemptRequest
    ? await admin.rpc('economy_issue_mbti_attempt', {
        p_attempt_id: randomUUID(),
        p_quiz_version: attemptRequest.quizVersion,
        p_subject_user_id: actorUserId,
        p_expires_at: new Date(Date.now() + ATTEMPT_TTL_MS).toISOString(),
        p_request_id: requestId,
      })
    : await admin.rpc('economy_complete_mbti_attempt', {
        p_attempt_proof: completion!.attemptProof,
        p_completion_id: completion!.completionId,
        p_quiz_version: completion!.quizVersion,
        p_result_type: completion!.resultType,
        p_variant: completion!.variant,
        p_answers_sha256: completion!.answersSha256,
        p_actor_user_id: actorUserId,
        p_pending_expires_at: new Date(Date.now() + PENDING_CLAIM_TTL_MS).toISOString(),
        p_request_id: requestId,
      });

  if (rpcResult.error) {
    console.error('[economy] MBTI RPC unavailable', {
      requestId,
      operation: attemptRequest ? 'issue_attempt' : 'complete_attempt',
      authenticated: Boolean(actorUserId),
      code: rpcResult.error.code || null,
    });
    return economyResponse(response, 503, requestId, 'ROLLOUT_DISABLED');
  }

  const parsed = parseEconomyResponse(rpcResult.data, requestId);
  if (!parsed) {
    console.error('[economy] Invalid MBTI RPC response', {
      requestId,
      operation: attemptRequest ? 'issue_attempt' : 'complete_attempt',
    });
    return economyResponse(response, 502, requestId, 'NOT_ELIGIBLE');
  }

  return response.status(200).json(parsed);
}
