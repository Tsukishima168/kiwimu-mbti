# ⚡ 快速設定指南 - 行銷像素追蹤

## 🎯 3 步驟完成設定

### 步驟 1：取得你的 Pixel ID（5 分鐘）

#### Facebook Pixel
1. 前往：https://business.facebook.com/events_manager
2. 複製你的 **Pixel ID**（16 位數字，例如：`1234567890123456`）

#### Google Ads（可選）
1. 前往：https://ads.google.com/aw/conversions
2. 建立轉換動作，複製 **Conversion ID**（例如：`AW-123456789`）

#### TikTok Pixel（可選）
1. 前往：https://ads.tiktok.com/i18n/events_manager
2. 建立 Pixel，複製 **Pixel Code**

#### LINE Tag（可選）
1. 前往：https://www.linebiz.com/tw/service/line-ads/
2. 取得 **LINE Tag ID**

---

### 步驟 2：填入 Pixel ID（2 分鐘）

開啟 **`utils/marketingPixels.ts`**，找到第 7-20 行：

```typescript
const PIXEL_CONFIG = {
  facebook: {
    enabled: true,  // ← 改為 true（如果要啟用）
    pixelId: '你的Facebook Pixel ID',  // ← 貼上你的 ID
  },
  googleAds: {
    enabled: false,  // ← 改為 true（如果要啟用）
    conversionId: '',  // ← 貼上你的 ID
  },
  tiktok: {
    enabled: false,  // ← 改為 true（如果要啟用）
    pixelId: '',  // ← 貼上你的 ID
  },
  line: {
    enabled: false,  // ← 改為 true（如果要啟用）
    tagId: '',  // ← 貼上你的 ID
  }
};
```

**範例：**

```typescript
const PIXEL_CONFIG = {
  facebook: {
    enabled: true,
    pixelId: '1234567890123456',
  },
  googleAds: {
    enabled: false,
    conversionId: '',
  },
  tiktok: {
    enabled: false,
    pixelId: '',
  },
  line: {
    enabled: false,
    tagId: '',
  }
};
```

---

### 步驟 3：部署（1 分鐘）

```bash
git add .
git commit -m "feat: 埋設行銷像素"
git push
```

**完成！** 🎉

---

## ✅ 驗證是否正常運作

### 方法 1：使用 Pixel Helper（推薦）

1. 安裝 [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. 前往你的網站
3. 點擊擴充功能圖示
4. 應該會看到綠色勾勾 ✅

### 方法 2：查看 Console

1. 在網站上按 `F12` 打開開發者工具
2. 切換到 **Console** 頁籤
3. 應該會看到：

```
✅ Facebook Pixel 已初始化
📊 Facebook 事件: PageView
```

### 方法 3：Facebook Events Manager

1. 前往 [Facebook Events Manager](https://business.facebook.com/events_manager)
2. 點擊你的 Pixel
3. 查看 **Test Events**
4. 在你的網站上操作，應該會即時顯示事件

---

## 📊 自動追蹤的事件

| 用戶動作 | 追蹤事件 | 對應 Facebook 事件 |
|---------|---------|-------------------|
| 進入網站 | PageView | PageView |
| 開始測驗 | StartQuiz | InitiateCheckout |
| **完成測驗** | **CompleteQuiz** | **Purchase** ⭐ |
| 查看結果 | ViewResult | ViewContent |
| 登入 | Login | CompleteRegistration |
| 點擊 LINE CTA | ClickLineCTA | Lead |
| 查看檔案 | ViewArchive | ViewContent |
| 重新測驗 | Retest | Search |

**⭐ 最重要的轉換事件**：`CompleteQuiz`（完成測驗）

---

## 🎨 在 Facebook 建立自訂受眾

### 1. 完成測驗的所有用戶

1. 前往 **受眾** → **自訂受眾**
2. 選擇 **網站**
3. 規則：**所有網站訪客** → **完成 `Purchase` 事件** → **過去 30 天**
4. 儲存為「完成 MBTI 測驗用戶」

### 2. 特定人格類型用戶

1. 同上，但規則改為：
   - 完成 `Purchase` 事件
   - **且** `mbtiType` **等於** `INTJ`（可選其他類型）
2. 儲存為「INTJ 用戶」

### 3. 未完成測驗的用戶（再行銷）

1. 規則：
   - 完成 `InitiateCheckout` 事件（開始測驗）
   - **但未** 完成 `Purchase` 事件
   - 過去 7 天
2. 儲存為「未完成測驗用戶」
3. 用於再行銷廣告：「還差一點就能了解自己！」

---

## 💡 進階應用

### 設定轉換價值

如果你想追蹤每個轉換的價值（例如：完成測驗 = 100 元價值），可以修改 `App.tsx` 第 163 行：

```typescript
trackMarketingEvent(MARKETING_EVENTS.COMPLETE_QUIZ, {
  mbtiType: type,
  variant: variant,
  value: 100  // ← 調整這個數字
});
```

### 依據 MBTI 類型分群投放

**4 大群組**，可用於不同的廣告內容：

| 群組 | MBTI 類型 | 特質 | 適合的廣告訴求 |
|------|----------|------|--------------|
| 分析師 | INTJ, INTP, ENTJ, ENTP | 理性、邏輯 | 深度分析、專業課程 |
| 外交官 | INFJ, INFP, ENFJ, ENFP | 理想主義、同理心 | 心靈成長、人際關係 |
| 守護者 | ISTJ, ISFJ, ESTJ, ESFJ | 務實、負責 | 實用指南、家庭服務 |
| 探險家 | ISTP, ISFP, ESTP, ESFP | 靈活、行動派 | 限時優惠、體驗活動 |

---

## 🔒 隱私權注意事項

### 如果你的用戶來自歐盟（GDPR）

你需要加入 Cookie 同意橫幅。可以使用以下方案：

1. **簡單方案**：在網站加入一個橫幅，點擊「同意」後才初始化 Pixel
2. **專業方案**：使用 [Osano](https://www.osano.com/) 或 [Cookiebot](https://www.cookiebot.com/) 等工具

**隱私權政策**：記得在 `/public/privacy.html` 中說明使用了哪些追蹤技術。

---

## ❓ 常見問題

### Q: 我只想用 Facebook Pixel，其他不用可以嗎？

**A:** 可以！只需在 `PIXEL_CONFIG` 中，把其他的 `enabled` 設為 `false` 即可。

### Q: Pixel 沒有觸發怎麼辦？

**A:** 檢查：
1. `enabled` 是否為 `true`
2. Pixel ID 是否正確（不要有多餘的空格）
3. 瀏覽器 Console 有無錯誤訊息
4. 是否被廣告攔截器阻擋（用無痕模式測試）

### Q: 我需要修改現有的 Firebase/GA4 設定嗎？

**A:** 不需要！這些追蹤是**額外新增**的，不會影響現有的 Firebase、GA4、Discord、LINE@ 功能。

### Q: 可以追蹤用戶在測驗中的進度嗎？

**A:** 可以！已經自動追蹤在 `user_behaviors` collection 中，包含：
- 完成測驗的時間
- 每個動作的時間戳
- 來源（UTM 參數）
- 裝置資訊

---

## 📞 需要協助？

檢查瀏覽器 Console（F12）的錯誤訊息，或參考完整文件：`MARKETING_PIXELS_GUIDE.md`

---

## ✅ 部署前檢查清單

- [ ] 已取得 Pixel ID
- [ ] 已填入 `utils/marketingPixels.ts`
- [ ] 已將 `enabled` 改為 `true`
- [ ] 已測試 Pixel 是否觸發（使用 Pixel Helper）
- [ ] 已建立 Facebook 自訂受眾
- [ ] 已設定轉換追蹤（如需要）
- [ ] 已加入隱私權政策（如需要）
- [ ] 已部署到 Vercel

**完成後，你就能開始收集用戶資料，為未來的行銷策略做準備！** 🚀
