import { getUserAdminDb } from '../supabase/user-admin';

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

export async function createDiscordLinkState(state: DiscordLinkState): Promise<void> {
  const db = getUserAdminDb();
  if (!db) return;

  const { error } = await db.from('discord_link_states').upsert({
    state: state.state,
    discord_user_id: state.discordUserId,
    guild_id: state.guildId,
    expires_at: new Date(state.expiresAt).toISOString(),
    used: state.used,
    created_at: new Date(state.createdAt).toISOString(),
  }, { onConflict: 'state' });

  if (error) {
    console.error('[discord-data] createDiscordLinkState error:', error.message);
  }
}

export async function getDiscordLinkState(state: string): Promise<DiscordLinkState | null> {
  const db = getUserAdminDb();
  if (!db) return null;

  const { data, error } = await db
    .from('discord_link_states')
    .select('state, discord_user_id, guild_id, expires_at, used, created_at, used_at, app_uid')
    .eq('state', state)
    .single();

  if (error || !data) {
    if (error) console.error('[discord-data] getDiscordLinkState error:', error.message);
    return null;
  }

  return mapDiscordLinkStateRow(data as Record<string, unknown>);
}

export async function markDiscordLinkStateUsed(state: string, appUid: string): Promise<void> {
  const db = getUserAdminDb();
  if (!db) return;

  const { error } = await db
    .from('discord_link_states')
    .update({
      used: true,
      used_at: new Date().toISOString(),
      app_uid: appUid,
    })
    .eq('state', state);

  if (error) {
    console.error('[discord-data] markDiscordLinkStateUsed error:', error.message);
  }
}

export async function upsertDiscordLink(record: DiscordLinkRecord): Promise<void> {
  const db = getUserAdminDb();
  if (!db) return;

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
    console.error('[discord-data] upsertDiscordLink error:', error.message);
  }
}

export async function getDiscordLink(
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
    if (error) console.error('[discord-data] getDiscordLink error:', error.message);
    return null;
  }

  return mapDiscordLinkRow(data as Record<string, unknown>);
}

export async function deleteDiscordLink(
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
    console.error('[discord-data] deleteDiscordLink error:', error.message);
    return false;
  }

  return true;
}

export async function getLatestDiscordResult(appUid: string): Promise<DiscordLatestResult | null> {
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
    if (error) console.error('[discord-data] getLatestDiscordResult error:', error.message);
    return null;
  }

  return mapDiscordResultRow(data as Record<string, unknown>);
}

export async function logDiscordAction(record: DiscordActionRecord): Promise<void> {
  const db = getUserAdminDb();
  if (!db) return;

  const { error } = await db.from('discord_actions').insert({
    action_type: record.actionType,
    discord_user_id: record.discordUserId ?? null,
    guild_id: record.guildId ?? null,
    app_uid: record.appUid ?? null,
    payload: record.payload ?? null,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('[discord-data] logDiscordAction error:', error.message);
  }
}
