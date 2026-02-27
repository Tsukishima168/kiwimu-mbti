# 2026-02-27 - Passport 會員認證與資料移轉技術文件

## 1. 核心策略與架構
由於目前 **LINE 登入尚未開通**，Passport 專案已重構為以 **Supabase Auth (Google OAuth) 為核心識別碼** 的架構，並與 Shop (Dessert Booking) 共用 `.kiwimu.com` 下的 SSO Session。

### 兩階段身分認證 (Dual-Auth Strategy)
1. **匿名階段 (Guest Mode)**：
   - 使用者進入頁面時，系統會自動生成一個隨機 UUID 存於 LocalStorage 的 `moonmoon_device_id`。
   - 使用者可在此狀態下進行集章、累積點數。
2. **實體會員階段 (Member Mode)**：
   - 使用者透過 `signInWithGoogle` 登入。
   - 系統取得 Supabase `auth.users` 的真正 `user.id` (UUID)。

---

## 2. 自動資料移轉機制 (Silent Migration)
此邏輯現在由 `SupabaseAuthContext.tsx` 監控。

- **觸發時機**：當 `onAuthStateChange` 偵測到轉為登入狀態時。
- **偵測標記**：檢查 `localStorage` 中的 `moonmoon_passport_migrated_to_supabase` 是否為 `true`。
- **執行內容**：
  1. 呼叫 `migrateFromLocalStorage(userId, localState)`。
  2. 將本地端的印章 (`passport_stamps`)、成就 (`passport_achievements`) 與獎勵 (`passport_rewards`) 寫入資料庫，並將 `user_id` 指向 Supabase UUID。
  3. 將本地端殘餘點數透過 `point_transactions` (action: `migration_merge`) 整併。
  4. 轉移成功後，`markMigratedToSupabase()` 並發送 `kiwimu:passport_migrated` 事件通知 UI。

---

## 3. 重要程式碼變更盤點
- **`src/api/passport.ts`**：所有 API 參數從預想的 `lineUserId` 正式改為 Supabase `userId`。拋棄 `passport_users` 中轉表的查詢，直通實體 ID。
- **`PassportScreen.tsx`**：
  - 加裝 `useSupabaseAuth` 判斷。
  - 當使用者未登入時，顯示 Google Login 引導 Banner。
  - 登入後自動重新整理點數與進度。
- **`passportUtils.ts`**：
  - 更新遺產移轉的識別標記名稱。
  - `setDeviceId` 與 `getDeviceId` 現在優先服務於 Supabase UUID。

---

## 4. 交接注意事項
1. **跨站點點數同步**：Passport 已具備讀取 URL params (`amount`, `action`, `ts`) 的 `handleIncomingPointsSync` 功能，可接收來自 Gacha 或 Map 的重導向點數。
2. **LINE LIFF 角色定位**：`LiffContext` 目前僅負責獲取 LINE 端的名稱與大頭貼作為「視覺裝飾」，不作為資料庫主控。未來 LINE Login 開通後，應透過 Supabase Provider 方式進行 Link Account，不需更動 Passport 現有的 UUID 資料結構。
3. **資料表異動**：建議未來將 `passport_users` 廢棄，直接與 Booking 專案的 `profiles` 表格整合。目前 API 已經實作不依賴該表的查詢邏輯。

---
最後更新：2026-02-27
狀態：已實裝並上線至 Passport 專案。
