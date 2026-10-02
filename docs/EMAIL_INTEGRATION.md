# Email 發送整合說明

## 目前的兩個用途

- 測驗結果信：`POST /api/send-email`，只寄給伺服器驗證過、具已驗證 Email 的 Supabase 登入帳號。標題與內容由伺服器產生。
- V2 付款通知：由 confirmed 訂單觸發，提供報告與「我的報告」登入入口、金額及付款參考碼。寄送紀錄存於私有 `v2_payment_receipts`；失敗不會把成功付款改成失敗。

付款通知不包含可直接解鎖的訂單 proof。客戶須用購買時的同一個帳號登入查看報告。

## 上線必要設定

在 Kiwimu Vercel Production 設定以下 server-only 變數：

| 變數 | 用途 |
|------|------|
| `RESEND_API_KEY` | 郵件服務憑證，只存 Secret 設定，不貼進文件、前端或 Git。 |
| `EMAIL_FROM` | 已在 Resend 驗證網域的寄件人，例如 `Kiwimu <reports@你的網域>`。 |

兩個變數均為必填，不自動退回 `onboarding@resend.dev`。

V2 另須套用 `supabase/migrations/20261002100000_v2_payment_receipts.sql`。共用資料庫先核對 migration history，勿重跑舊 001–005。私有表僅供 service role 使用，瀏覽器不能讀取收件人或寄送紀錄。

新付款建立前會檢查寄信設定與私有表是否可用；缺設定時不建立新訂單。公開 checkout 的兩個 gate 仍由付款文件管理，設定寄信不會自動開啟收費。

## 測驗結果 API

`POST /api/send-email` 必須帶同源 Origin 與 Supabase session 的 Bearer token。前端只傳：

```json
{
  "mbtiType": "ESTJ",
  "variant": "A"
}
```

伺服器以 `auth.getUser` 驗證登入，收件人取自已驗證的帳號 Email。前端傳入的 `to / subject / text / html` 不採用；舊的任意寄信契約已移除。

同一帳號、人格類型與 UTC 日期使用穩定的 Resend 去重鍵。前端 `sendResultEmail` 不阻塞測驗頁面；未登入則不呼叫發信 API。

成功回 `200 { "ok": true }`。未登入回 401，非同源回 403，沒有已驗證 Email 回 422，服務未設定回 503，郵件服務失敗回 502。不回傳 provider 的錯誤內容或收件人。

## V2 付款通知與重試

- confirm、status fallback、匿名舊單保存到帳號，都會嘗試寄付款通知。
- 收件人只能來自訂單 owner 的已驗證 Email，前端不可指定收件人。
- 原子 lease 避免同時寄送；已保存的 sent 狀態不再寄送。暫時失敗可從「我的報告」重試。
- 不確定的寄送嘗試超過 23 小時會轉人工 review，以避免郵件服務去重期限外重複寄信。
- `sent` 表示郵件服務已接受，不代表信件已送進收件匣。目前没有投遞 webhook 或背景重試排程。

## 驗證界線

單元測試使用假的 fetch，不會發送真實郵件。正式啟用前需真人確認：已驗證帳號付款、其他裝置登入取回、收件匣收到通知，以及原付款裝置保存匿名舊單。

程式接線、環境設定、郵件服務接受與收件匣投遞是不同驗收項目，不能以單元測試通過宣稱真人收信完成。
