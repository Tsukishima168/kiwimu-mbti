# Email 發送整合說明

本專案可透過 **Vercel Serverless API + 郵件服務** 發送 Email。瀏覽器無法直接發信（安全與垃圾信考量），需由後端或 API 代發。

---

## 一、做法概覽

| 做法 | 說明 |
|------|------|
| **Vercel API + Resend**（推薦） | 在 `api/send-email.ts` 用 Resend 發信；設定簡單、免費額度夠用。 |
| Vercel API + SendGrid / Mailgun | 同上，換成其他郵件 API；需自建對應 handler。 |
| Firebase Cloud Functions | 用 Firebase 函數發信；若已用 Vercel API 可不必重複。 |
| Supabase Edge Functions | 用 Supabase 函數發信；同上，擇一即可。 |

本文件與程式以 **Resend** 為例；換成其他服務時，只需改 API 路徑內的實作與環境變數。

---

## 二、環境變數（Vercel）

在 **Vercel 專案 → Settings → Environment Variables** 新增：

| 變數 | 說明 | 取得方式 |
|------|------|----------|
| `RESEND_API_KEY` | Resend API Key | [Resend](https://resend.com) 註冊後，API Keys 頁面建立。 |
| `EMAIL_FROM`（選填） | 寄件人顯示地址 | 例如 `MBTI Lab <noreply@你的網域>`；Resend 免費方案需用其測試網域時可先不設。 |

Resend 免費方案：每月約 3,000 封、需驗證網域才能自訂寄件人；未驗證前可用 `onboarding@resend.dev` 當寄件人做測試。

---

## 三、沒網域時的寄送與垃圾信說明

目前**沒有自訂網域**（例如只用 `xxx.vercel.app`）時：

| 項目 | 說明 |
|------|------|
| **能不能發** | 可以。Resend 未驗證網域時會用預設寄件人（如 `onboarding@resend.dev`），API 照常發信，不會被擋。 |
| **容易被擋／進垃圾信** | 會。寄件人不是你的網域、信內連結是 Vercel 網址時，不少信箱會把信歸類為「不明來源」，較容易進垃圾信匣或被過濾。 |
| **網站網址** | 網站用 `你的專案.vercel.app` 不影響發信；發信看的是 Resend 的寄件人與內容，不是網站網域。 |

**建議**：

- **現階段**：照樣用 Resend 預設寄件人上線，先確認流程與內容沒問題。
- **提醒用戶**：在結果頁或信裡加一句「若沒收到信，請到垃圾信匣找找」。
- **之後有網域**：在 Resend 驗證自訂網域，把 `EMAIL_FROM` 設成 `noreply@你的網域`，信內「回網站看完整結果」連結也會變成你的網域，到達率通常會改善。

---

## 四、API 使用方式

**端點**：`POST /api/send-email`

**Request body（JSON）**：

```json
{
  "to": "user@example.com",
  "subject": "你的靈魂甜點測驗結果",
  "text": "純文字內容（選填）",
  "html": "<p>HTML 內容（選填，與 text 擇一或同時傳）"
}
```

**回應**：  
- 成功：`200` + `{ "ok": true, "id": "..." }`  
- 失敗：`4xx/5xx` + `{ "error": "錯誤訊息" }`

**前端呼叫範例**：

```ts
const res = await fetch('/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: userEmail,
    subject: '你的靈魂甜點 MBTI 結果',
    html: `<p>你的類型：${mbtiType}...</p>`,
  }),
});
```

---

## 五、安全與使用建議

- **不要**從前端開放「任意收件人、任意內容」的發信，容易被濫用或當垃圾信發送端。
- **建議**只允許「發給當前登入用戶的 email」或「固定用途」（例如：測驗結果寄給自己、驗證信、訂閱確認）。必要時在 API 內檢查：收件人是否為登入者 email，或 subject 限定為少數幾種類型。
- **限流**：Vercel 有 invocation 限制；若擔心濫用，可再加 rate limit（例如同一 IP 或同一 user 每分鐘最多 N 封）。
- **API Key**：`RESEND_API_KEY` 僅放在 Vercel 環境變數，不要寫進前端程式碼。

---

## 六、常見情境

| 情境 | 說明 |
|------|------|
| **測驗完成寄結果**（已實作） | **已登入且有 email** 的用戶完成測驗後，自動呼叫 `sendResultEmail()` → `/api/send-email`，寄送結果摘要與「回網站看完整結果」連結。實作：`utils/sendResultEmail.ts`、`App.tsx` 的 `handleQuizComplete`。 |
| 訂閱／活動通知 | 用戶訂閱或報名活動時，發送確認信；內容由後端組好再呼叫 API。 |
| 高級會員／月活動 | 每月活動開始、高級會員權益變更時，對符合條件的用戶發信（需後端或排程撈名單再呼叫 API）。 |

以上情境皆由「你的後端或 API」決定收件人與內容，再呼叫同一支 `send-email` API 即可。

---

## 七、替換成其他郵件服務

若改用 **SendGrid**、**Mailgun**、**Postmark** 等：

1. 在 `api/send-email.ts` 內改為該服務的 SDK 或 REST 呼叫。  
2. 環境變數改為該服務的 API Key 或帳密。  
3. Request body 可維持 `to / subject / text / html`，或依需求擴充。

介面（端點與 body）維持不變，前端不需改動。
