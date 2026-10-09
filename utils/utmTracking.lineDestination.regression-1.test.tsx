import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./crossSiteTracking', () => ({
  SITE_ID: 'mbti-lab',
  compactUtmParams: vi.fn(() => ({})),
  getUtmParamsFromUrl: vi.fn(() => ({})),
  trackEvent: vi.fn(),
}));
vi.mock('./marketingPixels', () => ({ MARKETING_EVENTS: {}, trackLINEEvent: vi.fn() }));
vi.mock('../hooks/usePendingEconomyClaimUrl', () => ({
  usePendingEconomyClaimUrl: (url: string) => url,
}));

import { buildLineLink, EXTERNAL_LINKS } from './utmTracking';
import ExploreMore from '../components/ExploreMore';

// Regression: ISSUE-001 — official-account links opened a coupon instead of @kiwimu.
// Found by /qa on 2026-10-09.
// Report: /Users/pensoair/.codex/visualizations/2026/10/09/kiwimu-mbti-acceptance/REPORT.md
describe('LINE official-account destinations', () => {
  it.each(['header', 'result', 'floating-menu'] as const)('keeps the account and attribution for %s', context => {
    const url = new URL(buildLineLink(context));
    expect(url.origin).toBe('https://line.me');
    expect(decodeURIComponent(url.pathname)).toBe('/R/ti/p/@kiwimu');
    expect(url.searchParams.get('utm_source')).toBe('mbti-lab');
    expect(url.searchParams.get('utm_content')).toBe(`line-${context}`);
  });

  it('renders LINE Official with the same account destination', () => {
    const html = renderToStaticMarkup(<ExploreMore />);
    expect(html).toContain(`href="${EXTERNAL_LINKS.LINE_OA.baseUrl}"`);
    expect(html).not.toContain('lin.ee/r19wTnY');
    expect(html).toContain('LINE Official');
  });
});
