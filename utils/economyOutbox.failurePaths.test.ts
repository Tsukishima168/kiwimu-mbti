import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QUESTIONS } from '../constants';
import type { Option } from '../types';

vi.mock('./supabaseAuthBridge', () => ({
  getAuthSupabaseClient: () => null,
}));

import {
  flushMbtiEconomyOutbox,
  queueMbtiCompleted,
  readMbtiEconomyOutbox,
} from './economyEvents';

const COMPLETION_ID = '11111111-1111-4111-8111-111111111111';
const ATTEMPT_ID = '22222222-2222-4222-8222-222222222222';
const REQUEST_ID = '33333333-3333-4333-8333-333333333333';
const CLAIM_ID = '44444444-4444-4444-8444-444444444444';
const ATTEMPT_PROOF = `${ATTEMPT_ID}.${'a'.repeat(64)}`;

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

function answers(): Option[] {
  return QUESTIONS.map(question => ({
    label: question.options[0].label,
    value: question.options[0].value,
  }));
}

/**
 * Stubs the attempt endpoint with a usable proof and answers the completion
 * endpoint with one fixed envelope, so each test exercises exactly one
 * terminal response code.
 */
function stubEconomyFetch(completion: { status: number; body: Record<string, unknown> }) {
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => {
    const url = String(input);
    if (url.endsWith('/mbti-attempt')) {
      return new Response(JSON.stringify({
        ok: true,
        code: 'OK',
        request_id: REQUEST_ID,
        data: {
          attempt_proof: ATTEMPT_PROOF,
          not_before: '2026-07-15T23:59:00.000Z',
          expires_at: '2026-07-16T02:00:00.000Z',
        },
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify(completion.body), {
      status: completion.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }));
}

function queueOne() {
  expect(queueMbtiCompleted({
    answers: answers(),
    questionBank: QUESTIONS,
    quizVersion: 'v1-40',
  })).toBe(COMPLETION_ID);
}

describe('MBTI Economy outbox failure paths', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-16T00:00:00.000Z'));
    vi.stubGlobal('localStorage', new MemoryStorage());
    vi.stubGlobal('sessionStorage', new MemoryStorage());
    vi.stubGlobal('crypto', { randomUUID: () => COMPLETION_ID });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  // The completion is real work the user already did. A response that carries
  // no way to recover the points later must not silently discard it.
  it('keeps the completion queued when AUTH_REQUIRED arrives without a claim id', async () => {
    stubEconomyFetch({
      status: 401,
      body: { ok: false, code: 'AUTH_REQUIRED', request_id: REQUEST_ID, data: {} },
    });

    queueOne();
    await flushMbtiEconomyOutbox();

    expect(readMbtiEconomyOutbox()).toMatchObject([{ completionId: COMPLETION_ID }]);
  });

  // An expired or already-consumed proof is a recoverable condition: a fresh
  // proof can be minted on the next flush. Dropping the entry loses the points.
  it('keeps the completion queued when the attempt proof is rejected', async () => {
    stubEconomyFetch({
      status: 400,
      body: { ok: false, code: 'INVALID_PROOF', request_id: REQUEST_ID, data: {} },
    });

    queueOne();
    await flushMbtiEconomyOutbox();

    expect(readMbtiEconomyOutbox()).toMatchObject([{ completionId: COMPLETION_ID }]);
  });

  // Retrying forever would trade a data-loss bug for a battery drain, so the
  // proof path gives up after a bounded number of attempts and says so.
  it('gives up on the completion once the proof retry budget is spent', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    stubEconomyFetch({
      status: 400,
      body: { ok: false, code: 'INVALID_PROOF', request_id: REQUEST_ID, data: {} },
    });

    queueOne();

    // Advancing the clock also fires the flush this module schedules for
    // itself, so drive the loop off the outbox rather than an exact count.
    let rounds = 0;
    while (readMbtiEconomyOutbox().length > 0 && rounds < 50) {
      await flushMbtiEconomyOutbox();
      await vi.advanceTimersByTimeAsync(5 * 60 * 1_000);
      rounds += 1;
    }

    expect(readMbtiEconomyOutbox()).toEqual([]);
    expect(rounds).toBeGreaterThan(1);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  // Control: when the server does hand back a pending claim, the points are
  // recoverable through Passport and clearing the entry is correct.
  it('clears the completion when AUTH_REQUIRED carries a pending claim', async () => {
    stubEconomyFetch({
      status: 401,
      body: {
        ok: false,
        code: 'AUTH_REQUIRED',
        request_id: REQUEST_ID,
        data: { claim_id: CLAIM_ID, expires_at: '2026-07-17T00:00:00.000Z' },
      },
    });

    queueOne();
    await flushMbtiEconomyOutbox();

    expect(readMbtiEconomyOutbox()).toEqual([]);
  });

  it('keeps the completion queued when the pending claim cannot be persisted', async () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => null,
      setItem: () => { throw new Error('storage disabled'); },
      removeItem: () => {},
    });
    stubEconomyFetch({
      status: 401,
      body: {
        ok: false,
        code: 'AUTH_REQUIRED',
        request_id: REQUEST_ID,
        data: { claim_id: CLAIM_ID, expires_at: '2026-07-17T00:00:00.000Z' },
      },
    });

    queueOne();
    await flushMbtiEconomyOutbox();

    expect(readMbtiEconomyOutbox()).toMatchObject([{ completionId: COMPLETION_ID }]);
  });
});
