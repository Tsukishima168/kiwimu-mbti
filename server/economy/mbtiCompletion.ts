import { createHash } from 'node:crypto';
import type { Dimension } from '../../types.js';
import type { MbtiQuizVersion } from '../../shared/economy.js';
import { MBTI_ATTEMPT_PROOF_PATTERN, UUID_PATTERN, isPlainRecord } from '../../shared/economy.js';

type AnswerIndex = 0 | 1;

interface ServerQuestion {
  weight?: number;
  options: readonly [
    { value: Dimension },
    { value: Dimension },
  ];
}

export interface ParsedMbtiCompletion {
  attemptProof: string;
  completionId: string;
  quizVersion: MbtiQuizVersion;
  answerIndices: AnswerIndex[];
  resultType: string;
  variant: 'A' | 'T';
  answersSha256: string;
}

const ALLOWED_BODY_KEYS = new Set(['attempt_proof', 'completion_id', 'quiz_version', 'answer_indices']);
const SCORING_DIMENSIONS = [
  ['E', 'I'],
  ['S', 'N'],
  ['T', 'F'],
  ['J', 'P'],
  ['A', 'Turbulent'],
] as const satisfies readonly (readonly [Dimension, Dimension])[];
const QUESTIONS_PER_DIMENSION = 8;
const QUESTION_BANK: readonly ServerQuestion[] = SCORING_DIMENSIONS.flatMap(options =>
  Array.from({ length: QUESTIONS_PER_DIMENSION }, (_, index) => ({
    options: [{ value: options[0] }, { value: options[1] }] as const,
    weight: index === 0 ? 2 : 1,
  })),
);

export function getEconomyQuestionBank(_version: MbtiQuizVersion): readonly ServerQuestion[] {
  return QUESTION_BANK;
}

function isQuizVersion(value: unknown): value is MbtiQuizVersion {
  return value === 'v1-40' || value === 'v2-tw-40';
}

function calculateResult(
  questionBank: readonly ServerQuestion[],
  answerIndices: readonly AnswerIndex[],
): { resultType: string; variant: 'A' | 'T' } {
  const scores: Record<Dimension, number> = {
    E: 0,
    I: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0,
    A: 0,
    Turbulent: 0,
  };

  answerIndices.forEach((answerIndex, questionIndex) => {
    const question = questionBank[questionIndex];
    scores[question.options[answerIndex].value] += question.weight || 1;
  });

  const resultType = [
    scores.E >= scores.I ? 'E' : 'I',
    scores.S >= scores.N ? 'S' : 'N',
    scores.T >= scores.F ? 'T' : 'F',
    scores.J >= scores.P ? 'J' : 'P',
  ].join('');
  const variant = scores.A >= scores.Turbulent ? 'A' : 'T';
  return { resultType, variant };
}

export function parseMbtiCompletion(value: unknown): ParsedMbtiCompletion | null {
  if (!isPlainRecord(value)) return null;
  if (Object.keys(value).some(key => !ALLOWED_BODY_KEYS.has(key))) return null;

  const attemptProof = value.attempt_proof;
  const completionId = value.completion_id;
  const quizVersion = value.quiz_version;
  const answerIndices = value.answer_indices;
  if (
    typeof attemptProof !== 'string' ||
    !MBTI_ATTEMPT_PROOF_PATTERN.test(attemptProof) ||
    typeof completionId !== 'string' ||
    !UUID_PATTERN.test(completionId) ||
    !isQuizVersion(quizVersion) ||
    !Array.isArray(answerIndices)
  ) {
    return null;
  }

  const questionBank = getEconomyQuestionBank(quizVersion);
  if (
    answerIndices.length !== questionBank.length ||
    !answerIndices.every(answer => answer === 0 || answer === 1)
  ) {
    return null;
  }

  const normalizedIndices = answerIndices as AnswerIndex[];
  const { resultType, variant } = calculateResult(questionBank, normalizedIndices);
  const answersSha256 = createHash('sha256')
    .update(`${quizVersion}:${normalizedIndices.join('')}`)
    .digest('hex');

  return {
    attemptProof,
    completionId,
    quizVersion,
    answerIndices: normalizedIndices,
    resultType,
    variant,
    answersSha256,
  };
}

export function buildEconomyEvent(
  completion: ParsedMbtiCompletion,
  actorUserId: string,
  occurredAt = new Date(),
) {
  return {
    event_id: completion.completionId,
    event_type: 'mbti.completed',
    occurred_at: occurredAt.toISOString(),
    source_site: 'kiwimu',
    actor_user_id: actorUserId,
    reference_id: `mbti:${completion.quizVersion}:${completion.completionId}`,
    evidence: {
      quiz_version: completion.quizVersion,
      result_type: completion.resultType,
      variant: completion.variant,
      answers_sha256: completion.answersSha256,
    },
    schema_version: 1,
  } as const;
}

export function buildPendingEvidenceHash(completion: ParsedMbtiCompletion): string {
  return createHash('sha256')
    .update(`kiwimu:${completion.completionId}:${completion.answersSha256}`)
    .digest('hex');
}
