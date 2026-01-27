/**
 * Moon Island Supabase Integration
 * 用於將 MBTI 測驗結果同步至月島品牌的統一客戶資料庫
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 月島品牌 Supabase 連線資訊
// @ts-ignore - Vite env variables
const MOON_ISLAND_SUPABASE_URL = import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
// @ts-ignore - Vite env variables
const MOON_ISLAND_SUPABASE_ANON_KEY = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

// 有效的 MBTI 類型列表
const VALID_MBTI_TYPES = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
] as const;

// 建立月島專用 Supabase Client
let moonIslandSupabase: SupabaseClient | null = null;

if (MOON_ISLAND_SUPABASE_URL && MOON_ISLAND_SUPABASE_ANON_KEY) {
    moonIslandSupabase = createClient(
        MOON_ISLAND_SUPABASE_URL,
        MOON_ISLAND_SUPABASE_ANON_KEY
    );
    console.log('🌙 Moon Island Supabase client initialized');
} else {
    console.warn('⚠️ Moon Island Supabase credentials not found. Sync will be skipped.');
}

/**
 * 驗證 Email 格式
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * 驗證 MBTI 類型
 */
export function isValidMBTI(mbtiType: string): boolean {
    return VALID_MBTI_TYPES.includes(mbtiType as any);
}

/**
 * 儲存 MBTI 測驗結果到月島品牌資料庫
 * 
 * @param userEmail - 用戶 Email（必填）
 * @param mbtiResult - MBTI 測驗結果（如 'INFJ'）
 * @param nickname - 用戶暱稱（選填）
 * @param avatarUrl - 用戶頭像 URL（選填）
 * @returns Promise<boolean> - 成功返回 true，失敗返回 false
 */
export async function saveMBTIToMoonIsland(
    userEmail: string,
    mbtiResult: string,
    nickname?: string,
    avatarUrl?: string
): Promise<boolean> {
    // 檢查 Supabase 是否可用
    if (!moonIslandSupabase) {
        console.warn('⚠️ Moon Island Supabase not available. Skipping sync.');
        return false;
    }

    // 驗證 Email 格式
    if (!isValidEmail(userEmail)) {
        console.error('❌ Invalid email format:', userEmail);
        return false;
    }

    // 驗證 MBTI 類型
    if (!isValidMBTI(mbtiResult)) {
        console.error('❌ Invalid MBTI type:', mbtiResult);
        return false;
    }

    try {
        console.log('🌙 Syncing to Moon Island:', { email: userEmail, mbti: mbtiResult });

        // 寫入資料（使用 upsert 以支援更新）
        const { data, error } = await moonIslandSupabase
            .from('profiles')
            .upsert({
                email: userEmail,
                mbti_type: mbtiResult,
                nickname: nickname || null,
                avatar_url: avatarUrl || null,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'email' // 若 email 已存在則更新
            });

        if (error) {
            console.error('❌ Failed to save MBTI to Moon Island:', error.message);
            return false;
        }

        console.log('✅ MBTI saved to Moon Island database');
        return true;

    } catch (err) {
        console.error('❌ Unexpected error while syncing to Moon Island:', err);
        return false;
    }
}

/**
 * 檢查月島 Supabase 是否可用
 */
export function isMoonIslandAvailable(): boolean {
    return moonIslandSupabase !== null;
}
