// Supabase User DB Client
// 指向 Moon Island (xlqwfaailjyvsycjnzkz) — 統一儲存 MBTI 用戶資料。
// 舊 kiwimu-legacy 內容庫不再是 runtime user/data 寫入入口。

import { createClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_USER_URL ||
  import.meta.env.VITE_MOON_ISLAND_SUPABASE_URL) as string | undefined;
const key = (import.meta.env.VITE_SUPABASE_USER_ANON_KEY ||
  import.meta.env.VITE_MOON_ISLAND_SUPABASE_ANON_KEY) as string | undefined;

if (!url || !key) {
  console.warn('[UserDB] Moon Island Supabase env 未設定，userDb 將為 null');
}

/**
 * Supabase client 專門用於 Moon Island 用戶資料寫入（mbti schema）
 * 若環境變數未設定，為 null（寫入靜默跳過）
 */
export const userDb = url && key
  ? createClient(url, key, { db: { schema: 'mbti' } })
  : null;
