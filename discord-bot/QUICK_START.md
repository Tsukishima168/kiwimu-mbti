# Discord 伺服器自動化設置 - 快速開始指南

## 🎯 這個腳本會自動創建

✅ **21 個身份組**
- 16 種 MBTI 類型（INFP、ENFP、INFJ...）
- 5 種 VIP 等級（超級粉絲、貼圖收藏家...）

✅ **5 個類別 + 16 個頻道**
- 📢 公告（2 個頻道）
- 💬 交流區（5 個頻道：4 個族群 + 跨類型）
- 🍰 甜點店（3 個頻道）
- 💎 會員專區（4 個頻道）
- 🛠️ 工具（2 個頻道）

✅ **自動配置權限**
- 族群頻道：4 個 MBTI 類型共享
- VIP 頻道：分級存取

**執行時間：約 1-2 分鐘** ⏱️

---

## 📋 準備工作（5 分鐘）

### Step 1: 獲取 Discord Bot Token

1. **前往 Discord Developer Portal**
   - 網址：https://discord.com/developers/applications
   - 登入你的 Discord 帳號

2. **創建新應用**
   - 點擊右上角「New Application」
   - 名稱：`KIWIMU Setup Bot`
   - 同意條款 → Create

3. **創建 Bot**
   - 左側選單點「Bot」
   - 點擊「Add Bot」→ 確認
   - 關閉「Public Bot」（避免被別人加入）

4. **複製 Token**
   - 點擊「Reset Token」
   - 複製顯示的 Token（只會顯示一次！）
   - ⚠️ 不要分享給任何人！

5. **設定權限**
   - 左側選單點「OAuth2」→「URL Generator」
   - **Scopes** 勾選：
     - ✅ `bot`
   - **Bot Permissions** 勾選：
     - ✅ Manage Roles（管理身份組）
     - ✅ Manage Channels（管理頻道）
     - ✅ View Channels（查看頻道）
   - 複製底部生成的 URL

6. **邀請 Bot 到伺服器**
   - 將剛複製的 URL 貼到瀏覽器
   - 選擇你的 KIWIMU 伺服器
   - 點擊「授權」

---

### Step 2: 安裝依賴

打開終端機，執行：

\`\`\`bash
cd discord-bot
npm install discord.js@14 dotenv
\`\`\`

---

### Step 3: 設定環境變數

創建 `.env` 檔案：

\`\`\`bash
# 在 discord-bot 資料夾
touch .env
\`\`\`

編輯 `.env`，貼上你的 Token：

\`\`\`
DISCORD_TOKEN=你剛複製的_Bot_Token
\`\`\`

**範例：**
\`\`\`
DISCORD_TOKEN=MTIzNDU2Nzg5MDEyMzQ1Njc4OQ.GhJ-kL.abcdefghijklmnopqrstuvwxyz1234567890
\`\`\`

---

## 🚀 執行腳本

### 一鍵執行

\`\`\`bash
cd discord-bot
node setup-server.js
\`\`\`

### 你會看到

\`\`\`
✅ Bot 已登入為 KIWIMU Setup Bot#1234

📍 目標伺服器: KIWIMU 性格宇宙

⚠️  這將會創建所有身份組和頻道架構
⚠️  請確認這是你想要設置的伺服器！

開始執行...

📝 Step 1: 創建身份組...
  ✅ 創建: 🌟 超級粉絲
  ✅ 創建: 💎 貼圖收藏家
  ✅ 創建: 🥇 店內消費者
  ...（共 21 個）

✅ 完成！共創建 21 個身份組

📁 Step 2: 創建頻道架構...
  📂 創建類別: 📢 公告區
    ✅ 創建頻道: 📣-最新消息
    ✅ 創建頻道: 🎉-活動公告
  ...

🎉 伺服器設置完成！

📊 統計：
  - 身份組: 21 個
  - 類別: 5 個
  - 頻道: 41 個

✅ 所有設置完成！Bot 將在 5 秒後關閉...
\`\`\`

---

## ✅ 完成後檢查

### 1. 檢查身份組

\`\`\`
伺服器設定 → 身份組
\`\`\`

應該看到：
- 🌟 超級粉絲（金色）
- 💎 貼圖收藏家（粉色）
- 🥇 店內消費者（紅色）
- 🥈 LINE 會員（綠色）
- 🥉 測驗完成者（銀色）
- 🌈 INFP 夢想家（紫色）
- ... 等 16 種 MBTI

### 2. 檢查頻道

左側應該看到：
- 📢 公告
  - 📣-最新消息
  - 🎉-活動公告
- 💬 交流區
  - 🌈-NF族群（INFP、ENFP、INFJ、ENFJ）
  - 🔬-NT族群（INTP、ENTP、INTJ、ENTJ）
  - 🎨-SF族群（ISFP、ESFP、ISFJ、ESFJ）
  - 🔧-ST族群（ISTP、ESTP、ISTJ、ESTJ）
  - 💬-跨類型閒聊
- 🍰 甜點店
  - 🍰-甜點推薦
  - 📸-打卡分享
  - 🏪-門市資訊
- 💎 會員專區
  - 🥈-LINE會員
  - 🥇-店內消費者
  - 💎-貼圖收藏家
  - 🌟-超級粉絲
- 🛠️ 工具
  - 🤖-BOT指令
  - 📝-意見箱

### 3. 測試權限

**族群頻道測試：**
- 給自己 INFP 身份組 → 應該看到「🌈-NF族群」
- INFP、ENFP、INFJ、ENFJ 都能存取同一個頻道
- 但看不到 NT、SF、ST 族群頻道

**VIP 頻道測試：**
- 給自己「🥈 LINE 會員」→ 應該看到「🥈-LINE會員」頻道

---

## ⚠️ 常見問題

### Q: 腳本執行失敗？

**可能原因：**
1. Token 錯誤 → 重新複製
2. Bot 沒有權限 → 檢查邀請時是否勾選權限
3. Bot 身份組位置太低 → 在伺服器設定中將 Bot 身份組移到最上方

### Q: 已經有部分頻道了？

**解決方案：**
1. 刪除現有的頻道和身份組
2. 或修改 `setup-server.js` 只創建缺少的部分

### Q: 想修改顏色或名稱？

編輯 `setup-server.js` 中的：
\`\`\`javascript
const MBTI_ROLES = [
  { name: '🌈 INFP 夢想家', color: '#9B59B6' }, // 改這裡
  ...
];
\`\`\`

顏色代碼查詢：https://htmlcolorcodes.com/

---

## 🎉 完成了！

你的 Discord 伺服器現在擁有：
- ✅ 完整的 MBTI 身份組系統
- ✅ 專屬頻道架構
- ✅ 正確的權限配置

**下一步：**
1. 在「📣-最新消息」發布歡迎訊息
2. 開發驗證 Bot（`/verify` 指令）
3. 開始邀請用戶加入！

需要幫助？參考完整指南：`discord_complete_guide.md`
