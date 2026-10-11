import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { root, localServer, launch, context, text200, assertNoOverflow } from './browserHarness.mjs';

// Real rendering, loopback entitlement/menu fixtures. External requests and
// all production effects are blocked by the shared browser/server harness.
const artifacts = process.env.QA_REPORT_ARTIFACTS || path.join(root, '.qa-results/report-reading');
await mkdir(artifacts, { recursive: true });
const exported = {};
vm.runInNewContext(ts.transpileModule(await readFile(path.join(root, 'data/v2VariantReports.generated.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: exported });
const reports = exported.V2_VARIANT_REPORTS;
const imageUrl = 'https://res.cloudinary.com/qa/image/upload/dessert.webp';
const server = await localServer(process.env.QA_REPORT_DIST || path.join(root, 'dist'));
const browser = await launch();
const results = [];
async function check(code, width, enlarge = false, locked = false) {
  const t = await context(browser, server.url, { viewport: { width, height: 844 } });
  let reportRequests = 0;
  try {
    await t.ctx.route('**/api/v2/report', async route => {
      reportRequests++;
      assert.equal(route.request().postDataJSON().mbtiType, code);
      await route.fulfill(locked ? { status: 403, json: { ok: false, code: 'ACCESS_DENIED' } } : { json: {
        ok: true, data: { report: reports[code], oppositeReport: reports[code.slice(0, -1) + (code.endsWith('A') ? 'T' : 'A')] },
      } });
    });
    await t.ctx.route('**/api/mbti-dessert?*', route => route.fulfill({ json: { success: true, data: {
      mbti_type: code.slice(0, 4), linkage_type: 'exact', soul_dessert_name: '測試菜單照片', display_name: '測試菜單照片', canonical_name: '測試菜單照片',
      image_url: imageUrl, description: '測試商品說明。', cta_url: 'https://map.kiwimu.com/menu',
    } } }));
    await t.ctx.route(imageUrl, route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#D7C678"/></svg>' }));
    const page = await t.ctx.newPage();
    await page.goto(`${server.url}/read/${code}`);
    await page.locator(locked ? '.ad-paywall-box' : '#ch-08').waitFor();
    if (enlarge) await text200(page);
    await assertNoOverflow(page);
    if (locked) {
      assert.equal(await page.locator('#ch-02, #ch-08, .ad-narrative-scene').count(), 0);
      assert.equal(await page.getByText(reports[code].narrative.scenes[0].body, { exact: true }).count(), 0);
    } else {
      assert.equal(await page.locator('[id^="ch-"]').count(), 8);
      assert.equal(await page.locator('.ad-narrative-scene').count(), 4);
      assert.equal(await page.locator('.ad-narrative-scene .ad-report-copy > p').count(), 8);
      assert.equal(await page.locator('.ad-subtype-card').count(), 2);
      const typography = await page.locator('.ad-report-copy > p').evaluateAll(nodes => nodes.map(node => {
        const style = getComputedStyle(node);
        return { font: parseFloat(style.fontSize), lineHeight: parseFloat(style.lineHeight), text: node.textContent.length };
      }));
      assert.ok(typography.length > 30);
      assert.ok(typography.every(item => item.font >= (enlarge ? 32 : 16)), 'All report reading paragraphs retain body size');
      assert.ok(typography.every(item => item.lineHeight / item.font >= 1.85));
      const paragraphs = await page.locator('.ad-narrative-scene').first().locator('p').allTextContents();
      assert.deepEqual(paragraphs, reports[code].narrative.scenes[0].body.split('\n\n'));
      const cards = await page.locator('.ad-subtype-card').evaluateAll(nodes => nodes.map(node => {
        const box = node.getBoundingClientRect(); return { x: box.x, right: box.right, top: box.top };
      }));
      if (width <= 700) {
        assert.ok(cards[1].top > cards[0].top, 'Both A/T cards are vertically discoverable');
        assert.ok(cards.every(card => card.x >= 0 && card.right <= width));
        assert.equal(await page.locator('.ad-compare-scroll').evaluate(node => node.scrollWidth > node.clientWidth), false);
      }
      await page.locator('.ad-state-details summary').click();
      assert.equal(await page.locator('.ad-state-details').getAttribute('open'), '');
      for (const chapter of ['ch-02', 'ch-03', 'ch-04', 'ch-05', 'ch-06', 'ch-07', 'ch-08']) {
        if (width <= 900) {
          const summary = page.locator('.ad-mobile-contents summary');
          await summary.focus(); await page.keyboard.press('Enter');
          const index = Number(chapter.slice(-2)) - 1;
          await page.locator('.ad-mobile-contents nav button').nth(index).focus();
        } else await page.locator('.ad-chapternav button').nth(Number(chapter.slice(-2)) - 1).focus();
        await page.keyboard.press('Enter');
        assert.equal(await page.locator(`#${chapter}`).evaluate(node => node.contains(document.activeElement)), true);
        await assertNoOverflow(page);
      }
      await page.locator('.ad-dessert-visual').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => { const img = document.querySelector('.ad-dessert-image'); return img?.complete && img.naturalWidth > 0; });
      if (code === 'ESTJ-A' && [390, 1280].includes(width) && !enlarge) {
        await page.locator('#ch-02').scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(artifacts, `reading-${width}.png`) });
        await page.locator('#ch-06').scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(artifacts, `work-relationship-${width}.png`) });
      }
    }
    assert.equal(reportRequests, 1);
    assert.equal(t.errors.length, 0);
    results.push({ code, width, text200: enlarge, locked, chapters: locked ? 1 : 8, paragraphBoundaries: true, overflow: 0, pageErrors: 0 });
  } catch (error) {
    const page = t.ctx.pages()[0];
    await writeFile(path.join(artifacts, `failure-${code}-${width}-${enlarge}.json`), JSON.stringify({ code, width, enlarge, locked, message: error.message,
      photo: page ? await page.locator('.ad-dessert-visual').innerText().catch(() => '') : '',
      img: page ? await page.locator('.ad-dessert-image').getAttribute('src').catch(() => null) : null, errors: t.errors }, null, 2));
    throw error;
  } finally { await t.close(); }
}
try {
  for (const code of Object.keys(reports)) for (const width of [320, 390, 1280]) await check(code, width);
  for (const code of ['INTJ-A', 'ENFP-T', 'ESTJ-A', 'ISFP-T']) {
    await check(code, 768);
    await check(code, 320, true);
    await check(code, 1280, true);
  }
  await check('ESTJ-A', 390, false, true);
  await check('ESTJ-A', 1280, false, true);
  await writeFile(path.join(artifacts, 'results.json'), JSON.stringify({ results, realExternalWrites: 0, publicPhotoIsFixture: true }, null, 2));
  console.log(`Report reading: ${results.length} cases passed (all 32 variants / 320, 390, 1280; 768 and 200% samples; two locked cases).`);
} finally { await browser.close(); await server.close(); }
