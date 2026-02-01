import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminDb } from '../../../server/firebase/admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { state, firebaseUid, email, displayName } = req.body || {};
  if (!state || !firebaseUid) return res.status(400).json({ error: 'Missing state or firebaseUid' });

  const db = getAdminDb();
  const stateRef = db.collection('discord_link_states').doc(String(state));
  const snap = await stateRef.get();
  if (!snap.exists) return res.status(404).json({ error: 'State not found' });

  const data = snap.data() as any;
  if (data.used) return res.status(409).json({ error: 'State already used' });
  if (data.expiresAt && Date.now() > data.expiresAt) return res.status(410).json({ error: 'State expired' });

  const discordUserId = data.discordUserId as string;
  const guildId = (data.guildId as string) || 'global';
  const linkId = `${guildId}_${discordUserId}`;

  await db.collection('discord_links').doc(linkId).set({
    discordUserId,
    guildId: data.guildId || null,
    firebaseUid,
    email: email || null,
    displayName: displayName || null,
    linkedAt: Date.now(),
  });

  await stateRef.update({ used: true, usedAt: Date.now(), firebaseUid });

  await db.collection('discord_actions').add({
    actionType: 'discord_link_completed',
    discordUserId,
    guildId: data.guildId || null,
    firebaseUid,
    createdAt: Date.now(),
  });

  return res.status(200).json({ ok: true });
}

