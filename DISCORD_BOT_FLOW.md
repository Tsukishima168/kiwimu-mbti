# Discord Bot 全流程（審核版）

本文件描述 **Discord Bot** 在 KIWIMU MBTI Lab 的完整用戶旅程、資料落地策略、以及需要的 API 端點與事件追蹤。

---

## 1) 你的問題：Discord 用戶使用會留存使用者資料嗎？

### 1.1 Discord 本身會「有資料」，但你不會自動拿到「全部帳號對應」
- **Discord 伺服器本身**：當用戶加入你的 Server，Discord 會有該用戶的帳號資料（Discord 平台內）。
- **你的 Bot**：只有在你授權並且呼叫 API / 接收事件時，才會「看到」部分資料（例如 `discordUserId`, `username`, `global_name`, `avatar`, `guildId`）。
- **你自己的資料庫**：是否「留存」完全取決於你是否把這些資料寫入 Firebase / Supabase。

### 1.2 「全部帳號對應到網站會員」只有在這種情況成立
- 用戶 **必須完成綁定**（Link Flow）：`discordUserId ↔ firebaseUid`（或 `supabaseUserId`）
- 否則你最多只能知道「某個 Discord user」使用了指令，但不知道他是你網站哪位會員。

### 1.3 建議你實作的最小留存（合規、可用）
- **必存**
  - `discordUserId`
  - `guildId`
  - `linked_firebase_uid`（綁定後）
  - `linkedAt`, `unlinkedAt`
- **選存（用於體驗）**
  - `username` / `global_name`
  - `avatar`
- **不建議存**
  - 私訊內容、聊天內容（除非你有非常明確用途與告知）

---

## 2) 用戶旅程總覽（Discord → 綁定 → 查結果 → 分享/回流）

### 2.1 Mermaid 流程圖（建議直接貼到 GitHub 可視化）

```mermaid
flowchart TD
  A[User joins Discord server] --> B[/help or onboarding message/]
  B --> C{User already linked?}
  C -- No --> D[/link]
  D --> E[Bot returns one-time link URL with state]
  E --> F[User opens web link page]
  F --> G{Logged in on website?}
  G -- No --> H[Firebase login: Google/LINE/Discord]
  H --> I[Website calls API: link/complete]
  G -- Yes --> I
  I --> J[DB: save discordUserId <-> firebaseUid]
  J --> K[Bot confirms link success]
  C -- Yes --> L[/result]
  L --> M[Bot calls API: get latest result by firebaseUid]
  M --> N[Bot replies: type + core + dessert + CTA link]
  N --> O[/invite]
  O --> P[Bot generates referral link + tracks action]
  P --> Q[New user lands on website via referral]
  Q --> R[Website saves referral + when completed updates conversion]
```

---

## 3) Bot 指令清單（MVP → 進階）

### 3.1 MVP（先做這個就能跑）
- `/link`：產生一次性綁定連結（10 分鐘失效）
- `/unlink`：解除綁定
- `/result`：查自己最新 MBTI + 核心本質 + 靈魂甜點 +「查看完整報告」按鈕
- `/help`：指令說明（含隱私說明）

### 3.2 進階（社群互動/成長）
- `/invite`：生成推薦連結（含 UTM + referral）
- `/compare @user`：比較兩人 MBTI（需兩人都綁定）
- `/stats`：匿名化的社群統計（例如 TOP MBTI、總測驗數）

---

## 4) 系統架構（最小可落地）

### 4.1 Discord Bot（Interactions）
- 建議採用 **Slash Commands + Ephemeral 回覆**
  - 用戶體驗乾淨、低打擾
  - 不需要讀 message content（減少權限、降低風險）

### 4.2 你的 Web（Firebase Auth 仍是主體）
- 綁定頁：`/discord/link?state=...`
- 若未登入 → 使用你現有 Firebase 登入（Google/LINE/Discord）
- 登入後完成綁定 → 回寫 DB

---

## 5) API 端點清單（你審核用）

> 命名以你目前 `api/` Vercel Functions 風格為主（可調整）。

### 5.1 綁定
- `POST /api/discord/link/start`
  - **input**: `{ discordUserId, guildId }`
  - **output**: `{ state, linkUrl, expiresAt }`
  - **DB**: 建立 `link_state`（10 分鐘有效）

- `POST /api/discord/link/complete`
  - **input**: `{ state, firebaseUid, email?, displayName? }`
  - **output**: `{ ok: true }`
  - **DB**: 寫入 `discord_links`（discordUserId ↔ firebaseUid）

- `POST /api/discord/link/unlink`
  - **input**: `{ discordUserId, guildId }`
  - **output**: `{ ok: true }`
  - **DB**: 標記解除綁定

### 5.2 查結果
- `GET /api/discord/user/result?discordUserId=...&guildId=...`
  - **output**: `{ mbtiType, identity, coreAnalysisShort, dessertName, reportUrl }`
  - **DB**: 需要能由 firebaseUid 找最新結果（Firestore 現有結構或後續 Supabase）

### 5.3 行為追蹤（Discord 側）
- `POST /api/discord/action`
  - **input**: `{ discordUserId, guildId, actionType, payload }`
  - **DB**: `discord_actions`（或統一到 `user_actions`）

---

## 6) 事件追蹤（讓 Discord 成為可衡量的成長渠道）

建議事件（可對齊 GA4 / FB Pixel / Firestore 行為表）：
- `discord_link_started`
- `discord_link_completed`
- `discord_result_viewed`
- `discord_invite_created`
- `discord_referral_converted`（由網站端完成測驗回寫）

---

## 7) Discord 社群設計優化建議（你不熟 Discord 的「最短路徑」）

### 7.1 結構（Minimal 但好用）
- **#start-here**：固定一則 onboarding（怎麼測驗、怎麼綁定、怎麼查結果）
- **#results**：發測驗結果分享（用戶主動貼圖/連結）
- **#dessert-booking**：訂購相關、店資訊
- **#announcements**：你官方公告（只允許你/管理員發）

### 7.2 Role（讓用戶留下來的核心）
- 自動發：`MBTI-INTJ`、`MBTI-ENFP`…（綁定後 Bot 發 Role）
- 可選：`A` / `T` Role（或 `Assertive` / `Turbulent`）
- 好處：用戶會「想拿到自己的標籤」→ 提升綁定率、提升留存

### 7.3 內容節奏（不用很懂 Discord 也能跑）
- 每週固定一次：**本週最多人格**、**本週最稀有人格**（匿名統計）
- 每月一次：**新品/活動 + MBTI 專屬推薦**（導購）

---

## 8) 我建議你先做的「最小改動」版本（低風險）

1. Bot 先只做：`/link` + `/result` + `/unlink` + `/help`
2. 資料先落地到 **Firestore**（不動你現有 Firebase Auth）
3. 等你確認 Discord 真能帶來留存/轉換，再把「會員積分/內容管理」逐步搬到 Supabase

---

## 9) 下一步我可以直接幫你做的改動（你點頭我就改）

### 9.1 文件與規格（零風險）
- 強化本文件 + 補上更精準的 DB schema（Firestore/Supabase 兩版）

### 9.2 產品層（低風險）
- 把 `api/notify-discord.ts` 升級成 **Embed**（更好看、更像品牌）
- 網站端加一個「Discord 綁定頁」與 `/discord/link` route

### 9.3 Bot MVP（中風險，需要你提供 Discord App 設定）
- 新增 `/api/discord/interaction`（處理 slash commands）
- 新增 Firestore collections：`discord_links`, `discord_link_states`, `discord_actions`

