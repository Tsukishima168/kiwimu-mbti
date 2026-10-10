# MBTI 回歸與通知紀錄檢核

## 自動回歸

`.github/workflows/mbti-regression.yml` 在 PR、main push 及手動執行時使用 Node 24，依序檢查型別、全部單元測試、四組登入／LIFF 設定建置、PWA API 排除規則、鍵盤與 200% 文字放大，以及實際 service worker 更新。

CI 只用假設定與 loopback server。API 由本機 server 回傳測試資料；不代理至正式站、不登入、不付款、不寄信、不發 Discord。瀏覽器阻擋外部請求，通知筆數只表示本機 mock 被呼叫。Actions 固定完整 commit SHA、只有 contents:read，checkout 不保留 Git 憑證。

本機執行：

```bash
npm ci
npm run typecheck
npm test
npm run verify:build-matrix
npm run build
npm run verify:pwa-navigation
npx playwright install chromium
npm run verify:accessibility
npm run verify:v2-experience
npm run verify:pwa-lifecycle
```

本機如使用已安裝 Chrome，可設定 `QA_BROWSER_EXECUTABLE` 為其 executable 路徑。CI 使用 Playwright Chromium。`QA_BASE_REF` 指定 PWA 舊版 Git ref，預設 HEAD；CI 指向 PR base／main push 前的版本。腳本驗證 ref 後在暫存目錄建置舊版與兩份候選版；候選兩版只以 HTML marker 製造不同 precache revision。這是實際瀏覽器 service worker 生命週期測試，不能替代 iPhone Safari／LINE 內建瀏覽器實機簽收。

輸出位於 `.qa-results/`（已忽略）；GitHub artifact 只上傳結果 JSON，報告完整截圖留在執行環境，避免公開付費文字。200% 測試將各元素的計算字級放大兩倍，保留 viewport 與其他尺寸，檢查 320／390／768／1280px。它不是整頁縮放，亦不等同完整 WCAG 或 VoiceOver 認證。鍵盤測試涵蓋三種測驗答題、下一題焦點及報告章節導覽。

PWA 先測前一版至候選版的明確接受／V2 draft 保留，再測候選版之間更新：三種作答畫面延後更新、另一分頁啟用 worker 不重載作答分頁、完成後才允許接受、付款 callback 不被 SPA shell 攔截。已開啟的舊版分頁要重新載入後才會取得新的作答保護；舊版更新提示仍請使用「稍後」。

GitHub 的成功 check 本身不會阻擋 merge。若要禁止略過，店主需將 `MBTI regression / regression` 設為 main 的 required check；這輪不修改 repo rules。

## V2 完整作答與甜點照片

`npm run verify:v2-experience` 以 390px 手機、1280px 桌機、320px 文字200%與橫向視窗走完各40題。檢查連按不重複提交、上一題、手機刷新續答、草稿完成清除、跨段不跳全屏、長題無內部捲軸、慢菜單不阻斷出結果、一次本機通知含40個選項。

照片檢核須確認 img 實際存在且解碼成功；「可見破圖0」不能證明有照片。另外驗菜單503、停滯請求、圖片404及無照片契約的重新載入，再走32個報告型別。共39個瀏覽器案例。菜單与照片、付費權益均為測試資料，不代表真人付款、正式菜單事實或通知已送達；公開菜單与照片需另做唯讀檢查。V2照片仍依現行菜單，不回退到可能不同品項的歷史圖片。

## 商家私有通知摘要（需先部署與設定）

新增 GET `/api/v2/notification-health`，沿用既有 V2 dispatcher，沒有新增 Vercel function。其餘 methods 405；所有回應 no-store、不開 CORS。未設定有效 token 回 503，未授權回 401；認證前不建立 DB client。

1. 在 Vercel **Production、server-only** 設定 `NOTIFICATION_HEALTH_TOKEN`，使用隨機產生的 32–256 字元 token。不能放在 VITE 前綴、網址、聊天或 Git。此設定尚未由本輪代填；不要將 token 開給 Preview。
2. 本機私有環境設定相同值為 `KIWIMU_NOTIFICATION_HEALTH_TOKEN`，再執行 `npm run notifications:health`。腳本只 GET 固定 `https://kiwimu.com/api/v2/notification-health`，拒絕 redirect，10 秒 timeout。不要在 shell 指令參數輸入 token。
3. 檔案儲存到 `.qa-results/notification-health/notifications-<timestamp>.html`。專用目錄需 0700、檔案 0600；拒絕既存檔與 symlink，不覆寫舊報表。用瀏覽器開啟本機檔查看，沒有重送按鈕。

測試報表可用 `node scripts/notification-health.mjs --input <synthetic-summary.json> --output <private-directory>/summary.html`，完全不連網。輸入只能包含 version、generatedAt、scope、providerAcceptanceOnly、三個固定 sources 及其白名單計數；多餘欄位拒絕保存。

摘要只以 HEAD exact count 讀 public 三表；付款信／商家通知使用既有 user-admin，測驗通知使用既有 economy-admin。沒有 SELECT 個資、訂單 ID、payload、收件人，沒有 SQL/RPC 寫入。每表可顯示 unavailable；失敗或 null count 不會假裝成零。

- **服務商已接受**：紀錄狀態 sent；不代表 email 已送到收件匣／Discord 使用者已讀。
- **需要核對**：failed、review、處理超過五分鐘、到期 retry 或 retry_at 缺失。不是互斥類別，不能把這幾項相加當成唯一事故數。
- **尚未到期的 retry**：等待既有操作手冊規定的重試時點；此摘要不觸發任何重送。
- **未建立紀錄的漏送**：三表摘要無法偵測；讀取期間狀態也可能改變，所以不能宣稱「所有付款／測驗通知皆健康」。

核對方式沿用 `docs/QUIZ_NOTIFICATION_RUNBOOK.md`、付款通知既有操作規則。不得直接清除 sending/review 紀錄重送，這會增加重複寄信／通知的風險。

依據：[Playwright CI](https://playwright.dev/docs/ci)、[GitHub Actions 安全指南](https://docs.github.com/en/actions/reference/security/secure-use)。
