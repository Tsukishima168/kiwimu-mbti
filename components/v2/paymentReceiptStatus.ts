export type ReceiptStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'review';

export function paymentReceiptMessage(status: ReceiptStatus): string {
  switch (status) {
    case 'sent': return '付款通知已送出，請查看信箱或垃圾郵件；報告可正常閱讀。';
    case 'sending': return '正在確認通知信的寄送結果，可能已送出。請至少等 5 分鐘再檢查，報告可正常閱讀。';
    case 'failed': return '尚未確認通知信寄送成功。請至少等 5 分鐘再試，付款已確認，報告可正常閱讀。';
    case 'review': return '通知信的寄送結果需要人工確認，已暫停自動重寄以避免重複寄送。付款已確認，報告可正常閱讀。';
    default: return '付款已確認，通知信尚未寄出；你可以直接打開報告閱讀。';
  }
}
