import { describe, expect, it } from 'vitest';
import { parseMbtiAttemptRequest } from './mbtiAttempt';

describe('MBTI attempt request', () => {
  it.each(['v1-40', 'v2-tw-40'] as const)('accepts %s', quizVersion => {
    expect(parseMbtiAttemptRequest({ quiz_version: quizVersion })).toEqual({ quizVersion });
  });

  it.each([
    {},
    { quiz_version: 'v3' },
    { quiz_version: 'v1-40', points: 999_999 },
    { quiz_version: 'v1-40', user_id: 'forged' },
  ])('rejects malformed or asset-bearing input', value => {
    expect(parseMbtiAttemptRequest(value)).toBeNull();
  });
});
