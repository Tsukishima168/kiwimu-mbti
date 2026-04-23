# V2 報告升級 — Session Handoff

> 這份給下一個 session 快速對齊方向。
> 先讀這份，再決定是要動內容、原型，還是正式實作。

---

## 目前定案

### V2 / V3 已分流

- **V2 = 更好的 MBTI 深度報告**
  - MBTI 社交貨幣不動
  - 題目仍然是 MBTI 題
  - 升級的是報告寫法、章節結構、閱讀體驗、付費節奏

- **V3 = 狀態報告**
  - MBTI 是入口，狀態是結論
  - 需要額外狀態題與 run history
  - 目前只存概念，不進本輪實作

V3 概念稿位置：
`/Users/pensoair/Obsidian-Vaults/Penso-SSOT/07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2026_V3_報告_框架概念.md`

---

## 這輪已完成

### 1. 32 份 V2 草案已清理成同一套語氣

Obsidian 路徑：
`/Users/pensoair/Obsidian-Vaults/Penso-SSOT/07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2026_V2_報告_32變體草案庫/`

已完成：
- `設計初衷與變動世代觀點` → `當代位置`
- `靈魂甜點與心錨` → `靈魂甜點`
- `V2 升級建議` → `深一層的問題`
- `經營建議` → `那個代價`
- 刪除整個 `整合方向與可執行儀式`
- 全 32 份新增 `帶走這個`

原則：
- 不用內部詞
- 不用命令式行動建議
- 保留命中感，但收束成「認知改變」

### 2. V2 正式頁面的章節邏輯已定

用戶看到的章節：

1. `當下的你`（免費）
2. `你的版本`（免費）
3. `四個維度`（付費）
4. `你怎麼活`（付費）
5. `你的原型`（付費）
6. `帶走這個`（付費）

paywall 放在 Chapter 02 後面。

### 3. 視覺節奏已定

Prototype 檔案：
`components/v2/trial/chapter-nav-prototype.html`

版面邏輯：
- Chapter 01 封面：`Dusk #140D1E`
- Chapter 02 內文：`Paper #F8F8F5`
- Paywall：`Ink #1A1A1A`
- Locked 03–06：`Paper #F8F8F5` + blur

一句話：
**深 → 白 → 深 → 白**

理由：
- Dusk 封面建立進入感
- Paper 讓報告真正可讀
- Ink paywall 製造張力
- Paper locked sections 讓結構可見，但內容不可讀

### 4. 正式 React 實作已經對齊主節奏

已動到：
- `components/v2/V2App.tsx`
- `components/v2/v2.css`
- `components/v2/KiwimuCharacter.tsx`
- `scripts/generate-v2-psych-archetypes.mjs`
- `data/v2TaiwanDrafts.generated.ts`
- `data/v2PsychArchetypes.generated.ts`

已完成：
- `V2App` 已接上 sticky chapter nav / Dusk cover / Paper report / Ink paywall / Paper locked teasers
- locked 03–06 不再是整塊 full content blur，而是 teaser 結構
- footer / dessert CTA 只在解鎖後出現
  - paywall 已串 LINE Pay MVP flow，confirm 成功可寫回 `profiles.v2_unlocked_at`
  - 正式頁內容源已接 `data/v2VariantReports.generated.ts`，讀取 32 份已清理的 A/T 變體稿

`npm run build` 已通過。

### 5. LINE Pay MVP 訂單紀錄已補齊

已新增：
- `supabase/migrations/004_line_pay_orders.sql`
- `server/linePayOrderStore.ts`
- `docs/LINE_PAY_MVP_SETUP.md`

流程：
- `/api/linepay/request` 先建立 `mbti.line_pay_orders`
- 建單失敗會中止 LINE Pay request，避免付款後找不到訂單
- request / confirm / cancel 都會更新同一筆 order
- `cancelUrl` 會主動帶 `orderId`
- confirm 會比對 transaction id，避免錯單 confirm

限制：
- 尚未補 webhook / payment details 二次對帳
- 尚未補 refund flow
- 尚未做後台對帳 UI

### 6. V2 第一版已公開上架

已完成：
- V1 結果頁 V2 升級卡已打開
- `/read/quiz` 已改為可索引
- `/read/{TYPE}-{A|T}` 已改為可索引
- `public/sitemap.xml` 已加入 `/read/quiz` + 32 變體頁
- `public/llms.txt` 已更新為 V2 公開第一版

注意：
- V2 第一版賣的是「完整 MBTI 深度報告」
- V3 才處理狀態報告 / 90 天變化敘事

---

## 還沒做完的事

### 1. 付款與解鎖流程已可跑，但還不是完整商業版

仍待補：
- webhook 或 payment details 查驗
- refund flow
- 後台對帳 UI
- 正式 LINE Pay key 上線前 rotate secret

---

## 下一步（照順序）

### Step 1｜LINE Pay 做一筆 sandbox end-to-end

要驗證：
- request 建單
- LINE Pay redirect
- confirm 成功
- `mbti.line_pay_orders.status = confirmed`
- 登入用戶 `profiles.v2_unlocked_at` 成功寫入
- cancel 能寫入 `status = cancelled`

### Step 2｜視覺 QA 正式頁

用 `/read/INFP-T?source=direct` 驗證：
- cover 不重複顯示 title
- Chapter 02 A/T 卡從 32 變體稿取文案
- Chapter 03/04/06 的 locked tease 不是舊 16-base 內容
- mobile nav 可橫向滑動或縮短文字

### Step 3｜再決定首次 / 回訪版本

這是商品完整度，不是現在的第一優先。
---

## 重要索引

### Repo

- `components/v2/DESIGN.md`
- `components/v2/EDITORIAL.md`
- `components/v2/V2_FUNNEL_PRODUCT_STRATEGY.md`
- `components/v2/V2_REPORT_ARCHITECTURE.md`
- `components/v2/CLAUDE_BRIEF_V2.md`
- `components/v2/PROMPT_PRESETS.md`
- `components/v2/trial/chapter-nav-prototype.html`

### SSOT

- `/Users/pensoair/Obsidian-Vaults/Penso-SSOT/07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2026_V2_報告_草案庫/`
- `/Users/pensoair/Obsidian-Vaults/Penso-SSOT/07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2026_V2_報告_32變體草案庫/`
- `/Users/pensoair/Obsidian-Vaults/Penso-SSOT/07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2026_V3_報告_框架概念.md`

---

## 一句話總結

這輪真正完成的，不是只做出一個 prototype。

是把方向重新鎖回來：
**V2 先做好 MBTI 深度報告，V3 再做狀態報告。**
