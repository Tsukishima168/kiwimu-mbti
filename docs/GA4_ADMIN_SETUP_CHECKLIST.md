# GA4 後台設定清單（Kiwimu MBTI Lab）

最後更新：2026-04-12

本文件只處理 **GA4 後台** 應完成的設定，不重複描述前端程式碼。前端事件來源請看：

- `utils/analytics.ts`
- `docs/GA4_EVENTS_REFERENCE.md`
- `docs/AI_SEO_GA4_DESIGN.md`

---

## 1. Measurement ID

目前前端 GA4 ID 讀取順序：

1. `VITE_GA4_ID`
2. `VITE_FIREBASE_MEASUREMENT_ID`
3. fallback `G-DM6F27KL8B`

先確認 production 環境實際使用的是哪個 GA4 property，再開始做後台設定。不要一邊打不同 ID。

---

## 2. 先確認事件真的有進來

到 GA4：

1. 打開 `Reports`
2. 進入 `Realtime`
3. 自己實際走一次以下流程

建議驗證路徑：

1. 開首頁 `/`
2. 開 `/read`
3. 開 `/read/quiz`
4. 開任一變體，例如 `/read/INTJ-A`
5. 點 V2 解鎖 CTA

應能看到至少這些事件：

- `page_view`
- `screen_engagement`
- `quiz_start`
- `quiz_progress`
- `quiz_completion`
- `result_view`
- `view_item`
- `begin_checkout`
- `purchase`（目前會在 entitlement 成功或 dev/local preview 時出現）

---

## 3. Custom Dimensions

到 GA4：

1. `Admin`
2. `Data display`
3. `Custom definitions`
4. `Create custom dimensions`

優先建立這些：

| Dimension 名稱 | Scope | Event parameter / User property | 用途 |
|---|---|---|---|
| `page_name` | Event | `page_name` | 看 V1 / V2 虛擬頁路徑 |
| `screen_name` | Event | `screen_name` | 看停留時間頁別 |
| `mbti_type` | Event | `mbti_type` | 看類型分布與轉換 |
| `source` | Event | `source` | 看 V2 來源，如 `v1_result_card`、`v2_quiz` |
| `unlock_type` | Event | `unlock_type` | 區分 entitlement 來源 |
| `button_name` | Event | `button_name` | 看 CTA 被點擊排行 |
| `button_location` | Event | `button_location` | 看哪個區塊最有效 |

次優先：

| Dimension 名稱 | Scope | Event parameter / User property | 用途 |
|---|---|---|---|
| `campaign_id` | Event | `campaign_id` | 看活動來源 |
| `checkout_url` | Event | `checkout_url` | 驗證 V2 checkout CTA 導流 |
| `item_id` | Item | `item_id` | 若要做 V2 商品漏斗拆分 |

---

## 4. Conversions

到 GA4：

1. `Admin`
2. `Data display`
3. `Conversions`
4. `New conversion event`

先設這三個：

- `quiz_completion`
- `begin_checkout`
- `purchase`

建議暫時不要把以下設成 conversion：

- `page_view`
- `screen_engagement`
- `view_item`
- `button_click`

這些比較適合拿來做行為分析，不適合當主要成功事件。

---

## 5. 建議 Funnel Exploration

到 GA4：

1. `Explore`
2. 建立 `Funnel exploration`

建立一條 V2 漏斗：

1. `page_view` where `page_name = /read`
2. `page_view` where `page_name = /read/quiz`
3. `page_view` where `page_name` matches `/read/`
4. `begin_checkout`
5. `purchase`

建議 breakdown：

- `mbti_type`
- `source`
- `device category`

這會直接回答三個問題：

- 哪些類型最容易進 paywall
- 哪些來源最容易開始 checkout
- 哪些流量真的走到 unlock

---

## 6. 建議 Free → Paid 對照報表

另外做一個自由格式 exploration，指標與維度如下：

維度：

- `page_name`
- `mbti_type`
- `source`

指標：

- Event count
- Total users
- Conversions

事件建議放進報表：

- `quiz_completion`
- `result_view`
- `view_item`
- `begin_checkout`
- `purchase`

用途：

- 比較 V1 完成測驗的人，最後有多少人進 `/read`
- 比較 `v1_result_card` 與 `v2_quiz` 哪個 source 更會推動解鎖

---

## 7. 注意事項

- `purchase` 目前不等於真實金流完成，它等於「entitlement 已發生」。在 Phase B 真實支付接上前，不要把它對外當真實營收報表。
- 如果未來 webhook 才是唯一 unlock 來源，請保留 `purchase` 事件名，但讓它只在 webhook 寫入成功後觸發。
- 若之後 `/read/<TYPE>-<VARIANT>` 真的對外全面開放索引，建議在 GA4 再加一個報表專門觀察 32 變體 URL 的自然流量表現。

---

## 8. 完成標準

做到以下就算 GA4 後台基礎完成：

- Production 只有一個正確的 GA4 property
- `Realtime` 能看到 `/read` 路徑事件
- 7 個 custom dimensions 建好
- 3 個 conversion 建好
- V2 funnel exploration 建好
