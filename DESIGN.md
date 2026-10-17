# Design System — Kiwimu MBTI Lab（`/`、`/explore`、`/answers`；V2 見 `components/v2/DESIGN.md`）

> 建立：2026-03-26 | 更新：2026-10-14（D1：只換色、不換結構）
> 依據：Obsidian `MBTI_V2_開發執行狀態.md` + 跨專案視覺比對
> 現行適用範圍：`/`（入口與 V1 測驗流程）、`/explore`（V1.5）、`/answers`。
> `/read`、`/read/quiz`、`/read/library`、`/read/:TYPE-VARIANT`（V2）**不適用本檔**。
>
> **V2 的正式 SSOT**：`components/v2/DESIGN.md`（Quiet Atlas，深綠固定主題）與
> `components/v2/v2-dark.css`。本檔下方提及 V2、`/v2`、`MBTI-Lab-V1.5-TEST` 元件的段落
> 屬歷史參考，不得覆蓋現行 V2。**舊稿所稱「V2 已採 Apple Dark」已作廢**（2026-10-14 更正）。
>
> **「適用」與「凍結」不矛盾**：生產凍結的是五個內容／邏輯檔——`constants.ts`、
> `components/ResultLegacyDump.tsx`、`i18n/resultTranslations.ts`、
> `i18n/questionsTranslations.ts`、`App.tsx`（含題庫／計分／付費程式）。凍結指「這些檔案
> 不得更動」，不是「`/` 的畫面不得調整」。`/` 的視覺由 `Intro`、`Quiz` 等非凍結元件與
> `styles/forest-skin.css` 控制，因此本檔適用。
>
> **2026-10-16 Penso 解凍 V1 結果頁顏色**：`components/ResultLegacyDump.tsx` 的螢光綠
> （`#C6FF00`／`#CCFF00`）已換柔金 `#D7C678`，根容器 `bg-kiwi-bg` 改 `bg-kiwi-paper`（奶油）；
> **內容、版面、IG Story 結構與邏輯仍凍結**（只准改色值與色彩 class）。其餘四個凍結檔
> （`constants.ts`、兩份 i18n、`App.tsx`）維持凍結。IG Story 分享圖的編輯風調色盤
> （`SHARE_EDITORIAL_PALETTE`：olive／moss／limeMist／`#F8F7F1`）不在本次範圍，未動。

## 色彩與結構的現行原則（2026-10-14，D1）

- **只換色、不換結構**：版面、文案、黑色墨線與邊框、黑白線稿 Kiwimu 都不動
  （長期規則：不破壞 Kiwimu 黑白極簡視覺）。
- 螢光綠（`#D4FF00`／`#C6FF00`／`#CCFF00`、`kiwi-green`）退場，改柔金 `#D7C678`。
- 公開頁紙底 `#FAFAFA` 改奶油 `#F5F0E8`。`kiwi-bg` token 仍被凍結檔使用，值不改；
  非凍結畫面改用 `kiwi-paper`。
- 淺色面次要文字用 `#5F6856`（對奶油 5.14:1，不得再淡）。

---

## Product Context

- **What this is:** Kiwimu MBTI 靈魂甜點測驗——前端免費漏斗（V1.5）+ 付費深度報告（V2）
- **Who it's for:** 台灣 YZ 世代（18-28 歲），MBTI 作為身份認同語言
- **Space:** 人格測驗 × IP 角色品牌 × 自我探索內容
- **V1.5 type:** 快速測驗 + 社群分享卡（5 題，免費）
- **V2 type:** 付費深度報告（40 題，NT$99）

---

## Aesthetic Direction

- **Direction:** Neo-Brutalist
- **Decoration level:** Minimal（版面靠硬邊框 + 強字型做結構，無裝飾元素）
- **Mood:** 清醒、有主張、不取悅人。就像深夜在亮光燈下翻開一本老掉牙的心理學課本，但它說的都是真的。
- **不做什麼:** ❌ 漸層色、❌ 磨砂玻璃 blur、❌ 圓潤 drop shadow、❌ 紫色任何使用

---

## Color

```css
/* ── 現行 tokens（2026-10-14；實作於 styles/tailwind.css 與 styles/forest-skin.css） ── */
--color-kiwi-gold:  #D7C678;   /* 柔金 — 主行動、目前狀態（取代舊酸綠 #CCFF00／#D4FF00） */
--color-ink:        #1A1A1A;   /* 墨黑 — 主文字、邊框、陰影（黑白線稿的線條色，不改） */
--color-kiwi-paper: #F5F0E8;   /* 奶油紙底（取代 #FAFAFA／#F8F8F5） */
--ku-text-soft:     #5F6856;   /* 淺色面次要文字，5.14:1 on 奶油 */
--ku-forest:        #1F2F1F;   /* 深綠 — 深色面、淺色面焦點環（2px，offset 2px） */

/* ── Semantic ── */
--color-border: var(--color-ink);          /* 邊框：永遠 ink，無透明度 */
--color-shadow: 6px 6px 0 var(--color-ink); /* hard shadow，無模糊 */
```

> 舊稿 token（`--color-acid #CCFF00`、`--color-paper #F8F8F5`、`--color-muted #888880`）已退場。
> `#888880` 對紙底只有約 3.4:1，不得再用於文字。

**使用原則：**
- 柔金用在目前狀態、卡片高亮、進度完成段與最重要的一個數字。
- **主行動按鈕依所在表面決定**（調度者 2026-10-14 修訂）：深色面（深綠卡、`/read` 深色主題、
  `/explore` 攝影入口、結果閘門卡）用柔金底配深綠字 `#1F2F1F`；淺色面（奶油或白）用深綠實心 `#1F2F1F`
  配奶油字 `#F5F0E8`。首頁 V2 入口是「卡片高亮」（柔金底、墨色字 `#111`），不是按鈕。
- 背景用奶油 `--color-kiwi-paper`，不用純白也不用深色（`/explore` 攝影入口頁是例外，保留灰階攝影）
- 邊框永遠 solid ink，1.5px
- **絕對不用漸層**（包括 CSS `gradient`、Tailwind `bg-gradient-*`）

**歷史差異（已統一）：** 2026-10-14 前 V1 用 `#FAFAFA`、V1.5 用冷紙 `#F8F8F5`；現在公開頁統一奶油 `#F5F0E8`。
`/explore` 題目與結果頁的紙色仍沿用 `#F8F8F5` 疊在灰階攝影上（攝影風不改）。

---

## Typography

| 角色 | 字型 | 用法 |
|------|------|------|
| Display / Hero | **Space Grotesk** | 大標題、型別名稱、分數 |
| Body / UI | **Inter** | 段落、按鈕標籤、表單 |
| Code / Label | **JetBrains Mono** | 型別代碼（INFP-A）、進度數字、badge |

```css
--font-display: 'Space Grotesk', 'Noto Sans TC', sans-serif;
--font-sans:    'Inter', 'Noto Sans TC', sans-serif;
--font-mono:    'JetBrains Mono', monospace;
```

**Type Scale:**
```
hero:    48-64px / 700 / Space Grotesk / line-height 1.0
h1:      32px    / 700 / Space Grotesk
h2:      24px    / 600 / Space Grotesk
body:    15-16px / 400 / Inter         / line-height 1.7
label:   11px    / 600 / JetBrains Mono / letter-spacing 0.25em / uppercase
```

---

## Spacing

- **Base unit:** 8px
- **Scale:** 4 / 8 / 16 / 24 / 32 / 48 / 64 / 96
- **Density:** Comfortable（不壓縮，給每個元素足夠呼吸空間）

---

## Layout

- **Approach:** Grid-disciplined（嚴格欄位，不做 editorial 不對稱）
- **Max content width:** 680px（單欄報告頁）/ 960px（有側欄的頁面）
- **Border radius:** `0px`（卡片）/ `999px`（pill 按鈕）— 二元選擇，無中間值
- **Mobile-first:** 所有元件從手機寬度設計

---

## Components — Kiwimu Design Tokens

已實作於 `MBTI-Lab-V1.5-TEST/src/components/kiwimu/`（歷史原型，不被 build 引用；表中 acid 現指柔金 `#D7C678`）：

| 元件 | 說明 | 關鍵樣式 |
|------|------|---------|
| `KiwimuCard` | 基礎容器 | ink border 1.5px + hard shadow 6px + radius 0 |
| `KiwimuButton` | 行動按鈕 | pill shape + hover: acid fill + lift -2px |
| `KiwimuBadge` | 標籤 | mono font + uppercase + ink/acid/outline 三種 |
| `KiwimuProgress` | 進度條 | 5 段模組點 + 細條整體進度 |
| `ImageSlot` | 圖片佔位 | type/aspect/alt/src? props |

---

## Motion

- **Approach:** Minimal-functional
- **Engine:** motion v12（已裝在 V2 tech stack）
- **原則:** 只有幫助理解的動態。無裝飾性動畫。
- **用在:** 題目切換 fade（150ms ease-out）、結果揭露 slide-up（250ms）、按鈕 hover lift（100ms）
- **不用:** scroll-driven animation、parallax、任何 loop 動畫

---

## V1.5 vs V2 視覺差異（歷史對照；V2 現況見 `components/v2/DESIGN.md`，`--color-acid` 現指柔金）

| | V1.5 `/explore` | V2 `/v2` |
|--|--|--|
| 背景 | `--color-paper` | `--color-paper` |
| 強調色 | `--color-acid`（題目頁用 ink 底反白） | `--color-acid`（CTA、解鎖、badge）|
| 結果呈現 | 型別 + 金句 + 分享卡（簡化）| 13 區塊深報告（付費解鎖）|
| 付費 | 免費 | NT$99 一次性 |
| 角色 | 題目選完後角色文字反應 | Kiwimu 轉場文案（5 段）|

---

## 與其他 Kiwimu 專案的關係

| 專案 | 主色系 | 字型 | 說明 |
|------|--------|------|------|
| **MBTI（`/`、`/explore`、`/answers`）** | `#F5F0E8` 奶油 + `#D7C678` 柔金，墨線稿保留 | Noto Sans/Serif TC | 本文件規範（V1 結果頁已於 2026-10-16 解凍換色，見上） |
| MBTI V2（`/read`） | 深林綠 Quiet Atlas + 柔金主按鈕 | Space Grotesk + Inter + Noto Sans TC | 不適用本檔，見 `components/v2/DESIGN.md` |
| moonmoon-gacha | `#F9F8F2` 暖紙 + Amber | Noto Sans TC | 獨立產品，暖色系 |
| moonmoon-dessert-passport | `#0A0A0A` 深黑 + Moon Gold | Inter | 後台深色系 |

V1.5 的 neo-brutalist 墨線結構是刻意差異；色彩已於 2026-10-14 併入月島深綠系統（柔金＋奶油），
各站色票以各站設計文件與五站契約為準。

---

## 跨站導覽（rail）

- 五站共用的頂部 rail 是**森林版**：深綠 `#1F2F1F`、奶油 `#F5F0E8`、柔金 `#D7C678`（目前所在站為柔金），
  中文入口 14px、操作區 48px；2026-10-13（PR #50）已合併上線，五站同步。舊稿「黑底／lime」描述作廢。
- 元件 `components/KiwimuUniverseRail.tsx` 與 `styles/kiwimu-universe.css` 是共用核心（五站 byte-identical，
  2026-10-15 起由 rail kit 安裝），本檔不規範其內容、也不得修改。本站自己的規則放 `styles/kiwimu-site.css`
  （`kw-site-kicker`、`kw-orbit-frame`、`kw-quiz-entry*`、`kw-account-menu`；首頁 V2 入口卡的柔金底在這裡），
  公開頁的紙底、頁尾與全域焦點／reduced-motion 放 `styles/forest-skin.css`。
- rail 點擊送 GA4 `universe_nav_click`（12 欄），見 `docs/GA4_EVENTS_REFERENCE.md` §2.10。

---

## Decisions Log

| 日期 | 決策 | 理由 |
|------|------|------|
| 2026-03-26 | 採用 Neo-Brutalist 方向（ink/acid/paper）| V2 定位為 YZ 世代 IP 品牌，需要鮮明個性 |
| 2026-03-26 | 棄用漸層色 | 漸層 = AI slop，與 neo-brutalist 矛盾 |
| 2026-03-26 | 棄用 Playfair Display / Cormorant Garamond | 太「奢侈品報告」，不符合 YZ IP 品牌感 |
| 2026-03-26 | 棄用「暖色夜境 #170D04」方案 | 設計方向錯誤，V2 已有確認的 neo-brutalist 系統 |
| 2026-03-26 | acid 使用頻率 < 10% | 稀有才有力量，過多則失去衝擊 |
| 2026-03-26 | Border-radius 二元（0 / pill）| 一致性，neo-brutalist 不用中間值 |
| 2026-10-14 | D1：kiwimu 只換色不換結構，螢光綠 → 柔金 `#D7C678`，紙底 → 奶油 `#F5F0E8` | 對齊月島深綠系統，保留黑白線稿與墨框；`kiwi-bg` 因凍結檔使用而不改值 |
| 2026-10-14 | 更正：V2 不是 Apple Dark，是 Quiet Atlas；`/` 適用本檔，凍結的是五個內容／邏輯檔 | 消除本檔與 `components/v2/DESIGN.md` 的矛盾 |
| 2026-10-16 | Penso 解凍 V1 結果頁顏色：螢光綠換柔金；內容仍凍結 | `ResultLegacyDump.tsx` 只改色值與色彩 class（7 行），`kiwi-bg` token 值不改，其餘四個凍結檔不動 |
