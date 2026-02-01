# 🎯 Discord 身份組自動發放 - 最簡單方案

## ✅ 你現在有兩個選擇

### 方案 A：繼續用現有 Bot（最簡單，但需要 24/7 運行）

**你已經有的**：`discord-bot/index.js`

**使用方式**：
1. 用戶完成測驗後，在結果頁面找到 **Firebase User ID**
2. 用戶在 Discord 輸入：`/verify userid:他們的UserID`
3. Bot 自動發身份組

**需要**：
- Bot 24/7 運行（Railway / Heroku / 你的伺服器）
- 環境變數：`DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_GUILD_ID`
- Firebase Service Account JSON

**優點**：已經可以運作，不需要改程式碼

---

### 方案 B：網站自動發身份組（推薦，不需要長駐 Bot）

**新增的**：`api/discord/assign-role.ts`

**使用方式**：
1. 用戶完成測驗
2. 網站自動呼叫 `/api/discord/assign-role` 發身份組
3. 用戶不需要做任何事

**需要**：
- 只需要 `DISCORD_BOT_TOKEN` 和 `DISCORD_GUILD_ID`（設定到 Vercel）
- 用戶需要提供 Discord User ID（或透過綁定流程取得）

**優點**：不需要長駐 Bot，自動化程度高

---

## 🚀 方案 B 實作步驟（如果你選這個）

### 步驟 1：設定環境變數

在 Vercel 新增：
- `DISCORD_BOT_TOKEN`：從 Discord Developer Portal → Bot → Token
- `DISCORD_GUILD_ID`：你的 Discord Server ID

### 步驟 2：取得用戶的 Discord User ID

有兩種方式：

#### 方式 A：讓用戶手動提供（最簡單）
在結果頁面加一個輸入框：
```typescript
// 用戶輸入 Discord User ID
const discordUserId = prompt('請輸入你的 Discord User ID（在 Discord 設定 → 進階 → 開發者模式 → 右鍵你的頭像 → Copy ID）');
```

#### 方式 B：透過綁定流程（需要 Interactions Endpoint）
如果 Interactions Endpoint 之後能運作，可以用 `/link` 綁定流程自動取得。

### 步驟 3：在測驗完成時呼叫 API

在 `App.tsx` 的 `handleQuizComplete` 中加入：

```typescript
// 如果用戶提供了 Discord User ID
if (discordUserId && mbtiType) {
  fetch('/api/discord/assign-role', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      discordUserId,
      mbtiType: `${mbtiType}-${variant}`, // 例如 "INTJ-A"
      guildId: process.env.DISCORD_GUILD_ID, // 或從環境變數讀取
    }),
  }).catch(console.error);
}
```

---

## 💡 我的建議

**如果你現在就想用**：
- 繼續用方案 A（現有 Bot），它已經可以運作了

**如果你想要自動化**：
- 用方案 B，但先讓用戶手動提供 Discord User ID（方式 A）
- 之後 Interactions Endpoint 修好後，再改成自動綁定（方式 B）

---

## 📝 需要我幫你實作哪一個？

告訴我：
1. **繼續用現有 Bot**（方案 A）- 我可以幫你優化或解答問題
2. **實作自動發身份組**（方案 B）- 我可以幫你整合到網站

選一個，我直接幫你做！🚀
