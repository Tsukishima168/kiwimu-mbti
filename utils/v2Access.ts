import { MbtiResultData, Score } from '../types';

const V2_ENTITLEMENT_KEY = 'kiwimu_v2_entitlement';
const LAST_RESULT_KEY = 'last_quiz_result';
const LAST_SCORE_KEY = 'last_quiz_scores';
const V2_PROTOTYPE_RESULT_KEY = 'kiwimu_v2_prototype_result';
const V2_PROTOTYPE_SCORE_KEY = 'kiwimu_v2_prototype_scores';

export interface V2Entitlement {
  status: 'locked' | 'unlocked';
  unlockType?: 'one_time' | 'preview';
  unlockedAt?: string;
  sourceOrderId?: string;
  expiresAt?: string | null;
}

export interface LastV1ResultBundle {
  resultData: MbtiResultData;
  scores: Score;
}

const defaultEntitlement: V2Entitlement = {
  status: 'locked',
};

function canUseStorage() {
  return typeof window !== 'undefined';
}

export function readCachedV2Entitlement(): V2Entitlement {
  if (!canUseStorage()) {
    return defaultEntitlement;
  }

  const raw = localStorage.getItem(V2_ENTITLEMENT_KEY);
  if (!raw) {
    return defaultEntitlement;
  }

  try {
    const parsed = JSON.parse(raw) as V2Entitlement;
    if (parsed.status === 'unlocked') {
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to parse V2 entitlement:', error);
  }

  return defaultEntitlement;
}

// Backward-compatible alias for callers that still expect the old name.
// The value is cache-only; Supabase remains the source of truth.
export function getV2Entitlement(): V2Entitlement {
  return readCachedV2Entitlement();
}

export function setV2Entitlement(entitlement: V2Entitlement) {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(V2_ENTITLEMENT_KEY, JSON.stringify(entitlement));
}

export function unlockV2Preview(sourceOrderId = 'local-preview') {
  const entitlement: V2Entitlement = {
    status: 'unlocked',
    unlockType: 'preview',
    unlockedAt: new Date().toISOString(),
    sourceOrderId,
    expiresAt: null,
  };

  setV2Entitlement(entitlement);
  return entitlement;
}

export function unlockV2Purchase(sourceOrderId = 'linepay') {
  const entitlement: V2Entitlement = {
    status: 'unlocked',
    unlockType: 'one_time',
    unlockedAt: new Date().toISOString(),
    sourceOrderId,
    expiresAt: null,
  };

  setV2Entitlement(entitlement);
  return entitlement;
}

export function clearV2Entitlement() {
  if (!canUseStorage()) {
    return;
  }

  localStorage.removeItem(V2_ENTITLEMENT_KEY);
}

export function getLastV1Result(): LastV1ResultBundle | null {
  if (!canUseStorage()) {
    return null;
  }

  return parseBundle(
    sessionStorage.getItem(LAST_RESULT_KEY),
    sessionStorage.getItem(LAST_SCORE_KEY),
  );
}

function parseBundle(rawResult: string | null, rawScores: string | null): LastV1ResultBundle | null {
  if (!rawResult || !rawScores) {
    return null;
  }

  try {
    return {
      resultData: JSON.parse(rawResult) as MbtiResultData,
      scores: JSON.parse(rawScores) as Score,
    };
  } catch (error) {
    console.warn('Failed to restore V2 result bundle:', error);
    return null;
  }
}

export function setLastV2PrototypeResult(bundle: LastV1ResultBundle) {
  if (!canUseStorage()) {
    return;
  }

  sessionStorage.setItem(V2_PROTOTYPE_RESULT_KEY, JSON.stringify(bundle.resultData));
  sessionStorage.setItem(V2_PROTOTYPE_SCORE_KEY, JSON.stringify(bundle.scores));
}

export function getLastV2PrototypeResult(): LastV1ResultBundle | null {
  if (!canUseStorage()) {
    return null;
  }

  return parseBundle(
    sessionStorage.getItem(V2_PROTOTYPE_RESULT_KEY),
    sessionStorage.getItem(V2_PROTOTYPE_SCORE_KEY),
  );
}

export function clearLastV2PrototypeResult() {
  if (!canUseStorage()) {
    return;
  }

  sessionStorage.removeItem(V2_PROTOTYPE_RESULT_KEY);
  sessionStorage.removeItem(V2_PROTOTYPE_SCORE_KEY);
}

export function hasV2UnlockQuery(
  params: URLSearchParams,
  options: {
    allowPreview?: boolean;
    allowSuccess?: boolean;
  } = {},
) {
  const { allowPreview = import.meta.env.DEV, allowSuccess = false } = options;
  const unlockParam = params.get('unlock');

  if (unlockParam === 'preview') {
    return allowPreview;
  }

  if (unlockParam === 'success') {
    return allowSuccess;
  }

  return false;
}
