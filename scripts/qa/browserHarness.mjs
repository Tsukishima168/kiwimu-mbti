import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { chromium } from 'playwright';

export const root = path.resolve(import.meta.dirname, '../..');
const exported = {};
vm.runInNewContext(ts.transpileModule(await readFile(path.join(root, 'data/v2VariantReports.generated.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: exported });
const reports = exported.V2_VARIANT_REPORTS;
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
export async function localServer(initialRoot, fullReport = false) {
  let currentRoot = path.resolve(initialRoot);
  const roots = new Set([currentRoot]);
  const effects = { mockedNotifications: 0, rejectedMutations: 0 };
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      res.setHeader('Cache-Control', 'no-store');
      // The server itself blocks APIs, including service-worker requests.
      // No proxy, credentials, cloud writes or real notification handlers exist here.
      if (url.pathname.startsWith('/api/')) {
        res.setHeader('Content-Type', 'application/json');
        if (url.pathname === '/api/notify-discord') {
          effects.mockedNotifications++;
          res.end('{"ok":true}'); return;
        }
        if (url.pathname === '/api/v2/report' && fullReport) {
          res.end(JSON.stringify({ ok: true, data: { report: reports['ESTJ-A'], oppositeReport: reports['ESTJ-T'] } })); return;
        }
        if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) effects.rejectedMutations++;
        res.statusCode = 503; res.end('{"ok":false,"code":"QA_MOCK_ONLY"}'); return;
      }
      if (!['GET', 'HEAD'].includes(req.method)) { effects.rejectedMutations++; res.statusCode = 405; res.end(); return; }
      const pathname = decodeURIComponent(url.pathname);
      let file;
      for (const directory of [currentRoot, ...roots]) {
        const candidate = path.resolve(directory, `.${pathname}`);
        if (!candidate.startsWith(directory + path.sep)) continue;
        try { if ((await stat(candidate)).isFile()) { file = candidate; break; } } catch { /* Try retained old assets. */ }
      }
      if (!file && !path.extname(pathname)) file = path.join(currentRoot, 'index.html');
      if (!file) { res.statusCode = 404; res.end(); return; }
      res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      res.end(req.method === 'HEAD' ? undefined : await readFile(file));
    } catch { res.statusCode = 500; res.end('QA_SERVER_ERROR'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { url: `http://127.0.0.1:${server.address().port}`, effects,
    switchRoot(directory) { currentRoot = path.resolve(directory); roots.add(currentRoot); },
    close: () => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }),
  };
}
export async function launch() {
  return chromium.launch({ headless: true,
    ...(process.env.QA_BROWSER_EXECUTABLE ? { executablePath: process.env.QA_BROWSER_EXECUTABLE } : {}),
    args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'],
  });
}
export async function context(browser, url, options = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block', ...options });
  const errors = [];
  ctx.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  await ctx.route('**/*', route => new URL(route.request().url()).origin === url ? route.continue() : route.abort());
  return { ctx, errors, close: async () => { await ctx.unrouteAll({ behavior: 'ignoreErrors' }); await ctx.close(); } };
}
export async function startQuiz(page, url, version) {
  await page.goto(url + (version === 'v1' ? '/' : version === 'v1_5' ? '/explore?v=a' : '/read/quiz'));
  if (version === 'v1') {
    await page.getByRole('button', { name: /V1｜經典/ }).click();
    await page.getByRole('button', { name: /我準備好了/ }).click();
  } else await page.getByRole('button', { name: version === 'v1_5' ? /開始打發/ : /開始 40 題探索/ }).click();
  await page.locator(version === 'v1' ? '.classic-quiz h2' : version === 'v1_5' ? '.explore-quiz h2' : '.ad-question-text').waitFor();
}
export async function text200(page) {
  await page.evaluate(() => {
    const items = [...document.querySelectorAll('body, body *')].map(element => [element, parseFloat(getComputedStyle(element).fontSize)]);
    items.forEach(([element, size]) => { if (Number.isFinite(size)) element.style.setProperty('font-size', `${size * 2}px`, 'important'); });
  });
}
export async function assertNoOverflow(page) {
  const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - innerWidth));
  assert.equal(overflow, 0, `Horizontal overflow at ${page.url()}: ${overflow}px`);
}
