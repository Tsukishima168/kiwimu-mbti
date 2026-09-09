# Kiwimu / MBTI Current

Last updated: 2026-07-16

## Economy v2 adapter · 2026-07-16

- Branch `codex/kiwimu-economy-v2-adapter-20260716`、Draft PR #14。
- Browser 只提交 server-issued attempt proof、completion UUID、quiz version
  與 canonical answer indices；點數、每週資格、身份、結果與 idempotency
  都由 Shop/Supabase 決定。偽造 `points=999999`、identity、proof 或重播不能
  建立正式資產。
- 33 個 Economy tests、Vite production build、API contract review 與
  `git diff --check` 通過。shared foundation 已在 hosted Supabase staging
  通過 migration、lint、Auth/RLS/PostgREST、proof replay 與併發驗證。
- Production 尚未套用六項 Economy migration，所有 rollout flag 仍未建立／
  預設關閉，PR 尚未 merge／deploy。匿名 issuance 的 production rate limit
  仍是擴大到 100% 前的營運 gate。

## Five-site visual system · 2026-07-15

- Added the shared Kiwimu Universe rail, site role label, primary-action treatment, and hero orbit frame. The canonical contract is `docs/five-site-design-system.md`.
- The mobile rail centers the active site without causing page-level horizontal overflow; desktop and 390px browser QA passed.
- Replaced the production Tailwind CDN runtime with the existing Tailwind 4 Vite build path while preserving the V1 palette and typography tokens.
- Fresh-context review caught and fixed V1 quiz/result plus V2 marquee overlap, excluded the dedicated OG capture route, and hardened rail contrast, focus, and reduced-motion behavior across all five copies.
- Verified `npx tsc --noEmit --pretty false`, `npm run build`, homepage, and `/read/quiz`; the remaining local console warning is the expected missing `VITE_LINE_LIFF_ID`.
- Status: source changes are local and uncommitted; no push or production deployment was performed in this pass.

## Status

- Repository: `/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com`
- Current branch: `main`
- Remote tracking: `origin/main`
- Latest checked commit: `4f34363 fix(mbti): reduce initial bundle warnings`
- Working tree at handoff: clean before this documentation pass
- Production role: primary Kiwimu identity site, MBTI quiz, answer/content hub, V2 reading/report surface, cross-site entry point

## Stack

- App runtime: React 19 + Vite 6
- Styling: Tailwind CSS 4 through Vite plugin
- Auth/data: Passport SSO bridge + Supabase integration helpers
- Integrations: LINE LIFF/share, GA4 and Google Stack scripts, Resend result email helper, Discord bridge, PWA/service worker
- Routing model: client-side routing from `App.tsx`, with public paths such as `/`, `/quiz`, `/answers`, `/read/quiz`, `/read/:type-variant`, `/explore`

## Operational Boundary

- This repo is not the Shop checkout system. Keep checkout/cart/order fulfillment in `shop-kiwimu-com`.
- Keep Passport SSO ownership in `passport-kiwimu-com`; MBTI should consume auth/session bridge helpers, not become the account authority.
- Use this site as the main discovery and personality-content surface for the five-site universe.
- Do not treat `_Archive/mbti/` under the workspace router as current source.

## Current Controls

- Build script is `npm run build`.
- Google Stack controls live under `scripts/google-stack/*`.
- Public crawler files are in `public/robots.txt`, `public/sitemap.xml`, and `public/llms.txt`.
- Existing README is an old cold-start snapshot from 2026-03-10. Prefer this `CURRENT.md` plus `BOOT.md` when onboarding an AI agent.

## Known Risks

- The repo contains many historical implementation reports and design docs; treat them as reference unless explicitly named in `BOOT.md`.
- Some browser-only logic uses direct `window.location` routing; verify production paths through preview/browser smoke tests, not only TypeScript.
- Google Stack audit depends on OAuth/token state and may fail locally even if the app build is healthy.
- Node version warnings may appear from Vite/Tailwind dependency internals on newer Node runtimes; separate warnings from build failures.

## Next Work Queue

- Keep `/answers` and `/read` content aligned with the five-site CTA map.
- Re-run Google Stack audit before major SEO/content deployment.
- Confirm SSO return paths with Passport after any auth redirect change.
- Keep Kiwimu outbound commerce CTAs pointed at Shop, not duplicated payment flows.

## 2026-07-12 V2 設計升級輪(進行中)

- 目標:升級 /read 報告面(V2App.tsx)的設計邏輯與細節
- 已拍板:①設計 SSOT = 現行 Apple Dark 實作(v2-dark.css);②先還債收斂、再細節打磨;③章節導覽死碼補活做出導覽 UI
- 偵察結論(sonnet):v2.css 2449 行對報告頁幾乎全死;章節導覽(V2App.tsx:299-306,477-509)是死碼(JSX 無 ch-0x id);30 處 inline style、正文 13/14/15px×行高 1.7/1.82/1.88 混用;RWD 文件 768px vs 實作 480/560px;V2QuizApp.tsx 孤兒;凍結文案密集區 = V2App.tsx:108-146,239-306,618-719,878-1127
- Phase A(還債):砍 v2.css 死重+去重字體載入、刪 V2QuizApp.tsx、inline style 收斂成 class、字級統一 15px/1.9、間距對齊 8px、色值改用 CSS var
- Phase B(升級):章節導覽補 id+浮動導覽 UI、Apple Dark 語彙內細節打磨、components/v2/DESIGN.md 改寫成符合實作的規格書
- 紅線:不動 App.tsx/package.json/package-lock.json(S1 WIP 保留);不改任何中文文案字串;不動 data/*.generated.ts
- 狀態:✅ 已 commit `dd1d420`(Phase A+B+P1 修復)
- Phase C(細節完整化,Penso 2026-07-12 口頭核可)✅ 完成:改動全收斂在 v2-dark.css 單檔——①marquee 補結構 CSS 成真 ticker(32px 單行/40s 線性/reduce 已覆蓋;手機首屏奪回 ~330px);②§04 箭頭清單斷欄修成懸掛縮排;③Coming Soon 空狀態 token 對齊 Apple Dark;④paywall 卡加酸綠頂線;⑤手機導覽 dot 觸控區 42×42
- Phase C 驗證:tsc=14 基線、build 綠、真 Chrome 實測 marquee 動畫 running/單行、§04 清單修復、鎖定卡層次、手機 390 無橫向溢出;調度者親驗全數通過
- Phase C 刻意不動:03 光譜條加刻度/動畫(DESIGN.md 判為新增裝飾,保守保留)、dev-only「V2 CONTENT SYNC REQUIRED」空狀態標題對比度(開發訊息,後續評估)
- Phase A 完成(sonnet):v2.css 2449→362 行、刪 V2QuizApp.tsx、V2App inline style 30→3(僅剩動態)、正文統一 15px/1.9、字體 @import 去重到 v2.css:1
- Phase B 完成(opus):6 個 id="ch-0x" 錨點(V2App.tsx:904-1088)、右側浮動導覽軌+手機底部條(位於 871-887 附近)、.ad-reveal 進場動效(IO 一次性+reduced-motion 覆蓋)、focus-visible/active 補齊、DESIGN.md 改寫為 Apple Dark 實作規格(舊版備份 DESIGN.md.bak-20260712)、刪孤兒 KiwimuCharacter.tsx
- 紅隊(fresh sonnet)PASS with issues:唯一 P1 = ch-02.locked 舊資料錯 → 已修(V2App.tsx:301 false→true),鎖定態經 test.localhost 實測驗證(paywall 下 02-06 全 is-locked)
- 驗證:tsc 14 錯=基線不變、build 綠、真 Chrome 實測 reveal/導覽點擊/active 追蹤全過、手機 390px 底部條不擋內容
- 遺留待辦:①跑馬燈 .marquee-track 結構 CSS 從 HEAD 前就不存在(只剩封存目錄有),目前是折行文字牆、手機吃 ~360px 高——要真跑馬燈或收斂高度需另開設計決策;②章節追蹤 IO(V2App.tsx:488)無 SSR guard(舊碼,未動);③S1 TS WIP 仍在工作樹待 2pm 派工收尾
- 教訓已歸檔:ops/lessons.md「背景分頁 IO 永不回呼」

## 2026-07-08 升級輪（全面升級指令）
- 目標：S1 — TypeScript 升 6 + 計畫內修正
- 狀態：⏸ PARKED（worker quota 撞牆中斷；committed main c681b69 仍綠，WIP 未 commit 保留在工作樹）
  - 已做：TS→6.0.3（package.json/lock）；App.tsx FooterLinks `=== 'zh-TW'` → `=== 'zh'`
  - **根因確認**：Language union = `'zh'|'en'|'ja'|'ko'`（用 'zh' 非 'zh-TW'）→ 計畫「補 zh-TW」假設錯，正解是把 `'zh-TW'` 比較改成 `'zh'`，**不動翻譯內容檔（凍結區安全）**
- 待修 tsc 錯（8 條 / 5 檔，已診斷）：
  - [機械] Result.tsx:28、ResultCardFlow.tsx:49 —— `=== 'zh-TW'` → `'zh'`（同 App.tsx 那行）
  - [機械] ResultLegacyDump.tsx:557 —— AppUser|null|undefined → 補 `?? null`
  - [查] ResultCardFlow.tsx:93,95 —— 讀 `.romance` 但型別 `{style,strengths,advice}` 無此欄；查資料真形狀決定補型別或改讀取
  - [查] ResultCardFlow.tsx:247 —— identitySuffix: string vs "T"|"A"，需來源端 narrow
  - [查] V2App.tsx:246（abstract on never）、417（string|undefined→guard）、749（readonly tuple→mutable，spread 或 readonly 參數）；⚠️ V2App 內含行銷文案凍結區，只改型別不動字串
  - [查] StateTest.tsx:534 —— string vs "A"|"B" narrow
- 下一步：**2pm quota 重置後乾淨派工**（sonnet，帶本票；禁 as any/ts-ignore；不動 V2App 文案字串）→ fresh-context 審 → 決定 push
