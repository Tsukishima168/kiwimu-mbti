# ✅ Discord 自動發身份組 - 設定完成

## 🎉 功能已整合

現在用戶在結果頁面可以：
1. 點擊「自動取得 Discord 身份組 →」
2. 輸入 Discord User ID
3. 系統自動發放對應的身份組

---

## ⚙️ 需要設定的環境變數（Vercel）

前往 **Vercel Dashboard → 你的專案 → Settings → Environment Variables**，新增：

| 環境變數 | 說明 | 在哪裡找 |
|---------|------|---------|
| `DISCORD_BOT_TOKEN` | Bot Token | Discord Developer Portal → Bot → Token |
| `DISCORD_GUILD_ID` | Discord Server ID | Discord 中右鍵 Server 名稱 → Copy Server ID |

---

## 🧪 測試步驟

### 1. 確認環境變數已設定
- Vercel Dashboard → Environment Variables
- 確認 `DISCORD_BOT_TOKEN` 和 `DISCORD_GUILD_ID` 都存在

### 2. 確認 Bot 已加入 Server
- Bot 必須已經被邀請到你的 Discord Server
- Bot 需要有 **Manage Roles** 權限

### 3. 確認身份組已建立
- 在 Discord Server 中，確認所有 MBTI 身份組都已建立
- 例如：`🌈 INFP 治癒系詩人`、`🎯 INTJ 戰略策劃家` 等
- 可選：建立 `🥉 測驗完成者` 身份組（會自動發放）

### 4. 測試流程
1. 完成測驗，進入結果頁
2. 點擊「自動取得 Discord 身份組 →」
3. 輸入你的 Discord User ID（如何取得見下方）
4. 點擊「發放身份組」
5. 回到 Discord 確認身份組已發放

---

## 📖 如何取得 Discord User ID

### 步驟 1：開啟開發者模式
1. Discord 設定 → 進階
2. 開啟「開發者模式」

### 步驟 2：複製 User ID
1. 在 Discord 中，**右鍵你的頭像**
2. 點擊「複製使用者 ID」
3. 貼到網站輸入框

---

## 🎯 身份組對應表

| MBTI 類型 | 身份組名稱 |
|----------|-----------|
| INFP-A/T | 🌈 INFP 治癒系詩人 |
| ENFP-A/T | ✨ ENFP 熱血追夢人 |
| INFJ-A/T | 🦉 INFJ 深淵凝視者 |
| ENFJ-A/T | 🌟 ENFJ 光輝導師 |
| INTP-A/T | 🔬 INTP 邏輯解構者 |
| ENTP-A/T | 💡 ENTP 智力辯論家 |
| INTJ-A/T | 🎯 INTJ 戰略策劃家 |
| ENTJ-A/T | 👑 ENTJ 天生指揮官 |
| ISFP-A/T | 🎨 ISFP 自由藝術家 |
| ESFP-A/T | 🎭 ESFP 閃耀巨星 |
| ISFJ-A/T | 🤗 ISFJ 溫柔守護者 |
| ESFJ-A/T | 💝 ESFJ 熱心供給者 |
| ISTP-A/T | 🔧 ISTP 冷靜工匠 |
| ESTP-A/T | ⚡ ESTP 極限挑戰者 |
| ISTJ-A/T | 📋 ISTJ 守序捍衛者 |
| ESTJ-A/T | ⚖️ ESTJ 鐵血執行長 |

---

## 🆘 常見問題

### Q1：顯示「Role not found」
**A**：Discord Server 中沒有對應的身份組。請確認：
- 身份組名稱完全一致（包括 emoji）
- Bot 有權限查看身份組

### Q2：顯示「User not found in server」
**A**：用戶還沒加入 Discord Server。請先加入 Server。

### Q3：顯示「Server configuration error」
**A**：`DISCORD_BOT_TOKEN` 未設定或錯誤。檢查 Vercel 環境變數。

### Q4：顯示「Missing DISCORD_GUILD_ID」
**A**：`DISCORD_GUILD_ID` 未設定。在 Vercel 新增此環境變數。

---

## ✅ 完成！

設定完成後，用戶就可以在結果頁面自動取得身份組了！

**不需要 Interactions Endpoint，不需要長駐 Bot，只需要兩個環境變數。** 🚀
