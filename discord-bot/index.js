require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-adminsdk-key.json');

// 初始化 Firebase
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// 創建 Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ]
});

// MBTI 類型對應的身份組名稱
const MBTI_ROLE_MAPPING = {
    'INFP-A': '🌈 INFP 治癒系詩人',
    'INFP-T': '🌈 INFP 治癒系詩人',
    'ENFP-A': '✨ ENFP 熱血追夢人',
    'ENFP-T': '✨ ENFP 熱血追夢人',
    'INFJ-A': '🦉 INFJ 深淵凝視者',
    'INFJ-T': '🦉 INFJ 深淵凝視者',
    'ENFJ-A': '🌟 ENFJ 光輝導師',
    'ENFJ-T': '🌟 ENFJ 光輝導師',
    'INTP-A': '🔬 INTP 邏輯解構者',
    'INTP-T': '🔬 INTP 邏輯解構者',
    'ENTP-A': '💡 ENTP 智力辯論家',
    'ENTP-T': '💡 ENTP 智力辯論家',
    'INTJ-A': '🎯 INTJ 戰略策劃家',
    'INTJ-T': '🎯 INTJ 戰略策劃家',
    'ENTJ-A': '👑 ENTJ 天生指揮官',
    'ENTJ-T': '👑 ENTJ 天生指揮官',
    'ISFP-A': '🎨 ISFP 自由藝術家',
    'ISFP-T': '🎨 ISFP 自由藝術家',
    'ESFP-A': '🎭 ESFP 閃耀巨星',
    'ESFP-T': '🎭 ESFP 閃耀巨星',
    'ISFJ-A': '🤗 ISFJ 溫柔守護者',
    'ISFJ-T': '🤗 ISFJ 溫柔守護者',
    'ESFJ-A': '💝 ESFJ 熱心供給者',
    'ESFJ-T': '💝 ESFJ 熱心供給者',
    'ISTP-A': '🔧 ISTP 冷靜工匠',
    'ISTP-T': '🔧 ISTP 冷靜工匠',
    'ESTP-A': '⚡ ESTP 極限挑戰者',
    'ESTP-T': '⚡ ESTP 極限挑戰者',
    'ISTJ-A': '📋 ISTJ 守序捍衛者',
    'ISTJ-T': '📋 ISTJ 守序捍衛者',
    'ESTJ-A': '⚖️ ESTJ 鐵血執行長',
    'ESTJ-T': '⚖️ ESTJ 鐵血執行長'
};

// Slash Command Definitions
const commands = [
    new SlashCommandBuilder()
        .setName('verify')
        .setDescription('驗證你的 MBTI 測驗結果並獲得專屬身份組')
        .addStringOption(option =>
            option
                .setName('userid')
                .setDescription('你的 Firebase User ID（在測驗結果頁面可以找到）')
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('state')
        .setDescription('分享你今天的航行狀態')
        .addStringOption(option =>
            option
                .setName('status')
                .setDescription('今天的狀態')
                .setRequired(true)
                .addChoices(
                    { name: '🌊 平靜航行中', value: 'calm' },
                    { name: '⛈️ 正在風暴裡', value: 'storm' },
                    { name: '🌅 看見曙光了', value: 'dawn' },
                    { name: '🗺️ 有點迷航', value: 'lost' },
                    { name: '💭 在思考人生', value: 'thinking' },
                    { name: '🎨 創作模式中', value: 'creative' }
                )
        )
        .addStringOption(option =>
            option
                .setName('note')
                .setDescription('想說的話（選填）')
                .setRequired(false)
        )
].map(command => command.toJSON());

// 註冊 Slash Commands
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function deployCommands() {
    try {
        console.log('開始註冊 Slash Commands...');
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.DISCORD_CLIENT_ID,
                process.env.DISCORD_GUILD_ID
            ),
            { body: commands }
        );
        console.log('✅ Slash Commands 註冊成功！');
    } catch (error) {
        console.error('註冊 Slash Commands 失敗:', error);
    }
}

// 從 Firebase 查詢用戶的 MBTI 類型
async function getUserMBTI(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return null;
        }

        const userData = userDoc.data();
        const runs = userData.runs || {};

        // 找最新的測驗結果
        const runEntries = Object.entries(runs);
        if (runEntries.length === 0) {
            return null;
        }

        const latestRun = runEntries.sort((a, b) =>
            b[1].timestamp - a[1].timestamp
        )[0][1];

        return latestRun.mbtiType || null;
    } catch (error) {
        console.error('查詢 Firebase 失敗:', error);
        return null;
    }
}

// 分配 MBTI 身份組
async function assignMBTIRole(member, mbtiType) {
    const roleName = MBTI_ROLE_MAPPING[mbtiType];

    if (!roleName) {
        return { success: false, message: `找不到對應的身份組（類型：${mbtiType}）` };
    }

    // 找到對應的身份組
    const role = member.guild.roles.cache.find(r => r.name === roleName);

    if (!role) {
        return { success: false, message: `伺服器沒有「${roleName}」身份組` };
    }

    // 移除其他 MBTI 身份組（避免重複）
    const mbtiRoleNames = Object.values(MBTI_ROLE_MAPPING);
    const memberMBTIRoles = member.roles.cache.filter(r =>
        mbtiRoleNames.includes(r.name)
    );

    if (memberMBTIRoles.size > 0) {
        await member.roles.remove(memberMBTIRoles);
    }

    // 添加新身份組
    await member.roles.add(role);

    // 同時給予「測驗完成者」身份組
    const completedRole = member.guild.roles.cache.find(r =>
        r.name === '🥉 測驗完成者'
    );

    if (completedRole) {
        await member.roles.add(completedRole);
    }

    return { success: true, role, mbtiType };
}

// Bot ready 事件
client.once('ready', async () => {
    console.log(`✅ Bot 已上線：${client.user.tag}`);
    console.log(`📍 正在服務：${client.guilds.cache.size} 個伺服器`);

    // 註冊指令
    await deployCommands();

    // 設定狀態
    client.user.setActivity('性格測驗驗證', { type: 'WATCHING' });
});

// 處理 Slash Commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // /verify 指令
    if (interaction.commandName === 'verify') {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.options.getString('userid');

        // 從 Firebase 查詢 MBTI 類型
        const mbtiType = await getUserMBTI(userId);

        if (!mbtiType) {
            return interaction.editReply({
                content:
                    '❌ **找不到你的測驗結果！**\n\n' +
                    '請確認：\n' +
                    '1. 你已經完成 KIWIMU MBTI 測驗\n' +
                    '2. User ID 正確（可在結果頁面找到）\n' +
                    '3. 測驗結果已儲存\n\n' +
                    '💡 **如何找到 User ID？**\n' +
                    '在測驗結果頁面，點擊右上角「我的檔案」，可以看到你的 User ID。'
            });
        }

        // 分配身份組
        try {
            const result = await assignMBTIRole(interaction.member, mbtiType);

            if (!result.success) {
                return interaction.editReply({
                    content: `❌ ${result.message}`
                });
            }

            // 成功訊息
            await interaction.editReply({
                content:
                    `✅ **驗證成功！歡迎登船，航行者！**\n\n` +
                    `⛵ **你的性格類型：** ${result.mbtiType}\n` +
                    `🎨 **已獲得身分組：** ${result.role}\n\n` +
                    `**現在你可以：**\n` +
                    `• 存取你的專屬族群頻道\n` +
                    `• 使用 \`/state\` 分享你的航行狀態\n` +
                    `• 與同在航行的夥伴交流\n\n` +
                    `開始你的自由航行吧！🚀`
            });

            // 在公告頻道發歡迎訊息
            const welcomeChannel = interaction.guild.channels.cache.find(
                ch => ch.name === '📣-最新消息'
            );

            if (welcomeChannel) {
                welcomeChannel.send(
                    `⛵ 新的航行者登船了！歡迎 ${interaction.member} 加入 ${result.role} 的航行！`
                );
            }

        } catch (error) {
            console.error('分配身份組失敗:', error);
            return interaction.editReply({
                content: '❌ 發生錯誤，請稍後再試，或聯繫管理員。'
            });
        }
    }

    // /state 指令 - 每日狀態打卡
    if (interaction.commandName === 'state') {
        const status = interaction.options.getString('status');
        const note = interaction.options.getString('note');

        const stateEmojis = {
            'calm': '🌊',
            'storm': '⛈️',
            'dawn': '🌅',
            'lost': '🗺️',
            'thinking': '💭',
            'creative': '🎨'
        };

        const stateMessages = {
            'calm': '平靜航行中',
            'storm': '正在風暴裡',
            'dawn': '看見曙光了',
            'lost': '有點迷航',
            'thinking': '在思考人生',
            'creative': '創作模式中'
        };

        // 找到狀態分享頻道
        const stateChannel = interaction.guild.channels.cache.find(
            ch => ch.name === '💬-跨類型閒聊'
        );

        if (!stateChannel) {
            return interaction.reply({
                content: '找不到狀態分享頻道',
                ephemeral: true
            });
        }

        // 發布狀態
        const message = note
            ? `${stateEmojis[status]} **${interaction.user.username}** 今天：${stateMessages[status]}\n💬 "${note}"`
            : `${stateEmojis[status]} **${interaction.user.username}** 今天：${stateMessages[status]}`;

        await stateChannel.send(message);

        // 回覆用戶
        await interaction.reply({
            content: `✅ 已分享你的航行狀態！\n\n${message}\n\n繼續你的航行吧！⛵`,
            ephemeral: true
        });

        // TODO: 儲存到數據庫用於統計
    }
});

// 新成員加入事件
client.on('guildMemberAdd', async member => {
    const welcomeChannel = member.guild.channels.cache.find(
        ch => ch.name === '📣-最新消息'
    );

    if (welcomeChannel) {
        welcomeChannel.send(
            `⛵ 歡迎 ${member} 登船！\n\n` +
            `這裡不只是性格測驗社群，更是一群正在尋找自由的航行者的基地。\n\n` +
            `**🚀 快速開始：**\n` +
            `1️⃣ 前往 https://kiwimu-mbti.vercel.app 完成測驗\n` +
            `2️⃣ 使用 \`/verify 你的UserID\` 獲得專屬身份組\n` +
            `3️⃣ 使用 \`/state\` 分享你今天的航行狀態\n\n` +
            `在這裡，每個人都在航行，都在尋找自己的自由。\n` +
            `歡迎你，航行者。💫`
        );
    }
});

// 登入
client.login(process.env.DISCORD_TOKEN);
