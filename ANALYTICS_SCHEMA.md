# KIWIMU MBTI Lab — GA4 Analytics Schema

> **系統**：GA4（gtag.js）—— Firebase/Firestore 依賴已全數移除
> **最後更新**：2026-04-16（CTA/Attribution Phase 1）

---

## Canonical Event 語彙

以下是 GA4 報表的標準事件名稱。所有新的 CTA 或漏斗節點請優先使用這些名稱，不要新開自定義事件名。

| Event Name | 觸發時機 | Helper 位置 |
|-----------|---------|------------|
| `quiz_start` | 使用者進入測驗頁 | `utils/analytics.ts:trackQuizStart()` |
| `quiz_completion` | 測驗完成，產出 MBTI 結果 | `utils/analytics.ts:trackQuizComplete()` |
| `result_view` | 結果頁展示 | `utils/analytics.ts:trackResultView()` |
| `login_gate_opened` | 登入 gate 展示或點擊 | `utils/analytics.ts:trackLoginGateOpened()` |
| `login_success` | OAuth 登入成功回跳 | `utils/analytics.ts:trackLoginSuccess()` |
| `archive_gate_opened` | 未登入點擊查看 archive | `utils/analytics.ts:trackArchiveGateOpened()` |
| `archive_view` | 已登入進入 archive | `utils/analytics.ts:trackArchiveView()` |
| `outbound_click` | 點擊任何外站 CTA | `utils/utmTracking.ts:trackOutboundClick()` |

---

## 事件欄位定義

### `login_gate_opened`

```typescript
{
  site_id: 'mbti_lab',
  trigger: 'view' | 'click',   // view = gate 展示；click = 按鈕點擊
  path?: string,                // window.location.pathname
  has_result?: boolean,         // 是否有測驗結果可保存
  is_shared_view?: boolean,
  session_id?: string,
  mbti_type?: string,
}
```

### `login_success`

```typescript
{
  site_id: 'mbti_lab',
  from_stage?: string,                  // 登入前的 stage（result / archive 等）
  restore_destination?: string,         // 'result' | 'archive' | 'intro'
  had_result_before_login?: boolean,
  provider?: string,                    // 'google'
  session_id?: string,
}
```

### `archive_gate_opened` / `archive_view`

```typescript
{
  site_id: 'mbti_lab',
  has_result?: boolean,
  session_id?: string,
  mbti_type?: string,           // e.g. 'INFP'
}
```

### `outbound_click`

```typescript
{
  site_id: 'mbti_lab',
  source_site: 'mbti_lab',
  target_site: string,          // 'dessert_booking' | 'moon_map' | 'passport' | 'external'
  destination_type: string,     // 'order_menu' | 'passport' | 'map_explore' | 'v2_unlock' | 'community'
  entry_surface: string,        // 'result_dessert_card' | 'result_gate_card' | 'result_top_action' | 'result_explore_more'
  mbti_type?: string,
  mbti_variant?: string,        // 'A' | 'T'
  utm_source?: string,
  utm_medium?: string,
  utm_campaign?: string,
  utm_content?: string,
  label: string,
  url: string,
}
```

---

## CTA Destination Types

| destination_type | 目的地 | Entry Surface |
|-----------------|--------|--------------|
| `order_menu` | `https://map.kiwimu.com/menu` | `result_dessert_card` |
| `passport` | `https://passport.kiwimu.com` | `result_explore_more` |
| `map_explore` | `https://map.kiwimu.com` | `result_explore_more` |
| `v2_unlock` | `/read`（未來） | `result_top_action` |
| `community` | Discord / LINE | `result_explore_more` |

---

## UTM 標準 Campaign 命名

| Campaign | 用途 |
|---------|------|
| `2026-q2-kiwimu-routing` | 目前主流程 CTA（DessertCard / result-cta） |
| `v15_zh` | 中文結果頁舊路徑（ResultLegacyDump）— 保持原值不改，避免影響歷史分析 |
| `2026-q1-community` | Discord / LINE 社群 CTA |
| `2026-q1-line-growth` | LINE OA CTA |
| `2026-q1-integration` | 舊版（已棄用，不再使用） |

---

## 已廢棄 / 不再使用

- Firebase `analytics_events` collection — 已移除
- Firebase `user_sessions` collection — 已移除
- Firestore `daily_metrics` / `user_journey` — 已移除
- `trackAction()` — 只寫 localStorage，不進 GA4，不作為報表依據

---

## 漏斗定義

```
L1 進站
  quiz_start → quiz_completion → result_view

L2 身份沉澱
  login_gate_opened(trigger=view)
  → login_gate_opened(trigger=click)
  → login_success

L3 跨站導流
  outbound_click {destination_type=order_menu}
  outbound_click {destination_type=passport}
  outbound_click {destination_type=map_explore}

L4 下游變現（需 map/shop 端配合）
  map_order_submitted（需 map 端埋點）
  shop_order_completed（需 shop 端埋點）
```

---

## 報表可回答的問題（Phase 1 後）

- 哪種 MBTI 類型最常點訂購 CTA（按 `mbti_type` 分群）
- gate view 到 gate click 轉換率（`login_gate_opened` trigger=view vs click）
- login_success 前的 `from_stage` 分布（從哪個階段進入登入）
- 哪條外連 CTA 點擊最多（按 `destination_type` 分群）
- `archive_gate_opened` vs `archive_view` 比率（未登入 vs 已登入用戶 archive 行為）
