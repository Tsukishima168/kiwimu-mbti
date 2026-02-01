# Supabase 資料庫內容對照（MBTI Lab）

本專案會用到 **兩個 Supabase 專案**：一個是 MBTI Lab 的「內容庫」（題目、結果、甜點等），一個是月島品牌的「客戶資料庫」（測驗結果同步）。以下說明各庫裡實際存放的資料與讀寫時機。

---

## 一、MBTI Lab 的 Supabase（內容庫）

**環境變數**：`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`  
**用途**：存放測驗題目、MBTI 結果文案、甜點配對、維度說明等「內容」，供前端讀取顯示。

### 1.1 資料表與內容說明

| 資料表 | 說明 | 主要欄位／內容 |
|--------|------|----------------|
| **mbti_questions** | 測驗題目（40 題） | question_id, text, image_url, dimension_pair (EI/SN/TF/JP/AT), weight, option_a/b (label, value), display_order |
| **mbti_results** | 16 種 MBTI 結果文案 | id (如 INTJ), title, summary, quote, keywords[], core_analysis, dimension_analysis (JSONB), strengths[], blind_spots[], career/relationships (JSONB), social_style, growth_advice, soul_questions[], character_image_url, dessert (JSONB), bg_color |
| **mbti_variant_nuances** | A/T 變體差異 | mbti_type, variant (A/T), nuance_text |
| **mbti_character_images** | 角色圖片管理 | mbti_type, image_url, image_alt, cloudinary_id, is_active |
| **mbti_dessert_mappings** | 甜點配對 | mbti_type, dessert_name, dessert_description, dessert_image_url, dessert_cta_link, dessert_series, dessert_quad, drink_a, drink_t, alternative_desserts[] |
| **dimension_explanations** | 維度說明（E/I、S/N 等） | dimension_key, label, explanation_text, display_order |

### 1.2 讀寫時機

- **執行期**：前端 **只讀** 上述表格（經由 `supabase/client.ts` → `utils/dataLoader.ts`）。  
  - 題目：測驗開始時從 `mbti_questions` 載入。  
  - 結果頁：依 MBTI 類型從 `mbti_results`、`mbti_variant_nuances`、`mbti_character_images`、`mbti_dessert_mappings` 組出完整結果與甜點。  
  - 維度說明：從 `dimension_explanations` 載入。
- **寫入**：  
  - **不是** 使用者在網站上操作寫入，而是：  
  - 透過 **遷移腳本** `supabase/scripts/migrate-data.ts`（需 `SUPABASE_SERVICE_ROLE_KEY`）把 `constants.ts` 的題目、結果、維度說明等 **匯入／更新** 到 Supabase。  
  - 或直接在 **Supabase Dashboard → Table Editor** 手動新增、編輯、匯入 CSV。

### 1.3 視圖（選用）

- **mbti_results_full**：結果 + 角色圖 + 甜點配對，一次查完整結果。  
- **mbti_questions_full**：題目 + 選項，依 display_order 排序。

---

## 二、月島品牌的 Supabase（客戶資料庫）

**環境變數**：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`  
**用途**：使用者完成測驗且已登入（有 email）時，將 **MBTI 結果同步到月島**，供甜點店／月島地圖等使用。

### 2.1 寫入的資料表與欄位

| 資料表 | 寫入時機 | 寫入內容 |
|--------|----------|----------|
| **profiles** | 使用者完成測驗並有 email 時（`utils/moonIslandSync.ts` → `saveMBTIToMoonIsland`） | email（主鍵／衝突鍵）, mbti_type（如 INFP）, nickname（選填）, avatar_url（選填）, updated_at |

- 使用 **upsert**，以 `email` 為衝突鍵：同一 email 再次測驗會 **更新** MBTI、暱稱、頭像與更新時間，不會重複一筆。

### 2.2 讀取

- 本專案（MBTI Lab）**不會讀取**月島 Supabase；讀取會在月島甜點店／月島地圖等專案進行。

---

## 三、快速對照：誰寫入、誰讀取

| 資料庫 | 專案內「寫入」 | 專案內「讀取」 |
|--------|----------------|----------------|
| **MBTI Lab Supabase** | 僅遷移腳本或 Dashboard 手動／CSV | 題目、結果、甜點、維度說明（執行期皆讀） |
| **月島 Supabase** | 測驗完成且已登入時寫入/更新 `profiles` | 本專案不讀取 |

---

## 四、內容管理建議

- **改題目、結果文案、甜點、維度說明**：在 **MBTI Lab** 的 Supabase Dashboard → Table Editor 編輯對應表，或執行遷移腳本從 `constants.ts` 同步。  
- **查「誰做了測驗、結果是什麼」**：在 **月島** 的 Supabase Dashboard → `profiles` 查詢。  
- **RLS**：MBTI Lab 的 schema 已設成公開讀、僅管理員可寫；月島端需在該專案內依需求設定 RLS。

更多建表與遷移步驟見：`supabase/migrations/001_initial_schema.sql`、`supabase/READ ME.md`、`SUPABASE_SETUP.md`。
