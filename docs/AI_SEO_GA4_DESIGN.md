# AI SEO 與 GA4 分析設計（本專案）

本文件定義 **Kiwimu MBTI Lab** 專案內的 AI SEO 與 GA4 分析架構，方便實作與維護。

---

## 一、架構總覽

| 區塊 | 目的 | 產出／實作位置 |
|------|------|----------------|
| **AI SEO** | 讓 Google／爬蟲／AI 可抓取、可理解、敢引用 | sitemap、robots、meta、JSON-LD、虛擬頁面追蹤 |
| **GA4** | 流量、轉換、行為、來源分析 | Firebase Analytics（= GA4）、事件、自訂維度、報表建議 |

---

## 二、AI SEO 設計

### 2.1 可抓取（Crawl）

| 項目 | 說明 | 檔案／位置 |
|------|------|------------|
| **sitemap.xml** | 列出希望被收錄的 URL | `public/sitemap.xml` |
| **robots.txt** | 不擋重要路徑、指向 sitemap | `public/robots.txt` |
| **主站 URL** | 單頁應用僅一入口，sitemap 以首頁為主 | `https://kiwimu.com/` |

**注意**：本專案為 SPA，目前可索引的「頁面」主要是首頁；虛擬路由（intro／quiz／result／archive）透過 GA4 的 `page_view` 事件追蹤，不另做實體 URL。若未來新增 SSG 的公開頁（如 `/about`、`/faq`），再將該等 URL 加入 sitemap。

### 2.2 可理解（Understand）

| 項目 | 說明 | 實作位置 |
|------|------|----------|
| **Meta 標籤** | title、description、og、twitter | `index.html` |
| **JSON-LD** | WebSite + Organization，讓搜尋／AI 理解品牌與網站類型 | `index.html`（見下方結構） |
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
| `public/robots.txt` | 允許爬蟲、指向 sitemap |
| `public/sitemap.xml` | 首頁 + 靜態頁（如 privacy） |
| `index.html` | meta、JSON-LD、GA4 gtag |

---

## 三、GA4 分析設計

### 3.1 資料來源

| 來源 | 說明 | 對應 GA4 |
|------|------|----------|
| **Firebase Analytics** | 本專案主要事件（測驗、結果、登入等） | 透過 `measurementId: G-2NBWRX24YR` 送 GA4 |
| **gtag** | UTM 著陸、outbound_click、推薦、分享等 | 同一 GA4 資源（index.html 內載入 gtag） |

**重要**：Firebase 與 gtag 使用**同一個 GA4 Measurement ID**（`G-2NBWRX24YR`），事件會彙總到同一 GA4 資源。

### 3.2 事件對照表（簡表）

完整事件與參數見 `docs/GA4_EVENTS_REFERENCE.md`。此處為摘要：

| 事件名稱 | 觸發時機 | 主要參數 | 用途 |
|----------|----------|----------|------|
| `page_view` | 虛擬頁切換（intro／quiz／result／archive） | page_name, referrer | 流量、動線 |
| `quiz_start` | 開始測驗 | source, campaign_id | 來源、活動 |
| `quiz_progress` | 答題進度 | question_number, progress_percentage | 完成率、流失 |
| `quiz_abandon` | 中途離開 | abandoned_at_question, progress_percentage | 流失分析 |
| `quiz_complete` | 完成測驗 | mbti_type, time_spent_seconds | 轉換、類型分布 |
| `result_view` | 進入結果頁 | mbti_type | 結果頁流量、類型 |
| `result_share` | 分享結果 | platform, mbti_type | 分享管道 |
| `result_download` | 下載報告／IG 圖 | download_format, mbti_type | 下載行為 |
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
| `page_path` | 事件 | 虛擬路徑（/、/quiz、/result、/archive） |
| `traffic_source` | 使用者／工作階段 | utm_source 或 source |
| `campaign_name` | 事件 | utm_campaign |

（若 Firebase 送出的參數名稱與 GA4 預設不同，需在 GA4 內對應到上述自訂維度。）

### 3.4 建議報表／探索

- **流量**：依 `page_view` 的 page_name 看 intro → quiz → result → archive 動線。
- **轉換**：以 `quiz_complete` 為轉換事件，看來源（utm_source / campaign）、裝置、地區。
- **外連**：以 `outbound_click` 看 link_name、section（訂購、Explore More、Map、Passport）。
- **推薦**：`referral_landing` + `referral_conversion` 看推薦碼成效。
- **MBTI 分布**：以 `quiz_complete` 或 `result_view` 的 mbti_type 做長條圖。

---

## 四、實作檢查清單

### AI SEO

- [x] `public/robots.txt` 已建立並指向 sitemap
- [x] `public/sitemap.xml` 已建立（首頁 + 靜態頁）
- [x] `index.html` 已加入 JSON-LD（WebSite + Organization）
- [ ] 若有新增公開頁（如 /about、/faq），需更新 sitemap 與 meta

### GA4

- [x] Firebase Analytics 使用 `G-2NBWRX24YR`，事件送 GA4
- [x] `index.html` 已啟用 gtag 同 ID，供 utm_landing、outbound_click 等使用
- [ ] GA4 後台：自訂維度（mbti_type、page_path 等）依需建立
- [ ] GA4 後台：轉換事件將 `quiz_complete` 設為主要轉換（若尚未設定）

---

## 五、相關檔案索引

| 檔案 | 說明 |
|------|------|
| `docs/AI_SEO_GA4_DESIGN.md` | 本設計文件 |
| `docs/GA4_EVENTS_REFERENCE.md` | GA4 事件與參數完整對照 |
| `docs/AI_SEO_PROPOSAL.md` | 整體 AI SEO 策略（三站、內容） |
| `utils/analytics.ts` | Firebase / GA4 事件實作 |
| `utils/utmTracking.ts` | UTM 與 outbound_click |
| `utils/referralTracking.ts` | 推薦著陸與轉換 |
| `firebase.ts` | measurementId（= GA4 ID） |
