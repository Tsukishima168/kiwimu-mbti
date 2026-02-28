# 🤖 Cowork 專屬任務：ManyChat 宇宙級全自動化佈局

> 任務指派：Antigravity & Penso
> 前置閱讀文件：[[商業_ManyChat自動化最大化戰略]]

## 🎯 你的核心任務
你的任務是將 ManyChat 從「被動客服」升級為 24 小時運作的「OMO 自動銷售引擎」。請依據戰略書的四大維度，將抽象的商業藍圖實作為具體的 ManyChat Flows。

## 📍 優先執行清單 (優先順序 1 -> 3)

### 1️⃣ 第一階段：社群吸粉與裂變引擎 (Acquisition Flow)
- **目標**：用自動化抓住 IG / Threads 每一分流量。
- **Action**：設定 `Comment to DM` flow。當用戶在 IG 留言「測驗」或「巴斯克」，自動私訊發送情境文案，並帶上專屬追蹤參數(`utm_source`)的 `kiwimu.com` 連結。

### 2️⃣ 第二階段：免費版的 N8N 橋樑替代方案
- **⚠️ 限制提醒**：ManyChat 免費版 **禁用了 External Request**。
- **Action**：
  1. Cowork 請不要嘗試在 ManyChat 裡寫 API Call 節點，這會報錯。
  2. 改為研究：如何讓 N8N 主動去聽 ManyChat 的 Webhook（如果免費版支援），或是只能讓 ManyChat 單純發送設定好的 `shop.kiwimu.com` 連結，將複雜邏輯全部移到前台 Vercel 與 Supabase 處理。

### 3️⃣ 第三階段：標籤與關鍵字極限配置 (Tagging & Keywords)
- **⚠️ 限制提醒**：免費版最多 **3 組 關鍵字** 與 **10 個 標籤**。
- **Action**：
  1. 挑選最有價值的 3 個觸發關鍵字（例如：「我要測驗」、「優惠碼」、「找老闆」）。
  2. 在 ManyChat 後台建立那 10 個黃金 Tags（例如：`status:買過甜點`, `mbti:Bascat`, `action:領過優惠`），請不要浪費 Tag 名額。

## ⚠️ 執行細節與備註
- 請隨時參考宇宙角色的語氣設定（Kiwimu 的療癒、Lemonday 的嗆聲）。
- 若需要 N8N 的 Webhook URL 結構或是 Supabase Schema 來搭配，請隨時要求協助確認。
- 有任何實作上的困難（如 API 頻率限制、跨域問題），請直接回報在日常交接清單。
