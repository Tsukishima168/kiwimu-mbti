import { expect, it } from 'vitest';
import { mkdtemp, readFile, stat, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
// @ts-expect-error Operational script intentionally uses native Node ESM.
import { renderSummary, validateSummary, savePrivateReport } from './notification-health.mjs';
function summary() {
  const unavailable = { availability: 'unavailable', counts: null, staleSending: null, retry: null };
  return { version: 1, generatedAt: '2026-10-10T00:00:00.000Z', scope: 'recorded-notifications', providerAcceptanceOnly: true, sources: { receipts: unavailable, merchant: unavailable, quiz: { availability: 'available', counts: { sending: 1, sent: 2, review: 3, retry: 4 }, staleSending: 1, retry: { due: 1, scheduled: 2, missingTime: 1 } } } };
}
it('renders unknown sources and the delivery limitation without claiming all healthy', () => {
  const html = renderSummary(summary());
  expect(html).toContain('無法讀取，狀態未知');
  expect(html).toContain('不代表收件人已收到');
  expect(html).toContain('重試時間缺失');
  expect(html).not.toContain('<script');
});
it('rejects extra fields, injection and invalid counts instead of saving raw responses', () => {
  const extra = { ...summary(), recipient: 'private-field' };
  expect(() => validateSummary(extra)).toThrow();
  expect(() => renderSummary({ ...summary(), generatedAt: '<script>alert(1)</script>' })).toThrow();
  const invalid = summary(); invalid.sources.quiz.counts.sent = -1;
  expect(() => validateSummary(invalid)).toThrow();
});
it('creates private files and refuses overwrites/symlinks', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'kiwimu-private-report-'));
  const file = path.join(dir, 'report.html');
  await savePrivateReport(file, renderSummary(summary()));
  expect((await stat(file)).mode & 0o777).toBe(0o600);
  await expect(savePrivateReport(file, 'overwrite')).rejects.toThrow();
  await symlink(file, path.join(dir, 'alias.html'));
  await expect(savePrivateReport(path.join(dir, 'alias.html'), 'overwrite')).rejects.toThrow();
  expect(await readFile(file, 'utf8')).toContain('通知紀錄檢核');
});
