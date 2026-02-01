const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

// Discord 架構定義
const DISCORD_STRUCTURE = {
    '📢 公告區': {
        channels: [
            { name: 'start-here', permissions: 'announcement' },
            { name: 'announcements', permissions: 'announcement' },
            { name: 'events', permissions: 'default' }
        ]
    },
    '💬 交流區': {
        channels: [
            { name: 'general', permissions: 'default' },
            { name: 'nf-community', permissions: 'nf-only' },
            { name: 'nt-community', permissions: 'nt-only' },
            { name: 'sf-community', permissions: 'sf-only' },
            { name: 'st-community', permissions: 'st-only' }
        ]
    },
    '🍰 甜點相關': {
        channels: [
            { name: 'dessert-booking', permissions: 'default' },
            { name: 'dessert-showcase', permissions: 'default' },
            { name: 'store-info', permissions: 'announcement' }
        ]
    },
    '🎮 互動區': {
        channels: [
            { name: 'results', permissions: 'default' },
            { name: 'daily-state', permissions: 'bot-only' },
            { name: 'cross-product', permissions: 'default' }
        ]
    },
    '🛠️ 管理區': {
        channels: [
            { name: 'bot-commands', permissions: 'default' },
            { name: 'feedback', permissions: 'default' },
            { name: 'admin', permissions: 'admin-only' }
        ]
    }
};

// MBTI Role 名稱
const MBTI_ROLES = {
    NF: ['🌈 INFP 治癒系詩人', '✨ ENFP 熱血追夢人', '🦉 INFJ 深淵凝視者', '🌟 ENFJ 光輝導師'],
    NT: ['🔬 INTP 邏輯解構者', '💡 ENTP 智力辯論家', '🎯 INTJ 戰略策劃家', '👑 ENTJ 天生指揮官'],
    SF: ['🎨 ISFP 自由藝術家', '🎭 ESFP 閃耀巨星', '🤗 ISFJ 溫柔守護者', '💝 ESFJ 熱心供給者'],
    ST: ['🔧 ISTP 冷靜工匠', '⚡ ESTP 極限挑戰者', '📋 ISTJ 守序捍衛者', '⚖️ ESTJ 鐵血執行長']
};

client.once('ready', async () => {
    console.log(`✅ Bot 已連線：${client.user.tag}\n`);

    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);

    console.log('🗑️  步驟 1：刪除所有舊頻道與分類...\n');

    // 刪除所有現有頻道和分類
    const channels = await guild.channels.fetch();
    for (const [id, channel] of channels) {
        // 保留系統頻道
        if (channel.name === 'general' && channel.type === ChannelType.GuildText) continue;

        try {
            await channel.delete();
            console.log(`   ❌ 已刪除：${channel.name}`);
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.log(`   ⚠️  無法刪除：${channel.name} (${error.message})`);
        }
    }

    console.log('\n✅ 舊頻道刪除完成！\n');
    console.log('🏗️  步驟 2：建立新的架構...\n');

    // 建立新架構
    for (const [categoryName, categoryData] of Object.entries(DISCORD_STRUCTURE)) {
        console.log(`\n📁 建立分類：${categoryName}`);

        // 建立 Category
        const category = await guild.channels.create({
            name: categoryName,
            type: ChannelType.GuildCategory
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        // 在 Category 下建立頻道
        for (const channelInfo of categoryData.channels) {
            console.log(`   ➕ 建立頻道：${channelInfo.name}`);

            // 建立頻道
            const channel = await guild.channels.create({
                name: channelInfo.name,
                type: ChannelType.GuildText,
                parent: category.id
            });

            // 設定權限
            await setChannelPermissions(channel, channelInfo.permissions, guild);

            await new Promise(resolve => setTimeout(resolve, 800));
        }
    }

    console.log('\n\n🎉 Discord 架構建立完成！');
    console.log('\n📊 統計：');
    console.log(`   - 分類數：${Object.keys(DISCORD_STRUCTURE).length}`);
    console.log(`   - 頻道數：${Object.values(DISCORD_STRUCTURE).reduce((sum, cat) => sum + cat.channels.length, 0)}`);
    console.log('\n✅ 所有頻道已建立並設定權限！');
    console.log('\n🚀 下一步：執行 post-welcome-messages.js 發布歡迎訊息');
    console.log('\nBot 將在 5 秒後關閉...');

    setTimeout(() => {
        process.exit(0);
    }, 5000);
});

// 設定頻道權限的函數
async function setChannelPermissions(channel, permissionType, guild) {
    const everyoneRole = guild.roles.everyone;

    switch (permissionType) {
        case 'announcement':
            // 所有人可讀，只有管理員和 Bot 可寫
            await channel.permissionOverwrites.edit(everyoneRole, {
                [PermissionFlagsBits.ViewChannel]: true,
                [PermissionFlagsBits.SendMessages]: false
            });
            console.log(`      🔒 權限：公告模式（只讀）`);
            break;

        case 'bot-only':
            // 所有人可讀，只有 Bot 可寫
            await channel.permissionOverwrites.edit(everyoneRole, {
                [PermissionFlagsBits.ViewChannel]: true,
                [PermissionFlagsBits.SendMessages]: false
            });
            console.log(`      🔒 權限：Bot 專用`);
            break;

        case 'admin-only':
            // 只有管理員可見
            await channel.permissionOverwrites.edit(everyoneRole, {
                [PermissionFlagsBits.ViewChannel]: false
            });
            console.log(`      🔒 權限：管理員專用`);
            break;

        case 'nf-only':
        case 'nt-only':
        case 'sf-only':
        case 'st-only':
            // 先設定 everyone 不可見
            await channel.permissionOverwrites.edit(everyoneRole, {
                [PermissionFlagsBits.ViewChannel]: false
            });

            // 找到對應的 MBTI Roles 並設定可見
            const roleGroup = permissionType.split('-')[0].toUpperCase();
            const rolesForGroup = MBTI_ROLES[roleGroup];

            if (rolesForGroup) {
                for (const roleName of rolesForGroup) {
                    const role = guild.roles.cache.find(r => r.name === roleName);
                    if (role) {
                        await channel.permissionOverwrites.edit(role, {
                            [PermissionFlagsBits.ViewChannel]: true,
                            [PermissionFlagsBits.SendMessages]: true
                        });
                    }
                }
                console.log(`      🔒 權限：${roleGroup} 族群專屬`);
            }
            break;

        case 'default':
        default:
            // 所有人可讀寫
            console.log(`      ✅ 權限：所有人可讀寫`);
            break;
    }
}

client.login(process.env.DISCORD_TOKEN);
