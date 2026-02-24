# 🌐 網域遷移 SOP — kiwimu.com

> **用途**：當需要將 Vercel 專案從舊網域遷移至新自訂網域時，照此清單逐步執行。  
> **適用範圍**：Vite SPA + Firebase Auth + LINE Login + Vercel 部署  
> **最後更新**：2026-02-24

---

## 一、程式碼端修改

### 1. `.env` — 更新 LINE Redirect URI

```env
# 改前
VITE_LINE_REDIRECT_URI=https://舊網域/callback
LINE_REDIRECT_URI=https://舊網域/callback

# 改後
VITE_LINE_REDIRECT_URI=https://新網域/callback
LINE_REDIRECT_URI=https://新網域/callback
```

### 2. `firebase.ts` — 更新 authDomain（可選）

```ts
// 若要讓 Google 登入 popup 顯示自訂網域
authDomain: "新網域"  // 原本是 xxx.firebaseapp.com
```

> ⚠️ 改 authDomain 之前，必須先完成「三、Google Cloud Console」的設定

### 3. 浮水印 / 品牌連結 — 全專案搜尋替換

```bash
# 搜尋舊網域
grep -rn "舊網域" --include="*.tsx" --include="*.ts" --include="*.html"
```

常見位置：
- `ResultLegacyDump.tsx` → IG Story 浮水印
- `Result.backup.tsx` → IG Story 浮水印
- `index.html` → `og:url`, `twitter:domain`, `canonical`

### 4. `public/sitemap.xml` — 更新所有 `<loc>` 網址

```xml
<loc>https://新網域/</loc>
```

### 5. `public/robots.txt` — 確認 Sitemap 指向

```txt
Sitemap: https://新網域/sitemap.xml
```

---

## 二、LINE Developers Console

1. 進入 https://developers.line.biz/
2. Provider → **LINE Login Channel**
3. **LINE Login** 頁籤 → **Callback URL**
4. 改為 `https://新網域/callback`
5. 按 **Update**

> ⚠️ LINE 要求 Callback URL **完全一致**，多一個 `/` 都會失敗

---

## 三、Google Cloud Console（OAuth 授權）

1. 進入 https://console.cloud.google.com/
2. 確認專案正確（左上角切換）
3. **APIs & Services** → **Credentials**
4. 點擊 **Web client (auto created by Google Service)**
5. **已授權的 JavaScript 來源** → `+ 新增 URI`：
   ```
   https://新網域
   ```
6. **已授權的重新導向 URI** → `+ 新增 URI`：
   ```
   https://新網域/__/auth/handler
   ```
7. 按 **儲存**

> 💡 `/__/auth/handler` 是 Firebase Auth 預設的 redirect handler 路徑

---

## 四、Firebase Console

1. 進入 https://console.firebase.google.com/
2. 選擇專案 → **Authentication** → **Settings**
3. **Authorized domains** → 加入 `新網域`

---

## 五、Vercel — 環境變數 + 自訂網域

### 環境變數

| 變數名 | 值 |
|--------|------|
| `VITE_LINE_REDIRECT_URI` | `https://新網域/callback` |
| `LINE_REDIRECT_URI` | `https://新網域/callback` |

設定完後需要 **Redeploy** 才會生效。

### 自訂網域

1. **Settings** → **Domains** → **Add Domain**
2. 輸入 `新網域`
3. 依指示到 DNS 設定 CNAME 或 A Record

---

## 六、Google Search Console

1. 進入 https://search.google.com/search-console/
2. **新增資源** → 輸入 `https://新網域`
3. 用 DNS 或 HTML 驗證
4. 提交 Sitemap：`sitemap.xml`
5. 手動索引：搜尋框貼入首頁 URL → **要求建立索引**

---

## 七、部署 + 驗證

```bash
git add .
git commit -m "fix: migrate domain to 新網域"
git push
```

### 驗證清單

- [ ] LINE 登入可正常跳轉並回調
- [ ] Google 登入 popup 正常
- [ ] IG Story 分享浮水印顯示新網域
- [ ] `https://新網域/sitemap.xml` 回傳正確 XML
- [ ] Google Search Console Sitemap 狀態為「成功」

---

## 附錄：本次遷移記錄（2026-02-24）

| 項目 | 舊值 | 新值 |
|------|------|------|
| 主網域 | `kiwimu-lab.vercel.app` | `kiwimu.com` |
| LINE Callback | Vercel preview URL | `https://kiwimu.com/callback` |
| Firebase authDomain | `kiwimu-mbti.firebaseapp.com` | `kiwimu.com` |
| Sitemap | 僅 3 個 URL | 包含所有多語系頁面 |

### 修改過的檔案

- `.env`
- `firebase.ts`
- `components/ResultLegacyDump.tsx`
- `components/Result.backup.tsx`
- `public/sitemap.xml`
- `utils/userDataCollector.ts`（修復 build error）
