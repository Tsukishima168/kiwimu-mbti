# Kiwimu V2 — DESIGN.md (Apple Dark 實作規格書)

> **這份文件描述「現行實作」，不是願景稿。** 拍板結果：以 `v2-dark.css` 的
> Apple Dark 實作為單一真相來源（SSOT）。若本文件與程式碼不一致，以程式碼為準，
> 並回頭更新本文件。
>
> **Status**: 現行實作（live）。
> **Last updated**: 2026-07-12

---

## 0. Scope 聲明（邊界）

- 本文件**只**規範 `components/v2/` 底下的 MBTI V2 深度報告面（`/read/:TYPE-VARIANT`，
  核心 `components/v2/V2App.tsx` + `v2-dark.css`）。
- 根目錄 `DESIGN.md`（Neo-Brutalist）規範 V1 與其他面；`components/v2/DESIGN.md`
  （本檔）規範 V2 報告面。**兩者互不覆蓋**。V2 面刻意採用 Apple Dark（深色固定主題、
  有 blur、有漸層），這與根目錄的 Neo-Brutalist 規則是兩套獨立系統，不衝突。
- 歷史文件 `VISUAL_THESIS.md` / 舊版光邊系統敘述已被本實作取代，僅供沿革參考。

---

## 1. 定調

> Apple Dark：純黑基底、單一酸綠強調色、克制的光暈與呼吸感。
> 內容是主角，介面退到背景；動效是「呼吸」不是「表演」。

- 深色固定主題，不提供 light 切換。
- 唯一強調色是酸綠 `--acid (#CCFF00)`，用於 highlight / active / 進度 / dot，
  絕不整片鋪。
- 允許 blur（marquee、nav、ambient orb）與漸層（paywall 遮罩、orb），
  這是與根目錄 Neo-Brutalist 規則的明確差異。

---

## 2. 色彩 Token（實際值，出自 `v2-dark.css :root`）

| Token | 值 | 用途 |
|---|---|---|
| `--bg-0` | `#000000` | 頁面基底 |
| `--bg-1` | `#0D0D0D` | footer / rarity / abyssal 卡片底 |
| `--bg-2` | `#1C1C1E` | 主要卡片 / panel |
| `--bg-3` | `#2C2C2E` | 次級卡片 / option / subtype |
| `--t1` | `#F5F5F7` | 主文字 / 標題 |
| `--t2` | `rgba(245,245,247,0.72)` | 內文 |
| `--t3` | `rgba(245,245,247,0.35)` | 輔助 / label / muted |
| `--acid` | `#CCFF00` | 強調色 |
| `--acid-glow` | `rgba(204,255,0,0.16)` | 光暈 |
| `--acid-dim` | `rgba(204,255,0,0.07)` | 極淡強調底 |
| `--b1` | `rgba(255,255,255,0.10)` | 主要 border |
| `--b2` | `rgba(255,255,255,0.06)` | 次級 border |
| `--sep` | `rgba(255,255,255,0.07)` | 分隔線 |

**規則**：border 一律走 `--b1` / `--b2` / `--sep`，不要新造 `rgba(255,255,255,0.xx)`
魔術數字。強調光暈用 `rgba(204,255,0,…)` 家族。

---

## 3. 字體

單一 `@import` 在 `v2.css`（先於 `v2-dark.css` 載入）：
Space Grotesk / Inter / JetBrains Mono / Noto Sans TC。

| Token | 堆疊 | 角色 |
|---|---|---|
| `--f-display` | `'Space Grotesk', sans-serif` | 大標題、型別字、數字 |
| `--f-body` | `'Inter', sans-serif` | 內文 |
| `--f-mono` | `'JetBrains Mono', monospace` | kicker / label / eyebrow / 代碼標籤 |

CJK 由 `Noto Sans TC` 兜底（見 `v2.css` 的 `font-family` 宣告）。
Mono 類文字慣例：`letter-spacing` 0.1–0.22em、`text-transform: uppercase`。

---

## 4. 半徑 / 節奏 Token

| Token | 值 | | Token | 值 |
|---|---|---|---|---|
| `--r-sm` | 8px | | `--dur-fast` | 150ms |
| `--r-md` | 12px | | `--dur` | 200ms |
| `--r-lg` | 16px | | `--dur-slow` | 620ms |
| `--r-xl` | 20px | | | |
| `--r-pill` | 999px | | | |

**規則**：圓角只用 `--r-*`；transition 時長只用 `--dur*`。新程式碼不得再寫
`12px` / `200ms` 這類裸值。

---

## 5. 斷點與版面

- **斷點**：`480px`、`560px`。
  - `≤ 560px`：章節導覽收成底部細條（見 §7）；`.ad-grid-3` 轉單欄。
  - `≤ 480px`：hero 型別字縮小、`.ad-grid-2` 轉單欄、landing panel padding 收斂。
- **版面容器**：`.ad-page { max-width: 560px; margin: 0 auto; padding: 56px 20px 80px; }`
  —— 報告是單欄長捲軸，不是多欄 dashboard。
- 頂部固定 marquee（`.ad-marquee-fixed`，z-index 100）+ 頂部 2px 捲動進度條
  （`.v2-report-progress`，z-index 200）。

---

## 6. 動效原則

> 循環呼吸感，忌彈跳、滑入、翻轉。

- **允許**：subtle opacity 變化、`translateY` 幾 px 的 rise、緩慢的 pulse/float
  呼吸（`ad-pulse` 2.4s、`ad-float` 4s）、marquee 平移。
- **禁止**：誇張入場、彈跳（overshoot）、大位移滑入、3D 翻轉、快速縮放。
- **進場 reveal**：`.ad-reveal` 由 IntersectionObserver 觸發，進視窗一次性加
  `.is-visible`；效果為 `opacity 0→1` + `translateY(12px)→0`，時長 `--dur-slow`。
  只在 `prefers-reduced-motion: no-preference` 下有初始隱藏態，reduce 時內容永遠可見。
- **`prefers-reduced-motion: reduce`**：關閉所有裝飾動畫（orb / dot / float / marquee）
  與 reveal / nav / 進度條 transition；章節導覽捲動改用 `behavior: 'auto'`（JS 端偵測）。

---

## 7. 章節導覽規格（B1）

章節定義在 `V2App.tsx` 的 `REPORT_CHAPTERS`（六章，字串為凍結文案，見 §8）。
IntersectionObserver 監看六個 `id="ch-0x"` 錨點，`activeChapter` 隨捲動更新。

**8 個內容區塊 → 6 章對映**（DOM 順序，單調不回跳；錨點掛在每章第一個區塊）：

| 章 | `REPORT_CHAPTERS` 標題 | 錨點區塊（`id`） | 併入同章的後續區塊 |
|---|---|---|---|
| ch-01 | 01 當下的你 | HERO（`header.ad-hero`） | Tag Wall（01） |
| ch-02 | 02 你的版本 | Professional Insights（02） | — |
| ch-03 | 03 四個維度 | Dimension Spectrum（03） | — |
| ch-04 | 04 認知行為模式 | Digital Persona（04） | — |
| ch-05 | 05 你的原型 | Historical Archetypes（05） | — |
| ch-06 | 06 帶走這個 | Career × Relationship（06） | Soul Reflection（07）、Carry |

- **桌機（> 560px）**：右側固定垂直導覽軌（`.ad-chapternav`，右 20px、垂直置中）。
  平時只顯示 dot，hover 整條或該章 active 時浮現標籤（`--f-mono`）。active dot 為酸綠
  發光並微放大。
- **手機（≤ 560px）**：收成底部細條 —— 左側顯示「目前章節標題」（`.ad-chapternav-current`，
  用既有 `REPORT_CHAPTERS` 字串），右側六個可點 dot；配合頂部 2px 進度條。
  不遮內容（`.ad-page` 已有 80px 底部留白 + `env(safe-area-inset-bottom)`）。
- **點擊**：`handleChapterNav` 平滑捲動至該章；若該章區塊未渲染（鎖定態），
  fallback 捲至 `.ad-paywall-box`。
- **鎖定顯示**：`chapter.locked && !canReadReport` 時該 pill 呈鎖定弱化樣式。
- 錨點清空遮擋：`[id^="ch-0"] { scroll-margin-top: 88px; }`。

---

## 8. 凍結文案邊界

- `V2App.tsx` 內所有跨型別共用的中文/英文顯示字串（章節標題、section kicker、
  section-lead、reflect、paywall 文案、footer 文案、狀態句等）**不可改字**。
  搬移逐字相同可以，改寫不行。
- 型別專屬內容一律讀 `data/*.generated.ts`（`v2VariantReports` / `v2TaiwanDrafts` /
  `v2PsychArchetypes`），**不得手改 generated 檔**。
- 新增 UI 標籤若無可用既有字串，用英文小標（如導覽 `aria-label="Chapters"`），
  並在交付時列出。

---

## 9. 互動狀態一致性

- 按鈕（`.ad-btn-primary` / `.ad-btn-ghost` / `.kiwimu-btn*`）與導覽 item 一律具備
  `:hover`、`:focus-visible`（酸綠 outline + offset）、`:active`（微位移/收斂光暈）。
- hover 只動 border 色、文字色、光暈、`translateY(-1px)` 級距，不做大變形。
- 所有 transition 走 `--dur*` token。
