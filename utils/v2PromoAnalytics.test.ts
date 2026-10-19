import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { trackV2PaywallView } from './analytics';
import { buildV2ReportDessertLink, trackDessertOrderClick } from './utmTracking';

const gtag = vi.fn();
const SHOP_CTA = 'https://map.kiwimu.com/menu?from=mbti_result_dessert&mbti=ESTJ';

beforeEach(() => {
  gtag.mockClear();
  vi.stubGlobal('window', { gtag });
  vi.stubGlobal('gtag', gtag);
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('V2 paywall view event', () => {
  it('paid regression: the paid paywall event keeps its exact parameter set', () => {
    trackV2PaywallView('ESTJ-A', 'quiz');
    expect(gtag.mock.calls[0][1]).toBe('view_item');
    expect(Object.keys(gtag.mock.calls[0][2]).sort()).toEqual(['item_list_id', 'item_list_name', 'items', 'mbti_type', 'site_id', 'source']);
  });

  it('marks the promo paywall with offer=promo_free and still sends no checkout or purchase', () => {
    trackV2PaywallView('ESTJ-A', 'quiz', 'promo_free');
    expect(gtag.mock.calls).toHaveLength(1);
    expect(gtag.mock.calls[0][1]).toBe('view_item');
    expect(gtag.mock.calls[0][2]).toMatchObject({ offer: 'promo_free' });
  });
});

describe('V2 report → 月島 menu link', () => {
  it('rewrites only the from parameter of the menu contract link', () => {
    const url = new URL(buildV2ReportDessertLink(SHOP_CTA, 'ESTJ', 'A'));
    expect(url.origin + url.pathname).toBe('https://map.kiwimu.com/menu');
    expect(url.searchParams.get('from')).toBe('mbti_v2_report_dessert');
    expect(url.searchParams.get('mbti')).toBe('ESTJ');
  });

  it('falls back to the canonical menu link with the V2 report surface', () => {
    for (const cta of [undefined, null, '', 'not a url']) {
      const url = new URL(buildV2ReportDessertLink(cta, 'ESTJ', 'A', 'v2_report_taste'));
      expect(url.origin + url.pathname).toBe('https://map.kiwimu.com/menu');
      expect(url.searchParams.get('from')).toBe('mbti_v2_report_taste');
      expect(url.searchParams.get('mbti')).toBe('ESTJ-A');
    }
  });

  it('leaves a non-Kiwimu contract link untouched', () => {
    expect(buildV2ReportDessertLink('https://example.com/menu', 'ESTJ', 'A')).toBe('https://example.com/menu');
  });

  it('tracks the V2 report click with its own entry_surface and unlock type', () => {
    const url = buildV2ReportDessertLink(SHOP_CTA, 'ESTJ', 'A');
    trackDessertOrderClick('ESTJ', 'A', { entrySurface: 'v2_report_dessert', url, unlockType: 'promo_free' });
    expect(gtag.mock.calls).toHaveLength(1);
    expect(gtag.mock.calls[0][1]).toBe('outbound_click');
    expect(gtag.mock.calls[0][2]).toMatchObject({
      entry_surface: 'v2_report_dessert', destination_type: 'order_menu', unlock_type: 'promo_free',
      mbti_type: 'ESTJ', mbti_variant: 'A', url: expect.stringContaining('from=mbti_v2_report_dessert'),
    });
  });

  it('keeps the existing V1 result card click unchanged when called without options', () => {
    trackDessertOrderClick('ESTJ', 'A');
    expect(gtag.mock.calls[0][2]).toMatchObject({
      entry_surface: 'result_dessert_card', url: expect.stringContaining('from=mbti_result_dessert'),
    });
    expect(gtag.mock.calls[0][2]).not.toHaveProperty('unlock_type');
  });

  it('wires both V2 report menu entries to their distinct surfaces', () => {
    const app = readFileSync(new URL('../components/v2/V2App.tsx', import.meta.url), 'utf8');
    expect(app).toContain("buildV2ReportDessertLink(dessertContract?.cta_url, resultData.id, variant, 'v2_report_dessert')");
    expect(app).toContain("buildV2ReportDessertLink(dessertContract?.cta_url, resultData.id, variant, 'v2_report_taste')");
    expect(app).toContain("entrySurface: 'v2_report_dessert', url: dessertOrderUrl");
    expect(app).toContain("entrySurface: 'v2_report_taste', url: tasteMenuUrl");
    expect(app).not.toContain('dessertContract?.cta_url || buildDessertOrderLink');
  });
});
