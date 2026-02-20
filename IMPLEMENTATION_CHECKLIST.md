# i18n 遷移實施檢查清單

## 📋 遷移前準備

### 備份與版本控制
- [ ] 現有項目已備份 (`git commit`)
- [ ] 創建新分支進行遷移 (`git checkout -b nextjs-i18n`)

### 依賴和構建工具
- [ ] 已安裝 Node.js 20+ (LTS)
- [ ] Package manager 準備就緒 (npm / yarn / pnpm)
- [ ] 清除 node_modules (`rm -rf node_modules`)

---

## 🔧 核心配置完成

### 文件創建
- [ ] `next.config.ts` - Next.js 配置
- [ ] `i18n.ts` - i18n 配置文件
- [ ] `middleware.ts` - 路由 middleware
- [ ] `messages/en.json` - 英文翻譯
- [ ] `messages/ja.json` - 日文翻譯
- [ ] `messages/ko.json` - 韓文翻譯

### App 路由器結構
- [ ] `app/[locale]/layout.tsx` - Root layout
- [ ] `app/[locale]/page.tsx` - 主頁面（需要遷移現有邏輯）
- [ ] `app/page.tsx` - 根重定向
- [ ] `app/not-found.tsx` - 404 處理

### TypeScript 配置
- [ ] `tsconfig.json` 已更新為 Next.js 配置

---

## 📦 依賴安裝與驗證

### 安裝步驟
```bash
# 1. 備份舊配置
cp package.json package.json.vite

# 2. 安裝新依賴
npm install

# 3. 驗證安裝
npm list next next-intl react react-dom
```

### 版本檢查
- [ ] next@15.0.0 或更高
- [ ] next-intl@3.7.0 或更高
- [ ] react@19.2.0 或更高

---

## 🧪 本地測試

### 開發環境
- [ ] `npm run dev` 命令成功啟動
- [ ] 開發服務器在 localhost:3000 運行

### 語言切換測試
- [ ] `http://localhost:3000` → 重定向到 `/en`
- [ ] `http://localhost:3000/en` → 正確加載英文版本
- [ ] `http://localhost:3000/ja` → 正確加載日文版本
- [ ] `http://localhost:3000/ko` → 正確加載韓文版本

### 性能檢查（開發）
- [ ] 首次載入時間 < 3 秒
- [ ] 切換語言時頁面即時響應
- [ ] 無控制台錯誤或警告

### 功能測試
- [ ] 翻譯正確渲染
- [ ] 語言切換器正常工作
- [ ] 所有路由可訪問

---

## 🏗️ 構建驗證

### 構建過程
```bash
npm run build
```

- [ ] 構建完成無錯誤
- [ ] 無關鍵警告
- [ ] 生成 `.next` 目錄

### 生成驗證
- [ ] `npm run build` 輸出顯示靜態頁面被預生成
- [ ] 所有 3 種語言的頁面都在構建輸出中
- [ ] 路由預加載正確配置

### 預覽構建
```bash
npm run build && npm run preview
```
- [ ] 構建預覽在 localhost:3000 正確運行
- [ ] 生產環境行為與開發環境一致

---

## 🌐 性能優化驗證

### Lighthouse 審計（Desktop）
使用 Chrome DevTools 的 Lighthouse：

| 指標 | 目標 | 實際 | 狀態 |
|------|------|------|------|
| LCP | < 1.2s | ___ | ☐ |
| FID | < 100ms | ___ | ☐ |
| CLS | < 0.1 | ___ | ☐ |
| Performance | > 90 | ___ | ☐ |

### Lighthouse 審計（Mobile）
同樣指標針對移動設備：

| 指標 | 目標 | 實際 | 狀態 |
|------|------|------|------|
| LCP | < 2.5s | ___ | ☐ |
| FID | < 150ms | ___ | ☐ |
| CLS | < 0.1 | ___ | ☐ |
| Performance | > 85 | ___ | ☐ |

### 進一步優化（如需要）
- [ ] 評估圖片優化
- [ ] 檢查未使用的代碼
- [ ] 評估 bundle 大小
- [ ] 優化字體加載

---

## 📱 跨瀏覽器測試

### Desktop 瀏覽器
- [ ] Chrome 最新版本
- [ ] Firefox 最新版本
- [ ] Safari 最新版本

### Mobile 瀏覽器
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

### 功能檢查
- [ ] 響應式設計正確
- [ ] 翻譯顯示正確
- [ ] 字體渲染無問題
- [ ] 圖片加載正確

---

## 🚀 部署準備

### 環境變數配置
- [ ] 創建 `.env.local` 文件（本地測試）
- [ ] 環境變數不包含敏感信息
- [ ] 驗證所有必要的 env 變數已設置

### Git 準備
- [ ] 所有變更已提交
- [ ] 分支名稱清晰 (e.g., `nextjs-i18n`)
- [ ] Commit 消息清晰和描述性

### Vercel 配置準備
- [ ] Vercel 項目已創建或連接
- [ ] 環境變數已在 Vercel 中配置：
  - [ ] `NEXT_PUBLIC_LOCALE=en`
  - [ ] 其他必要的變數

---

## 🌐 Vercel 部署

### 部署步驟
- [ ] 推送到 GitHub：`git push origin nextjs-i18n`
- [ ] 在 Vercel 中創建 Pull Request Preview
- [ ] 審核 Preview 部署結果

### Vercel 配置
- [ ] 構建命令: `npm run build`
- [ ] 輸出目錄: `.next`
- [ ] Node.js 版本: 20.x (LTS)
- [ ] Functions Timeout: 60 秒
- [ ] Memory: 1024 MB

### Preview 驗證
- [ ] Preview URL 正常工作
- [ ] 所有語言版本可訪問
- [ ] Lighthouse 性能檢查通過

### 生產部署
- [ ] 批准並合併 PR
- [ ] 監控部署進度
- [ ] 驗證生產環境

---

## ✅ 生產環境驗證

### 訪問驗證
- [ ] `https://your-domain.com` → 英文版本
- [ ] `https://your-domain.com/ja` → 日文版本
- [ ] `https://your-domain.com/ko` → 韓文版本

### 性能監控
- [ ] Vercel Analytics 顯示正常數據
- [ ] Core Web Vitals 符合目標
- [ ] 無錯誤日誌或異常

### 功能驗證
- [ ] 所有翻譯正確顯示
- [ ] 語言切換功能正常
- [ ] API 路由响應正確

### SEO 檢查
- [ ] Robots.txt 正確配置
- [ ] Sitemap.xml 包含所有語言版本
- [ ] OG 標籤和 Meta 正確設置

---

## 📊 監控和維護

### 設置監控
- [ ] Vercel 監控已啟用
- [ ] 錯誤追蹤已配置 (如 Sentry)
- [ ] 分析工具已集成 (如 Google Analytics)

### 定期檢查
- [ ] 每週檢查性能指標
- [ ] 每月審查使用者反饋
- [ ] 每季度評估翻譯質量

### 文檔維護
- [ ] 更新內部文檔
- [ ] 記錄任何問題或解決方案
- [ ] 更新團隊 wiki 或知識庫

---

## 🎓 團隊培訓

### 開發人員培訓
- [ ] 團隊成員了解 i18n 架構
- [ ] 所有開發人員知道如何添加新翻譯
- [ ] 建立翻譯流程文檔

### 內容團隊培訓
- [ ] 內容團隊了解翻譯流程
- [ ] 翻譯人員知道文化深度定位策略
- [ ] 建立翻譯審查流程

---

## 🐛 故障排查

### 常見問題

**Q: LCP 超過目標**
- [ ] 檢查首屏圖片大小
- [ ] 驗證字體加載是否阻塞
- [ ] 檢查第三方腳本

**Q: 某語言翻譯未加載**
- [ ] 驗證 JSON 文件格式
- [ ] 檢查 locale 是否正確
- [ ] 檢查 build 輸出

**Q: 部署失敗**
- [ ] 檢查構建日誌
- [ ] 驗證環境變數
- [ ] 檢查依賴版本兼容性

---

## ✨ 最後檢查

部署前最後驗證：

- [ ] 所有測試都通過
- [ ] 性能指標符合要求
- [ ] 沒有控制台錯誤
- [ ] 所有語言都可訪問
- [ ] 文檔已更新
- [ ] 團隊已培訓
- [ ] 備用計劃已準備

---

**檢查完成日期**: ___________  
**檢查人員**: ___________  
**批准人員**: ___________  

---

**上次更新**: 2026 年 2 月 20 日
