# Kiwimu Universe 五站設計系統

Status: active
Owner: Kiwimu Universe
Updated: 2026-07-15

## 目的

五站要讓使用者感覺位於同一個世界，但每個站仍有清楚職責：

1. Kiwimu：人格探索入口。
2. Passport：會員身份、成就與資產中心。
3. Map：島嶼、門市與品牌探索。
4. Gacha：遊戲、運籤與活動互動。
5. Shop：甜點選購與正式交易。

統一的是導航、排版角色、互動狀態與無障礙品質；不把五站內容套成相同模板。

## 共用視覺 Token

| Token | Value | Role |
| --- | --- | --- |
| Paper | `#F4F4F0` | 紙張基底 |
| Paper raised | `#FFFDF7` | 卡片與浮層 |
| Ink | `#111111` | 文字、邊線與硬陰影 |
| Lime | `#D4FF00` | 目前狀態、主要行動、focus |
| Moon silver | `#C9CDD8` | Map／夜間敘事輔色 |
| Island ember | `#C4745A` | 店舖與實體行動輔色 |

字體角色：

- Display：Space Grotesk + Noto Sans TC。
- Body：Noto Sans TC。
- Utility：JetBrains Mono。

節奏以 8px 為主要網格；互動目標不得小於 44px。所有互動元件要有 `hover`、`focus-visible`、`active` 與 reduced-motion 對應。

## 簽名元件：Universe Rail

五站頂部皆顯示同一份五節點導覽：

- 節點順序固定為 MBTI → Passport → Map → Gacha → Shop。
- 現在所在站點以 lime 節點、底線與 `aria-current="page"` 表示。
- 桌機顯示品牌、序號、英文站名與中文職責；手機改成水平捲動，不擠壓內容。
- 站點切換使用同頁導覽，不用強迫新分頁。
- 每次站點連結點擊送出非帳務 `universe_nav_click`，固定包含 `source_site`、`target_site`、`viewport`、`viewport_width`、`viewport_height`、`viewport_category`、`login_status` 與 `surface`；事件只供 GA4 分析，不得寫入 Economy ledger 或決定點數。
- Admin shell 不顯示公開 Universe Rail。
- 專用社群圖 capture 路由不顯示 rail；全螢幕遊戲、購物車與 modal 開啟時可覆蓋 rail，確保關閉控制不被遮擋。
- 既有 fixed 子路由 header 必須以 `--ku-rail-height` 下移，不得與 rail 互相覆蓋。

實作檔：

- 元件：各 repo 的 `KiwimuUniverseRail.tsx`。
- 樣式：各 repo 的 `kiwimu-universe.css`。
- 五份元件與 CSS 必須保持 byte-identical；發布前以 checksum 驗證。

## 各站保留的職能表情

- Kiwimu：留白、角色圓形軌道、人格探索；主行動使用 lime。
- Passport：紙本護照、成就與帳本；卡片可以較圓潤，但經濟狀態必須清楚。
- Map：月光銀、展覽標籤與路線卡；陶紅只用於實體到店行動。
- Gacha：硬邊框、硬陰影與遊戲盤面；禁止重新使用 emoji 當獎品識別。
- Shop：黑色舞台、產品影像與交易資訊；主要預訂行動使用共用 lime，信任／條款內容保持克制。

## 實作邊界

- Universe Rail 是跨站共用 chrome，不取代各站既有 local navigation。
- Kiwimu V2 Apple Dark 報告內容仍以 `components/v2/DESIGN.md` 為該路由 SSOT；Universe Rail 只包在外層。
- Map Season 03 銀月夜與 Shop 深色商務面保留，不改成紙白頁。
- Passport 的進階 Universe cards 可保留，功能是內容導覽；頂部 rail 是全站方向感，兩者用途不同。
- 新 token 先由共用 CSS 提供。未遷移完成的舊元件不得自行新增近似 lime、silver 或 ink 色值。

## 驗收

1. 五站首頁都能看到 rail，active site 正確。
2. Rail CSS 與元件 checksum 五站一致。
3. 390px 寬度無水平頁面溢出；rail 本身可水平捲動。
4. 鍵盤可依序進入五站連結，focus 清楚。
5. `prefers-reduced-motion: reduce` 下無不必要 transition。
6. 五站 typecheck/build 通過，既有核心流程沒有因外層 chrome 改變。
7. Capture、全螢幕 overlay 與 fixed header 的顯示層級符合上述例外，不遮擋返回或關閉控制。
8. 五站 Rail 實際點擊皆送出完整 `universe_nav_click`，analytics 未初始化或傳送失敗時仍可正常換站。
