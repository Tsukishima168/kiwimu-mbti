# Supabase 資料庫內容對照（MBTI Lab）

本專案現行 runtime 統一接 **moonisland Supabase**。舊的 MBTI Lab 內容庫（`uvddrlkmdvbuxlyjjpao`）只保留為 retired reference，不再是前台登入、用戶資料、甜點推薦或測驗內容讀取主線。

---

## 一、測驗內容來源

**執行期來源**：`constants.ts` + `utils/dataLoader.ts`
**用途**：測驗題目、MBTI 結果文案、維度說明等內容由本地常數載入，不再由前端直接查舊內容庫。

甜點推薦不從舊 `mbti_dessert_mappings` 讀，改走 canonical menu contract：

```text
kiwimu.com /api/mbti-dessert
→ shop canonical contract
→ moonisland: mbti_menu_links + menu_items + menu_variants
```

## 二、moonisland Supabase（現行主庫）

**Project ID**：`xlqwfaailjyvsycjnzkz`
**Auth env**：`VITE_MOON_ISLAND_SUPABASE_URL`、`VITE_MOON_ISLAND_SUPABASE_ANON_KEY`
**User DB env**：`VITE_SUPABASE_USER_URL`、`VITE_SUPABASE_USER_ANON_KEY`（fallback 到 `VITE_MOON_ISLAND_SUPABASE_*`）

### 2.1 Auth / SSO

| client | 用途 |
|---|---|
| `utils/supabaseAuthBridge.ts` | Supabase Auth shared cookie session、OAuth callback、`update_last_seen`、`insert_user_event` |
| `utils/authStorage.ts` | `.kiwimu.com` shared cookie storage，和 passport / shop / map / gacha 共用 session |

### 2.2 MBTI 用戶資料（schema: `mbti`）

| 資料表 | 寫入 / 讀取內容 |
|---|---|
| `mbti.users` | 用戶基本資料、profile、last_active_at |
| `mbti.quiz_progress` | 測驗進度 |
| `mbti.test_runs` | 測驗結果、分數、MBTI 類型、分享資訊 |
| `mbti.share_links` | 分享連結索引 |
| `mbti.user_behaviors` | 行為資料 |
| `mbti.user_stats` | 統計摘要 |

### 2.3 月島共享資料（public schema）

| 資料表 | 用途 |
|---|---|
| `profiles` | 全站共用 profile / MBTI type / last_seen |
| `user_events` | 跨站事件，例如 `quiz_completed`、`site_visited` |
| `mbti_claims` | MBTI claim code / passport stamp bridge |
| `mbti_menu_links` | MBTI 類型對應 canonical menu item |
| `menu_items` / `menu_variants` | 甜點商品與規格 |

## 三、retired legacy 內容庫

舊 MBTI Lab Supabase 曾包含：

- `mbti_questions`
- `mbti_results`
- `mbti_variant_nuances`
- `mbti_character_images`
- `mbti_dessert_mappings`
- `dimension_explanations`

這些表現在只作為歷史參考。不要新增前台 runtime 依賴。

---

## 四、快速對照

| 類型 | 現行來源 |
|---|---|
| 登入 | moonisland Supabase Auth |
| 用戶資料 / 測驗紀錄 | moonisland `mbti` schema |
| 跨站 profile / events | moonisland `public.profiles`、`public.user_events` |
| 題目 / 結果內容 | 本地 constants |
| 靈魂甜點推薦 | moonisland canonical menu contract |

---

## 五、內容管理建議

- **改題目 / 結果文案**：改 `constants.ts` 與相關版本資料，再跑前端驗證。
- **改甜點推薦**：改 moonisland 的 `mbti_menu_links` / `menu_items` / `menu_variants`。
- **查誰做了測驗**：查 moonisland `mbti.test_runs` 與 `public.profiles`。
- **登入問題**：先查 `utils/supabaseAuthBridge.ts`、Supabase Auth Redirect URLs、`.kiwimu.com` shared cookie。

更多主庫架構見：`/Users/pensoair/Desktop/Web-Projects/sites/shop-kiwimu-com/docs/2026-04-08-supabase-architecture.md`。
