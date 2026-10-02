import type { VercelRequest } from '@vercel/node';
import type { User } from '@supabase/supabase-js';
import { getBearerToken } from './economy/requestSecurity.js';
import { getUserAdminDb } from './supabase/user-admin.js';

export async function getVerifiedV2User(req: VercelRequest): Promise<
  { user: User; code?: never } | { user?: never; code: 'AUTH_REQUIRED' | 'AUTH_UNAVAILABLE' }
> {
  const token = getBearerToken(req);
  if (!token) return { code: 'AUTH_REQUIRED' };
  const admin = getUserAdminDb();
  if (!admin) return { code: 'AUTH_UNAVAILABLE' };
  try {
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user || data.user.is_anonymous) return { code: 'AUTH_REQUIRED' };
    return { user: data.user };
  } catch {
    return { code: 'AUTH_UNAVAILABLE' };
  }
}
