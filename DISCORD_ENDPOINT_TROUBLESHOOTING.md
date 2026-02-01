# 🔧 Discord Interactions Endpoint 驗證失敗 - 除錯指南

## ❌ 錯誤訊息
```
Validation errors:
interactions_endpoint_url: 無法驗證指定的互動端點 URL。
```

---

## 🔍 可能的原因與解決方法

### 1. **環境變數 `DISCORD_PUBLIC_KEY` 未設定或錯誤**

**檢查方法**：
1. 前往 Vercel Dashboard → 你的專案 → Settings → Environment Variables
2. 確認 `DISCORD_PUBLIC_KEY` 存在且值正確
3. 值應該是從 Discord Developer Portal → General Information → PUBLIC KEY 複製的

**解決方法**：
- 如果沒有，請新增
- 如果有但值不對，請重新複製正確的 Public Key
- **重要**：新增/修改後，必須重新部署 Vercel

---

### 2. **Vercel 尚未部署最新版本**

**檢查方法**：
1. 前往 Vercel Dashboard → Deployments
2. 確認最新的部署包含 `api/discord/interaction.ts` 檔案
3. 檢查部署時間是否在你修改程式碼之後

**解決方法**：
- 如果沒有最新部署，點擊 **「Redeploy」** 或 push 新的 commit
- 等待部署完成（通常 1-2 分鐘）

---

### 3. **Endpoint URL 不正確**

**檢查方法**：
1. 確認你在 Discord Developer Portal 填的 URL 是：
   ```
   https://kiwimu-mbti.vercel.app/api/discord/interaction
   ```
   （或你的實際 Vercel 網域）

2. 確認：
   - ✅ 使用 `https://`（不是 `http://`）
   - ✅ 包含完整路徑 `/api/discord/interaction`
   - ✅ 沒有多餘的斜線或空格

**解決方法**：
- 重新輸入正確的 URL
- 點擊 **「Save Changes」**

---

### 4. **驗簽失敗（最常見）**

Discord 會發送一個 PING 請求（`{ type: 1 }`）來驗證 endpoint，你的 endpoint 必須：
1. 正確驗證簽名（使用 Public Key）
2. 回傳 `{ "type": 1 }`（PONG）

**檢查方法**：
使用測試腳本：
```bash
DISCORD_PUBLIC_KEY=你的PublicKey \
ENDPOINT_URL=https://kiwimu-mbti.vercel.app/api/discord/interaction \
npx tsx scripts/test-discord-endpoint.ts
```

**解決方法**：
- 如果測試腳本顯示 401，這是正常的（因為我們用假簽名）
- 如果顯示 500，檢查 Vercel Function Logs
- 如果顯示其他錯誤，檢查 endpoint URL 是否正確

---

### 5. **Vercel Function 執行錯誤**

**檢查方法**：
1. 前往 Vercel Dashboard → 你的專案 → Functions
2. 點擊 `api/discord/interaction`
3. 查看 Logs，尋找錯誤訊息

**常見錯誤**：
- `DISCORD_PUBLIC_KEY is not set` → 環境變數未設定
- `Bad request signature` → 驗簽失敗（可能是 Public Key 錯誤）
- `Firebase Admin error` → Firebase 憑證問題（不影響 PING，但會影響其他指令）

---

## ✅ 完整檢查清單

按照以下順序檢查：

- [ ] **步驟 1**：確認 `DISCORD_PUBLIC_KEY` 已設定到 Vercel
  - Vercel Dashboard → Settings → Environment Variables
  - 值應該從 Discord Developer Portal → General Information → PUBLIC KEY 複製

- [ ] **步驟 2**：確認 Vercel 已部署最新版本
  - Deployments 標籤 → 確認最新部署時間
  - 如果沒有，點擊 Redeploy

- [ ] **步驟 3**：確認 Interactions URL 正確
  - Discord Developer Portal → Interactions
  - URL 格式：`https://你的網域/api/discord/interaction`
  - 沒有多餘的斜線或空格

- [ ] **步驟 4**：測試 Endpoint（可選）
  ```bash
  DISCORD_PUBLIC_KEY=你的PublicKey \
  ENDPOINT_URL=https://kiwimu-mbti.vercel.app/api/discord/interaction \
  npx tsx scripts/test-discord-endpoint.ts
  ```

- [ ] **步驟 5**：在 Discord Developer Portal 重新儲存
  - Interactions → INTERACTIONS ENDPOINT URL
  - 重新輸入 URL（即使一樣）
  - 點擊 **「Save Changes」**
  - 等待驗證（通常 5-10 秒）

---

## 🆘 如果還是失敗

### 檢查 Vercel Function Logs

1. 前往 Vercel Dashboard → 你的專案
2. 上方選單點 **「Functions」**
3. 找到 `api/discord/interaction`
4. 點擊查看 **「Logs」**
5. 尋找錯誤訊息

### 常見錯誤訊息與解決方法

| 錯誤訊息 | 原因 | 解決方法 |
|---------|------|---------|
| `DISCORD_PUBLIC_KEY is not set` | 環境變數未設定 | 在 Vercel 設定環境變數並重新部署 |
| `Bad request signature` | 驗簽失敗 | 檢查 Public Key 是否正確，確認 body 處理正確 |
| `Firebase Admin error` | Firebase 憑證問題 | 檢查 `FIREBASE_SERVICE_ACCOUNT_JSON` 或相關環境變數 |
| `500 Internal Server Error` | 程式碼錯誤 | 查看完整 logs，修正程式碼錯誤 |

---

## 📞 需要更多幫助？

如果以上方法都試過還是失敗，請提供：

1. **Vercel Function Logs**（從 Vercel Dashboard 複製）
2. **測試腳本輸出**（如果執行了）
3. **Discord Developer Portal 截圖**（Interactions 頁面）
4. **你填的 Interactions URL**（完整 URL）

我會幫你進一步診斷！🚀
