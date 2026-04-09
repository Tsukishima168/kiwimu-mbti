import { getAdminDb } from '../firebase/admin';
import { getUserAdminDb } from '../supabase/user-admin';

const isLegacyFirestoreDiscordEnabled = () =>
  process.env.ENABLE_FIREBASE_LEGACY_DISCORD === 'true';

type DiscordLinkState = {
  state: string;
  discordUserId: string;
  guildId: string | null;
  expiresAt: number;
  used: boolean;
  createdAt: number;
  usedAt?: number;
  appUid?: string;
};

type DiscordLinkRecord = {
  discordUserId: string;
  guildId: string | null;
  appUid: string;
  email?: string | null;
  displayName?: string | null;
  linkedAt: number;
};

type DiscordActionRecord = {
  actionType: string;
  discordUserId?: string;
  guildId?: string | null;
  appUid?: string;
  payload?: unknown;
};

type DiscordLatestResult = {
  id: string;
  finishedAt: number;
  mbtiType: string;
  suffix?: string;
};

const buildDiscordLinkId = (guildId: string | null | undefined, discordUserId: string) =>
  `${guildId || 'global'}_${discordUserId}`;

const mapDiscordLinkStateRow = (row: Record<string, unknown>): DiscordLinkState => ({
  state: row.state as string,
  discordUserId: row.discord_user_id as string,
  guildId: (row.guild_id as string | null) ?? null,
  expiresAt: new Date(row.expires_at as string).getTime(),
  used: Boolean(row.used),
  createdAt: new Date(row.created_at as string).getTime(),
  usedAt: row.used_at ? new Date(row.used_at as string).getTime() : undefined,
  appUid: (row.app_uid as string | null) ?? undefined,
});

const mapDiscordLinkRow = (row: Record<string, unknown>): DiscordLinkRecord => ({
  discordUserId: row.discord_user_id as string,
  guildId: (row.guild_id as string | null) ?? null,
  appUid: row.app_uid as string,
  email: (row.email as string | null) ?? undefined,
  displayName: (row.display_name as string | null) ?? undefined,
  linkedAt: new Date(row.linked_at as string).getTime(),
});

const mapDiscordResultRow = (row: Record<string, unknown>): DiscordLatestResult => ({
  id: row.id as string,
  finishedAt: new Date(row.finished_at as string).getTime(),
  mbtiType:
    ((row.mbti_type as string | null) ?? (row.result_type as string | null) ?? 'UNKNOWN'),
  suffix: (row.suffix as string | null) ?? undefined,
});

async function createLinkStateInSupabase(state: DiscordLinkState): Promise<boolean> {
  const db = getUserAdminDb();
  if (!db) return false;

  const { error } = await db.from('discord_link_states').upsert({
    state: state.state,
    discord_user_id: state.discordUserId,
    guild_id: state.guildId,
    expires_at: new Date(state.expiresAt).toISOString(),
    used: state.used,
    created_at: new Date(state.createdAt).toISOString(),
  }, { onConflict: 'state' });

  if (error) {
    console.error('[discord-data] createLinkStateInSupabase error:', error.message);
    return false;
  }

  return true;
}

async function getLinkStateFromSupabase(state: string): Promise<DiscordLinkState | null> {
  const db = getUserAdminDb();
  if (!db) return null;

  const { data, error } = await db
    .from('discord_link_states')
    .select('state, discord_user_id, guild_id, expires_at, used, created_at, used_at, app_uid')
    .eq('state', state)
    .single();

  if (error || !data) {
    if (error) {
      console.error('[discord-data] getLinkStateFromSupabase error:', error.message);
    }
    return null;
  }

  return mapDiscordLinkStateRow(data as Record<string, unknown>);
}

async function markLinkStateUsedInSupabase(state: string, appUid: string): Promise<boolean> {
  const db = getUserAdminDb();
  if (!db) return false;

  const { error } = await db
    .from('discord_link_states')
    .update({
      used: true,
      used_at: new Date().toISOString(),
      app_uid: appUid,
    })
    .eq('state', state);

  if (error) {
    console.error('[discord-data] markLinkStateUsedInSupabase error:', error.message);
    return false;
  }

  return true;
}

async function upsertDiscordLinkInSupabase(record: DiscordLinkRecord): Promise<boolean> {
  const db = getUserAdminDb();
  if (!db) return false;

  const { error } = await db.from('discord_links').upsert({
    link_id: buildDiscordLinkId(record.guildId, record.discordUserId),
    discord_user_id: record.discordUserId,
    guild_id: record.guildId,
    app_uid: record.appUid,
    email: record.email ?? null,
    display_name: record.displayName ?? null,
    linked_at: new Date(record.linkedAt).toISOString(),
  }, { onConflict: 'link_id' });

  if (error) {
    console.error('[discord-data] upsertDiscordLinkInSupabase error:', error.message);
    return false;
  }

  return true;
}

async function getDiscordLinkFromSupabase(
  guildId: string | null | undefined,
  discordUserId: string
): Promise<DiscordLinkRecord | null> {
  const db = getUserAdminDb();
  if (!db) return null;

  const { data, error } = await db
    .from('discord_links')
    .select('discord_user_id, guild_id, app_uid, email, display_name, linked_at')
    .eq('link_id', buildDiscordLinkId(guildId, discordUserId))
    .single();

  if (error || !data) {
    if (error) {
      console.error('[discord-data] getDiscordLinkFromSupabase error:', error.message);
    }
    return null;
  }

  return mapDiscordLinkRow(data as Record<string, unknown>);
}

async function deleteDiscordLinkFromSupabase(
  guildId: string | null | undefined,
  discordUserId: string
): Promise<boolean> {
  const db = getUserAdminDb();
  if (!db) return false;

  const { error } = await db
    .from('discord_links')
    .delete()
    .eq('link_id', buildDiscordLinkId(guildId, discordUserId));

  if (error) {
    console.error('[discord-data] deleteDiscordLinkFromSupabase error:', error.message);
    return false;
  }

  return true;
}

async function getLatestTestRunFromSupabase(appUid: string): Promise<DiscordLatestResult | null> {
  const db = getUserAdminDb();
  if (!db) return null;

  const { data, error } = await db
    .from('test_runs')
    .select('id, finished_at, mbti_type, result_type, suffix')
    .eq('uid', appUid)
    .order('finished_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    if (error) {
      console.error('[discord-data] getLatestTestRunFromSupabase error:', error.message);
    }
    return null;
  }

  return mapDiscordResultRow(data as Record<string, unknown>);
}

async function logDiscordActionToSupabase(record: DiscordActionRecord): Promise<boolean> {
  const db = getUserAdminDb();
  if (!db) return false;

  const { error } = await db.from('discord_actions').insert({
    action_type: record.actionType,
    discord_user_id: record.discordUserId ?? null,
    guild_id: record.guildId ?? null,
    app_uid: record.appUid ?? null,
    payload: record.payload ?? null,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('[discord-data] logDiscordActionToSupabase error:', error.message);
    return false;
  }

  return true;
}

export async function createDiscordLinkState(state: DiscordLinkState): Promise<void> {
  if (await createLinkStateInSupabase(state)) {
    return;
  }
  if (!isLegacyFirestoreDiscordEnabled()) return;

  const db = getAdminDb();
  await db.collection('discord_link_states').doc(state.state).set({
    state: state.state,
    discordUserId: state.discordUserId,
    guildId: state.guildId,
    expiresAt: state.expiresAt,
    used: state.used,
    createdAt: state.createdAt,
  });
}

export async function getDiscordLinkState(state: string): Promise<DiscordLinkState | null> {
  const supabaseState = await getLinkStateFromSupabase(state);
  if (supabaseState) {
    return supabaseState;
  }
  if (!isLegacyFirestoreDiscordEnabled()) return null;

  const db = getAdminDb();
  const snap = await db.collection('discord_link_states').doc(state).get();
  if (!snap.exists) return null;

  const data = snap.data() as Record<string, unknown>;
  return {
    state,
    discordUserId: data.discordUserId as string,
    guildId: (data.guildId as string | null) ?? null,
    expiresAt: data.expiresAt as number,
    used: Boolean(data.used),
    createdAt: data.createdAt as number,
    usedAt: data.usedAt as number | undefined,
    appUid: (data.appUid as string | undefined) ?? (data.firebaseUid as string | undefined),
  };
}

export async function markDiscordLinkStateUsed(state: string, appUid: string): Promise<void> {
  if (await markLinkStateUsedInSupabase(state, appUid)) {
    return;
  }
  if (!isLegacyFirestoreDiscordEnabled()) return;

  const db = getAdminDb();
  await db.collection('discord_link_states').doc(state).update({
    used: true,
    usedAt: Date.now(),
    appUid,
    firebaseUid: appUid,
  });
}

export async function upsertDiscordLink(record: DiscordLinkRecord): Promise<void> {
  if (await upsertDiscordLinkInSupabase(record)) {
    return;
  }
  if (!isLegacyFirestoreDiscordEnabled()) return;

  const db = getAdminDb();
  await db.collection('discord_links').doc(buildDiscordLinkId(record.guildId, record.discordUserId)).set({
    discordUserId: record.discordUserId,
    guildId: record.guildId,
    appUid: record.appUid,
    firebaseUid: record.appUid,
    email: record.email ?? null,
    displayName: record.displayName ?? null,
    linkedAt: record.linkedAt,
  });
}

export async function getDiscordLink(
  guildId: string | null | undefined,
  discordUserId: string
): Promise<DiscordLinkRecord | null> {
  const supabaseLink = await getDiscordLinkFromSupabase(guildId, discordUserId);
  if (supabaseLink) {
    return supabaseLink;
  }
  if (!isLegacyFirestoreDiscordEnabled()) return null;

  const db = getAdminDb();
  const snap = await db.collection('discord_links').doc(buildDiscordLinkId(guildId, discordUserId)).get();
  if (!snap.exists) return null;

  const data = snap.data() as Record<string, unknown>;
  return {
    discordUserId,
    guildId: (data.guildId as string | null) ?? null,
    appUid: ((data.appUid as string | undefined) ?? (data.firebaseUid as string | undefined) ?? '') as string,
    email: (data.email as string | null) ?? undefined,
    displayName: (data.displayName as string | null) ?? undefined,
    linkedAt: (data.linkedAt as number | undefined) ?? Date.now(),
  };
}

export async function deleteDiscordLink(
  guildId: string | null | undefined,
  discordUserId: string
): Promise<boolean> {
  const supabaseDeleted = await deleteDiscordLinkFromSupabase(guildId, discordUserId);

  if (isLegacyFirestoreDiscordEnabled()) {
    const db = getAdminDb();
    const ref = db.collection('discord_links').doc(buildDiscordLinkId(guildId, discordUserId));
    const snap = await ref.get();
    if (snap.exists) {
      await ref.delete();
      return true;
    }
  }

  return supabaseDeleted;
}

export async function getLatestDiscordResult(appUid: string): Promise<DiscordLatestResult | null> {
  const supabaseRun = await getLatestTestRunFromSupabase(appUid);
  if (supabaseRun) {
    return supabaseRun;
  }
  if (!isLegacyFirestoreDiscordEnabled()) return null;

  const db = getAdminDb();
  const runsSnap = await db
    .collection('test_runs')
    .where('uid', '==', appUid)
    .limit(20)
    .get();

  if (runsSnap.empty) {
    return null;
  }

  const runs = runsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) })) as Array<
    Record<string, unknown> & { id: string }
  >;
  runs.sort((a, b) => ((b.finishedAt as number | undefined) ?? 0) - ((a.finishedAt as number | undefined) ?? 0));
  const latest = runs[0];

  return {
    id: latest.id as string,
    finishedAt: (latest.finishedAt as number | undefined) ?? 0,
    mbtiType:
      ((latest.mbtiType as string | undefined)
        ?? (latest.type as string | undefined)
        ?? (latest.resultType as string | undefined)
        ?? 'UNKNOWN'),
    suffix:
      ((latest.suffix as string | undefined)
        ?? (latest.variant as string | undefined)
        ?? (latest.identity as string | undefined)),
  };
}

export async function logDiscordAction(record: DiscordActionRecord): Promise<void> {
  if (await logDiscordActionToSupabase(record)) {
    return;
  }
  if (!isLegacyFirestoreDiscordEnabled()) return;

  const db = getAdminDb();
  const admin = await import('firebase-admin');
  await db.collection('discord_actions').add({
    actionType: record.actionType,
    discordUserId: record.discordUserId ?? null,
    guildId: record.guildId ?? null,
    appUid: record.appUid ?? null,
    firebaseUid: record.appUid ?? null,
    payload: record.payload ?? null,
    createdAt: Date.now(),
    createdAtServer: admin.default.firestore.FieldValue.serverTimestamp(),
  });
}
