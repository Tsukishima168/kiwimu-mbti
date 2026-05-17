// Supabase User DB Client.
// Reuses the shared auth singleton so user-data writes use the same cookie
// backed session as SSO instead of creating a second GoTrue client.

import { getAuthSupabaseClient } from '../utils/supabaseAuthBridge';

const authClient = getAuthSupabaseClient();

/**
 * Supabase client 專門用於 Moon Island 用戶資料寫入（mbti schema）
 * 若環境變數未設定，為 null（寫入靜默跳過）
 */
export const userDb = authClient?.schema('mbti') ?? null;
