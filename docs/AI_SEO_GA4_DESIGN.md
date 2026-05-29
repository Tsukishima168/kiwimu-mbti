# AI SEO 與 GA4 分析設計（本專案）

本文件定義 **Kiwimu MBTI Lab** 專案內的 AI SEO 與 GA4 分析架構，方便實作與維護。

---

## 一、架構總覽

| 區塊 | 目的 | 產出／實作位置 |
|------|------|----------------|
| **AI SEO** | 讓公開頁可抓取、可理解、敢引用；未公開頁保留 noindex 與分享 meta | sitemap、robots、meta、JSON-LD、llms.txt、route-level SEO |
| **GA4** | 流量、轉換、行為、來源分析 | gtag 事件、自訂維度、報表建議、V2 funnel |

---

## 二、AI SEO 設計

### 2.1 可抓取（Crawl）

| 項目 | 說明 | 檔案／位置 |
|------|------|------------|
| **sitemap.xml** | 列出希望被收錄的 URL | `public/sitemap.xml` |
| **robots.txt** | 不擋重要路徑、指向 sitemap | `public/robots.txt` |
| **V2 公開 teaser 入口** | `/read/quiz` 與 `/read/<TYPE>-<VARIANT>` 可公開索引，但只代表可見 teaser 與公開 metadata；付費鎖定章節、個人化資料與解鎖狀態不可被引用 | `App.tsx`、`components/v2/V2App.tsx`、`components/v2/V2QuizFlow.tsx`、`public/sitemap.xml`、`public/llms.txt` |
| **公開答案中心** | `answers` hub，集中回答 `16 型`、`A/T`、`32 變體` 與引用邊界 | `pages/AnswersHub.tsx`、`data/answersHubContent.ts` |
| **主站 URL** | SPA 以首頁為主；目前公開且可索引的核心內容為 `/`、`/explore`、`/answers`、`/read/quiz` 與 V2 teaser | `https://kiwimu.com/` |

**注意**：本專案仍是 SPA。公開可索引內容目前集中在 `V1 首頁 /`、`V1.5 /explore`、`/answers`、`/read/quiz` 與 `/read/<TYPE>-<VARIANT>` 的公開 teaser。V2 付費鎖定章節、個人化內容、解鎖狀態與 user-specific URL 不對外公開索引。V1 / V1.5 的 quiz / result 階段則以虛擬頁 `page_view` 追蹤。

### 2.2 可理解（Understand）

| 項目 | 說明 | 實作位置 |
|------|------|----------|
| **Meta 標籤** | title、description、og、twitter | `index.html` + `utils/seo.ts` |
| **JSON-LD** | 首頁靜態 schema + 公開頁動態 schema，讓搜尋／AI 理解品牌與公開內容頁 | `index.html`、`utils/seo.ts`、`App.tsx`、`components/explore/ExploreApp.tsx`、`pages/AnswersHub.tsx` |
| **語系** | 本專案為 zh-TW | `index.html` 的 `lang="zh-TW"` |

**JSON-LD 結構（已加入 index.html）**：

- **WebSite**：name、url、description、potentialAction（SearchAction 可選）。
- **Organization**：name、url、logo、sameAs（LINE、IG 等）。

### 2.3 可相信（Trust）

- **品牌**：Kiwimu / Moon Moon Dessert 在 JSON-LD 與 meta 中露出。
- **更新**：若日後有公開內容頁，可加 `dateModified` 等欄位。
- **隱私**：`/privacy` 或 `public/privacy.html` 已存在，sitemap 可視需求納入。

### 2.4 檔案清單（本專案內）

| 檔案 | 用途 |
|------|------|
| `public/robots.txt` | 允許搜尋爬蟲與 `OAI-SearchBot`；阻擋私密路徑、token URL 與 `GPTBot` |
| `public/sitemap.xml` | 首頁 + `/explore` + `/answers` + `/read/quiz` + V2 公開 teaser + 靜態頁 |
| `index.html` | 首頁 meta、JSON-LD、GA4 gtag |
| `utils/seo.ts` | runtime meta / canonical / JSON-LD 更新 |
| `App.tsx` | V1 主漏斗 runtime SEO 與 GA4 |
| `components/explore/ExploreApp.tsx` | V1.5 `/explore` runtime SEO 與 GA4 |
| `components/v2/V2App.tsx` | `/read` fallback noindex；`/read/<TYPE>-<VARIANT>` 公開 teaser SEO 與 GA4 |
| `components/v2/V2QuizFlow.tsx` | `/read/quiz` 公開 V2 quiz entry SEO 與 GA4 |
| `pages/AnswersHub.tsx` | `/answers` 公開答案中心 |
| `public/llms.txt` | 提供 AI 可讀的公開 URL 地圖，僅列公開可引用內容並標記 V2 paid/private 邊界 |

---

## 三、GA4 分析設計

### 3.1 資料來源

| 來源 | 說明 | 對應 GA4 |
|------|------|----------|
| **Runtime gtag wrapper** | 本專案主要事件（測驗、結果、登入、V2 funnel 等） | `utils/analytics.ts` 透過全域 `gtag()` 送 GA4 |
| **gtag** | UTM 著陸、outbound_click、推薦、分享等 | 同一 GA4 資源（`index.html` 內載入 gtag） |

**重要**：GA4 Measurement ID 以 `VITE_GA4_ID` 為主，未設定時 fallback 到 `VITE_FIREBASE_MEASUREMENT_ID`，最後 fallback 到 `G-DM6F27KL8B`。所有 runtime 事件都彙總到同一個 GA4 資源。

### 3.2 事件對照表（簡表）

完整事件與參數見 `docs/GA4_EVENTS_REFERENCE.md`。此處為摘要：

| 事件名稱 | 觸發時機 | 主要參數 | 用途 |
|----------|----------|----------|------|
| `page_view` | 虛擬頁切換（V1 / V1.5）與 `/read`、`/read/quiz`、`/read/<TYPE>-<VARIANT>` | page_name, referrer | 流量、動線 |
| `quiz_start` | 開始測驗 | source, campaign_id | 來源、活動 |
| `quiz_progress` | 答題進度 | question_number, progress_percentage | 完成率、流失 |
| `quiz_abandon` | 中途離開 | abandoned_at_question, progress_percentage | 流失分析 |
| `quiz_completion` | 完成測驗 | mbti_type, time_spent_seconds | 轉換、類型分布 |
| `result_view` | 進入結果頁 | mbti_type | 結果頁流量、類型 |
| `result_share` | 分享結果 | platform, mbti_type | 分享管道 |
| `result_download` | 下載報告／IG 圖 | download_format, mbti_type | 下載行為 |
| `view_item` / `begin_checkout` / `purchase` | V2 paywall view / checkout start / unlock | items, mbti_type, source | V2 商業漏斗 |
| `utm_landing` | UTM 著陸（initUTMTracking） | utm_source, utm_medium, utm_campaign | 來源／活動 |
| `outbound_click` | 外連（訂購、Map、Passport 等） | link_name, section | 導流成效 |
| `referral_landing` | 推薦連結進入 | referral_code 等 | 推薦來源 |
| `referral_conversion` | 推薦對象完成測驗 | 同上 | 推薦轉換 |
| `login` / `line_cta_click` / `discord_join` 等 | 登入、社群 CTA | 見 GA4_EVENTS_REFERENCE | 社群與登入 |

### 3.3 自訂維度建議（GA4 後台設定）

在 GA4 **管理 → 自訂定義 → 自訂維度** 中可建立：

| 維度名稱 | 範圍 | 說明 |
|----------|------|------|
| `mbti_type` | 使用者／事件 | 測驗結果類型（INFP、INTJ 等） |
| `page_path` | 事件 | 虛擬路徑（/、/quiz、/result、/archive、/read、/read/quiz、/read/<type>） |
| `traffic_source` | 使用者／工作階段 | utm_source 或 source |
| `campaign_name` | 事件 | utm_campaign |

（若 Firebase 送出的參數名稱與 GA4 預設不同，需在 GA4 內對應到上述自訂維度。）

### 3.4 建議報表／探索

- **流量**：依 `page_view` 的 page_name 看 intro → quiz → result → archive 動線。
- **轉換**：以 `quiz_completion` 為轉換事件，看來源（utm_source / campaign）、裝置、地區。
- **外連**：以 `outbound_click` 看 link_name、section（訂購、Explore More、Map、Passport）。
- **推薦**：`referral_landing` + `referral_conversion` 看推薦碼成效。
- **MBTI 分布**：以 `quiz_completion` 或 `result_view` 的 mbti_type 做長條圖。

---

## 四、實作檢查清單

### AI SEO

- [x] `public/robots.txt` 已建立並指向 sitemap；已明確允許 `OAI-SearchBot` 並阻擋 `GPTBot`
- [x] `public/sitemap.xml` 已建立，僅列公開可索引頁（首頁、`/explore`、`/answers`、`/read/quiz`、V2 公開 teaser、靜態頁）
- [x] `index.html` 已加入 JSON-LD（WebSite + Organization）
- [x] `V1 / V1.5` 公開入口已補 runtime meta / canonical / JSON-LD
- [x] `/read` fallback 維持 runtime `noindex`；`/read/quiz` 與 `/read/<TYPE>-<VARIANT>` 作為公開 teaser/entry 進 sitemap 與 llms，但付費鎖定章節不可引用
- [x] `/answers` 已有 runtime meta / canonical / JSON-LD + FAQ schema
- [ ] 若有新增公開頁（如 /about、/faq），需更新 sitemap 與 meta

### GA4

- [x] `utils/analytics.ts` 透過全域 `gtag()` 送主要事件到 GA4
- [x] `index.html` 已啟用 GA4 loader，供 utm_landing、outbound_click、`/read` funnel 等使用
- [x] `V1`、`V1.5`、`/read`、`/read/quiz` 已補上 page_view 與 screen_engagement
- [ ] GA4 後台：自訂維度（mbti_type、page_path 等）依需建立
- [ ] GA4 後台：轉換事件將 `quiz_completion` 設為主要轉換（若尚未設定）

---

## 五、相關檔案索引

| 檔案 | 說明 |
|------|------|
| `docs/AI_SEO_GA4_DESIGN.md` | 本設計文件 |
| `docs/GA4_EVENTS_REFERENCE.md` | GA4 事件與參數完整對照 |
| `docs/GA4_ADMIN_SETUP_CHECKLIST.md` | GA4 後台實際設定清單 |
| `docs/AI_SEO_PROPOSAL.md` | 整體 AI SEO 策略（三站、內容） |
| `utils/analytics.ts` | Firebase / GA4 事件實作 |
| `utils/seo.ts` | runtime SEO helper |
| `utils/v2Routes.ts` | `/read` / `/v2` 路徑解析與 canonical 產生 |
| `data/answersHubContent.ts` | `/answers` 固定內容來源 |
| `utils/utmTracking.ts` | UTM 與 outbound_click |
| `utils/referralTracking.ts` | 推薦著陸與轉換 |
| `index.html` | GA4 ID loader（`VITE_GA4_ID` / `VITE_FIREBASE_MEASUREMENT_ID`） |
