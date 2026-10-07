const LOGIN_FAILURE_MESSAGES = new Set([
  '登入視窗無法開啟，正在改用整頁登入…',
  '登入視窗已關閉，請再試一次。',
  '登入逾時，請重新嘗試',
]);

// Only known UI copy can reach the page; provider details are never display text.
export function loginFailureMessage(message?: string | null): string {
  return message && LOGIN_FAILURE_MESSAGES.has(message)
    ? message
    : '暫時無法完成登入，請再試一次。';
}
