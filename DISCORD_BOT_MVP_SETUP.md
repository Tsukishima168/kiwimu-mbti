# Discord Bot MVP 安裝/設定（Vercel Serverless 版）

本 MVP 提供 Slash Commands：
- `/link` `/result` `/unlink` `/help`

並將資料落地到 Firestore（Admin SDK）：
- `discord_link_states`：一次性 state（10 分鐘）
- `discord_links`：`discordUserId ↔ firebaseUid`
- `discord_actions`：事件追蹤（可選但建議）

---

## 1) 你需要提供/設定的 Discord App 資訊

在 Discord Developer Portal：

### 1.1 Application ID
- 對應 env：`DISCORD_APPLICATION_ID`

### 1.2 Public Key（Interactions 驗簽用）
- 對應 env：`DISCORD_PUBLIC_KEY`

### 1.3 Bot Token（註冊 slash commands 用）
- 對應 env：`DISCORD_BOT_TOKEN`
- 注意：**interaction endpoint 本身不一定需要 bot token**；但我們用 script 註冊指令需要。

### 1.4 Guild ID（先用 guild scope 註冊，更新最快）
- 對應 env：`DISCORD_GUILD_ID`

---

## 2) Discord 端設定：Interactions Endpoint URL

把 Interactions endpoint 指到你的 Vercel 網址：
- `https://<your-domain>/api/discord/interaction`

並啟用 `INTERACTIONS ENDPOINT URL`。

---

## 3) Firebase Admin（Serverless 讀寫 Firestore）

你需要在 Vercel 設定 Firebase Admin credential，擇一：

### 方案 A（推薦）：單一 JSON
- env：`FIREBASE_SERVICE_ACCOUNT_JSON`
- 值：Firebase Service Account JSON（整包）

### 方案 B：拆欄位
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`（注意要把 `\n` 處理成換行；程式已自動 replace）

---

## 4) 網站端綁定頁（已做）

`/link` 會給一個連結：
- `https://kiwimu-mbti.vercel.app/?discord_link_state=...`

網站會在帶 `discord_link_state` 時彈出綁定視窗：
- 若未登入 → 引導使用既有 Login
- 已登入 → 呼叫 `/api/discord/link/complete` 完成綁定

---

## 5) 註冊 Slash Commands（一次性）

在本機執行：

```bash
DISCORD_BOT_TOKEN=...
DISCORD_APPLICATION_ID=...
DISCORD_GUILD_ID=...

npx tsx scripts/register-discord-commands.ts
```

（你也可以改成 global commands，但會有快取延遲）

---

## 6) `/result` 如何抓到結果？

目前 Bot 會去 Firestore 的 `test_runs` collection 讀取：
- `where('uid' == firebaseUid)` 抓最近 20 筆，程式會在記憶體排序找最新。

如果你實際結果存在別的 collection，我可以再替換查詢位置。

---

## 7) 安全注意

- 不要把 Service Account JSON 檔放在 repo
- Bot token / private key 只放在 Vercel env

