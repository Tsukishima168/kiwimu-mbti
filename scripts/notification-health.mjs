import { mkdir, lstat, open } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const statusSets = {
  receipts: ['pending', 'sending', 'sent', 'failed', 'review'],
  merchant: ['pending', 'sending', 'sent', 'failed', 'review'],
  quiz: ['sending', 'sent', 'review', 'retry'],
};
function object(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key))) throw new Error('摘要格式不符');
  return value;
}
function count(value) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('摘要計數不符');
  return value;
}
export function validateSummary(input) {
  object(input, ['version', 'generatedAt', 'scope', 'providerAcceptanceOnly', 'sources']);
  if (input.version !== 1 || input.scope !== 'recorded-notifications' || input.providerAcceptanceOnly !== true
    || typeof input.generatedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(input.generatedAt)
    || !Number.isFinite(Date.parse(input.generatedAt))) throw new Error('摘要版本或時間不符');
  object(input.sources, Object.keys(statusSets));
  for (const [name, statuses] of Object.entries(statusSets)) {
    const source = object(input.sources[name], ['availability', 'counts', 'staleSending', 'retry']);
    if (source.availability === 'unavailable') {
      if (source.counts !== null || source.staleSending !== null || source.retry !== null) throw new Error('不可將讀取失敗表示為零');
      continue;
    }
    if (source.availability !== 'available') throw new Error('讀取狀態不符');
    object(source.counts, statuses);
    Object.values(source.counts).forEach(count);
    count(source.staleSending);
    if (name === 'quiz') {
      object(source.retry, ['due', 'scheduled', 'missingTime']);
      Object.values(source.retry).forEach(count);
    } else if (source.retry !== null) throw new Error('重試摘要不符');
  }
  return input;
}
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const labels = { receipts: '客戶付款信', merchant: '商家付款通知', quiz: '測驗完成通知' };
const statusLabels = { pending: '等待處理', sending: '處理中', sent: '服務商已接受', failed: '失敗', review: '需要核對', retry: '等待重試' };
export function renderSummary(input) {
  const data = validateSummary(input);
  const sections = Object.entries(data.sources).map(([name, source]) => {
    if (source.availability === 'unavailable') return `<section><h2>${labels[name]}</h2><p class="warning">無法讀取，狀態未知。</p></section>`;
    const needsReview = (source.counts.failed || 0) + source.counts.review + source.staleSending + (source.retry?.due || 0) + (source.retry?.missingTime || 0);
    return `<section><h2>${labels[name]}</h2><p>${needsReview ? '有紀錄需要人工核對' : '本次摘要未發現需核對的紀錄'}</p><dl>${Object.entries(source.counts).map(([status, value]) => `<div><dt>${statusLabels[status]}</dt><dd>${escape(value)}</dd></div>`).join('')}<div><dt>處理超過五分鐘</dt><dd>${source.staleSending}</dd></div>${source.retry ? `<div><dt>重試已到期</dt><dd>${source.retry.due}</dd></div><div><dt>重試尚未到期</dt><dd>${source.retry.scheduled}</dd></div><div><dt>重試時間缺失</dt><dd>${source.retry.missingTime}</dd></div>` : ''}</dl></section>`;
  }).join('');
  return `<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>Kiwimu 通知紀錄檢核</title><style>body{margin:0;background:#F5F0E8;color:#1F2F1F;font:16px/1.8 system-ui,sans-serif}main{max-width:900px;margin:auto;padding:24px}section{background:white;border:1px solid #D8D7C4;border-radius:12px;padding:20px;margin:20px 0}h1{font-size:28px}h2{font-size:20px}dl div{display:flex;justify-content:space-between;gap:20px;border-bottom:1px solid #eee}dd{margin:0}.warning{color:#795B23}</style><main><h1>通知紀錄檢核</h1><p>讀取時間：${escape(data.generatedAt)}</p><p>這是三張通知紀錄表的筆數摘要。「服務商已接受」不代表收件人已收到。尚未建立紀錄的漏送不在此報表內；各筆數可能在讀取期間變動。</p>${sections}<p>遇到需要核對的紀錄，請依通知操作手冊人工比對。此頁不會寄信、發 Discord 或重送。</p></main></html>`;
}
export async function savePrivateReport(output, html) {
  const directory = path.dirname(path.resolve(output));
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const info = await lstat(directory);
  if (!info.isDirectory() || info.isSymbolicLink() || (info.mode & 0o777) !== 0o700) throw new Error('請使用權限 0700 的私有輸出目錄');
  // Exclusive creation also refuses symlinks and existing files; never overwrite an owner report.
  const handle = await open(output, 'wx', 0o600);
  try { await handle.writeFile(html); } finally { await handle.close(); }
}
async function main() {
  const args = process.argv.slice(2);
  const options = {};
  while (args.length) {
    const key = args.shift();
    if (!['--input', '--output'].includes(key) || !args.length || Object.hasOwn(options, key)) throw new Error('用法：node scripts/notification-health.mjs [--input 摘要.json] [--output 私有目錄/摘要.html]');
    options[key] = args.shift();
  }
  let data;
  if (options['--input']) {
    const { readFile } = await import('node:fs/promises');
    data = JSON.parse(await readFile(options['--input'], 'utf8'));
  } else {
    const token = process.env.KIWIMU_NOTIFICATION_HEALTH_TOKEN;
    if (!token || token.length < 32 || token.length > 256 || /\s/.test(token)) throw new Error('尚未設定有效的 KIWIMU_NOTIFICATION_HEALTH_TOKEN');
    const response = await fetch('https://kiwimu.com/api/v2/notification-health', {
      method: 'GET', redirect: 'error', signal: AbortSignal.timeout(10_000),
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (![200, 503].includes(response.status)) throw new Error(`摘要無法讀取（HTTP ${response.status}）`);
    const text = await response.text();
    if (text.length > 16_384) throw new Error('摘要大小不符');
    const body = JSON.parse(text);
    if (!body.data) throw new Error('摘要尚未可用');
    data = body.data;
  }
  const output = options['--output'] || `.qa-results/notification-health/notifications-${Date.now()}.html`;
  await savePrivateReport(output, renderSummary(data));
  console.log(`通知摘要已儲存：${path.resolve(output)}`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(() => { console.error('通知摘要未完成。請核對私有目錄、摘要格式及操作手冊中的設定；不會自動重送。'); process.exitCode = 1; });
}
