import { createClient } from '@supabase/supabase-js';

let cachedClient: any = undefined;

export function getUserAdminDb(): any {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  const url = process.env.SUPABASE_USER_URL || process.env.VITE_SUPABASE_USER_URL;
  const serviceRoleKey =
    process.env.SUPABASE_USER_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    cachedClient = null;
    return cachedClient;
  }

  cachedClient = createClient(url, serviceRoleKey, {
    db: { schema: 'mbti' },
    auth: { persistSession: false, autoRefreshToken: false },
  } as any);

  return cachedClient;
}
