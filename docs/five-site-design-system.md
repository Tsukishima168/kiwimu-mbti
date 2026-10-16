# Kiwimu Universe 五站設計系統 v2：月島深綠

- Status：active
- Owner：Kiwimu Universe
- Updated：2026-10-15
- 取代：v1（2026-07-15，lime／五節點版）。v1 全文見 git 歷史。
- 依據：
  - Penso 2026-10-13「全部的 bar 都統一設計」「導覽螢光綠改日光金」；
  - 2026-10-14 五站風格驗收報告 `docs/style-audit-20261014/REPORT.md`；
  - Penso 2026-10-14「全部進行升級」，D1–D3 依報告建議。

## 目的

讓使用者在五站之間移動時，感覺始終在同一座島上；同時每個站仍有清楚的職責：

1. **Kiwimu**：人格探索入口。
2. **Passport**：會員身份、成就與資產中心。
3. **Map**：島嶼、門市與季節展覽。
4. **Gacha**：遊戲、運籤與活動互動。
5. **Shop**：甜點選購與正式交易。

統一的範圍是：導覽、色彩角色、排版角色、互動狀態與無障礙品質。不把五站的內容套成同一個模板。

## 共用色彩角色（系統色三個加一個輔助）

| 角色 | 值 | 用途 |
|---|---|---|
| 深綠 Forest | `#1F2F1F` | 深色面、主卡、rail 底；淺色面上的主行動底色 |
| 奶油 Paper | `#F5F0E8` | 紙張基底；深色面上的主要文字 |
| 柔金 Gold | `#D7C678` | 目前狀態；深色面上的主行動與焦點 |
| 中綠 Moss | `#304F2F` | 淺色面上的焦點與強調 |
| 次要文字（深色面） | `#D8D7C4` | rail 與深色卡的次要文字 |
| 次要文字（淺色面） | `#5F6856` | 對奶油 5.14:1，**不得再淡** |

- **主行動依表面決定**：
  - 深色面：柔金底配深綠字。
  - 淺色面：深綠實心配奶油字。
- **焦點環同一邏輯**：深色面用柔金；淺色面用深綠或中綠。粗細至少 2px（gacha 的 3px 可保留），offset 至少 2px，對相鄰背景 ≥3:1。
- **螢光綠 `#D4FF00` 已退場**。kiwimu V1 結果頁經 Penso 2026-10-16 解凍顏色後同步換成柔金。
- 不使用黑色硬陰影。
- 新色值只能是上表的顏色或其透明度變化。各站自己的季節色或插畫色，只能出現在插畫與內容圖，不能用在 UI 控制。

## 字體角色

- **本文與標題**：Noto Sans TC。由各站自己載入一次，`display=swap`。
- **等寬標籤**（編號、眉標、數值）：JetBrains Mono。
- **站點例外**：
  - kiwimu V1 的襯線標題（Noto Serif TC＋Cormorant Garamond）；
  - map 的引語襯線（Noto Serif TC，Penso 2026-07-12 保留）；
  - shop 用 Inter 作為西文與數字的 fallback，排在 Noto Sans TC 之後。
- 共用 rail **不載入**任何字體。

## 節奏與無障礙底線

- 8px 網格。
- 互動目標 ≥44×44px，段落內的行內連結除外。
- 可讀文字 ≥12px，裝飾性元素除外。
- 對比：一般文字 ≥4.5:1，大字 ≥3:1。
- 每個互動元件都要有 `hover`、`focus-visible`、`active` 三種狀態。
- 全域 `prefers-reduced-motion: reduce` catch-all：動畫與過渡壓到 0.01ms，關閉 smooth scroll。
- 每頁一個 `<main>`。
- **Kiwimu 角色**：不准被文字、按鈕或容器邊界遮擋臉部或裁切。不准對角色圖做 AI 重繪。

## 簽名元件：森林導覽（Universe Rail）

### 外觀與行為
- **入口與順序（固定）**：人格測驗 → 會員護照 → 島嶼地圖 → 遊戲中心 → 甜點預訂 → 森林展覽 ↗（canopy.kiwimu.com）。
- **視覺**：深綠底、奶油字；目前站點用柔金字加 2px 柔金底線，並設 `aria-current="page"`。入口文字 14px，展覽提示 12px，操作區 48px，rail 高 49px 加安全區。
- **桌機**：`position: sticky; top: 0`，左側是「Kiwimu Universe」字標。
- **手機（≤640）**：
  - 改為自然 flow（relative），捲動時會離開畫面。
  - 只顯示「人格測驗、會員護照、甜點預訂」三格，加上第四格「更多」。
  - 目前站點收在「更多」裡時（map、gacha），「更多」按鈕直接顯示目前站名（例：「島嶼地圖 ＋」），並套用 active 樣式；`aria-label` 寫成「更多站點，目前在島嶼地圖」。
- **「更多」面板**：
  - Esc 在 document capture 階段處理；只在面板開著時攔截，並把焦點還給「更多」按鈕。
  - 點外部、焦點離開、視窗失焦、切換到桌機寬度時都要關閉。
  - 面板高度不超過視窗剩餘空間。
- **層級**：
  - rail 收合時 `z-index` 60，展開時 210。
  - 站點可用 CSS 變數 `--ku-nav-z`、`--ku-nav-z-open` 覆寫（shop 收合時為 35，讓購物車抽屜 z50 能蓋過 rail）。
  - 全螢幕層（結果卡、dialog、抽屜）必須高於 rail 當時的層級（全螢幕層出現時 rail 一定是收合的 60），關閉控制不得被 rail 擋住；同時不得蓋過站內的全域提示（例：kiwimu 存檔提示 toast z200）。kiwimu 結果卡為 z150。
- **安全區**：rail 有 `padding-top: env(safe-area-inset-top)`。
- **`--ku-rail-height`**：包含安全區；元件掛載後改用實測 px，且會隨尺寸變化重新量測。站點所有 fixed／sticky 頂部元素都必須以它下移，不准寫死 49px。
- **連結開法**：站點之間切換用同頁導覽；森林展覽另開新分頁，加 `rel="noopener noreferrer"`。這是唯一的新分頁例外。

### 檔案與一致性
- **核心兩檔**：`KiwimuUniverseRail.tsx`、`kiwimu-universe.css`，五站必須 **byte-identical**。
  - 路徑：gacha 在 `src/components`、`src/styles`；其他四站在 `components`、`styles`。
  - 核心只依賴 `react`，不載字體，也不含任何站點規則。
- **站點差異只走兩條路**：
  - props：`currentSite`、`fromParam`、`tagCurrentSite`、`onTrack`、`getLoginStatus`；
  - 站點自己的 CSS 變數與規則。
- **發布前**：跑 `verify-rail.mjs <repo> --scan`，必須是 PASS（sha256 與核心相同、href 對照通過、沒有殘留引用）。
- **改核心的流程**：先改 kit，再同步五站，五站在同一輪一起發布。

### 歸因與追蹤（D3）
- **href**：沿用既有的 `?from=` 合約。
  - kiwimu：`fromParam="mbti_universe_nav"` 加 `tagCurrentSite`，本站連結也帶 from。
  - 其他四站：`<站>_universe_rail`。
  - 森林展覽：維持現有網址。
- **事件**：每個 rail 連結被點擊時（含森林展覽、本站連結、「更多」面板內的連結），都送 GA4 `universe_nav_click`。
  - 必備 8 欄：`source_site`、`target_site`、`viewport`、`viewport_width`、`viewport_height`、`viewport_category`、`login_status`、`surface`。
  - 另帶 4 欄：`link_name`、`entry_surface`、`destination_type`（站內為 `cross_site_nav`，森林展覽為 `external`）、`transport_type: 'beacon'`。
  - 森林展覽的 `target_site` 為 `canopy`。
- **事件規則**：
  - 只用於分析。不准寫入 Economy ledger，也不准用來決定點數。
  - 追蹤失敗（包括 analytics 尚未初始化）時，仍必須能正常換站。
  - 分析時用 `source_site != target_site` 排除本站點擊。
  - gacha 自 2026-10 起 rail 不再送 `outbound_click`。
- `login_status` 由各站 adapter 以無副作用的方式讀取，可用核心提供的 `readSupabaseLoginStatus`。讀不到時一律回 `unknown`。

### 例外
- Admin shell 不顯示 rail（shop `/admin`）。
- 專用社群圖 capture 路由不顯示 rail（kiwimu `/og-render`）。

## 各站保留的職能表情

- **Kiwimu**：黑白極簡的線稿 Kiwimu，加奶油紙底、柔金點綴；「不破壞黑白極簡」是 Penso 的長期規則。V2 報告頁（Quiet Atlas）以 `components/v2/DESIGN.md` 為該路由的 SSOT，主行動與其他站一樣用柔金。V1 結果頁的內容（文案、版面）仍屬生產凍結區；顏色已於 2026-10-16 經 Penso 解凍，換成柔金與奶油。
- **Passport**：紙本護照、深綠主卡、會員卡與集章；經濟狀態必須清楚。
- **Map**：季節展覽插畫（Season 04「窗邊計畫」）。hero 採「深綠文字面板＋插畫」分欄，插畫只呈現角色，文字不疊在角色上；圖中烤進去的字不得被裁成殘片。
- **Gacha**：深綠遊戲台、清楚的主次與留白，是五站的標竿。禁止用 emoji 當獎品識別。
- **Shop**：深綠舞台、商品攝影與交易資訊。站內導覽列與 rail 之間以色階加細線分出層級；信任與條款內容保持克制。

## 驗收（每次發布）

1. 五站首頁都看得到 rail，active 站點正確，手機「更多」在 map、gacha 顯示站名。
2. `verify-rail.mjs --scan` 五站皆 PASS（核心 byte-identical）。
3. 320、390 寬度沒有頁面水平溢出；1440 版面正確。
4. 鍵盤可依序走到六個入口，焦點清楚；展開時 Esc 會回焦。
5. `prefers-reduced-motion: reduce` 下，transition 超過 0.01ms 的元素為 0。
6. 五站 CI 同款的 typecheck、test、build 都通過。
7. fixed／sticky header、全螢幕層、抽屜都不與 rail 互相遮擋關閉或返回控制。
8. 五站點擊 rail 都送出 8 欄齊全的 `universe_nav_click`；analytics 被擋時仍能換站。
9. 主行動與焦點符合「依表面」規則；觸控、字級、對比符合底線。
10. Kiwimu 角色沒有被遮擋或裁切，也沒有出現烤字殘片。

## 變更紀錄

- **v1（2026-07-15）**：黑底 rail、lime 主色、五節點、手機水平捲動、Space Grotesk。
- **v2（2026-10-15）**：
  - rail 改成月島深綠：深綠、奶油、柔金，六入口，手機三格加「更多」並顯示目前站名；
  - 核心收斂為 byte-identical kit，站點差異改走 props 與 CSS 變數；
  - 補上安全區與展開層級 z210；
  - 五站統一 `universe_nav_click`；
  - 主行動與焦點改為「依表面」規則；
  - 螢光綠退場；字體由各站自己載入。
