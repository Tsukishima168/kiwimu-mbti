# Kiwimu V2 — DESIGN.md

> V2 的視覺規則書。配合 `VISUAL_THESIS.md`（主張）閱讀。
> 這份是規則，thesis 是為什麼。
>
> **Status**: 草案確認中。尚未全部落地實作。
> **Last updated**: 2026-04-21

---

## 1. Visual Theme & Atmosphere

### 一句話定調

> 角色是錨，狀態是風。角色安靜，世界在呼吸。

### 意境關鍵字

```
沉浸  流動  稀缺  重力  浮現  此刻
```

### 不是這些

```
科技感  SaaS  dashboard  neo-brutalist 的硬度  資訊密度
```

### 氛圍參考（不是抄，是氣質）

- **Co—Star** — 留白比內容更重要，字即情緒
- **蟲師** — 視覺不解釋，讓觀者感受
- **Yollow 的裂縫光** — 光不是裝飾，是有什麼東西要浮現的信號

### V 版本的視覺演進

| 版本 | 形容詞 | 感覺 |
|---|---|---|
| V1 | 安靜 | 圖鑑式，等你來看 |
| V1.5 | 跳躍 | 動起來，但密度高 |
| **V2** | **流動** | 角色靜，環境在呼吸 |

---

## 2. Color Palette & Roles

### 核心三色（不變）

| 名稱 | Hex | Token | V2 語意角色 |
|---|---|---|---|
| Acid | `#CCFF00` | `--color-acid` | **浮現之光** — 從裂縫透出的那種光。稀缺出現，不是功能色 |
| Ink | `#1A1A1A` | `--color-ink` | **深度與重力** — 承接一切的深空。角色漂浮其上 |
| Paper | `#F8F8F5` | `--color-paper` | **清醒的呼吸** — 只在需要清晰閱讀時才用。不是預設底色 |

### 四家族情緒背景色（已鎖定）

這四個是「狀態場景」的顏色，用於全螢幕背景。**不是 UI 元件色。**

設計哲學：**極深、有溫度、近乎黑但不是黑。** 白色 Kiwimu 角色浮在上面，Acid 光在裡面浮現。

| 家族 | 類型 | 色名 | Hex | 氛圍 |
|---|---|---|---|---|
| Analysts | NT（INTJ/INTP/ENTJ/ENTP）| **Midnight** | `#0C1220` | 深夜思考的冷靜。精準、深邃、清明 |
| Diplomats | NF（INFJ/INFP/ENFJ/ENFP）| **Dusk** | `#140D1E` | 感知比語言更早到達的那種紫暗。直覺、溫柔藏在深處 |
| Sentinels | SJ（ISTJ/ISFJ/ESTJ/ESFJ）| **Forest** | `#0E1510` | 幾乎是黑的深綠。紮根、持久、會在的那種踏實 |
| Explorers | SP（ISTP/ISFP/ESTP/ESFP）| **Ember** | `#1A0E08` | 深琥珀暗色。感官、當下、熱度在最深處燃著 |

> **為什麼只有四色？**
> 四個家族代表四種存在方式，顏色夠少才讓每一個有份量。
> A/T 變體靠粒子密度與 Kiwimu 狀態區分，不再多開顏色。

### A / T 視覺區分（不用顏色，用氛圍密度）

| 變體 | 粒子層 | Kiwimu | 背景飽和度 |
|---|---|---|---|
| **-A（Assertive）** | 低密度，緩慢漂浮 | 靜落狀態（穩定感） | 基礎色，不調整 |
| **-T（Turbulent）** | 中密度，稍快流動 | 懸停狀態（未定感） | 基礎色稍亮 5% |

### Acid 使用規則（最重要）

```
✅ 允許
- 狀態轉換瞬間的光脈衝
- 角色周圍的微弱光暈（opacity 10–30%）
- Paywall 解鎖瞬間的閃爍
- 資料視覺化中「此刻位置」的標記點
- 在 Ink 背景上，小面積文字高亮

❌ 禁止
- 填滿按鈕背景
- 作為 hover 的預設填色
- 大面積色塊
- 同一畫面出現超過一個 acid 元素
- 在 Paper 背景上大量使用（對比太刺眼）
```

### Ink 使用規則

```
✅ 允許
- 深沉狀態的全螢幕背景
- 文字主色（在 Paper 上）
- 角色的輪廓線、四肢、眼睛
- 卡片陰影（soft offset，不是 hard brutalist shadow）

❌ 禁止
- 每一個元件都加 6px hard shadow（那是 neo-brutalist 的語法）
- 用 ink border 框住每一個區塊（窒息感）
```

### Paper 使用規則

```
✅ 允許
- Template γ（圖鑑卡/資訊密度區）的背景
- 長文閱讀段落的底
- Modal / drawer 的表面

❌ 禁止
- 作為每一頁的預設底色
- 情緒強烈的 section（用 Ink 或情緒色）
```

---

## 3. Typography Rules

### 核心轉變：從 type-centric → state-centric

**舊邏輯（V1.5）**：INTJ-A 是主角 → 大字、顯眼、第一眼就看到
**新邏輯（V2）**：狀態描述是主角 → INTJ-A 縮到角落成為標註，狀態金句放大成為第一眼

> 這不只是字型問題，是整份報告的視覺重心位移。

### 字型配對

| 用途 | 字型 | 語言 | 為什麼 |
|---|---|---|---|
| 狀態金句 / Soul Quote | **Noto Serif TC** 300 | 中文 | 細輕 serif 有詩的脆弱感，值得被讀 |
| 心理原型名稱 | **Space Grotesk** 600 | 中英混 | 強重量對比，短字有力 |
| 正文段落 | **Noto Sans TC** 400 | 中文 | 閱讀舒適，不搶戲 |
| Type code（INTJ-A）| **Space Grotesk** 500 | 英文+字母 | 退為標註，不是標題 |
| 數值 / 百分比 | **JetBrains Mono** 500 | 數字 | 精準感，獨立於文字層 |
| Eyebrow 章節標記 | **Noto Sans TC** 400 | 中文 | 小、輕、像在耳邊說 |

### 字級層級（重構）

| 層級 | 用途 | 字級 | 字重 | Leading | 特別規則 |
|---|---|---|---|---|---|
| **State Lead** | 頁面第一眼的狀態金句 | 30–36px | 300 (Serif) | 1.45 | 最重要的文字，最輕的字重 — 重量感來自大小，不來自粗細 |
| **Archetype** | 心理原型名稱 | 22–26px | 600 | 1.3 | 粗，短，像印章 |
| **Section Title** | 各章節標題 | 18–20px | 500 | 1.4 | — |
| **Body** | 報告正文 | 15–16px | 400 | 1.9 | 中文 leading 必須 1.9，給讀者呼吸 |
| **Type Code** | INTJ-A 標記 | 11–12px | 500 | — | opacity 45%，uppercase，是標注不是標題 |
| **Data** | 百分比、數值 | 13px | 500 mono | — | 精準，不用抗鋸齒 |
| **Tag** | TagCard 文字 | 11–12px | 500 | — | letter-spacing 0.06em |
| **Eyebrow** | 章節標記 | 10–11px | 400 | — | uppercase，letter-spacing 0.12em，opacity 50% |
| **Caption** | 小附注 | 11px | 400 | 1.6 | opacity 60% |

### 關鍵規則

```
✅ State Lead 永遠是頁面字級最大的元素
✅ Type code（INTJ-A）永遠是頁面字級最小的元素之一
✅ 中文正文 leading 至少 1.9
✅ Soul Quote / State Lead 前後各留 48px 以上空白
✅ Eyebrow → 標題之間固定 8px

❌ Type code 不能大於 14px（它是標注，不是主角）
❌ 不在同一個 section 裡 serif + sans 中文混排
❌ 正文不低於 14px
❌ 不讓所有文字都是同一重量（至少三層對比）
❌ 不把狀態描述文字截短來讓頁面乾淨 — 留白靠 padding，不靠刪字
```

### 在深色背景上的文字規則

四家族背景（Midnight/Dusk/Forest/Ember）都是極深色，文字要：

| 層級 | 顏色 | 透明度 |
|---|---|---|
| State Lead / 主文字 | `#FFFFFF` | 100% |
| Body 正文 | `#FFFFFF` | 85% |
| Type code / Eyebrow | `#FFFFFF` | 45% |
| Caption | `#FFFFFF` | 40% |

---

## 3.5 Kiwimu 狀態系統（V2 前台用）

Kiwimu 的個性核心：「降落這個動作。不是因為你值得，而是因為我選擇停留。」

狀態來自「降落」的不同時刻。不是情緒狀態，是**存在的姿態**。

| 狀態 | 中文名 | 視覺 | 觸發時機 |
|---|---|---|---|
| `still` | **靜落** | Kiwimu 落地，圓潤坐著，邊緣穩定 | 結果頁主視覺、報告閱讀中 |
| `hover` | **懸停** | 輕微離地，邊緣微微變形，未定感 | 測驗進行中、loading、頁面轉場 |
| `watch` | **守候** | 靜止，頭微低，像在等待 | Paywall 鎖定狀態 |
| `glow` | **發光** | 邊緣透出 Acid 光，身體微微膨脹 | Paywall 解鎖瞬間（1–2 秒後回 still）|
| `ascend` | **起飛** | 輕輕上升，腳離地，向上的弧線 | 報告最後收尾、分享完成 |

**規則：**
```
✅ watch 狀態只出現在 Paywall，不出現在其他地方
✅ glow 是瞬間狀態（持續 1.5s），之後轉回 still
✅ ascend 只在結尾，一份報告最多出現一次
✅ hover 在 Ink/深色背景下邊緣微微透明（opacity 92%），增加「還在空中」感
❌ 不用表情變化來表達狀態（臉永遠只有平靜/微笑/沉思三種）
❌ 不同時出現兩種狀態
```

> **Bascat 補充說明**：SSOT 記載 Bascat 可出現在 Paywall 區塊。如啟用，Bascat 用「奶油快滑落但還沒掉」狀態，與 Kiwimu 的 `watch` 並存。目前 V2 前台只有 Kiwimu，Bascat 為可選擴充。

---

## 4. Component Stylings

### 原則：從 neo-brutalist 的硬 → 有重量的柔

V1.5 的 KiwimuCard 有 6px hard shadow + ink border。這是 brutalist 語法。
V2 的元件要有重量感，但重量來自**深度與光**，不是硬邊框。

### KiwimuCard V2

```css
/* V2 版本：depth over brutalism */
border: none;                           /* 移除 ink border */
border-radius: 20px;
background: rgba(248, 248, 245, 0.06); /* 半透明，讓環境色透進來 */
box-shadow:
  0 2px 8px rgba(0,0,0,0.12),
  0 0 0 1px rgba(255,255,255,0.06);    /* 光邊，不是 ink 邊 */
backdrop-filter: blur(12px);
```

> 在 Ink 背景上：用半透明 + 光邊
> 在 Paper 背景上：用輕柔 drop shadow，無 backdrop blur

### KiwimuButton V2

| 狀態 | 樣式 |
|---|---|
| Primary | Ink 底 + Paper 文字，pill shape（border-radius 999px） |
| CTA / Unlock | Paper 底 + Ink 文字，hover 時 Acid 光暈浮出（不是 fill） |
| Ghost | 透明底 + 細 Paper border，hover 時 border 微亮 |

```
❌ 禁止：hover 時用 Acid 填滿按鈕
✅ 允許：hover 時 Acid 作為 glow（box-shadow with acid color, opacity 0.3）
```

### SpectrumRow V2

- 細線軌道，不是 progress bar block
- 指示點用 Acid 小圓（4px），不是填色條
- 兩端 label 用 Caption 字級

### TagCard V2

- 無邊框，用輕微 surface 區別
- 字型用 mono 或 Space Grotesk，uppercase，letter-spacing 0.08em
- 在 Ink 背景：白字 + 半透明底
- 在 Paper 背景：Ink 字 + 極淡底

### Paywall（V2LockOverlay）V2

不是「中斷」，是「章節封面」。

```
- 背景：深 Ink + 微粒子層（低密度）
- 中心：Kiwimu 靜態形（守候狀態）
- 文字：大 Soul Quote 尺寸，白，居中
- CTA：單一按鈕，Paper 底 + Ink 字
- Acid：解鎖後的瞬間脈衝，不在 lock 狀態出現
```

---

## 5. Layout Principles

### 三種版面構造（α / β / γ）

**Template α — 角色獨白**
```
用途：封面、章節起首、心理原型頁
構造：全螢幕 = 環境層（漸層 + 粒子）+ 角色（中央偏下）+ 最多三行文字
特徵：最少元素，最多留白，角色稀缺才有份量
```

**Template β — 雙欄 Editorial**
```
用途：報告正文大段落
構造：左 40% = 角色縮圖 + 環境色塊 / 右 60% = 標題 + 段落
特徵：文字是主角，角色是陪伴（不是主視覺）
Mobile：堆疊，角色縮圖在上（小），文字在下
```

**Template γ — 圖鑑卡**
```
用途：SpectrumBlock、TagBlock、CompareBlock
構造：無角色，純資訊，Paper 或淺 surface 底
特徵：資訊密度最高，是報告裡「停下來看數據」的時刻
```

### 節奏規則

```
α → β → γ → β → α（循環）

✅ 連續兩個 α 之間必須有至少一個 β 或 γ
✅ 角色只出現在 α 和 β，不出現在 γ
✅ Paywall 永遠是 α 的變體（章節封面感）
❌ 不要每個 section 都放角色（稀缺性）
```

### 間距系統（8px base）

| Token | 值 | 用途 |
|---|---|---|
| `--space-xs` | 8px | 元件內小間距 |
| `--space-sm` | 16px | 元件間距 |
| `--space-md` | 32px | section 內區塊間距 |
| `--space-lg` | 64px | section 間距 |
| `--space-xl` | 96px | α template 的留白 padding |
| `--space-2xl` | 128px | Soul Quote 前後 |

---

## 6. Depth & Elevation

### V2 的深度語言：光而非邊框

深度不靠 hard shadow，靠三層：

| 層 | 方式 | 效果 |
|---|---|---|
| 環境層 | 漸層背景色 | 定義空間的情緒與深度 |
| 粒子層 | SVG 微粒子，opacity 低 | 空氣感，不是裝飾 |
| 光邊層 | `box-shadow: 0 0 0 1px rgba(255,255,255,0.06)` | 元件從背景中「浮出」，不靠邊框 |

### Surface 層級

```
Surface 0: 環境背景（不可互動）
Surface 1: 卡片底層（backdrop-filter: blur）
Surface 2: Modal / Drawer（更高 blur + 更亮 light edge）
Surface 3: Tooltip / Popover（最表層）
```

### 禁止

```
❌ 6px offset hard shadow（V1.5 語法，V2 退場）
❌ 實色 ink border 包圍每個卡片
❌ 多個不同大小的 drop shadow 疊加
```

---

## 7. Do's & Don'ts

### Do's

```
✅ Acid 出現時，全畫面只有一個地方有它
✅ 角色永遠是黑白的，顏色住在環境裡
✅ 每個 section 有且只有一個主元件
✅ 留白是內容，不是填不滿的地方
✅ 情緒強的地方用 Ink 底，不用 Paper 底
✅ 動態是循環的（呼吸），不是線性的（進場/退場）
✅ 字型層級分明：serif 中文標題 / sans 中文內文 / mono 數值
✅ Paywall 是章節封面，不是阻擋牆
```

### Don'ts

```
❌ Acid 填滿按鈕或大面積色塊
❌ 每個卡片加 hard shadow + 實色邊框
❌ 一頁超過三種字級
❌ 角色在每個 section 都出現
❌ 用 Paper 當所有頁面的預設底色
❌ 動態用彈跳、滑入、翻轉（那是 app 語法，不是狀態語法）
❌ 把「狀態」用表情傳達（狀態住在環境裡，不住在角色臉上）
❌ 在 Ink 底上放 Ink 文字（無對比）
❌ mobile 版把 desktop 的雙欄硬壓縮（重排，不是縮小）
```

---

## 8. Responsive Behavior

### 兩種模式，不是縮放

| 模式 | 裝置 | 邏輯 |
|---|---|---|
| **Cinema Mode** | Desktop (≥768px) | 沉浸全螢幕，角色與環境是主視覺，文字是旁白 |
| **Reader Mode** | Mobile (<768px) | 文字清晰優先，環境簡化，角色縮小但仍存在 |

### Breakpoint 行為

**Mobile（<768px）**
- Template α：角色佔寬 55–65%，環境簡化為單層漸層（移除粒子層節省 GPU）
- Template β：角色縮圖 → 全寬但高度壓縮（max 180px），文字獨立一段
- Template γ：不變（本來就是純資訊）
- Soul Quote：字級降至 22–24px

**Desktop（≥768px）**
- Template α：角色居中，環境滿版，視覺稀缺感最強
- Template β：左右雙欄，比例 40/60
- Desktop max-height cap（paywall 區）：max-height: 100vh + overflow: hidden，不讓內容流出視窗

**Touch targets**
- 所有可互動元素 minimum 44×44px
- 按鈕 padding 至少 12px 垂直

---

## 9. Agent Prompt Guide

### 當你要在 V2 新增 section 時

```
V2 視覺規則（2026-04-21 定案）：

【顏色】
- 核心色：Acid #CCFF00（浮現之光）/ Ink #1A1A1A（深度）/ Paper #F8F8F5（呼吸）
- 四家族背景：Midnight #0C1220 / Dusk #140D1E / Forest #0E1510 / Ember #1A0E08
- Acid 稀缺出現，不填按鈕，不大面積
- 每頁只有一個 Acid 元素

【角色】
- Kiwimu 是黑白 SVG，顏色住在背景（環境層）
- 五種狀態：still / hover / watch / glow / ascend
- watch = Paywall only；glow = 解鎖瞬間 1.5s

【文字】
- State Lead（狀態金句）永遠是頁面最大字，Noto Serif TC 300，30–36px
- Type code（INTJ-A）永遠是最小字，11–12px，opacity 45%
- 中文正文 Noto Sans TC，leading 1.9
- 深色背景：主文字白 100%，body 白 85%，標注白 45%

【版面】
- 三模板輪替：α 角色獨白 / β 雙欄 editorial / γ 圖鑑卡
- 每個 section 只有一個主元件
- 深度靠光邊（rgba white box-shadow），不靠 hard shadow
- 動態：呼吸/漂浮/微閃，禁用彈跳/滑入/翻轉
```

### 當你要設計 Paywall 時

```
Paywall 是「章節封面」，不是「阻擋牆」。
- Ink 深底 + 低密度粒子
- Kiwimu 靜態形（守候狀態）
- 一句 Soul Quote 尺寸的文字
- 單一 CTA 按鈕（Paper 底）
- Acid 只在解鎖成功後的瞬間出現（不在 lock 狀態）
```

### 當你要加角色插畫時

```
Kiwimu 宇宙的角色規範：
- 黑白，無例外。顏色在背景，角色不搶戲
- 角色比例要小（在構圖裡佔比 30–50%），大留白
- 腳底黑色橢圓投影（Kiwimu / Bascat / Lemonday 適用）
- V2 前台角色：Kiwimu 為主。其他角色暫不登場
- 狀態透過環境表達，不透過角色表情（Kiwimu 的臉只有平靜/微笑/沉思三種）
```

---

## ▸ 待補充（下一步）

- [ ] **狀態映射表** — `(MBTI 4 letters + A/T) → (情緒背景色 + 粒子密度 + 色溫)` 的 32 格表
- [ ] **Kiwimu 狀態清單** — V2 前台用到的 4–6 種狀態定義（名稱、視覺、觸發時機）
- [ ] **情緒背景色 hex 鎖定** — Burst / Depth / Renewal / Void 的具體色碼
- [ ] **角色生產 spec** — AI 生成 Kiwimu 各狀態的 prompt 或委託說明書
