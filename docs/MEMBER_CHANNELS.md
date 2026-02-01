# 會員資訊通道（通往各專案）

本文件說明 **MBTI Lab 的會員資訊** 如何通往桌面上的四個專案：`moon_passport`、`moon_map`、`dessert_booking`、`penso_good_blog`。會員資訊需要「通道」才能在各專案間共用或讀取。

---

## 一、本專案（MBTI Lab）的會員資訊來源

| 來源 | 內容 | 說明 |
|------|------|------|
| **Firebase Auth** | uid, email, displayName, photoURL, isAnonymous, provider | 登入身份。 |
| **Firestore**（本專案） | `users`：用戶資料、isProfileSetup、displayName 等；`test_runs`：測驗紀錄（mbti 類型、變體、時間）；`analytics_events`：事件紀錄 | 會員檔案與測驗歷史。 |
| **月島 Supabase**（`profiles`） | email, mbti_type, nickname, avatar_url, updated_at | 本專案在「測驗完成且已登入有 email」時寫入，供月島相關專案讀取。 |

以上即「會員資訊」的定義；通道的目的就是讓 **moon_passport、moon_map、dessert_booking、penso_good_blog** 能取得或同步這些資訊。

---

## 二、四個專案與通道對照

| 專案（桌面） | 可能需要的會員資訊 | 建議通道方式 | 備註 |
|--------------|--------------------|--------------|------|
| **1. moon_passport** | 身份（email/uid）、MBTI 類型、暱稱、頭像；必要時測驗紀錄 | 共用 **月島 Supabase** `profiles` 讀取；或本專案提供 **API** 查詢 | 甜點護照／會員卡；與月島品牌統一身份與 MBTI。 |
| **2. moon_map** | MBTI 類型、email、暱稱（地圖顯示／推薦） | 已寫入 **月島 Supabase** `profiles`；moon_map 直接連同一 Supabase 讀取 | 目前連結為 `moon-map-original.vercel.app?mbti=xxx`，可改為依 email 從 profiles 取 mbti。 |
| **3. dessert_booking** | 身份、MBTI（訂單／推薦甜點）、聯絡方式 | 共用 **月島 Supabase** `profiles`；或由本專案 **API** 回傳會員＋MBTI | 訂位／訂購時帶入會員與靈魂甜點類型。 |
| **4. penso_good_blog** | 若要做「登入會員看文／留言」：uid、email、displayName | **Firebase Auth 共用**（同一 Firebase 專案）＋ Firestore 或月島 Supabase 視需求 | 部落格會員與 MBTI Lab 可同一套登入；需在 blog 專案接 Firebase。 |

---

## 三、通道方案概覽

### 3.1 共用月島 Supabase（profiles）

- **適用**：moon_passport、moon_map、dessert_booking。
- **做法**：MBTI Lab 測驗完成時已寫入 `profiles`（email, mbti_type, nickname, avatar_url）。各專案使用同一組 **NEXT_PUBLIC_SUPABASE_URL**、**NEXT_PUBLIC_SUPABASE_ANON_KEY**（或各自 env 指向同一月島 Supabase），讀取 `profiles`。
- **優點**：單一來源、不需重複同步；各專案用同一張「會員＋MBTI」表。
- **注意**：RLS 需設定好（例如僅能讀自己的 profile，或以 email 為準）。

### 3.2 本專案提供 API（會員資訊查詢）

- **適用**：任一專案若不想直接連 Firebase／Supabase，改由 MBTI Lab 代查。
- **做法**：在 MBTI Lab 的 `api/` 下新增例如 `api/member-info.ts`，接受 token 或 email，回傳該會員的 MBTI、暱稱等（從 Firestore 或月島 Supabase 查）。
- **優點**：各專案只打一個 API，權限與邏輯集中在 MBTI Lab。
- **缺點**：多一層依賴與維護。

### 3.3 共用 Firebase Auth（＋ Firestore）

- **適用**：penso_good_blog 或任一需「登入即會員」的專案。
- **做法**：各專案使用 **同一 Firebase 專案**（同一 `apiKey`、`authDomain` 等），登入後取得同一 uid；會員資料可放在 Firestore `users` 或月島 Supabase，依產品需求擇一或並存。
- **優點**：一次登入，MBTI Lab 與 blog（或其它專案）皆為同一用戶。

### 3.4 檔案／匯出（離線或排程）

- **適用**：報表、備份、離線分析。
- **做法**：定期自 Firestore 或月島 Supabase 匯出會員／測驗資料（CSV、JSON），供桌面或其它系統使用。不即時，但簡單。
- **備註**：不算「即時通道」，但可當作會員資訊的備援或分析用。

---

## 四、建議實作順序

1. **確認月島 Supabase** 的 `profiles` 結構與 RLS 可被 moon_passport、moon_map、dessert_booking 讀取（依 email 或 uid 對應）。
2. **moon_map**：已用連結帶 `mbti`；可改為依登入身份從 `profiles` 取 mbti，避免只靠 query 參數。
3. **moon_passport**、**dessert_booking**：接上同一月島 Supabase，讀 `profiles` 取得會員與 MBTI。
4. **penso_good_blog**：若需會員功能，接同一 Firebase Auth（＋ 必要時 Firestore 或 Supabase）。

若之後要改為「由 MBTI Lab 統一提供 API」再讓各專案呼叫，可在本專案加 `api/member-info.ts`，並在本文更新通道表。

---

## 五、專案路徑對照（桌面）

| 專案名稱 | 說明 |
|----------|------|
| moon_passport | 月島甜點護照／會員護照 |
| moon_map | 月島地圖（目前連結：moon-map-original.vercel.app） |
| dessert_booking | 甜點訂購／訂位 |
| penso_good_blog | 部落格 |

會員資訊的「通道」即：上述任一專案如何取得「來自 MBTI Lab 或月島 Supabase 的會員與 MBTI 資料」；優先以 **共用月島 Supabase profiles** 為主，必要時再補 API 或 Firebase 共用。
