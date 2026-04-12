# V2 報告編輯系統（32 變體）

這份文件是基於 `kiwimu.com` 現況做的讀碼整理，目的不是空談策略，而是把 V2 報告的「內容來源、可共用段、差異段、權威邊界」直接定成可執行規格。

## 1. 專案讀完後的結論

- V2 前端真正渲染的報告骨架在 `components/v2/V2App.tsx`。
- V2 主文案母本目前是 `16` 份台灣版 markdown 草案，不是 `32` 份；來源由 `scripts/generate-v2-tw-drafts.mjs` 解析，再輸出到 `data/v2TaiwanDrafts.generated.ts`。
- `32` 變體早就在產品邏輯裡存在，但目前是由「16 份骨架 + A/T 子敘事 + runtime 分數」拼出來。
- 也就是說，V2 要擴成完整 `32` 份報告，不需要重新發明內容系統，而是要把既有的「骨架層、變體層、即時計分層」拆清楚。

## 2. 主要位置

- `components/v2/V2App.tsx`
  V2 報告頁實際顯示哪些段落、哪些資料來自文案、哪些資料來自 runtime。
- `scripts/generate-v2-tw-drafts.mjs`
  解析 Obsidian V2 母本的規則。這裡定義了報告有哪些 section。
- `data/v2TaiwanDrafts.generated.ts`
  前端真正吃到的 16 型 V2 報告資料。
- `i18n/v1Report.generated.ts`
  現行 V1 已經是 `32` 變體資料結構，能直接拿來對照 V2 的展開方式。
- `data/celebrityData.ts`
  V2 的共鳴原型資料。
- `data/rarityData.ts`
  V2 的稀有度資料與提示語。
- `docs/MBTI_32_COLOR_REFERENCE.md`
  32 變體色票，可作為 32 份報告封面或視覺區分的輔助層。

## 3. 現行 V2 的三層生成模型

| 層級 | 數量 | 來源 | 作用 |
| --- | --- | --- | --- |
| 主類型骨架 | 16 | `2026_V2_報告_草案庫/*.md` | 每一型自己的世界觀、世代觀點、職涯、感情、甜點、靈魂拷問 |
| 變體層 | 2 / type | `professional.subtypes.A/T` + dessert pairings + A/T tag | 決定 `A` 與 `T` 的人格內核差異 |
| runtime 層 | 每位使用者不同 | `scores` + `getVariant()` + `calculatePercentages()` | 決定最後看到的是 `A` 還是 `T`，以及各維度百分比 |

## 4. 哪些內容可以固定

### 4.1 全 32 份都可以共用

- 報告 section 順序
  `定位 → 設計初衷 → 專業分析 → 維度進化 → 職涯 → 感情 → 稀有度/共鳴原型 → 靈魂甜點 → 靈魂拷問 → 收尾`
- UI 命名與資訊架構
  `Design Philosophy / Professional Insights / Cultural Context` 等段落名可固定。
- 編輯 guardrail
  所有報告都應維持「偏好描述，不做能力判決，不做命運預言」。

### 4.2 同一個 base type 內，A/T 可以共用

- `abstract`
- `design.quote`
- `design.behaviorLogic`
- `professional.coreTitle`
- `professional.coreBody`
- `dimension` 中的 `E/I`、`S/N`、`T/F`、`J/P` 四段
- `career`
- `relationship`
- `dessert.name`
- `dessert.visualLogic`
- `abyssal`
- `closing`
- `rarityData`
- `celebrity archetypes`

換句話說，`INTJ-A` 與 `INTJ-T` 的世界觀骨架應該基本同源，不需要寫成兩個完全不同的人。

## 5. 哪些內容一定要不一樣

### 5.1 16 個主類型彼此必須不同

- 標題與稱號
- 變動世代定位
- 設計初衷
- 世代行為邏輯
- 專業核心敘事
- 維度四軸的詮釋語氣
- 職涯策略
- 感情觀
- 靈魂甜點本體與視覺邏輯
- 靈魂拷問
- 收尾句

### 5.2 同一主類型下，A/T 必須不同

- 變體主敘事
  也就是 `professional.subtypes.A/T`
- Identity 段落
  `A / T` 在維度進化中的最後一條，應展開成單一變體語言，而不是混寫。
- 第五個標籤
  `Stable Core` vs `Iterative Resilience`
- 甜點配飲或延伸搭配
  若母本寫了 `A 型配飲 / T 型配飲`，就該分流。
- 視覺色碼
  `docs/MBTI_32_COLOR_REFERENCE.md` 已經有 `32` 色，不應再只用 `16` 色。

### 5.3 每個使用者都會不同

- `A` 或 `T` 的最終判定
- 各維度百分比
- 光譜圖上的高低差

這一層不是編輯母本，而是 runtime 組裝。

## 6. 哪些內容有權威背書

### 6.1 可以視為官方或準官方框架

- MBTI 的 `16` 型，來自四個偏好維度的組合
- 四個字母的基本意義
  `E/I, S/N, T/F, J/P`
- MBTI 適合用來描述偏好與自我理解，不應被用來預測能力、績效、或未來成功

可引用來源：

- [MBTI types overview - The Myers-Briggs Company / MBTIonline](https://www.mbtionline.com/mbti-types/all-about-the-myers-briggs-types)
- [MBTI facts and common criticisms - The Myers-Briggs Company](https://www.themyersbriggs.com/en-US/Access-Resources_G3/Articles/2018/October/MBTI-Facts-Common-Criticisms)

### 6.2 有框架來源，但不是官方 MBTI

- `A / T`（Assertive / Turbulent）不是官方 Myers-Briggs 的第五維
- 這一層更接近 16Personalities 的 `Identity` 語言，用來描述壓力反應、自信程度、後悔傾向、完美主義等

可引用來源：

- [Identity: Assertive (-A) vs. Turbulent (-T) - 16Personalities](https://www.16personalities.com/articles/identity-assertive-vs-turbulent)
- [Our Framework - 16Personalities](https://www.16personalities.com/articles/our-theory%E2%80%8C)

## 7. 哪些是 Kiwimu 的觀點

以下內容目前都屬於 `Kiwimu editorial layer`，不是官方心理測量內容：

- `2026`、`AI`、`Threads`、`台灣職場` 這類時代語境
- 所有甜點映射
- 所有名人原型
- 所有稀有度提示語
- 所有「靈魂拷問」
- `Tag Wall` 的命名
- 多數職涯與關係段落中的文化詮釋

這些內容可以很有品牌辨識度，但對外不能包裝成「官方 MBTI 就是這樣說」。

## 8. 目前沒有權威來源、要保守使用的內容

- `data/rarityData.ts` 的比例目前在 repo 內沒有清楚註記外部出處
- `celebrityData.ts` 的人物歸類屬於編輯對照，不是官方定型
- `career` / `relationship` 內容可以當傾向提示，但不該寫成結果保證

如果要公開對外強調「權威背書」，這三塊需要先補來源或明確標成 `Kiwimu interpretation`。

## 9. 編寫原則

- 把 MBTI 當成偏好語言，不是能力排名。
- 把 A/T 當成現有產品沿用的變體層，不要說成官方 MBTI 的第五軸。
- 所有職涯與關係建議都要寫成「傾向 / 常見拉扯 / 可能更舒服的做法」，不要寫成保證句。
- 稀有度若沒有補來源，對內可用，對外宣傳應降級成參考資訊。
- Kiwimu 的價值不在模仿官方，而在於把官方骨架轉成台灣文化、品牌語氣與甜點宇宙。

## 10. 這次新增的產物

- `scripts/generate-v2-32-report-pack.mjs`
  從現有 16 份 V2 草案展開出 `32` 份完整報告文本。
- `docs/V2_32_VARIANT_REPORT_PACK.md`
  合併版的 32 變體報告總稿。
- `docs/v2-variant-reports/*.md`
  拆分版的 32 份報告。

## 11. 下一步建議

- 把 `2026_V2_報告_草案庫` 進一步升級成真正的 `32` 母本，或至少在 Obsidian 內補一層「variant blocks」編輯規則。
- 若要上線對外販售，請再補一份公開版的 `來源聲明`：
  `哪些來自 MBTI 框架、哪些來自 16Personalities-style variant、哪些是 Kiwimu 編輯觀點。`
