# 快速開始指南 - Next.js i18n 遷移

> ⏱️ **預計時間**: 15-20 分鐘

---

## 🎯 目標

將您的 Vite + React 項目遷移到 Next.js，並集成 3 種語言 (EN, JA, KO)，同時保持 **LCP < 1.2 秒**。

---

## 📥 步驟 1: 準備環境

```bash
# 進入項目目錄
cd /Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com

# 確保 Node.js 版本 >= 20
node --version  # 應輸出 v20.x.x 或更高

# 備份現有項目
git commit -am "backup: before nextjs migration"
git branch nextjs-i18n
git checkout nextjs-i18n
```

---

## 📦 步驟 2: 安裝依賴

```bash
# 備份舊 package.json
cp package.json package.json.vite

# 替換為新的 Next.js package.json
cp package.json.next package.json

# 清除舊依賴
rm -rf node_modules package-lock.json

# 安裝新依賴
npm install

# 驗證關鍵依賴
npm list next next-intl react
```

**輸出應該顯示**:
```
✓ next@15.0.0 (或更高)
✓ next-intl@3.7.0 (或更高)
✓ react@19.2.0 (或更高)
```

---

## 🔧 步驟 3: 更新配置文件

```bash
# 更新 TypeScript 配置
cp tsconfig.json.next tsconfig.json

# 確認以下文件已創建（應該已經創建）:
ls -la next.config.ts       # ✓
ls -la middleware.ts         # ✓
ls -la i18n.ts              # ✓
ls -la messages/en.json      # ✓
ls -la messages/ja.json      # ✓
ls -la messages/ko.json      # ✓
```

---

## 🏗️ 步驟 4: 遷移現有邏輯

### 將 `App.tsx` 遷移到 `app/[locale]` 結構

```bash
# 創建頁面路由（保留所有現有邏輯）
# app/[locale]/page.tsx 應該包含您的 App.tsx 的主要邏輯

# 示例結構:
cat > app/\[locale\]/page.tsx << 'EOF'
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

// 導入所有現有組件
import Intro from '@/components/Intro';
import Quiz from '@/components/Quiz';
import Result from '@/components/Result';
// ... 其他導入

export default function HomePage() {
  const locale = useLocale();
  const t = useTranslations();
  
  // 您的所有現有邏輯...
  return (
    <div>
      {/* 渲染您的應用 */}
    </div>
  );
}
EOF
```

---

## 🧪 步驟 5: 本地測試

### 啟動開發服務器
```bash
npm run dev
```

**應看到**:
```
> next dev

  ▲ Next.js 15.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.5s
```

### 測試不同語言

在瀏覽器中打開：

```
✓ http://localhost:3000          → 重定向到 /en
✓ http://localhost:3000/en       → 英文版本
✓ http://localhost:3000/ja       → 日文版本
✓ http://localhost:3000/ko       → 韓文版本
```

### 檢查翻譯是否正確加載

打開瀏覽器控制台：
```javascript
// 檢查 locale
console.log(document.documentElement.lang)  // 應輸出: "en", "ja", 或 "ko"

// 檢查翻譯是否已加載
if (window.__INTL_MESSAGES__) {
  console.log("Translations loaded:", window.__INTL_MESSAGES__);
}
```

---

## ⚡ 步驟 6: 性能檢查

### 使用 Chrome DevTools Lighthouse

1. **打開 DevTools**: F12 或右鍵 → 檢查
2. **前往 Lighthouse 標籤**
3. **選擇 "Desktop"**
4. **點擊 "Analyze page load"**

**檢查指標**:
```
✓ LCP (Largest Contentful Paint)    < 1.2 秒  ✅
✓ FID (First Input Delay)            < 100ms   ✅
✓ CLS (Cumulative Layout Shift)      < 0.1    ✅
```

**如果 LCP 超過 1.2 秒**:
1. 檢查網絡速度 (使用 Lighthouse "Fast 3G" 模式)
2. 檢查圖片是否已優化
3. 檢查是否有阻塞性腳本

---

## 🏗️ 步驟 7: 構建驗證

```bash
# 創建生產構建
npm run build

# 應輸出類似於:
# Route (app)                              Size    First Load JS
# ┌ ○ /                                    -       -
# ├ ├ ○ /en                               2.5k    82.3 kB
# ├ ├ ○ /ja                               2.5k    82.3 kB
# ├ └ ○ /ko                               2.5k    82.3 kB
# ├ ○ /api/metrics                         -       -
# ├ ○ /api/i18n-status                     -       -
# └ ○ 404                                  -       -
```

**確認**:
- [ ] 構建無錯誤
- [ ] 所有 3 種語言都顯示
- [ ] First Load JS < 100 kB

### 預覽構建
```bash
npm run preview
# 訪問 http://localhost:3000 測試生產構建
```

---

## 🚀 步驟 8: 部署到 Vercel

### 8.1 推送到 GitHub
```bash
git add .
git commit -m "feat: migrate to nextjs with i18n (en, ja, ko)"
git push origin nextjs-i18n
```

### 8.2 在 Vercel 上創建 Pull Request Preview
1. 進入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到您的項目
3. 查看 Pull Request 預覽
4. 訪問預覽 URL 測試

### 8.3 環境變數配置
在 Vercel 項目設置中，添加：

```
NEXT_PUBLIC_LOCALE=en
NODE_ENV=production
```

### 8.4 合併到主分支
```bash
# 審查無誤後，合併 PR
git checkout main
git merge nextjs-i18n
git push origin main
```

Vercel 將自動部署生產環境。

---

## 📊 步驟 9: 生產環境驗證

### 驗證部署成功
```bash
# 訪問您的生產域名：
https://your-domain.com          # 英文（默認）
https://your-domain.com/ja       # 日文
https://your-domain.com/ko       # 韓文
```

### 檢查 Vercel Analytics
1. 進入 Vercel 項目
2. 前往 "Analytics" 標籤
3. 檢查 Core Web Vitals
   - LCP 應該 < 1.2s
   - FID 應該 < 100ms
   - CLS 應該 < 0.1

### 使用 PageSpeed Insights
```bash
# 訪問: https://pagespeed.web.dev
# 輸入您的 URL，檢查性能
```

---

## 🔄 步驟 10: 添加新翻譯

### 添加新的翻譯鍵

**1. 在 messages/en.json 中定義**
```json
{
  "newSection": {
    "title": "My Feature",
    "description": "Feature description"
  }
}
```

**2. 同樣添加到 messages/ja.json**
```json
{
  "newSection": {
    "title": "私の機能",
    "description": "機能説明"
  }
}
```

**3. 同樣添加到 messages/ko.json**
```json
{
  "newSection": {
    "title": "내 기능",
    "description": "기능 설명"
  }
}
```

**4. 在組件中使用**
```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('newSection');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

---

## 📝 常用命令參考

```bash
# 開發
npm run dev              # 啟動開發服務器

# 構建和預覽
npm run build            # 創建生產構建
npm run preview          # 預覽構建結果

# 檢查
bash scripts/check-i18n.sh  # 運行 i18n 檢查

# 清理
rm -rf .next node_modules  # 清除緩存和依賴
npm install                # 重新安裝
```

---

## ❓ 常見問題

### Q: 為什麼我的舊路由無法工作？

**A**: 所有路由現在都必須在 `app/[locale]/` 下。
```
舊: /results  →  新: /[locale]/results
舊: /profile  →  新: /[locale]/profile
```

### Q: 如何禁用語言自動偵測？

**A**: 已在 middleware.ts 中禁用 (`localeDetection: false`)

### Q: LCP 仍然超過 1.2 秒怎麼辦？

**A**: 
1. 檢查首屏圖片（> 100KB 的圖片應轉換為 WebP）
2. 分析 JavaScript bundle 大小
3. 檢查 Firebase 初始化是否阻塞

### Q: 如何測試不同的設備尺寸？

**A**: 在 Chrome DevTools 中，按 Ctrl+Shift+M (或 Cmd+Shift+M) 進入設備工具欄模式

---

## 🎓 後續資源

- 📚 [Next.js 官方文檔](https://nextjs.org/docs)
- 🌐 [next-intl 文檔](https://next-intl-docs.vercel.app/)
- ⚡ [Core Web Vitals 優化](https://web.dev/vitals/)
- 🚀 [Vercel 部署指南](https://vercel.com/docs)

---

## ✅ 完成檢查清單

遷移完成後，確認：

- [ ] `npm run dev` 成功運行
- [ ] 所有 3 種語言都可訪問
- [ ] LCP < 1.2 秒 (Lighthouse)
- [ ] 無控制台錯誤
- [ ] 所有舊路由都已遷移
- [ ] 部署到 Vercel 成功
- [ ] 生產環境性能指標符合目標
- [ ] 文檔已更新

---

**需要幫助？** 檢查 `IMPLEMENTATION_CHECKLIST.md` 或 `TRANSLATION_STRATEGY.md`

**上次更新**: 2026 年 2 月 20 日
