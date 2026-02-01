# 🎯 Discord 頻道整理 - 完整設定指南

## ✅ 已完成的工作

1. ✅ **頻道結構設計**：`DISCORD_CHANNEL_STRUCTURE.md`
2. ✅ **Bot 代碼優化**：使用新的頻道結構（向後兼容舊名稱）
3. ✅ **頻道配置模組**：`channelConfig.js`（統一管理）
4. ✅ **自動建立腳本**：`setupChannels.js`（可選）

---

## 🚀 快速開始（3 種方式）

### 方式 A：手動建立（推薦，最可控）

#### 步驟 1：建立 Category（分類）

在 Discord Server 中：

1. 右鍵空白處 → **「建立分類」**
2. 依序建立以下分類：
   - `📢 公告區`
   - `💬 交流區`
   - `🍰 甜點相關`
   - `🎮 互動區`
   - `🛠️ 管理區`

#### 步驟 2：建立頻道

在每個 Category 下，右鍵 → **「建立頻道」**，建立：

**📢 公告區**：
- `start-here`
- `announcements`
- `events`

**💬 交流區**：
- `general`
- `nf-community`
- `nt-community`
- `sf-community`
- `st-community`

**🍰 甜點相關**：
- `dessert-booking`
- `dessert-showcase`
- `store-info`

**🎮 互動區**：
- `results`
- `daily-state`
- `cross-product`

**🛠️ 管理區**：
- `bot-commands`
- `feedback`
- `admin`

**⚠️ 重要**：頻道名稱要**完全一致**（大小寫、無 emoji 前綴）

#### 步驟 3：設定頻道權限

**族群頻道（nf-community, nt-community, sf-community, st-community）**：
1. 頻道設定 → 權限
2. 新增對應的 MBTI Role（例如：`🌈 INFP 治癒系詩人`）
3. 勾選「查看頻道」
4. 對「@everyone」取消「查看頻道」

**其他頻道**：
- 保持預設（所有人可見）

---

### 方式 B：使用自動建立腳本（快速）

```bash
cd discord-bot

DISCORD_BOT_TOKEN=你的Token \
DISCORD_GUILD_ID=你的GuildID \
node setupChannels.js
```

**注意**：這個腳本會建立所有頻道，但**不會設定權限**，你還是需要手動設定 Role 權限。

---

### 方式 C：保留現有頻道，只更新 Bot 代碼（最安全）

如果你不想改動現有頻道結構：

1. Bot 代碼已經**向後兼容**，會自動尋找：
   - 新名稱：`start-here`, `results`, `daily-state` 等
   - 舊名稱：`📯-最新消息`, `💬-跨類型閒聊` 等

2. 你可以**逐步遷移**：
   - 先更新 Bot 代碼（已優化）
   - 慢慢建立新頻道
   - 等用戶習慣後再關閉舊頻道

---

## 📋 頻道功能對應表

| 頻道名稱 | Bot 功能 | 用戶行為 |
|---------|---------|---------|
| `start-here` | 新成員歡迎訊息 | 新手指南 |
| `announcements` | 官方公告（手動） | 查看重要訊息 |
| `results` | 測驗完成通知 | 分享測驗結果 |
| `daily-state` | `/state` 指令發送 | 每日狀態打卡 |
| `dessert-booking` | 訂購連結 | 討論訂購 |
| `cross-product` | 跨產品導流 | 探索其他產品 |
| `nf-community` | - | NF 族群交流 |
| `nt-community` | - | NT 族群交流 |
| `sf-community` | - | SF 族群交流 |
| `st-community` | - | ST 族群交流 |

---

## 🔧 Bot 代碼更新說明

### 已優化的功能

1. **頻道查找**：使用 `findChannel()` 函數，支援多個候選名稱
2. **向後兼容**：自動尋找新舊頻道名稱
3. **Embed 訊息**：歡迎訊息和通知改用更美觀的 Embed
4. **跨產品導流**：準備好整合其他產品連結

### 更新的檔案

- ✅ `discord-bot/index.js` - 主 Bot 代碼（已優化）
- ✅ `discord-bot/channelConfig.js` - 頻道配置（新增）
- ✅ `discord-bot/setupChannels.js` - 自動建立腳本（新增）

---

## 🎯 下一步行動

### 立即執行

1. **選擇建立方式**（A/B/C）
2. **建立頻道**（手動或腳本）
3. **設定 Role 權限**（族群頻道）
4. **測試 Bot**：
   - 新成員加入 → 檢查 `#start-here` 是否有歡迎訊息
   - 使用 `/verify` → 檢查 `#results` 是否有通知
   - 使用 `/state` → 檢查 `#daily-state` 是否有狀態

### 未來優化（可選）

1. **每週統計**：Bot 自動在 `#announcements` 發送本週統計
2. **跨產品導流**：在 `#cross-product` 定期發送其他產品資訊
3. **活動提醒**：在 `#events` 自動發送活動通知

---

## 📊 頻道使用建議

### 內容節奏

- **每日**：`/state` 狀態打卡（用戶主動）
- **每週**：統計報告（Bot 自動）
- **每月**：跨產品導流（Bot 自動）
- **不定期**：活動公告（手動）

### 互動策略

1. **鼓勵分享**：在 `#results` 鼓勵用戶分享測驗結果
2. **族群交流**：定期在族群頻道發起話題
3. **甜點連結**：在 `#dessert-booking` 提供優惠資訊

---

## ✅ 檢查清單

完成後確認：

- [ ] 所有 Category 已建立
- [ ] 所有頻道已建立（名稱完全一致）
- [ ] 族群頻道權限已設定（只有對應 Role 可見）
- [ ] Bot 已重新啟動
- [ ] 測試新成員加入（檢查 `#start-here`）
- [ ] 測試 `/verify`（檢查 `#results`）
- [ ] 測試 `/state`（檢查 `#daily-state`）

---

## 🆘 常見問題

### Q1：Bot 找不到頻道？
**A**：確認頻道名稱**完全一致**（大小寫、無空格、無 emoji 前綴）

### Q2：族群頻道所有人都能看到？
**A**：需要設定頻道權限，只允許對應的 MBTI Role 查看

### Q3：可以保留舊頻道嗎？
**A**：可以！Bot 代碼已向後兼容，會自動尋找新舊名稱

---

## 📞 需要幫助？

如果設定過程中遇到問題，告訴我：
1. 你選擇的建立方式（A/B/C）
2. 遇到的具體錯誤
3. 現有頻道列表（我可以幫你對應）

**準備好後，告訴我你選哪個方式，我可以進一步協助！** 🚀
