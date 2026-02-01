# 🔗 跨產品整合指南

## 📊 整合概覽

本次更新實現了 **MBTI Lab**、**Dessert Booking**、**Moon Map** 和 **Passport** 四個產品之間的深度整合，建立了統一的用戶旅程和數據追蹤系統。

---

## ✨ 新增功能

### 1. 立即訂購按鈕 🛒

**位置**：結果頁 → 靈魂甜點區塊

**功能**：
- 完成 MBTI 測驗後，用戶可直接點擊「立即訂購靈魂甜點」
- 自動帶入 MBTI 類型和變體（如 INTJ-A）
- 跳轉到 Dessert Booking 系統，顯示推薦甜點

**追蹤數據**：
- 點擊率
- MBTI 類型分布
- 轉換率（從測驗到訂購）

**實作細節**：
```typescript
// 生成的連結格式：
https://dessert-booking.vercel.app?
  mbti=INTJ-A
  &from=mbti-test
  &source=result-page
  &utm_source=mbti-lab
  &utm_medium=result-cta
  &utm_campaign=2026-q1-integration
  &utm_content=soul-dessert-button
```

---

### 2. 交叉導流區塊 🗺️

**位置**：結果頁 → 底部（Disclaimer 之前）

**包含三個產品卡片**：

#### 🛒 訂購靈魂甜點
- 連結到 Dessert Booking
- 帶入用戶的 MBTI 類型
- 顯示推薦商品

#### 🎨 甜點護照測驗
- 連結到 Passport 測驗
- 趣味性更高，獲得角色貼紙
- 適合社群分享

#### 🗺️ 月島導覽地圖
- 連結到 Moon Map
- 探索完整的品牌生態
- 了解 Moon Moon 世界觀

**設計特點**：
- 響應式設計（手機 1 欄，桌機 3 欄）
- Hover 效果：陰影、位移、顏色變化
- 清晰的視覺層級
- 統一的品牌風格

---

### 3. 統一 UTM 追蹤系統 📈

**核心文件**：`utils/utmTracking.ts`

**追蹤所有外部連結**：
- Dessert Booking（訂購系統）
- Moon Map（導覽地圖）
- Passport（護照測驗）
- LINE Official Account
- Discord 社群
- Instagram

**UTM 參數結構**：

```
utm_source  = 來源產品（mbti-lab, moon-map, passport）
utm_medium  = 媒介（result-cta, navigation, share）
utm_campaign = 活動名稱（2026-q1-integration）
utm_content = 具體位置（soul-dessert-button, explore-card）
```

**使用範例**：

```typescript
import { 
  buildDessertOrderLink, 
  buildMoonMapLink, 
  buildPassportLink,
  trackDessertOrderClick 
} from './utils/utmTracking';

// 建立訂購連結
const orderLink = buildDessertOrderLink('INTJ', 'A');
// 結果：https://dessert-booking.vercel.app?mbti=INTJ-A&utm_source=mbti-lab&...

// 追蹤點擊
trackDessertOrderClick('INTJ', 'A');
```

---

## 📊 數據追蹤架構

### Firebase Analytics 事件

| 事件名稱 | 觸發時機 | 參數 |
|---------|---------|------|
| `outbound_click` | 點擊外部連結 | link_name, utm_source, utm_medium, mbti_type |
| `utm_landing` | 頁面載入（有 UTM） | utm_source, utm_medium, utm_campaign |
| `dessert_order_intent` | 點擊訂購按鈕 | mbti_type, variant, conversion_type |

### Facebook Pixel 事件（如已啟用）

```javascript
// 點擊訂購按鈕時
fbq('track', 'InitiateCheckout', {
  content_name: 'MBTI INTJ-A 推薦甜點',
  value: 100,
  currency: 'TWD'
});
```

### LocalStorage 追蹤

```javascript
// 首次接觸的 UTM 參數（用於歸因分析）
{
  utm_source: 'mbti-lab',
  utm_medium: 'result-cta',
  utm_campaign: '2026-q1-integration',
  timestamp: 1738036800000
}
```

---

## 🎯 預期效益

### 1. 轉換率提升
- **訂購按鈕**：預期轉換率 +15-25%
- **交叉導流**：預期跨產品流量 +30-50%

### 2. 用戶旅程完整化
```
MBTI Lab（測驗） 
    ↓
Result（結果）
    ↓
Dessert Booking（訂購）
    ↓
Moon Map（探索品牌）
    ↓
Passport（趣味測驗）
    ↓
LINE OA（社群）
```

### 3. 數據洞察
- 哪個 MBTI 類型最常訂購？
- 用戶更喜歡哪個產品？
- 哪個流量來源轉換率最高？

---

## 🚀 使用指南

### 在 Dessert Booking 接收 MBTI 參數

```typescript
// 在 Dessert Booking 的首頁
const params = new URLSearchParams(window.location.search);
const mbtiType = params.get('mbti'); // "INTJ-A"
const fromMBTI = params.get('from'); // "mbti-test"
const utmSource = params.get('utm_source'); // "mbti-lab"

// 如果有 MBTI 參數，顯示推薦商品
if (mbtiType) {
  // 1. 從 Supabase 查詢推薦商品
  const recommendations = await supabase
    .from('mbti_recommendations')
    .select('*')
    .eq('mbti_type', mbtiType.split('-')[0]) // "INTJ"
    .order('priority', { ascending: false });
  
  // 2. 在頁面頂部顯示標語
  <div className="hero">
    <h1>為 {mbtiType} 推薦</h1>
    <p>根據你的 MBTI 測驗結果，我們為你挑選了最適合的甜點</p>
  </div>
  
  // 3. 標記推薦商品
  {recommendations.map(item => (
    <ProductCard 
      {...item} 
      badge="為你推薦" 
      reason={item.reason}
    />
  ))}
}

// 追蹤轉換（如果用戶下單）
gtag('event', 'purchase', {
  from_mbti_test: true,
  mbti_type: mbtiType,
  utm_source: utmSource,
  value: orderTotal
});
```

### 在 Moon Map 接收 MBTI 參數

```typescript
// 在 Moon Map 的首頁
const mbtiType = new URLSearchParams(window.location.search).get('mbti');

if (mbtiType) {
  // 個性化歡迎訊息
  <div className="welcome">
    <h1>歡迎來到月島，{mbtiType}！</h1>
    <p>根據你的人格特質，我們為你準備了專屬的探索路線</p>
  </div>
  
  // 追蹤
  gtag('event', 'mbti_user_visit', {
    mbti_type: mbtiType,
    utm_source: 'mbti-lab'
  });
}
```

---

## 📈 數據分析查詢

### Google Analytics 4

#### 查詢：從 MBTI Lab 到 Booking 的轉換率

```
探索 → 自由格式
維度：utm_source, utm_medium, mbti_type
指標：工作階段數、轉換數
篩選器：utm_source = mbti-lab
```

#### 查詢：各 MBTI 類型的訂購率

```
探索 → 路徑分析
起點：outbound_click (link_name = 訂購靈魂甜點)
終點：purchase
細分：mbti_type
```

### Supabase（Booking 系統）

```sql
-- 查詢來自 MBTI Lab 的訂單
SELECT 
  mbti_type,
  COUNT(*) as order_count,
  SUM(total_price) as revenue,
  AVG(total_price) as avg_order_value
FROM orders
WHERE from_mbti_test = true
GROUP BY mbti_type
ORDER BY order_count DESC;

-- 查詢轉換率（需要先建立 tracking 表）
SELECT 
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE from_mbti_test = true) as mbti_orders,
  COUNT(*) as total_orders,
  ROUND(
    COUNT(*) FILTER (WHERE from_mbti_test = true)::NUMERIC / COUNT(*) * 100, 
    2
  ) as mbti_conversion_rate
FROM orders
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY date
ORDER BY date DESC;
```

---

## 🔧 維護與優化

### 定期檢查（每週）

1. **UTM 參數是否正常運作**
   - 檢查 GA4 是否有收到 utm_landing 事件
   - 確認 utm_source 分布

2. **轉換率監控**
   - 訂購按鈕點擊率
   - 實際訂單轉換率
   - 交叉導流點擊率

3. **用戶反饋**
   - Discord 中是否有相關討論
   - 是否有錯誤回報

### 優化建議

#### A/B 測試

```typescript
// 測試不同的按鈕文案
const buttonTexts = {
  A: '🛒 立即訂購靈魂甜點',
  B: '🍰 馬上品嚐專屬美味',
  C: '✨ 訂購我的靈魂甜點'
};

// 根據用戶 ID 分組
const variant = user.uid.charCodeAt(0) % 3; // 0, 1, 2
const buttonText = buttonTexts[variant === 0 ? 'A' : variant === 1 ? 'B' : 'C'];

// 追蹤
trackMarketingEvent('ab_test_view', {
  test_name: 'dessert_button_text',
  variant: variant === 0 ? 'A' : variant === 1 ? 'B' : 'C'
});
```

#### 動態推薦

根據用戶行為調整推薦：

```typescript
// 如果用戶重測多次，推薦「變化組合」
if (testHistory.length > 2) {
  recommendations.push({
    type: 'dynamic',
    title: '探索不同面向',
    description: '你測過多次，或許想嘗試不同象限的甜點？'
  });
}

// 如果用戶已訂購過，推薦「類似口味」
if (orderHistory.length > 0) {
  recommendations = getSimilarDesserts(orderHistory[0].dessert);
}
```

---

## 🎬 下一步

### 短期（1-2 週）

1. ✅ 監控數據，確保追蹤正常運作
2. ✅ 收集初步的轉換率數據
3. ✅ 根據用戶反饋調整文案

### 中期（1 個月）

1. 建立統一的會員積分系統
2. 完成測驗送優惠碼
3. 建立用戶行為儀表板

### 長期（3 個月）

1. 統一認證系統（Supabase Auth）
2. 跨產品會員中心
3. 個性化推薦引擎

---

## 📞 需要協助？

如果遇到任何問題，請參考：
- [UTM 追蹤系統文件](./utils/utmTracking.ts)
- [行銷像素設定指南](./MARKETING_PIXELS_GUIDE.md)
- [Supabase 整合指南](./SUPABASE_SETUP.md)

---

**🌙 Designed with care by KIWIMU Team**  
**更新日期：2026-01-28**
