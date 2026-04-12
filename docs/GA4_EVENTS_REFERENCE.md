# GA4 事件與參數對照表（Kiwimu MBTI Lab）

本專案送出的 GA4 事件與建議自訂維度／報表用法。

---

## 一、事件來源

| 來源 | 檔案 | 說明 |
|------|------|------|
| Runtime gtag wrapper | `utils/analytics.ts` | 測驗、結果、登入、頁面瀏覽、V2 funnel 等 |
| gtag | `index.html`、`utils/utmTracking.ts`、`utils/referralTracking.ts`、`utils/campaignTracking.ts`、`utils/marketingPixels.ts` | UTM 著陸、外連、推薦、轉換、行銷 |

**GA4 Measurement ID**：優先讀 `VITE_GA4_ID`，其次 `VITE_FIREBASE_MEASUREMENT_ID`，最後 fallback `G-DM6F27KL8B`

---

## 二、事件清單（依觸發時機）

### 2.1 頁面與動線

| 事件名稱 | 觸發位置 | 參數 | 說明 |
|----------|----------|------|------|
| `page_view` | App.tsx、V2App、V2QuizFlow | page_name, referrer | 虛擬頁：/、/manifesto、/quiz、/result、/archive、/read、/read/quiz、/read/\<TYPE\> |
| `screen_engagement` | App.tsx（離開某 stage 時） | screen_name, engagement_time_seconds, page_name | **各頁停留秒數**；可分析「使用者在哪一頁待最久」 |
| `first_visit` / 工作階段 | GA4 自動 | - | 由 GA4 自動收集 |

### 2.2 測驗流程

| 事件名稱 | 觸發位置 | 參數 | 說明 |
|----------|----------|------|------|
| `quiz_start` | Quiz 開始 | source, campaign_id, timestamp | 開始測驗 |
| `quiz_progress` | 每題／每 N 題 | question_number, total_questions, progress_percentage, time_spent_seconds | 進度與耗時 |
| `quiz_abandon` | 離開未完成 | abandoned_at_question, total_questions, progress_percentage, time_spent_seconds | 流失 |
| `quiz_completion` | 測驗完成 | mbti_type, time_spent_seconds, completion_rate, user_id | 轉換；並寫入 user property mbti_type / mbti_variant |

### 2.3 結果頁

| 事件名稱 | 觸發位置 | 參數 | 說明 |
|----------|----------|------|------|
| `result_view` | Result 掛載 | mbti_type, user_id | 看到結果頁 |
| `result_share` | 分享按鈕 | platform, mbti_type, share_method, user_id | 分享（line／instagram／link／image） |
| `result_download` | 下載報告／IG 圖 | download_format (full／ig_story), mbti_type | 下載行為 |

### 2.4 來源與 UTM

| 事件名稱 | 觸發位置 | 參數 | 說明 |
|----------|----------|------|------|
| `utm_landing` | utmTracking.initUTMTracking | utm_source, utm_medium, utm_campaign, utm_content, utm_term, full_url | UTM 著陸時發送一次 |
| `outbound_click` | utmTracking.trackOutboundClick | link_name, link_url, section, 自訂 | 外連（訂購、Map、Passport、LINE、IG 等） |

### 2.5 推薦

| 事件名稱 | 觸發位置 | 參數 | 說明 |
|----------|----------|------|------|
| `referral_landing` | referralTracking 解析到推薦參數 | referral_code 等 | 經推薦連結進入 |
| `referral_conversion` | 推薦對象完成測驗後回寫 | 同上 | 推薦轉換 |
| `share` | referralTracking.trackShare | method, content_type, mbti_type 等 | 分享行為 |
| `copy_link` | 複製連結 | 同上 | 複製推薦連結 |

### 2.6 登入與社群

| 事件名稱 | 觸發位置 | 參數 | 說明 |
|----------|----------|------|------|
| `login` | analytics.trackUserLogin | method (google／line／anonymous) | 登入 |
| `line_cta_click` | LineCTA | cta_location, mbti_type | LINE CTA 點擊 |
| `discord_join` | 點擊加入 Discord | 自訂 | 加入 Discord |
| `discord_verify_complete` | Discord 驗證完成 | 自訂 | 身份組發放完成 |

### 2.7 按鈕點擊（使用者會點哪些按鈕）

| 事件名稱 | 觸發位置 | 參數 | 說明 |
|----------|----------|------|------|
| `button_click` | Intro / Manifesto / Result / MyArchive / RunTimeline | button_name, button_location, destination_url（選填） | 主要 CTA 與導航按鈕；可分析「哪些按鈕被點最多」 |

**目前追蹤的按鈕範例**：開始測驗、我準備好了、登入／登出、我的檔案館、設定、重測、同象限替換、完整菜單、自動取得 Discord 身份組、分享／下載、時間線／對比分析／統計／設定（檔案館）、返回／開始探索、前往月島甜點店等。重要按鈕同時寫入 Firestore `analytics_events` 供細部分析。

### 2.8 行銷與活動（gtag / 像素）

| 事件名稱 | 觸發位置 | 說明 |
|----------|----------|------|
| `conversion` | marketingPixels（Google Ads） | 轉換像素 |
| `campaign_entry` | campaignTracking | 活動著陸 |
| `quiz_completed` | campaignTracking | 活動內完成測驗 |
| `store_reward_generated` | campaignTracking | 店鋪獎勵產生 |
| FB / TikTok / LINE 等 | marketingPixels | 各平台標準事件 |

### 2.9 V2 商業漏斗

| 事件名稱 | 觸發位置 | 參數 | 說明 |
|----------|----------|------|------|
| `view_item` | `components/v2/V2App.tsx` | items, mbti_type, source | 看見 V2 paywall / 商品頁 |
| `begin_checkout` | `components/v2/V2App.tsx` | items, mbti_type, source, checkout_url | 點擊 V2 解鎖 CTA |
| `purchase` | `components/v2/V2App.tsx` | transaction_id, items, mbti_type, unlock_type, source | V2 解鎖成功（含 Supabase entitlement / dev preview） |

---

## 三、自訂維度建議（GA4 後台）

在 **管理 → 自訂定義 → 自訂維度** 中建立：

| 維度名稱 | 範圍 | 事件參數／User Property | 用途 |
|----------|------|--------------------------|------|
| `mbti_type` | 使用者 或 事件 | mbti_type（如 INFP、INTJ） | 結果類型分布、區隔 |
| `page_path` | 事件 | page_name（/、/quiz、/result、/archive、/read、/read/quiz、/read/\<TYPE\>） | 動線、停留 |
| `traffic_source` | 使用者／工作階段 | utm_source 或第一筆 utm_landing | 來源分析 |
| `campaign_name` | 事件 | utm_campaign | 活動成效 |
| `outbound_section` | 事件 | section（explore-more、result 等） | 外連區塊成效 |
| `screen_name` | 事件 | screen_name（screen_engagement） | 頁面／螢幕名稱，用於停留時間報表 |
| `button_name` | 事件 | button_name（button_click） | 按鈕名稱，用於點擊熱區分析 |
| `button_location` | 事件 | button_location（button_click） | 按鈕所在區塊（如 result_floating_bar、archive_tabs） |

（若 GA4 介面要求「事件參數」名稱，請與上表參數名稱一致；Firebase 送出的參數名即為事件內欄位名。）

---

## 四、建議轉換事件（GA4 後台）

在 **管理 → 轉換** 中可標記：

| 轉換名稱 | 對應事件 | 說明 |
|----------|----------|------|
| 測驗完成 | quiz_completion | 主要轉換 |
| 結果頁瀏覽 | result_view | 次要轉換 |
| 分享結果 | result_share | 參與度 |
| 下載報告 | result_download | 參與度 |
| 外連訂購 | outbound_click（link_name = 訂購相關） | 商業意圖 |
| V2 解鎖開始 | begin_checkout | V2 商業漏斗 |
| V2 解鎖成功 | purchase | V2 商業漏斗 |

---

## 五、建議探索／報表

- **漏斗**：page_view (/) → quiz_start → quiz_progress → quiz_completion → result_view。
- **流失**：quiz_abandon 的 abandoned_at_question、progress_percentage 分布。
- **MBTI 分布**：以 quiz_completion / result_view 的 mbti_type 做長條圖。
- **來源成效**：維度 traffic_source / campaign_name，轉換事件 quiz_completion。
- **外連成效**：事件 outbound_click，維度 link_name、section。

### 五之一、使用者在哪個頁面停留最久（screen_engagement）

1. **GA4**：**報表 → 互動 → 事件**，選事件 `screen_engagement`。  
2. **維度**：在探索或自訂報表中，以 **screen_name**（或 page_name）為維度，以 **engagement_time_seconds** 為指標（加總或平均）。  
3. **探索**：建立「探索」報表，維度 = `screen_name`，指標 = `總停留秒數`（sum of engagement_time_seconds）或 `平均停留秒數`（average），即可看出 /、/manifesto、/quiz、/result、/archive 哪一頁總停留或平均停留最長。  
4. **Firestore**：若需細部時段或使用者級分析，可查詢 `analytics_events` 集合，篩選 `eventName = 'screen_engagement'`，依 `properties.screen_name`、`properties.engagement_time_seconds` 彙總。

### 五之二、使用者會點擊哪些按鈕（button_click）

1. **GA4**：**報表 → 互動 → 事件**，選事件 `button_click`。  
2. **維度**：以 **button_name** 看「哪個按鈕被點最多」；以 **button_location** 看「哪個區塊的按鈕最熱」。  
3. **探索**：建立探索報表，維度 = `button_name`（或 `button_location`），指標 = 事件計數，排序即可得到按鈕點擊排行。  
4. **Firestore**：重要按鈕（如 開始、重測、檔案館、訂購、Discord 等）會寫入 `analytics_events`，可依 `eventName = 'button_click'` 與 `properties.button_name` 做漏斗或再行銷名單。

---

## 六、Firestore 同步

本專案部分事件會寫入 Firestore `analytics_events`（見 `utils/analytics.ts` 的 logToFirestore），用於細部分析或 BigQuery 匯出；GA4 仍為主要報表介面。
