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

describe('MBTI Economy persistent outbox', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-16T00:00:00.000Z'));
    vi.stubGlobal('localStorage', new MemoryStorage());
    vi.stubGlobal('crypto', { randomUUID: () => COMPLETION_ID });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('retries a transient failure with the same completion UUID', async () => {
    const completionBodies: Array<Record<string, unknown>> = [];
    let completionCalls = 0;
    vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
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

      completionCalls += 1;
      completionBodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
      if (completionCalls === 1) {
        return new Response('', { status: 503 });
      }
      return new Response(JSON.stringify({
        ok: true,
        code: 'OK',
        request_id: REQUEST_ID,
        data: { status: 'accepted' },
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }));

    expect(queueMbtiCompleted({
      answers: answers(),
      questionBank: QUESTIONS,
      quizVersion: 'v1-40',
    })).toBe(COMPLETION_ID);

    await flushMbtiEconomyOutbox();
    expect(readMbtiEconomyOutbox()).toMatchObject([{
      completionId: COMPLETION_ID,
      attempts: 1,
    }]);

    await vi.advanceTimersByTimeAsync(2_000);
    await flushMbtiEconomyOutbox();

    expect(completionBodies).toHaveLength(2);
    expect(completionBodies.map(body => body.completion_id)).toEqual([
      COMPLETION_ID,
      COMPLETION_ID,
    ]);
    expect(readMbtiEconomyOutbox()).toEqual([]);
  });
});
