# Prompt Presets — V2

> 這份文件收錄的是「可直接貼給 Claude 的完整任務指令」。
> `CLAUDE_BRIEF_V2.md` 保留產品前提與邊界；這份文件負責 paste-and-go。
>
> **Status**: v1.1
> **Last updated**: 2026-04-23
> 配合閱讀：`CLAUDE_BRIEF_V2.md` / `V2_FUNNEL_PRODUCT_STRATEGY.md` / `V2_REPORT_ARCHITECTURE.md` / `EDITORIAL.md`
>
> 2026-04-23 校正：這些 preset 早期以「狀態報告」為目標撰寫。V2 第一版已改為「更好的 MBTI 深度報告」並公開上架；狀態報告相關 preset 只能作為 V3 草稿，不再直接貼給 production V2。

---

## 指令 1｜重寫某一型 V2 報告

```md
請以 `components/v2/V2_FUNNEL_PRODUCT_STRATEGY.md`、`components/v2/V2_REPORT_ARCHITECTURE.md`、`components/v2/EDITORIAL.md`、`components/v2/CLAUDE_BRIEF_V2.md` 為準。

前提：
- V1 已有 login unlock 與 archive / test runs 基礎
- V2 第一版已公開上架
- NT$149 賣的是「完整 V2 MBTI 深度報告」
- MBTI 是入口，不是結論
- 報告是深度 MBTI 報告，不是心理學課本

這次請你做：

1. 把 [TYPE] 的 V2 報告改寫成一份完整的狀態報告，按 V2_REPORT_ARCHITECTURE.md 的六層骨架 + Layer 0（第 1 次顯影）+ Layer 7（change promise），逐層輸出可替換文案。

   原稿來源：
   - Obsidian：`/Users/pensoair/Obsidian-Vaults/Penso-SSOT/07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2026_V2_報告_草案庫/` 底下對應分類資料夾
   - Repo：`data/v2TaiwanDrafts.generated.ts`、`data/v2PsychArchetypes.generated.ts`

   輸出格式（嚴格遵守）：
   - 一個 section 一個 markdown h2
   - 每個 section 下先標出對應 Layer（例：`> Layer 3｜Protective Pattern（前半・免費）`）
   - 每個 section 下直接給可替換文案，不要給評論、不要給「原稿 → 改寫」對照
   - 最後加一個 h2 `## 改寫摘要`，用表格列出每層改了什麼（≤ 一行）

   必須做到：
   - Layer 1 State Cover 包含：狀態命名、hero line、MBTI code 小字標註
   - Layer 2 Anchor Fragments：3 句感受碎片，不是標籤
   - Layer 3 Protective Pattern：前半（免費）命名保護策略 + 為什麼有效；後半（付費）代價 + 鏡像偏移
   - Layer 4 Life Spillover：工作、關係、一個選擇性面向
   - Layer 5 Resonance Coordinates：1–2 個真實原型，每個 3–5 句短傳記（姓名 + 時期 + 場景 + 為什麼像這個狀態），附可引用來源連結（英文維基或官方機構）
   - Layer 6 Soul Reflection：Soul Dessert + A/T 配飲 + 三個 Abyssal Questions + closing
   - Layer 7：寫一段「解鎖後這份報告會被保存，90 天內回來可看變化」的 promise 文案，不要恐嚇，不要功能清單腔

2. 保留 YZ 世代可共鳴語氣
3. 不要學術化，不要過度詩意
4. 如果改文案，請直接給我可替換版本，不要只給評論
5. 不要出現榮格、DOES、HSP、Fi/Te/Ni/Se 等理論名詞
6. 不要出現「你總是 / 你一直 / 你從小」等永恆時態
7. 不要給行動建議（「你應該」「試著」「練習」）
```

> 使用方式：
> 把 `[TYPE]` 換成 `INFP-T` / `INTJ-A` / `ENFP-T` 這類。其他完全不用動。

---

## 指令 2｜寫 V2 Paywall 文案

```md
請以 `components/v2/V2_FUNNEL_PRODUCT_STRATEGY.md`、`components/v2/EDITORIAL.md`、`components/v2/CLAUDE_BRIEF_V2.md` 為準。

前提：
- V1 已有 login unlock 與 archive / test runs 基礎
- V2 第一版已公開上架
- NT$149 賣的是「完整 V2 MBTI 深度報告」
- Paywall 出現在 Layer 3 Protective Pattern 前半與後半之間
- 使用者此刻剛讀完「命中感」段落，情緒是「對，這在說我」

這次請你做：

1. 幫我寫 V2 Paywall 的完整文案組，共五段可替換文本：

   a) **Hero 版**（Paywall 主視覺區，2–4 句）
      - 不硬賣，是邀請
      - 必須同時帶到「完整報告深度」與「90 天回訪」兩層價值
      - 不寫金額

   b) **Value List 版**（3 條 bullet，各 ≤ 18 字）
      - 第 1 條：深度（打開後會看到什麼具名資產，例：顯影等級、真實原型、狀態用途）
      - 第 2 條：連續性（90 天回來看自己怎麼變）
      - 第 3 條：擁有感（保存、可回看）

   c) **短版**（1–2 句，用於 sticky CTA 或 floating bar）

   d) **主按鈕文案**（2–6 字，3 個候選）

   e) **次要連結文案**（「先不要」「之後再說」類退場鉤，2 個候選）
      - 不要罪惡感，不要「我不值得」語氣

   輸出格式（嚴格遵守）：
   - 直接給五個 h3 區塊 a–e，每段標題下給可替換文案
   - 不要給評論，不要給「原稿 vs 新版」對照
   - 最後加 h3 `### 備註`，用一行說明每段落的 DOES 進入點（E/O/S/D）

2. 保留 YZ 世代可共鳴語氣
3. 不要學術化，不要過度詩意
4. 如果改文案，請直接給我可替換版本，不要只給評論
5. 不出現「升級」「方案」「VIP」「限時」「功能」「解鎖功能」等 SaaS 腔
6. 不出現金額數字（金額在結帳頁出現）
```

---

## 指令 3｜首次 vs 回訪雙狀態結果頁

```md
請以 `components/v2/V2_FUNNEL_PRODUCT_STRATEGY.md`、`components/v2/V2_REPORT_ARCHITECTURE.md`、`components/v2/EDITORIAL.md`、`components/v2/CLAUDE_BRIEF_V2.md` 為準。

前提：
- V1 已有 login unlock 與 archive / test runs 基礎
- V2 第一版已公開上架
- NT$149 賣的是「完整 V2 MBTI 深度報告」
- 同一個頁面要同時服務「第一次測 V2 的人」與「90 天內回來的人」
- 第一次體驗賣深度，第二次體驗賣變化
- 主六層架構不動

這次請你做：

1. 把 V2 結果頁拆成兩個狀態版本，輸出兩份並排文案：

   **State A｜首次用戶（first_run = true）**
   - Layer 0 顯示：`第 1 次顯影`
   - 主賣點：命中 + 深度 + 「這份會被保存」promise
   - Layer 7 是 promise 文案，不是 compare 資料
   - Paywall 在 Layer 3 中段

   **State B｜回訪用戶（first_run = false，且距上次 ≤ 90 天）**
   - Layer 0 顯示：`第 N 次顯影 ｜ 距離上次 X 天`
   - 新增 Layer 0.5：「你從上次到現在的狀態差異」短敘事（3–5 句）
   - Layer 3 Protective Pattern 要微調：強調「這次的策略跟上次比，變鬆了還是變緊了」
   - Layer 7 變成 compare 展示：trait 位移 + 敘事摘要
   - 如果已付費，不重新出 Paywall；未付費則照常 gate

   輸出格式（嚴格遵守）：
   - 用表格形式對比，每一列是一個 Layer，兩欄分別是 State A / State B 的可替換文案
   - 文案超過 3 行時，表格欄位內用短句列點，不寫成長段
   - 表格下方加 h3 `### 程式條件對照`，列出前端要判斷的 flag（例：`hasPaidUnlock`、`runCount`、`daysSinceLastRun`）
   - 最後加 h3 `### 不動的地方`，列出兩個版本共用的文案段落（不要重複寫）

2. 保留 YZ 世代可共鳴語氣
3. 不要學術化，不要過度詩意
4. 如果改文案，請直接給我可替換版本，不要只給評論
5. State B 的「變化敘事」不要寫成教練語氣（「你成長了」「你進步了」）。用觀察式：「你這陣子比上次更 X，也更少 Y」
6. 不要在 State B 假裝有資料——如果某個 trait 沒位移，就明確寫「這個維度沒變」
```
