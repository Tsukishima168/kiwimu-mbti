/**
 * Shared Supabase auth client for kiwimu.com.
 *
 * Use localStorage as the primary auth session store. Full Supabase sessions can
 * exceed browser cookie limits, which makes OAuth callback recovery flaky
 * (especially in Safari). We keep only lightweight mirror cookies for sibling
 * subdomains that want a simple "logged in" hint.
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
const AUTH_HINT_COOKIE = 'kiwimu_auth';
const AUTH_UID_COOKIE = 'kiwimu_uid';
const AUTH_EMAIL_COOKIE = 'kiwimu_email';

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
    'Secure',
  ].join('; ');
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; domain=${COOKIE_DOMAIN}; path=/; max-age=0; SameSite=Lax; Secure`;
}

function setAuthMirrorCookies(user: SupabaseUser | null) {
  if (typeof document === 'undefined') return;
  const incomingUid = user?.id ?? null;
  if (incomingUid === _lastMirrorUid) return; // no-op on token refresh with same identity
  _lastMirrorUid = incomingUid;

  if (!user) {
    deleteCookie(AUTH_HINT_COOKIE);
    deleteCookie(AUTH_UID_COOKIE);
    deleteCookie(AUTH_EMAIL_COOKIE);
    return;
  }

  setCookie(AUTH_HINT_COOKIE, '1');
  setCookie(AUTH_UID_COOKIE, user.id);
  if (user.email) {
    setCookie(AUTH_EMAIL_COOKIE, user.email);
  } else {
    deleteCookie(AUTH_EMAIL_COOKIE);
  }
}

// ── Auth Supabase Client（單例，cookie storage）────────────────────────────

let _authClient: SupabaseClient | null = null;
let _mirrorCookieSubscription: { unsubscribe: () => void } | null = null;
let _lastMirrorUid: string | null | undefined = undefined; // undefined = never written
let _pendingAuthRestore: Promise<{ handled: boolean; error: string | null }> | null = null;
let _authRestoreResult: { handled: boolean; error: string | null } | null = null;

function clearOAuthParams(url: URL) {
  url.searchParams.delete('code');
  url.searchParams.delete('state');
  url.searchParams.delete('error');
  url.searchParams.delete('error_description');
}

export function getAuthSupabaseClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase auth credentials not found.');
    return null;
  }
  if (_authClient) return _authClient;

  _authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });

  void _authClient.auth.getSession().then(({ data }) => {
    setAuthMirrorCookies(data.session?.user ?? null);
  });

  const { data: { subscription } } = _authClient.auth.onAuthStateChange((_event, session) => {
    setAuthMirrorCookies(session?.user ?? null);
  });
  _mirrorCookieSubscription = subscription;

  return _authClient;
}

/**
 * Recover an OAuth session from the current URL.
 *
 * This is safe to call multiple times; concurrent callers share the same
 * in-flight restore so the PKCE code is exchanged at most once.
 */
export async function restoreAuthSessionFromUrl(): Promise<{ handled: boolean; error: string | null }> {
  if (typeof window === 'undefined') {
    return { handled: false, error: null };
  }

  if (_authRestoreResult) return _authRestoreResult;
  if (_pendingAuthRestore) return _pendingAuthRestore;

  const supabase = getAuthSupabaseClient();
  if (!supabase) {
    return { handled: false, error: 'Auth client not available' };
  }

  const url = new URL(window.location.href);
  const redirectError =
    url.searchParams.get('error_description') ||
    url.searchParams.get('error');
  const code = url.searchParams.get('code');

  if (!redirectError && !code) {
    return { handled: false, error: null };
  }

  _pendingAuthRestore = (async () => {
    let result: { handled: boolean; error: string | null };

    if (redirectError) {
      result = { handled: true, error: redirectError };
    } else {
      const { error } = await supabase.auth.exchangeCodeForSession(code as string);
      if (error) {
        result = { handled: true, error: error.message };
      } else {
        clearOAuthParams(url);
        window.history.replaceState(window.history.state, '', url.toString());
        result = { handled: true, error: null };
      }
    }

    _authRestoreResult = result; // cache before .finally() clears _pendingAuthRestore
    return result;
  })().finally(() => {
    _pendingAuthRestore = null;
  });

  return _pendingAuthRestore;
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
