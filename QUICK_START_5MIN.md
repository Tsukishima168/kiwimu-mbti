# ⚡ 5 分鐘快速開始指南

## 🎯 目標
在 48 小時內完成多語言社群推播 + GA4 分析

---

## 🚀 三步快速啟動

### 1️⃣ **複製已更新的代碼** (10 分鐘)

**已完成的文件：**
- ✅ `api/notify-discord.ts` - 多語言 Embed 推播
- ✅ `utils/discord.ts` - 支持 locale 參數

**你需要做的：**
1. 在 `.env.local` 添加：
   ```
   DISCORD_TOKEN=你的_bot_token
   DISCORD_CHANNEL_ID=1466020032310939823
   FIREBASE_PROJECT_ID=你的_project_id
   ```

2. 在 `App.tsx` 中，找到 `handleQuizComplete` 函數，複製以下代碼：
   ```typescript
   // 在函數開始添加
   import { sendDiscordNotification } from './utils/discord';
   import { trackQuizCompleteInternational, setupInternationalTracking } from './utils/analytics';
   
   // 在 handleQuizComplete 函數中添加
   const locale = 'zh'; // 從路由或上下文取得
   const userId = getCurrentUserId(); // 你的方法
   
   // 三行代碼搞定
   setupInternationalTracking(locale, userId, `${resultType}-${suffix}`);
   trackQuizCompleteInternational(`${resultType}-${suffix}`, locale, userId);
   await sendDiscordNotification(resultType, suffix, locale, userId);
   ```

3. 在 `utils/analytics.ts` 末尾添加：
   ```typescript
   export const setupInternationalTracking = (locale, userId, mbtiType) => {
       const marketMap = { 'zh': 'TW', 'ja': 'JP', 'ko': 'KR', 'en': 'US' };
       setUserProperties(analytics, {
           user_market: marketMap[locale] || 'XX',
           preferred_language: locale,
           ...(mbtiType && { mbti_type: mbtiType })
       });
   };
   
   export const trackQuizCompleteInternational = (resultType, locale, userId) => {
       const marketMap = { 'zh': 'TW', 'ja': 'JP', 'ko': 'KR', 'en': 'US' };
       logEvent(analytics, 'quiz_complete_international', {
           user_market: marketMap[locale] || 'XX',
           custom_locale: locale,
           mbti_type: resultType,
           user_id: userId
       });
   };
   ```

### 2️⃣ **本地測試** (15 分鐘)

```bash
# 1. 安裝依賴
npm install firebase-admin

# 2. 啟動本地伺服器
npm run dev

# 3. 測試推播 (新終端窗口)
curl -X POST http://localhost:3000/api/notify-discord \
  -H "Content-Type: application/json" \
  -d '{"resultType":"INFP","personalityName":"調停者","locale":"zh","userId":"test1"}'

# 4. 檢查結果
# 📍 Discord 應顯示: 🎉 新成員誕生！
# 📍 Firestore: discord_notifications 集合應有新記錄
```

### 3️⃣ **部署** (5 分鐘)

```bash
# 1. 提交代碼
git add -A
git commit -m "🌍 Add multi-language Discord notifications"
git push

# 2. Vercel 自動部署 (~2 分鐘)

# 3. 驗證
curl -X POST https://你的-domain.com/api/notify-discord ...
```

---

## 📖 完整文檔索引

| 文檔 | 用途 | 閱讀時間 |
|------|------|--------|
| **[COMMUNITY_LAUNCH_GUIDE.md](COMMUNITY_LAUNCH_GUIDE.md)** | 社群推播快速指南 + 測試步驟 | 5 分鐘 |
| **[GA4_INTERNATIONAL_CONFIG.md](GA4_INTERNATIONAL_CONFIG.md)** | GA4 市場分段配置 + SQL 查詢 | 10 分鐘 |
| **[APP_TX_IMPLEMENTATION_CODE.md](APP_TX_IMPLEMENTATION_CODE.md)** | App.tsx 完整實現代碼 | 5 分鐘 |
| **[DEPLOYMENT_CHECKLIST_48H.md](DEPLOYMENT_CHECKLIST_48H.md)** | 48 小時部署完整清單 | 詳細參考 |

---

## 🎯 核心改動摘要

### 前端變更

**api/notify-discord.ts** - 升級為多語言推播
```typescript
// 新增語言配置
const LOCALES = {
    zh: { emoji: '🎉', header: '新成員誕生！', country: '🇹🇼 台灣' },
    ja: { emoji: '🌈', header: '新しい仲間が誕生しました！', country: '🇯🇵 日本' },
    ko: { emoji: '✨', header: '새로운 멤버가 탄생했습니다!', country: '🇰🇷 韓國' },
};

// 新增 Embed 格式
embeds: [{
    title: `${localeConfig.emoji} ${localeConfig.header}`,
    fields: [{ name: '🌍 Market / 市場', value: localeConfig.country }]
}]

// 新增 Firestore 記錄
await db.collection('discord_notifications').add({
    locale, personalityName, userId, market, ...
});
```

**utils/discord.ts** - 支持 locale 和 userId
```typescript
export const sendDiscordNotification = async (
    resultType, suffix, locale = 'zh', userId
) => { /* 已更新 */ }
```

**App.tsx** - 添加三行代碼
```typescript
setupInternationalTracking(locale, userId, type);
trackQuizCompleteInternational(type, locale, userId);
await sendDiscordNotification(resultType, suffix, locale, userId);
```

### 後端配置

**Firestore 規則** - 允許推播記錄
```javascript
match /discord_notifications/{doc=**} {
    allow write: if request.auth != null;
    allow read: if true;
}
```

**GA4 事件** - 市場分段
```
quiz_complete_international {
    user_market: "TW" | "JP" | "KR" | "US",
    custom_locale: "zh" | "ja" | "ko" | "en",
    mbti_type: "INFP-A",
    user_id: string
}
```

---

## ✅ 今天該做的（列表）

- [ ] 複製 api/notify-discord.ts 和 utils/discord.ts 的改動
- [ ] 在 App.tsx 中添加 3 行代碼
- [ ] 在 utils/analytics.ts 中添加 2 個函數
- [ ] 設置 .env.local
- [ ] 本地測試（curl 測試）
- [ ] Git commit 和 push
- [ ] 驗證 Vercel 部署
- [ ] 測試 Discord 推播（繁中/日文/韓文）
- [ ] 檢查 Firestore 記錄
- [ ] 檢查 GA4 實時報告

---

## 🎉 結果

完成上述步驟後，你將擁有：

✅ **多語言 Discord 推播** - 繁中/日文/韓文/英文，自動分市場  
✅ **GA4 市場分段** - TW/JP/KR/US 用戶分別追蹤  
✅ **Firestore 分析** - 自動記錄所有推播用於未來分析  
✅ **社群準備就緒** - 可以在 Facebook/Twitter/Line 推廣  

---

## 🔗 快速連結

- **代碼詳情**: [APP_TX_IMPLEMENTATION_CODE.md](APP_TX_IMPLEMENTATION_CODE.md)
- **部署檢查表**: [DEPLOYMENT_CHECKLIST_48H.md](DEPLOYMENT_CHECKLIST_48H.md)
- **社群推廣**: [COMMUNITY_LAUNCH_GUIDE.md](COMMUNITY_LAUNCH_GUIDE.md)
- **GA4 配置**: [GA4_INTERNATIONAL_CONFIG.md](GA4_INTERNATIONAL_CONFIG.md)

---

**預計完成時間：2-4 小時（取決於你的環境熟悉度）**

有問題嗎？查看 [DEPLOYMENT_CHECKLIST_48H.md](DEPLOYMENT_CHECKLIST_48H.md) 中的故障排除部分。

🚀 **準備好了嗎？開始吧！**
