# 🚀 社群推播 48 小時快速部署檢查表

## ⏱️ 時間規畫
- **Day 1**: 代碼實施 + 測試（8 小時）
- **Day 2**: 部署 + 社群推廣（8 小時）

---

## 📋 第一天（代碼實施）

### ✅ 階段 1: 環境準備（1 小時）

- [ ] **複製多語言 Discord API**
  - [x] `api/notify-discord.ts` - 已更新為多語言 Embed 格式
  - [x] 包含繁中/日文/韓文/英文配置
  - [x] 自動 Firestore 記錄

- [ ] **更新 utils/discord.ts**
  - [x] 添加 locale 參數
  - [x] 添加 userId 參數
  - [x] 改進日誌輸出

- [ ] **安裝必要依賴**
  ```bash
  npm install firebase-admin
  # 或 yarn add firebase-admin
  ```

### ✅ 階段 2: 環境變數配置（15 分鐘）

- [ ] **設置 .env.local**
  ```bash
  # Discord
  DISCORD_TOKEN=your_bot_token_here
  DISCORD_CHANNEL_ID=1466020032310939823
  
  # Firebase
  FIREBASE_PROJECT_ID=your_project_id
  FIREBASE_PRIVATE_KEY=your_private_key
  FIREBASE_CLIENT_EMAIL=your_client_email
  
  # Vercel 環境變數
  NEXT_PUBLIC_FIREBASE_CONFIG=your_config_json
  ```

- [ ] **驗證環境變數**
  ```bash
  npm run check-env  # 或手動檢查
  echo "Discord Token: $DISCORD_TOKEN"
  ```

### ✅ 階段 3: 代碼集成（3 小時）

#### 3.1 更新 App.tsx (30 分鐘)

- [ ] **導入必要函數**
  ```typescript
  import { sendDiscordNotification } from './utils/discord';
  import { 
    trackQuizCompleteInternational, 
    setupInternationalTracking 
  } from './utils/analytics';
  ```

- [ ] **修改 handleQuizComplete 函數**
  使用 [APP_TX_IMPLEMENTATION_CODE.md](APP_TX_IMPLEMENTATION_CODE.md) 中的代碼片段

- [ ] **測試編譯**
  ```bash
  npm run build
  # 確認無 TypeScript 錯誤
  ```

#### 3.2 更新 utils/analytics.ts (20 分鐘)

- [ ] **添加新函數**
  ```typescript
  export const setupInternationalTracking = (
    locale: string,
    userId: string,
    mbtiType?: string
  ) => { /* ... */ };
  
  export const trackQuizCompleteInternational = (
    resultType: string,
    locale: string,
    userId: string
  ) => { /* ... */ };
  ```

- [ ] **驗證 Firebase Analytics 初始化**
  ```typescript
  import { getAnalytics } from 'firebase/analytics';
  
  export const analytics = getAnalytics(app);
  ```

#### 3.3 Firestore 規則更新 (15 分鐘)

- [ ] **Firebase Console → Firestore → Rules**
  
  替換為：
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      // Discord 推播記錄
      match /discord_notifications/{doc=**} {
        allow write: if request.auth != null || 
                        request.headers.authorization == ('Bearer ' + env.DISCORD_TOKEN);
        allow read: if true;
      }
      
      // 保留既有規則...
    }
  }
  ```

- [ ] **發佈規則**
  點擊 "Publish"

### ✅ 階段 4: 本地測試（2.5 小時）

#### 4.1 啟動開發伺服器

- [ ] **運行本地環境**
  ```bash
  npm run dev
  # 或 yarn dev
  ```

- [ ] **驗證無錯誤**
  ```bash
  # 檢查終端輸出，確認編譯成功
  ```

#### 4.2 測試多語言推播

- [ ] **繁中版本測試**
  ```bash
  curl -X POST http://localhost:3000/api/notify-discord \
    -H "Content-Type: application/json" \
    -d '{
      "resultType": "INFP",
      "personalityName": "調停者",
      "locale": "zh",
      "userId": "test_user_1"
    }'
  
  # 預期結果：
  # 1. Discord #results 看到 🎉 新成員誕生！
  # 2. Firestore 看到新記錄
  # 3. 日誌顯示 ✅ Notification sent
  ```

- [ ] **日文版本測試**
  ```bash
  curl -X POST http://localhost:3000/api/notify-discord \
    -H "Content-Type: application/json" \
    -d '{
      "resultType": "ENFP",
      "personalityName": "活動家",
      "locale": "ja",
      "userId": "test_user_2"
    }'
  
  # 預期結果：
  # Discord 推播應顯示 🌈 新しい仲間が誕生しました！
  ```

- [ ] **韓文版本測試**
  ```bash
  curl -X POST http://localhost:3000/api/notify-discord \
    -H "Content-Type: application/json" \
    -d '{
      "resultType": "INFJ",
      "personalityName": "중재자",
      "locale": "ko",
      "userId": "test_user_3"
    }'
  
  # 預期結果：
  # Discord 推播應顯示 ✨ 새로운 멤버가 탄생했습니다!
  ```

#### 4.3 端對端測試（UI 測試）

- [ ] **完成繁中版本測驗**
  1. 打開 http://localhost:3000/zh
  2. 完成 MBTI 測驗
  3. 檢查 Discord 推播
  4. 檢查 GA4 實時報告

- [ ] **切換到日文並測試**
  1. 打開 http://localhost:3000/ja
  2. 完成測驗
  3. 驗證推播和 GA4

- [ ] **切換到韓文並測試**
  1. 打開 http://localhost:3000/ko
  2. 完成測驗
  3. 驗證推播和 GA4

#### 4.4 Firestore 查詢驗證

- [ ] **檢查記錄**
  ```javascript
  // 在 Firebase Console Firestore 中執行
  db.collection('discord_notifications')
    .where('locale', '==', 'zh')
    .orderBy('sentAt', 'desc')
    .limit(5)
    .get()
  
  // 預期結果：3+ 條記錄，分別對應 zh, ja, ko 三種語言
  ```

#### 4.5 GA4 驗證

- [ ] **檢查 GA4 實時報告**
  1. Firebase Console → Analytics → 實時報告
  2. 應該看到 quiz_complete_international 事件
  3. 檢查參數中的 custom_locale 和 user_market

---

## 📋 第二天（部署 + 推廣）

### ✅ 階段 5: 部署準備（1 小時）

- [ ] **最終代碼審查**
  ```bash
  git diff --name-only  # 查看修改文件
  git diff HEAD  # 查看具體改動
  ```

- [ ] **構建測試**
  ```bash
  npm run build
  npm run start  # 測試生產構建
  ```

- [ ] **提交代碼**
  ```bash
  git add -A
  git commit -m "🌍 feat: Add international multi-language Discord notifications with GA4 market segmentation

  - 升級 api/notify-discord.ts 支援繁中/日文/韓文/英文推播
  - 使用 Discord Embed 格式代替純文字
  - 自動記錄推播到 Firestore 用於分析
  - 添加 GA4 市場分段追蹤（TW/JP/KR/US）
  - 支援 locale 和 userId 參數傳遞
  
  Closes #123"
  
  git push
  ```

### ✅ 階段 6: 部署到 Vercel（15 分鐘）

- [ ] **Vercel 自動部署**
  Vercel 會自動檢測到 Git push，開始部署流程

- [ ] **監控部署進度**
  1. 打開 https://vercel.com/dashboard
  2. 選擇你的專案
  3. 等待部署完成（通常 2-5 分鐘）
  4. 查看部署日誌，確認無錯誤

- [ ] **驗證生產部署**
  ```bash
  # 測試生產環境
  curl -X POST https://kiwimu.com/api/notify-discord \
    -H "Content-Type: application/json" \
    -d '{
      "resultType": "INFP",
      "personalityName": "調停者",
      "locale": "zh",
      "userId": "prod_test_1"
    }'
  ```

### ✅ 階段 7: 社群推廣（3 小時）

#### 7.1 Discord 社群（1 小時）

- [ ] **在 #announcements 發佈公告**
  ```
  🌍 KIWIMU MBTI 現已支持 4 大語言！

  🎉 繁體中文
  🌈 日本語
  ✨ 한국어
  🚀 English

  每天都有來自世界各地的新朋友加入。
  快來發現你的 MBTI 類型！

  👉 https://kiwimu.com/

  #MBTI #性格測驗 #心理學
  ```

- [ ] **在各語言子頻道置頂公告**
  - #中文-台灣
  - #日本-日本語
  - #한국-한국어

#### 7.2 社交媒體推文 (1 小時)

- [ ] **Twitter/X**
  ```
  🌍 KIWIMU MBTI is now live in 4 languages!

  🇹🇼 繁體中文
  🇯🇵 日本語
  🇰🇷 한국어
  🌍 English

  Every day, new members from around the world discover their personality type.

  Join the global MBTI community today!
  → https://kiwimu.com

  #MBTI #PersonalityTest #心理学 #성격유형
  ```

- [ ] **Facebook**
  ```
  [繁中]
  🎉 KIWIMU MBTI 現已支援繁體中文！
  
  [日本語]
  🌈 KIWIMU MBTIは日本語に対応しました！
  
  [한국어]
  ✨ KIWIMU MBTI가 이제 한국어를 지원합니다!
  ```

- [ ] **Line/WhatsApp 群組**
  ```
  新功能來了！🎉
  
  KIWIMU MBTI 現已支援 4 種語言
  - 繁體中文 🇹🇼
  - 日本語 🇯🇵
  - 한국어 🇰🇷
  - English 🌍
  
  趕快來試試你的類型吧！
  https://kiwimu.com
  ```

#### 7.3 影響力合作（1 小時）

- [ ] **聯絡 MBTI 相關的 KOL/YouTuber**
  ```
  主旨：KIWIMU MBTI 現已支援日文/韓文版本

  親愛的 [名字]，

  KIWIMU MBTI 是一個簡單、有趣的線上性格測驗平台。
  我們很高興地宣佈現已支援 4 大語言，歡迎您的受眾體驗。

  如您有興趣合作或體驗，歡迎聯絡我們。

  Best,
  KIWIMU Team
  ```

### ✅ 階段 8: 監控與優化（1 小時）

- [ ] **設置監控告警**
  1. Firebase Console → Alerts
  2. 設置"完成率"警報：低於 20% 時通知
  3. 設置"錯誤率"警報：高於 5% 時通知

- [ ] **檢查各項指標**
  ```
  1. Discord 推播計數：
     每小時應該有 10+ 條新推播
  
  2. GA4 事件：
     在實時報告中應該看到 quiz_complete_international
  
  3. Firestore 記錄：
     discord_notifications 集合應該持續增長
  
  4. 社群參與度：
     Facebook/Twitter/Discord 回覆量
  ```

- [ ] **24 小時報告**
  
  統計以下指標：
  - 總推播數
  - 各語言分布（TW / JP / KR）
  - GA4 用戶市場分布
  - 社交媒體參與度

---

## 🎯 驗證清單（最後檢查）

部署前最後確認：

- [ ] 所有代碼編譯無錯誤
- [ ] 本地測試通過（全 3 種語言）
- [ ] Firestore 規則已更新
- [ ] 環境變數已設置
- [ ] Discord Bot Token 有效
- [ ] Firebase 連接正常
- [ ] 社群文案已準備
- [ ] Git 提交已推送

---

## 🚨 故障排除

### 問題 1: Discord 推播失敗
```
症狀：推播未出現在 Discord
解決：
1. 驗證 DISCORD_TOKEN 有效
2. 檢查 CHANNEL_ID 正確
3. 查看 Vercel 日誌中的錯誤信息
4. 測試 Bot 權限：https://discord.com/developers/applications
```

### 問題 2: Firestore 未記錄
```
症狀：推播成功但無 Firestore 記錄
解決：
1. 檢查 Firestore 規則是否允許寫入
2. 確認 FIREBASE_PROJECT_ID 正確
3. 檢查 Firebase 初始化
```

### 問題 3: GA4 無事件
```
症狀：GA4 未顯示 quiz_complete_international 事件
解決：
1. 等待 24 小時（GA4 有延遲）
2. 檢查 Analytics.ts 是否正確
3. 驗證 Firebase SDK 版本
```

---

## 📊 預期結果

48 小時後：

| 指標 | 目標 | 驗證方式 |
|------|------|--------|
| **Discord 推播** | 100+ | Discord #results 頻道 |
| **GA4 事件** | 100+ | GA4 Dashboard 實時報告 |
| **市場分布** | TW:JP:KR = 5:3:2 | Firestore 查詢 |
| **社群互動** | 50+ | Facebook/Twitter/Discord 計數 |
| **新用戶** | +100% | GA4 新用戶報告 |

---

## 🎉 成功指標

當你看到以下結果時，表示部署成功：

✅ Discord 頻道收到多種語言的推播  
✅ GA4 實時報告顯示 quiz_complete_international 事件  
✅ Firestore 記錄中有多種 locale 的數據  
✅ 社群互動開始增加  
✅ 新用戶量有明顯提升  

🎊 **祝你社群推廣順利！** 🚀
