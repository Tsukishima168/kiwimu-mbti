import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { trackV2CheckoutStart, trackV2PaywallView, trackV2Unlocked } from './analytics';

describe('V2 product analytics', () => {
  const gtag = vi.fn();
  beforeEach(() => {
    gtag.mockClear();
    vi.stubGlobal('window', {});
    vi.stubGlobal('gtag', gtag);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('advertises NT$99 and never forwards the reserved payment URL', () => {
    trackV2PaywallView('ESTJ-A', 'quiz');
    trackV2CheckoutStart('ESTJ-A', 'quiz', 'https://web-pay.line.me/?transactionReserveId=private-proof');
    expect(gtag.mock.calls[0]).toEqual(['event', 'view_item', expect.objectContaining({
      items: [expect.objectContaining({ price: 99, currency: 'TWD' })],
    })]);
    expect(gtag.mock.calls[1]).toEqual(['event', 'begin_checkout', expect.objectContaining({
      value: 99, currency: 'TWD', items: [expect.objectContaining({ price: 99 })],
    })]);
    expect(JSON.stringify(gtag.mock.calls)).not.toContain('private-proof');
    expect(gtag.mock.calls[1][2]).not.toHaveProperty('checkout_url');
  });

  it.each(['query-preview', 'local-preview', 'linepay'])('does not count %s report access as another sale', unlockType => {
    trackV2Unlocked('ESTJ-A', unlockType, 'library');
    trackV2Unlocked('ESTJ-A', unlockType, 'library');
    expect(gtag.mock.calls.every(call => call[1] === 'v2_report_unlocked')).toBe(true);
    for (const call of gtag.mock.calls) {
      expect(call[2]).not.toHaveProperty('value');
      expect(call[2]).not.toHaveProperty('transaction_id');
    }
  });
});
