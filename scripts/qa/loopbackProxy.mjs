import { createServer, request } from 'node:http';

// PWA tests need real service workers without Playwright's Fetch interception.
// This proxy replaces request routing and never connects to an external origin.
export async function loopbackProxy() {
  const allowed = new Set();
  const forwarded = new Set();
  const upstreams = new Set();
  const sockets = new Set();
  let denied = 0;
  let closing;
  const trackSocket = socket => {
    sockets.add(socket);
    socket.once('close', () => sockets.delete(socket));
  };
  const server = createServer((req, res) => {
    if (closing) { res.writeHead(503); res.end('QA_PROXY_CLOSING'); return; }
    let target;
    try { target = new URL(req.url); } catch { res.writeHead(400); res.end('QA_INVALID_TARGET'); return; }
    if (target.protocol !== 'http:' || target.hostname !== '127.0.0.1' || !allowed.has(target.origin) || target.username || target.password) {
      denied++;
      res.writeHead(403); res.end('QA_EXTERNAL_BLOCKED'); return;
    }
    const headers = { ...req.headers, host: target.host };
    delete headers['proxy-connection'];
    delete headers['proxy-authorization'];
    forwarded.add(target.origin);
    const upstream = request(target, { method: req.method, headers, agent: false }, response => {
      res.writeHead(response.statusCode, response.headers);
      response.on('error', () => res.destroy());
      response.pipe(res);
    });
    upstreams.add(upstream);
    upstream.once('socket', trackSocket);
    upstream.once('close', () => upstreams.delete(upstream));
    upstream.on('error', () => {
      if (res.destroyed) return;
      if (!res.headersSent) res.writeHead(502);
      res.end('QA_PROXY_ERROR');
    });
    upstream.setTimeout(10_000, () => upstream.destroy());
    req.on('aborted', () => upstream.destroy());
    res.on('close', () => { if (!res.writableEnded) upstream.destroy(); });
    req.pipe(upstream);
  });
  server.on('connection', trackSocket);
  server.on('connect', (_req, socket) => {
    denied++;
    socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    allow(origin) {
      const target = new URL(origin);
      if (target.protocol !== 'http:' || target.hostname !== '127.0.0.1' || target.pathname !== '/' || target.search || target.hash || target.username || target.password) {
        throw new Error('QA proxy only accepts loopback origins');
      }
      allowed.add(target.origin);
    },
    stats: () => ({ forwardedOrigins: [...forwarded], deniedRequests: denied }),
    close() {
      return closing ??= new Promise(resolve => {
        const waits = [new Promise(done => server.close(done))];
        for (const upstream of upstreams) {
          waits.push(new Promise(done => upstream.once('close', done)));
          upstream.destroy();
        }
        for (const socket of sockets) {
          waits.push(new Promise(done => socket.once('close', done)));
          socket.destroy();
        }
        void Promise.all(waits).then(resolve);
      });
    },
  };
}
