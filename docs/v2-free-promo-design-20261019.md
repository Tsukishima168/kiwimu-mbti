# V2 限時免費解鎖：設計（Phase 1，2026-10-19）

> 分支 `claude/kiwimu-v2-free-promo-20261019`（base 664d3a6）。本輪只做設計，未寫實作。沒有查 production DB，以 repo 內的 migration 為準。

## 0. 現況（file:line）
- **權限只在一個地方判斷**：`POST /api/v2/report`（`server/routes/v2/report.ts:44-100`）。有 Bearer token 時走 `hasUserEntitlement`（:19-28），先 `auth.getUser`，再呼叫 `hasConfirmedLinePayOrderForUser`（`server/linePayOrderStore.ts:171-201`），條件是 `line_pay_orders` 有一筆 status=confirmed，而且 user_uid 與 mbti_type 都相符。否則改用 HttpOnly cookie 或 `X-V2-Order-Id` 帶的匿名舊單（:30-42，只認 `user_uid IS NULL`）。都不符合回 403 `ENTITLEMENT_REQUIRED`，store 出錯回 503。
- **付費內容沒有進 client bundle**：`data/v2VariantReports.generated.ts` 只有 server 的 report.ts:3 會 import。client 端只有兩處：`V2App.tsx:552-565` 的動態 import 包在 `IS_DEV && isLocalPreview` 裡，production build 會被消除；`reportAccess.ts:1` 只是 type import。實測方式：抓 production `sw.js` precache 的 25 支 JS，搜尋 suppressedSide 與 carry 的原文（含 \u 跳脫形式），0 命中；用免費 summary 標題「穩光引路人」當對照組，有命中，代表搜尋方法有效。
- **身分**：`server/v2Account.ts:6-23` 的 `getVerifiedV2User` 從 Bearer token 呼叫 `auth.getUser`，拒絕 `is_anonymous`，遇到 5xx 或網路錯誤回 `AUTH_UNAVAILABLE`。client 的 `useSupabaseAuth.ts:26-30` 把匿名 session 當成未登入。登入走 Passport popup，popup 被擋時改整頁 redirect（`utils/authStorage.ts:241-321`）。server 使用 service role client（`server/supabase/user-admin.ts`）。
- **收據與商家通知**：`notifyV2Payment`（`server/v2PaymentNotifications.ts:6-11`）會並行呼叫兩件事：`sendV2PaymentReceipt`（`server/v2PaymentReceipt.ts:49-135`，寫 `v2_payment_receipts`，用 Resend 寄信）和 `sendV2MerchantNotification`（`server/v2MerchantNotification.ts:54-122`，寫 `v2_merchant_notifications` 並發 Discord；:64-66 會擋 amount≤0）。呼叫點有 `linePayFulfillment.ts:58,98,174`、`routes/linepay/status.ts:101,177`、`routes/v2/claim-report.ts:26`；讀取點是 `my-reports.ts:18` 和 `receipt.ts:17-22`。
- **`V2_CHECKOUT_ENABLED` 管什麼**：server 端只擋「建立新付款單」（`routes/linepay/request.ts:37`、`status.ts:58`）；confirm、cancel、report 都不受影響。`VITE_V2_CHECKOUT_ENABLED` 是 build-time 參數，控制付款鈕和「尚未開放新購買」的文案（`V2App.tsx:131,410-411,1246,1254-1255,1295`、`V2Welcome.tsx:69`）。
- **我的報告**：`/read/library` 的 `V2ReportLibrary.tsx:88-115` 呼叫 `/api/v2/my-reports`（`my-reports.ts:8-36`），回傳該帳號已確認的訂單、收據狀態，以及這台裝置 cookie 裡可認領的舊單。
- **甜點入口已經存在**：解鎖後的 footer 有「查看月島甜點 →」（`V2App.tsx:1533-1541`），href 是 `dessertContract.cta_url || buildDessertOrderLink()`（:1044）。cta_url 由 shop repo 產生，值為 `map.kiwimu.com/menu?from=mbti_result_dessert&mbti=ESTJ`（`app/api/menu/mbti/[mbtiType]/route.ts:17-22`）；fallback（`utils/utmTracking.ts:190-194`）同樣帶 `from=mbti_result_dessert`。點擊時送 `outbound_click`，entry_surface=`result_dessert_card`（`utmTracking.ts:311-321`），**跟 V1 結果頁的點擊無法區分**。map 端會把 `from` 寫進 kw_attr，並透過 `gtag('config',{entry_from})` 帶到 `purchase` 事件（map `index.html:238-242`、`index.tsx:1667`）。但**訂單 DB 不存 from**，只存 utm_* 和 mbti_type（map `index.tsx:1588-1635`）。
- **GA4 V2 漏斗**：`view_item`（paywall 曝光，`utils/analytics.ts:536-551`）、`begin_checkout`（:557-571）、`v2_report_unlocked`{mbti_type,unlock_type,source}（:577-583，只在付款回跳驗證後送，`V2App.tsx:518`）。命名慣例是 snake_case、包 `withSiteId`、優先用 canonical 名稱（`ANALYTICS_SCHEMA.md:9-22`）。**V2 popup 登入目前沒有任何 GA4 登入事件**：`App.tsx:548` 只在 `flow_stage=login` 時送 `login_success`，而 V2 登入路徑不會設這個值。
- **測試**：用 vitest（`npm test`）。CI 在 `.github/workflows/mbti-regression.yml:33-43` 依序跑 typecheck、test、build、verify:*。相關測試：`server/routes/v2/{report,verify-unlock,account}.test.ts`、`server/routes/linepay/{request,confirm,status,cancel}.test.ts`、`server/v2{PaymentReceipt,MerchantNotification,PaymentNotifications}.test.ts`、`components/v2/{reportAccess,accountReadingStates,reportCompatibility}.test.ts`、`utils/v2Access.test.ts`。worktree 和主 checkout 都沒有 node_modules，所以本輪沒有實跑。

## 1. 資料模型：推薦 A（新表）
**A. `public.v2_promo_unlocks`**（migration `supabase/migrations/20261020100000_v2_promo_unlocks.sql`，套用前需要 Penso 核准）
```sql
BEGIN;
SET LOCAL lock_timeout = '5s';
CREATE TABLE public.v2_promo_unlocks (
  user_uid   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mbti_type  TEXT NOT NULL CHECK (mbti_type ~ '^[EI][NS][TF][JP]-[AT]$'),
  promo_id   TEXT NOT NULL CHECK (promo_id ~ '^[a-z0-9_]{1,40}$'),
  source     TEXT NULL CHECK (source IS NULL OR source ~ '^[A-Za-z0-9_.-]{1,80}$'),
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now()
             CHECK (claimed_at < TIMESTAMPTZ '2026-12-01 00:00:00+08'),  -- 縱深防線，與程式常數同值
  PRIMARY KEY (user_uid, mbti_type)                                     -- 冪等，每帳號最多 32 列
);
ALTER TABLE public.v2_promo_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_promo_unlocks FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.v2_promo_unlocks FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.v2_promo_unlocks TO service_role;        -- append-only；不給 UPDATE/DELETE
CREATE POLICY v2_promo_unlocks_service_only ON public.v2_promo_unlocks
  FOR ALL TO service_role USING (true) WITH CHECK (true);
COMMENT ON TABLE public.v2_promo_unlocks IS 'Free promo grants. Not payments: no revenue, receipt or merchant notification.';
COMMIT;
```
**B. 沿用 `line_pay_orders`，寫成 amount=0 的 confirmed 單：不推薦。** (1) 「confirmed = 已付款」這個不變量會被破壞，訂單數和營收報表都會被灌水；(2) `receipt.ts` 會讓使用者寄出一封「付款金額 NT$0」的通知信，`claim-report`、`status` 路徑也會呼叫 `notifyV2Payment`；(3) order_id 的格式和 LINE Pay 的欄位語意都對不上。

選 A 的理由：不碰任何付款表，付款與營收的查詢天然不受影響；沒有程式路徑會從這張表呼叫 `notifyV2Payment`，所以收據和 Discord 都不會被觸發。

## 2. Server
- **時窗常數**：新增 `shared/v2Promo.ts`（client 與 server 共用，比照 `shared/v2Product.ts`）：`V2_FREE_PROMO_ID='v2_free_202611'`、`V2_FREE_PROMO_ENDS_AT='2026-12-01T00:00:00+08:00'`（不含當下）、`isV2FreePromoActive(nowMs) = nowMs < Date.parse(ENDS_AT)`、`V2_FREE_PROMO_END_LABEL='2026/11/30 23:59'`。
  開始時間就是上線時間。server 用 Vercel 的 `Date.now()`（epoch，不受時區影響；台灣沒有日光節約時間），DB CHECK 是第二道防線。client 的時間只拿來決定顯示內容。
- **新增路由 `POST /api/v2/promo-claim`**：在 `api/v2/[operation].ts` 加一個分支，避免多開一支 Vercel function。檔案放 `server/routes/v2/promo-claim.ts`，DB 存取放在新的 `server/v2PromoStore.ts`。依序檢查：
  1. 只收 POST，且通過 `requestOriginMatchesHost`。
  2. body ≤1KB，型別要符合嚴格版 `^[EI][NS][TF][JP]-[AT]$`。
  3. `getVerifiedV2User`：沒有 token、token 無效或是匿名使用者回 401；auth 服務異常回 503。
  4. 需要 `email_confirmed_at`，否則回 422（與購買規則一致）。
  5. 已付款（`hasConfirmedLinePayOrderForUser`）回 200 `{access:'paid',created:false}`。
  6. 已經領過回 200 `{access:'promo',created:false}`。**第 5、6 步都排在時窗檢查之前，所以 11/30 之後仍能取得已有的權限。**
  7. `!isV2FreePromoActive(Date.now())` 回 403 `PROMO_ENDED`，並附上 `{endsAt}`。
  8. INSERT：成功回 200 `{access:'promo',created:true,claimedAt}`；23505（PK 衝突）視為 created:false；23514（CHECK 失敗）回 403 `PROMO_ENDED`；其他錯誤回 503。

  user_uid 只取自驗證過的 token，body 裡的任何 id 一律忽略。source 參數會先 sanitize 再寫入。**這支路由不 import 也不呼叫** `notifyV2Payment`、`sendV2*`。
- **限流**：需要 Google 登入的 JWT，加上 PK 讓每帳號最多 32 列，這就是天然的上限。跟現有的 report 和 my-reports 一樣，不另外加 IP bucket；若之後真的被濫用，再加 Vercel Firewall 規則。
- **權限判斷改成「付費 OR 免費領取」**：修改 `report.ts:19-28`。先查付費：`paid===undefined` 回 503，`paid` 為真就直接放行，不再查 promo。否則查 `hasV2PromoUnlock(uid, code)`：查詢錯誤回 undefined（503）；資料表不存在（42P01/PGRST205）視為 false 並記 error log。**這個查詢不看時窗，所以領過的人永久保有權限。** 200 的回應加一個 `access:'paid'|'promo'|'order'` 欄位，給 UI 標示用。
- **`my-reports.ts`**：多回傳一個 `grants:[{mbtiType,claimedAt}]`，排除已付款的型別。這些項目不帶金額、reference、收據狀態，所以 `receipt.ts` 只認付款單的行為不用改，promo 領取也不可能寄出收據。

## 3. UI
**非凍結檔案。** 活動期間由 `isV2FreePromoActive(Date.now())` 切換文案，11/30 之後自動回到原本文案。
| 檔案:行 | 變更 |
|---|---|
| `components/v2/V2App.tsx:1239-1303` | 活動期間的 paywall：eyebrow 用 `Limited · Free`；標題「限時免費：讀完這份完整報告」；價格行「限時免費（原價 NT$99）・活動至 2026/11/30 23:59（台灣時間）」；按鈕未登入時是「用 Google 登入，免費解鎖」，已登入是「免費解鎖這份完整報告」，處理中顯示「正在解鎖…」；附註「解鎖後保存到你的帳號，活動結束後仍可從「我的報告」繼續閱讀。」。活動期間隱藏 LINE Pay 鈕（:1255-1285）和「尚未開放新購買」（:1254）。已登入但被 403（denied）時，改顯示免費 CTA，不再顯示「請確認報告的購買帳號」（:1245），另加小連結「已購買？查看我的報告」。 |
| `V2App.tsx:1050-1056, 716-722` | `unlockPrimaryLabel` 和 `handleCheckout` 依 offer 分流；新增 `handlePromoClaim`。 |
| `V2App.tsx:1148` | 若 `access==='promo'`，顯示「這份報告已保存在你的帳號，可從我的報告繼續閱讀。」 |
| `V2App.tsx:1044, 1533-1541`（沿用既有入口） | 把 href 的 `from` 改寫成 `mbti_v2_report_dessert`（保留 `mbti=ESTJ-A`）；`trackDessertOrderClick` 改成可以傳入 entrySurface 與 unlock_type（`utmTracking.ts:190,311`）。另外在 ch-07 甜點卡（:1477-1504）下方加一個「到月島菜單看看 →」，用 `from=mbti_v2_report_taste`。 |
| `V2App.tsx:410-411,438` | SEO description 和 keywords **不改**，避免搜尋結果在活動結束後還殘留過期的「免費」字樣。 |
| `components/v2/V2Welcome.tsx:53,69` | 活動期間顯示「免費完成測驗，閱讀第 01 章。完整報告限時免費（原價 NT$99），登入即可解鎖，活動至 2026/11/30。」，並隱藏 :69。 |
| `components/v2/V2ReportLibrary.tsx:85,164,169,183-199` | promo 卡片的 kicker 用「{型} · 限時免費解鎖」，日期寫「解鎖於 …」，沒有付款紀錄的 details。另外把「已購」改成時間中性的文案：「我的報告」、「用同一個帳號接著讀下去」。 |
| `components/v2/V2AccountBar.tsx:30` | 「已登入 · 報告保存在這個帳號」 |
| `components/Intro.tsx:23-26` | `v2Price` 四語版本：zh「完整報告限時免費・原價 NT$99（至 11/30）」；en「Full report free for a limited time (reg. NT$99, until Nov 30)」；ja「完全版は期間限定で無料（通常 NT$99・11/30まで）」；ko「전체 보고서 기간 한정 무료 (정가 NT$99, 11/30까지)」 |
| `components/explore/ExploreResult.tsx:67-70` | 同樣的四語模式；zh「第 01 章免費；完整報告限時免費（原價 NT$99，至 11/30），登入即可解鎖。」 |
| `index.html:8,367` | **不改**。這是靜態文案，若改了，結束時就需要 redeploy 才能改回；而「付費進階功能」這個敘述本身仍然成立。 |

**凍結檔，需要 Penso 解凍才能改。** 兩處都改成 import `isV2FreePromoActive` 後用三元運算切換文案，結束後自動回到原文：
- `components/ResultLegacyDump.tsx:1318`：原文「第 01 章免費試讀；完整報告 NT$99，購買後可在「我的報告」回看。」→ 活動期間改為「第 01 章免費試讀；完整報告限時免費（原價 NT$99，至 2026/11/30），登入後保存在「我的報告」。」
- `components/ResultLegacyDump.tsx:1349`：原文「你可以先試讀，再決定是否解鎖完整報告。」→ 活動期間改為「活動期間登入即可免費讀完整報告。」
- 已查過 `App.tsx`、`constants.ts`、`i18n/*Translations.ts`：沒有提到價格，不需要動。

**未登入的流程**：
1. 使用者按下 CTA，把 `{mbtiType, ts}` 寫進 sessionStorage 的 `kiwimu_v2_promo_intent`（helper 放 `utils/v2Access.ts`，所有讀寫包 try/catch），送 `login_gate_opened`，再呼叫 `loginWithGoogle()`。popup 被擋時改整頁 redirect，回到同一個網址，同分頁的 sessionStorage 仍會保留。
2. 頁面上的 `auth.userId` 有值、且 intent 的型別與目前頁面相符、時間在 30 分鐘內時，用 ref 確保只執行一次：清掉 intent，送 `login_success`，呼叫 promo-claim，成功後 `setReportRefresh(+1)`，report 重新載入就會展開。
3. 收到 `PROMO_ENDED` 時，把狀態設成 `promoEnded`，paywall 切回付費版，並顯示「限時免費已於 2026/11/30 23:59 結束，完整報告恢復 NT$99。」。

## 4. GA4 事件（優先沿用 canonical 名稱，只加參數）
| 事件 | 觸發時機 | 參數 |
|---|---|---|
| `view_item`（既有） | paywall 顯示 | 加上 `offer:'promo_free'\|'paid'` |
| `login_gate_opened`（canonical） | 未登入時按免費 CTA | `trigger:'click'`、`from_stage:'v2_promo_unlock'`、`path`、`mbti_type`、`promo_id` |
| `login_success`（canonical） | 帶著 intent 回到頁面、登入成立 | `from_stage:'v2_promo_unlock'`、`provider:'google'`、`restore_destination`（path）、`mbti_type` |
| `v2_report_unlocked`（既有） | claim 回 `created:true` 時才送 | `mbti_type`、`unlock_type:'promo_free'`、`source`、`promo_id` |
| `outbound_click`（既有） | 從報告點菜單 | `entry_surface:'v2_report_dessert'\|'v2_report_taste'`、`destination_type:'order_menu'`、`mbti_type`、`mbti_variant`、`unlock_type`、`url` |

這些事件**都不送** `begin_checkout`、`purchase`，`value` 也不帶值。指標定義：
- 每週解鎖數：以 DB 為準，`v2_promo_unlocks` 依 `date_trunc('week', claimed_at AT TIME ZONE 'Asia/Taipei')` 分組計數；GA4 只看趨勢。
- 解鎖路徑的登入率：`login_success` ÷ `login_gate_opened`，兩者都篩 `from_stage=v2_promo_unlock`。
- 報告→菜單：`outbound_click`（entry_surface 以 `v2_report_` 開頭）÷ 解鎖數。
- 菜單→訂單：map 的 `purchase` 篩 `entry_from=mbti_v2_report_*`。

需要在 GA4 註冊為事件範圍自訂維度：`offer`、`from_stage`、`unlock_type`、`entry_surface`、`promo_id`、`entry_from`（後兩者若已註冊就略過）。

## 5. 邊界情況
- **已付款的使用者**：照舊走付費權限，不會看到 CTA。若直接呼叫 claim，回 `access:'paid'`，不會寫 promo 列；library 只顯示付費卡片。
- **11/30 之後才領取**：不論前端是不是舊版、手機時鐘是否偏差，server 一律回 `PROMO_ENDED`，DB CHECK 也會擋下 INSERT。已經領過的人仍回 200。
- **一個帳號領多種型別**：推薦允許、不設上限（PK 讓上限天然是 32），另外統計不重複人數。理由：邊際成本為 0，且 server 無法驗證「這是不是本人測出來的型別」。
- **匿名使用者**：client 把匿名當成未登入，server 回 401，不能領取。原本的匿名 cookie 付費單路徑不受影響。
- **時鐘與時區**：常數寫明 +08:00，以 epoch 比較；畫面上直接顯示固定字串加「（台灣時間）」。跨過午夜還開著的頁面，會在按下按鈕時收到 PROMO_ENDED 而切回付費版；PWA 的舊快取也用執行當下的時間判斷，所以**不需要 redeploy**。
- **用很多 Google 帳號重複領**：可以接受。每個帳號都要通過 Google 註冊，而且內容本來就能被任何一位讀者轉述；每週看 SQL 監控，異常時再加 Firewall 規則。
- **11/30 之後恢復付費**：Vercel 上的 `V2_CHECKOUT_ENABLED` 與 `VITE_V2_CHECKOUT_ENABLED` 必須**全程維持 true**。後者是 build-time 參數，活動期間若關掉，12/01 就沒有付款鈕，只能 redeploy 補救。

## 6. 測試計畫
- `shared/v2Promo.test.ts`：`2026-11-30T23:59:59.999+08:00` 為 true，`2026-12-01T00:00:00.000+08:00` 為 false；同一邊界的 UTC 寫法 `2026-11-30T15:59:59.999Z` 與 `…T16:00:00Z` 也要驗證。
- `server/routes/v2/promo-claim.test.ts`：用 `vi.useFakeTimers` 加 `setSystemTime`，mock 方式比照 `account.test.ts`。
  - 23:59:59 Taipei 回 200，`created:true`，而且 insert 的 user_uid 是 token 解出的 id（body 帶 `userId` 時要被忽略）。
  - 12/01 00:00:00 回 403 `PROMO_ENDED`，且沒有呼叫 insert。
  - 12/01 之後，已領過回 200、已付款回 `paid`。
  - 沒有 token、token 無效、匿名使用者回 401；auth 異常回 503；未驗證 email 回 422；跨來源回 403，且不會查 auth。
  - `ABCD-A` 回 400。
  - 重複領取（23505）回 `created:false`；23514 回 PROMO_ENDED；store 錯誤回 503。
  - spy 斷言 `notifyV2Payment`、`sendV2PaymentReceipt`、`sendV2MerchantNotification` 都**沒有**被呼叫。
- `report.test.ts` 新增案例：只有 promo 列時回 200 且 `access:'promo'`；promo 列屬於別的型別時回 403；promo 查詢錯誤回 503；付費為真時不查 promo；setSystemTime 設在 2027 年，已領取的 promo 仍回 200。
- `account.test.ts` 新增案例：my-reports 的 grants 不含金額與 reference；receipt 用 promo 型別查詢回 404。
- **付費路徑不變**：現有 linepay、receipt、merchant、report、verify-unlock 測試都不能修改，而且要全部通過。
- **client**：`buildDessertOrderLink(…, 'v2_report_dessert')` 的 URL 要帶 `from=mbti_v2_report_dessert&mbti=ESTJ-A`；offer 選擇函式要做邊界測試；intent helper 在 storage 被擋時不能崩潰。
- **mutation 目標**（每一項都要有測試會失敗）：`<`→`<=`、`+08:00`→`Z`、拿掉 `is_anonymous` 檢查、拿掉時窗檢查、把時窗檢查移到「已擁有」之前、`paid||promo`→`&&`、promo 查詢漏掉 `.eq('mbti_type')`、改用 body 的 userId、promo 查詢錯誤被當成 false、claim 呼叫了 notify。

## 7. 上線與回滾
1. Penso 核准 migration 與第 3 節的凍結檔解凍項目。
2. **先套用 migration**，再部署程式。原因：claim 一定要有這張表；report 雖然在缺表時會 deny，但體驗會錯。套用後確認四件事：表存在、`has_table_privilege('anon'/'authenticated', …)` 全為 false、RLS 已開、advisors 沒有新的 ERROR。
3. 確認 Vercel 上兩個 checkout env 都維持 true（不要改動）。
4. 開 PR，在 preview 用測試帳號跑一輪：未登入 → 登入 → 解鎖 → library 出現 promo 卡 → 菜單連結帶 `from=` → GA4 DebugView 收得到事件。確認後 merge，部署 production。
5. 在 GA4 註冊第 4 節列出的自訂維度。
6. 12/01 00:05 檢查：paywall 顯示 NT$99、claim 回 `PROMO_ENDED`。

**回滾**：在 Vercel 把上一個 deployment promote 回來即可。**不要 drop 資料表**：舊版程式會忽略這張表，等重新部署後，領過的人會恢復權限。只有在功能從未對外開放時，才執行 `DROP TABLE public.v2_promo_unlocks;`。

## 8. 待 Penso 決定（括號內是預設）
1. 每個帳號可以免費解鎖幾種型別？（不限，最多 32）
2. 是否解凍 `ResultLegacyDump.tsx:1318/1349`？（同意；不解凍的話，V1 結果頁在活動期間仍會寫 NT$99）
3. Discord 要不要通知免費解鎖？（不發，週報用 SQL 查）
4. 訂單 DB 層的歸因（讓 map 存 `from`）要不要另開 map 任務？（另案處理；現階段先用 GA4 的 `purchase` 加 `entry_from`）
5. 活動什麼時候開始？（上線即開始）

## 9. Phase 2 實作與上文的差異
- DB 欄位改名 `created_at`（不是 `claimed_at`）；service_role 只有 SELECT 與不含 `created_at` 的欄位級 INSERT，沒有 UPDATE／DELETE；migration 可重複執行。
- 未驗證 Email 回 403（不是 422）。付費回應形狀完全不變：`access`、`grants`、`view_item.offer` 都只在免費解鎖時出現。
- `my-reports` 的 promo 查詢失敗時回 `grantsUnavailable: true`，不讓付費的我的報告變 503；report 只在兩條付費路徑都不成立時才查 promo 表。
