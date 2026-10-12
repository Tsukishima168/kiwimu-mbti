# Kiwimu V2 — DESIGN.md (Quiet Atlas 實作規格書)

> **這份文件描述「現行實作」，不是願景稿。** 拍板結果：以 `v2-dark.css` 的
> Quiet Atlas 實作為單一真相來源（SSOT）。若本文件與程式碼不一致，以程式碼為準，
> 並回頭更新本文件。
>
> **Status**: 現行實作（live）。
> **Last updated**: 2026-10-11（上方導覽、文字用途與持續演進規則）
>
> 舊版 Apple Dark 規格保留在 `DESIGN.md.bak-20260905`，
> 舊 CSS 保留在 `v2-dark.css.bak-20260905`。

---

## 0. Scope 聲明（邊界）

- 本文件**只**規範 `components/v2/` 底下的 MBTI V2 閱讀流程：入口（`/read`）、
  40 題測驗（`/read/quiz`）、已購報告書架（`/read/library`）與 32 變體報告（`/read/:TYPE-VARIANT`）。核心為
  `V2Welcome.tsx`、`V2QuizFlow.tsx`、`V2App.tsx` 與 `v2-dark.css`。
- 根目錄 `DESIGN.md`（Neo-Brutalist）規範 V1 與其他面；`components/v2/DESIGN.md`
  （本檔）規範 V2 報告面。**兩者互不覆蓋**。V2 面刻意採用 Quiet Atlas（深綠固定主題、
  有 blur、有漸層、有圓拱），這與根目錄的 Neo-Brutalist 規則是兩套獨立系統，不衝突。
- 歷史文件 `VISUAL_THESIS.md` 的「角色是錨、狀態是風」與「32 基礎形一次畫完」
  兩條主張，已由 2026-09 的 32 場景圖實際落地；其餘章節仍屬沿革參考。
- 檔名維持 `v2-dark.css`（沿用既有 import 路徑），但內容已是 Quiet Atlas。

---

## 0.1 視覺資產契約

- `data/kiwimuVisualAssets.ts` 是所有靜態 Kiwimu 圖片的唯一映射來源；正式元件不得再散寫
  Cloudinary URL，也不得直接 import `data/mbti32Assets.generated.ts`。月島現行商品圖是例外：
  只能使用 unified dessert contract 回傳的 `image_url`，不得把動態商品 URL 抄回靜態 catalog。
- `components/visuals/KiwimuVisual.tsx` 統一處理 intrinsic size、載入策略、CORS、
  `object-fit` 與失敗 fallback。
- `components/visuals/KiwimuScenePlate.tsx` 是場景圖版（圓拱畫框 + 博物館式標註）的
  唯一元件，只用在大版位。
- 資產角色：Campaign（入口主視覺）、Identity（16 型去背插畫）、State（6 組過場）、
  Dessert（甜點）、**Scene（32 變體場景，2026-09 新增）**。同一主畫面只安排一個主要角色。

### Scene 層：一張圖三種用法

32 場景圖（`kiwimu-mbti-32-handfeel-singles-v1`）以
`scripts/build-mbti32-assets.py` 產出五種尺寸，落在 `public/assets/mbti32/`：

| 尺寸 | 裁切 | 用在哪 |
|---|---|---|
| `scene` 1600² / `sceneSm` 800² | 原圖全景 | hero 圖版、報告封面 |
| `portrait` 720² | 以角色框為中心，pad 1.60 | 卡片、免費結果頁 |
| `avatar` 224² | 以角色框為中心，pad 1.34 | chip、導覽 |
| `og` 1200×630 WebP / `ogJpg` JPEG | 角色置中偏上 | 社群分享（JPEG 為 LINE 保底） |

**為什麼不是直接換掉 identity 圖**：場景圖裡的 Kiwimu 只佔畫面約三成，
直接縮到 84px 的 chip 會完全認不出角色。所以大版位走全景（角色小、世界大，
符合 Quiet Atlas 的陪伴感），小版位走以角色框為中心的裁切——黑長喙、黑 U 型眼、
黑短腳一定在框內。既有的 16 型 identity cutout 保留，供需要真去背的版位使用。

- 角色框（`CHARACTER_BOXES`）是人工逐張核定後寫死在管線裡的，不做自動偵測：
  厚塗筆觸會讓連通區塊碎裂，亮地板與暗角都會被誤判。
  更換素材後跑 `npm run assets:mbti32:verify` 產生疊框拼版重新核對。
- Taste Pairing 的商品圖只讀 unified dessert contract；沒有現行圖片就留白並交代菜單狀態，
  不可依 16 型或草稿名稱猜一張相似圖片。圖片保留自然色，外框、caption 與資訊層遵守本規格。

---

## 1. 定調

> Quiet Atlas：深綠 sanctuary 打底、奶油白文字、小面積暖琥珀訊號。
> 把一份人格報告當成內在甜點圖鑑——安靜、精確、值得湊近看。
> 內容是主角，介面退到背景；動效是「呼吸」不是「表演」。

依 `output/pdf/kiwimu-a1-poster-philosophy.md`：

- **空間**：安靜但不空。圓拱、遮蔽的路徑、淺舞台、小小的角色，
  像走在一座私人庇護所裡。圓拱只用在圖版（標本框），卡片維持柔和直角。
- **色彩承載情緒結構**：深綠與苔綠構成保護性的世界，奶油白讓角色溫柔可讀，
  小面積的黃橘是情緒訊號而不是裝飾。
- **尺度就是陪伴感**：Kiwimu 小到足以謙卑地待在世界裡；16 型與 32 變體是
  「被觀察的標本」，不是行銷徽章。
- **文字是稀疏的視覺樂器**：雙語小標像博物館標註或植物標本卡，
  不用段落解釋眼睛已經看得懂的結構。

規則：

- 深色固定主題，不提供 light 切換。
- 強調色是暖琥珀 `--signal (#E8A64A)`，用於 highlight / active / 進度 / dot，
  絕不整片鋪。`--acid` 保留為 `--signal` 的別名，讓舊規則不必逐條改寫。
- 允許 blur（marquee、nav、ambient orb）與漸層（頁面頂光、paywall 遮罩、圖版 scrim）。

---

## 2. 色彩 Token（實際值，出自 `v2-dark.css :root`）

### 2.1 站台層（32 型共用）

| Token | 值 | 用途 |
|---|---|---|
| `--bg-0` | `#0D1C15` | 頁面基底（深林綠，2026-09-05 由 #0A1310 提亮一階以讓綠色相讀得出來） |
| `--bg-1` | `#12241A` | footer / rarity / abyssal 卡片底 |
| `--bg-2` | `#1B3124` | 主要卡片 / panel |
| `--bg-3` | `#26412F` | 次級卡片 / option / subtype |
| `--t1` | `#F3EFE2` | 主文字 / 標題（奶油白） |
| `--t2` | `rgba(var(--cream-rgb), 0.74)` | 內文 |
| `--t3` | `.v2-surface` 內 `rgba(var(--cream-rgb), 0.68)` | 輔助 / label / muted；`:root` 的 0.44 是舊預設，不能用來判斷 surface 的實際對比 |
| `--signal` | `#E8A64A` | 暖琥珀訊號色 |
| `--on-signal` | `#14210F` | 壓在訊號色上的文字 |
| `--moss` | `#7A9470` | 苔綠，結構性中間調 |
| `--acid` | `var(--signal)` | 舊名別名，勿在新程式碼使用 |
| `--acid-glow` / `--acid-dim` | `rgba(var(--signal-rgb), .18/.08)` | 光暈 / 極淡強調底 |
| `--b1` / `--b2` / `--sep` | `rgba(var(--cream-rgb), .14/.075/.09)` | border / 分隔線 |

原色三元組 `--forest-rgb` / `--cream-rgb` / `--signal-rgb` / `--moss-rgb` 供
`rgba()` 疊透明度用。

### 2.2 人格層（每個變體不同）

| Token | 來源 | 用途 |
|---|---|---|
| `--type-deep` | 場景取樣，L 夾在 0.06–0.17 | 圖版底、標本框底 |
| `--type-accent` | 場景取樣，L 夾在 0.52–0.70 | 變體 chip 底、引文左線、dot |
| `--type-glow` | 場景取樣，L 夾在 0.68–0.84 | section kicker、圖版標註等 9–11px 小標 |

由 `sceneAccentStyle(asset)` 注入報告根層，另含 `--focal-x/y`（角色中心點，
給 `object-position` 用）。取樣值會先做亮度／彩度正規化再輸出——直接用原始取樣色，
暗場景取出的 accent 會讓 chip 上的深色字讀不到。

**規則**：
- border 一律走 `--b1` / `--b2` / `--sep`，不要新造 `rgba(...,0.xx)` 魔術數字。
- 需要「跟著人格走」的小面積強調用 `--type-*`；跨型別一致的用 `--signal`。
- 不得手工指定人格色；顏色只能來自場景取樣（見 `docs/MBTI_32_COLOR_REFERENCE.md`
  的 Status 說明）。

---

## 3. 字體

Space Grotesk / Inter / JetBrains Mono / Noto Sans TC 由 `index.html` 的獨立
stylesheet link 載入。不要再放回 lazy CSS 的 `@import`：外部字型失敗時，
頁面仍須使用既有 fallback 正常顯示。

| Token | 堆疊 | 角色 |
|---|---|---|
| `--f-display` | `'Space Grotesk', 'Noto Sans TC', sans-serif` | 大標題、型別字、數字 |
| `--f-body` | `'Inter', 'Noto Sans TC', sans-serif` | 內文、中文介面操作 |
| `--f-mono` | `'JetBrains Mono', 'Noto Sans TC', monospace` | kicker / label / eyebrow / 代碼標籤 |

CJK 由 `Noto Sans TC` 兜底（見 `v2.css` 的 `font-family` 宣告）。
Mono 類文字慣例：`letter-spacing` 0.1–0.22em、`text-transform: uppercase`。
中文帳號導覽使用 body 字型，不套大字距或 uppercase。

### 3.1 共用文字用途

以下 token 限定在 `.v2-app`，入口、帳號列與後續新增元件沿用；既有報告字級
逐元件收斂，不在一次改動中全部替換。

| Token | 值 | 用途 |
|---|---|---|
| `--text-body` | 16px | 入口引言與主要閱讀文字 |
| `--text-secondary` | 14px | 帳號操作、返回入口、付款與進度保存說明 |
| `--text-label` | 12px | 圖鑑副標與裝飾標註 |

付款與保存限制屬重要資訊，不得降成裝飾標註。文字可以換行、放大，
不得用固定高度或截斷隱藏必要說明。

---

## 4. 半徑 / 節奏 Token

| Token | 值 | | Token | 值 |
|---|---|---|---|---|
| `--r-sm` | 8px | | `--dur-fast` | 150ms |
| `--r-md` | 12px | | `--dur` | 200ms |
| `--r-lg` | 16px | | `--dur-slow` | 620ms |
| `--r-xl` | 20px | | | |
| `--r-pill` | 999px | | | |
| `--r-arch` | `clamp(72px, 17vw, 190px)` | | | |

`--r-arch` 只用在圖版（`.ad-scene` / `.ad-specimen` / `.ad-dessert-visual`）的
上緣，做出 Quiet Atlas 的圓拱建築語彙；卡片不用拱形。

**規則**：圓角只用 `--r-*`；transition 時長只用 `--dur*`。新程式碼不得再寫
`12px` / `200ms` 這類裸值。

`.v2-app` 的共用間距用途：`--space-tight: 8px`、`--space-control: 12px`、
`--space-inline: 16px`、`--space-block: 24px`、`--space-section: 32px`。
先用在帳號列與入口說明，不新增第二套配色／字體／圓角。44px 觸控下限
是操作需求，不以縮減視覺重量為由降低。

---

## 5. 斷點與版面

- **斷點**：`480px`、`560px`。
  - `≤ 560px`：章節導覽收成底部細條（見 §7）；`.ad-grid-3` 轉單欄。
  - `≤ 480px`：hero 型別字縮小、`.ad-grid-2` 轉單欄、landing panel padding 收斂。
- **版面容器**：`.ad-page { max-width: 560px; margin: 0 auto; padding: 56px 20px 80px; }`
  —— 報告是單欄長捲軸，不是多欄 dashboard。
- **破格（`.ad-bleed`）**：≥900px 時圖版可以走到 `min(84vw, 900px)` 並置中，
  閱讀欄仍維持 560px 的舒適行長。手機是 reader mode，桌機是 cinema mode。
  置中用 `left: 50% + translateX(-50%)`，**不要**用左右負 margin——
  兩側同時給負值會被 over-constrain 規則丟掉一側，造成偏移與橫向溢出。
- **圖版比例**：`<640px` 為 1:1、`640–899px` 為 4:3、`≥900px` 為 16:10。
- 頂部固定 marquee（`.ad-marquee-fixed`，z-index 100）+ 頂部 2px 捲動進度條
  （`.v2-report-progress`，z-index 200）。

---

## 6. 動效原則

> 循環呼吸感，忌彈跳、滑入、翻轉。

- **允許**：subtle opacity 變化、`translateY` 幾 px 的 rise、緩慢的 pulse/float
  呼吸（`ad-pulse` 2.4s、`ad-float` 4s）、marquee 平移、
  圖版的 `ad-scene-breathe`（24s、scale 1→1.018）。
- **禁止**：誇張入場、彈跳（overshoot）、大位移滑入、3D 翻轉、快速縮放。
- **進場 reveal**：`.ad-reveal` 由 IntersectionObserver 觸發，進視窗一次性加
  `.is-visible`；效果為 `opacity 0→1` + `translateY(12px)→0`，時長 `--dur-slow`。
  只在 `prefers-reduced-motion: no-preference` 下有初始隱藏態，reduce 時內容永遠可見。
- **`prefers-reduced-motion: reduce`**：關閉所有裝飾動畫（orb / dot / float / marquee /
  scene-breathe）
  與 reveal / nav / 進度條 transition；章節導覽捲動改用 `behavior: 'auto'`（JS 端偵測）。

---

## 6.1 入口與測驗

- `/read` 與 `/read/quiz` 共用 `V2Welcome`。首屏以「你有自己的樣子。也有此刻的狀態。」
  建立閱讀命題，右側只放一張主要場景圖；32 格 atlas 是可探索的索引，不搶主視覺。
- 入口帳號列左側為「V2 敘事探索／自我探索圖鑑」，右側保留「我的報告／登入或登出」。
  圖鑑副標整合在同一列，不再另放英文 masthead 與版本號；帳號提示可自然增高、換行。
- 開始或續答是主要按鈕；返回圖鑑／快速探索是帶底線的次要文字入口，
  仍保留44px觸控高度與可見焦點。重新開始維持既有草稿清除邏輯。
- 入口要在首屏交代 40 題、32 種閱讀版本與可自行停下的節奏，並在開始前明示這是
  敘事探索工具，不是醫療或心理診斷。
- 測驗以單題閱讀為基準；手機長題與文字放大走整頁自然捲動，不建立題目內的小捲軸，
  不以固定高度裁切選項。進度按已作答題數計算，不得讓進度倒退。
- 不再於每8題插入全屏章節過場；普通作答420ms勾選回饋，reduced-motion不等待。
  最後一題立即整理結果，不等菜單照片。
- 手機閱讀字級分三層：主要內文 16px、次要提示 14px、介面標註 12px；選項文字 16px，
  不以 10–11px 承載需要讀懂的資訊。
- 手機不顯示 V2 跑馬燈，跨站導覽在首屏後隨頁面捲走，只保留頂端 3px 閱讀進度；
  桌機跨站導覽維持 sticky，跑馬燈固定在其下方。
- 選項保持對等語氣，不暗示成熟度或能力高低。A/T 題目描述最近的自我回應方式，
  前四軸描述較穩定的偏好。

---

## 7. 章節導覽規格（B1）

### 測驗續答與輔助操作（2026-10-09）

- 40 題作答暫存於同一分頁的 sessionStorage，24 小時失效；只保存選項索引、題庫版本與時間，不是帳號同步或購買權限。
- 重新整理後先顯示「接著答第 N 題／重新開始」，不自動替使用者選擇；題庫文字、選項、順序或權重變更時，舊進度無效。
- 最後一題或結果整理中斷時，回到最後一題重新回答；完成後移除暫存，不由暫存自動觸發完成通知。
- 儲存受限時仍可作答，顯示保留分頁的提示；所有作答按鈕、上一題與續答控制至少 44px。
- 選取時立即保留回饋並鎖住快速連按；切題後焦點移到題目。reduced-motion 不等待裝飾轉場，且跳過章節動畫。

### 報告導覽

章節定義在 `V2App.tsx` 的 `REPORT_CHAPTERS`（八章）。被動 scroll listener 依
八個 `id="ch-0x"` 錨點的位置更新 `activeChapter`，不受公開 checkout 開關影響。

報告主容器使用 `atlas-report-hero`、`atlas-report-section`、`atlas-report-footer`、
`atlas-report-feedback`。避免通用 `ad-hero`／`ad-section` 等名稱與 Safari 內容封鎖器
的隱藏規則碰撞，造成已購內容消失；子元件樣式沿用既有命名。

章節預設可見，不依賴 IntersectionObserver 加上 `is-visible` 才能閱讀。
進場動畫只做輕微明暗與位移，背景分頁未觸發動畫時仍可讀；reduced-motion 關閉動畫。

**八章對映**（DOM 順序，單調不回跳）：

| 章 | `REPORT_CHAPTERS` 標題 | 錨點區塊（`id`） | 併入同章的後續區塊 |
|---|---|---|---|
| ch-01 | 01 當下的你 | HERO（`header.atlas-report-hero`：圖版 + 型別 + 引文） | Tag Wall（01） |
| ch-02 | 02 你怎麼保護自己 | Professional Insights（02） | 狀態場景、A/T 對照 |
| ch-03 | 03 偏好怎麼出現 | Dimension Spectrum（03） | — |
| ch-04 | 04 生活裡的樣子 | Digital Persona（04） | 日常場景 |
| ch-05 | 05 可以試的事 | 四張可執行練習卡（05） | — |
| ch-06 | 06 工作與關係 | Career × Relationship（06） | — |
| ch-07 | 07 感官與提問 | Soul Reflection + Abyssal Questions（07） | — |
| ch-08 | 08 帶走這個 | Carry（08） | — |

- **桌機（> 560px）**：右側固定垂直導覽軌（`.ad-chapternav`，右 20px、垂直置中）。
  平時只顯示 dot，hover 整條或該章 active 時浮現標籤（`--f-mono`）。active dot 以訊號色
  發光並微放大。
- **手機（≤ 560px）**：使用底部原生 `<details>` 清單。收合時顯示目前章節，展開後
  顯示八個有文字的跳轉按鈕；配合頂部 3px 進度條。清單不依賴 hover，按鈕觸控高度
  至少 44px，且不遮內容（`.ad-page` 已有底部安全留白）。
- **點擊**：`handleChapterNav` 平滑捲動至該章；若該章區塊未渲染（鎖定態），
  fallback 捲至 `.ad-paywall-box`。
- **鎖定顯示**：`chapter.locked && !canReadReport` 時該 pill 呈鎖定弱化樣式。
- 錨點清空遮擋：桌機保留 100px；手機因已移除頂部跑馬燈，改為 20px。

---

## 8. 內容契約

- 共用介面文案可以為清楚度、誠實性與手機可讀性修訂，但必須同步更新本文件並完成
  實機流程測試。不得把敘事型閱讀寫成心理診斷、能力排名或經心理計量驗證的測驗。
- 型別專屬內容一律讀 `data/*.generated.ts`（`v2VariantReports` / `v2TaiwanDrafts` /
  `v2PsychArchetypes`），**不得手改 generated 檔**。
- 題目與 32 變體內容住在 Obsidian 正本，經生成器輸出。每份變體必須有 `state` 與
  四個 `practices`：覺察問題、行為實驗、關係練習、感官停頓。
- 每份變體還必須有 `narrative` 前台敘事層：一段 70–130 字的核心說明、`state`／
  `daily`／`work`／`relationship` 四個 35–160 字的生活場景，以及辨識留白。核心說明分兩段、每個場景分為情境與可選行動兩段；不以補字達到下限。
  生成器與測試要阻止缺場景、順序錯誤、過長內容與「天生／永遠／注定／一眼看穿」
  等斷言進入這一層。
- 前台敘事順序固定為「觀察 → 場景 → 功能或代價 → 可選行動」。場景使用
  `.ad-narrative-scene` 顯示，每章最多一張；工作與關係各自放在所屬卡片內，避免
  把例子堆成另一面文字牆。
- 型別對應出的狀態只是敘事假設。獨立九格狀態量測完成前，介面必須明示它沒有測量
  最近能量或耗損；文案用「可能、常見、可以對照」等語氣，並允許讀者保留不同意見。
- 甜點的品名、現行商品名、介紹、圖片、供應狀態與 CTA 以月島 unified dessert contract
  為真相源（production 走 `/api/mbti-dessert`，本機開發直讀 Shop API）。草稿中的
  `dessert.name`／`visualLogic`／`pairings` 只屬編輯敘事：名稱吻合時可把 `visualLogic`
  標成「品牌敘事 · 非商品說明」，未經菜單驗證的配飲不得以前台商品資訊呈現。
- API 無法讀取時，前台不得回退到過期品名或推測圖片；只顯示同步失敗狀態與菜單 CTA。
- 歷史原型、名人歸類與稀有度若沒有可核對來源，只能留在編輯草案，不能進正式前台。
- 分享連結直接開啟型別報告時，若本機沒有同型別完整作答紀錄，只顯示質性維度說明，
  不得合成百分比。A/T 是近期自我回應傾向，不宣稱為官方 MBTI 第五維。

---

## 9. 互動狀態一致性

- V2 入口、報告與「我的報告」沿用同一組 Quiet Atlas 字色、留白與按鈕；帳號導覽隨文件捲動，手機觸控目標至少 44px。
- 「我的報告」桌機兩欄、手機單欄；品項、購買金額與日期分層呈現，付款紀錄預設收合，避免細節佔據閱讀入口。
- 新購買必須先登入已驗證 Email 的帳號。介面明示報告會保存到該帳號、付款通知寄至該帳號的 Email；匿名舊單只在原付款裝置提供明確的「保存這份已購報告」按鈕。
- 沒有已購報告、登入失效、讀取失敗與通知未寄出必須各有文字；寄信失敗不遮擋已付款的閱讀入口，不能以登入成功或通知送出替代付款權限核對。

- 按鈕（`.ad-btn-primary` / `.ad-btn-ghost` / `.kiwimu-btn*`）與導覽 item 一律具備
  `:hover`、`:focus-visible`（訊號色 outline + offset）、`:active`（微位移/收斂光暈）。
- hover 只動 border 色、文字色、光暈、`translateY(-1px)` 級距，不做大變形。
- 所有 transition 走 `--dur*` token。


---

## 10. 邊界：本規格不管的地方

- **跨站導覽軌 `.ku-universe-rail`**（`styles/kiwimu-universe.css`）沿用五站共用的
  `--ku-lime #d4ff00` 色彩系統。桌機 sticky，手機隨文件捲走；手機最小高度為
  `calc(3rem + 1px)`（16px預設下49px，nav48px），文字放大可增加高度。
  PR46 只收斂V2頁內導覽；頂部rail的最新排列見下節，其他四站尚未同步。

- **`/` 與 `/explore`（V1.5）** 走根目錄 `DESIGN.md` 的 Neo-Brutalist 紙白系統。
  本次只把免費結果頁的角色圖換成該變體的 `portrait`，並加上圖鑑式標註，
  沒有改動該面的色彩系統。

### 森林展覽與手機導覽（2026-10-12）

- 本 repo 的共用頂部 rail 沿用黑底／lime 的五站識別。桌機五個服務入口維持原順序，
  「森林展覽」放在甜點預訂後，連到 `https://canopy.kiwimu.com/` 並另開分頁。
  展覽是延伸內容，不算第六個會員服務，五個 orbit 與 `05 connected sites` 保留。
- 手機 ≤640px 顯示「人格測驗／會員護照／甜點預訂／更多」。地圖、遊戲與森林展覽
  在「更多」展開；一般站點保留原導向與分析合約。展覽用中文名稱與另開分頁提示。
- 手機導覽一般字級13px、選單入口14px、輔助字12px；點擊區≥44px。
  文字放大時允許換行；選單依頂欄實際高度限制可用空間，短視窗可捲到最後一個入口。
- 「更多」用原生 button、`aria-expanded` 與一般導航連結；Tab正常進出，Esc回到按鈕，
  點外部或改變視窗尺寸收起。它不是需要方向鍵操作的應用程式 menu。
- 手機頂部 rail 隨頁面捲動，桌機沿用 sticky；展開選單覆蓋頁面但不改正文布局。
  這輪只改 kiwimu.com，不聲稱其他四站的頂部排列已同步。

## 11. 持續演進方式

- 保持 Quiet Atlas 的色彩、角色與圖版語言；新功能優先沿用帳號列、按鈕、提示與圖片狀態。
- 內容與例子可逐次更新，文字用途與操作位置維持一致；題庫、計分、價格與權益是另外的變更範圍。
- 整理舊CSS覆寫時先保持相同外觀，逐元件處理；同步本文件與最終computed style，
  不以第一個CSS命中或歷史截圖代替現行結果。
- 每次介面更新核對320／390／768／1280、文字200%、鍵盤與reduced-motion，
  使用既有測驗、照片失敗與PWA回歸；瀏覽器尺寸模擬不等於真人Safari／LINE簽收。


## 12. 完整報告的閱讀規則（2026-10-11）

- `v2-report-reading.css` 只作用於 `.v2-app .v2-report-shell`；延續既有 16／14／12 token、Quiet Atlas 色彩與 Noto Sans TC。正文行高 1.95，段落間距 16px，單段最寬 42em；頁面最寬 960px，桌機工作／關係各有足夠欄寬。700px 以下 A／T 卡上下排列，900px 以下工作／關係單欄。
- 引言提出閱讀問題；第二章解釋偏好與 A／T 差異；對照卡只比較做法；展開內容提供回看問題。避免四處重複同一段核心說明。
- `ReportParagraphs` 純文字渲染，保留正本空行與詩句單行換行；不可 `dangerouslySetInnerHTML`，不可在前台按字數截斷句子。
- 32 種變體都有四個情境例子（共 128），第二段提供可選行動；T 的例子補上該情境的回看反應，不能把泛用「做完後仍檢查」複製四次。A／T 不代表能力高低，也不是四字母 MBTI 的第五組偏好。
- 型別名稱、狀態閱讀名與五個切角使用情境／行為語彙；不用「成癮、癱瘓、吞沒、悲壯」等詞替讀者判定缺陷。既有第一人稱金句是敘事聲音，不是對讀者內心的判定。未公開的研究草案保留歷史，不當作已查證結論。
- 「另一個還沒說出口的需要」必須有自己的具體請求。工作段落不只憑型別推薦職業；關係段落容許雙方回應不同、重新協調。
- 美術素材的原始檔名／座標保留；V2 圖版以公開 summary 的最新閱讀名作標題與替代文字，不將草稿舊名展示給讀者。五個切角用中文呈現，不加工程式縮寫。
- 新生成器回歸涵蓋多段標籤條列、引用引言、完整敘事及 absolute symlink CLI；import parsing helpers 不應寫檔。每次以正本再生成，先確認 32 份與付費欄位邊界。
- `npm run verify:report-reading` 檢查32變體×320／390／1280、四家族768與文字200%樣本、鎖定兩案、段落／字級／章節鍵盤／照片。付款與照片為loopback fixtures，不等同真人Safari／LINE、交易或通知送達驗收。
