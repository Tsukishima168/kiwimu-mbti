# Kiwimu CTA / Attribution 實作清單

日期：2026-04-13

## 目標

把 `kiwimu` 現有的結果頁 CTA、UTM 與 analytics 命名，收斂成符合目前營運現實的版本：

- 主購買入口是 `https://map.kiwimu.com/menu`
- `shop` 先視為後端商品與下單能力，不當前台主 landing
- `passport` 是身份 / 回訪任務路徑
- `map` 是品牌探索次要路徑

這份文件不是策略討論，而是接下來 1-2 個 phase 可以直接照做的 implementation backlog。

---

## 目前程式現況

### 已經正確的部分

- `DessertCard` 的主訂購 CTA 已經透過 `buildDessertOrderLink()` 導向 `https://map.kiwimu.com/menu`
  - 檔案：[DessertCard.tsx](/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com/components/cards/DessertCard.tsx:1)
  - 檔案：[utmTracking.ts](/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com/utils/utmTracking.ts:1)
- 結果頁登入 gate 已有 `login_gate_opened` 與 `button_click` 類事件
  - 檔案：[App.tsx](/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com/App.tsx:721)
  - 檔案：[RegistrationGateCard.tsx](/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com/components/cards/RegistrationGateCard.tsx:1)
- GA4 外連追蹤基礎已存在
  - `trackOutboundClick()`
  - `trackUtmLanding()`
  - 檔案：[utmTracking.ts](/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com/utils/utmTracking.ts:1)
  - 檔案：[crossSiteTracking.ts](/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com/utils/crossSiteTracking.ts:1)

### 目前不一致的部分

- 舊文件仍把 `shop` 寫成結果頁主要訂購目的地
  - 檔案：[INTEGRATION_SUMMARY.md](/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com/INTEGRATION_SUMMARY.md:24)
  - 檔案：[LOCAL_TEST_GUIDE.md](/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com/LOCAL_TEST_GUIDE.md:69)
- analytics 命名存在 schema / helper / `trackAction()` 三套混用
  - schema 寫 `quiz_complete`，helper 實際送 `quiz_completion`
  - schema 寫 `user_login`，helper 實際送 `login`
  - gate / archive / CTA 又另外走 `trackAction()`
  - 檔案：[ANALYTICS_SCHEMA.md](/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com/ANALYTICS_SCHEMA.md:1)
  - 檔案：[analytics.ts](/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com/utils/analytics.ts:1)
  - 檔案：[App.tsx](/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com/App.tsx:586)
- `trackOutboundClick()` 雖存在，但結果頁主 CTA 尚未形成統一的 outbound contract
- `MOON_MAP` / `PASSPORT` 在 `utmTracking.ts` 內仍使用舊式 `kiwimu.com/map`、`kiwimu.com/passport` URL，需要確認是否應切到正式子網域

---

## Phase 1：先把事件契約收斂

時間：1-2 天

### 1. 定義唯一事件語彙

本階段先不要追求所有歷史事件都重命名，只要先定出「營運報表要看的 canonical names」。

建議以 GA4 為主，保留以下 canonical event：

- `quiz_start`
- `quiz_completion`
- `result_view`
- `login_gate_opened`
- `login_success`
- `archive_view`
- `outbound_click`
- `downstream_conversion`

### 2. 建立 CTA 級別欄位，而不是再增更多事件名

不要再為每個 CTA 新開事件名，統一透過欄位辨識。

建議 `outbound_click` payload 至少帶：

- `destination_type`
  - `order_menu`
  - `passport`
  - `map_explore`
  - `v2_unlock`
  - `community`
- `entry_surface`
  - `result_dessert_card`
  - `result_gate_card`
  - `result_top_action`
  - `result_explore_more`
- `mbti_type`
- `mbti_variant`
- `session_id`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`

### 3. 對齊 `trackAction()` 與 GA4 helper 的責任

建議原則：

- `trackAction()`：保留給內部歷史行為流水
- `analytics.ts` / `utmTracking.ts`：作為 GA4 正式報表事件
- 新增 CTA 或 funnel 節點時，優先補 GA4 canonical event，不再只補 `trackAction()`

---

## Phase 2：把結果頁 CTA 實作成單一 contract

時間：2-3 天

### 1. 訂購 CTA

主 CTA 定義：

- destination: `https://map.kiwimu.com/menu`
- destination_type: `order_menu`
- medium: `result-cta`
- content: `soul-dessert-button`

要做的事：

- 在 `DessertCard.tsx` 點擊前統一呼叫 `trackOutboundClick('DESSERT_BOOKING', ...)`
- 補 `mbti_type`、`mbti_variant`、`entry_surface=result_dessert_card`
- 確保 `buildDessertOrderLink()` 生成的 UTM 與埋點 payload 一致

### 2. 檔案 / 入籍 CTA

主 CTA 定義：

- destination_type: `passport` 或 `login_restore`
- 這條不一定是外連，但要進 funnel

要做的事：

- `RegistrationGateCard.tsx` 的登入按鈕，除了 `button_click` 之外，補 GA4 canonical event
- `App.tsx` 的 `handleLogin()` 保留 `login_gate_opened`
- 在登入成功回跳結果頁時，補明確的 `login_success` context：
  - `from_stage`
  - `restore_destination`
  - `had_result_before_login`

### 3. Archive CTA

主 CTA 定義：

- event: `archive_view`
- 若未登入，先記 `archive_gate_opened`
- 若已登入，記 `archive_view`

要做的事：

- 補清楚未登入與已登入兩種情境的報表欄位
- 避免現在 `view_archive` 只留在 `trackAction()`，GA4 看不出 gate vs success

### 4. 品牌探索與未來入口 CTA

主 CTA 定義：

- `map_explore`
- `passport`
- `v2_unlock`

要做的事：

- 把結果頁內所有外站 CTA 全部收斂到 `trackOutboundClick()`
- 不再讓不同按鈕各自亂送不同事件名

---

## Phase 3：把 attribution 往 `map/menu -> order` 串起來

時間：2-4 天

### 1. `kiwimu -> map/menu` 入口識別

`buildDessertOrderLink()` 需要穩定帶：

- `utm_source=mbti-lab`
- `utm_medium=result-cta`
- `utm_campaign=2026-q2-kiwimu-routing`
- `utm_content=soul-dessert-button`
- `mbti`
- `from=mbti-test`
- `source=result-page`

建議再補：

- `entry_surface=result_dessert_card`
- `session_id`

### 2. `map` 端收單時保留原始入口

如果訂單最後寫到 `shop_orders` 或其他共享表，至少保留：

- `source_site=mbti_lab`
- `entry_surface=result_dessert_card`
- `origin_path=/quiz/result`
- `mbti_type`
- `utm_*`

這樣之後即使訂單最終落在 `shop` 的資料表，也能看得出真實前台入口是 `map/menu`。

### 3. 下游 conversion 回寫規則

本階段先不要求即時雙向同步，只要做到「可分析」。

最低要求：

- `kiwimu` 能看見 `outbound_click`
- `map` / `shop` 能保留原始 UTM 與 source
- 之後報表能 join 出：
  - `click_order_menu_cta -> menu_visit`
  - `click_order_menu_cta -> map_order_submitted`
  - `click_order_menu_cta -> shop_order_completed`

---

## 需要實際修改的檔案

### `kiwimu`

- [utmTracking.ts](/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com/utils/utmTracking.ts:1)
  - 補 destination_type / entry_surface contract
  - 確認正式子網域 URL
- [analytics.ts](/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com/utils/analytics.ts:1)
  - 補 canonical login / archive / CTA event helpers
- [DessertCard.tsx](/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com/components/cards/DessertCard.tsx:1)
  - 主訂購 CTA 埋點補齊
- [RegistrationGateCard.tsx](/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com/components/cards/RegistrationGateCard.tsx:1)
  - gate view / login click / skip click 對齊 canonical contract
- [App.tsx](/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com/App.tsx:721)
  - login / archive flow 的 context 補齊

### 文件同步

- [INTEGRATION_SUMMARY.md](/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com/INTEGRATION_SUMMARY.md:1)
- [LOCAL_TEST_GUIDE.md](/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com/LOCAL_TEST_GUIDE.md:1)
- [ANALYTICS_SCHEMA.md](/Users/pensoair/Desktop/Web-Projects/sites/kiwimu-com/ANALYTICS_SCHEMA.md:1)

這三份都要同步改掉「主訂購去 shop」與事件命名不一致的問題。

---

## 驗收標準

### 報表上要能直接回答

- 哪一種 MBTI 結果最容易點 `map/menu`
- 結果頁哪一張卡轉換最高
- 未登入使用者是卡在 login gate，還是卡在外連後
- `kiwimu` 帶去的訂購意圖，最後有多少變成 `map` 提單或後續 `shop` 訂單

### QA 要確認

- 結果頁主訂購按鈕 URL 正確指向 `map/menu`
- 外連都帶對 UTM
- GA4 Real-time 看得到：
  - `result_view`
  - `login_gate_opened`
  - `outbound_click`
- 未登入 / 已登入 / archive restore 三種流程都能分辨

---

## 建議執行順序

1. 先改 `utmTracking.ts` 與 `analytics.ts`，定出 contract
2. 再改 `DessertCard.tsx`、`RegistrationGateCard.tsx`、`App.tsx`
3. 最後補文件與 QA guide

這樣可以先把資料口徑鎖住，再去修表面文案與文件，不會重工。
