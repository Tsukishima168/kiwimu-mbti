import { describe, expect, it } from 'vitest';
import {
  buildV2LinePayOrderId,
  buildV2OrderCookie,
  buildV2PendingOrderCookie,
  clearV2PendingOrderCookie,
  parseLinePayApiResponse,
  parseMbtiTypeFromOrderId,
  readV2PendingOrderIdCookie,
  readV2OrderIdCookie,
} from './linePay';

describe('V2 LINE Pay order proof', () => {
  it('uses a type-bound 128-bit random suffix', () => {
    const orderId = buildV2LinePayOrderId('infj-a');

    expect(orderId).toMatch(/^V2-INFJ-A-\d+-[0-9a-f]{32}$/);
    expect(parseMbtiTypeFromOrderId(orderId)).toBe('INFJ-A');
  });

  it('does not repeat across independent orders', () => {
    expect(buildV2LinePayOrderId('ESTJ-T')).not.toBe(buildV2LinePayOrderId('ESTJ-T'));
  });

  it('round-trips the order proof through a scoped HttpOnly cookie', () => {
    const orderId = buildV2LinePayOrderId('INFJ-T');
    const cookie = buildV2OrderCookie(orderId);

    expect(cookie).toContain('__Host-kiwimu-v2-order=');
    expect(cookie).toContain('Path=/;');
    expect(cookie).toContain('Max-Age=7776000');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(readV2OrderIdCookie(cookie)).toBe(orderId);
  });

  it('round-trips the pending order proof through a short-lived HttpOnly cookie', () => {
    const orderId = buildV2LinePayOrderId('ENFP-A');
    const cookie = buildV2PendingOrderCookie(orderId);

    expect(cookie).toContain('__Host-kiwimu-v2-pending-order=');
    expect(cookie).toContain('Path=/;');
    expect(cookie).toContain('Max-Age=1800');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(readV2PendingOrderIdCookie(cookie)).toBe(orderId);
    expect(clearV2PendingOrderCookie()).toContain('Max-Age=0');
  });

  it('keeps LINE Pay transaction ids as exact strings', () => {
    const payload = parseLinePayApiResponse<{ transactionId: string }>(
      '{"returnCode":"0000","returnMessage":"OK","info":{"transactionId":2026090902381099110}}',
    );

    expect(payload.info?.transactionId).toBe('2026090902381099110');
  });
});
