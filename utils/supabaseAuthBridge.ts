/**
 * Shared Supabase auth client for kiwimu.com.
 *
 * This is now the primary auth path for the MBTI frontend and persists the
 * session in a .kiwimu.com cookie so sibling subdomains can read the same user.
 */

import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import type { AppUser } from '../types';

// @ts-ignore - Vite env variables
const SUPABASE_URL = (import.meta.env.VITE_MOON_ISLAND_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_USER_URL) as string;
// @ts-ignore - Vite env variables
const SUPABASE_ANON_KEY = (import.meta.env.VITE_MOON_ISLAND_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_USER_ANON_KEY) as string;

const COOKIE_DOMAIN = '.kiwimu.com';

// ── Cookie helpers ────────────────────────────────────────────────────────────

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, maxAgeSec = 60 * 60 * 24 * 365) {
  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    `domain=${COOKIE_DOMAIN}`,
    `path=/`,
    `max-age=${maxAgeSec}`,
    'SameSite=Lax',
  ].join('; ');
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; domain=${COOKIE_DOMAIN}; path=/; max-age=0`;
}

// ── Auth Supabase Client（單例，cookie storage）────────────────────────────

let _authClient: SupabaseClient | null = null;

export function getAuthSupabaseClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase auth credentials not found.');
    return null;
  }
  if (_authClient) return _authClient;

  _authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      storage: {
        getItem: (key) => getCookie(key),
        setItem: (key, value) => setCookie(key, value),
        removeItem: (key) => deleteCookie(key),
      },
    },
  });

  return _authClient;
}

// ── Supabase User → AppUser adapter ──────────────────────────────────────────

export function toAppUser(u: SupabaseUser): AppUser {
  const provider = u.app_metadata?.provider ?? 'google.com';
  return {
    uid: u.id,
    email: u.email ?? null,
    displayName:
      u.user_metadata?.full_name ??
      u.user_metadata?.name ??
      u.user_metadata?.user_name ??
      null,
    photoURL: u.user_metadata?.avatar_url ?? u.user_metadata?.picture ?? null,
    isAnonymous: false,
    providerData: [{ providerId: provider, email: u.email ?? null }],
  };
}

/**
 * Sign out the shared Supabase session.
 */
export async function signOutSupabase(): Promise<void> {
  const supabase = getAuthSupabaseClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}

// ── Site event tracking ───────────────────────────────────────────────────────

const KIWIMU_SITE = 'kiwimu' as const;

/**
 * Fire-and-forget: update last_seen + insert a user_event.
 * Runs both RPCs in parallel; silently ignores failures so callers are never blocked.
 */
export function trackSsoEvent(
  eventType: string,
  metadata: Record<string, unknown> = {}
): void {
  const client = getAuthSupabaseClient();
  if (!client) return;
  Promise.all([
    client.rpc('update_last_seen', { p_site: KIWIMU_SITE }),
    client.rpc('insert_user_event', {
      p_event_type: eventType,
      p_site: KIWIMU_SITE,
      p_metadata: metadata,
    }),
  ]).catch(() => {});
}
