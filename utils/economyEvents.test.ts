import { describe, expect, it } from 'vitest';
import { QUESTIONS } from '../constants';
import { V2_TAIWAN_QUESTIONS } from '../data/v2TaiwanQuestions.generated';
import type { Option } from '../types';
import { buildMbtiCompletionRequest, encodeAnswerIndices } from './economyEvents';

const COMPLETION_ID = '11111111-1111-4111-8111-111111111111';

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
    }, COMPLETION_ID);

    expect(Object.keys(request || {}).sort()).toEqual([
      'answer_indices',
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
    }, COMPLETION_ID)).toBeNull();
  });
});
