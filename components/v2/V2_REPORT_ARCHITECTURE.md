# V2 Report Architecture v1

> 這是 V2 報告的正式骨架文件。
> 內容系統、設計稿、程式碼都應對齊這份文件。
>
> **Status**: v1.1 — V2 第一版上架校正
> **Last updated**: 2026-04-23
> 配合閱讀：`VISUAL_THESIS.md` / `DESIGN.md` / `EDITORIAL.md` / `V2_FUNNEL_PRODUCT_STRATEGY.md`

> 產品前提補充：
> `V1` 已有 login unlock 與 archive / test runs 基礎；`V2` 第一版先交付「完整 MBTI 深度報告」。狀態報告與 90 天變化證據移到 V3。

---

## Phase 0｜六條不變原則

在任何執行之前，這六條是 blocker，不討論，不例外。

| # | 原則 |
|---|---|
| 1 | MBTI 是入口，不是結論 |
| 2 | DOES 是內部寫作框架，不出現在前台 |
| 3 | 報告是**深度 MBTI 報告**，不是心理學課本 |
| 4 | 語氣維持 YZ 世代共鳴——不走學術腔，不走心靈雞湯 |
| 5 | 報告正文裡不出現榮格、文獻、學派引用 |
| 6 | 目的是幫使用者辨認當下狀態，是認知工具，不是診斷工具 |

---

## 六層骨架

```
[ Header / 可選 ]
 Layer 0 │ Run Context（第 1 次顯影 / 距離上次 X 天）

[ 免費 ]
 Layer 1 │ State Cover
 Layer 2 │ Anchor Fragments
 Layer 3 │ Protective Pattern（前半）

━━━━━━━━━ PAYWALL ━━━━━━━━━

[ 付費 ]
 Layer 3 │ Protective Pattern（後半）
 Layer 4 │ Life Spillover
 Layer 5 │ Resonance Coordinates
 Layer 6 │ Soul Reflection

[ Optional ]
 Layer 7 │ Change Promise / Timeline Slot
```

> 規則：
> 第一次測驗者看到的是 `Layer 0` 的「第 1 次顯影」與 `Layer 7` 的 promise；
> 第二次之後才會真正進入 compare / timeline。

---

## 各層定義

### Layer 1｜State Cover

**功能** 先說中你現在的狀態，讓使用者感覺「這份報告在看我」

**視覺模板** Template α（角色獨白）— 全螢幕，環境色，Kiwimu 靜落狀態

**內容構成**
- 狀態命名（Soul Quote 尺寸，Noto Serif TC 300，30–36px）
- Hero state line（1–2 句，點出此刻的運作方式）
- MBTI type code（小字標注，opacity 45%）
- Kiwimu 角色（still 狀態）

**現有資料來源**
- `abstract.body` → 狀態定位語
- `abstract.title` → V2 稱號
- `v2PsychArchetypes` → 心理原型名稱

**DOES 寫作注意（內部）**
- E first：第一句話命中感受，不從分析入場
- S：Soul Quote 的用字要出乎意料地準確，不能只是漂亮

---

### Layer 2｜Anchor Fragments

**功能** 讓使用者快速認出自己，建立「這就是我」的第一個鉤點

**視覺模板** Template γ 輕化版（無角色，小卡片群）

**內容構成**
- 2–3 個短句，像感受碎片，不是分類標籤
- 不叫 Tag Wall，不用 badge 格式
- 每一句都是使用者感受過但沒被說出來的東西

**現有資料來源**
- 現有 tag cards → 重寫成短句格式
- A/T 變體的特徵描述 → 壓縮成感受碎片

**範例（INFP-T）**
```
你感受到很多，但說出來的版本永遠少一點什麼
你不確定自己的堅持算不算任性
你需要獨處，但一個人太久又不對
```

**DOES 寫作注意（內部）**
- S：每一句要精準，不能是任何人都適用的廢話
- O：最多三句，不堆疊

---

### Layer 3｜Protective Pattern

**功能** 描述使用者在這個狀態裡如何撐住自己，包含好處與代價

**定義**
使用者為了維持穩定、避免受傷、保持控制感，而反覆啟動的心理運作方式。
不是缺陷，是當下有效的策略——但它有成本。

**內容構成**

*前半（免費）*
- 你現在主要靠什麼撐住自己（命名保護策略）
- 這個策略的作用（為什麼它有效）

*後半（付費）*
- 這個策略的代價（你在哪些時刻為它付出了什麼）
- 鏡像偏移（這個模式如何在不知不覺中影響你）

**現有資料來源**
- `professional.coreTitle` + `professional.coreBody` → 主段落
- A/T 亞型敘事 → 代價與偏移段
- 現有 compare cards → 部分可重組進代價段

**DOES 寫作注意（內部）**
- D：前半說現象，後半說機制——給深度處理者一個值得想的第二層
- E：前半先命中感受（「你靠這個撐住」），後半才給分析（「這是為什麼」）

---

### ━━━━━━━━━ PAYWALL ━━━━━━━━━

**視覺** Template α 變體（Kiwimu watch 狀態 + 單一 CTA）
**文案方向** 「你已經看到輪廓了，想看完整的嗎？」— 不強迫，是邀請
**解鎖瞬間** Kiwimu glow 狀態（1.5s）→ 回 still

---

### Layer 4｜Life Spillover

**功能** 把狀態與日常生活連起來，讓使用者看到「這影響的不只是我怎麼想自己」

**內容構成**
- 工作／創作面向（這個狀態在工作裡怎麼出現）
- 關係面向（這個狀態在人際裡怎麼出現）
- 1 個選擇性面向（依 type 特性決定，如決策、時間感、能量管理）

**現有資料來源**
- `professional` 段落延伸
- 心理原型的 career / relationship interpretation
- A/T 在不同情境的表現差異

**DOES 寫作注意（內部）**
- O：每個面向只說一件事，不在同一段塞兩個觀察
- S：用具體情境代替抽象特質（不說「你在關係中很敏感」，說「你能感應到那個一閃而過的語氣變化」）

---

### Layer 5｜Resonance Coordinates

**功能** 讓使用者知道「這個狀態不是只有你」，給他一個在世界上的位置感

**定義**
不是稀有度系統，不是「你多特別」的證明。
是建立共鳴與定位——這個狀態在歷史上有人活過，在世界上有它的位置。

**內容構成**
- 1–2 個歷史或當代人物，曾活在這種狀態裡（不是「你跟 X 一樣」，而是「這種狀態曾被這樣表達過」）
- 狀態在人群中的分布感（輕觸，不強調稀有）
- 這個狀態的世界切面（這種運作方式帶給世界什麼）

**現有資料來源**
- `v2PsychArchetypes` 的 `stateName` + `historical figures`
- `rarity note`（輕量使用，不建構機制）

**DOES 寫作注意（內部）**
- D：這層給深度處理者一個更大的框架，讓他把自己放進更長的時間軸裡
- E：不是資料，是共鳴——讓他感覺「原來有人也這樣活過」

---

### Layer 6｜Soul Reflection

**功能** 報告的收束與記憶點。帶著一個東西離開，不是空的。

**內容構成**
- Soul Dessert（靈魂甜點——這個狀態對應的味覺/感官）
- Abyssal Questions（2–3 個不問答案、只問方向的問題）
- Closing（1–2 句，短，有重量，不硬逼）

**視覺模板** Template α（Kiwimu ascend 狀態，收尾用一次）

**現有資料來源**
- `dessert.name` + `dessert.visualLogic`
- `closing` 收尾金句
- AbyssalBlock 現有內容

**DOES 寫作注意（內部）**
- O：Closing 只有一件事，不要在最後還塞觀察
- D：Abyssal Questions 是給 D 的禮物——不給答案，只給一個值得帶走的問題

---

## 現有元件對應表

| 舊元件 | 新層級 | 處理方式 |
|---|---|---|
| `V2HeroBlock` | Layer 1 State Cover | 重寫 Soul Quote，type code 縮小 |
| Tag Wall / TagCard | Layer 2 Anchor Fragments | 格式改為短句，不用 badge |
| `V2StateBlock` | Layer 3 前半 + 後半 | 拆成免費/付費兩段 |
| `V2SpectrumBlock` | 保留 | 移入 Layer 3 或 Layer 4 的視覺支撐 |
| `V2DessertBlock` | Layer 6 Soul Reflection | 結構不變，文案微調 |
| `V2AbyssalBlock` | Layer 6 Soul Reflection | 合併 |
| `V2CTABlock` | Layer 6 尾部 | 保留 |
| `V2LockOverlay` | Paywall | 改為章節封面視覺語言 |

---

## 現在可以動的執行順序

```
Step 1 ── 這份文件確認 → 骨架鎖定
Step 2 ── EDITORIAL.md 補完（DOES 四原則 + 禁止清單 + 詞庫）
Step 3 ── 選 1 個 type 試跑新骨架（建議 INFP-T 或 INTJ-A）
Step 4 ── 驗證命中感：是否更像狀態？是否符合 YZ 痛點？
Step 5 ── 確認後，批量改寫 32 份
Step 6 ── 心錨短句格式定案
Step 7 ── 設計稿對齊（Template α/β/γ 的具體 section 應用）
```

---

## 移出 V2 的內容

以下不在本次範圍，另立文件：

- `State Rarity System`（S / SR / SSR 顯影路徑）→ V3
- `DOES 測驗題目`（補充問卷）→ V3 或獨立研究
- `完整角色系統`（Bascat / Lemonday 進場）→ 角色路線圖另議
