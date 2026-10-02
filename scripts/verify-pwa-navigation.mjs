import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Exercise Workbox's real route matcher using the options in the built worker.
// Cache installation is stubbed because this check does not run in a browser.
process.env.NODE_ENV = 'production';
globalThis.self = globalThis;
const { NavigationRoute } = await import('workbox-routing/NavigationRoute.js');
let navigationRoute;
const workbox = {
  NavigationRoute,
  createHandlerBoundToURL: () => () => Promise.resolve(new Response('app shell')),
  registerRoute(route) {
    if (route instanceof NavigationRoute) navigationRoute = route;
  },
  precacheAndRoute() {},
  cleanupOutdatedCaches() {},
  clientsClaim() {},
  CacheFirst: class {},
  CacheableResponsePlugin: class {},
  ExpirationPlugin: class {},
};
const workerContext = {
  define: (_dependencies, factory) => factory(workbox),
  addEventListener() {},
  skipWaiting() {},
};
workerContext.self = workerContext;
vm.runInNewContext(
  readFileSync(new URL('../dist/sw.js', import.meta.url), 'utf8'),
  workerContext,
);
assert.ok(navigationRoute, 'Built worker must retain the offline app shell');

const cases = [
  ['/api', false],
  ['/api?probe=1', false],
  ['/api/linepay/confirm?mbtiType=ESTJ-A&orderId=test&transactionId=test', false],
  ['/api/linepay/cancel?mbtiType=ESTJ-A&orderId=test', false],
  ['/api/v2/report', false],
  ['/api/discord/callback?code=test', false],
  ['/', true],
  ['/quiz', true],
  ['/explore', true],
  ['/read/ESTJ-A?unlock=success', true],
  ['/answers', true],
  ['/apiary', true],
];
for (const [pathname, expected] of cases) {
  const handled = navigationRoute.match({
    request: { mode: 'navigate' },
    url: new URL(pathname, 'https://example.test'),
  });
  assert.equal(handled, expected, `${pathname}: unexpected app-shell interception`);
}
console.log(`PWA navigation regression: ${cases.length} cases passed`);
