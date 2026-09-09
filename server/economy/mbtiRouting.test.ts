import { describe, expect, it } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../api/economy/[operation]';

function request(operation: string, body: Record<string, unknown>): VercelRequest {
  return {
    method: 'POST',
    headers: {
      origin: 'https://kiwimu.com',
      host: 'kiwimu.com',
      'sec-fetch-site': 'same-origin',
    },
    query: { operation },
    body,
  } as unknown as VercelRequest;
}

function response() {
  const state: { status?: number; body?: any } = {};
  const res = {
    setHeader() { return res; },
    status(code: number) { state.status = code; return res; },
    json(body: unknown) { state.body = body; return res; },
    end() { return res; },
  } as unknown as VercelResponse;
  return { res, state };
}

describe('MBTI economy route separation', () => {
  it('does not issue an attempt proof through the completion endpoint', async () => {
    const { res, state } = response();
    await handler(request('mbti-completed', { quiz_version: 'v1-40' }), res);

    expect(state.status).toBe(400);
    expect(state.body).toMatchObject({ code: 'INVALID_PROOF' });
  });

  it('does not accept completion-shaped payloads through the attempt endpoint', async () => {
    const { res, state } = response();
    await handler(request('mbti-attempt', {
      quiz_version: 'v1-40',
      attempt_proof: `11111111-1111-4111-8111-111111111111.${'a'.repeat(64)}`,
      completion_id: '22222222-2222-4222-8222-222222222222',
      answer_indices: Array(40).fill(0),
    }), res);

    expect(state.status).toBe(400);
    expect(state.body).toMatchObject({ code: 'INVALID_PROOF' });
  });

  it('rejects unknown operation paths before parsing the body', async () => {
    const { res, state } = response();
    await handler(request('unexpected', { quiz_version: 'v1-40' }), res);

    expect(state.status).toBe(404);
    expect(state.body).toMatchObject({ code: 'NOT_ELIGIBLE' });
  });
});
