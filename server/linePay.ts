import crypto from 'node:crypto';

type LinePayMethod = 'GET' | 'POST';

export type LinePayRequestOptions = {
  method: LinePayMethod;
  apiPath: string;
  queryString?: string;
  data?: unknown;
};

export type LinePayApiResponse<T> = {
  returnCode: string;
  returnMessage: string;
  info?: T;
};

export type LinePayPaymentRequestInfo = {
  transactionId: string;
  paymentAccessToken?: string;
  paymentUrl?: {
    web?: string;
    app?: string;
  };
};

export const V2_LINE_PAY_ORDER_PATTERN = /^V2-[A-Z]{4}-[AT]-\d+-[0-9a-f]{32}$/;
export const V2_ORDER_COOKIE_NAME = '__Host-kiwimu-v2-order';
export const V2_REPORT_PRICE_TWD = 149;
export const V2_REPORT_CURRENCY = 'TWD';
const V2_ORDER_COOKIE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

function getBaseUrl() {
  return process.env.LINE_PAY_BASE_URL || 'https://sandbox-api-pay.line.me';
}

export function getLinePayConfig() {
  const channelId = process.env.LINE_PAY_CHANNEL_ID;
  const channelSecret = process.env.LINE_PAY_CHANNEL_SECRET;
  const baseUrl = getBaseUrl();
  const apiVersion = process.env.LINE_PAY_API_VERSION || 'v3';

  if (!channelId || !channelSecret) {
    throw new Error('LINE Pay is not configured');
  }

  return {
    channelId,
    channelSecret,
    baseUrl,
    apiVersion,
  };
}

function signLinePayRequest(secret: string, message: string) {
  return crypto.createHmac('sha256', secret).update(message).digest('base64');
}

export async function requestLinePay<T>({
  method,
  apiPath,
  queryString = '',
  data = null,
}: LinePayRequestOptions): Promise<LinePayApiResponse<T>> {
  const { channelId, channelSecret, baseUrl } = getLinePayConfig();
  const nonce = crypto.randomUUID();
  const body = data ? JSON.stringify(data) : '';
  const signaturePayload =
    method === 'GET'
      ? `${channelSecret}${apiPath}${queryString}${nonce}`
      : `${channelSecret}${apiPath}${body}${nonce}`;
  const signature = signLinePayRequest(channelSecret, signaturePayload);
  const url = `${baseUrl}${apiPath}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-LINE-ChannelId': channelId,
      'X-LINE-Authorization-Nonce': nonce,
      'X-LINE-Authorization': signature,
    },
    body: method === 'POST' ? body : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LINE Pay HTTP ${response.status}: ${text}`);
  }

  return (await response.json()) as LinePayApiResponse<T>;
}

export function buildLinePayApiPath(pathname: string) {
  const { apiVersion } = getLinePayConfig();
  return `/${apiVersion}${pathname}`;
}

export function buildV2LinePayOrderId(mbtiType: string) {
  const normalizedType = mbtiType.toUpperCase();
  const stamp = Date.now();
  // The order id is also the anonymous buyer's proof when loading paid content.
  // Keep 128 bits of entropy so a timestamp does not reduce it to a guessable key.
  const suffix = crypto.randomBytes(16).toString('hex');
  return `V2-${normalizedType}-${stamp}-${suffix}`;
}

export function parseMbtiTypeFromOrderId(orderId?: string | null) {
  if (!orderId) return null;
  const match = orderId.match(/^V2-([A-Z]{4}-[AT])-/);
  return match ? match[1] : null;
}

export function readV2OrderIdCookie(cookieHeader?: string | string[] | null) {
  const raw = Array.isArray(cookieHeader) ? cookieHeader.join(';') : cookieHeader || '';
  const encodedValue = raw
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${V2_ORDER_COOKIE_NAME}=`))
    ?.slice(V2_ORDER_COOKIE_NAME.length + 1);
  if (!encodedValue) return '';

  try {
    const orderId = decodeURIComponent(encodedValue);
    return V2_LINE_PAY_ORDER_PATTERN.test(orderId) ? orderId : '';
  } catch {
    return '';
  }
}

export function buildV2OrderCookie(orderId: string) {
  if (!V2_LINE_PAY_ORDER_PATTERN.test(orderId)) {
    throw new Error('Invalid V2 LINE Pay order id');
  }
  // __Host- cookies require Path=/ and no Domain attribute. The broader path is
  // the price of browser-enforced host scoping; HttpOnly keeps the proof out of JS.
  return `${V2_ORDER_COOKIE_NAME}=${encodeURIComponent(orderId)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${V2_ORDER_COOKIE_MAX_AGE_SECONDS}`;
}

export function buildAppBaseUrl(requestOrigin?: string) {
  return process.env.APP_BASE_URL || requestOrigin || 'http://localhost:5173';
}

export function isLinePaySuccessCode(returnCode: string) {
  return returnCode === '0000';
}
