import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  exploreV2PriceLine,
  introV2PriceLine,
  v1ResultV2OfferLine,
  v1ResultV2TrialNote,
  v2PaywallOffer,
  v2WelcomePricing,
  V2_PROMO_PAYWALL_COPY,
} from './v2PromoCopy';

const LAST_OPEN = Date.parse('2026-11-30T23:59:59.999+08:00');
const FIRST_CLOSED = Date.parse('2026-12-01T00:00:00.000+08:00');
const source = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

describe('V1 result page lines (ResultLegacyDump.tsx 1318 / 1349)', () => {
  it('switches the offer line at the boundary and restores the original text afterwards', () => {
    expect(v1ResultV2OfferLine(LAST_OPEN)).toBe('第 01 章免費試讀；完整報告限時免費（原價 NT$99，至 2026/11/30），登入後保存在「我的報告」。');
    expect(v1ResultV2OfferLine(FIRST_CLOSED)).toBe('第 01 章免費試讀；完整報告 NT$99，購買後可在「我的報告」回看。');
  });

  it('switches the trial note at the boundary and restores the original text afterwards', () => {
    expect(v1ResultV2TrialNote(LAST_OPEN)).toBe('活動期間登入即可免費讀完整報告。');
    expect(v1ResultV2TrialNote(FIRST_CLOSED)).toBe('你可以先試讀，再決定是否解鎖完整報告。');
  });

  it('the frozen file renders exactly these two helpers and keeps no other copy change', () => {
    const lines = source('../components/ResultLegacyDump.tsx').split('\n');
    expect(lines.filter(line => line.includes('v1ResultV2OfferLine()'))).toHaveLength(1);
    expect(lines.filter(line => line.includes('v1ResultV2TrialNote()'))).toHaveLength(1);
    expect(lines.findIndex(line => line.trim() === '{v1ResultV2OfferLine()}')).toBe(1318);
    expect(lines.findIndex(line => line.trim() === '{v1ResultV2TrialNote()}')).toBe(1349);
    expect(lines.join('\n')).not.toContain('購買後可在「我的報告」回看');
  });
});

describe('V2 surfaces', () => {
  it('shows the promo paywall until the last millisecond, then the paid paywall', () => {
    expect(v2PaywallOffer(LAST_OPEN)).toBe('promo');
    expect(v2PaywallOffer(FIRST_CLOSED)).toBe('paid');
  });

  it('falls back to the paid paywall as soon as the server reports the promo ended', () => {
    expect(v2PaywallOffer(LAST_OPEN, true)).toBe('paid');
  });

  it('states the original price and the end date in the promo paywall', () => {
    expect(V2_PROMO_PAYWALL_COPY.priceNote).toBe('限時免費（原價 NT$99）・活動至 2026/11/30 23:59（台灣時間）');
    expect(V2_PROMO_PAYWALL_COPY.ended).toBe('限時免費已於 2026/11/30 23:59 結束，完整報告恢復 NT$99。');
  });

  it('switches the V2 welcome pricing at the boundary', () => {
    expect(v2WelcomePricing(LAST_OPEN)).toEqual({
      lead: '免費完成測驗，閱讀第 01 章。', promo: true,
      detail: '完整報告限時免費（原價 NT$99），登入即可解鎖，活動至 2026/11/30。',
    });
    expect(v2WelcomePricing(FIRST_CLOSED)).toEqual({
      lead: '免費完成測驗，閱讀第 01 章。', promo: false, detail: '想繼續讀完整報告時，再以 NT$99 單次解鎖。',
    });
  });

  it('restores the original Intro and Explore prices in all four languages after the window', () => {
    expect((['zh', 'en', 'ja', 'ko'] as const).map(lang => introV2PriceLine(lang, FIRST_CLOSED))).toEqual([
      '完整報告 NT$99・單次解鎖', 'Full report NT$99 · One-time unlock', '完全版 NT$99・1回の購入で解放', '전체 보고서 NT$99 · 한 번 결제',
    ]);
    expect((['zh', 'en', 'ja', 'ko'] as const).map(lang => exploreV2PriceLine(lang, FIRST_CLOSED))).toEqual([
      '第 01 章免費，完整報告 NT$99。', 'Chapter 01 is free. Full report NT$99.', '第01章は無料。完全版はNT$99。', '01장 무료. 전체 보고서 NT$99.',
    ]);
    expect(introV2PriceLine('zh', LAST_OPEN)).toBe('完整報告限時免費・原價 NT$99（至 11/30）');
    expect(exploreV2PriceLine('zh', LAST_OPEN)).toBe('第 01 章免費；完整報告限時免費（原價 NT$99，至 11/30），登入即可解鎖。');
  });

  it('the V2 report and entry surfaces read the offer from the clock at render time', () => {
    expect(source('../components/v2/V2App.tsx')).toContain('v2PaywallOffer(Date.now(), promoEnded)');
    expect(source('../components/v2/V2Welcome.tsx')).toContain('v2WelcomePricing()');
    expect(source('../components/Intro.tsx')).toContain('introV2PriceLine(language)');
    expect(source('../components/explore/ExploreResult.tsx')).toContain('exploreV2PriceLine(language)');
  });
});
