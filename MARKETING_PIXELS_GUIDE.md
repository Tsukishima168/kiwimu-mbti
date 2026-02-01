# 🎯 行銷像素埋設指南

這份文件說明如何在 MBTI Lab 中埋設行銷像素，用於追蹤用戶行為和建立再行銷名單。

---

## 📊 已埋設的追蹤點

### 1. 頁面流程追蹤

```
進入首頁 → 開始測驗 → 答題中 → 完成測驗 → 查看結果 → 點擊 CTA
   ↓          ↓         ↓         ↓          ↓          ↓
PageView   StartQuiz  Progress CompleteQuiz ViewResult  Lead
```

### 2. 轉換事件

| 事件名稱 | 觸發時機 | 對應廣告平台事件 |
|---------|---------|-----------------|
| `StartQuiz` | 點擊"開始測驗" | Facebook: InitiateCheckout<br>TikTok: InitiateCheckout |
| `CompleteQuiz` | 完成 40 題 | Facebook: Purchase<br>TikTok: CompletePayment |
| `ViewResult` | 查看結果頁 | Facebook: ViewContent<br>TikTok: ViewContent |
| `ClickLineCTA` | 點擊 LINE 連結 | Facebook: Lead<br>TikTok: SubmitForm |
| `ClickDessertLink` | 點擊甜點連結 | Facebook: AddToCart |

### 3. 用戶分群

根據 MBTI 類型自動分為 4 大群組：
- 分析師群組（INTJ, INTP, ENTJ, ENTP）
- 外交官群組（INFJ, INFP, ENFJ, ENFP）
- 守護者群組（ISTJ, ISFJ, ESTJ, ESFJ）
- 探險家群組（ISTP, ISFP, ESTP, ESFP）

---

## 🚀 快速設定

### 步驟 1：取得你的 Pixel ID

#### Facebook Pixel
1. 前往 [Facebook Events Manager](https://business.facebook.com/events_manager)
2. 選擇你的像素或建立新的
3. 複製 Pixel ID（16 位數字）

#### Google Ads
1. 前往 [Google Ads](https://ads.google.com)
2. 工具與設定 → 轉換
3. 建立新的轉換動作
4. 複製 Conversion ID 和 Conversion Label

#### TikTok Pixel
1. 前往 [TikTok Ads Manager](https://ads.tiktok.com)
2. Assets → Events → Web Events
3. 建立 Pixel 並複製 Pixel Code

#### LINE Tag
1. 前往 [LINE Ads Platform](https://www.linebiz.com/tw/service/line-ads/)
2. 取得 LINE Tag ID

### 步驟 2：設定 Pixel ID

開啟 `utils/marketingPixels.ts`，找到 `PIXEL_CONFIG`：

```typescript
const PIXEL_CONFIG = {
  facebook: {
    enabled: true,  // ← 改為 true
    pixelId: 'YOUR_FACEBOOK_PIXEL_ID',  // ← 填入你的 ID
  },
  googleAds: {
    enabled: true,  // ← 改為 true
    conversionId: 'AW-XXXXXXXXXX',  // ← 填入你的 ID
  },
  tiktok: {
    enabled: true,  // ← 改為 true
    pixelId: 'YOUR_TIKTOK_PIXEL_ID',  // ← 填入你的 ID
  },
  line: {
    enabled: true,  // ← 改為 true
    tagId: 'YOUR_LINE_TAG_ID',  // ← 填入你的 ID
  }
};
```

### 步驟 3：在 App.tsx 初始化

在 `App.tsx` 的最上方加入：

```typescript
import { useEffect } from 'react';
import { initAllPixels, trackMarketingEvent, MARKETING_EVENTS } from './utils/marketingPixels';
import { initSession, trackAction } from './utils/userDataCollector';

// 在 App 組件內
useEffect(() => {
  // 初始化所有像素
  initAllPixels();
  
  // 初始化 Session
  initSession();
  
  // 記錄頁面瀏覽
  trackMarketingEvent(MARKETING_EVENTS.PAGE_VIEW);
  trackAction('page_view', { page: 'intro' });
}, []);
```

---

## 📍 埋設位置

### 1. 開始測驗（Intro.tsx 或 Manifesto.tsx）

在 "開始測驗" 按鈕的 onClick 事件中：

```typescript
import { trackMarketingEvent, MARKETING_EVENTS } from '../utils/marketingPixels';
import { trackAction } from '../utils/userDataCollector';

const handleStartQuiz = () => {
  // 追蹤事件
  trackMarketingEvent(MARKETING_EVENTS.START_QUIZ);
  trackAction('start_quiz');
  
  // 原本的邏輯
  onStart();
};
```

### 2. 完成測驗（App.tsx 的 handleQuizComplete）

```typescript
import { trackMarketingEvent, MARKETING_EVENTS, createCustomAudience } from './utils/marketingPixels';
import { saveUserBehavior } from './utils/userDataCollector';

const handleQuizComplete = async (answers: Option[]) => {
  const { type, scores } = calculateResults(answers);
  const variant = getVariant(scores);
  const data = await loadResultData(type, variant) || getResultData(type, variant);
  
  // 追蹤完成事件
  trackMarketingEvent(MARKETING_EVENTS.COMPLETE_QUIZ, {
    mbtiType: type,
    variant: variant,
    value: 1  // 可設定虛擬轉換價值
  });
  
  // 建立自訂受眾（用於再行銷）
  createCustomAudience(type, variant);
  
  // 儲存用戶行為到 Firebase
  if (user) {
    await saveUserBehavior(user.uid, type, variant);
  }
  
  // 原本的邏輯
  setScores(scores);
  setResultData(data);
  // ...
};
```

### 3. 查看結果（Result.tsx）

在組件掛載時：

```typescript
import { trackMarketingEvent, MARKETING_EVENTS } from '../utils/marketingPixels';
import { trackAction } from '../utils/userDataCollector';

useEffect(() => {
  // 追蹤查看結果
  trackMarketingEvent(MARKETING_EVENTS.VIEW_RESULT, {
    mbtiType: resultData.id,
    variant: identitySuffix
  });
  
  trackAction('view_result', {
    mbtiType: resultData.id,
    variant: identitySuffix
  });
}, [resultData, identitySuffix]);
```

### 4. 點擊 CTA（Result.tsx 的 LINE 連結）

```typescript
const handleLineCTAClick = () => {
  // 追蹤點擊
  trackMarketingEvent(MARKETING_EVENTS.CLICK_LINE_CTA, {
    mbtiType: resultData.id,
    source: 'result_page'
  });
  
  trackAction('click_line_cta', {
    mbtiType: resultData.id
  });
  
  // 原本的導向邏輯
  window.open('https://lin.ee/r19wTnY', '_blank');
};
```

### 5. 分享結果

```typescript
const handleShare = async () => {
  // 追蹤分享
  trackMarketingEvent(MARKETING_EVENTS.SHARE_RESULT, {
    mbtiType: resultData.id,
    shareMethod: 'ig_story'
  });
  
  trackAction('share_result', {
    method: 'ig_story'
  });
  
  // 原本的分享邏輯
  await handleDownloadIG();
};
```

---

## 🎨 自訂受眾建立

### Facebook 自訂受眾

像素會自動發送以下自訂參數：
- `personality_type`: 完整的 MBTI 類型（如 `INTJ-A`）
- `mbti_base_type`: 基本類型（如 `INTJ`）
- `variant`: A 或 T

在 Facebook Events Manager 中：
1. 前往 **受眾** → **自訂受眾**
2. 選擇 **網站**
3. 建立規則：
   - 已完成 `CompleteQuiz` 事件
   - 且 `personality_type` 包含 `INTJ`
4. 儲存受眾

### Google Ads 再行銷名單

1. 前往 **工具與設定** → **共用資料庫** → **目標對象管理員**
2. 點擊 **+** 建立新的目標對象
3. 選擇 **網站訪客**
4. 設定規則：
   - 造訪過結果頁
   - 完成轉換動作
5. 設定有效期限（建議 30-90 天）

---

## 📊 追蹤驗證

### 檢查 Facebook Pixel

1. 安裝 [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. 前往你的網站
3. 點擊擴充功能圖示
4. 應該會看到 Pixel 正在運作

### 檢查 Google Ads

1. 前往 Google Ads → **工具與設定** → **轉換**
2. 查看轉換次數是否增加

### 檢查 Console

打開瀏覽器 Console（F12），應該會看到：
```
✅ Facebook Pixel 已初始化
✅ Google Ads 已初始化
✅ TikTok Pixel 已初始化
✅ LINE Tag 已初始化
📊 Facebook 事件: CompleteQuiz {mbtiType: "INTJ", variant: "A"}
```

---

## 🔒 隱私權與 GDPR

### Cookie 同意（建議）

如果你的用戶來自歐盟，建議加入 Cookie 同意橫幅：

```typescript
// 範例：簡易的 Cookie 同意
const [cookieConsent, setCookieConsent] = useState(false);

useEffect(() => {
  const consent = localStorage.getItem('cookie_consent');
  if (consent === 'true') {
    setCookieConsent(true);
    initAllPixels();
  }
}, []);

const handleAcceptCookies = () => {
  localStorage.setItem('cookie_consent', 'true');
  setCookieConsent(true);
  initAllPixels();
};
```

### 隱私權政策

記得在網站加入隱私權政策，說明：
- 使用了哪些追蹤技術
- 收集哪些資料
- 資料如何使用
- 用戶的權利

---

## 📈 進階應用

### 1. A/B 測試

追蹤不同版本的轉換率：

```typescript
const variant = Math.random() > 0.5 ? 'A' : 'B';

trackMarketingEvent('ab_test_view', {
  test_name: 'cta_button_color',
  variant: variant
});
```

### 2. 漏斗分析

追蹤用戶在每個步驟的流失：

```
100% 進入首頁
 ↓
80%  開始測驗
 ↓
60%  完成 50% 題目
 ↓
45%  完成測驗
 ↓
30%  查看完整結果
 ↓
10%  點擊 CTA
```

### 3. 價值追蹤

為不同動作設定價值：

```typescript
const EVENT_VALUES = {
  COMPLETE_QUIZ: 100,  // 完成測驗價值 100 元
  CLICK_LINE_CTA: 500,  // 點擊 LINE 價值 500 元
  PURCHASE_DESSERT: 1000  // 購買甜點價值 1000 元
};

trackMarketingEvent(MARKETING_EVENTS.CLICK_LINE_CTA, {
  value: EVENT_VALUES.CLICK_LINE_CTA
});
```

---

## 🐛 常見問題

### Q: Pixel 沒有觸發？

**A:** 檢查：
1. `PIXEL_CONFIG.enabled` 是否為 `true`
2. Pixel ID 是否正確
3. 瀏覽器 Console 有無錯誤訊息
4. 是否被廣告攔截器阻擋

### Q: 如何測試 Pixel？

**A:** 
1. 使用無痕模式測試
2. 安裝 Pixel Helper 擴充功能
3. 查看 Facebook Events Manager 的測試事件

### Q: 可以只用部分 Pixel 嗎？

**A:** 可以！只需在 `PIXEL_CONFIG` 中設定需要的為 `enabled: true`，其他設為 `false`。

---

## ✅ 檢查清單

部署前請確認：

- [ ] 已填入所有 Pixel ID
- [ ] 已在 App.tsx 初始化像素
- [ ] 已在關鍵位置埋入追蹤點
- [ ] 已測試 Pixel 是否正常觸發
- [ ] 已建立 Facebook 自訂受眾
- [ ] 已設定 Google Ads 轉換動作
- [ ] 已加入隱私權政策（如需要）
- [ ] 已測試 Cookie 同意機制（如需要）

---

## 📞 需要協助？

如果遇到問題，可以：
1. 查看瀏覽器 Console 的錯誤訊息
2. 使用各平台的 Pixel Helper 工具
3. 確認 Pixel ID 格式正確
4. 檢查網路連線是否正常
