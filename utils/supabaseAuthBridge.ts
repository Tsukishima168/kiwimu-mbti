/**
 * Supabase Auth Bridge（Firebase → Supabase 並行）
 *
 * 用途：Firebase Google 登入成功後，取得 Google idToken，
 *       再用 signInWithIdToken 建立 Supabase session（cookie domain = .kiwimu.com）
 *
 * 這樣 kiwimu.com 所有子網域（passport / map / gacha）可共享登入狀態。
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// @ts-ignore - Vite env variables
const SUPABASE_URL = (import.meta.env.VITE_MOON_ISLAND_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL) as string;
// @ts-ignore - Vite env variables
const SUPABASE_ANON_KEY = (import.meta.env.VITE_MOON_ISLAND_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string;

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

// ── Bridge：Firebase Google idToken → Supabase session ───────────────────────

/**
 * 用 Google idToken 在 Supabase 建立 session
 * 在 Firebase Google 登入成功後立刻呼叫
 *
 * @param idToken - GoogleAuthProvider.credentialFromResult(result)?.idToken
 */
export async function syncGoogleToSupabase(idToken: string): Promise<void> {
  const supabase = getAuthSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });

  if (error) {
    // 非阻塞性：Firebase 主流程照跑，Supabase 失敗只印 log
    console.error('⚠️ Supabase sync failed (non-blocking):', error.message);
    return;
  }

  console.log('✅ Supabase session synced from Google login');
}

/**
 * 登出 Supabase session（配合 Firebase 登出使用）
 */
export async function signOutSupabase(): Promise<void> {
  const supabase = getAuthSupabaseClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}
