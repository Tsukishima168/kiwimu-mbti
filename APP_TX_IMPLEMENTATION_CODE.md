// 📝 這是 App.tsx 更新的確切程式碼片段
// 只需複製貼上這些部分到你的 App.tsx

import { sendDiscordNotification } from './utils/discord';
import { trackQuizCompleteInternational, setupInternationalTracking } from './utils/analytics';

// ============================================
// 🔧 修改現有的 handleQuizComplete 函數
// ============================================

export const handleQuizComplete = async (
    resultType: string,
    suffix: 'A' | 'T',
    locale: string = 'zh',  // 新增參數
    userId?: string          // 新增參數
) => {
    try {
        console.log(`[QUIZ_COMPLETE] 用戶完成測驗:`, {
            resultType: `${resultType}-${suffix}`,
            locale,
            userId: userId || 'anonymous',
            timestamp: new Date().toISOString()
        });

        // 1️⃣ 設置 GA4 用戶屬性（國際市場分段）
        setupInternationalTracking(locale, userId || 'anonymous', `${resultType}-${suffix}`);

        // 2️⃣ 記錄 GA4 事件
        trackQuizCompleteInternational(
            `${resultType}-${suffix}`,
            locale,
            userId || 'anonymous'
        );

        // 3️⃣ 發送多語言 Discord 推播
        await sendDiscordNotification(resultType, suffix, locale, userId);

        // 4️⃣ 既有邏輯（保留你原本的代碼）
        // 例如：
        // - 儲存結果到 Firestore
        // - 顯示結果頁面
        // - 觸發分享提示
        // ... 你原本的代碼 ...

    } catch (error) {
        console.error('[ERROR] Quiz completion failed:', error);
        // 錯誤處理...
    }
};

// ============================================
// 📱 在測驗結束時呼叫函數
// ============================================

// 如果你使用 React Hook 或 Context，範本如下：

import { useContext } from 'react';
import { LanguageContext } from './contexts/LanguageContext'; // 假設你有語言上下文

function QuizResultComponent({ resultType, suffix }: Props) {
    const { locale } = useContext(LanguageContext);
    const userId = getCurrentUserId(); // 你的方法取得用戶 ID

    const handleComplete = async () => {
        // 呼叫新的多國推播函數
        await handleQuizComplete(resultType, suffix, locale, userId);
        
        // 顯示結果頁面...
    };

    return (
        <div>
            <button onClick={handleComplete}>
                查看結果 / 結果を見る / 결과 보기
            </button>
        </div>
    );
}

// ============================================
// 🌍 輔助函數：取得當前用戶 ID
// ============================================

function getCurrentUserId(): string | undefined {
    // 方法 1: 從 localStorage 取得
    const localStorageId = localStorage.getItem('user_id');
    if (localStorageId) return localStorageId;

    // 方法 2: 從 Firebase Auth 取得
    // const auth = getAuth();
    // if (auth.currentUser) return auth.currentUser.uid;

    // 方法 3: 從 Firestore 取得
    // const userId = sessionStorage.getItem('userId');
    // if (userId) return userId;

    // 方法 4: 生成匿名 ID
    let anonId = localStorage.getItem('anonymous_id');
    if (!anonId) {
        anonId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('anonymous_id', anonId);
    }
    return anonId;
}

// ============================================
// 🎯 完整使用範例
// ============================================

/*
// 在 components/Result.tsx 或類似的結果頁面中：

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { handleQuizComplete } from '@/App';

export function ResultPage({ resultType, suffix }: Props) {
    const router = useRouter();

    useEffect(() => {
        const sendAnalytics = async () => {
            // 從 URL 取得語言
            const locale = router.locale || 'zh';
            
            // 呼叫推播 + GA4 函數
            await handleQuizComplete(resultType, suffix, locale);
        };

        sendAnalytics();
    }, [resultType, suffix, router.locale]);

    return (
        <div>
            <h1>你的 MBTI 類型：{resultType}-{suffix}</h1>
            {/* 結果內容 */}
        </div>
    );
}
*/

// ============================================
// 🔍 測試清單
// ============================================

/*
✅ 測試步驟：

1. 完成繁中版本的測驗
   - 檢查 Discord #results 頻道是否有 🎉 新成員誕生 推播
   - 檢查 Firestore discord_notifications 集合中是否有記錄
   - 檢查 GA4 是否收到 quiz_complete_international 事件

2. 切換到日文（/ja）並重新測驗
   - 檢查 Discord 推播是否顯示 🌈 新しい仲間が誕生しました！
   - 檢查 GA4 中的 custom_locale 是否為 'ja'

3. 切換到韓文（/ko）並重新測驗
   - 檢查 Discord 推播是否顯示 ✨ 새로운 멤버가 탄생했습니다!
   - 檢查 GA4 中的 user_market 是否為 'KR'

4. 檢查 Firestore 規則
   - 確認 discord_notifications 集合可以寫入
   - 運行 Firestore 查詢：
     db.collection('discord_notifications')
       .where('locale', '==', 'zh')
       .orderBy('sentAt', 'desc')
       .limit(5)
       .get()

5. GA4 驗證
   - 打開 GA4 Dashboard
   - 實時報告應該顯示 quiz_complete_international 事件
   - 檢查 user_market 和 custom_locale 參數
*/

// ============================================
// 🚀 部署檢查清單
// ============================================

/*
在 Vercel 部署前，確認：

□ utils/discord.ts 已更新（支持 locale 和 userId 參數）
□ utils/analytics.ts 已更新（包含 setupInternationalTracking 函數）
□ App.tsx 已更新（handleQuizComplete 呼叫新函數）
□ firebase.ts 已配置 Firebase Admin SDK（如果使用 Firestore）
□ .env.local 已設置 DISCORD_TOKEN 和 FIREBASE_PROJECT_ID
□ package.json 已安裝 firebase-admin（如果使用 Firestore）

部署步驟：
1. git add -A
2. git commit -m "🌍 Add international multi-language Discord notifications and GA4 tracking"
3. git push
4. Vercel 自動部署
5. 等待 ~2 分鐘完成部署
6. 測試：https://kiwimu.com/zh, /ja, /ko

部署後監控：
- Vercel Dashboard 查看構建日誌
- Discord 檢查是否有新推播
- GA4 實時報告確認事件接收
- Firestore 檢查 discord_notifications 集合
*/
