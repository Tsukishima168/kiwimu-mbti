# 📊 GA4 多國市場分段配置指南

## 🎯 核心配置（Firebase 控制台）

### 1️⃣ 自訂事件：`quiz_complete_international`

在 Firebase → Analytics → Events 中建立：

```json
{
  "event_name": "quiz_complete_international",
  "parameters": {
    "user_market": "string",      // TW | JP | KR | US | XX
    "custom_locale": "string",    // zh | ja | ko | en
    "mbti_type": "string",        // INFP-A, ENFP-T 等
    "user_id": "string",          // 用戶 ID
    "timestamp": "number"         // Unix timestamp
  }
}
```

### 2️⃣ 用戶屬性（User Properties）

```json
{
  "user_market": "TW",           // 自動設置為用戶首次訪問的市場
  "preferred_language": "zh",    // zh | ja | ko | en
  "mbti_type": "INFP-A",         // 用戶的性格類型
  "signup_date": "2026-02-20"    // 首次完成測驗的日期
}
```

---

## 📱 前端實現（Next.js）

### App.tsx 或 layout.tsx：

```typescript
import { analytics } from '@/firebase';
import { logEvent, setUserProperties } from 'firebase/analytics';
import { useRouter } from 'next/navigation';

export function QuizProvider() {
    const router = useRouter();
    
    // 在測驗完成時呼叫
    const handleQuizComplete = async (resultType: string, suffix: 'A' | 'T') => {
        const locale = router.locale || 'zh'; // 從路由取得語言
        const userId = getUserId(); // 你的用戶 ID 邏輯
        
        // 1️⃣ 設置用戶屬性
        setUserProperties(analytics, {
            user_market: getMarketFromLocale(locale),
            preferred_language: locale,
            mbti_type: `${resultType}-${suffix}`,
            signup_date: new Date().toISOString().split('T')[0]
        });
        
        // 2️⃣ 記錄自訂事件
        logEvent(analytics, 'quiz_complete_international', {
            user_market: getMarketFromLocale(locale),
            custom_locale: locale,
            mbti_type: `${resultType}-${suffix}`,
            user_id: userId,
            timestamp: Date.now()
        });
    };
}

// 輔助函數
function getMarketFromLocale(locale: string): string {
    const marketMap: Record<string, string> = {
        'zh': 'TW',
        'ja': 'JP',
        'ko': 'KR',
        'en': 'US'
    };
    return marketMap[locale] || 'XX';
}
```

---

## 📊 GA4 查詢範本

### Query 1: 各市場完成率

```sql
SELECT
    user_market,
    COUNT(DISTINCT user_pseudo_id) as total_users,
    COUNT(DISTINCT CASE WHEN event_name = 'quiz_complete_international' THEN user_pseudo_id END) as completed,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN event_name = 'quiz_complete_international' THEN user_pseudo_id END) 
        / COUNT(DISTINCT user_pseudo_id), 2) as completion_rate
FROM analytics_1234567.events_*
WHERE _TABLE_SUFFIX BETWEEN '20260220' AND '20260228'
GROUP BY user_market
ORDER BY total_users DESC
```

### Query 2: 語言分布

```sql
SELECT
    custom_locale,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_pseudo_id) as unique_users,
    COUNT(DISTINCT mbti_type) as unique_types
FROM analytics_1234567.events_*
WHERE _TABLE_SUFFIX BETWEEN '20260220' AND '20260301'
  AND event_name = 'quiz_complete_international'
GROUP BY custom_locale
ORDER BY event_count DESC
```

### Query 3: MBTI 類型分布（按市場）

```sql
SELECT
    user_market,
    mbti_type,
    COUNT(*) as count
FROM analytics_1234567.events_*
WHERE _TABLE_SUFFIX = '20260220'
  AND event_name = 'quiz_complete_international'
GROUP BY user_market, mbti_type
ORDER BY user_market, count DESC
```

---

## 🎨 GA4 儀表板建議

### 視圖 1: 市場概覽
- **指標 1**: TW | JP | KR | US 用戶數（卡片）
- **指標 2**: 各市場完成率（折線圖）
- **指標 3**: MBTI 類型分布（圓餅圖）

### 視圖 2: 語言表現
- **指標 1**: 語言選擇統計
- **指標 2**: 完成率 (按語言)
- **指標 3**: 最受歡迎的 MBTI 類型 (按語言)

### 視圖 3: 漏斗分析
```
1. quiz_start (全部用戶)
2. quiz_progress (50% 完成度)
3. quiz_half (75% 完成度)
4. quiz_complete_international (完成)
↓
轉化率: _____%
```

---

## 🔔 設置警報

在 GA4 中建立警報，監控異常：

### 警報 1: 完成率下降
- **指標**: Completion Rate (quiz_complete_international / quiz_start)
- **閾值**: 低於 25% (相比 7 天平均)
- **動作**: 發送 Email 通知

### 警報 2: 新市場異常流量
- **指標**: New Users (user_market = 'KR')
- **閾值**: 超過 200% (相比 7 天平均)
- **動作**: Slack 通知

---

## 📈 Firestore + BigQuery 連接

### 第一步：啟用 BigQuery 匯出

1. Firebase Console → Project Settings → Integrations → BigQuery
2. 選擇 "Export all analytics events"
3. 選擇或建立新的 BigQuery 資料集

### 第二步：查詢 discord_notifications

```sql
SELECT
    market,
    locale,
    COUNT(*) as notification_count,
    COUNT(DISTINCT userId) as unique_users,
    TIMESTAMP_TRUNC(sentAt, DAY) as day
FROM `project-id.firestore_export.discord_notifications_*`
WHERE DATE(sentAt) = CURRENT_DATE()
GROUP BY market, locale, day
ORDER BY day DESC, notification_count DESC
```

### 第三步：相關 Discord 推播 vs GA4 事件

```sql
-- 合併 Firestore Discord 推播和 GA4 事件
SELECT
    f.market,
    f.locale,
    f.notification_count,
    g.event_count,
    ROUND(100.0 * g.event_count / f.notification_count, 2) as conversion_rate
FROM 
    (SELECT market, locale, COUNT(*) as notification_count
     FROM `project-id.firestore_export.discord_notifications_*`
     WHERE DATE(sentAt) = CURRENT_DATE()
     GROUP BY market, locale) f
LEFT JOIN
    (SELECT user_market, custom_locale, COUNT(*) as event_count
     FROM analytics_1234567.events_*
     WHERE _TABLE_SUFFIX = '20260220'
       AND event_name = 'quiz_complete_international'
     GROUP BY user_market, custom_locale) g
ON f.market = g.user_market AND f.locale = g.custom_locale
ORDER BY notification_count DESC
```

---

## 🚀 快速啟用（5 分鐘）

### 步驟 1: 更新 analytics.ts

```bash
# 備份原文件
cp utils/analytics.ts utils/analytics.ts.backup

# 編輯並添加新函數
cat >> utils/analytics.ts << 'EOF'

// 新增：多國市場追蹤
import { setUserProperties } from 'firebase/analytics';

export const setupInternationalTracking = (
    locale: string,
    userId: string,
    mbtiType?: string
) => {
    const marketMap: Record<string, string> = {
        'zh': 'TW',
        'ja': 'JP',
        'ko': 'KR',
        'en': 'US'
    };

    setUserProperties(analytics, {
        user_market: marketMap[locale] || 'XX',
        preferred_language: locale,
        ...(mbtiType && { mbti_type: mbtiType }),
        signup_date: new Date().toISOString().split('T')[0]
    });
};

export const trackQuizCompleteInternational = (
    resultType: string,
    locale: string,
    userId: string
) => {
    const marketMap: Record<string, string> = {
        'zh': 'TW',
        'ja': 'JP',
        'ko': 'KR',
        'en': 'US'
    };

    logEvent(analytics, 'quiz_complete_international', {
        user_market: marketMap[locale] || 'XX',
        custom_locale: locale,
        mbti_type: resultType,
        user_id: userId,
        timestamp: Date.now()
    });
};
EOF
```

### 步驟 2: 在 App.tsx 中調用

```typescript
import { trackQuizCompleteInternational, setupInternationalTracking } from '@/utils/analytics';

const handleQuizComplete = async (resultType: string, suffix: 'A' | 'T', locale: string) => {
    const userId = getUserId();
    
    // 設置用戶屬性
    setupInternationalTracking(locale, userId, `${resultType}-${suffix}`);
    
    // 記錄事件
    trackQuizCompleteInternational(`${resultType}-${suffix}`, locale, userId);
    
    // 發送 Discord 推播
    await sendDiscordNotification(resultType, suffix, locale, userId);
};
```

### 步驟 3: 部署

```bash
git add -A
git commit -m "🌍 Add international GA4 tracking"
git push
# Vercel 將自動部署
```

---

## 📞 驗證

測試多國市場追蹤：

```bash
# 打開 Chrome DevTools → Application → IndexedDB → google_analytics_X
# 應該看到 user_market 和 custom_locale 參數

# 或在 Google Analytics 中查詢：
# 實時報告 → 將語言或市場作為次要維度
```

---

## 🎯 預期結果時間表

| 時間 | 結果 |
|------|------|
| 立即 | 代碼部署完成 |
| 1 小時 | GA4 開始收集事件 |
| 24 小時 | 第一份市場分段報告 |
| 7 天 | 完整的多國數據分析 |

🎉 **祝你的多國社群分享順利！** 🌍
