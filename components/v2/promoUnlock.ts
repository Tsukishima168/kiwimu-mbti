import { V2_FREE_PROMO_ID } from '../../shared/v2Promo';
import { trackLoginGateOpened, trackLoginSuccess, trackV2Unlocked } from '../../utils/analytics';
import { promoClaimMessage } from '../../utils/v2PromoCopy';

// 限時免費解鎖的前端流程：UI → /api/v2/promo-claim → DB。前端不持有任何權限旗標，
// 解鎖成功後只重新向 /api/v2/report 取報告，由 server 決定能不能讀。
// 這條路徑不送 begin_checkout / purchase，也不帶 value，免費解鎖不會被算成營收。

export const V2_PROMO_LOGIN_STAGE = 'v2_promo_unlock';
export const V2_PROMO_UNLOCK_TYPE = 'promo_free';
const PROMO_INTENT_KEY = 'kiwimu_v2_promo_intent';
const PROMO_INTENT_MAX_AGE_MS = 30 * 60 * 1000;
const FULL_TYPE_PATTERN = /^[EI][NS][TF][JP]-[AT]$/;

type PromoIntent = { mbtiType: string; ts: number };
type SessionLike = { access_token?: string; user?: { id?: string } } | null | undefined;

export type PromoClaimResult =
  | { ok: true; access: 'promo' | 'paid'; created: boolean }
  | { ok: false; code: string };

// 未登入時按下免費解鎖，先記下意圖；登入（popup 或整頁 redirect）回來後自動領取一次。
export function savePromoIntent(fullType: string, nowMs: number = Date.now()): void {
  try {
    if (typeof sessionStorage === 'undefined' || !FULL_TYPE_PATTERN.test(fullType)) return;
    sessionStorage.setItem(PROMO_INTENT_KEY, JSON.stringify({ mbtiType: fullType, ts: nowMs } satisfies PromoIntent));
  } catch {
    // Restricted webviews: the reader can still press the button again after login.
  }
}

export function readPromoIntent(fullType: string, nowMs: number = Date.now()): boolean {
  try {
    if (typeof sessionStorage === 'undefined') return false;
    const raw = sessionStorage.getItem(PROMO_INTENT_KEY);
    if (!raw) return false;
    const intent = JSON.parse(raw) as Partial<PromoIntent>;
    return intent.mbtiType === fullType
      && typeof intent.ts === 'number'
      && nowMs - intent.ts >= 0
      && nowMs - intent.ts <= PROMO_INTENT_MAX_AGE_MS;
  } catch {
    return false;
  }
}

export function clearPromoIntent(): void {
  try {
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(PROMO_INTENT_KEY);
  } catch {
    // Best effort; an expired intent is ignored by readPromoIntent anyway.
  }
}

export async function requestPromoClaim(input: {
  fullType: string;
  source: string;
  ownerId: string;
  getSession: () => Promise<SessionLike>;
  fetchImpl?: typeof fetch;
}): Promise<PromoClaimResult> {
  try {
    const session = await input.getSession();
    if (!session?.access_token || session.user?.id !== input.ownerId) return { ok: false, code: 'AUTH_REQUIRED' };
    const response = await (input.fetchImpl ?? fetch)('/api/v2/promo-claim', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ mbtiType: input.fullType, source: input.source }),
    });
    const payload = await response.json().catch(() => null) as {
      ok?: boolean; code?: string; data?: { access?: string; created?: boolean };
    } | null;
    const access = payload?.data?.access;
    if (response.ok && payload?.ok && (access === 'promo' || access === 'paid')) {
      return { ok: true, access, created: payload.data?.created === true };
    }
    return { ok: false, code: typeof payload?.code === 'string' ? payload.code : 'REQUEST_FAILED' };
  } catch {
    return { ok: false, code: 'NETWORK_ERROR' };
  }
}

export function trackPromoLoginStart(fullType: string, path: string): void {
  trackLoginGateOpened({
    trigger: 'click', from_stage: V2_PROMO_LOGIN_STAGE, path, mbti_type: fullType, promo_id: V2_FREE_PROMO_ID,
  });
}

export function trackPromoLoginComplete(fullType: string, path: string): void {
  trackLoginSuccess({
    from_stage: V2_PROMO_LOGIN_STAGE, provider: 'google', restore_destination: path,
    mbti_type: fullType, promo_id: V2_FREE_PROMO_ID,
  });
}

export async function runPromoClaim(input: {
  fullType: string;
  source: string;
  ownerId: string;
  getSession: () => Promise<SessionLike>;
  fetchImpl?: typeof fetch;
  isCurrent: () => boolean;
  onGranted: () => void;
  onEnded: () => void;
  onMessage: (text: string) => void;
}): Promise<PromoClaimResult> {
  const result = await requestPromoClaim(input);
  if (!input.isCurrent()) return result;
  if (result.ok) {
    // Count only a newly stored grant; re-claims and paid owners are not new unlocks.
    if (result.access === 'promo' && result.created) {
      trackV2Unlocked(input.fullType, V2_PROMO_UNLOCK_TYPE, input.source, { promo_id: V2_FREE_PROMO_ID });
    }
    input.onMessage('');
    input.onGranted();
    return result;
  }
  if (result.code === 'PROMO_ENDED') input.onEnded();
  input.onMessage(promoClaimMessage(result.code));
  return result;
}
