import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { root, localServer, launch, context, startQuiz, text200, assertNoOverflow } from './browserHarness.mjs';

const directory = path.join(root, '.qa-results/accessibility');
await mkdir(directory, { recursive: true });
const server = await localServer(process.env.QA_DIST || path.join(root, 'dist'), true);
const browser = await launch();
const results = [];
try {
  for (const width of [320, 390, 768, 1280]) {
    for (const version of ['v1', 'v1_5', 'v2']) {
      const t = await context(browser, server.url, { viewport: { width, height: 844 } });
      try {
        const page = await t.ctx.newPage();
        await startQuiz(page, server.url, version);
        await text200(page);
        await assertNoOverflow(page);
        const button = page.locator(version === 'v1' ? '.classic-quiz-option' : version === 'v1_5' ? '.explore-quiz button' : '.ad-option').first();
        // Focus via Tab from the programmatically focused question heading.
        await page.keyboard.press('Tab');
        assert.equal(await button.evaluate(e => e === document.activeElement), true);
        const before = await page.locator('h2').first().innerText();
        await page.keyboard.press('Enter');
        await page.waitForFunction(old => document.querySelector('h2')?.textContent.trim() !== old.trim(), before);
        assert.equal(await page.locator('h2').first().evaluate(e => e === document.activeElement), true);
        assert.equal(t.errors.length, 0);
        results.push({ width, version, textEnlargement: '200% CSS text only', keyboardAnswer: true, nextHeadingFocused: true, overflow: 0 });
        await page.screenshot({ path: path.join(directory, `${version}-${width}-text200.png`), fullPage: true });
      } finally { await t.close(); }
    }
    const t = await context(browser, server.url, { viewport: { width, height: 844 } });
    try {
      const page = await t.ctx.newPage();
      await page.goto(server.url + '/read/ESTJ-A'); await page.locator('#ch-08').waitFor();
      await text200(page); await assertNoOverflow(page);
      if (width <= 900) {
        const summary = page.locator('.ad-mobile-contents summary');
        await summary.focus(); await page.keyboard.press('Enter');
        await page.locator('.ad-mobile-contents nav button').last().focus(); await page.keyboard.press('Enter');
        assert.equal(await page.locator('.ad-mobile-contents').getAttribute('open'), null);
      } else {
        await page.locator('.ad-chapternav button').last().focus(); await page.keyboard.press('Enter');
      }
      assert.equal(await page.locator('#ch-08').evaluate(e => e.contains(document.activeElement)), true);
      await page.keyboard.press('Tab');
      assert.equal(await page.locator('.ad-mobile-contents').evaluate(e => e.contains(document.activeElement)), false);
      assert.equal(t.errors.length, 0);
      results.push({ width, version: 'report', textEnlargement: '200% CSS text only', chapterFocus: true, overflow: 0 });
      await page.screenshot({ path: path.join(directory, `report-${width}-text200.png`), fullPage: true });
    } finally { await t.close(); }
  }
  await writeFile(path.join(directory, 'results.json'), JSON.stringify({ results, mocks: server.effects, realExternalWrites: 0 }, null, 2));
  console.log(`Accessibility: ${results.length} cases passed; artifacts: ${directory}`);
} finally { await browser.close(); await server.close(); }
