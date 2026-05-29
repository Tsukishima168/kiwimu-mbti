import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const rootDir = path.resolve(__dirname, '..', '..');

export const DEFAULT_CLIENT_ID_FILE = path.join(
  os.homedir(),
  '.credentials',
  'kiwimu-oauth-desktop-client.json',
);

export const DEFAULT_TOKEN_FILE = path.join(
  os.homedir(),
  '.config',
  'kiwimu',
  'google-stack-token.json',
);

const FALLBACK_CLIENT_ID_FILE = path.join(
  os.homedir(),
  '.credentials',
  'search-console-client-secret.json',
);

let didWarnFallbackClient = false;

export const GOOGLE_STACK_SCOPES = [
  'https://www.googleapis.com/auth/analytics.edit',
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters',
];

export class GoogleApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'GoogleApiError';
    this.status = details.status;
    this.url = details.url;
    this.body = details.body;
  }
}

export const resolveFromRoot = (filePath) => {
  if (path.isAbsolute(filePath)) return filePath;
  return path.join(rootDir, filePath);
};

export const readJsonFile = async (filePath) => {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
};

export const writeJsonFile = async (filePath, value, mode = 0o600) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', mode });
  await fs.chmod(filePath, mode);
};

export const loadConfig = async () => {
  const configPath = resolveFromRoot(process.env.GOOGLE_STACK_CONFIG || 'google-stack.config.json');
  const config = await readJsonFile(configPath);
  const required = [
    'cloudProjectId',
    'ga4PropertyId',
    'ga4MeasurementId',
    'searchConsoleSiteUrl',
    'sitemapUrl',
  ];
  const missing = required.filter((key) => !config[key]);
  if (missing.length) {
    throw new Error(`Missing google-stack config field(s): ${missing.join(', ')}`);
  }
  const sites = Array.isArray(config.sites) && config.sites.length
    ? config.sites
    : [
        {
          id: 'kiwimu',
          name: 'Kiwimu MBTI Lab',
          baseUrl: 'https://kiwimu.com',
          sitemapUrl: config.sitemapUrl,
          contentUrlPrefix: config.answerUrlPrefix,
        },
      ];
  return { ...config, sites, configPath };
};

export const loadOAuthClient = async () => {
  const requestedPath = process.env.GOOGLE_STACK_CLIENT_ID_FILE || DEFAULT_CLIENT_ID_FILE;
  let clientPath = requestedPath;
  try {
    await fs.access(clientPath);
  } catch (error) {
    if (process.env.GOOGLE_STACK_CLIENT_ID_FILE || error.code !== 'ENOENT') throw error;
    await fs.access(FALLBACK_CLIENT_ID_FILE);
    clientPath = FALLBACK_CLIENT_ID_FILE;
    if (!didWarnFallbackClient) {
      console.warn(`OAuth client not found at ${requestedPath}; using fallback ${clientPath}`);
      didWarnFallbackClient = true;
    }
  }
  const raw = await readJsonFile(clientPath);
  const kind = raw.installed ? 'installed' : raw.web ? 'web' : null;
  const client = kind ? raw[kind] : raw;
  if (!client?.client_id || !client?.token_uri) {
    throw new Error(
      `Invalid OAuth client file at ${clientPath}. Expected a Google OAuth client JSON with client_id and token_uri.`,
    );
  }
  return {
    clientPath,
    kind: kind || 'unknown',
    clientId: client.client_id,
    clientSecret: client.client_secret,
    authUri: client.auth_uri || 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUri: client.token_uri || 'https://oauth2.googleapis.com/token',
    redirectUris: client.redirect_uris || [],
  };
};

export const tokenFilePath = () => process.env.GOOGLE_STACK_TOKEN_FILE || DEFAULT_TOKEN_FILE;

export const loadStoredToken = async () => {
  try {
    return await readJsonFile(tokenFilePath());
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
};

export const saveStoredToken = async (token) => {
  await writeJsonFile(tokenFilePath(), token, 0o600);
};

const requestToken = async (client, params) => {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) body.set(key, value);
  }
  body.set('client_id', client.clientId);
  if (client.clientSecret) body.set('client_secret', client.clientSecret);

  const response = await fetch(client.tokenUri, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new GoogleApiError(`OAuth token request failed: ${json.error || response.statusText}`, {
      status: response.status,
      url: client.tokenUri,
      body: json,
    });
  }
  return json;
};

export const buildAuthorizationUrl = (client, redirectUri, state, pkce = {}) => {
  const url = new URL(client.authUri);
  url.searchParams.set('client_id', client.clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', GOOGLE_STACK_SCOPES.join(' '));
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('state', state);
  if (pkce.codeChallenge) {
    url.searchParams.set('code_challenge', pkce.codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
  }
  return url.toString();
};

export const exchangeAuthorizationCode = async (client, code, redirectUri, pkce = {}) => {
  const token = await requestToken(client, {
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: pkce.codeVerifier,
  });
  return normalizeToken(token);
};

const normalizeToken = (token, previousToken = {}) => ({
  access_token: token.access_token || previousToken.access_token,
  refresh_token: token.refresh_token || previousToken.refresh_token,
  scope: token.scope || previousToken.scope,
  token_type: token.token_type || previousToken.token_type || 'Bearer',
  expiry_date: token.expires_in ? Date.now() + Number(token.expires_in) * 1000 : previousToken.expiry_date,
});

export const refreshStoredToken = async (client, previousToken) => {
  if (!previousToken?.refresh_token) {
    throw new Error(`No refresh token found. Run npm run google-stack:auth first.`);
  }
  const token = await requestToken(client, {
    grant_type: 'refresh_token',
    refresh_token: previousToken.refresh_token,
  });
  const nextToken = normalizeToken(token, previousToken);
  await saveStoredToken(nextToken);
  return nextToken;
};

export const getAccessToken = async () => {
  const client = await loadOAuthClient();
  const storedToken = await loadStoredToken();
  if (!storedToken?.access_token && !storedToken?.refresh_token) {
    throw new Error(`No Google Stack token found. Run npm run google-stack:auth first.`);
  }
  const expiresSoon = !storedToken.expiry_date || Number(storedToken.expiry_date) < Date.now() + 60_000;
  const token = expiresSoon ? await refreshStoredToken(client, storedToken) : storedToken;
  return token.access_token;
};

export const googleApiJson = async (url, options = {}) => {
  const accessToken = await getAccessToken();
  const headers = {
    authorization: `Bearer ${accessToken}`,
    accept: 'application/json',
    ...(options.headers || {}),
  };
  let body = options.body;
  if (body && typeof body !== 'string') {
    body = JSON.stringify(body);
    headers['content-type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers, body });
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new GoogleApiError(`Google API request failed: ${response.status} ${response.statusText}`, {
      status: response.status,
      url,
      body: json,
    });
  }
  return json;
};

export const googleApiText = async (url, options = {}) => {
  const accessToken = await getAccessToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      authorization: `Bearer ${accessToken}`,
      accept: 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new GoogleApiError(`Google API request failed: ${response.status} ${response.statusText}`, {
      status: response.status,
      url,
      body: text,
    });
  }
  return text;
};

export const encodePathSegment = (value) => encodeURIComponent(value);

export const adminBase = 'https://analyticsadmin.googleapis.com/v1beta';
export const dataBase = 'https://analyticsdata.googleapis.com/v1beta';
export const searchConsoleBase = 'https://www.googleapis.com/webmasters/v3';

export const listAll = async (firstUrl, collectionKey) => {
  const items = [];
  let url = firstUrl;
  while (url) {
    const json = await googleApiJson(url);
    items.push(...(json?.[collectionKey] || []));
    if (!json?.nextPageToken) break;
    const next = new URL(firstUrl);
    next.searchParams.set('pageToken', json.nextPageToken);
    url = next.toString();
  }
  return items;
};

export const getDateDaysAgo = (daysAgo) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
};

export const parseCliFlags = (argv = process.argv.slice(2)) => {
  const flags = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) continue;
    const [rawKey, inlineValue] = arg.slice(2).split('=');
    if (inlineValue !== undefined) {
      flags[rawKey] = inlineValue;
    } else if (argv[index + 1] && !argv[index + 1].startsWith('--')) {
      flags[rawKey] = argv[index + 1];
      index += 1;
    } else {
      flags[rawKey] = true;
    }
  }
  return flags;
};

export const printGoogleError = (error) => {
  if (!(error instanceof GoogleApiError)) {
    console.error(error.message || error);
    return;
  }
  const reason = error.body?.error?.message || error.body?.error || error.body || error.message;
  console.error(`${error.message}`);
  if (error.url) console.error(`URL: ${error.url}`);
  if (reason) console.error(`Reason: ${typeof reason === 'string' ? reason : JSON.stringify(reason)}`);
  if (error.status === 401) {
    console.error('Fix: run npm run google-stack:auth and authorize the Google account again.');
  }
  if (error.status === 403) {
    console.error(
      'Fix: confirm the OAuth client has GA4/Search Console scopes and the signed-in account has Editor access to GA4 and owner/full access to Search Console.',
    );
  }
  if (error.status === 404) {
    console.error('Fix: confirm google-stack.config.json points at the correct GA4 property and Search Console site.');
  }
};
