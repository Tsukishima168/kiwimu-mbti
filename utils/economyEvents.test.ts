import { describe, expect, it } from 'vitest';
import { QUESTIONS } from '../constants';
import { V2_TAIWAN_QUESTIONS } from '../data/v2TaiwanQuestions.generated';
import type { Option } from '../types';
import { buildMbtiCompletionRequest, encodeAnswerIndices, readMbtiEconomyOutbox } from './economyEvents';

const COMPLETION_ID = '11111111-1111-4111-8111-111111111111';
const ATTEMPT_PROOF = `${COMPLETION_ID}.${'a'.repeat(64)}`;

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

function selectOptions(
  questionBank: readonly { options: readonly [{ value: Option['value']; label: string }, { value: Option['value']; label: string }] }[],
  index: 0 | 1,
): Option[] {
  return questionBank.map(question => ({
    label: question.options[index].label,
    value: question.options[index].value,
  }));
}

describe('MBTI Economy client contract', () => {
  it('encodes V1 and V2 answers as option indices only', () => {
    expect(encodeAnswerIndices(selectOptions(QUESTIONS, 0), QUESTIONS)).toEqual(QUESTIONS.map(() => 0));
    expect(encodeAnswerIndices(selectOptions(V2_TAIWAN_QUESTIONS, 1), V2_TAIWAN_QUESTIONS))
      .toEqual(V2_TAIWAN_QUESTIONS.map(() => 1));
  });

  it('builds a strict payload without identity, amount, or reward fields', () => {
    const request = buildMbtiCompletionRequest({
      answers: selectOptions(QUESTIONS, 0),
      questionBank: QUESTIONS,
      quizVersion: 'v1-40',
    }, COMPLETION_ID, ATTEMPT_PROOF);

    expect(Object.keys(request || {}).sort()).toEqual([
      'answer_indices',
      'attempt_proof',
      'completion_id',
      'quiz_version',
    ]);
    expect(request).not.toHaveProperty('user_id');
    expect(request).not.toHaveProperty('amount');
    expect(request).not.toHaveProperty('points');
  });

  it('rejects incomplete answer sets before any network call', () => {
    expect(buildMbtiCompletionRequest({
      answers: [],
      questionBank: QUESTIONS,
      quizVersion: 'v1-40',
    }, COMPLETION_ID, ATTEMPT_PROOF)).toBeNull();
  });

  it('rejects a forged or missing server attempt proof', () => {
    expect(buildMbtiCompletionRequest({
      answers: selectOptions(QUESTIONS, 0),
      questionBank: QUESTIONS,
      quizVersion: 'v1-40',
    }, COMPLETION_ID, 'forged')).toBeNull();
  });

  it('restores a persistent outbox entry with the same completion UUID', () => {
    const storage = new MemoryStorage();
    storage.setItem('kiwimu_economy_mbti_outbox_v1', JSON.stringify([{
      completionId: COMPLETION_ID,
      quizVersion: 'v1-40',
      answerIndices: QUESTIONS.map(() => 0),
      attemptProof: ATTEMPT_PROOF,
      attemptNotBefore: 0,
      attemptExpiresAt: 4_102_444_800_000,
      createdAt: 1_700_000_000_000,
      attempts: 2,
      nextAttemptAt: 1_700_000_010_000,
    }]));
    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
    try {
      expect(readMbtiEconomyOutbox(1_700_000_020_000)).toMatchObject([{
        completionId: COMPLETION_ID,
        attempts: 2,
      }]);
    } finally {
      if (original) {
        Object.defineProperty(globalThis, 'localStorage', original);
      } else {
        Reflect.deleteProperty(globalThis, 'localStorage');
      }
    }
  });
});
