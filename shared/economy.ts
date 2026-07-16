export const ECONOMY_RESPONSE_CODES = [
  'AUTH_REQUIRED',
  'NOT_ELIGIBLE',
  'LIMIT_REACHED',
  'INSUFFICIENT_POINTS',
  'OUT_OF_STOCK',
  'EXPIRED',
  'ALREADY_PROCESSED',
  'INVALID_PROOF',
  'ROLLOUT_DISABLED',
] as const;

export type EconomyResponseCode = 'OK' | (typeof ECONOMY_RESPONSE_CODES)[number];
export type MbtiQuizVersion = 'v1-40' | 'v2-tw-40';

export interface EconomyResponse {
  ok: boolean;
  code: EconomyResponseCode;
  request_id: string;
  data: Record<string, unknown>;
}

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function isEconomyResponseCode(value: unknown): value is EconomyResponseCode {
  return value === 'OK' || ECONOMY_RESPONSE_CODES.includes(value as (typeof ECONOMY_RESPONSE_CODES)[number]);
}

export function parseEconomyResponse(
  value: unknown,
  expectedRequestId?: string,
): EconomyResponse | null {
  if (!isPlainRecord(value)) return null;
  if (typeof value.ok !== 'boolean' || !isEconomyResponseCode(value.code)) return null;
  if (typeof value.request_id !== 'string' || !UUID_PATTERN.test(value.request_id)) return null;
  if (expectedRequestId && value.request_id.toLowerCase() !== expectedRequestId.toLowerCase()) return null;
  if (value.ok !== (value.code === 'OK')) return null;

  const data = value.data == null ? {} : value.data;
  if (!isPlainRecord(data)) return null;

  return {
    ok: value.ok,
    code: value.code,
    request_id: value.request_id,
    data,
  };
}
