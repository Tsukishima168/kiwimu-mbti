/**
 * 測驗完成後寄送結果信（僅對已登入且有 email 的用戶）
 * 呼叫 /api/send-email，不阻塞 UI，失敗僅 log
 */

interface ResultSummary {
  title?: string;
  summary?: string;
  dessert?: { name?: string };
}

export async function sendResultEmail(
  to: string,
  mbtiType: string,
  variant: string,
  resultSummary?: ResultSummary
): Promise<void> {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const resultUrl = baseUrl ? `${baseUrl}/` : ''; // 同源開啟即會帶 session，看到結果頁

  const title = resultSummary?.title || `你的靈魂甜點類型：${mbtiType}-${variant}`;
  const summary = resultSummary?.summary
    ? resultSummary.summary.slice(0, 200) + (resultSummary.summary.length > 200 ? '…' : '')
    : '';
  const dessertName = resultSummary?.dessert?.name || '';

  const subject = `你的靈魂甜點 MBTI 結果：${mbtiType}-${variant}`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 560px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a;">${escapeHtml(title)}</h2>
  ${summary ? `<p>${escapeHtml(summary)}</p>` : ''}
  ${dessertName ? `<p>你的專屬靈魂甜點：<strong>${escapeHtml(dessertName)}</strong></p>` : ''}
  <p><a href="${escapeHtml(resultUrl)}" style="display: inline-block; padding: 12px 24px; background: #1a1a1a; color: #fff; text-decoration: none; border-radius: 999px;">回網站看完整結果</a></p>
  <p style="font-size: 12px; color: #888;">此信由 MBTI Lab 測驗完成後自動寄送。</p>
</body>
</html>
  `.trim();

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('Send result email failed:', res.status, err);
    }
  } catch (err) {
    console.warn('Send result email error:', err);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
