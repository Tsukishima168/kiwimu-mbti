# 🎯 MBTI Lab Supabase 資料檔案總覽

## 📁 SQL Migration 檔案（按順序執行）

### ✅ 1. `001_initial_schema.sql`
- 建立所有資料表結構
- 建立索引與 RLS 政策
- **狀態**：已執行成功 ✓

### ✅ 2. `002_seed_data.sql`
- 維度說明（5 筆）
- INTJ 範例資料
- 前 5 題測試問題
- **狀態**：已執行成功 ✓

### ⏳ 3. `003_seed_all_questions.sql`
- **完整 40 題測驗問題**
- 包含 EI, SN, TF, JP, AT 五個維度
- **待執行**：請在 Supabase SQL Editor 執行此檔案

---

## 📊 CSV 資料檔案（供後續編輯）

### 1. `data/mbti_results_basic.csv`
16 種 MBTI 類型的基本資訊：
- ID, 標題, 摘要, 名言
- 關鍵字, 背景色, 角色圖片 URL

### 2. `data/dessert_mappings.csv`
16 種 MBTI 類型的甜點配對：
- 甜點名稱、描述、圖片
- 系列、象限、飲品推薦

---

## 🚦 下一步行動清單

### 立即執行（必要）

1. **執行完整問題 SQL**
   ```bash
   # 在 Supabase SQL Editor 中執行
   003_seed_all_questions.sql
   ```

2. **驗證問題匯入**
   - 前往 Table Editor → `mbti_questions`
   - 確認有 40 筆資料
   - 檢查各維度問題分佈正確

### 後續補充（選擇性）

3. **新增剩餘 15 種 MBTI 類型**
   
   **選項 A - 手動新增**（建議初期）：
   - 在 Supabase Dashboard 逐筆新增
   - 可參考 `mbti_results_basic.csv`
   - 詳細欄位資料需參考 `constants.ts`

   **選項 B - CSV 匯入**（建議批次）：
   - Table Editor → Import from CSV
   - 基本欄位用 CSV
   - JSON/ARRAY 欄位需手動補充

---

## ⚡ 快速測試建議

最小可測試配置：
- ✅ 40 題問題（執行 003）
- ✅ 3-5 種MBTI 類型（手動新增 INTJ, INFP, ENFP 等常見類型）
- ✅ 對應的甜點配對

這樣就可以完整測試前端流程了！

---

## 📝 未來維護方式

### 快速修改（推薦）
- 直接在 Supabase Dashboard 的 Table Editor 編輯
- 視覺化操作，立即生效

### 批次修改
- 匯出為 CSV
- Excel 批次編輯
- 重新匯入

### 版本控制
- 定期備份 SQL
- Git 追蹤 migration 檔案
