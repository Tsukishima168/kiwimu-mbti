import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { root, localServer, launch, context, startQuiz, text200, assertNoOverflow } from './browserHarness.mjs';

// Loopback only. Paid reports and menu responses below are fixtures; no real
// login, checkout, completion, email, Discord, or database write is possible.
const artifacts = process.env.QA_V2_ARTIFACTS || path.join(root, '.qa-results/v2-experience');
await mkdir(artifacts, { recursive: true });
async function generated(file, name) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(await readFile(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, { exports });
  return exports[name];
}
const questions = await generated('data/v2TaiwanQuestions.generated.ts', 'V2_TAIWAN_QUESTIONS');
const reports = await generated('data/v2VariantReports.generated.ts', 'V2_VARIANT_REPORTS');
const image = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#D7C678"/></svg>';
const photoUrl = 'https://res.cloudinary.com/qa/image/upload/menu.webp';
const menu = type => ({ success: true, data: {
  mbti_type: type, linkage_type: 'exact', soul_dessert_name: `測試菜單 ${type}`, display_name: `測試菜單 ${type}`,
  canonical_name: `測試菜單 ${type}`, image_url: photoUrl, cta_url: 'https://map.kiwimu.com/menu',
} });
const browser = await launch();
const server = await localServer(process.env.QA_V2_DIST || path.join(root, 'dist'));
const results = [];
const contexts = [];
async function fixture(options = {}) {
  const t = await context(browser, server.url, options);
  contexts.push(t);
  let mode = 'ready', menuDelay = 0, menuRequests = 0, imageRequests = 0, notifications = 0;
  const payloadCounts = [];
  await t.ctx.route('**/api/v2/report', async route => {
    const code = route.request().postDataJSON().mbtiType;
    await route.fulfill({ json: { ok: true, data: { report: reports[code], oppositeReport: reports[code.slice(0, -1) + (code.endsWith('A') ? 'T' : 'A')] } } });
  });
  await t.ctx.route('**/api/mbti-dessert?*', async route => {
    menuRequests++;
    const type = new URL(route.request().url()).searchParams.get('mbti');
    if (mode === 'pending') return; // Teardown aborts this route, never forwards.
    if (mode === 'error') return route.fulfill({ status: 503, json: { success: false } });
    const data = menu(type);
    if (mode === 'no-photo') data.data.image_url = null;
    if (menuDelay) await new Promise(resolve => setTimeout(resolve, menuDelay));
    await route.fulfill({ json: data });
  });
  await t.ctx.route(photoUrl, async route => {
    imageRequests++;
    await route.fulfill({ status: mode === 'image-error' ? 404 : 200, contentType: mode === 'image-error' ? 'text/plain' : 'image/svg+xml', body: mode === 'image-error' ? 'Not found' : image });
  });
  await t.ctx.route('**/api/notify-discord', async route => {
    notifications++;
    const data = route.request().postDataJSON();
    payloadCounts.push(data.answerIndices?.length ?? 0);
    await route.fulfill({ json: { ok: true } });
  });
  return { ...t, setMode(value) { mode = value; }, setMenuDelay(value) { menuDelay = value; }, stats: () => ({ menuRequests, imageRequests, notifications, payloadCounts }) };
}
async function assertPhoto(page) {
  const photo = page.locator('.ad-dessert-image');
  // The persistent figure survives loading -> ready transitions; the img
  // exists only once the refreshed source has been accepted.
  await page.locator('.ad-dessert-visual').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const img = document.querySelector('.ad-dessert-image');
    return img?.complete && img.naturalWidth > 0;
  });
  assert.equal(await photo.count(), 1, 'Photo must exist, not merely have no broken images');
  await assertNoOverflow(page);
}
try {
  for (const [name, options, enlarge] of [
    ['mobile', { viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' }, false],
    ['desktop', { viewport: { width: 1280, height: 900 } }, false],
    ['small-text200', { viewport: { width: 320, height: 568 } }, true],
    ['landscape', { viewport: { width: 844, height: 390 } }, false],
  ]) {
    const t = await fixture(options), page = await t.ctx.newPage();
    await startQuiz(page, server.url, 'v2');
    if (enlarge) await text200(page);
    if (name === 'mobile') {
      await page.screenshot({ path: path.join(artifacts, 'quiz-mobile.png'), fullPage: true });
      await page.locator('.ad-option').first().evaluate(button => { button.click(); button.click(); });
      await page.waitForFunction(text => document.querySelector('.ad-question-text')?.textContent === text, questions[1].text);
      assert.equal(JSON.parse(await page.evaluate(() => sessionStorage.getItem('kiwimu_v2_quiz_draft_v1'))).indices.length, 1);
      await page.getByRole('button', { name: '← 上一題', exact: true }).click();
      await page.waitForFunction(text => document.querySelector('.ad-question-text')?.textContent === text, questions[0].text);
    }
    for (let index = 0; index < questions.length; index++) {
      await page.waitForFunction(text => document.querySelector('.ad-question-text')?.textContent === text, questions[index].text);
      assert.equal(await page.locator('.ad-chapter-break').count(), 0, 'No full-screen chapter interruption');
      assert.ok((await page.locator('.ad-question-text').boundingBox()).y >= 0, 'Next question must start within the viewport after scrolling');
      const choices = page.locator('.ad-option');
      assert.equal(await choices.count(), 2);
      const clipping = await page.locator('.ad-question-wrap').evaluate(node => getComputedStyle(node).overflowY);
      assert.equal(clipping, 'visible', 'Question has no nested scroll trap');
      await assertNoOverflow(page);
      for (let option = 0; option < 2; option++) {
        await choices.nth(option).scrollIntoViewIfNeeded();
        const box = await choices.nth(option).boundingBox();
        assert.ok(box.height >= 44);
      }
      if (name === 'mobile' && index === 3) {
        await page.reload();
        await page.getByRole('button', { name: /接著答第 4 題/ }).click();
        await page.waitForFunction(text => document.querySelector('.ad-question-text')?.textContent === text, questions[index].text);
      }
      // A stalled menu must not hold the last answer / result handoff.
      if (index === questions.length - 1) t.setMode('pending');
      const choice = questions[index].options.findIndex(option => ['E', 'S', 'T', 'J', 'A'].includes(option.value));
      await page.locator('.ad-option').nth(Math.max(0, choice)).click();
    }
    await page.locator('.atlas-report-hero').waitFor({ timeout: 3000 });
    assert.equal(new URL(page.url()).pathname, '/read/ESTJ-A');
    assert.equal(await page.evaluate(() => sessionStorage.getItem('kiwimu_v2_quiz_draft_v1')), null);
    // Restore the menu through the actual error -> retry path.
    await page.getByRole('button', { name: '重新載入照片', exact: true }).waitFor({ timeout: 12000 });
    t.setMode('ready');
    await page.getByRole('button', { name: '重新載入照片', exact: true }).click();
    await assertPhoto(page);
    assert.equal(t.errors.length, 0);
    assert.equal(t.stats().notifications, 1, 'Exactly one mocked completion');
    assert.deepEqual(t.stats().payloadCounts, [40], 'All forty answers reach the mocked completion handler');
    console.log(`PASS ${name}: 40 answers and photo recovery`);
    results.push({ case: name, answered: 40, menuDoesNotBlockResult: true, photoRecovery: true, errors: t.errors, ...t.stats() });
  }
  for (const failure of ['error', 'image-error', 'no-photo']) {
    const t = await fixture(failure === 'error' ? { viewport: { width: 320, height: 568 } } : {}), page = await t.ctx.newPage();
    t.setMode(failure);
    await page.goto(server.url + '/read/ESTJ-A');
    await page.locator('#ch-07').waitFor();
    if (failure === 'error') await text200(page);
    // Lazy photos need to enter view before their failure can appear.
    await page.locator('.ad-dessert-visual').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: '重新載入照片', exact: true }).waitFor();
    const buttonInsideFrame = await page.locator('.ad-dessert-photo-status button').evaluate(button => {
      const frame = button.closest('figure').getBoundingClientRect(), control = button.getBoundingClientRect();
      return control.top >= frame.top && control.bottom <= frame.bottom && control.left >= frame.left && control.right <= frame.right;
    });
    assert.equal(buttonInsideFrame, true, 'Photo retry must not be clipped, including 200% text');
    t.setMode('ready');
    t.setMenuDelay(600);
    const refreshed = page.waitForResponse(response => response.url().includes('/api/mbti-dessert?') && response.status() === 200);
    await page.getByRole('button', { name: '重新載入照片', exact: true }).click();
    await page.locator('.ad-dessert-photo-status[aria-busy="true"]').waitFor();
    assert.equal(await page.locator('.ad-dessert-image').count(), 0, 'Retry must not briefly recreate the failed old photo');
    assert.equal(t.stats().imageRequests, failure === 'image-error' ? 1 : 0);
    const refreshedResponse = await refreshed;
    assert.ok(new URL(refreshedResponse.url()).searchParams.get('_refresh'), 'Refresh bypasses the shared CDN cache key');
    await assertPhoto(page);
    const requests = t.stats();
    assert.equal(requests.imageRequests, failure === 'image-error' ? 2 : 1, 'Exactly one image load per accepted menu response');
    assert.equal(requests.menuRequests, 2, 'Retry refreshes source, even for cached/no-photo contracts');
    assert.equal(t.errors.length, 0);
    console.log(`PASS photo-${failure}-recovery`);
    results.push({ case: `photo-${failure}-recovery`, positivePhotoPresence: true, errors: t.errors, ...requests });
  }
  for (const code of Object.keys(reports)) {
    const t = await fixture(), page = await t.ctx.newPage();
    await page.goto(server.url + '/read/' + code);
    await page.locator('#ch-07').waitFor();
    await assertPhoto(page);
    assert.ok((await page.locator('.ad-dessert-image').getAttribute('alt')).includes(code.slice(0, -2)));
    assert.equal(t.errors.length, 0);
    results.push({ case: `photo-${code}`, positivePhotoPresence: true, errors: t.errors });
  }
  await writeFile(path.join(artifacts, 'results.json'), JSON.stringify({ results, realExternalWrites: 0, paidAndMenuData: 'fixtures' }, null, 2));
  console.log(`V2 experience: ${results.length} cases passed; artifacts: ${artifacts}`);
} finally {
  await writeFile(path.join(artifacts, 'results.json'), JSON.stringify({ results, completed: results.length === 39, realExternalWrites: 0, paidAndMenuData: 'fixtures' }, null, 2));
  for (const t of contexts) await t.close();
  await browser.close(); await server.close();
}
