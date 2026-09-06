import { describe, expect, it } from 'vitest';
import type { LastV1ResultBundle } from '../../utils/v2Access';
import { V2_TAIWAN_QUESTIONS } from '../../data/v2TaiwanQuestions.generated';
import { V2_VARIANT_REPORTS } from '../../data/v2VariantReports.generated';
import { getDimensionDescription, hasDimensionAnswers, matchingRecordedResult } from './reportReading';

const emptyScores = {
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

function resultBundle(type: string, variant: 'A' | 'T'): LastV1ResultBundle {
  return {
    resultData: { id: type } as LastV1ResultBundle['resultData'],
    scores: {
      ...emptyScores,
      [variant === 'A' ? 'A' : 'Turbulent']: 8,
    },
  };
}

describe('V2 report reading integrity', () => {
  it('keeps the quiz balanced across five dimensions', () => {
    expect(V2_TAIWAN_QUESTIONS).toHaveLength(40);
    expect(new Set(V2_TAIWAN_QUESTIONS.map(question => question.questionId)).size).toBe(40);

    const counts = V2_TAIWAN_QUESTIONS.reduce<Record<string, number>>((totals, question) => {
      totals[question.dimension] = (totals[question.dimension] ?? 0) + 1;
      return totals;
    }, {});

    expect(counts).toEqual({ EI: 8, SN: 8, TF: 8, JP: 8, AT: 8 });
    expect(V2_TAIWAN_QUESTIONS.every(question => question.options.length === 2)).toBe(true);
  });

  it('ships all 32 variants with state copy and four usable practices', () => {
    const reports = Object.values(V2_VARIANT_REPORTS);
    expect(reports).toHaveLength(32);
    expect(new Set(reports.map(report => report.fullCode)).size).toBe(32);

    for (const report of reports) {
      expect(report.state?.name.trim()).toBeTruthy();
      expect(report.state?.truth.trim()).toBeTruthy();
      expect(report.practices.map(item => item.label)).toEqual([
        '覺察問題',
        '行為實驗',
        '關係練習',
        '感官停頓',
      ]);
      expect(report.practices.every(item => item.body.trim().length > 0)).toBe(true);
    }
  });

  it('matches Thinking copy exactly instead of falling through to the A/T dimension', () => {
    const bullets = [
      { label: 'T (思考)', body: 'thinking-copy' },
      { label: 'A / T (自我認同)', body: 'identity-copy' },
    ];

    expect(getDimensionDescription('T', bullets)).toBe('thinking-copy');
    expect(getDimensionDescription('T', bullets, true)).toBe('identity-copy');
  });

  it('shows percentages only when answers exist for that dimension', () => {
    expect(hasDimensionAnswers(emptyScores, 'E', 'I')).toBe(false);
    expect(hasDimensionAnswers({ ...emptyScores, E: 1 }, 'E', 'I')).toBe(true);
  });

  it('reuses recorded scores only when the shared report type matches', () => {
    const intjA = resultBundle('INTJ', 'A');
    const intjT = resultBundle('INTJ', 'T');

    expect(matchingRecordedResult('INTJ-A', [intjT, intjA])).toBe(intjA);
    expect(matchingRecordedResult('ENFP-A', [intjT, intjA])).toBeNull();
  });
});
