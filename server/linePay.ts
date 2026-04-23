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
  const suffix = crypto.randomBytes(4).toString('hex');
  return `V2-${normalizedType}-${stamp}-${suffix}`;
}

export function parseMbtiTypeFromOrderId(orderId?: string | null) {
  if (!orderId) return null;
  const match = orderId.match(/^V2-([A-Z]{4}-[AT])-/);
  return match ? match[1] : null;
}

export function buildAppBaseUrl(requestOrigin?: string) {
  return process.env.APP_BASE_URL || requestOrigin || 'http://localhost:5173';
}

export function isLinePaySuccessCode(returnCode: string) {
  return returnCode === '0000';
}
