import { describe, expect, it } from 'vitest';
import { QUESTIONS } from '../../constants';
import { V2_TAIWAN_QUESTIONS } from '../../data/v2TaiwanQuestions.generated';
import {
  buildEconomyEvent,
  buildPendingEvidenceHash,
  getEconomyQuestionBank,
  parseMbtiCompletion,
} from './mbtiCompletion';

const COMPLETION_ID = '11111111-1111-4111-8111-111111111111';
const ATTEMPT_PROOF = `${COMPLETION_ID}.${'a'.repeat(64)}`;

describe('parseMbtiCompletion', () => {
  it.each([
    ['v1-40', QUESTIONS],
    ['v2-tw-40', V2_TAIWAN_QUESTIONS],
  ] as const)('keeps the compact %s scoring bank aligned with product questions', (version, questions) => {
    expect(getEconomyQuestionBank(version)).toEqual(questions.map(question => ({
      options: question.options.map(option => ({ value: option.value })),
      weight: question.weight || 1,
    })));
  });

  it('recomputes a V1 result from the canonical question bank', () => {
    const parsed = parseMbtiCompletion({
      attempt_proof: ATTEMPT_PROOF,
      completion_id: COMPLETION_ID,
      quiz_version: 'v1-40',
      answer_indices: QUESTIONS.map(() => 0),
    });

    expect(parsed).toMatchObject({
      completionId: COMPLETION_ID,
      quizVersion: 'v1-40',
      resultType: 'ESTJ',
      variant: 'A',
    });
    expect(parsed?.answersSha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it('recomputes a V2 result independently of client labels', () => {
    const parsed = parseMbtiCompletion({
      attempt_proof: ATTEMPT_PROOF,
      completion_id: COMPLETION_ID,
      quiz_version: 'v2-tw-40',
      answer_indices: V2_TAIWAN_QUESTIONS.map(() => 1),
    });

    expect(parsed).toMatchObject({ resultType: 'INFP', variant: 'T' });
  });

  it.each([
    { attempt_proof: ATTEMPT_PROOF, completion_id: COMPLETION_ID, quiz_version: 'v1-40', answer_indices: [] },
    { attempt_proof: ATTEMPT_PROOF, completion_id: COMPLETION_ID, quiz_version: 'v1-40', answer_indices: QUESTIONS.map(() => 2) },
    { attempt_proof: ATTEMPT_PROOF, completion_id: COMPLETION_ID, quiz_version: 'unknown', answer_indices: QUESTIONS.map(() => 0) },
    { attempt_proof: 'forged', completion_id: COMPLETION_ID, quiz_version: 'v1-40', answer_indices: QUESTIONS.map(() => 0) },
    { attempt_proof: ATTEMPT_PROOF, completion_id: COMPLETION_ID, quiz_version: 'v1-40', answer_indices: QUESTIONS.map(() => 0), points: 999999 },
    { attempt_proof: ATTEMPT_PROOF, completion_id: COMPLETION_ID, quiz_version: 'v1-40', answer_indices: QUESTIONS.map(() => 0), actor_user_id: COMPLETION_ID },
  ])('rejects incomplete, forged, or asset-bearing payloads', payload => {
    expect(parseMbtiCompletion(payload)).toBeNull();
  });
});

describe('EconomyEventV1 construction', () => {
  it('contains verified evidence but no client-authoritative asset field', () => {
    const parsed = parseMbtiCompletion({
      attempt_proof: ATTEMPT_PROOF,
      completion_id: COMPLETION_ID,
      quiz_version: 'v1-40',
      answer_indices: QUESTIONS.map(() => 0),
    });
    expect(parsed).not.toBeNull();

    const actor = '22222222-2222-4222-8222-222222222222';
    const occurredAt = new Date('2026-07-16T00:00:00.000Z');
    const event = buildEconomyEvent(parsed!, actor, occurredAt);

    expect(event).toMatchObject({
      event_id: COMPLETION_ID,
      event_type: 'mbti.completed',
      source_site: 'kiwimu',
      actor_user_id: actor,
      occurred_at: occurredAt.toISOString(),
      schema_version: 1,
    });
    expect(event).not.toHaveProperty('amount');
    expect(event).not.toHaveProperty('points');
    expect(event.evidence).not.toHaveProperty('answers');
    expect(buildPendingEvidenceHash(parsed!)).toMatch(/^[0-9a-f]{64}$/);
  });
});
