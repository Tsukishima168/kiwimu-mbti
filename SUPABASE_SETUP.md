# 🚀 Supabase 設定完整指南

這個指南會幫你完成 Supabase 資料庫的設定，讓你可以透過 Supabase Dashboard 管理所有 MBTI Lab 的內容。

---

## 📋 步驟 1：建立 Supabase 專案

1. 前往 [Supabase Dashboard](https://app.supabase.com)
2. 點擊 **New Project**
3. 填寫專案資訊：
   - **Name**: `kiwimu-mbti-lab` (或你喜歡的名稱)
   - **Database Password**: 記下這個密碼（之後會用到）
   - **Region**: 選擇離你最近的區域（建議 `Southeast Asia (Singapore)`）
4. 點擊 **Create new project**
5. 等待專案建立完成（約 2-3 分鐘）

---

## 📋 步驟 2：執行資料庫 Migration

1. 在 Supabase Dashboard，點擊左側選單的 **SQL Editor**
2. 點擊 **New Query**
3. 開啟專案中的 `supabase/migrations/001_initial_schema.sql`
4. 複製整個檔案內容
5. 貼上到 SQL Editor
6. 點擊 **Run** 或按 `Cmd/Ctrl + Enter`
7. 應該會看到 "Success. No rows returned" 的訊息

✅ **完成！** 你現在應該可以看到左側選單的 **Table Editor** 中有以下表格：
- `mbti_questions`
- `mbti_results`
- `mbti_variant_nuances`
- `mbti_character_images`
- `mbti_dessert_mappings`
- `dimension_explanations`

---

## 📋 步驟 3：取得 API Keys

1. 在 Supabase Dashboard，點擊左側選單的 **Settings** (⚙️)
2. 點擊 **API**
3. 記下以下資訊：
   - **Project URL** (例如：`https://xxxxx.supabase.co`)
   - **anon public** key (在 **Project API keys** 區塊)
   - **service_role** key (在 **Project API keys** 區塊，⚠️ 這個要保密)

---

## 📋 步驟 4：設定環境變數

### 在本地開發

建立 `.env` 檔案（如果還沒有）：

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 在 Vercel

1. 前往你的 Vercel 專案
2. 點擊 **Settings** → **Environment Variables**
3. 新增以下變數：
   - `VITE_SUPABASE_URL` = 你的 Project URL
   - `VITE_SUPABASE_ANON_KEY` = 你的 anon key
4. 選擇要套用的環境（Production, Preview, Development）
5. 點擊 **Save**

---

## 📋 步驟 5：遷移現有資料（可選）

如果你想將 `constants.ts` 中的資料匯入 Supabase：

### 方法 1：使用遷移腳本（推薦）

```bash
# 1. 安裝依賴（如果還沒有）
npm install

# 2. 設定 Service Role Key（僅用於遷移）
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 3. 執行遷移
npx tsx supabase/scripts/migrate-data.ts
```

### 方法 2：手動匯入（透過 Supabase Dashboard）

1. 進入 **Table Editor**
2. 選擇要匯入的表格（例如 `mbti_questions`）
3. 點擊 **Insert** → **Import data from CSV**
4. 準備 CSV 檔案並上傳

---

## 📋 步驟 6：測試連線

1. 啟動開發伺服器：
   ```bash
   npm run dev
   ```

2. 打開瀏覽器開發者工具的 **Console**
3. 應該會看到 Supabase 連線狀態（如果設定正確）

4. 測試測驗功能：
   - 進入測驗頁面
   - 如果 Supabase 可用，會從 Supabase 載入題目
   - 如果 Supabase 不可用，會自動 fallback 到 `constants.ts`

---

## 🎨 開始使用 Supabase Dashboard 管理內容

### 修改題目

1. 進入 **Table Editor** → `mbti_questions`
2. 找到要修改的題目（可以用搜尋功能）
3. 點擊該列進行編輯
4. 修改後點擊 **Save**

### 修改結果內容

1. 進入 **Table Editor** → `mbti_results`
2. 找到要修改的 MBTI 類型（如 `INTJ`）
3. 點擊編輯
4. 修改任何欄位（包括 JSON 欄位）
5. 點擊 **Save**

### 更換圖片

1. 進入 **Table Editor** → `mbti_character_images`
2. 找到對應的 MBTI 類型
3. 修改 `image_url` 欄位
4. 點擊 **Save**

**提示：** 可以同時有多個圖片版本，但只有 `is_active = true` 的會顯示。

---

## 🔍 驗證設定是否成功

### 檢查 1：環境變數

在瀏覽器 Console 執行：
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '已設定' : '未設定');
```

### 檢查 2：Supabase 連線

在瀏覽器 Console 執行：
```javascript
import { isSupabaseAvailable } from './supabase/client';
console.log('Supabase 可用:', isSupabaseAvailable());
```

### 檢查 3：資料讀取

1. 進入測驗頁面
2. 打開 Network 標籤
3. 應該會看到對 Supabase 的 API 請求

---

## 🐛 常見問題

### Q: 修改後前端沒有更新？

**A:** 檢查以下幾點：
1. 確認 `is_active = true`
2. 清除瀏覽器快取
3. 檢查 Supabase Dashboard 的 **Logs** 查看是否有錯誤
4. 確認環境變數設定正確

### Q: 出現 "Row Level Security" 錯誤？

**A:** 檢查 RLS Policy：
1. 進入 **Authentication** → **Policies**
2. 確認有 "Public read access" policy
3. 如果沒有，執行以下 SQL：

```sql
CREATE POLICY "Public read access" ON mbti_questions FOR SELECT USING (true);
-- 對其他表格也執行相同操作
```

### Q: 遷移腳本執行失敗？

**A:** 檢查：
1. Service Role Key 是否正確
2. 是否已經執行過 migration（表格已存在）
3. 查看錯誤訊息，可能是資料格式問題

### Q: 可以同時使用 Supabase 和 constants.ts 嗎？

**A:** 可以！系統設計為：
- 優先使用 Supabase（如果可用）
- 如果 Supabase 不可用或查詢失敗，自動 fallback 到 `constants.ts`

這樣可以確保即使 Supabase 出問題，網站仍能正常運作。

---

## 📚 下一步

- 閱讀 `supabase/README.md` 了解詳細的管理方式
- 開始在 Supabase Dashboard 編輯內容
- 建立自己的後台管理介面（可選）

---

## 🆘 需要幫助？

如果遇到問題：
1. 檢查 Supabase Dashboard 的 **Logs**
2. 查看瀏覽器 Console 的錯誤訊息
3. 確認所有環境變數都已設定
4. 參考 `supabase/README.md` 的詳細說明
