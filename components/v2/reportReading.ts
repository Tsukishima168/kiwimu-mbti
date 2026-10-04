import type { Score } from '../../types';
import { getVariant } from '../../utils/logic';
import type { LastV1ResultBundle } from '../../utils/v2Access';

const DIMENSION_NAMES: Record<string, readonly string[]> = {
  E: ['外向'], I: ['內向'], S: ['實感', '感知'], N: ['直覺'],
  T: ['思考'], F: ['情感'], J: ['判斷'], P: ['感知'],
};

function normalizeDimensionLabel(label: string) {
  return label.normalize('NFKC').replace(/\s+/gu, '').trim();
}

export function getDimensionDescription(code: string, items: ReadonlyArray<{ label: string; body: string }>, isVariant = false) {
  if (isVariant ? code !== 'A' && code !== 'T' : !Object.prototype.hasOwnProperty.call(DIMENSION_NAMES, code)) return '';
  // T can mean Thinking or the T identity variant. Match both code and meaning,
  // while allowing the punctuation and Identity suffix used by the source drafts.
  const names = isVariant ? [code === 'A' ? '自信型' : '謹慎型'] : DIMENSION_NAMES[code];
  const matching = items.find(item => {
    const label = normalizeDimensionLabel(item.label);
    return names.some(name => label === `${code}(${name})`
      || (isVariant && label === `${code}(${name}Identity層)`));
  });
  return matching?.body
    || (isVariant ? items.find(item => normalizeDimensionLabel(item.label) === 'A/T(自我認同)')?.body : '')
    || '';
}

export function matchingRecordedResult(fullType: string, bundles: Array<LastV1ResultBundle | null>) {
  return bundles.find(bundle => bundle && `${bundle.resultData.id}-${getVariant(bundle.scores)}` === fullType) || null;
}

export function hasDimensionAnswers(scores: Score, code: string, opposite: string) {
  return Number(scores[code as keyof Score] || 0) + Number(scores[opposite as keyof Score] || 0) > 0;
}
