import crypto from 'node:crypto';
import http from 'node:http';
import { spawn } from 'node:child_process';
import {
  buildAuthorizationUrl,
  exchangeAuthorizationCode,
  loadOAuthClient,
  parseCliFlags,
  saveStoredToken,
  tokenFilePath,
} from './common.mjs';

const flags = parseCliFlags();

const findWebRedirect = (client) => {
  if (client.kind !== 'web') return null;
  return client.redirectUris.find((uri) => {
    try {
      const url = new URL(uri);
      return ['localhost', '127.0.0.1'].includes(url.hostname);
    } catch {
      return false;
    }
  });
};

const openBrowser = (url) => {
  console.log(`Open this URL if the browser does not launch automatically:\n${url}\n`);
  if (process.platform === 'darwin') {
    const child = spawn('open', [url], { detached: true, stdio: 'ignore' });
    child.unref();
  }
};

const base64Url = (buffer) =>
  buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

const createPkce = () => {
  const codeVerifier = base64Url(crypto.randomBytes(48));
  const codeChallenge = base64Url(crypto.createHash('sha256').update(codeVerifier).digest());
  return { codeVerifier, codeChallenge };
};

const main = async () => {
  const client = await loadOAuthClient();
  const webRedirect = findWebRedirect(client);
  const requestedPort = flags.port ? Number(flags.port) : undefined;
  const host = webRedirect ? new URL(webRedirect).hostname : '127.0.0.1';
  const pathName = webRedirect ? new URL(webRedirect).pathname || '/' : '/oauth2callback';
  const port = webRedirect ? Number(new URL(webRedirect).port || requestedPort || 8085) : requestedPort || 0;

  const state = crypto.randomBytes(24).toString('hex');
  const pkce = createPkce();

  const result = await new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      const requestUrl = new URL(request.url || '/', `http://${request.headers.host}`);
      if (requestUrl.pathname !== pathName && pathName !== '/') {
        response.writeHead(404);
        response.end('Not found');
        return;
      }
      if (requestUrl.searchParams.get('state') !== state) {
        response.writeHead(400);
        response.end('Invalid state');
        reject(new Error('OAuth state mismatch.'));
        server.close();
        return;
      }
      const error = requestUrl.searchParams.get('error');
      if (error) {
        response.writeHead(400);
        response.end(`Authorization failed: ${error}`);
        reject(new Error(`Authorization failed: ${error}`));
        server.close();
        return;
      }
      const code = requestUrl.searchParams.get('code');
      if (!code) {
        response.writeHead(400);
        response.end('Missing authorization code');
        reject(new Error('Missing authorization code.'));
        server.close();
        return;
      }
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end('<h1>Kiwimu Google Stack authorized</h1><p>You can close this tab.</p>');
      resolve({ code, server });
    });

    server.on('error', reject);
    server.listen(port, host, () => {
      const address = server.address();
      const redirectUri = webRedirect || `http://${host}:${address.port}${pathName}`;
      const authorizationUrl = buildAuthorizationUrl(client, redirectUri, state, pkce);
      server.redirectUri = redirectUri;
      openBrowser(authorizationUrl);
    });
  });

  const redirectUri = result.server.redirectUri;
  const token = await exchangeAuthorizationCode(client, result.code, redirectUri, pkce);
  await saveStoredToken(token);
  result.server.close();

  console.log(`Saved Google Stack OAuth token to ${tokenFilePath()}`);
  console.log('Authorized scopes: GA4 Admin, GA4 read, Search Console.');
};

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
