
# V1 I18N Truth Audit

Generated on 2026-04-11 by `scripts/generate-v1-i18n-audit.mjs`.

## 結論先講

- 目前線上的 **中文 V1 真實內容**，是 `constants.ts` + `components/ResultLegacyDump.tsx` 這套 legacy V1。
- 目前線上的 **外語題目**，是 `i18n/questionsTranslations.ts`，內容方向大致成立，而且已有文化備註可回查。
- 目前線上的 **外語報告**，不是直接吃 Obsidian 的 2025 V1 原稿，而是走：
  - `kiwimu_report_i18n.csv` -> `i18n/mbtiReportTranslations.ts`
  - `i18n/detailsTranslations.ts`
- 如果你的產品原則是「**不要直譯，要做真正的語境翻譯**」，那現在 repo 的方向本身不算錯，但它已經不是和 Obsidian V1 多語原稿完全同步的單一母本。

## 哪一邊才是 V1 真實母本

### 1. 產品實作上的真實來源

- 中文結果頁：`constants.ts` / `components/ResultLegacyDump.tsx`
- 外語結果頁：`i18n/mbtiReportTranslations.ts` + `i18n/detailsTranslations.ts`
- 題目翻譯：`i18n/questionsTranslations.ts`

### 2. 內容編輯上的真實來源

- Obsidian 2025 V1 多語原稿才應該被視為編輯母本：
  - `/Users/pensoair/Obsidian-Vaults/Penso-SSOT/07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2025_v1_基礎版/03_64人格報告內容_2025_US_EN.md`
  - `/Users/pensoair/Obsidian-Vaults/Penso-SSOT/07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2025_v1_基礎版/03_64人格報告內容_2025_JP.md`
  - `/Users/pensoair/Obsidian-Vaults/Penso-SSOT/07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2025_v1_基礎版/jp_part1.md`
  - `/Users/pensoair/Obsidian-Vaults/Penso-SSOT/07_專案工坊/Subdomain_kiwimu.com/Kiwimu_MBTI_Lab_內容庫/2025_v1_基礎版/03_64人格報告內容_2025_KR.md`

## 真相確認：為什麼現在會覺得「兩邊都像真的」

因為 repo 現在把外語 V1 報告拆成了兩層衍生資料：

1. `kiwimu_report_i18n.csv` 只保留 `title / quote / coreAnalysis / soulQuestions`
2. `i18n/detailsTranslations.ts` 再另外補 `keywords / strengths / blindSpots / career / relationships`

Obsidian 原稿則是一整張完整資料表，A/T 變體、摘要、關鍵字、優勢、盲點、職涯、關係、靈魂拷問都在同一份內容母本裡。

## 代表性落差

### INTJ 標題差異

- Obsidian US INTJ-A：`Strategic Mastermind`
- Repo EN INTJ：`The Strategic Architect`
- Obsidian JP INTJ-A：`戦略的マスターマインド`
- Repo JA INTJ：`孤高の戦略家`
- Obsidian KR INTJ-A：`전략적 마스터마인드`
- Repo KO INTJ：`냉철한 전략설계자`

### INTJ 靈魂拷問數量差異

- Obsidian US INTJ-A：3 題
- Repo EN INTJ：2 題
- Obsidian JP INTJ-A：3 題
- Repo JA INTJ：2 題
- Obsidian KR INTJ-A：3 題
- Repo KO INTJ：2 題

這代表目前 repo 外語報告不是單純「翻譯不同」，而是已經出現 **內容濃度與結構層級不同** 的情況。

## V1 題目翻譯狀態

- 目前題目共有 40 題。
- 四語都有內容，且 `kiwimu_translations_context.csv` 已保留不少「文化語境與中文回推差異」備註。
- 這表示 V1 題目層其實比報告層健康，因為至少已經有一份可供人工審稿的 side-by-side context。

## 建議的 source-of-truth 政策

如果之後要把 V1 四語真的收斂乾淨，建議直接定政策：

1. Obsidian 2025 V1 多語筆記 = 唯一編輯母本
2. repo 的 CSV / TS 檔只做編譯產物，不再手改
3. `mbtiReportTranslations.ts` 與 `detailsTranslations.ts` 應由同一份母本生成，避免再次漂移
4. V1 中文與外語結果頁至少要共用同一套欄位定義，否則只要改一次文案就會再次分叉

## 本輪輸出

- `docs/V1_QUESTION_I18N_REVIEW.md`：40 題四語並排審稿版
- `docs/V1_REPORT_I18N_REVIEW.md`：16 型報告標題 / 引言 / 語境邏輯審稿版
