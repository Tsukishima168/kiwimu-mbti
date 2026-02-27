# 🌐 網域遷移 SOP — kiwimu.com

> **適用範圍**：Vite SPA + Firebase Auth + Supabase Auth + LINE Login + Vercel 部署
> **最後更新**：2026-02-25
> **遷移狀態**：✅ 全部完成（2026-02-25）

---

## 📋 子網域對照表（最終版）

| 專案 | 子網域 | Vercel 專案名稱 | 主要框架 | 狀態 |
|------|-------|---------------|---------|------|
| MBTI Lab（主站） | `kiwimu.com` | `color-of-kiwimu-mbti-lab-v5` | Vite + React + Firebase | ✅ 上線 |
| Moon Map | `map.kiwimu.com` | `moon-map-original` | Vite + React | ✅ 上線 |
| Dessert Booking | `shop.kiwimu.com` | `moon-dessert-booking` | Next.js | ✅ 上線 |
| Passport | `passport.kiwimu.com` | `moonmoon-dessert-passport` | Vite + React | ✅ 上線 |
| Gacha 抽籤 | `gacha.kiwimu.com` | `moonmoon-gacha` | Vite + React | ✅ 上線 |

---

## 一、程式碼端修改 ✅（2026-02-25 完成）

所有 `*.vercel.app` 跨站連結已全部替換：

| 舊 URL | 新 URL | 影響檔案數 |
|--------|-------|----------|
| `kiwimu-mbti.vercel.app` | `kiwimu.com` | analytics map + 導覽 |
| `moon-map-original.vercel.app` | `map.kiwimu.com` | 6 個檔案 |
| `dessert-booking.vercel.app` | `shop.kiwimu.com` | 7 個檔案 |
| `moonmoon-dessert-passport.vercel.app` | `passport.kiwimu.com` | 5 個檔案 |
| `moonmoon-gacha.vercel.app` | `gacha.kiwimu.com` | 2 個檔案 |

**analytics hostname maps（保留舊 key 向下相容）：**
- `moonmoon-dessert-passport/analytics.ts`：新增 `kiwimu.com`、`map.kiwimu.com`、`shop.kiwimu.com` 三個 key
- `moon_map_original/lib/crossSiteTracking.ts`：同上邏輯

---

## 二、Vercel 子網域設定 ✅（2026-02-25 完成）

透過「Configure Automatically」按鈕，由 Vercel 自動向 Cloudflare 申請 Domain Connect 授權。

| 子網域 | Vercel 專案 | CNAME 目標（實際值） |
|--------|------------|-------------------|
| `map.kiwimu.com` | moon-map-original | `d4542fe42fc77655.vercel-dns-017.com.` |
| `shop.kiwimu.com` | moon-dessert-booking | `6f04c14835a5b4f9.vercel-dns-017.com.` |
| `passport.kiwimu.com` | moonmoon-dessert-passport | `43866a2ba20d97e3.vercel-dns-017.com.` |
| `gacha.kiwimu.com` | moonmoon-gacha | `55ccf4f9c79c9db6.vercel-dns-017.com.` |

> ⚠️ 以上 CNAME 值是各子站專屬的，不同於通用的 `cname.vercel-dns.com`，**維護時請使用上表的實際值**

---

## 三、Cloudflare DNS 設定 ✅（2026-02-25 完成）

透過 Domain Connect 自動授權，Cloudflare 同時加了 CNAME + TXT 驗證記錄。

| 類型 | 名稱 | 目標 | Proxy 狀態 |
|------|------|------|-----------|
| CNAME | `map` | `d4542fe42fc77655.vercel-dns-017.com.` | DNS only（☁️ 關閉） |
| CNAME | `shop` | `6f04c14835a5b4f9.vercel-dns-017.com.` | DNS only（☁️ 關閉） |
| CNAME | `passport` | `43866a2ba20d97e3.vercel-dns-017.com.` | DNS only（☁️ 關閉） |
| CNAME | `gacha` | `55ccf4f9c79c9db6.vercel-dns-017.com.` | DNS only（☁️ 關閉） |
| TXT | `_vercel` | 各自的驗證字串 | — |

> ⚠️ Cloudflare proxy（橘雲）必須關閉（灰雲），否則 Vercel SSL 無法自動簽發

---

## 四、Supabase — Redirect URLs ✅（2026-02-25 完成）

**專案**：`moonisland`（ID：`xlqwfaailjyvsycjnzkz`）
**位置**：Authentication → URL Configuration

| 設定項目 | 舊值 | 新值 |
|---------|------|------|
| Site URL | `https://moon-map-original.vercel.app` | `https://shop.kiwimu.com` |

**Redirect URLs（5 筆新增）：**
```
https://kiwimu.com/**
https://shop.kiwimu.com/**
https://map.kiwimu.com/**
https://passport.kiwimu.com/**
https://gacha.kiwimu.com/**
```

> 💡 wildcard `/**` 允許任意路徑回調，涵蓋 OAuth 登入後的所有重新導向

---

## 五、Google Cloud Console — OAuth 授權 ✅（2026-02-25 完成）

**專案**：`kiwimu-mbti`
**用戶端**：`Web client (auto created by Google Service)`
**Client ID**：`537717488268-nj67482l58smv8q3v1ovvuno2snfrvms.apps.googleusercontent.com`

### 已授權的 JavaScript 來源（共 8 個）
```
http://localhost
http://localhost:5000
https://kiwimu-mbti.firebaseapp.com
https://kiwimu.com           ← 原有
https://map.kiwimu.com       ← 2026-02-25 新增
https://shop.kiwimu.com      ← 2026-02-25 新增
https://passport.kiwimu.com  ← 2026-02-25 新增
https://gacha.kiwimu.com     ← 2026-02-25 新增
```

### 已授權的重新導向 URI（共 2 個）
```
https://kiwimu.com/__/auth/handler     ← Firebase OAuth callback
https://xlqwfaailjyvsycjnzkz.supabase.co/auth/v1/callback  ← Supabase callback
```

> 注意：OAuth 設定生效可能需要 5 分鐘至數小時

---

## 六、Firebase Console — Authorized Domains ✅（2026-02-25 完成）

**專案**：`kiwimu-mbti`
**位置**：Authentication → Settings → 授權網域

| 網域 | 類型 | 新增日期 |
|------|------|---------|
| localhost | Default | — |
| kiwimu-mbti.firebaseapp.com | Default | — |
| kiwimu-mbti.web.app | Default | — |
| kiwimu-mbti.vercel.app | Custom | 原有 |
| kiwimu-mbti-7jnp3r112-pensos-projects.vercel.app | Custom | 原有 |
| kiwimu-mbti-2ct8l0o9j-pensoair.vercel.app | Custom | 原有 |
| kiwimu.com | Custom | 原有 |
| map.kiwimu.com | Custom | **2026-02-25** |
| shop.kiwimu.com | Custom | **2026-02-25** |
| passport.kiwimu.com | Custom | **2026-02-25** |
| gacha.kiwimu.com | Custom | **2026-02-25** |

---

## 七、LINE Developers（LIFF 相關）

> ⚠️ **待辦**：shop.kiwimu.com LIFF 尚未設定（下一階段任務）

未來 LIFF 串接步驟：
1. 進入 https://developers.line.biz/
2. Provider → Channel → **LIFF** → 新增 App
3. Endpoint URL 設為 `https://shop.kiwimu.com`
4. 取得 LIFF ID → 加入 Next.js 環境變數
5. 在 Booking 前端引入 `@line/liff` SDK

---

## 八、驗證清單

DNS 傳播完成後（通常 < 5 分鐘）依序確認：

- [x] `map.kiwimu.com` 可正常訪問（Vercel + DNS ✅）
- [x] `shop.kiwimu.com` 可正常訪問（Vercel + DNS ✅）
- [x] `passport.kiwimu.com` 可正常訪問（Vercel + DNS ✅）
- [x] `gacha.kiwimu.com` 可正常訪問（Vercel + DNS ✅）
- [ ] Booking 頁面「逛展覽地圖」→ 跳轉 `map.kiwimu.com`（待人工驗證）
- [ ] Booking 頁面「甜點護照」→ 跳轉 `passport.kiwimu.com`（待人工驗證）
- [ ] Booking 頁面「Kiwimu 實驗室」→ 跳轉 `kiwimu.com`（待人工驗證）
- [ ] Google OAuth 登入 → 跨子網域 cookie 共享正常
- [ ] MBTI Lab → Moon Map 連結正確跳轉

---

## 附錄：遷移歷史

| 日期 | 事項 |
|------|------|
| 2026-02-24 | MBTI 主站從 `kiwimu-mbti.vercel.app` 遷移至 `kiwimu.com`，LINE Callback 更新 |
| 2026-02-25 | 全部 5 個子站程式碼端 URL 替換完成 |
| 2026-02-25 | Vercel 子網域 + Cloudflare DNS（Domain Connect 自動授權）✅ |
| 2026-02-25 | Supabase Site URL + Redirect URLs 更新 ✅ |
| 2026-02-25 | Google Cloud Console OAuth JS 來源 + 重新導向 URI 更新 ✅ |
| 2026-02-25 | Firebase Authorized Domains 新增 4 個子網域 ✅ |
