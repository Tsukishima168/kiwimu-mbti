# 🔍 Discord Bot 設定值取得指南

本指南會告訴你**去哪裡找**所有需要的 Discord 和 Firebase 設定值。

---

## 📋 第一部分：Discord 設定值

### 步驟 1：前往 Discord Developer Portal

1. 打開瀏覽器，前往：**https://discord.com/developers/applications**
2. 如果還沒登入，請先登入你的 Discord 帳號
3. 你會看到「Applications」列表

---

### 步驟 2：建立或選擇 Application

#### 情況 A：你已經有 Application（例如之前建立的 Bot）
- 直接點擊你的 Application 名稱進入

#### 情況 B：你還沒有 Application
1. 點擊右上角 **「New Application」** 按鈕
2. 輸入名稱（例如：`KIWIMU MBTI Lab Bot`）
3. 點擊 **「Create」**

---

### 步驟 3：取得 Application ID

1. 進入 Application 後，左側選單點 **「General Information」**
2. 在頁面最上方，你會看到：
   ```
   APPLICATION ID
   1234567890123456789  [Copy]
   ```
3. 點擊 **「Copy」** 按鈕
4. **這就是你的 `DISCORD_APPLICATION_ID`**

---

### 步驟 4：取得 Public Key

1. 還在 **「General Information」** 頁面
2. 往下滾動，找到 **「PUBLIC KEY」** 區塊
3. 你會看到：
   ```
   PUBLIC KEY
   abc123def456...  [Copy]
   ```
4. 點擊 **「Copy」** 按鈕
5. **這就是你的 `DISCORD_PUBLIC_KEY`**

---

### 步驟 5：取得 Bot Token

1. 左側選單點 **「Bot」**
2. 如果還沒建立 Bot，點擊 **「Add Bot」** → **「Yes, do it!」**
3. 在 **「TOKEN」** 區塊，你會看到：
   ```
   TOKEN
   [Click to Reveal Token] 或 [Reset Token]
   ```
4. 點擊 **「Reset Token」** 或 **「Copy」**（如果已經顯示）
5. **⚠️ 重要：這個 Token 只會顯示一次！請立即複製並妥善保存**
6. **這就是你的 `DISCORD_BOT_TOKEN`**

---

### 步驟 6：設定 Bot 權限（重要！）

1. 還在 **「Bot」** 頁面
2. 往下滾動到 **「Privileged Gateway Intents」**
3. 開啟以下選項（如果需要的話）：
   - ✅ **SERVER MEMBERS INTENT**（如果需要發 Role 或讀成員資料）
   - ⚠️ **MESSAGE CONTENT INTENT**（我們用 Slash Commands，通常不需要）
4. 點擊 **「Save Changes」**

---

### 步驟 7：取得 Guild ID（你的 Discord Server ID）

#### 方法 A：從 Discord 應用程式（最簡單）

1. 打開 Discord 桌面版或網頁版
2. 進入你的 Discord Server
3. 在 Server 名稱上**右鍵** → **「Copy Server ID」**
   - 如果沒看到這個選項，需要先開啟「開發者模式」：
     - 設定 → 進階 → 開啟「開發者模式」
4. **這就是你的 `DISCORD_GUILD_ID`**

#### 方法 B：從 URL（如果知道 Server 連結）

如果你的 Server 連結是：`https://discord.gg/xxxxx`

1. 在 Server 名稱上右鍵 → **「Server Settings」**
2. 左側選單點 **「Widget」**
3. 在 **「Server ID」** 欄位可以看到 ID

---

### 步驟 8：設定 Interactions Endpoint URL

1. 回到 Discord Developer Portal，左側選單點 **「Interactions」**
2. 在 **「INTERACTIONS ENDPOINT URL」** 欄位輸入：
   ```
   https://kiwimu.com/api/discord/interaction
   ```
   （或你的實際 Vercel 網域）
3. 點擊 **「Save Changes」**
4. Discord 會驗證這個 URL（需要你的 endpoint 已經部署並回應 `type: 1` 的 ping）
5. 如果驗證失敗，請確認：
   - Vercel 已經部署
   - URL 正確
   - endpoint 有正確處理 Discord 的驗證請求

---

### 步驟 9：邀請 Bot 到你的 Server

1. 左側選單點 **「OAuth2」** → **「URL Generator」**
2. 在 **「SCOPES」** 勾選：
   - ✅ **bot**
   - ✅ **applications.commands**
3. 在 **「BOT PERMISSIONS」** 勾選：
   - ✅ **Send Messages**
   - ✅ **Embed Links**
   - ✅ **Read Message History**（選配）
   - ✅ **Manage Roles**（如果需要自動發 Role）
4. 下方會自動生成一個 URL，複製它
5. 在瀏覽器打開這個 URL
6. 選擇你的 Server → **「Authorize」**
7. 完成！

---

## 📋 第二部分：Firebase Admin 設定值

### 步驟 1：前往 Firebase Console

1. 打開瀏覽器，前往：**https://console.firebase.google.com/**
2. 選擇你的專案：**kiwimu-mbti**（根據你的 `firebase.ts`）

---

### 步驟 2：建立 Service Account（如果還沒有）

1. 點擊左側齒輪圖示 ⚙️ → **「Project settings」**
2. 切換到 **「Service accounts」** 標籤
3. 如果已經有 Service Account，跳到步驟 3
4. 如果沒有，點擊 **「Generate new private key」**
5. 確認對話框 → **「Generate key」**
6. 瀏覽器會自動下載一個 JSON 檔案（例如：`kiwimu-mbti-xxxxx.json`）

---

### 步驟 3：取得 Firebase Admin 憑證

#### 方案 A：使用整包 JSON（推薦）

1. 打開剛才下載的 JSON 檔案（或你現有的 Service Account JSON）
2. 內容會長這樣：
   ```json
   {
     "type": "service_account",
     "project_id": "kiwimu-mbti",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@kiwimu-mbti.iam.gserviceaccount.com",
     "client_id": "...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "..."
   }
   ```
3. **把整個 JSON 內容複製**（包括 `{` 和 `}`）
4. **這就是你的 `FIREBASE_SERVICE_ACCOUNT_JSON`**

#### 方案 B：拆成三個環境變數（如果你偏好）

從 JSON 檔案中提取：
- **`FIREBASE_PROJECT_ID`**：`project_id` 欄位的值
- **`FIREBASE_CLIENT_EMAIL`**：`client_email` 欄位的值
- **`FIREBASE_PRIVATE_KEY`**：`private_key` 欄位的值（**包含 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`**）

---

## 📋 第三部分：設定 Vercel 環境變數

### 步驟 1：前往 Vercel Dashboard

1. 打開瀏覽器，前往：**https://vercel.com/dashboard**
2. 選擇你的專案：**color-of-kiwimu-mbti-lab-v5**

---

### 步驟 2：進入 Settings → Environment Variables

1. 點擊專案名稱進入專案
2. 上方選單點 **「Settings」**
3. 左側選單點 **「Environment Variables」**

---

### 步驟 3：新增所有環境變數

點擊 **「Add New」**，逐一新增以下變數：

#### Discord 變數

| Key | Value | 說明 |
|-----|-------|------|
| `DISCORD_APPLICATION_ID` | 從步驟 3 複製的 Application ID | 例如：`1234567890123456789` |
| `DISCORD_PUBLIC_KEY` | 從步驟 4 複製的 Public Key | 例如：`abc123def456...` |
| `DISCORD_BOT_TOKEN` | 從步驟 5 複製的 Bot Token | 例如：`MTIzNDU2Nzg5...` |
| `DISCORD_GUILD_ID` | 從步驟 7 複製的 Guild ID | 例如：`987654321098765432` |
| `DISCORD_LINK_BASE_URL` | `https://kiwimu.com` | （選配，預設值已夠用） |
| `DISCORD_REPORT_BASE_URL` | `https://kiwimu.com` | （選配，預設值已夠用） |

#### Firebase 變數（擇一）

**方案 A（推薦）**：
| Key | Value | 說明 |
|-----|-------|------|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | 整個 JSON 內容（一行） | 從步驟 3 方案 A 複製的完整 JSON |

**方案 B**：
| Key | Value | 說明 |
|-----|-------|------|
| `FIREBASE_PROJECT_ID` | `kiwimu-mbti` | 從 JSON 的 `project_id` |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-...@...` | 從 JSON 的 `client_email` |
| `FIREBASE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\n...` | 從 JSON 的 `private_key`（包含換行符） |

---

### 步驟 4：選擇環境（Environment）

每個變數新增時，選擇：
- ✅ **Production**
- ✅ **Preview**（選配，測試用）
- ✅ **Development**（選配，本地測試用）

---

### 步驟 5：重新部署

1. 新增完所有環境變數後
2. 前往 **「Deployments」** 標籤
3. 點擊最新部署右側的 **「⋯」** → **「Redeploy」**
4. 或直接 push 新的 commit 觸發自動部署

---

## 📋 第四部分：註冊 Slash Commands（一次性）

### 步驟 1：準備本地環境

```bash
cd /Users/penstudio/Desktop/color-of-kiwimu-mbti-lab-v5
npm install
```

### 步驟 2：執行註冊腳本

```bash
DISCORD_BOT_TOKEN=你的BotToken \
DISCORD_APPLICATION_ID=你的ApplicationID \
DISCORD_GUILD_ID=你的GuildID \
npx tsx scripts/register-discord-commands.ts
```

**或建立一個臨時的 `.env.local`**（不會被 commit）：

```bash
# .env.local（不要 commit 這個檔案！）
DISCORD_BOT_TOKEN=你的BotToken
DISCORD_APPLICATION_ID=你的ApplicationID
DISCORD_GUILD_ID=你的GuildID
```

然後執行：
```bash
npx tsx scripts/register-discord-commands.ts
```

### 步驟 3：確認成功

如果成功，你會看到：
```
Registered commands: help, link, unlink, result
```

---

## ✅ 檢查清單

完成後，確認以下項目：

- [ ] Discord Application ID 已複製並設定到 Vercel
- [ ] Discord Public Key 已複製並設定到 Vercel
- [ ] Discord Bot Token 已複製並設定到 Vercel
- [ ] Discord Guild ID 已複製並設定到 Vercel
- [ ] Interactions Endpoint URL 已設定（`https://kiwimu.com/api/discord/interaction`）
- [ ] Bot 已邀請到 Server
- [ ] Firebase Service Account JSON 已設定到 Vercel（或拆成三個變數）
- [ ] Vercel 已重新部署
- [ ] Slash Commands 已註冊（執行腳本成功）
- [ ] 在 Discord 輸入 `/help` 可以看到指令列表

---

## 🆘 常見問題

### Q1：找不到「Copy Server ID」選項？
**A**：需要先開啟「開發者模式」：
- Discord 設定 → 進階 → 開啟「開發者模式」

### Q2：Interactions Endpoint URL 驗證失敗？
**A**：確認：
1. Vercel 已經部署最新版本
2. URL 正確（包含 `/api/discord/interaction`）
3. endpoint 有正確處理 Discord 的 ping（`type: 1`）

### Q3：Bot Token 忘記了？
**A**：回到 Discord Developer Portal → Bot → Reset Token（會產生新的）

### Q4：Firebase Service Account JSON 格式錯誤？
**A**：確保：
- 包含完整的 JSON（從 `{` 到 `}`）
- 沒有多餘的空格或換行
- `private_key` 欄位包含 `\n`（程式會自動轉換）

---

## 📞 需要幫助？

如果某個步驟卡住，告訴我：
1. 你卡在哪個步驟
2. 你看到的錯誤訊息
3. 截圖（如果方便）

我會幫你解決！🚀
