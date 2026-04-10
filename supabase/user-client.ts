// Supabase User DB Client
// 指向 Moon Island (xlqwfaailjyvsycjnzkz) — 儲存 MBTI 用戶資料
// 與 client.ts 分開，避免混淆 MBTI 測驗內容 vs 用戶資料

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_USER_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_USER_ANON_KEY as string | undefined;

if (!url || !key) {
  console.warn('[UserDB] VITE_SUPABASE_USER_URL 或 VITE_SUPABASE_USER_ANON_KEY 未設定，userDb 將為 null');
}

/**
 * Supabase client 專門用於用戶資料寫入（mbti schema）
 * 若環境變數未設定，為 null（寫入靜默跳過）
 */
export const userDb = url && key
  ? createClient(url, key, { db: { schema: 'mbti' } })
  : null;
