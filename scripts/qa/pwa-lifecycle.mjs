import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, writeFile, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { root, localServer, context, startQuiz, text200, assertNoOverflow } from './browserHarness.mjs';
import { loopbackProxy } from './loopbackProxy.mjs';

const artifacts = path.join(root, '.qa-results/pwa');
await mkdir(artifacts, { recursive: true });
const workspace = await mkdtemp(path.join(tmpdir(), 'kiwimu-pwa-lifecycle-'));
const baseRef = process.env.QA_BASE_REF || 'HEAD';
if (!/^[a-zA-Z0-9_./^-]+$/.test(baseRef)) throw new Error('Invalid QA base ref');
const base = execFileSync('git', ['rev-parse', '--verify', `${baseRef}^{commit}`], { cwd: root, encoding: 'utf8' }).trim();
const oldSource = path.join(workspace, 'previous-release');
await mkdir(oldSource);
const archive = path.join(workspace, 'previous.tar');
execFileSync('git', ['archive', '--format=tar', `--output=${archive}`, base], { cwd: root });
execFileSync('tar', ['-xf', archive, '-C', oldSource]);
// Two real builds of the candidate, with distinct HTML precache revisions, test
// future updates as well as migration from the preceding release. Never mutate
// checked-out source files or load an env file in these temporary build copies.
const versions = [oldSource];
for (const name of ['candidate-a', 'candidate-b']) {
  const destination = path.join(workspace, name);
  await cp(root, destination, { recursive: true, filter: file => {
    const segments = path.relative(root, file).split(path.sep);
    return !segments.some(part => ['node_modules', '.git', 'dist', '.qa-results', '.tmp', '.gstack', '.vercel'].includes(part) || part.startsWith('.env'));
  } });
  versions.push(destination);
}
const env = { ...process.env, GEMINI_API_KEY: '' };
for (const key of Object.keys(env)) if (key.startsWith('VITE_')) env[key] = '';
env.VITE_MOON_ISLAND_SUPABASE_URL = 'https://example.invalid';
env.VITE_MOON_ISLAND_SUPABASE_ANON_KEY = 'qa-noncredential-placeholder';
for (let index = 0; index < versions.length; index++) {
  const source = versions[index];
  await symlink(path.join(root, 'node_modules'), path.join(source, 'node_modules'), 'dir');
  const html = await readFile(path.join(source, 'index.html'), 'utf8');
  await writeFile(path.join(source, 'index.html'), html.replace('</head>', `<meta name="qa-build-version" content="${index}"></head>`));
  execFileSync(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), 'build'], { cwd: source, env, stdio: 'pipe', timeout: 120_000 });
}
const proxy = await loopbackProxy();
let browser;
const results = [];
async function swContext(server) {
  proxy.allow(server.url);
  const t = await context(browser, server.url, { serviceWorkers: 'allow' });
  // Even an external-only route enables Fetch interception for every request.
  // Remove routing before opening pages; the proxy still blocks all other origins.
  await t.ctx.unrouteAll({ behavior: 'ignoreErrors' });
  return t;
}
async function waitControlled(page) {
  await page.evaluate(() => navigator.serviceWorker.ready);
  // Prompt-mode workers do not claim a first visit until the next navigation.
  // Warm the welcome page before starting a quiz, never reload an active quiz.
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
}
async function update(page) {
  await page.evaluate(async () => { const registration = await navigator.serviceWorker.ready; await registration.update(); });
  await page.locator('.ku-update-notice').waitFor({ timeout: 30_000 });
}
async function answer(page, version) {
  const heading = page.locator(version === 'v1' ? '.classic-quiz h2' : version === 'v1_5' ? '.explore-quiz h2' : '.ad-question-text');
  const before = await heading.textContent();
  await page.locator(version === 'v1' ? '.classic-quiz-option' : version === 'v1_5' ? '.explore-quiz button' : '.ad-option').first().click();
  await page.waitForFunction(({ selector, before }) => !document.querySelector(selector) || document.querySelector(selector).textContent !== before,
    { selector: version === 'v1' ? '.classic-quiz h2' : version === 'v1_5' ? '.explore-quiz h2' : '.ad-question-text', before });
}
try {
  browser = await chromium.launch({ headless: true,
    proxy: { server: proxy.url, bypass: '<-loopback>' },
    ...(process.env.QA_BROWSER_EXECUTABLE ? { executablePath: process.env.QA_BROWSER_EXECUTABLE } : {}),
    args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'],
  });
  // Migration from the real previous release: no forced reload; V2 draft survives
  // explicit acceptance. The old release's button cannot acquire the new guard
  // until it reloads, so this case deliberately checks that existing behavior.
  const server = await localServer(path.join(versions[0], 'dist'));
  console.log('PWA: previous release → candidate');
  const t = await swContext(server);
  try {
    const page = await t.ctx.newPage();
    await page.goto(server.url + '/read'); await waitControlled(page);
    await startQuiz(page, server.url, 'v2');
    await answer(page, 'v2');
    const draft = await page.evaluate(() => sessionStorage.getItem('kiwimu_v2_quiz_draft_v1'));
    await page.evaluate(() => { window.qaDocumentId = 'old-v2-document'; });
    server.switchRoot(path.join(versions[1], 'dist'));
    await update(page);
    assert.equal(await page.evaluate(() => window.qaDocumentId), 'old-v2-document');
    // On subsequent runs the base may already contain the quiz guard. Returning
    // deliberately to the welcome screen retains the session draft and permits
    // explicit acceptance; never bypass the guard from a test helper.
    if (await page.getByRole('button', { name: '完成後可更新', exact: true }).count()) {
      await page.goto(server.url + '/read/quiz'); await page.locator('.ku-update-notice').waitFor();
    }
    await page.getByRole('button', { name: '更新頁面', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('meta[name="qa-build-version"]')?.content === '1');
    assert.equal(await page.evaluate(() => sessionStorage.getItem('kiwimu_v2_quiz_draft_v1')), draft);
    await page.getByRole('button', { name: /接著答第 2 題/ }).click();
    assert.equal(await page.locator('.ad-quiz-helper').innerText(), '已完成 1 / 40 題');
    assert.equal(t.errors.length, 0);
    results.push({ case: 'previous-release-to-candidate', base, explicitAcceptance: true, v2DraftPreserved: true, automaticReload: false });
  } finally { await t.close(); await server.close(); }

  for (const version of ['v1', 'v1_5', 'v2']) {
    console.log(`PWA: ${version} quiz and second-tab activation`);
    const server = await localServer(path.join(versions[1], 'dist'));
    const t = await swContext(server);
    try {
      const page = await t.ctx.newPage();
      await page.goto(server.url + '/read'); await waitControlled(page);
      await startQuiz(page, server.url, version);
      await answer(page, version);
      const question = await page.locator('h2').first().textContent();
      await page.evaluate(() => { window.qaDocumentId = 'active-quiz-document'; });
      server.switchRoot(path.join(versions[2], 'dist'));
      await update(page);
      await text200(page); await assertNoOverflow(page);
      assert.equal(await page.getByRole('button', { name: '完成後可更新', exact: true }).isDisabled(), true);
      await page.screenshot({ path: path.join(artifacts, `${version}-deferred-text200.png`), fullPage: true });
      const other = await t.ctx.newPage();
      await other.goto(server.url + '/read'); await other.locator('.ku-update-notice').waitFor();
      await other.getByRole('button', { name: '更新頁面', exact: true }).click();
      await other.waitForFunction(() => document.querySelector('meta[name="qa-build-version"]')?.content === '2');
      assert.equal(await page.evaluate(() => window.qaDocumentId), 'active-quiz-document');
      assert.equal(await page.locator('h2').first().textContent(), question);
      assert.equal(await page.getByRole('button', { name: '完成後可更新', exact: true }).isDisabled(), true);
      await page.bringToFront();
      await page.getByRole('button', { name: '稍後', exact: true }).click();
      await page.locator('.ku-update-notice').waitFor({ state: 'detached' });
      const total = version === 'v1_5' ? 5 : 40;
      for (let index = 1; index < total; index++) await answer(page, version);
      console.log(`PWA: ${version} completed, accepting deferred update`);
      await page.getByRole('button', { name: '更新頁面', exact: true }).waitFor();
      await page.getByRole('button', { name: '更新頁面', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('meta[name="qa-build-version"]')?.content === '2');
      // Keep the callback tab foreground while retaining the full load assertion.
      await other.bringToFront();
      const response = await other.goto(server.url + '/api/linepay/confirm?qa=local-only');
      assert.equal(response.status(), 503);
      assert.equal((await response.json()).code, 'QA_MOCK_ONLY');
      assert.equal(await other.locator('.classic-intro').count(), 0);
      assert.equal(t.errors.length, 0);
      assert.equal(server.effects.mockedNotifications, 1);
      results.push({ case: version, guardedWhileAnswering: true, otherTabReloadedOnly: true, completedBeforeUpdate: total,
        callbackBypassesAppShell: true, realNotifications: 0, mockedNotifications: 1, pageErrors: 0 });
    } finally { await t.close(); await server.close(); }
  }
  await writeFile(path.join(artifacts, 'results.json'), JSON.stringify({ results, workspace,
    networkTransport: 'allowlisted-loopback-proxy', network: proxy.stats(), realExternalWrites: 0 }, null, 2));
  console.log(`PWA lifecycle: ${results.length} cases passed; artifacts: ${artifacts}`);
} finally {
  try { await browser?.close(); } finally { await proxy.close(); }
}
