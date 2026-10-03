import { afterEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ receipt: vi.fn(), merchant: vi.fn() }));
vi.mock('./v2PaymentReceipt.js', () => ({ sendV2PaymentReceipt: mocks.receipt }));
vi.mock('./v2MerchantNotification.js', () => ({ sendV2MerchantNotification: mocks.merchant }));
import { notifyV2Payment } from './v2PaymentNotifications';
afterEach(() => vi.clearAllMocks());

describe('independent payment notifications', () => {
  it('starts both providers and keeps receipt success when merchant delivery throws', async () => {
    let resolveReceipt!: (value: string) => void;
    mocks.receipt.mockImplementation(() => new Promise(resolve => { resolveReceipt = resolve; }));
    mocks.merchant.mockRejectedValue(new Error('Discord unavailable'));
    const pending = notifyV2Payment('server-confirmed-fixture');
    expect(mocks.merchant).toHaveBeenCalledOnce();
    resolveReceipt('sent');
    expect(await pending).toBe('sent');
  });
  it('still attempts merchant delivery if the customer provider throws', async () => {
    mocks.receipt.mockRejectedValue(new Error('Resend unavailable'));
    mocks.merchant.mockResolvedValue('sent');
    expect(await notifyV2Payment('server-confirmed-fixture')).toBe('failed');
    expect(mocks.merchant).toHaveBeenCalledOnce();
  });
});
