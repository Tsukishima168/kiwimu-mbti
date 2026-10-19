import { V2_REPORT_PRICE_TWD } from '../shared/v2Product';
import { isV2FreePromoActive, V2_FREE_PROMO_END_LABEL } from '../shared/v2Promo';

// 限時免費期間的文案集中在這裡，依「當下時間」切換；活動結束後各處自動回到原本的付費文案，
// 不需要重新部署。這裡只決定顯示，能否領取一律由 /api/v2/promo-claim 以 server 時間判斷。

export type V2CopyLanguage = 'zh' | 'en' | 'ja' | 'ko';
export type V2PaywallOfferKind = 'promo' | 'paid';

const PRICE = V2_REPORT_PRICE_TWD;

// V1 結果頁（components/ResultLegacyDump.tsx 的 V2 試讀區）。付費版是原文，一字不改。
export function v1ResultV2OfferLine(nowMs: number = Date.now()): string {
  return isV2FreePromoActive(nowMs)
    ? '第 01 章免費試讀；完整報告限時免費（原價 NT$99，至 2026/11/30），登入後保存在「我的報告」。'
    : '第 01 章免費試讀；完整報告 NT$99，購買後可在「我的報告」回看。';
}

export function v1ResultV2TrialNote(nowMs: number = Date.now()): string {
  return isV2FreePromoActive(nowMs)
    ? '活動期間登入即可免費讀完整報告。'
    : '你可以先試讀，再決定是否解鎖完整報告。';
}

const INTRO_PAID_PRICE: Record<V2CopyLanguage, string> = {
  zh: `完整報告 NT$${PRICE}・單次解鎖`,
  en: `Full report NT$${PRICE} · One-time unlock`,
  ja: `完全版 NT$${PRICE}・1回の購入で解放`,
  ko: `전체 보고서 NT$${PRICE} · 한 번 결제`,
};
const INTRO_PROMO_PRICE: Record<V2CopyLanguage, string> = {
  zh: `完整報告限時免費・原價 NT$${PRICE}（至 11/30）`,
  en: `Full report free for a limited time (reg. NT$${PRICE}, until Nov 30)`,
  ja: `完全版は期間限定で無料（通常 NT$${PRICE}・11/30まで）`,
  ko: `전체 보고서 기간 한정 무료 (정가 NT$${PRICE}, 11/30까지)`,
};

export function introV2PriceLine(language: V2CopyLanguage, nowMs: number = Date.now()): string {
  return (isV2FreePromoActive(nowMs) ? INTRO_PROMO_PRICE : INTRO_PAID_PRICE)[language];
}

const EXPLORE_PAID_PRICE: Record<V2CopyLanguage, string> = {
  zh: `第 01 章免費，完整報告 NT$${PRICE}。`,
  en: `Chapter 01 is free. Full report NT$${PRICE}.`,
  ja: `第01章は無料。完全版はNT$${PRICE}。`,
  ko: `01장 무료. 전체 보고서 NT$${PRICE}.`,
};
const EXPLORE_PROMO_PRICE: Record<V2CopyLanguage, string> = {
  zh: `第 01 章免費；完整報告限時免費（原價 NT$${PRICE}，至 11/30），登入即可解鎖。`,
  en: `Chapter 01 is free. The full report is free for a limited time (reg. NT$${PRICE}, until Nov 30) when you sign in.`,
  ja: `第01章は無料。完全版も期間限定で無料（通常 NT$${PRICE}・11/30まで）、ログインで読めます。`,
  ko: `01장 무료. 전체 보고서도 기간 한정 무료 (정가 NT$${PRICE}, 11/30까지), 로그인하면 읽을 수 있어요.`,
};

export function exploreV2PriceLine(language: V2CopyLanguage, nowMs: number = Date.now()): string {
  return (isV2FreePromoActive(nowMs) ? EXPLORE_PROMO_PRICE : EXPLORE_PAID_PRICE)[language];
}

export function v2WelcomePricing(nowMs: number = Date.now()): { lead: string; detail: string; promo: boolean } {
  const promo = isV2FreePromoActive(nowMs);
  return {
    lead: '免費完成測驗，閱讀第 01 章。',
    detail: promo
      ? `完整報告限時免費（原價 NT$${PRICE}），登入即可解鎖，活動至 2026/11/30。`
      : `想繼續讀完整報告時，再以 NT$${PRICE} 單次解鎖。`,
    promo,
  };
}

// V2 報告頁 paywall。serverEnded = 伺服器已回 PROMO_ENDED（例如頁面跨過午夜仍開著）。
export function v2PaywallOffer(nowMs: number = Date.now(), serverEnded = false): V2PaywallOfferKind {
  return !serverEnded && isV2FreePromoActive(nowMs) ? 'promo' : 'paid';
}

export const V2_PROMO_PAYWALL_COPY = {
  eyebrow: 'Limited · Free',
  title: '限時免費：讀完這份完整報告',
  priceNote: `限時免費（原價 NT$${PRICE}）・活動至 ${V2_FREE_PROMO_END_LABEL}（台灣時間）`,
  ctaLoggedOut: '用 Google 登入，免費解鎖',
  ctaLoggedIn: '免費解鎖這份完整報告',
  ctaBusy: '正在解鎖…',
  note: '解鎖後保存到你的帳號，活動結束後仍可從「我的報告」繼續閱讀。',
  ownedHint: '已購買？查看我的報告',
  loginPending: '登入完成後會自動解鎖這份報告。',
  savedNote: '這份報告已保存在你的帳號，可從',
  ended: `限時免費已於 ${V2_FREE_PROMO_END_LABEL} 結束，完整報告恢復 NT$${PRICE}。`,
} as const;

export function promoClaimMessage(code: string): string {
  if (code === 'PROMO_ENDED') return V2_PROMO_PAYWALL_COPY.ended;
  if (code === 'AUTH_REQUIRED') return '登入已失效，請重新登入後再解鎖。';
  if (code === 'VERIFIED_EMAIL_REQUIRED') return '請使用已驗證 Email 的帳號登入，才能保存報告。';
  return '暫時無法解鎖，請稍後再試。';
}
