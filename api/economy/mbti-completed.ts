import { randomUUID } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseEconomyResponse, type EconomyResponseCode } from '../../shared/economy.js';
import {
  buildEconomyEvent,
  buildPendingEvidenceHash,
  parseMbtiCompletion,
} from '../../server/economy/mbtiCompletion.js';
import { getEconomyAdminClient } from '../../server/economy/supabaseAdmin.js';

const ANONYMOUS_ACTOR_PLACEHOLDER = '00000000-0000-4000-8000-000000000000';
const MAX_REQUEST_BYTES = 4_096;
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

function requestOriginMatchesHost(request: VercelRequest): boolean {
  const origin = request.headers.origin;
  if (!origin || Array.isArray(origin)) return false;

  const fetchSite = request.headers['sec-fetch-site'];
  if (fetchSite && fetchSite !== 'same-origin') return false;

  const forwardedHost = request.headers['x-forwarded-host'];
  const host = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || request.headers.host)
    ?.split(',')[0]
    .trim()
    .toLowerCase();
  if (!host) return false;

  try {
    return new URL(origin).host.toLowerCase() === host;
  } catch {
    return false;
  }
}

function getBearerToken(request: VercelRequest): string | null {
  const value = request.headers.authorization;
  if (!value || Array.isArray(value)) return null;
  const match = value.match(/^Bearer ([A-Za-z0-9._~-]+)$/);
  return match?.[1] ?? null;
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

  let bodySize = Number.POSITIVE_INFINITY;
  try {
    bodySize = Buffer.byteLength(JSON.stringify(request.body), 'utf8');
  } catch {
    // Invalid bodies are handled by the common proof error below.
  }
  if (bodySize > MAX_REQUEST_BYTES) {
    return economyResponse(response, 400, requestId, 'INVALID_PROOF');
  }

  const completion = parseMbtiCompletion(request.body);
  if (!completion) {
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

  const occurredAt = new Date();
  const event = buildEconomyEvent(
    completion,
    actorUserId ?? ANONYMOUS_ACTOR_PLACEHOLDER,
    occurredAt,
  );

  const rpcResult = actorUserId
    ? await admin.rpc('economy_submit_event', {
        p_event: event,
        p_request_id: requestId,
      })
    : await admin.rpc('economy_issue_pending_claim', {
        p_event: event,
        p_evidence_hash: buildPendingEvidenceHash(completion),
        p_expires_at: new Date(occurredAt.getTime() + PENDING_CLAIM_TTL_MS).toISOString(),
        p_request_id: requestId,
      });

  if (rpcResult.error) {
    console.error('[economy] MBTI event RPC unavailable', {
      requestId,
      authenticated: Boolean(actorUserId),
      code: rpcResult.error.code || null,
    });
    return economyResponse(response, 503, requestId, 'ROLLOUT_DISABLED');
  }

  const parsed = parseEconomyResponse(rpcResult.data, requestId);
  if (!parsed) {
    console.error('[economy] Invalid MBTI event RPC response', { requestId });
    return economyResponse(response, 502, requestId, 'NOT_ELIGIBLE');
  }

  return response.status(200).json(parsed);
}
