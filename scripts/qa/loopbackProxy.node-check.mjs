import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import { connect } from 'node:net';
import { once } from 'node:events';
import test from 'node:test';
import { loopbackProxy } from './loopbackProxy.mjs';

async function fixture(t, handler) {
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}
async function protectedProxy(t) {
  const proxy = await loopbackProxy();
  t.after(() => proxy.close());
  return proxy;
}
function through(proxy, target, { method = 'GET', headers = {}, body, onData } = {}) {
  return new Promise((resolve, reject) => {
    // The TCP destination is always the loopback proxy, even for denied targets.
    const req = request(proxy.url, { path: target, method, headers, agent: false }, res => {
      const chunks = [];
      res.on('data', data => { chunks.push(data); onData?.(data); });
      res.on('error', reject);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject);
    req.end(body);
  });
}

test('registered loopback forwards method/body, replaces Host and strips proxy credentials', { timeout: 5_000 }, async t => {
  const calls = [];
  const local = await fixture(t, (req, res) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      calls.push({ method: req.method, host: req.headers.host, proxyAuth: req.headers['proxy-authorization'], body: Buffer.concat(chunks).toString() });
      res.end('QA_LOCAL_ONLY');
    });
  });
  const proxy = await protectedProxy(t);
  proxy.allow(local.url);
  assert.equal((await through(proxy, local.url + '/fixture')).body, 'QA_LOCAL_ONLY');
  assert.equal((await through(proxy, local.url + '/fixture', {
    method: 'POST', headers: { Host: 'qa.invalid', 'Proxy-Authorization': 'qa-synthetic' }, body: 'synthetic-fixture',
  })).status, 200);
  assert.deepEqual(calls, [
    { method: 'GET', host: new URL(local.url).host, proxyAuth: undefined, body: '' },
    { method: 'POST', host: new URL(local.url).host, proxyAuth: undefined, body: 'synthetic-fixture' },
  ]);
  assert.deepEqual(proxy.stats().forwardedOrigins, [local.url]);
});

test('unregistered loopback, remote origins, HTTPS and URL credentials are denied without forwarding', { timeout: 5_000 }, async t => {
  let hits = 0;
  const sentinel = await fixture(t, (_req, res) => { hits++; res.end('unexpected'); });
  const proxy = await protectedProxy(t);
  // Register a different origin so denial is not merely caused by an empty set.
  const allowed = await fixture(t, (_req, res) => res.end('allowed'));
  proxy.allow(allowed.url);
  const targets = [sentinel.url + '/fixture', 'http://203.0.113.1/fixture', 'http://qa.invalid/fixture',
    allowed.url.replace('http:', 'https:'), allowed.url.replace('http://', 'http://qa:synthetic@')];
  for (const target of targets) {
    const response = await through(proxy, target);
    assert.equal(response.status, 403);
    assert.equal(response.body, 'QA_EXTERNAL_BLOCKED');
  }
  assert.equal(hits, 0);
  assert.deepEqual(proxy.stats(), { forwardedOrigins: [], deniedRequests: targets.length });
});

test('allow cannot expand the boundary to credentials, paths, query, fragment or other hosts/protocols', { timeout: 5_000 }, async t => {
  const proxy = await protectedProxy(t);
  for (const origin of ['https://127.0.0.1:1234', 'http://localhost:1234', 'http://127.0.0.2:1234',
    'http://127.0.0.1:1234/path', 'http://127.0.0.1:1234?query=1', 'http://127.0.0.1:1234#hash',
    'http://qa:synthetic@127.0.0.1:1234']) {
    assert.throws(() => proxy.allow(origin), /only accepts loopback origins/);
  }
});

test('HTTPS CONNECT is refused locally without creating a tunnel', { timeout: 5_000 }, async t => {
  const proxy = await protectedProxy(t);
  const address = new URL(proxy.url);
  const socket = connect({ host: address.hostname, port: Number(address.port) });
  t.after(() => socket.destroy());
  const chunks = [];
  socket.on('data', data => chunks.push(data));
  const end = once(socket, 'end');
  await once(socket, 'connect');
  socket.write('CONNECT 203.0.113.1:443 HTTP/1.1\r\nHost: 203.0.113.1:443\r\n\r\n');
  await end;
  assert.match(Buffer.concat(chunks).toString(), /^HTTP\/1\.1 403 Forbidden/);
  assert.deepEqual(proxy.stats(), { forwardedOrigins: [], deniedRequests: 1 });
});

test('proxy returns redirects without following them and rejects an unregistered redirect target', { timeout: 5_000 }, async t => {
  let redirectedHits = 0;
  const destination = await fixture(t, (_req, res) => { redirectedHits++; res.end('unexpected'); });
  let sourceHits = 0;
  const source = await fixture(t, (_req, res) => { sourceHits++; res.writeHead(302, { Location: destination.url + '/fixture' }); res.end(); });
  const proxy = await protectedProxy(t);
  proxy.allow(source.url);
  const response = await through(proxy, source.url + '/redirect');
  assert.equal(response.status, 302);
  assert.equal(sourceHits, 1);
  assert.equal(redirectedHits, 0);
  assert.equal((await through(proxy, response.headers.location)).status, 403);
  assert.equal(redirectedHits, 0);
});

test('close destroys a partially received upstream, resolves its sockets and is idempotent', { timeout: 5_000 }, async t => {
  let upstreamSocket;
  let receivedPartial;
  const partial = new Promise(resolve => { receivedPartial = resolve; });
  const source = await fixture(t, (req, res) => { upstreamSocket = req.socket; res.write('partial'); });
  const proxy = await protectedProxy(t);
  proxy.allow(source.url);
  // Attach rejection handling immediately: closing must terminate the pending GET.
  const pending = through(proxy, source.url + '/slow', { onData: receivedPartial }).then(() => 'ended', () => 'aborted');
  await partial;
  const upstreamClosed = once(upstreamSocket, 'close');
  const closed = proxy.close();
  assert.equal(proxy.close(), closed);
  await closed;
  await upstreamClosed;
  assert.equal(upstreamSocket.destroyed, true);
  assert.equal(await pending, 'aborted');
});
