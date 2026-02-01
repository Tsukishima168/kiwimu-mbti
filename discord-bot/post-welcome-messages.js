const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

// 新架構的頻道歡迎訊息（符合 DISCORD_CHANNEL_STRUCTURE.md）
const CHANNEL_MESSAGES = {
    'start-here': {
        content: `🌙 **歡迎來到 Moon Moon 品牌社群**

這裡是探索性格、品嚐甜點、航向自由的溫暖港灣。

━━━━━━━━━━━━━━━━━━

🌍 **探索 Moon Moon 宇宙**

🧪 **MBTI 性格測驗**
探索你的內在性格，找到你的靈魂甜點
→ https://kiwimu-mbti.vercel.app?utm_source=discord&utm_medium=pinned&utm_campaign=community

🗺️ **月島品牌地圖**
探索完整的 Moon Moon 世界觀與品牌故事
→ https://moon-map-original.vercel.app?utm_source=discord&utm_medium=pinned&utm_campaign=community

🎨 **甜點護照測驗**
趣味測驗，獲得你的甜點角色貼紙
→ https://moonmoon-dessert-passport.vercel.app?utm_source=discord&utm_medium=pinned&utm_campaign=community

━━━━━━━━━━━━━━━━━━

🚀 **快速開始三步驟：**

1️⃣ **選擇探索方式**
完成任一測驗，或直接探索月島地圖

2️⃣ **驗證身份獲得福利**
完成 MBTI 測驗後使用 \`/verify 你的UserID\` 獲得專屬身份組

3️⃣ **開始社群旅程**
• 使用 \`/state\` 分享你今天的狀態
• 累積積分兌換會員福利
• 與同類型的夥伴深度交流

━━━━━━━━━━━━━━━━━━

📌 **常用指令**
• \`/verify\` - 驗證 MBTI 並獲得身份組
• \`/state\` - 分享今日狀態

📱 **加入 LINE@：** @kiwimu
❓ **有問題請到** #feedback`
    },

    'announcements': {
        content: `📢 **官方公告頻道**

本頻道發布 Moon Moon 的重要更新與公告：
• 🆕 新功能上線
• 🔄 系統更新通知
• 📱 產品整合資訊
• ⚠️ 重要變更說明

━━━━━━━━━━━━━━━━━━

🔔 **開啟通知**
右鍵點擊此頻道 → 通知設定 → 所有訊息`
    },

    'events': {
        content: `🎉 **Moon Moon 活動資訊**

本頻道發布：
• 每月創作挑戰
• 社群活動通知
• 抽獎與福利資訊
• 特殊節日企劃

━━━━━━━━━━━━━━━━━━

💰 **積分系統**

累積積分解鎖專屬福利：
• 完成 MBTI 測驗：100 點
• 完成護照測驗：50 點
• 推薦朋友：50-100 點
• 加入 LINE@：30 點
• 分享測驗結果：20 點

🏆 **會員等級**
🥉 測驗完成者 → 🥈 LINE會員 → 🥇 店內消費者 → 💎 貼圖收藏家 → 🌟 超級粉絲

━━━━━━━━━━━━━━━━━━

📅 **近期活動**

【春季活動】探索 Moon Moon 宇宙
時間：2026/02/01 - 04/30
詳情：完成測驗享 8 折優惠 + 專屬貼紙`
    },

    'general': {
        content: `💬 **跨類型交流廣場**

這是所有人的自由交流空間！

━━━━━━━━━━━━━━━━━━

✨ **這裡可以：**

• 💭 分享今天的心情與狀態
• 🎨 討論任何有趣的話題
• 🤝 認識不同類型的夥伴
• 🎉 參與社群活動
• ⛵ 純粹閒聊放鬆

━━━━━━━━━━━━━━━━━━

💡 **使用 \`/state\` 分享你的狀態**

選項：
🌊 平靜航行中
⛈️ 正在風暴裡
🌅 看見曙光了
🗺️ 有點迷航
💭 在思考人生
🎨 創作模式中`
    },

    'nf-community': {
        content: `🌈 **NF 族群 - 理想主義者**

歡迎所有 NF 類型的朋友！

**包含：**
• 🌈 INFP 治癒系詩人
• ✨ ENFP 熱血追夢人
• 🦉 INFJ 深淵凝視者
• 🌟 ENFJ 光輝導師

━━━━━━━━━━━━━━━━━━

💭 **討論主題建議**

• 分享你最近的夢想或靈感
• 理想與現實的平衡
• 如何保護敏感的心
• 深度對話與哲學思考
• 創作與表達

━━━━━━━━━━━━━━━━━━

💡 **NF 族群特質**

✨ 充滿想像力的夢想家
💝 重視情感與意義
🎨 喜歡創造與表達
🌍 關心世界與他人

在這裡，做夢不是錯，敏感是禮物。`
    },

    'nt-community': {
        content: `🔬 **NT 族群 - 理性主義者**

歡迎所有 NT 類型的朋友！

**包含：**
• 🔬 INTP 邏輯解構者
• 💡 ENTP 智力辯論家
• 🎯 INTJ 戰略策劃家
• 👑 ENTJ 天生指揮官

━━━━━━━━━━━━━━━━━━

💭 **討論主題建議**

• 有趣的思想實驗
• 系統與邏輯的探討
• 效率與優化技巧
• 辯論與思辨
• 知識與學習

━━━━━━━━━━━━━━━━━━

💡 **NT 族群特質**

🧠 熱愛思考與分析
🎯 追求效率與邏輯
💡 喜歡創新與突破
📊 用理性探索世界

在這裡，理性不冷血，思考是樂趣。`
    },

    'sf-community': {
        content: `🎨 **SF 族群 - 守護者**

歡迎所有 SF 類型的朋友！

**包含：**
• 🎨 ISFP 自由藝術家
• 🎭 ESFP 閃耀巨星
• 🤗 ISFJ 溫柔守護者
• 💝 ESFJ 熱心供給者

━━━━━━━━━━━━━━━━━━

💭 **討論主題建議**

• 生活中的美好時刻
• 藝術與美學分享
• 照顧他人的經驗
• 實用生活技巧
• 溫暖的故事

━━━━━━━━━━━━━━━━━━

💡 **SF 族群特質**

🌸 活在當下的實踐者
💝 重視和諧與關係
🎨 欣賞美與細節
🤗 溫暖而體貼

在這裡，感受勝過思考，溫暖勝過道理。`
    },

    'st-community': {
        content: `🔧 **ST 族群 - 實踐者**

歡迎所有 ST 類型的朋友！

**包含：**
• 🔧 ISTP 冷靜工匠
• ⚡ ESTP 極限挑戰者
• 📋 ISTJ 守序捍衛者
• ⚖️ ESTJ 鐵血執行長

━━━━━━━━━━━━━━━━━━

💭 **討論主題建議**

• 實用技能與工具
• 效率與執行方法
• 問題解決經驗
• 運動與行動
• 具體的成果分享

━━━━━━━━━━━━━━━━━━

💡 **ST 族群特質**

🔧 務實而行動力強
📊 重視事實與結果
⚡ 直接而高效
🎯 目標導向

在這裡，行動勝過空談，結果說明一切。`
    },

    'dessert-booking': {
        content: `🛒 **甜點訂購**

根據你的性格，訂購專屬甜點！

━━━━━━━━━━━━━━━━━━

🎨 **訂購系統（即將推出）**

未來你可以：
• 線上預訂 MBTI 專屬甜點
• 享受會員折扣優惠
• 查看取貨時間與地點
• 使用積分兌換

━━━━━━━━━━━━━━━━━━

📍 **目前訂購方式**

1. 完成 MBTI 測驗查看推薦甜點
2. 加入 LINE@ (@kiwimu) 詢問訂購
3. 前往實體店直接購買

━━━━━━━━━━━━━━━━━━

💬 **本頻道用途**

• 訂購問題討論
• 取貨資訊分享
• 優惠碼發布（未來）`
    },

    'dessert-showcase': {
        content: `📸 **甜點展示**

用照片記錄美好，用甜點療癒人生。

━━━━━━━━━━━━━━━━━━

✨ **歡迎分享：**

🍰 **甜點美照**
• Moon Moon 店內打卡
• 其他甜點店探訪
• 自己做的甜點

🌸 **生活美好**
• 讓你感到自由的瞬間
• 療癒的日常時刻
• 探索中的美景

━━━━━━━━━━━━━━━━━━

📌 **打卡小技巧**

• 自然光拍攝最美
• 45度角俯拍甜點
• 加上簡單文字說明
• 使用 hashtag #MoonMoon探索

━━━━━━━━━━━━━━━━━━

🎁 **每月最佳照片**

獲得：
• 🌟 「美學大師」身份組
• 🎨 實體照片沖洗
• 🍰 免費甜點券

下次評選：每月最後一個週日`
    },

    'store-info': {
        content: `🏪 **月島甜點店資訊**

━━━━━━━━━━━━━━━━━━

📍 **地址**
👉 https://share.google/wAZieiw9Y2fWxjdQw

⏰ **營業時間**
週一至週日：10:00 - 22:00

📱 **聯絡方式**
LINE@：@kiwimu
Instagram：@kiwimu.mbti

━━━━━━━━━━━━━━━━━━

🗺️ **交通資訊**
（待補充）

🅿️ **停車資訊**
（待補充）

━━━━━━━━━━━━━━━━━━

💡 **小提醒**

• 建議提前預訂避免售罄
• 可使用會員積分折抵
• LINE@ 可查詢即時庫存`
    },

    'results': {
        content: `📊 **測驗結果分享**

分享你的 MBTI 測驗結果，與夥伴交流！

━━━━━━━━━━━━━━━━━━

✨ **歡迎分享：**

📸 **測驗結果截圖**
• 完整報告畫面
• 性格雷達圖
• 甜點配對結果

💬 **你的心得**
• 測驗是否準確？
• 有什麼共鳴的地方？
• 意外的發現

🎨 **創意表達**
• IG Story 設計
• 結果二創
• Meme 梗圖

━━━━━━━━━━━━━━━━━━

💡 **獲得身份組**

完成測驗後使用：
\`/verify 你的UserID\`

即可獲得專屬 MBTI 身份組！`
    },

    'daily-state': {
        content: `🌊 **每日狀態打卡**

這裡是 \`/state\` 指令的訊息發布頻道。

━━━━━━━━━━━━━━━━━━

💭 **如何使用**

在任何頻道輸入：
\`/state 選擇狀態 [加上備註]\`

訊息會自動發送到這裡！

━━━━━━━━━━━━━━━━━━

🎨 **狀態選項**

🌊 平靜航行中
⛈️ 正在風暴裡
🌅 看見曙光了
🗺️ 有點迷航
💭 在思考人生
🎨 創作模式中

━━━━━━━━━━━━━━━━━━

💡 **用途**

• 記錄每日情緒
• 與夥伴互動交流
• 追蹤心情變化`
    },

    'cross-product': {
        content: `🌙 **探索 Moon Moon 宇宙**

除了 MBTI 測驗，還有更多有趣的體驗！

━━━━━━━━━━━━━━━━━━

🧪 **MBTI 性格測驗**
探索你的內在性格，找到你的靈魂甜點
→ https://kiwimu-mbti.vercel.app?utm_source=discord&utm_medium=cross_product&utm_campaign=community

🗺️ **月島品牌地圖**
探索完整的 Moon Moon 世界觀與品牌故事
→ https://moon-map-original.vercel.app?utm_source=discord&utm_medium=cross_product&utm_campaign=community

🎨 **甜點護照測驗**
趣味測驗，獲得你的甜點角色貼紙
→ https://moonmoon-dessert-passport.vercel.app?utm_source=discord&utm_medium=cross_product&utm_campaign=community

🛒 **甜點訂購系統**
線上預訂你的專屬甜點（即將推出）

━━━━━━━━━━━━━━━━━━

💬 **本頻道用途**

• 討論各產品體驗
• 分享跨產品心得
• 提出整合建議`
    },

    'bot-commands': {
        content: `🤖 **Bot 指令測試區**

這裡是練習使用 Bot 指令的地方！

━━━━━━━━━━━━━━━━━━

📌 **常用指令列表**

🎯 **核心指令**
• \`/verify 你的UserID\` - 驗證 MBTI
• \`/state 狀態\` - 分享航行狀態

📊 **即將推出**
• \`/points\` - 查看積分
• \`/profile\` - 查看個人資料
• \`/achievements\` - 查看成就
• \`/redeem\` - 積分兌換

━━━━━━━━━━━━━━━━━━

💡 **使用技巧**

1. 在此頻道測試不會打擾其他人
2. 可以重複使用熟悉指令
3. 指令錯誤時會有提示
4. 有問題到 #feedback 反映

━━━━━━━━━━━━━━━━━━

🎮 **試試看**

現在試試 \`/verify\` 或 \`/state\` 指令吧！`
    },

    'feedback': {
        content: `📝 **Moon Moon 意見箱**

你的聲音，我們都聽見。

━━━━━━━━━━━━━━━━━━

💬 **歡迎在此分享：**

🐛 **回報問題**
• Bot 指令異常
• 網站 bug
• 頻道權限問題

💡 **提出建議**
• 新功能想法
• 活動企劃建議
• 社群經營方向

🎯 **需求與許願**
• 希望增加的服務
• 想要的商品
• 活動許願

❓ **提問**
• 使用疑問
• 測驗相關
• 任何問題

━━━━━━━━━━━━━━━━━━

⏱️ **回應時間**

管理員會在 24 小時內回覆
急迫問題請 @ 管理員

━━━━━━━━━━━━━━━━━━

🙏 **感謝你的參與**

每一個意見都讓 Moon Moon 更好
讓我們一起創造更棒的探索體驗 🌙`
    }
};

client.once('ready', async () => {
    console.log(`✅ Bot 已連線：${client.user.tag}`);

    const guildId = process.env.DISCORD_GUILD_ID;
    const guild = await client.guilds.fetch(guildId);

    console.log(`\n🚀 開始發送歡迎訊息到所有頻道...\n`);

    for (const [channelName, messageData] of Object.entries(CHANNEL_MESSAGES)) {
        try {
            // 找到頻道
            const channel = guild.channels.cache.find(ch => ch.name === channelName);

            if (!channel) {
                console.log(`❌ 找不到頻道：${channelName}`);
                continue;
            }

            // 發送訊息
            const message = await channel.send(messageData.content);

            // 釘選訊息
            await message.pin();

            console.log(`✅ 已發送並釘選：${channelName}`);

            // 等待一下避免 rate limit
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`❌ 發送失敗：${channelName}`, error.message);
        }
    }

    console.log('\n🎉 所有訊息發送完成！');
    console.log('Bot 將在 5 秒後關閉...');

    setTimeout(() => {
        process.exit(0);
    }, 5000);
});

client.login(process.env.DISCORD_TOKEN);
