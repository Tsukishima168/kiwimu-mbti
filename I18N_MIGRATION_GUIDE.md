# Next.js i18n 遷移指南 (2026 年版本)

## 📋 遷移步驟

### 1. 備份現有項目
```bash
git commit -am "backup: vite-to-nextjs-migration"
```

### 2. 替換依賴和配置文件
```bash
# 備份舊的 package.json
cp package.json package.json.vite

# 替換為新的 Next.js package.json
cp package.json.next package.json

# 安裝依賴
npm install
```

### 3. 更新 TypeScript 配置
```bash
cp tsconfig.json.next tsconfig.json
```

### 4. 驗證結構
```
app/
  [locale]/
    layout.tsx      # Root layout with i18n
  page.tsx          # Redirect to /en
  not-found.tsx     # 404 handler
middleware.ts       # i18n routing
i18n.ts            # i18n configuration
messages/
  en.json          # English translations
  ja.json          # Japanese translations
  ko.json          # Korean translations
```

---

## 🚀 本機測試

### 啟動開發服務器
```bash
npm run dev
# 服務器運行在 http://localhost:3000
```

### 測試不同語言
```
http://localhost:3000          # 默認英文（重定向到 /en）
http://localhost:3000/en       # 英文版本
http://localhost:3000/ja       # 日文版本
http://localhost:3000/ko       # 韓文版本
```

### 測試性能（Lighthouse）
1. 打開 Chrome DevTools (F12)
2. 前往 "Lighthouse" 標籤
3. 選擇 "Desktop" 或 "Mobile"
4. 點擊 "Analyze page load"
5. 確認 **LCP < 1.2 秒**

### 檢查翻譯是否正確加載
```bash
# 開啟瀏覽器控制台，執行：
console.log(document.documentElement.lang)
# 應輸出: "en" 或 "ja" 或 "ko"
```

---

## 🔄 文化深度定位翻譯策略

### 英文（美國市場）🇺🇸
- **風格**: 直接、簡潔、以結果為導向
- **用語**: 使用 "Discovery"、"Connection"、"Empowerment"
- **時區**: America/New_York
- **例子**:
  - "Discover Your Personality" (強調自我發現)
  - "Connect With Your Tribe" (強調社區連接)
  - "Growth Areas" (積極的挑戰表述)

### 日文（日本市場）🇯🇵
- **風格**: 謙恭、和諧、注重細節理解
- **用語**: 使用 「知る」(了解)、「活かす」(發揮)、「成長」(成長)
- **時區**: Asia/Tokyo
- **文化特性**:
  - 強調「自分らしさ」(自己本質)而非「個性」
  - 使用敬語和禮貌用語
  - 重視「調和」而非「競爭」
- **例子**:
  - "あなたのタイプを知ることで、他者との関係がより良くなります"
  - "成長の機会" (而非負面的"弱點")

### 韓文（韓國市場）🇰🇷
- **風格**: 友善、激勵性、強調自信和互聯
- **用語**: 使用 「성향」(性向/傾向)、「자신감」(自信)、「연결」(連結)
- **時區**: Asia/Seoul
- **文化特性**:
  - 韓文中的「타입」vs「유형」選擇（使用「성향」更自然）
  - 強調社區和集體意識
  - 積極鼓勵語調
- **例子**:
  - "나의 성향을 알면 대인관계가 쉬워집니다"
  - "당신의 성향을 깊이 있게 이해하는 시간" (強調深度理解)

---

## 📊 關鍵性能指標 (Core Web Vitals)

### 目標指標
| 指標 | 目標 | 含義 |
|------|------|------|
| **LCP** | < 1.2s | 最大內容繪製時間 |
| **FID** | < 100ms | 首次輸入延遲 |
| **CLS** | < 0.1 | 累積佈局偏移 |

### 性能優化策略（已內建）

1. **靜態生成 (SSG)**
   - 所有語言版本在構建時預生成
   - 使用 `generateStaticParams()` 生成所有 locale 路由

2. **增量靜態再生成 (ISR)**
   ```tsx
   export const revalidate = 3600; // 1 小時重新驗證
   ```

3. **代碼分割**
   - Webpack 自動分割 vendor、i18n 相關模組
   - 懶加載非關鍵資源

4. **預連接和 DNS 預查詢**
   ```html
   <link rel="preconnect" href="https://www.googleapis.com" />
   <link rel="dns-prefetch" href="https://www.gstatic.com" />
   ```

5. **圖片優化**
   - 自動轉換為 WebP/AVIF
   - 響應式圖片服務

---

## 🌐 Vercel 部署

### 1. 準備部署
```bash
npm run build
# 驗證構建成功，確認所有語言都被靜態生成
```

### 2. 推送到 GitHub
```bash
git add .
git commit -m "chore: migrate to next.js with i18n"
git push origin main
```

### 3. 在 Vercel 上配置

#### 環境變數設置
```
NEXT_PUBLIC_LOCALE=en
NODE_ENV=production
```

#### 構建和部署設置
- **構建命令**: `npm run build`
- **輸出目錄**: `.next`
- **Node.js 版本**: 20.x (LTS)

#### 性能優化設置
- **Edge Caching**: 啟用
- **Functions Timeout**: 60 秒
- **Serverless Functions Memory**: 1024 MB (用於複雜操作)

### 4. 部署後驗證

```bash
# 生產環境 URL
https://your-domain.com          # 英文（默認）
https://your-domain.com/ja       # 日文
https://your-domain.com/ko       # 韓文
```

#### 使用 Lighthouse CI
```bash
npm install -g @lhci/cli@latest

# 創建 lighthouserc.json（見下文）
lhci autorun
```

**lighthouserc.json:**
```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "url": [
        "https://your-domain.com",
        "https://your-domain.com/ja",
        "https://your-domain.com/ko"
      ]
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 1200 }]
      }
    }
  }
}
```

---

## 🔍 監控和維護

### 1. 實時性能監控
- Vercel Analytics (內建)
- Google PageSpeed Insights
- WebPageTest

### 2. 翻譯管理
新增翻譯時，記得同時更新三個文件：
- `messages/en.json`
- `messages/ja.json`
- `messages/ko.json`

### 3. 添加新頁面時的步驟
```tsx
// 1. 在 app/[locale]/your-page/page.tsx 創建頁面

import { useTranslations } from 'next-intl';

export default function YourPage() {
  const t = useTranslations('yourSection');
  return <h1>{t('title')}</h1>;
}

// 2. 在 messages/*.json 中添加翻譯
{
  "yourSection": {
    "title": "..."  // 三種語言都要添加
  }
}
```

---

## 📱 SEO 和多語言最佳實踐

### Sitemap 生成
```tsx
// app/sitemap.ts
export default function sitemap() {
  const baseUrl = 'https://your-domain.com';
  const locales = ['en', 'ja', 'ko'];
  const pages = ['', '/results', '/settings'];

  return pages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${baseUrl}${locale === 'en' ? '' : `/${locale}`}${page}`,
      lastModified: new Date(),
      priority: page === '' ? 1 : 0.8,
      alternateLanguages: {
        x_default: `${baseUrl}${page}`,
        ja: `${baseUrl}/ja${page}`,
        ko: `${baseUrl}/ko${page}`,
        en: `${baseUrl}${page}`,
      },
    }))
  );
}
```

### robots.txt 優化
```text
User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/

Sitemap: https://your-domain.com/sitemap.xml
```

---

## 🐛 故障排查

### LCP 超過 1.2 秒
1. 檢查 Firebase 初始化是否阻塞
2. 確認圖片是否已優化
3. 使用 DevTools Timeline 分析瓶頸

### 翻譯未加載
```tsx
// 檢查 locale 是否正確傳遞
const locale = useLocale();
console.log(locale); // 應輸出 "en", "ja", 或 "ko"
```

### 構建失敗
```bash
# 清除緩存重新構建
rm -rf .next
npm run build
```

---

## ✅ 檢查清單

部署前驗證：

- [ ] 所有語言的翻譯都已完成
- [ ] LCP < 1.2 秒 (使用 Lighthouse 驗證)
- [ ] 所有 3 種語言都可訪問
- [ ] Middleware 正確配置
- [ ] 環境變數在 Vercel 中設置
- [ ] robots.txt 和 sitemap.xml 生成
- [ ] DNS 和 HTTPS 配置正確
- [ ] 錯誤日誌檢查無異常

---

## 📞 支持和參考

- [Next.js i18n 官方文檔](https://next-intl-docs.vercel.app/)
- [next-intl GitHub](https://github.com/amannn/next-intl)
- [Vercel 部署文檔](https://vercel.com/docs)
- [Core Web Vitals 優化指南](https://web.dev/vitals/)

---

**上次更新**: 2026 年 2 月 20 日
