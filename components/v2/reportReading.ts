import type { Score } from '../../types';
import { getVariant } from '../../utils/logic';
import type { LastV1ResultBundle } from '../../utils/v2Access';

const DIMENSION_NAMES: Record<string, string> = { E: '外向', I: '內向', S: '實感', N: '直覺', T: '思考', F: '情感', J: '判斷', P: '感知' };

export function getDimensionDescription(code: string, items: ReadonlyArray<{ label: string; body: string }>, isVariant = false) {
  const exact = isVariant ? `${code} (${code === 'A' ? '自信型' : '謹慎型'})` : `${code} (${DIMENSION_NAMES[code]})`;
  return items.find(item => item.label === exact)?.body
    || (isVariant ? items.find(item => item.label === 'A / T (自我認同)')?.body : '')
    || '';
}

export function matchingRecordedResult(fullType: string, bundles: Array<LastV1ResultBundle | null>) {
  return bundles.find(bundle => bundle && `${bundle.resultData.id}-${getVariant(bundle.scores)}` === fullType) || null;
}

export function hasDimensionAnswers(scores: Score, code: string, opposite: string) {
  return Number(scores[code as keyof Score] || 0) + Number(scores[opposite as keyof Score] || 0) > 0;
}
