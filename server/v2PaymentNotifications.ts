import { sendV2PaymentReceipt, type ReceiptStatus } from './v2PaymentReceipt.js';
import { sendV2MerchantNotification } from './v2MerchantNotification.js';

// Neither notification can turn a confirmed payment into a failure. Run them
// together so a slow provider does not add two sequential waits to the return.
export async function notifyV2Payment(orderId: string): Promise<ReceiptStatus> {
  const [receipt] = await Promise.allSettled([
    sendV2PaymentReceipt(orderId), sendV2MerchantNotification(orderId),
  ]);
  return receipt.status === 'fulfilled' ? receipt.value : 'failed';
}
