import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getV2VariantReport } from '../../data/v2VariantReports.generated.js';
import { readV2OrderIdCookie, V2_LINE_PAY_ORDER_PATTERN } from '../../server/linePay.js';
import { getBearerToken, jsonBodySize, requestOriginMatchesHost } from '../../server/economy/requestSecurity.js';
import {
  getLinePayOrder,
  hasConfirmedLinePayOrderForUser,
} from '../../server/linePayOrderStore.js';
import { getUserAdminDb } from '../../server/supabase/user-admin.js';

const FULL_CODE_PATTERN = /^[A-Z]{4}-[AT]$/;
const MAX_BODY_BYTES = 1_024;

function readHeader(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

async function hasUserEntitlement(token: string, fullCode: string): Promise<boolean> {
  const admin = getUserAdminDb();
  if (!admin) return false;

  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return false;

  return (await hasConfirmedLinePayOrderForUser(authData.user.id, fullCode)) === true;
}

async function hasOrderEntitlement(orderId: string, fullCode: string): Promise<boolean> {
  if (!V2_LINE_PAY_ORDER_PATTERN.test(orderId)) return false;
  const order = await getLinePayOrder(orderId);
  return Boolean(
    order
    && order.status === 'confirmed'
    && order.mbti_type.toUpperCase() === fullCode,
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
  }
  if (!requestOriginMatchesHost(req)) {
    return res.status(403).json({ ok: false, code: 'FORBIDDEN_ORIGIN' });
  }
  if (jsonBodySize(req.body) > MAX_BODY_BYTES) {
    return res.status(413).json({ ok: false, code: 'BODY_TOO_LARGE' });
  }

  const fullCode = typeof req.body?.mbtiType === 'string'
    ? req.body.mbtiType.trim().toUpperCase()
    : '';
  if (!FULL_CODE_PATTERN.test(fullCode)) {
    return res.status(400).json({ ok: false, code: 'INVALID_MBTI_TYPE' });
  }

  const report = getV2VariantReport(fullCode);
  if (!report) {
    return res.status(404).json({ ok: false, code: 'REPORT_NOT_FOUND' });
  }

  const bearerToken = getBearerToken(req);
  const orderId = readV2OrderIdCookie(req.headers.cookie)
    || readHeader(req.headers['x-v2-order-id']).trim();
  const profileAuthorized = bearerToken
    ? await hasUserEntitlement(bearerToken, fullCode)
    : false;
  const orderAuthorized = profileAuthorized
    ? false
    : await hasOrderEntitlement(orderId, fullCode);
  const authorized = profileAuthorized || orderAuthorized;

  if (!authorized) {
    return res.status(403).json({ ok: false, code: 'ENTITLEMENT_REQUIRED' });
  }

  const oppositeCode = `${report.type}-${report.variant === 'A' ? 'T' : 'A'}`;
  const oppositeReport = getV2VariantReport(oppositeCode);

  return res.status(200).json({
    ok: true,
    code: 'OK',
    data: {
      report,
      oppositeReport,
    },
  });
}
