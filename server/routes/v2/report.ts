import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthRetryableFetchError } from '@supabase/supabase-js';
import { getV2VariantReport } from '../../../data/v2VariantReports.generated.js';
import { readV2OrderIdCookie, V2_LINE_PAY_ORDER_PATTERN } from '../../linePay.js';
import { getBearerToken, jsonBodySize, requestOriginMatchesHost } from '../../economy/requestSecurity.js';
import {
  getLinePayOrder,
  hasConfirmedLinePayOrderForUser,
} from '../../linePayOrderStore.js';
import { getUserAdminDb } from '../../supabase/user-admin.js';
import { hasV2PromoUnlock } from '../../v2PromoStore.js';

const FULL_CODE_PATTERN = /^[A-Z]{4}-[AT]$/;
const MAX_BODY_BYTES = 1_024;

function readHeader(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

type TokenUser = { id: string; is_anonymous?: boolean };

// undefined = auth or store unavailable; null = no valid account for this token.
async function resolveTokenUser(token: string): Promise<TokenUser | null | undefined> {
  const admin = getUserAdminDb();
  if (!admin) return undefined;

  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (isAuthRetryableFetchError(authError) || (authError?.status && authError.status >= 500)) return undefined;
  if (authError || !authData.user) return null;
  return authData.user as TokenUser;
}

async function hasUserEntitlement(user: TokenUser | null, fullCode: string): Promise<boolean | undefined> {
  if (!user) return false;
  return hasConfirmedLinePayOrderForUser(user.id, fullCode);
}

// Promo grants never expire with the window: claiming is time-limited, reading is not.
// Only a stored row grants access; there is no time-based or client-side shortcut.
async function hasPromoEntitlement(user: TokenUser | null, fullCode: string): Promise<boolean | undefined> {
  if (!user || user.is_anonymous) return false;
  return hasV2PromoUnlock(user.id, fullCode);
}

async function hasOrderEntitlement(orderId: string, fullCode: string): Promise<boolean | undefined> {
  if (!V2_LINE_PAY_ORDER_PATTERN.test(orderId)) return false;
  const order = await getLinePayOrder(orderId);
  if (order === undefined) return undefined;
  return Boolean(
    order
    && order.status === 'confirmed'
    // Once saved to an account, the order is read through that account only.
    // Anonymous legacy purchases retain their original browser proof access.
    && order.user_uid == null
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
  const tokenUser = bearerToken ? await resolveTokenUser(bearerToken) : null;
  if (tokenUser === undefined) {
    return res.status(503).json({ ok: false, code: 'STORE_UNAVAILABLE' });
  }
  const profileAuthorized = await hasUserEntitlement(tokenUser, fullCode);
  if (profileAuthorized === undefined) {
    return res.status(503).json({ ok: false, code: 'STORE_UNAVAILABLE' });
  }
  const orderAuthorized = profileAuthorized
    ? false
    : await hasOrderEntitlement(orderId, fullCode);
  if (orderAuthorized === undefined) {
    return res.status(503).json({ ok: false, code: 'STORE_UNAVAILABLE' });
  }
  // Paid access (account or order proof) is decided first and unchanged; the promo
  // table is consulted only when neither paid path grants the report.
  const promoAuthorized = profileAuthorized || orderAuthorized
    ? false
    : await hasPromoEntitlement(tokenUser, fullCode);
  if (promoAuthorized === undefined) {
    return res.status(503).json({ ok: false, code: 'STORE_UNAVAILABLE' });
  }
  const authorized = profileAuthorized || orderAuthorized || promoAuthorized;

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
      // Present only for promo grants, so paid responses keep their exact shape.
      ...(promoAuthorized ? { access: 'promo' as const } : {}),
    },
  });
}
