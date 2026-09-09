import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

const sent: any[][] = [];

beforeAll(() => {
  const g = globalThis as any;
  g.window = g;
  g._lt = (...args: any[]) => { sent.push(args); };
  g.location = { href: 'https://kiwimu.com/', protocol: 'https:', search: '', pathname: '/', hostname: 'kiwimu.com' };
  g.document = {
    referrer: '', title: 'test', cookie: '',
    createElement: () => ({ style: {}, setAttribute() {} }),
    head: { appendChild() {} },
    getElementsByTagName: () => [{ parentNode: { insertBefore() {} } }],
    addEventListener() {},
  };
  g.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  g.sessionStorage = g.localStorage;
});

beforeEach(() => { sent.length = 0; });

const cvCalls = () => sent.filter((a) => a[0] === 'send' && a[1] === 'cv');
const TAG = 'f13358fc-4047-4059-8d79-013e0f7b89f6';

describe('trackOutboundClick → LINE Tag cv', () => {
  it('LINE_OA 送出 ClickLineCTA，格式為官方四參數', async () => {
    const { trackOutboundClick } = await import('./utmTracking');
    trackOutboundClick('LINE_OA', 'navigation', { section: 'smoke' });
    expect(cvCalls()).toHaveLength(1);
    expect(cvCalls()[0][2]).toEqual({ type: 'ClickLineCTA' });
    expect(cvCalls()[0][3]).toEqual([TAG]);
  });

  it('DESSERT_BOOKING 送出 ClickDessertLink', async () => {
    const { trackOutboundClick } = await import('./utmTracking');
    trackOutboundClick('DESSERT_BOOKING', 'result-cta', { section: 'smoke' });
    expect(cvCalls()).toHaveLength(1);
    expect(cvCalls()[0][2]).toEqual({ type: 'ClickDessertLink' });
    expect(cvCalls()[0][3]).toEqual([TAG]);
  });

  it('其他目的地不送 LINE cv（避免稀釋受眾）', async () => {
    const { trackOutboundClick } = await import('./utmTracking');
    for (const key of ['MOON_MAP', 'PASSPORT', 'GACHA', 'DISCORD', 'INSTAGRAM']) {
      trackOutboundClick(key, 'navigation', { section: 'smoke' });
    }
    expect(cvCalls()).toHaveLength(0);
  });

  it('PageView 不會被送成 cv', async () => {
    const { trackMarketingEvent, MARKETING_EVENTS } = await import('./marketingPixels');
    trackMarketingEvent(MARKETING_EVENTS.PAGE_VIEW);
    expect(cvCalls()).toHaveLength(0);
  });
});
