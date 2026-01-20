require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const admin = require('firebase-admin');
const serviceAccount = require('../firebase-adminsdk-key.json');

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
    'INFP-A': '🌈 INFP 夢想家',
    'INFP-T': '🌈 INFP 夢想家',
    'ENFP-A': '✨ ENFP 探險家',
    'ENFP-T': '✨ ENFP 探險家',
    'INFJ-A': '🦉 INFJ 洞察者',
    'INFJ-T': '🦉 INFJ 洞察者',
    'ENFJ-A': '🌟 ENFJ 引導者',
    'ENFJ-T': '🌟 ENFJ 引導者',
    'INTP-A': '🔬 INTP 思考者',
    'INTP-T': '🔬 INTP 思考者',
    'ENTP-A': '💡 ENTP 創新者',
    'ENTP-T': '💡 ENTP 創新者',
    'INTJ-A': '🎯 INTJ 策略者',
    'INTJ-T': '🎯 INTJ 策略者',
    'ENTJ-A': '👑 ENTJ 領導者',
    'ENTJ-T': '👑 ENTJ 領導者',
    'ISFP-A': '🎨 ISFP 藝術家',
    'ISFP-T': '🎨 ISFP 藝術家',
    'ESFP-A': '🎭 ESFP 表演者',
    'ESFP-T': '🎭 ESFP 表演者',
    'ISFJ-A': '🤗 ISFJ 守護者',
    'ISFJ-T': '🤗 ISFJ 守護者',
    'ESFJ-A': '💝 ESFJ 照顧者',
    'ESFJ-T': '💝 ESFJ 照顧者',
    'ISTP-A': '🔧 ISTP 實踐者',
    'ISTP-T': '🔧 ISTP 實踐者',
    'ESTP-A': '⚡ ESTP 行動派',
    'ESTP-T': '⚡ ESTP 行動派',
    'ISTJ-A': '📋 ISTJ 守護者',
    'ISTJ-T': '📋 ISTJ 守護者',
    'ESTJ-A': '⚖️ ESTJ 執行者',
    'ESTJ-T': '⚖️ ESTJ 執行者'
};

// Slash Command Definition
const commands = [
    new SlashCommandBuilder()
        .setName('verify')
        .setDescription('驗證你的 MBTI 測驗結果並獲得專屬身份組')
        .addStringOption(option =>
            option
                .setName('userid')
                .setDescription('你的 Firebase User ID（在測驗結果頁面可以找到）')
                .setRequired(true)
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
                    `✅ **驗證成功！歡迎來到 KIWIMU 性格宇宙！**\n\n` +
                    `🎯 **你的性格類型：** ${result.mbtiType}\n` +
                    `🎨 **已獲得身分組：** ${result.role}\n\n` +
                    `**現在你可以：**\n` +
                    `• 存取你的專屬族群頻道\n` +
                    `• 與同類型的夥伴交流\n` +
                    `• 參與專屬活動和抽獎\n\n` +
                    `開始探索吧！🚀`
            });

            // 在公告頻道發歡迎訊息
            const welcomeChannel = interaction.guild.channels.cache.find(
                ch => ch.name === '📣-最新消息'
            );

            if (welcomeChannel) {
                welcomeChannel.send(
                    `🎉 歡迎 ${interaction.member} 加入 ${result.role} 大家庭！`
                );
            }

        } catch (error) {
            console.error('分配身份組失敗:', error);
            return interaction.editReply({
                content: '❌ 發生錯誤，請稍後再試，或聯繫管理員。'
            });
        }
    }
});

// 新成員加入事件
client.on('guildMemberAdd', async member => {
    const welcomeChannel = member.guild.channels.cache.find(
        ch => ch.name === '📣-最新消息'
    );

    if (welcomeChannel) {
        welcomeChannel.send(
            `👋 歡迎 ${member} 來到 **KIWIMU 性格宇宙**！\n\n` +
            `🎯 **快速開始：**\n` +
            `1️⃣ 前往 https://kiwimu-mbti.vercel.app 完成性格測驗\n` +
            `2️⃣ 測驗完成後，回到這裡使用 \`/verify 你的UserID\` 獲得專屬身份組\n` +
            `3️⃣ 解鎖你的專屬族群頻道，開始交流！\n\n` +
            `有任何問題請到 <#📝-意見箱> 留言 💬`
        );
    }
});

// 登入
client.login(process.env.DISCORD_TOKEN);
