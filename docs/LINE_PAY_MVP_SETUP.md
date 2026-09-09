# LINE Pay MVP 設定

這版是給 V2 paywall 的最小可用流程：

1. 前端點擊 `解鎖我的完整報告`
2. 呼叫 `POST /api/linepay/request`
3. 後端建立 LINE Pay payment request
4. 使用者在 LINE Pay 完成授權
5. LINE Pay 導回 `GET /api/linepay/confirm`
6. 後端 confirm 成功後把訂單證明寫入 `HttpOnly` cookie，再 redirect 回 `/read/:mbtiType?unlock=success`
7. 前端以同源 POST 驗證 cookie；通過後再向 server 取得完整報告，訂單 id 不進頁面 URL 或 GA
8. 若使用者已登入，同步寫回 Supabase `profiles.v2_unlocked_at`
9. 後端同步更新 `public.line_pay_orders`（舊環境 fallback `mbti`），保留 request / confirm / cancel 狀態供對帳

## 需要的環境變數

```env
V2_CHECKOUT_ENABLED=true
VITE_V2_CHECKOUT_ENABLED=true
LINE_PAY_CHANNEL_ID=your_channel_id
LINE_PAY_CHANNEL_SECRET=your_rotated_secret
LINE_PAY_BASE_URL=https://sandbox-api-pay.line.me
LINE_PAY_API_VERSION=v3
APP_BASE_URL=https://kiwimu.com

# Supabase service role, used only by server API routes.
SUPABASE_USER_URL=https://your-project.supabase.co
SUPABASE_USER_SERVICE_ROLE_KEY=your-service-role-key
```

兩個 checkout 開關必須同時為 `true`：前者保護 server 建單端點，後者在 build-time 顯示付款按鈕。展示測試與尚未完成真人 sandbox 實刷時維持關閉。

備註：

- `LINE_PAY_BASE_URL`
  - sandbox: `https://sandbox-api-pay.line.me`
  - production: `https://api-pay.line.me`
- `APP_BASE_URL`
  - LINE Pay 會用它組 `confirmUrl` / `cancelUrl`
  - 正式環境要填你的實際網域
- `SUPABASE_USER_URL` / `SUPABASE_USER_SERVICE_ROLE_KEY`
  - 這組只給 server API route 使用，不可放到前端
  - 新環境以 `public.line_pay_orders` 為準；程式只為既有資料保留 `mbti.line_pay_orders` fallback

## 本次新增的 API

LINE Pay、V2 與 Economy 各使用一個動態 Vercel entrypoint，公開 URL 維持不變，避免 Hobby plan 的 12 Functions 上限阻擋部署。

- `POST /api/linepay/request`
  - 建立付款請求
  - 先建立 `line_pay_orders`，建單失敗會中止付款請求，避免使用者付款後找不到訂單
  - 回傳 `paymentUrl`
- `POST /api/v2/verify-unlock`
  - 只接受同源請求，驗證 HttpOnly cookie 對應的訂單已 confirmed 且 MBTI 型別相符
- `POST /api/v2/report`
  - 只在登入帳號有同型別 confirmed 訂單，或 cookie／舊版訂單證明有效時回傳 02–08 章全文

- `GET /api/linepay/confirm`
  - 接 LINE Pay redirect
  - 後端做 payment confirm
  - 會比對 `orderId` / `transactionId`，避免錯單 confirm
  - 成功後導回 `/read/:type?unlock=success`

- `GET /api/linepay/cancel`
  - 接 LINE Pay 取消付款 redirect
  - `cancelUrl` 會主動帶 `orderId`，讓取消也能寫回 `status = cancelled`
  - 導回 `/read/:type?checkout=cancelled`

## 需要執行的 Supabase migration

在 Supabase SQL Editor 執行：

```sql
supabase/migrations/005_line_pay_orders_public.sql
```

這會建立：

- `public.line_pay_orders`
- request / confirm / cancel 狀態欄位
- LINE Pay transaction id / return code / response JSON
- 基本查詢索引

## 對帳狀態

- request 成功：`status = requested`
- request 失敗：`status = request_failed`
- 使用者取消：`status = cancelled`
- confirm 成功：`status = confirmed`
- confirm 失敗或 transaction mismatch：`status = confirm_failed`

## 現階段限制

- 付費全文只由 `/api/v2/report` 在驗證訂單後回傳；localStorage 只是 UI cache，不是授權真相。
- `V2_CHECKOUT_ENABLED` 與 `VITE_V2_CHECKOUT_ENABLED` 預設關閉；完成 LINE Pay sandbox 真人實刷與商品效期決策前不要開啟。
- 真正長期版還要補 webhook、退款與後台 payment details 對帳。
  - refund flow
  - 後台對帳 UI

## 安全提醒

- 不要把 `LINE_PAY_CHANNEL_SECRET` 放進前端
- 不要把金鑰 commit 進 git
- 你剛剛貼過一次 secret，正式上線前一定要 rotate
