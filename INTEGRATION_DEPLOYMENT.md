# 🚀 跨產品整合 - 快速部署指南

## ✅ 已完成的整合

### 1. 立即訂購按鈕 🛒
- **位置**：結果頁 → 靈魂甜點區塊
- **效果**：點擊後跳轉到 Dessert Booking，自動帶入 MBTI 類型
- **預期**：轉換率 +15-25%

### 2. 交叉導流區塊 🗺️
- **位置**：結果頁 → 底部
- **包含**：Dessert Booking、Passport、Moon Map 三個產品卡片
- **預期**：整體流量 +30-50%

### 3. 統一 UTM 追蹤 📈
- **功能**：所有外部連結都有統一的 UTM 參數
- **效果**：可追蹤來源、轉換率、用戶旅程

---

## 📦 部署步驟

### Step 1: 檢查修改的檔案

```bash
# 查看修改的檔案
git status
```

**應該會看到**：
```
modified:   App.tsx
modified:   components/Result.tsx
modified:   components/ExploreMore.tsx
new file:   utils/utmTracking.ts
new file:   CROSS_PRODUCT_INTEGRATION.md
new file:   INTEGRATION_DEPLOYMENT.md
```

### Step 2: 測試功能

```bash
# 啟動開發伺服器
npm run dev
```

**測試項目**：

✅ 完成測驗，到達結果頁  
✅ 確認靈魂甜點區塊有「立即訂購」按鈕（黃色，最上方）  
✅ 點擊訂購按鈕，檢查是否跳轉到 Dessert Booking  
✅ 檢查網址是否帶有 UTM 參數和 MBTI 類型  
✅ 滾動到結果頁底部，確認有「探索更多」區塊  
✅ 點擊三個產品卡片，確認都能正確跳轉  

**預期網址格式**：
```
https://dessert-booking.vercel.app?
  mbti=INTJ-A
  &from=mbti-test
  &source=result-page
  &utm_source=mbti-lab
  &utm_medium=result-cta
  &utm_campaign=2026-q1-integration
  &utm_content=soul-dessert-button
```

### Step 3: 提交到 Git

```bash
# 添加所有修改的檔案
git add .

# 提交（使用有意義的訊息）
git commit -m "feat: 整合跨產品導流與 UTM 追蹤

- 新增：結果頁訂購按鈕，直接跳轉到 Dessert Booking
- 新增：交叉導流區塊，包含 Booking/Passport/Moon Map
- 新增：統一 UTM 追蹤系統，追蹤所有外部連結
- 預期：轉換率提升 15-25%，跨產品流量 +30-50%"

# 推送到 GitHub
git push origin main
```

### Step 4: 部署到 Vercel

如果有設定自動部署，推送到 GitHub 後會自動觸發部署。

如果沒有：
```bash
# 使用 Vercel CLI 部署
vercel --prod
```

**部署完成後**：
- Vercel 會提供一個網址
- 訪問該網址，重複 Step 2 的測試

---

## 📊 部署後監控（第一週）

### 每天檢查

#### 1. Google Analytics 4

```
報表 → 即時 → 事件

查看事件：
- utm_landing（頁面載入帶 UTM）
- outbound_click（外部連結點擊）
```

**預期數據**：
- 每天應該有 utm_landing 事件
- outbound_click 應該包含 link_name（訂購靈魂甜點、月島導覽地圖、甜點護照測驗）

#### 2. Console 檢查

在結果頁打開瀏覽器 Console（F12），應該看到：

```
[UTM] Outbound Click: {
  link: "月島甜點訂購",
  medium: "result-cta",
  mbti_type: "INTJ",
  variant: "A",
  conversion_type: "dessert_order_intent"
}
```

#### 3. 點擊率監控

| 指標 | 目標 | 查詢方式 |
|-----|------|---------|
| 訂購按鈕點擊率 | >10% | GA4 → 事件 → outbound_click (link_name=訂購靈魂甜點) |
| 交叉導流點擊率 | >5% | GA4 → 事件 → outbound_click (section=explore-more) |
| UTM 參數完整性 | 100% | 手動測試，檢查網址 |

---

## 🔧 Dessert Booking 端的整合

為了讓整合完整運作，Dessert Booking 系統需要：

### 1. 接收 MBTI 參數

在 `pages/index.tsx` 或 `app/page.tsx` 加入：

```typescript
import { useSearchParams } from 'next/navigation';

export default function HomePage() {
  const searchParams = useSearchParams();
  const mbtiType = searchParams.get('mbti'); // "INTJ-A"
  const fromMBTI = searchParams.get('from'); // "mbti-test"
  const utmSource = searchParams.get('utm_source'); // "mbti-lab"
  
  // 如果有 MBTI 參數，顯示特殊 Banner
  const showMBTIBanner = mbtiType && fromMBTI === 'mbti-test';
  
  return (
    <>
      {showMBTIBanner && (
        <div className="bg-gradient-to-r from-amber-100 to-yellow-100 border-b-2 border-yellow-400 py-4 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm font-bold text-amber-800 mb-1">
              ✨ 來自 MBTI Lab 的專屬推薦
            </p>
            <h2 className="text-2xl font-bold text-amber-900">
              為 {mbtiType} 推薦
            </h2>
            <p className="text-sm text-amber-700 mt-2">
              根據你的 MBTI 測驗結果，我們為你挑選了最適合的甜點
            </p>
          </div>
        </div>
      )}
      
      {/* 原有的商品列表 */}
      {/* ... */}
    </>
  );
}
```

### 2. 查詢推薦商品（如果有建立 mbti_recommendations 表）

```typescript
// 在 Supabase 查詢
const { data: recommendations } = await supabase
  .from('mbti_recommendations')
  .select(`
    *,
    menu_items (
      id,
      name,
      description,
      image_url,
      menu_variants (price, size)
    )
  `)
  .eq('mbti_type', mbtiType.split('-')[0]) // "INTJ"
  .order('priority', { ascending: false });

// 在商品列表中標記推薦商品
{menuItems.map(item => {
  const isRecommended = recommendations.some(r => r.menu_item_id === item.id);
  
  return (
    <ProductCard 
      {...item}
      badge={isRecommended ? '為你推薦' : null}
      badgeColor="amber"
      priority={isRecommended ? 1 : 0}
    />
  );
})}
```

### 3. 記錄訂單來源（在 orders 表中）

在下單時，記錄是否來自 MBTI 測驗：

```typescript
// 下單時
const orderData = {
  // ... 其他欄位
  from_mbti_test: fromMBTI === 'mbti-test',
  mbti_type: mbtiType,
  utm_source: utmSource,
  utm_medium: searchParams.get('utm_medium'),
  utm_campaign: searchParams.get('utm_campaign'),
};

await supabase.from('orders').insert(orderData);
```

---

## 📈 成效追蹤（第一個月）

### Week 1: 功能驗證
- ✅ 確認所有連結正常運作
- ✅ UTM 參數正確傳遞
- ✅ GA4 有收到事件

### Week 2-3: 數據收集
- 📊 訂購按鈕點擊率
- 📊 交叉導流點擊率
- 📊 各 MBTI 類型的偏好

### Week 4: 成效評估

| 指標 | 目標 | 實際 | 達成率 |
|-----|------|------|-------|
| 訂購按鈕點擊率 | 10% | ___ % | ___ % |
| 實際訂單轉換率 | 2% | ___ % | ___ % |
| 交叉導流點擊率 | 5% | ___ % | ___ % |
| 整體流量提升 | +30% | ___ % | ___ % |

### 成效查詢（GA4）

```
探索 → 自由格式

維度：
- utm_source
- utm_medium
- utm_campaign
- event_name

指標：
- 事件計數
- 工作階段數
- 參與度
```

**篩選器**：
- utm_source = mbti-lab
- event_name = outbound_click 或 utm_landing

---

## 🐛 常見問題

### Q1: 點擊訂購按鈕後，網址沒有 UTM 參數？

**檢查**：
1. 打開 Console（F12）→ Network
2. 點擊訂購按鈕
3. 查看跳轉的網址

**如果沒有參數**：
- 檢查 `utils/utmTracking.ts` 是否正確匯入
- 檢查 `buildDessertOrderLink` 函數是否被調用

### Q2: GA4 沒有收到事件？

**檢查**：
1. 確認 GA4 Measurement ID 已設定（在 `index.html`）
2. 打開 Console，查看是否有 `gtag is not defined` 錯誤
3. 確認 GA4 Real-time 報表（數據有 1-2 分鐘延遲）

### Q3: 訂購按鈕樣式跑掉？

**檢查**：
- 確認 `soul-btn` 的 inline styles 是否完整
- 檢查是否有其他 CSS 覆蓋

**修正**：
```css
/* 如果樣式跑掉，可以在 globals.css 加入 */
.soul-btn {
  display: inline-block !important;
  padding: 14px !important;
  text-align: center !important;
}
```

### Q4: 交叉導流區塊沒有顯示？

**檢查**：
1. 確認 `ExploreMore` 組件已匯入
2. 確認有傳入 `mbtiType` 和 `variant` props
3. 查看 Console 是否有錯誤

---

## 🎯 下一步優化

### 短期（1-2 週）
1. 根據初步數據調整按鈕文案
2. A/B 測試不同的 CTA 文案
3. 優化交叉導流卡片順序

### 中期（1 個月）
1. 建立優惠碼生成系統
2. 完成測驗送折扣碼
3. 建立推薦商品視覺化介面

### 長期（3 個月）
1. 統一會員積分系統
2. 跨產品會員中心
3. 個性化推薦引擎

---

## 📞 需要協助？

如果遇到任何問題：

1. **技術問題**：查看 [CROSS_PRODUCT_INTEGRATION.md](./CROSS_PRODUCT_INTEGRATION.md)
2. **UTM 追蹤**：查看 [utils/utmTracking.ts](./utils/utmTracking.ts)
3. **行銷像素**：查看 [MARKETING_PIXELS_GUIDE.md](./MARKETING_PIXELS_GUIDE.md)

---

**🌙 準備好了嗎？開始部署吧！**

```bash
# 快速部署命令
git add . && \
git commit -m "feat: 整合跨產品導流與 UTM 追蹤" && \
git push origin main
```

**部署完成後，記得測試！** ✨
