const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

// 新的甜點推薦內容
const NEW_DESSERT_MESSAGE = `🍰 **甜點推薦**

甜點不只是食物，更是療癒的力量。

━━━━━━━━━━━━━━━━━━

📍 **KIWIMU 必吃推薦**

🌟 **人氣 TOP 5**
1. 北海道經典巴斯克
2. 經典提拉米蘇
3. 北海道十勝戚風蛋糕
4. 經典烤布丁
5. 草莓莓果千層蛋糕

🎨 **依性格推薦**
• **NF 族群**（理想主義者）
  - INFP 治癒系詩人：北海道十勝戚風蛋糕
  - ENFP 熱血追夢人：草莓莓果千層蛋糕
  - INFJ 深淵凝視者：茶香巴斯克
  - ENFJ 光輝導師：檸檬蘋果戚風蛋糕

• **NT 族群**（理性主義者）
  - INTJ 戰略策劃家：北海道經典巴斯克
  - INTP 邏輯解構者：檸檬柚子千層蛋糕
  - ENTJ 天生指揮官：奶酒提拉米蘇
  - ENTP 智力辯論家：柚子蘋果提拉米蘇

• **SF 族群**（生活藝術家）
  - ISFP 自由藝術家：抹茶提拉米蘇
  - ESFP 閃耀巨星：綜合水果戚風蛋糕
  - ISFJ 溫柔守護者：經典烤布丁
  - ESFJ 熱心供給者：莓果戚風蛋糕

• **ST 族群**（實踐者）
  - ISTP 冷靜工匠：經典提拉米蘇
  - ESTP 極限挑戰者：巧克力布朗尼千層
  - ISTJ 守序捍衛者：經典十勝原味千層
  - ESTJ 鐵血執行長：鹹蛋黃巴斯克

━━━━━━━━━━━━━━━━━━

💬 **歡迎分享：**

• 你最愛的甜點
• 甜點與心情的搭配
• KIWIMU 新品試吃心得

━━━━━━━━━━━━━━━━━━

🏪 **月島甜點店**
營業：10:00-22:00`;

client.once('ready', async () => {
    console.log(`✅ Bot 已連線：${client.user.tag}`);

    const guildId = process.env.DISCORD_GUILD_ID;
    const guild = await client.guilds.fetch(guildId);

    console.log(`\n🔄 開始更新甜點推薦訊息...\n`);

    try {
        // 找到甜點推薦頻道
        const channel = guild.channels.cache.find(ch => ch.name === '🍰-甜點推薦');

        if (!channel) {
            console.log('❌ 找不到頻道：🍰-甜點推薦');
            process.exit(1);
        }

        console.log(`✅ 找到頻道：${channel.name}`);

        // 獲取所有釘選訊息
        const pinnedMessages = await channel.messages.fetchPinned();
        console.log(`📌 找到 ${pinnedMessages.size} 個釘選訊息`);

        // 刪除舊的釘選訊息（如果有的話）
        for (const message of pinnedMessages.values()) {
            if (message.author.id === client.user.id && message.content.includes('甜點推薦')) {
                await message.delete();
                console.log('🗑️ 已刪除舊的甜點推薦訊息');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // 發送新訊息
        const newMessage = await channel.send(NEW_DESSERT_MESSAGE);
        console.log('✅ 已發送新的甜點推薦訊息');

        // 釘選新訊息
        await newMessage.pin();
        console.log('📌 已釘選新訊息');

        console.log('\n🎉 更新完成！');

    } catch (error) {
        console.error('❌ 更新失敗:', error);
    }

    console.log('Bot 將在 5 秒後關閉...');
    setTimeout(() => {
        process.exit(0);
    }, 5000);
});

client.login(process.env.DISCORD_TOKEN);
