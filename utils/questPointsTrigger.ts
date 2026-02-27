/**
 * MBTI Lab 遊戲化積分觸發器
 * 對應 PWA_遊戲化留存系統.md §3-1 點數行為對照表
 * Created: 2026-02-26 by Antigravity
 *
 * 使用方法（在 App.tsx 或 Result 元件中）：
 *   import { triggerMbtiCompletePoints, triggerSharePoints } from './utils/questPointsTrigger';
 *
 *   // 當測驗完成時：
 *   triggerMbtiCompletePoints();
 *
 *   // 當用戶點擊分享時：
 *   triggerSharePoints();
 */

import { PointAction, PointSource, WEEKLY_QUESTS } from '../types/gamification-types';

const DEVICE_ID_KEY = 'moonmoon_device_id';
const WEEKLY_LIMIT_PREFIX = 'kiwimu_weekly_limit_';

function getDeviceId(): string {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
        id = crypto.randomUUID();
        try { localStorage.setItem(DEVICE_ID_KEY, id); } catch (e) { /* ignore */ }
    }
    return id;
}

/**
 * 取得本週的 ISO 週號（用於週任務限制重置）
 */
function getCurrentWeekKey(): string {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${weekNum}`;
}

/**
 * 檢查某個週任務本週是否已觸發過
 */
function isWeeklyLimitReached(questId: string): boolean {
    const key = `${WEEKLY_LIMIT_PREFIX}${questId}_${getCurrentWeekKey()}`;
    return localStorage.getItem(key) === '1';
}

function markWeeklyLimitUsed(questId: string): void {
    const key = `${WEEKLY_LIMIT_PREFIX}${questId}_${getCurrentWeekKey()}`;
    try { localStorage.setItem(key, '1'); } catch (e) { /* ignore */ }
}

/**
 * 寫入 Supabase point_transactions
 * 非同步，不影響主流程
 */
async function recordToSupabase(
    deviceId: string,
    points: number,
    action: PointAction,
    description: string,
    source: PointSource = 'mbti'
): Promise<void> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    try {
        await fetch(`${supabaseUrl}/rest/v1/point_transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
                device_id: deviceId,
                points,
                action,
                description,
                source,
            }),
        });
    } catch (e) {
        console.warn('[questPointsTrigger] Supabase write failed (non-fatal):', e);
    }
}

/**
 * 分發積分到 Passport（透過 URL redirect 或 CustomEvent）
 */
function dispatchPointsToPassport(points: number, action: PointAction, description: string): void {
    // 觸發全域事件（如果同一個頁面有 Passport widget）
    document.dispatchEvent(new CustomEvent('kiwimu:points_earned', {
        detail: { points, action, description, source: 'mbti' as PointSource },
        bubbles: true,
    }));
}

// ─── 公開觸發函式 ──────────────────────────────────────────

/**
 * MBTI 測驗完成 → +2 pts（每週限一次）
 * 呼叫時機：Result 頁面首次顯示時
 */
export function triggerMbtiCompletePoints(): { awarded: boolean; points: number } {
    const questId = WEEKLY_QUESTS.find(q => q.id === 'weekly_mbti')!.id;

    if (isWeeklyLimitReached(questId)) {
        console.log('[questPoints] mbti_complete already claimed this week');
        return { awarded: false, points: 0 };
    }

    const deviceId = getDeviceId();
    const POINTS = 2;
    const desc = 'MBTI 測驗完成 +2 積分（每週限一次）';

    markWeeklyLimitUsed(questId);
    dispatchPointsToPassport(POINTS, 'mbti_complete', desc);
    void recordToSupabase(deviceId, POINTS, 'mbti_complete', desc);

    console.log(`[questPoints] mbti_complete: +${POINTS} pts awarded`);
    return { awarded: true, points: POINTS };
}

/**
 * 分享測驗結果 → +2 pts（每週限一次）
 * 呼叫時機：用戶點擊分享按鈕後
 */
export function triggerSharePoints(): { awarded: boolean; points: number } {
    const questId = WEEKLY_QUESTS.find(q => q.id === 'weekly_share')!.id;

    if (isWeeklyLimitReached(questId)) {
        console.log('[questPoints] share already claimed this week');
        return { awarded: false, points: 0 };
    }

    const deviceId = getDeviceId();
    const POINTS = 2;
    const desc = '分享測驗結果 +2 積分（每週限一次）';

    markWeeklyLimitUsed(questId);
    dispatchPointsToPassport(POINTS, 'share_result', desc);
    void recordToSupabase(deviceId, POINTS, 'share_result', desc);

    console.log(`[questPoints] share_result: +${POINTS} pts awarded`);
    return { awarded: true, points: POINTS };
}
