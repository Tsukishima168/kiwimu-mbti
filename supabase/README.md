# Supabase 資料庫管理指南

這個資料庫設計讓你可以透過 **Supabase Dashboard** 直接管理所有 MBTI Lab 的內容，包括題目、結果、圖片、甜點配對等。

---

## 🚀 快速開始

### 1. 建立 Supabase 專案

1. 前往 [Supabase Dashboard](https://app.supabase.com)
2. 建立新專案（或使用現有專案）
3. 記下以下資訊：
   - Project URL
   - Anon Key
   - Service Role Key（用於資料遷移）

### 2. 執行資料庫 Migration

在 Supabase Dashboard 的 **SQL Editor** 中：

1. 點擊左側選單的 **SQL Editor**
2. 點擊 **New Query**
3. 複製 `supabase/migrations/001_initial_schema.sql` 的內容
4. 貼上並執行（點擊 **Run**）

這會建立所有需要的表格、索引、觸發器和視圖。

### 3. 設定環境變數

在專案的 `.env` 或 Vercel 環境變數中新增：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 遷移現有資料（可選）

如果你想把 `constants.ts` 中的資料匯入 Supabase：

```bash
# 設定 Service Role Key（僅用於遷移，不要放在前端）
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 執行遷移腳本
npx tsx supabase/scripts/migrate-data.ts
```

---

## 📊 資料庫結構

### 主要表格

| 表格名稱 | 用途 | 管理方式 |
|---------|------|---------|
| `mbti_questions` | 測驗題目（40題） | Supabase Dashboard → Table Editor |
| `mbti_results` | MBTI 結果資料（16種） | Supabase Dashboard → Table Editor |
| `mbti_variant_nuances` | A/T 變體差異 | Supabase Dashboard → Table Editor |
| `mbti_character_images` | 角色圖片管理 | Supabase Dashboard → Table Editor |
| `mbti_dessert_mappings` | 甜點配對 | Supabase Dashboard → Table Editor |
| `dimension_explanations` | 維度說明 | Supabase Dashboard → Table Editor |

---

## 🎨 如何使用 Supabase Dashboard 管理內容

### 修改測驗題目

1. 進入 Supabase Dashboard
2. 點擊左側 **Table Editor**
3. 選擇 `mbti_questions` 表格
4. 找到要修改的題目（可以用 `question_id` 搜尋）
5. 點擊該列進行編輯
6. 修改後點擊 **Save**

**可修改的欄位：**
- `text` - 題目文字
- `image_url` - 題目圖片 URL
- `option_a_label` / `option_b_label` - 選項文字
- `weight` - 題目權重（1 或 2）
- `is_active` - 是否啟用（設為 false 可隱藏題目）

### 修改 MBTI 結果內容

1. 選擇 `mbti_results` 表格
2. 找到要修改的 MBTI 類型（如 `INTJ`）
3. 點擊編輯

**可修改的欄位：**
- `title` - 人格標題
- `summary` - 簡短摘要
- `quote` - 引言
- `keywords` - 關鍵字陣列（點擊可編輯 JSON）
- `core_analysis` - 核心分析
- `strengths` / `blind_spots` - 優勢與盲點陣列
- `career` / `relationships` - JSON 格式的職涯與關係建議
- `soul_questions` - 靈魂拷問陣列

### 更換角色圖片

1. 選擇 `mbti_character_images` 表格
2. 找到對應的 MBTI 類型
3. 修改 `image_url` 欄位
4. 可以新增多個版本，但只有 `is_active = true` 的會顯示

**建議流程：**
1. 先新增新圖片記錄（`is_active = false`）
2. 測試無誤後，將舊圖片設為 `is_active = false`
3. 將新圖片設為 `is_active = true`

### 修改甜點配對

1. 選擇 `mbti_dessert_mappings` 表格
2. 找到對應的 MBTI 類型
3. 修改甜點相關欄位

**可修改的欄位：**
- `dessert_name` - 甜點名稱
- `dessert_description` - 描述
- `dessert_image_url` - 圖片 URL
- `dessert_cta_link` - 連結
- `drink_a` / `drink_t` - A/T 型推薦飲品
- `alternative_desserts` - 替代甜點陣列

### 修改 A/T 變體差異

1. 選擇 `mbti_variant_nuances` 表格
2. 找到對應的 MBTI 類型和變體（A 或 T）
3. 修改 `nuance_text` 欄位

---

## 🔍 使用 SQL Editor 進行進階查詢

### 查看所有啟用的題目

```sql
SELECT * FROM mbti_questions 
WHERE is_active = true 
ORDER BY display_order;
```

### 查看特定 MBTI 類型的完整資料

```sql
SELECT * FROM mbti_results_full 
WHERE id = 'INTJ';
```

### 批量更新圖片 URL

```sql
UPDATE mbti_character_images
SET image_url = REPLACE(image_url, 'old-domain.com', 'new-domain.com')
WHERE mbti_type = 'INTJ';
```

### 查看最近更新的內容

```sql
SELECT id, title, updated_at 
FROM mbti_results 
ORDER BY updated_at DESC 
LIMIT 10;
```

---

## 🔐 權限設定

### Row Level Security (RLS)

所有表格都已啟用 RLS，預設設定為：
- ✅ **公開讀取**：所有人都可以讀取資料
- 🔒 **僅管理員寫入**：需要 Service Role Key 才能寫入

### 如果要允許特定用戶寫入

1. 在 Supabase Dashboard 進入 **Authentication** → **Policies**
2. 選擇對應的表格
3. 建立新的 Policy：

```sql
-- 允許特定 email 的用戶更新
CREATE POLICY "Admin can update" ON mbti_results
FOR UPDATE
USING (auth.jwt() ->> 'email' = 'your-email@example.com');
```

---

## 📝 資料格式說明

### JSONB 欄位格式

**`dimension_analysis`** (在 `mbti_results` 中):
```json
{
  "EI": "內向 (I) 提供深度思考的空間。",
  "SN": "直覺 (N) 讓你總是看向未來。",
  "TF": "思考 (T) 是你過濾雜訊的刀。",
  "JP": "判斷 (J) 讓你執行力如雷。",
  "AT": "面對變數時的穩定程度。"
}
```

**`career`** (在 `mbti_results` 中):
```json
{
  "style": "你是優秀的架構師或策略家...",
  "advice": "你的才華毋庸置疑，但...",
  "suitableJobs": ["系統架構師", "科學家", "策略顧問"]
}
```

**`relationships`** (在 `mbti_results` 中):
```json
{
  "style": "愛情對你來說也是需要優化的系統...",
  "strengths": "你在關係中極度誠實且穩定...",
  "advice": "愛情不是一場辯論賽..."
}
```

### 陣列欄位格式

**`keywords`**, **`strengths`**, **`blind_spots`**, **`soul_questions`**:
```
["關鍵字1", "關鍵字2", "關鍵字3"]
```

在 Supabase Dashboard 中，點擊陣列欄位會開啟 JSON 編輯器。

---

## 🎯 最佳實踐

### 1. 版本控制

每次重大更新時，可以：
- 在 `mbti_results` 的 `version` 欄位標註版本號
- 保留舊版本資料（設 `is_active = false`）

### 2. 測試新內容

1. 先建立測試記錄（`is_active = false`）
2. 在開發環境測試
3. 確認無誤後再啟用

### 3. 備份資料

定期在 Supabase Dashboard 執行：
- **Settings** → **Database** → **Backups**
- 或使用 SQL 匯出：

```sql
-- 匯出所有結果資料
COPY (SELECT * FROM mbti_results) TO '/tmp/mbti_results_backup.csv' WITH CSV HEADER;
```

### 4. 圖片管理

建議使用 Cloudinary 或其他 CDN：
- 上傳圖片到 Cloudinary
- 複製 URL 到 `image_url` 欄位
- 可以在 `cloudinary_id` 欄位記錄 Cloudinary ID，方便管理

---

## 🐛 常見問題

### Q: 修改後前端沒有更新？

A: 檢查：
1. 環境變數是否正確設定
2. `is_active` 是否為 `true`
3. 清除瀏覽器快取
4. 檢查 Supabase 連線狀態

### Q: 如何批量匯入資料？

A: 使用 Supabase Dashboard 的 **Table Editor** → **Insert** → **Import data from CSV**

### Q: 可以同時使用 Supabase 和 constants.ts 嗎？

A: 現行 runtime 以 `constants.ts` 作為 MBTI 題目與結果內容來源；Supabase 用於 moonisland Auth、用戶資料、測驗紀錄與甜點推薦 contract。舊內容庫資料表只作為 retired reference，不再作為前台讀取 fallback。

### Q: 如何限制只有我能編輯？

A: 在 Supabase Dashboard 設定 RLS Policy，只允許你的 email 或特定角色寫入。

---

## 📚 相關檔案

- `supabase/migrations/001_initial_schema.sql` - 資料庫結構
- `utils/supabaseAuthBridge.ts` - moonisland Supabase Auth / SSO 客戶端
- `supabase/user-client.ts` - moonisland `mbti` schema 用戶資料客戶端
- `utils/dataLoader.ts` - 本地內容 + canonical dessert contract 載入器
- `supabase/scripts/migrate-data.ts` - 資料遷移腳本

---

## 🆘 需要幫助？

如果遇到問題：
1. 檢查 Supabase Dashboard 的 **Logs** 查看錯誤
2. 確認環境變數設定正確
3. 檢查 RLS Policy 是否允許讀取
