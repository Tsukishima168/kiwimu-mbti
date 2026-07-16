import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const EXPECTED_SUPABASE_PROJECT_REF = 'xlqwfaailjyvsycjnzkz';

let cachedClient: SupabaseClient | null | undefined;

export function getProjectRefFromSupabaseUrl(value: string): string | null {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    if (!hostname.endsWith('.supabase.co')) return null;
    return hostname.slice(0, -'.supabase.co'.length) || null;
  } catch {
    return null;
  }
}

export function getEconomyAdminClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;

  const url =
    process.env.SUPABASE_USER_URL ||
    process.env.VITE_MOON_ISLAND_SUPABASE_URL ||
    process.env.VITE_SUPABASE_USER_URL;
  const serviceRoleKey =
    process.env.SUPABASE_USER_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    cachedClient = null;
    return cachedClient;
  }

  const configuredRef =
    process.env.SUPABASE_USER_PROJECT_REF ||
    process.env.SUPABASE_PROJECT_REF ||
    EXPECTED_SUPABASE_PROJECT_REF;
  const urlRef = getProjectRefFromSupabaseUrl(url);
  if (configuredRef !== EXPECTED_SUPABASE_PROJECT_REF || urlRef !== EXPECTED_SUPABASE_PROJECT_REF) {
    console.error('[economy] Supabase project target mismatch');
    cachedClient = null;
    return cachedClient;
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}
