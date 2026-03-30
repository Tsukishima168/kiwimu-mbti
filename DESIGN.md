# Design System — Kiwimu MBTI Lab (V1.5 + V2)

> 建立：2026-03-26 | 依據：Obsidian `MBTI_V2_開發執行狀態.md` + 跨專案視覺比對
> 適用範圍：`/explore`（V1.5）+ `/v2`（V2）

---

## Product Context

- **What this is:** Kiwimu MBTI 靈魂甜點測驗——前端免費漏斗（V1.5）+ 付費深度報告（V2）
- **Who it's for:** 台灣 YZ 世代（18-28 歲），MBTI 作為身份認同語言
- **Space:** 人格測驗 × IP 角色品牌 × 自我探索內容
- **V1.5 type:** 快速測驗 + 社群分享卡（5 題，免費）
- **V2 type:** 付費深度報告（40 題，NT$149）

---

## Aesthetic Direction

- **Direction:** Neo-Brutalist
- **Decoration level:** Minimal（版面靠硬邊框 + 強字型做結構，無裝飾元素）
- **Mood:** 清醒、有主張、不取悅人。就像深夜在亮光燈下翻開一本老掉牙的心理學課本，但它說的都是真的。
- **不做什麼:** ❌ 漸層色、❌ 磨砂玻璃 blur、❌ 圓潤 drop shadow、❌ 紫色任何使用

---

## Color

```css
/* ── V2 + V1.5 共用 tokens ── */
--color-acid:   #CCFF00;   /* 酸綠 — 主彈出色，稀有使用，出現即有意義 */
--color-ink:    #1A1A1A;   /* 墨黑 — 主文字、邊框、陰影 */
--color-paper:  #F8F8F5;   /* 紙白 — 主背景 */
--color-muted:  #888880;   /* 消音灰 — 輔助文字 */

/* ── Semantic ── */
--color-border: var(--color-ink);          /* 邊框：永遠 ink，無透明度 */
--color-shadow: 6px 6px 0 var(--color-ink); /* hard shadow，無模糊 */
```

**使用原則：**
- `--color-acid` 出現頻率 < 10%。只用在：CTA 按鈕 hover、active badge、progress 完成段、最重要的一個數字
- 背景永遠 `--color-paper`，不用純白也不用深色
- 邊框永遠 solid ink，1.5px
- **絕對不用漸層**（包括 CSS `gradient`、Tailwind `bg-gradient-*`）

**與 V1 的差異：** V1 用 kiwi-bg（`#FFF9F0` 暖米）。V1.5/V2 用 paper（`#F8F8F5` 冷紙），視覺上有意區隔。

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

已實作於 `MBTI-Lab-V1.5-TEST/src/components/kiwimu/`：

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

## V1.5 vs V2 視覺差異

| | V1.5 `/explore` | V2 `/v2` |
|--|--|--|
| 背景 | `--color-paper` | `--color-paper` |
| 強調色 | `--color-acid`（題目頁用 ink 底反白） | `--color-acid`（CTA、解鎖、badge）|
| 結果呈現 | 型別 + 金句 + 分享卡（簡化）| 13 區塊深報告（付費解鎖）|
| 付費 | 免費 | NT$149 一次性 |
| 角色 | 題目選完後角色文字反應 | Kiwimu 轉場文案（5 段）|

---

## 與其他 Kiwimu 專案的關係

| 專案 | 主色系 | 字型 | 說明 |
|------|--------|------|------|
| MBTI V1 (`/`) | `#FFF9F0` 暖米 + `#C47F3C` 焦糖 | Noto Sans/Serif TC | 凍結，不調整 |
| **MBTI V1.5/V2** | `#F8F8F5` 紙白 + `#CCFF00` 酸綠 | Space Grotesk + Inter | 本文件規範 |
| moonmoon-gacha | `#F9F8F2` 暖紙 + Amber | Noto Sans TC | 獨立產品，暖色系 |
| moonmoon-dessert-passport | `#0A0A0A` 深黑 + Moon Gold | Inter | 後台深色系 |

V1.5/V2 的 neo-brutalist ink/acid 是刻意差異——明確告訴用戶「這不是普通測驗頁，這是進階版」。

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
