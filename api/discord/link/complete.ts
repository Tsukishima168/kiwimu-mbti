import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getDiscordLinkState,
  logDiscordAction,
  markDiscordLinkStateUsed,
  upsertDiscordLink,
} from '../../../server/discord/discord-data.service.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // firebaseUid: legacy field sent by older discord-bot versions; appUid is preferred
  const { state, appUid, firebaseUid, email, displayName } = req.body || {};
  const resolvedAppUid = appUid || firebaseUid;
  if (!state || !resolvedAppUid) return res.status(400).json({ error: 'Missing state or appUid' });

  const linkState = await getDiscordLinkState(String(state));
  if (!linkState) return res.status(404).json({ error: 'State not found' });

  if (linkState.used) return res.status(409).json({ error: 'State already used' });
  if (linkState.expiresAt && Date.now() > linkState.expiresAt) return res.status(410).json({ error: 'State expired' });

  await upsertDiscordLink({
    discordUserId: linkState.discordUserId,
    guildId: linkState.guildId,
    appUid: resolvedAppUid,
    email: email || null,
    displayName: displayName || null,
    linkedAt: Date.now(),
  });

  await markDiscordLinkStateUsed(String(state), resolvedAppUid);

  await logDiscordAction({
    actionType: 'discord_link_completed',
    discordUserId: linkState.discordUserId,
    guildId: linkState.guildId,
    appUid: resolvedAppUid,
  });

  return res.status(200).json({ ok: true });
}
