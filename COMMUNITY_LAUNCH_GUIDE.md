# 🌍 多國社群推播啟動指南（24 小時快速版）

## 🚀 立即執行（現在起 2 小時）

### ✅ 已完成的升級
- [x] 多語言 Embed 推播系統（繁中/日文/韓文/英文）
- [x] Firestore 自動分析記錄
- [x] 市場分段統計

---

## 📋 社群推播快速步驟

### 1️⃣ **環境變數配置**（5 分鐘）
```bash
# .env.local 添加
DISCORD_CHANNEL_ID=1466020032310939823  # 你的結果頻道
DISCORD_TOKEN=your_bot_token
FIREBASE_PROJECT_ID=your_project_id
```

### 2️⃣ **測試多語言推播**（10 分鐘）

#### 繁中版本
```bash
curl -X POST http://localhost:3000/api/notify-discord \
  -H "Content-Type: application/json" \
  -d '{
    "resultType": "INFP",
    "personalityName": "調停者",
    "locale": "zh",
    "userId": "user_12345"
  }'
```

**預期結果：**
```
🎉 新成員誕生！
調停者 (INFP)
🇹🇼 台灣
```

#### 日文版本
```bash
curl -X POST http://localhost:3000/api/notify-discord \
  -H "Content-Type: application/json" \
  -d '{
    "resultType": "INFP",
    "personalityName": "仲介者",
    "locale": "ja",
    "userId": "user_12345"
  }'
```

**預期結果：**
```
🌈 新しい仲間が誕生しました！
仲介者 (INFP)
🇯🇵 日本
```

#### 韓文版本
```bash
curl -X POST http://localhost:3000/api/notify-discord \
  -H "Content-Type: application/json" \
  -d '{
    "resultType": "INFP",
    "personalityName": "중재자",
    "locale": "ko",
    "userId": "user_12345"
  }'
```

### 3️⃣ **App.tsx 中呼叫新 API**（5 分鐘）

找到 `handleQuizComplete` 函數，更新為：

```typescript
// 在 App.tsx 中
import { sendDiscordNotification } from './utils/discord';
import { useLanguage } from './contexts/LanguageContext'; // 假設你有語言上下文

const handleQuizComplete = async (resultType: string, suffix: 'A' | 'T') => {
    // 既有邏輯...
    
    // 新增：取得當前語言
    const { locale } = useLanguage(); // 或從 localStorage 獲取
    const userId = getCurrentUserId(); // 取得用戶 ID
    
    // 發送多語言推播
    await sendDiscordNotification(resultType, suffix, locale, userId);
    
    // 既有邏輯繼續...
};
```

### 4️⃣ **Firestore 查詢社群推播數據**（10 分鐘）

Firebase Console → Firestore → `discord_notifications` 集合

```
db.collection('discord_notifications')
  .where('locale', '==', 'zh')
  .orderBy('sentAt', 'desc')
  .limit(100)
  .get()
```

**查詢結果示例：**
```json
{
  "resultType": "INFP-A",
  "personalityName": "調停者",
  "locale": "zh",
  "market": "🇹🇼 台灣",
  "sentAt": "2026-02-20T08:30:00Z",
  "userId": "user_12345"
}
```

---

## 📊 GA4 市場分段配置（第二步）

### 在 Firebase Console 中：

1. **Analytics** → **資料流** → **Web**
2. **建立自訂事件**：`quiz_complete_international`
3. **新增自訂參數**：
   - `user_market`: "TW" | "JP" | "KR" | "US"
   - `custom_locale`: "zh" | "ja" | "ko" | "en"
   - `mbti_type`: "INFP-A" 等

### 在 utils/analytics.ts 中添加：

```typescript
import { analytics } from '../firebase';
import { logEvent } from 'firebase/analytics';

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
        timestamp: new Date().toISOString()
    });
};
```

---

## 🌐 社群分享內容範本

### 📱 Discord 內文（自動發送）
```
🎉 新成員誕生！ (繁中版)
調停者 (INFP-A) 剛完成了 KIWIMU MBTI 測驗

🇹🇼 台灣 | 🎯 INFP | ⏰ 2026-02-20 16:30

[Join Now] → https://kiwimu.com/zh
```

### 📲 社群宣傳推文（手動）
```
🌍 KIWIMU MBTI 現已支援 4 大語言！

🇹🇼 繁體中文 | 🇯🇵 日本語 | 🇰🇷 한국어 | 🌍 English

每天都有新朋友加入 → 發現你的性格類型 →  加入我們的社群

[https://kiwimu.com/](https://kiwimu.com/)
```

### 💬 LINE/WhatsApp/Telegram
```
🎉 新成員加入了！
MBTI 類型: INFP-A
市場: 台灣

想知道你的類型嗎？
→ https://kiwimu.com/zh
```

---

## 🎯 驗證清單（24 小時內完成）

- [ ] **環境變數設置**
- [ ] **多語言推播測試** (curl 或 Postman)
- [ ] **App.tsx 更新**（添加 locale 和 userId）
- [ ] **Firestore 規則更新**（允許寫入 discord_notifications）
- [ ] **GA4 自訂事件配置**
- [ ] **社群內容準備**（Discord/Twitter/Line）
- [ ] **Vercel 部署**
- [ ] **測試真實流程**（完成測驗 → 檢查推播）

---

## 🔗 Firestore 規則更新

在 Firebase Console 中，替換 `firestore.rules`：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Discord 推播記錄
    match /discord_notifications/{doc=**} {
      allow write: if request.auth != null || 
                      request.headers.authorization == ('Bearer ' + env.DISCORD_TOKEN);
      allow read: if true; // 用於分析儀表板
    }
  }
}
```

---

## 📈 預期結果（48 小時後）

| 指標 | 預期值 | 驗證方式 |
|------|--------|--------|
| 推播訊息 | 100+ | Discord #results 頻道 |
| 市場分布 | TW:JP:KR = 5:3:2 | Firestore query |
| GA4 事件 | 100+ | GA4 Dashboard |
| 新用戶 | +50% | Analytics |

---

## 🚨 故障排除

### 推播無法發送
```bash
# 1. 檢查 Discord Token
echo $DISCORD_TOKEN

# 2. 測試 Discord API
curl -X GET https://discord.com/api/v10/channels/1466020032310939823 \
  -H "Authorization: Bot YOUR_TOKEN"

# 3. 查看 Vercel 日誌
vercel logs --follow
```

### Firestore 未記錄
- 檢查規則是否允許寫入
- 確認 Firebase 已初始化
- 檢查 FIREBASE_PROJECT_ID

### GA4 無數據
- 確認 analytics.ts 已更新
- 檢查 GA4 自訂事件是否建立
- 等待 24 小時（GA4 延遲）

---

## 📞 快速支援

需要幫助？運行診斷：
```bash
npm run check-i18n  # 檢查 i18n 配置
npm run test-discord  # 測試 Discord 推播
npm run ga4-status  # 檢查 GA4 狀態
```

🎉 **祝你社群推播順利！** 🚀
