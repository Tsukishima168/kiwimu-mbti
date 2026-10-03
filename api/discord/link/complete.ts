import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jsonBodySize, requestOriginMatchesHost } from '../../../server/economy/requestSecurity.js';
import { getVerifiedV2User } from '../../../server/v2Account.js';
import {
  getDiscordLinkState,
  logDiscordAction,
  markDiscordLinkStateUsed,
  upsertDiscordLink,
} from '../../../server/discord/discord-data.service.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requestOriginMatchesHost(req)) return res.status(403).json({ error: 'Forbidden origin', code: 'FORBIDDEN_ORIGIN' });
  if (jsonBodySize(req.body) > 1_024) return res.status(413).json({ error: 'Body too large', code: 'BODY_TOO_LARGE' });
  const identity = await getVerifiedV2User(req);
  if (!identity.user) return res.status(identity.code === 'AUTH_UNAVAILABLE' ? 503 : 401).json({ error: 'Account verification required', code: identity.code });
  const state = req.body?.state;
  if (typeof state !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(state)) return res.status(400).json({ error: 'Invalid state' });

  try {
    const linkState = await getDiscordLinkState(state);
    if (!linkState) return res.status(404).json({ error: 'State not found' });

    if (linkState.used) return res.status(409).json({ error: 'State already used' });
    if (!Number.isFinite(linkState.expiresAt) || Date.now() >= linkState.expiresAt) return res.status(410).json({ error: 'State expired' });

    // Discord's state proves the Discord side only. Supabase verifies the app
    // account; never trust legacy body appUid/firebaseUid/email/displayName.
    const appUid = identity.user.id;
    const profileName = identity.user.user_metadata?.full_name ?? identity.user.user_metadata?.name;
    const displayName = typeof profileName === 'string' ? profileName.slice(0, 200) : null;

    // Consume this one-time proof before writing. Failure after consumption is
    // conservative: the user must request a new Discord /link instead of replay.
    const consumed = await markDiscordLinkStateUsed(state, appUid);
    if (!consumed) return res.status(409).json({ error: '此連結已使用或到期，請在 Discord 重新使用 /link。', code: 'STATE_UNAVAILABLE' });
    const linked = await upsertDiscordLink({
      discordUserId: linkState.discordUserId,
      guildId: linkState.guildId,
      appUid,
      email: identity.user.email_confirmed_at ? identity.user.email ?? null : null,
      displayName,
      linkedAt: Date.now(),
    });
    if (!linked) return res.status(409).json({ error: '此 Discord 已綁定另一個網站帳號，請先在 Discord 使用 /unlink，再重新使用 /link。', code: 'DISCORD_ALREADY_LINKED' });

    await logDiscordAction({
      actionType: 'discord_link_completed',
      discordUserId: linkState.discordUserId,
      guildId: linkState.guildId,
      appUid,
    });

    return res.status(200).json({ ok: true });
  } catch {
    return res.status(503).json({ ok: false, error: '綁定資料暫時無法儲存，請在 Discord 重新使用 /link 取得新連結。', code: 'DISCORD_STORE_UNAVAILABLE' });
  }
}
