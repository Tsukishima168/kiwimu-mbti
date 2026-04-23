# Claude Brief — V2 Report / Funnel Context

> 這份文件是給 Claude 的固定 briefing。目的是避免每次開新對話都重新解釋一次 V2 的前提、邊界、與輸出格式。
>
> **Status**: v1.1 — 2026-04-23 上架校正
> **Last updated**: 2026-04-23
> 配合閱讀：`V2_FUNNEL_PRODUCT_STRATEGY.md` / `V2_REPORT_ARCHITECTURE.md` / `EDITORIAL.md` / `VISUAL_THESIS.md`
>
> 2026-04-23 決策：V2 第一版已回到「更好的 MBTI 深度報告」並公開上架；狀態報告、DOES、90 天變化敘事移到 V3。若本文件下方仍有舊的「狀態報告」模板，只能當 V3 草稿，不再作為 V2 上架版指令。

---

## 1. 你在協助的產品是什麼

你正在協助的是 `kiwimu.com` 的 MBTI 深度報告產品線。

請先記住這三層：

- `V1` (`/`) = 信任層，完整免費，有登入後 partial → full unlock，也已有 archive / test runs 基礎
- `V1.5` (`/explore`) = 擴散層，角色卡 / 社群分享 / 快速投射，不是 V2 的前置頁
- `V2` (`/read`) = 付費升級層，第一版已公開上架，定位是「更好的 MBTI 深度報告」

不要把 V2 做成教科書式 MBTI 報告；它仍然保留 MBTI 社交貨幣，但用更好的閱讀體驗與更具體的 A/T 深讀交付。

---

## 2. V2 的產品定義

### 一句話

> V2 是付費 MBTI 深度報告：用更好的敘事、A/T 變體、維度拆解、人物原型與「帶走這個」完成一次可解鎖的深讀。

### 商品句

> NT$149 = 解鎖這份完整 V2 MBTI 深度報告。

### 重要

- 首購成交靠報告深度
- 回訪與 LTV 靠變化敘事
- 不要只想內容深度，也不要只想 timeline
- 正確順序是：**深度先成交，連續性再兌現**

---

## 3. V2 的六條不變原則

1. MBTI 是入口，不是結論
2. 報告是深度 MBTI 報告，不是心理學課本
3. DOES 是內部寫作框架，不出現在前台
4. 語氣是 YZ 世代共鳴，不學術、不心靈雞湯
5. 正文不出現榮格、學派、文獻名詞
6. 這是認知工具，不是診斷工具，不是心理諮商

---

## 4. V2 要解決的核心問題

不要只問「使用者是誰」。
V2 更重要的是回答：

- 你最近怎麼了？
- 你最近靠什麼撐住自己？
- 這套方式幫了你什麼，又困住了你什麼？
- 你現在這個版本，為什麼值得被看見？
- 你之後回來時，會看到自己怎麼變？

---

## 5. 報告架構（先照這個，不要自創新章節）

主體架構以 `V2_REPORT_ARCHITECTURE.md` 為準：

1. State Cover
2. Anchor Fragments
3. Protective Pattern
4. Life Spillover
5. Resonance Coordinates
6. Soul Reflection

額外的產品 context：

- `Layer 0` = timeline / run context（第 1 次顯影、距離上次 X 天）
- `Layer 7` = change promise / timeline slot（解鎖後可回來看變化）

不要把 timeline 搶成第一次體驗的主角。

---

## 6. 語氣規則

請遵守 `EDITORIAL.md`：

- 用狀態時態，不用永恆時態
- 先命中感受，再做分析
- 不給行動指令，不寫成「你應該如何」
- 不抒情過頭，不寫成散文詩
- 不寫成心理學教科書
- 讓人有「這在說我最近」的感覺

### 寫法原則

每段盡量完成這三步：

1. 觀察
2. 命名
3. 翻轉

---

## 7. 內容層次

### 客觀層

- MBTI code
- A / T
- 維度偏向
- 歷次 run / timeline context

### 編輯層

- 狀態命名
- Protective Pattern
- Life Spillover
- Resonance Coordinates
- 真實原型 / 傳記切面
- Soul Dessert
- Abyssal Questions

### 邊界層

- 不診斷
- 不治療
- 不冒充學術權威

---

## 8. 你可以主動做的事

### 可以

- 幫我重寫某個 type 的 V2 報告
- 幫我補強 paywall 文案
- 幫我把 section 內容壓縮成更適合 UI 的長度
- 幫我把同一份報告改成「第一次用戶」與「回訪用戶」兩種版本
- 幫我把傳記式原型寫得更具體、更有信任感

### 不要

- 自己發明新的理論名字丟到前台
- 把報告變成課本
- 把語氣寫成過度文青的散文
- 一上來就大改架構，不管現有六層

---

## 9. 最好用的指令模板

直接用下面這段當開頭，效率最高：

```md
請以 `components/v2/V2_FUNNEL_PRODUCT_STRATEGY.md`、`components/v2/V2_REPORT_ARCHITECTURE.md`、`components/v2/EDITORIAL.md` 為準。

前提：
- V1 已有 login unlock 與 archive / test runs 基礎
- V2 第一版已公開上架
- NT$149 賣的是「完整 V2 MBTI 深度報告」
- MBTI 是入口，不是結論
- 報告是深度 MBTI 報告，不是心理學課本

這次請你做：
1. [明確任務]
2. 保留 YZ 世代可共鳴語氣
3. 不要學術化，不要過度詩意
4. 如果改文案，請直接給我可替換版本，不要只給評論
```

---

## 10. 常用任務指令

可直接貼用的長版指令，請看：

- [PROMPT_PRESETS.md](PROMPT_PRESETS.md)

收錄內容：

- 重寫某一型 V2 報告
- 寫 V2 Paywall 文案
- 首次 vs 回訪雙狀態結果頁

---

## 11. 最後一句

> 先幫我把使用者現在這個版本說準，再幫我把這份東西變成值得回來看的證據。這比任何心理學名詞都重要。
