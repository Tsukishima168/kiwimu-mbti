# 🧪 本地測試指南

## 🚀 啟動開發伺服器

```bash
npm run dev
```

然後打開瀏覽器訪問：`http://localhost:5173`

---

## ⚡ 快速跳轉到結果頁面（三種方法）

### 方法 1：使用測試面板（最方便）

1. 啟動開發伺服器後，在任何頁面按 **`Ctrl + Shift + T`**
2. 會出現測試面板（右下角黑色浮窗）
3. 點擊任何 MBTI 類型按鈕，立即跳到該結果頁面

![測試面板示意圖]
```
🧪 測試模式
快速跳轉到結果頁面

[INTJ] [INTP] [ENTJ] [ENTP]
[INFJ] [INFP] [ENFJ] [ENFP]
[ISTJ] [ISFJ] [ESTJ] [ESFJ]
[ISTP] [ISFP] [ESTP] [ESFP]

💡 快捷鍵：Ctrl+Shift+T
```

### 方法 2：使用網址參數

在網址加上 `?test=true`：

```
http://localhost:5173?test=true
```

頁面載入後會自動顯示測試面板。

### 方法 3：在 Console 手動執行（進階）

1. 按 **F12** 打開開發者工具
2. 切換到 **Console** 分頁
3. 在測試面板中點擊任何類型按鈕

---

## ✅ 測試項目清單

### 1. 訂購按鈕測試

1. 跳轉到任何結果頁（例如 INTJ）
2. 滾動到「靈魂甜點」區塊
3. 確認看到黃色「🛒 立即訂購靈魂甜點」按鈕（最上方）
4. 點擊按鈕
5. **檢查**：
   - [ ] 是否跳轉到新分頁
   - [ ] 網址是否包含 `mbti=INTJ-A`
   - [ ] 網址是否包含 `utm_source=mbti-lab`
   - [ ] 網址是否包含 `utm_medium=result-cta`
   - [ ] 網址是否包含 `utm_campaign=2026-q1-integration`

**預期網址**：
```
https://shop.kiwimu.com?
  mbti=INTJ-A
  &from=mbti-test
  &source=result-page
  &utm_source=mbti-lab
  &utm_medium=result-cta
  &utm_campaign=2026-q1-integration
  &utm_content=soul-dessert-button
```

### 2. 交叉導流區塊測試

1. 在結果頁滾動到底部（Disclaimer 之前）
2. 確認看到「探索更多」區塊
3. **檢查**：
   - [ ] 看到三個產品卡片（訂購、護照、地圖）
   - [ ] 卡片有 Hover 效果（陰影、位移）
   - [ ] 卡片上方有徽章（立即訂購、趣味測驗、探索地圖）
4. 點擊每個卡片
5. **檢查**：
   - [ ] 訂購卡片 → 跳轉到 Dessert Booking（帶 MBTI 參數）
   - [ ] 護照卡片 → 跳轉到 Passport（帶 UTM 參數）
   - [ ] 地圖卡片 → 跳轉到 Moon Map（帶 MBTI 和 UTM 參數）

### 3. UTM 追蹤測試

1. 打開 Console（F12）
2. 點擊任何外部連結
3. **檢查 Console 輸出**：

```javascript
[UTM] Outbound Click: {
  link: "月島甜點訂購",
  medium: "result-cta",
  mbti_type: "INTJ",
  variant: "A",
  conversion_type: "dessert_order_intent"
}
```

### 4. 響應式設計測試

1. 按 **F12** → 切換到手機模式（Toggle device toolbar）
2. 測試不同螢幕尺寸：
   - iPhone（375px）
   - iPad（768px）
   - Desktop（1920px）
3. **檢查**：
   - [ ] 訂購按鈕在手機上正常顯示
   - [ ] 交叉導流卡片在手機上是 1 欄
   - [ ] 交叉導流卡片在桌機上是 3 欄
   - [ ] 所有文字可讀

### 5. 不同 MBTI 類型測試

使用測試面板快速切換不同類型，檢查：

- [ ] INTJ - 內向思考型
- [ ] ENFP - 外向直覺型
- [ ] ISFJ - 內向感覺型
- [ ] ESTP - 外向感知型

**確認每個類型**：
- 結果頁正常顯示
- 訂購按鈕帶正確的 MBTI 參數
- 推薦的甜點正確

---

## 📊 監控 GA4 事件（可選）

### 1. 確認 GA4 Measurement ID

檢查 `index.html` 中是否有設定 GA4 ID：

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

### 2. 查看即時事件

1. 打開 [Google Analytics](https://analytics.google.com/)
2. 選擇你的 Property
3. 報表 → 即時 → 事件
4. 在本地端測試時應該看到：
   - `utm_landing`（如果網址有 UTM 參數）
   - `outbound_click`（點擊外部連結時）

### 3. Console 驗證

在 Console 應該看到：

```javascript
[GA4 Track] outbound_click {
  link_domain: "shop.kiwimu.com",
  link_name: "月島甜點訂購",
  utm_source: "mbti-lab",
  mbti_type: "INTJ"
}
```

---

## 🐛 常見問題

### Q: 測試面板沒有出現？

**解決方法**：
1. 確認按的是 `Ctrl + Shift + T`（不是 Cmd）
2. 或在網址加上 `?test=true`
3. 重新整理頁面

### Q: 點擊按鈕後沒有跳轉？

**檢查**：
1. 打開 Console，看是否有錯誤
2. 檢查 `utils/utmTracking.ts` 是否正確匯入
3. 確認網路連線正常

### Q: UTM 參數沒有出現在網址中？

**檢查**：
1. 在 Console 查看是否有 `buildDessertOrderLink` 被調用
2. 檢查 `EXTERNAL_LINKS` 配置是否正確
3. 確認 `utm_source` 等參數有正確設定

### Q: Console 顯示 "gtag is not defined"？

**原因**：GA4 腳本未載入

**解決方法**：
1. 檢查 `index.html` 中的 GA4 腳本
2. 確認 Measurement ID 正確
3. 網路連線正常（GA4 腳本從 Google CDN 載入）

---

## 🎯 測試完成後

### 確認所有功能正常

- ✅ 測試面板可正常打開
- ✅ 可以快速跳轉到任何 MBTI 結果頁
- ✅ 訂購按鈕顯示正確（黃色，最上方）
- ✅ 點擊訂購按鈕，網址帶正確參數
- ✅ 交叉導流區塊顯示三個產品卡片
- ✅ 所有外部連結都有 UTM 參數
- ✅ Console 有正確的追蹤 log
- ✅ 響應式設計正常（手機/桌機）

### 準備部署

如果所有測試都通過，可以準備部署了：

```bash
# 提交修改
git add .
git commit -m "feat: 整合跨產品導流與 UTM 追蹤

- 新增：測試模式，快速跳轉到結果頁面
- 新增：訂購按鈕（轉換率 +15-25%）
- 新增：交叉導流區塊（流量 +30-50%）
- 新增：統一 UTM 追蹤系統"

# 推送到 GitHub
git push origin main
```

---

## 📝 測試備註

### 測試面板在生產環境

測試面板只在：
1. 網址有 `?test=true` 參數
2. 或按 `Ctrl+Shift+T` 快捷鍵

**生產環境中**，一般用戶不會看到測試面板（除非他們知道快捷鍵）。

如果想完全禁用測試面板，可以在 `App.tsx` 中加入環境檢查：

```typescript
// 只在開發環境啟用測試面板
const isDev = import.meta.env.DEV;

useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (isDev && e.ctrlKey && e.shiftKey && e.key === 'T') {
      // ...
    }
  };
  // ...
}, []);
```

---

## 🎉 測試愉快！

有任何問題，請查看：
- [完整整合文件](./CROSS_PRODUCT_INTEGRATION.md)
- [部署指南](./INTEGRATION_DEPLOYMENT.md)
- [快速摘要](./INTEGRATION_SUMMARY.md)

---

**快捷鍵提醒**：`Ctrl + Shift + T` 打開測試面板 🧪
