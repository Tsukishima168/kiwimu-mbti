# 三版本測驗完成通知

V1／V2 共用既有 `queueMbtiCompleted` 作答完成出口；V1.5 使用五題的選項 index。
伺服器重新計算型別，接受匿名回報；通知不依賴 Economy rollout／積分成功。
凍結的 App.tsx 等五檔未修改；舊 `sendDiscordNotification` 保留相容 export，實際 result-only 發送已停用以避免雙重通知。

## 上線順序

1. 經店主同意，使用 migration 流程只套用 `20261009090000_quiz_completion_notifications.sql`。不要直接用 SQL editor／execute_sql 變更 schema，也不要盲目套用其他尚未對齊的 migration。
2. 核對正式環境既有 `SUPABASE_USER_URL`／`SUPABASE_USER_SERVICE_ROLE_KEY`，專案限定 `xlqwfaailjyvsycjnzkz`；不在聊天或 Git 放任何值。
3. 核對 `DISCORD_BOT_TOKEN`（或既有 `DISCORD_TOKEN`）及頻道設定。
   完成通知依 `DISCORD_CHANNEL_ID` → 已設定的 `DISCORD_PAYMENT_CHANNEL_ID` → 舊 fallback 決定。
   若有 `DISCORD_DETAIL_CHANNEL_ID`／`DISCORD_EVENTS_CHANNEL_ID`，另送該頻道；同頻道只送一次。
4. 確認 migration 後才合併／部署。缺表或預留失敗會 fail closed，回報 503 並保留有界 outbox，不送 Discord。
5. 由店主完成正式站三個測驗各一次，在指定私人頻道確認收到正確版本／型別；這才是實際送達驗收。

只有 `VERCEL_ENV=production` 且來源為 kiwimu.com／www.kiwimu.com 的完成請求會送出。
Preview／本機回傳 `disabled`，不讀寫正式資料或發送訊息。正式付款通知保持原有鏈路，未修改價格、付款憑證或解鎖邏輯。

## 安全與送達語意

- 通知文字明確為「測驗完成回報」，不宣稱新增會員、真實人類驗證或已付款。
- 不向 Discord 傳帳號、姓名、Email、電話、IP、答案、來源自由文字或任何憑證；禁 mentions。
- 表格只保存 completion UUID、答案證據 hash、成功頻道及送達狀態；rate 表只含以 bot secret 做用途隔離 HMAC 的 IP 摘要與計數，過期 rate keys 在下一次 reservation 清理。
- 原子 RPC 為 SECURITY INVOKER，只有 service_role 可執行；兩張新表 RLS+FORCE，anon/authenticated 沒有讀寫或 RPC 權限。
- 每來源 IP 每小時 12 個、全站每小時 600 個邏輯完成回報，三版本共用。相同 ID 不再次耗用額度；已登入者也不能靠重試洗版。共享網路過量會延後通知，測驗結果仍立即顯示。
- 成功／不確定送達均不自動再送；Discord nonce 只是額外短期保護，永久 ID 紀錄才是持久去重。
- 明確 HTTP 429 才可於 Retry-After 到期後重新 claim；逐頻道保存已成功者，只重送未接受的頻道。
- `sending` 回非 terminal retry，避免另一分頁先清掉 outbox；不重新 claim、不發重複訊息。程序中斷留下的 sending、review 需要人工查看，不自动重送。
- 瀏覽器 outbox 限 20 筆、24 小時、最多 10 次嘗試。禁止儲存時使用本次頁面的記憶體 fallback；關頁會失去此 fallback。
- 不保證每個回報必達：斷網太久、程序中斷、權限錯誤或 delivery review 仍需要處理；不影響完成測驗或付款。
- completion IDs 不自動刪除，以防延後重放；若未來建立清理政策，需一起設計 ID 有效期與重放保護。

## 本機驗證（合成資料）

Node 24：`npm test`、`npm run typecheck`、`npm run build`。
SQL fixture 使用獨立 PostgreSQL 17、固定 loopback port 56379、測試帳號 codex_quiz_test／資料庫 kiwimu_quiz_notifications_test；不讀任何 .env* 或正式資料。

```sh
initdb -D /tmp/kiwimu-quiz-pg -A trust -U codex_quiz_test
pg_ctl -D /tmp/kiwimu-quiz-pg -l /tmp/kiwimu-quiz-pg.log -o '-p 56379 -h 127.0.0.1' start
psql -h 127.0.0.1 -p 56379 -U codex_quiz_test -d postgres -c 'CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;'
createdb -h 127.0.0.1 -p 56379 -U codex_quiz_test kiwimu_quiz_notifications_test
psql -h 127.0.0.1 -p 56379 -U codex_quiz_test -d kiwimu_quiz_notifications_test -v ON_ERROR_STOP=1 -f supabase/migrations/20261009090000_quiz_completion_notifications.sql
python3 supabase/tests/quiz_notifications_local.py
pg_ctl -D /tmp/kiwimu-quiz-pg stop
```

Fixture 會清空上述測試庫的兩張新表，拒絕不同資料庫／使用者；檢查並行 replay、IP／全站上限、角色權限／RLS、service_role 寫入、窗口過期及 provider 429 再 claim 競態。
真人 Safari／LINE 內建瀏覽器、正式 Discord bot 頻道權限與實際送達仍需店主驗收；mock 與桌面 Chrome 手機 viewport 並非真人驗收。
