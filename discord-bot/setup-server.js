require('dotenv').config();
const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// MBTI 身份組配置（16 種）
const MBTI_ROLES = [
    { name: '🌈 INFP 夢想家', color: '#9B59B6' },
    { name: '✨ ENFP 探險家', color: '#E91E63' },
    { name: '🦉 INFJ 洞察者', color: '#673AB7' },
    { name: '🌟 ENFJ 引導者', color: '#FF5722' },
    { name: '🔬 INTP 思考者', color: '#2196F3' },
    { name: '💡 ENTP 創新者', color: '#00BCD4' },
    { name: '🎯 INTJ 策略者', color: '#3F51B5' },
    { name: '👑 ENTJ 領導者', color: '#F44336' },
    { name: '🎨 ISFP 藝術家', color: '#FF9800' },
    { name: '🎭 ESFP 表演者', color: '#FFC107' },
    { name: '🤗 ISFJ 守護者', color: '#8BC34A' },
    { name: '💝 ESFJ 照顧者', color: '#CDDC39' },
    { name: '🔧 ISTP 實踐者', color: '#4CAF50' },
    { name: '⚡ ESTP 行動派', color: '#009688' },
    { name: '📋 ISTJ 守護者', color: '#607D8B' },
    { name: '⚖️ ESTJ 執行者', color: '#795548' }
];

// VIP 身份組
const VIP_ROLES = [
    { name: '🌟 超級粉絲', color: '#FFD700' },
    { name: '💎 貼圖收藏家', color: '#FF1493' },
    { name: '🥇 店內消費者', color: '#FF6347' },
    { name: '🥈 LINE 會員', color: '#00B900' },
    { name: '🥉 測驗完成者', color: '#C0C0C0' }
];

// 頻道架構（簡化版 - 16 個頻道）
const CHANNEL_STRUCTURE = {
    '📢 公告': [
        { name: '📣-最新消息', type: 'text', readOnly: true },
        { name: '🎉-活動公告', type: 'text' }
    ],
    '💬 交流區': [
        {
            name: '🌈-NF族群',
            type: 'text',
            description: 'INFP, ENFP, INFJ, ENFJ 專屬',
            allowedGroups: ['🌈 INFP 夢想家', '✨ ENFP 探險家', '🦉 INFJ 洞察者', '🌟 ENFJ 引導者']
        },
        {
            name: '🔬-NT族群',
            type: 'text',
            description: 'INTP, ENTP, INTJ, ENTJ 專屬',
            allowedGroups: ['🔬 INTP 思考者', '💡 ENTP 創新者', '🎯 INTJ 策略者', '👑 ENTJ 領導者']
        },
        {
            name: '🎨-SF族群',
            type: 'text',
            description: 'ISFP, ESFP, ISFJ, ESFJ 專屬',
            allowedGroups: ['🎨 ISFP 藝術家', '🎭 ESFP 表演者', '🤗 ISFJ 守護者', '💝 ESFJ 照顧者']
        },
        {
            name: '🔧-ST族群',
            type: 'text',
            description: 'ISTP, ESTP, ISTJ, ESTJ 專屬',
            allowedGroups: ['🔧 ISTP 實踐者', '⚡ ESTP 行動派', '📋 ISTJ 守護者', '⚖️ ESTJ 執行者']
        },
        { name: '💬-跨類型閒聊', type: 'text' }
    ],
    '🍰 甜點店': [
        { name: '🍰-甜點推薦', type: 'text' },
        { name: '📸-打卡分享', type: 'text' },
        { name: '🏪-門市資訊', type: 'text' }
    ],
    '💎 會員專區': [
        { name: '🥈-LINE會員', type: 'text', vipRole: '🥈 LINE 會員' },
        { name: '🥇-店內消費者', type: 'text', vipRole: '🥇 店內消費者' },
        { name: '💎-貼圖收藏家', type: 'text', vipRole: '💎 貼圖收藏家' },
        { name: '🌟-超級粉絲', type: 'text', vipRole: '🌟 超級粉絲' }
    ],
    '🛠️ 工具': [
        { name: '🤖-BOT指令', type: 'text' },
        { name: '📝-意見箱', type: 'text' }
    ]
};

async function setupServer(guild) {
    console.log('🚀 開始自動化設置伺服器...\n');

    try {
        // Step 1: 創建身份組
        console.log('📝 Step 1: 創建身份組...');
        const createdRoles = {};

        // 創建 VIP 身份組
        for (const roleData of VIP_ROLES) {
            const role = await guild.roles.create({
                name: roleData.name,
                color: roleData.color,
                hoist: true, // 在成員列表單獨顯示
                mentionable: true
            });
            createdRoles[roleData.name] = role;
            console.log(`  ✅ 創建: ${roleData.name}`);
            await sleep(500); // 避免速率限制
        }

        // 創建 MBTI 身份組
        for (const roleData of MBTI_ROLES) {
            const role = await guild.roles.create({
                name: roleData.name,
                color: roleData.color,
                hoist: true,
                mentionable: true
            });
            createdRoles[roleData.name] = role;
            console.log(`  ✅ 創建: ${roleData.name}`);
            await sleep(500);
        }

        console.log(`\n✅ 完成！共創建 ${Object.keys(createdRoles).length} 個身份組\n`);

        // Step 2: 創建頻道架構
        console.log('📁 Step 2: 創建頻道架構...');

        for (const [categoryName, channels] of Object.entries(CHANNEL_STRUCTURE)) {
            // 創建類別
            const category = await guild.channels.create({
                name: categoryName,
                type: 4 // 4 = Category
            });
            console.log(`  📂 創建類別: ${categoryName}`);

            // 在類別下創建頻道
            for (const channelData of channels) {
                const channelOptions = {
                    name: channelData.name,
                    type: 0, // 0 = Text Channel
                    parent: category.id
                };

                // 設定權限
                const permissionOverwrites = [];

                // 如果是唯讀頻道
                if (channelData.readOnly) {
                    permissionOverwrites.push({
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.SendMessages],
                        allow: [PermissionFlagsBits.ViewChannel]
                    });
                }

                // 如果是族群專屬頻道（多個 MBTI 類型）
                if (channelData.allowedGroups) {
                    // 預設隱藏
                    permissionOverwrites.push({
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    });

                    // 給予允許的族群存取權限
                    for (const groupName of channelData.allowedGroups) {
                        const role = createdRoles[groupName];
                        if (role) {
                            permissionOverwrites.push({
                                id: role.id,
                                allow: [
                                    PermissionFlagsBits.ViewChannel,
                                    PermissionFlagsBits.SendMessages,
                                    PermissionFlagsBits.ReadMessageHistory
                                ]
                            });
                        }
                    }
                }

                // 如果是 VIP 專屬頻道
                if (channelData.vipRole) {
                    const role = createdRoles[channelData.vipRole];
                    if (role) {
                        permissionOverwrites.push(
                            {
                                id: guild.roles.everyone.id,
                                deny: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: role.id,
                                allow: [
                                    PermissionFlagsBits.ViewChannel,
                                    PermissionFlagsBits.SendMessages,
                                    PermissionFlagsBits.ReadMessageHistory
                                ]
                            }
                        );
                    }
                }
                channelOptions.permissionOverwrites = permissionOverwrites;

                const channel = await guild.channels.create(channelOptions);
                console.log(`    ✅ 創建頻道: ${channelData.name}`);
                await sleep(500);
            }
        }

        console.log('\n🎉 伺服器設置完成！\n');
        console.log('📊 統計：');
        console.log(`  - 身份組: ${Object.keys(createdRoles).length} 個`);
        console.log(`  - 類別: ${Object.keys(CHANNEL_STRUCTURE).length} 個`);
        const totalChannels = Object.values(CHANNEL_STRUCTURE).reduce((sum, channels) => sum + channels.length, 0);
        console.log(`  - 頻道: ${totalChannels} 個`);

    } catch (error) {
        console.error('❌ 設置失敗:', error);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

client.once('ready', async () => {
    console.log(`✅ Bot 已登入為 ${client.user.tag}\n`);

    // 獲取伺服器（假設只有一個伺服器）
    const guild = client.guilds.cache.first();

    if (!guild) {
        console.error('❌ 找不到伺服器！請確認 Bot 已加入伺服器。');
        process.exit(1);
    }

    console.log(`📍 目標伺服器: ${guild.name}\n`);

    // 確認執行
    console.log('⚠️  這將會創建所有身份組和頻道架構');
    console.log('⚠️  請確認這是你想要設置的伺服器！\n');
    console.log('開始執行...\n');

    await setupServer(guild);

    console.log('\n✅ 所有設置完成！Bot 將在 5 秒後關閉...');
    setTimeout(() => {
        process.exit(0);
    }, 5000);
});

client.login(process.env.DISCORD_TOKEN);
