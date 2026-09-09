import { MbtiResultData, Score } from '../types';

const V2_ENTITLEMENT_KEY = 'kiwimu_v2_entitlement';
const LAST_RESULT_KEY = 'last_quiz_result';
const LAST_SCORE_KEY = 'last_quiz_scores';
const V2_PROTOTYPE_RESULT_KEY = 'kiwimu_v2_prototype_result';
const V2_PROTOTYPE_SCORE_KEY = 'kiwimu_v2_prototype_scores';
const LEGACY_V2_ORDER_KEY = 'kiwimu_v2_legacy_order_id';
const V2_ORDER_ID_PATTERN = /^V2-[A-Z]{4}-[AT]-\d+-[0-9a-f]{32}$/;

export interface V2Entitlement {
  status: 'locked' | 'unlocked';
  unlockType?: 'one_time' | 'preview';
  unlockedAt?: string;
  sourceOrderId?: string;
  mbtiType?: string;
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

  try {
    const raw = localStorage.getItem(V2_ENTITLEMENT_KEY);
    if (!raw) return defaultEntitlement;
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

export function setV2Entitlement(entitlement: V2Entitlement): boolean {
  if (!canUseStorage()) {
    return false;
  }

  try {
    localStorage.setItem(V2_ENTITLEMENT_KEY, JSON.stringify(entitlement));
    return true;
  } catch {
    return false;
  }
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

export function unlockV2Purchase(sourceOrderId = 'server-verified', mbtiType?: string) {
  const entitlement: V2Entitlement = {
    status: 'unlocked',
    unlockType: 'one_time',
    unlockedAt: new Date().toISOString(),
    sourceOrderId,
    mbtiType,
    expiresAt: null,
  };

  setV2Entitlement(entitlement);
  return entitlement;
}

export function clearV2Entitlement() {
  if (!canUseStorage()) {
    return;
  }

  try {
    localStorage.removeItem(V2_ENTITLEMENT_KEY);
  } catch {
    // The server remains the entitlement authority when storage is blocked.
  }
}

export function readLegacyV2OrderId(): string {
  if (typeof sessionStorage === 'undefined') return '';
  try {
    const orderId = sessionStorage.getItem(LEGACY_V2_ORDER_KEY) || '';
    return V2_ORDER_ID_PATTERN.test(orderId) ? orderId : '';
  } catch {
    return '';
  }
}

export function clearLegacyV2OrderId() {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.removeItem(LEGACY_V2_ORDER_KEY);
  } catch {
    // Compatibility cleanup is best effort in restricted webviews.
  }
}

export function getLastV1Result(): LastV1ResultBundle | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    return parseBundle(
      sessionStorage.getItem(LAST_RESULT_KEY),
      sessionStorage.getItem(LAST_SCORE_KEY),
    );
  } catch {
    return null;
  }
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

  try {
    sessionStorage.setItem(V2_PROTOTYPE_RESULT_KEY, JSON.stringify(bundle.resultData));
    sessionStorage.setItem(V2_PROTOTYPE_SCORE_KEY, JSON.stringify(bundle.scores));
  } catch {
    // The current result still renders from React state when storage is blocked.
  }
}

export function getLastV2PrototypeResult(): LastV1ResultBundle | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    return parseBundle(
      sessionStorage.getItem(V2_PROTOTYPE_RESULT_KEY),
      sessionStorage.getItem(V2_PROTOTYPE_SCORE_KEY),
    );
  } catch {
    return null;
  }
}

export function clearLastV2PrototypeResult() {
  if (!canUseStorage()) {
    return;
  }

  try {
    sessionStorage.removeItem(V2_PROTOTYPE_RESULT_KEY);
    sessionStorage.removeItem(V2_PROTOTYPE_SCORE_KEY);
  } catch {
    // Restricted webviews may expose Storage but reject access.
  }
}

export function hasV2UnlockQuery(
  params: URLSearchParams,
  options: {
    allowPreview?: boolean;
  } = {},
) {
  const { allowPreview = import.meta.env.DEV } = options;
  const unlockParam = params.get('unlock');

  if (unlockParam === 'preview') {
    return allowPreview;
  }

  // `?unlock=success` deliberately returns false here. It used to be honoured
  // on trust, which meant appending it to any report URL unlocked the paid
  // chapters for free. Purchases are now confirmed against the order record by
  // /api/v2/verify-unlock before any entitlement is written.
  if (unlockParam === 'success') {
    return false;
  }

  return false;
}
