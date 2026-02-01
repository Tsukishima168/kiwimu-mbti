# 📊 MBTI Lab Supabase 資料匯入指南

## ✅ 已完成

1. ✅ 資料庫結構 (`001_initial_schema.sql`)
2. ✅ 維度說明 + INTJ 範例 (`002_seed_data.sql`)
3. ✅ 完整 40 題測驗問題 (`003_seed_all_questions.sql`)

---

## 🎯 接下來請執行

### 步驟 1：匯入完整問題
```sql
-- 在 Supabase SQL Editor 執行
supabase/migrations/003_seed_all_questions.sql
```

### 步驟 2：手動新增剩餘 15 種 MBTI 類型

由於每種 MBTI 類型的完整資料非常龐大（包含詳細的核心分析、職涯建議、關係建議等），建議使用以下兩種方式之一：

#### 方案 A：使用 Supabase Dashboard（推薦新手）

1. 前往 **Table Editor** → `mbti_results`
2. 點擊 **Insert** → **Insert row**
3. 參考提供的 CSV 檔案逐筆新增：
   - `supabase/data/mbti_results_basic.csv` - 基本資訊
   - `supabase/data/dessert_mappings.csv` - 甜點配對

#### 方案 B：使用 CSV 匯入（推薦進階）

1. 開啟 **Table Editor** → 選擇表格
2. 點擊右上角 **⋯** → **Import data from CSV**
3. 上傳對應的 CSV 檔案
4. 對應欄位後點擊 Import

---

## 📁 提供的 CSV 檔案

### 1. `mbti_results_basic.csv`
包含 16 種 MBTI 類型的基本資訊：
- ID, Title, Summary, Quote, Keywords
- Background Color, Character Image URL

### 2. `dessert_mappings.csv`
包含 16 種 MBTI 類型的甜點配對：
- Dessert Name, Description, Image URL
- Series, Quad, Drink recommendations

---

## ⚠️ 注意事項

### 複雜欄位說明

某些欄位因為是 JSON 或 ARRAY 格式，無法直接用 CSV 匯入，需要在 Supabase Dashboard 手動輸入：

#### `mbti_results` 表

**JSON 欄位**（需手動輸入）：
- `dimension_analysis` - 維度分析
- `career` - 職涯建議
- `relationships` - 關係建議

**ARRAY 欄位**（需手動輸入）：
- `keywords` - 關鍵字陣列
- `strengths` - 優勢列表
- `blind_spots` - 盲點列表
- `soul_questions` - 靈魂提問

---

## 🚀 快速測試流程

1. 執行 `003_seed_all_questions.sql`
2. 確認 `mbti_questions` 表有 40 筆資料
3. 手動新增至少 2-3 種 MBTI 類型（用於測試）
4. 在前端測試完整流程

---

## 💡 未來維護

- **修改問題**：編輯 `mbti_questions` 表
- **修改 MBTI 內容**：編輯 `mbti_results` 表
- **修改甜點配對**：編輯 `mbti_dessert_mappings` 表

CSV 檔案僅用於快速批次匯入，實際資料以 Supabase 為準。
