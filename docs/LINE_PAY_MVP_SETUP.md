# LINE Pay MVP 設定

這版是給 V2 paywall 的最小可用流程：

1. 前端點擊 `解鎖我的完整報告`
2. 呼叫 `POST /api/linepay/request`，後端先建立 `line_pay_orders`，並把這次待確認訂單寫入 30 分鐘的 `HttpOnly` pending cookie
3. 後端建立 LINE Pay payment request，回傳 `paymentUrl`；前端保留原報告頁，另開 LINE Pay 付款頁
4. 使用者在 LINE Pay 完成授權
5. 正常 redirect 成功時，LINE Pay 導回 `GET /api/linepay/confirm`，後端 confirm 成功後把正式訂單證明寫入 `HttpOnly` cookie，再 redirect 回 `/read/:mbtiType?unlock=success`
6. 若 sandbox QR / 跨裝置流程沒有導回桌機，使用者回到原報告頁按「我已完成付款，檢查解鎖」；前端呼叫 `POST /api/linepay/status`，後端用 LINE Pay check API 判斷是否可 confirm
7. 前端以同源 POST 驗證正式 cookie；通過後再向 server 取得完整報告，訂單 id 不進頁面 URL 或 GA
8. 若使用者已登入，同步寫回 Supabase `profiles.v2_unlocked_at`
9. 後端同步更新 `public.line_pay_orders`（舊環境 fallback `mbti`），保留 request / confirm / cancel / status fallback 狀態供對帳

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
- LINE Pay v3 的 `transactionId` 可能是 19 位數；server 必須先用 `response.text()` 讀回傳，再把 16 位以上數字轉成字串後 `JSON.parse`，避免 JavaScript 數字精度導致 request 儲存值與 confirm redirect 值不同。

## 本次新增的 API

LINE Pay、V2 與 Economy 各使用一個動態 Vercel entrypoint，公開 URL 維持不變，避免 Hobby plan 的 12 Functions 上限阻擋部署。

- `POST /api/linepay/request`
  - 建立付款請求
  - 先建立 `line_pay_orders`，建單失敗會中止付款請求，避免使用者付款後找不到訂單
  - 寫入 `__Host-kiwimu-v2-pending-order` pending cookie，效期 30 分鐘
  - 回傳 `paymentUrl`；前端在原報告頁顯示「重新開啟付款頁」與「檢查解鎖」
- `POST /api/linepay/status`
  - 只接受同源請求，依 pending cookie 找到待確認訂單
  - 呼叫 LINE Pay `GET /v3/payments/requests/{transactionId}/check`
  - `0000` 保持鎖定；`0110` 立刻 confirm；`0121` / `0122` 清掉 pending 並要求重開付款；`0123` 視為已完成並寫入正式解鎖 cookie
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
- status fallback 只補 LINE Pay sandbox / QR 跨裝置未 redirect 的解鎖確認；真正長期版還要補 webhook、退款與後台 payment details 對帳。
  - refund flow
  - 後台對帳 UI

## 安全提醒

- 不要把 `LINE_PAY_CHANNEL_SECRET` 放進前端
- 不要把金鑰 commit 進 git
- 你剛剛貼過一次 secret，正式上線前一定要 rotate
