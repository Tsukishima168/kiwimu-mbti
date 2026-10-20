import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isV2FreePromoActive, V2_FREE_PROMO_ENDS_AT } from '../../../shared/v2Promo.js';
import { jsonBodySize, requestOriginMatchesHost } from '../../economy/requestSecurity.js';
import { hasConfirmedLinePayOrderForUser } from '../../linePayOrderStore.js';
import { getVerifiedV2User } from '../../v2Account.js';
import { hasV2PromoUnlock, insertV2PromoUnlock } from '../../v2PromoStore.js';

const STRICT_FULL_CODE_PATTERN = /^[EI][NS][TF][JP]-[AT]$/;
const SOURCE_PATTERN = /^[A-Za-z0-9_.-]{1,80}$/;
const MAX_BODY_BYTES = 1_024;

/**
 * POST /api/v2/promo-claim { mbtiType, source? }
 *
 * 限時免費解鎖。權限只綁在 Bearer token 驗證出的帳號；body 內的任何 id 都不採用。
 * 這不是付款：不寫 line_pay_orders，也不寄收據或發商家通知（不呼叫 notifyV2Payment）。
 * 已擁有權限（付費或已領）的帳號在檢查時窗前就回傳，活動結束後仍可確認既有權限。
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
  if (!requestOriginMatchesHost(req)) return res.status(403).json({ ok: false, code: 'FORBIDDEN_ORIGIN' });
  if (jsonBodySize(req.body) > MAX_BODY_BYTES) return res.status(413).json({ ok: false, code: 'BODY_TOO_LARGE' });

  const mbtiType = typeof req.body?.mbtiType === 'string' ? req.body.mbtiType.trim().toUpperCase() : '';
  if (!STRICT_FULL_CODE_PATTERN.test(mbtiType)) {
    return res.status(400).json({ ok: false, code: 'INVALID_MBTI_TYPE' });
  }
  const rawSource = typeof req.body?.source === 'string' ? req.body.source.trim() : '';
  const source = SOURCE_PATTERN.test(rawSource) ? rawSource : null;

  const identity = await getVerifiedV2User(req);
  if (!identity.user) {
    return res.status(identity.code === 'AUTH_UNAVAILABLE' ? 503 : 401).json({ ok: false, code: identity.code });
  }
  if (!identity.user.email || !identity.user.email_confirmed_at) {
    return res.status(403).json({ ok: false, code: 'VERIFIED_EMAIL_REQUIRED' });
  }
  const userId = identity.user.id;

  const paid = await hasConfirmedLinePayOrderForUser(userId, mbtiType);
  if (paid === undefined) return res.status(503).json({ ok: false, code: 'STORE_UNAVAILABLE' });
  if (paid) return res.status(200).json({ ok: true, data: { mbtiType, access: 'paid', created: false } });

  const claimed = await hasV2PromoUnlock(userId, mbtiType);
  if (claimed === undefined) return res.status(503).json({ ok: false, code: 'STORE_UNAVAILABLE' });
  if (claimed) return res.status(200).json({ ok: true, data: { mbtiType, access: 'promo', created: false } });

  // Server time only. A stale or skewed client cannot reopen the window.
  if (!isV2FreePromoActive(Date.now())) {
    return res.status(403).json({ ok: false, code: 'PROMO_ENDED', endsAt: V2_FREE_PROMO_ENDS_AT });
  }

  const inserted = await insertV2PromoUnlock({ userId, mbtiType, source });
  if (inserted.status === 'created') {
    return res.status(200).json({
      ok: true,
      data: { mbtiType, access: 'promo', created: true, claimedAt: inserted.claimedAt },
    });
  }
  if (inserted.status === 'exists') {
    return res.status(200).json({ ok: true, data: { mbtiType, access: 'promo', created: false } });
  }
  if (inserted.status === 'ended') {
    return res.status(403).json({ ok: false, code: 'PROMO_ENDED', endsAt: V2_FREE_PROMO_ENDS_AT });
  }
  return res.status(503).json({ ok: false, code: 'STORE_UNAVAILABLE' });
}
