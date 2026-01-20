const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// 新的 MBTI 角色名稱（詩意版本）
const NEW_ROLE_NAMES = {
    '🌈 INFP 夢想家': '🌈 INFP 治癒系詩人',
    '✨ ENFP 探險家': '✨ ENFP 熱血追夢人',
    '🦉 INFJ 洞察者': '🦉 INFJ 深淵凝視者',
    '🌟 ENFJ 引導者': '🌟 ENFJ 光輝導師',
    '🔬 INTP 思考者': '🔬 INTP 邏輯解構者',
    '💡 ENTP 創新者': '💡 ENTP 智力辯論家',
    '🎯 INTJ 策略者': '🎯 INTJ 戰略策劃家',
    '👑 ENTJ 領導者': '👑 ENTJ 天生指揮官',
    '🎨 ISFP 藝術家': '🎨 ISFP 自由藝術家',
    '🎭 ESFP 表演者': '🎭 ESFP 閃耀巨星',
    '🤗 ISFJ 守護者': '🤗 ISFJ 溫柔守護者',
    '💝 ESFJ 照顧者': '💝 ESFJ 熱心供給者',
    '🔧 ISTP 實踐者': '🔧 ISTP 冷靜工匠',
    '⚡ ESTP 行動派': '⚡ ESTP 極限挑戰者',
    '📋 ISTJ 守護者': '📋 ISTJ 守序捍衛者',
    '⚖️ ESTJ 執行者': '⚖️ ESTJ 鐵血執行長'
};

client.once('ready', async () => {
    console.log(`✅ Bot 已連線：${client.user.tag}`);

    const guildId = process.env.DISCORD_GUILD_ID;
    const guild = await client.guilds.fetch(guildId);

    console.log(`\n🔄 開始更新身份組名稱...\n`);

    let updateCount = 0;
    let skipCount = 0;

    for (const [oldName, newName] of Object.entries(NEW_ROLE_NAMES)) {
        try {
            // 找到舊名稱的身份組
            const role = guild.roles.cache.find(r => r.name === oldName);

            if (!role) {
                console.log(`⚠️ 找不到身份組：${oldName}`);
                skipCount++;
                continue;
            }

            // 更新名稱
            await role.setName(newName);
            console.log(`✅ 已更新：${oldName} → ${newName}`);
            updateCount++;

            // 等待避免 rate limit
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`❌ 更新失敗：${oldName}`, error.message);
        }
    }

    console.log(`\n🎉 更新完成！`);
    console.log(`✅ 成功更新：${updateCount} 個`);
    console.log(`⚠️ 跳過：${skipCount} 個`);
    console.log('Bot 將在 5 秒後關閉...');

    setTimeout(() => {
        process.exit(0);
    }, 5000);
});

client.login(process.env.DISCORD_TOKEN);
