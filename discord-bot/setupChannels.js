/**
 * Discord 頻道與身份組自動建立腳本（一次性執行）
 *
 * 這個腳本會幫你：
 * 1. 建立所有需要的 Category + 頻道
 * 2. 建立 16 種 MBTI 身份組 + 會員等級身份組
 * 3. 自動設定頻道權限（公告只讀、族群頻道只有對應身份組可見）
 *
 * 使用方式：
 * DISCORD_BOT_TOKEN=你的Token \
 * DISCORD_GUILD_ID=你的GuildID \
 * node setupChannels.js
 */

require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } = require('discord.js');
const { CHANNEL_NAMES } = require('./channelConfig');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// MBTI 身份組名稱（與你現有 Bot 一致）
const MBTI_ROLES = [
  '🌈 INFP 治癒系詩人',
  '✨ ENFP 熱血追夢人',
  '🦉 INFJ 深淵凝視者',
  '🌟 ENFJ 光輝導師',
  '🔬 INTP 邏輯解構者',
  '💡 ENTP 智力辯論家',
  '🎯 INTJ 戰略策劃家',
  '👑 ENTJ 天生指揮官',
  '🎨 ISFP 自由藝術家',
  '🎭 ESFP 閃耀巨星',
  '🤗 ISFJ 溫柔守護者',
  '💝 ESFJ 熱心供給者',
  '🔧 ISTP 冷靜工匠',
  '⚡ ESTP 極限挑戰者',
  '📋 ISTJ 守序捍衛者',
  '⚖️ ESTJ 鐵血執行長'
];

// 會員等級身份組
const TIER_ROLES = [
  '🥉 測驗完成者',
  '🥈 LINE 會員',
  '🥇 店內消費者',
  '💎 貼圖收藏家',
  '🌟 超級粉絲'
];

// 頻道結構定義
const CHANNEL_STRUCTURE = [
  {
    category: '📢 公告區',
    channels: [
      { name: CHANNEL_NAMES.START_HERE, description: '新手指南，固定置頂' },
      { name: CHANNEL_NAMES.ANNOUNCEMENTS, description: '官方公告（只讀）', type: 'announcements' },
      { name: CHANNEL_NAMES.EVENTS, description: '活動資訊' }
    ]
  },
  {
    category: '💬 交流區',
    channels: [
      { name: CHANNEL_NAMES.GENERAL, description: '跨類型聊天' },
      { name: CHANNEL_NAMES.NF_COMMUNITY, description: 'NF 族群專屬（INFP, ENFP, INFJ, ENFJ）', group: 'NF' },
      { name: CHANNEL_NAMES.NT_COMMUNITY, description: 'NT 族群專屬（INTP, ENTP, INTJ, ENTJ）', group: 'NT' },
      { name: CHANNEL_NAMES.SF_COMMUNITY, description: 'SF 族群專屬（ISFP, ESFP, ISFJ, ESFJ）', group: 'SF' },
      { name: CHANNEL_NAMES.ST_COMMUNITY, description: 'ST 族群專屬（ISTP, ESTP, ISTJ, ESTJ）', group: 'ST' }
    ]
  },
  {
    category: '🍰 甜點相關',
    channels: [
      { name: CHANNEL_NAMES.DESSERT_BOOKING, description: '訂購相關、連結到 Dessert-Booking' },
      { name: CHANNEL_NAMES.DESSERT_SHOWCASE, description: '甜點照片分享' },
      { name: CHANNEL_NAMES.STORE_INFO, description: '門市資訊' }
    ]
  },
  {
    category: '🎮 互動區',
    channels: [
      { name: CHANNEL_NAMES.RESULTS, description: '測驗結果分享' },
      { name: CHANNEL_NAMES.DAILY_STATE, description: '每日狀態打卡（Bot 自動發送）' },
      { name: CHANNEL_NAMES.CROSS_PRODUCT, description: '跨產品導流（moon-map, passport）' }
    ]
  },
  {
    category: '🛠️ 管理區',
    channels: [
      { name: CHANNEL_NAMES.BOT_COMMANDS, description: 'Bot 指令說明' },
      { name: CHANNEL_NAMES.FEEDBACK, description: '意見箱' },
      { name: CHANNEL_NAMES.ADMIN, description: '管理員專用', adminOnly: true }
    ]
  }
];

// 根據 MBTI Role 名稱分群（NF/NT/SF/ST）
function getGroupForRoleName(roleName) {
  if (roleName.includes('INFP') || roleName.includes('ENFP') || roleName.includes('INFJ') || roleName.includes('ENFJ')) {
    return 'NF';
  }
  if (roleName.includes('INTP') || roleName.includes('ENTP') || roleName.includes('INTJ') || roleName.includes('ENTJ')) {
    return 'NT';
  }
  if (roleName.includes('ISFP') || roleName.includes('ESFP') || roleName.includes('ISFJ') || roleName.includes('ESFJ')) {
    return 'SF';
  }
  if (roleName.includes('ISTP') || roleName.includes('ESTP') || roleName.includes('ISTJ') || roleName.includes('ESTJ')) {
    return 'ST';
  }
  return null;
}

async function ensureRoles(guild) {
  console.log('🔧 檢查 / 建立身份組...');

  const roleMap = {};

  // 建立或取得 MBTI Roles
  for (const roleName of MBTI_ROLES) {
    let role = guild.roles.cache.find(r => r.name === roleName);
    if (!role) {
      console.log(`  ➕ 建立身份組：${roleName}`);
      role = await guild.roles.create({
        name: roleName,
        mentionable: true
      });
    } else {
      console.log(`  ✅ 身份組已存在：${roleName}`);
    }
    roleMap[roleName] = role;
  }

  // 建立或取得 TIER Roles
  for (const roleName of TIER_ROLES) {
    let role = guild.roles.cache.find(r => r.name === roleName);
    if (!role) {
      console.log(`  ➕ 建立身份組：${roleName}`);
      role = await guild.roles.create({
        name: roleName,
        mentionable: true
      });
    } else {
      console.log(`  ✅ 身份組已存在：${roleName}`);
    }
    roleMap[roleName] = role;
  }

  return roleMap;
}

async function setupChannels(guild, roleMap) {
  console.log('🚀 開始設定 Discord 頻道結構與權限...\n');

  const everyoneRole = guild.roles.everyone;

  // 舊頻道名稱對應（有 emoji / 中文的舊命名）
  const LEGACY_CHANNEL_NAMES = {
    [CHANNEL_NAMES.GENERAL]: ['一般', '#一般'],
    [CHANNEL_NAMES.NF_COMMUNITY]: ['🌈-nf族群', 'nf族群', '🌈 nf族群'],
    [CHANNEL_NAMES.NT_COMMUNITY]: ['🧠-nt族群', 'nt族群', '🧠 nt族群'],
    [CHANNEL_NAMES.SF_COMMUNITY]: ['🎨-sf族群', 'sf族群', '🎨 sf族群'],
    [CHANNEL_NAMES.ST_COMMUNITY]: ['🔧-st族群', 'st族群', '🔧 st族群'],
    [CHANNEL_NAMES.RESULTS]: ['測驗結果分享'],
    [CHANNEL_NAMES.DAILY_STATE]: ['每日狀態', '心情打卡'],
    [CHANNEL_NAMES.DESSERT_BOOKING]: ['甜點訂購', 'dessert-booking'],
    [CHANNEL_NAMES.DESSERT_SHOWCASE]: ['甜點推薦', '甜點分享', '打卡分享'],
    [CHANNEL_NAMES.STORE_INFO]: ['門市資訊', '門市資訊📍'],
    [CHANNEL_NAMES.BOT_COMMANDS]: ['bot指令', '🤖-bot指令'],
    [CHANNEL_NAMES.FEEDBACK]: ['意見箱', '📝-意見箱']
  };

  for (const categoryData of CHANNEL_STRUCTURE) {
    // 建立或找到 Category
    let category = guild.channels.cache.find(
      ch => ch.type === ChannelType.GuildCategory && ch.name === categoryData.category
    );

    if (!category) {
      console.log(`📁 建立分類：${categoryData.category}`);
      category = await guild.channels.create({
        name: categoryData.category,
        type: ChannelType.GuildCategory
      });
    } else {
      console.log(`✅ 分類已存在：${categoryData.category}`);
    }

    // 建立頻道
    for (const channelData of categoryData.channels) {
      let channel = guild.channels.cache.find(
        ch => ch.parentId === category.id && ch.name === channelData.name
      );

      // 如果沒找到新名字，試著找舊名字 → 直接改名
      if (!channel) {
        const legacyNames = LEGACY_CHANNEL_NAMES[channelData.name] || [];
        if (legacyNames.length > 0) {
          channel = guild.channels.cache.find(
            ch =>
              ch.parentId === category.id &&
              legacyNames.some(legacy => ch.name === legacy)
          );

          if (channel) {
            console.log(`  ✏️ 將舊頻道「#${channel.name}」改名為「#${channelData.name}」`);
            await channel.setName(channelData.name);
          }
        }
      }

      if (!channel) {
        console.log(`  ➕ 建立頻道：#${channelData.name} - ${channelData.description}`);

        // 預設權限設定
        const permissionOverwrites = [
          {
            id: everyoneRole.id,
            allow: [PermissionFlagsBits.ViewChannel],
            deny: []
          }
        ];

        // 公告只讀：announcements
        if (channelData.type === 'announcements') {
          permissionOverwrites[0].deny.push(
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.CreatePublicThreads,
            PermissionFlagsBits.CreatePrivateThreads
          );
        }

        // 管理員專用頻道（僅保留 @everyone 禁止查看，需你手動給管理員 Role 權限）
        if (channelData.adminOnly) {
          permissionOverwrites[0] = {
            id: everyoneRole.id,
            deny: [PermissionFlagsBits.ViewChannel]
          };
        }

        // 族群頻道：只允許對應族群 MBTI Roles 查看
        if (channelData.group) {
          // 先讓 everyone 看不到
          permissionOverwrites[0] = {
            id: everyoneRole.id,
            deny: [PermissionFlagsBits.ViewChannel]
          };

          // 找出屬於該族群的 MBTI Roles
          for (const [name, role] of Object.entries(roleMap)) {
            const group = getGroupForRoleName(name);
            if (group === channelData.group) {
              permissionOverwrites.push({
                id: role.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
              });
            }
          }
        }

        channel = await guild.channels.create({
          name: channelData.name,
          type: ChannelType.GuildText,
          parent: category.id,
          topic: channelData.description,
          permissionOverwrites
        });
      } else {
        // 已存在的頻道（可能是舊的或剛剛改名的），補上權限設定
        console.log(`  ✅ 頻道已存在：#${channelData.name}，更新權限設定`);

        const permissionOverwrites = [];

        // 預設 everyone 權限
        if (channelData.adminOnly || channelData.group) {
          // adminOnly 或 group 頻道：everyone 關閉查看
          permissionOverwrites.push({
            id: everyoneRole.id,
            deny: [PermissionFlagsBits.ViewChannel]
          });
        } else {
          permissionOverwrites.push({
            id: everyoneRole.id,
            allow: [PermissionFlagsBits.ViewChannel],
            deny: []
          });
        }

        // 公告只讀
        if (channelData.type === 'announcements') {
          permissionOverwrites[0].deny = [
            ...(permissionOverwrites[0].deny || []),
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.CreatePublicThreads,
            PermissionFlagsBits.CreatePrivateThreads
          ];
        }

        // 族群頻道：加上對應 MBTI roles
        if (channelData.group) {
          for (const [name, role] of Object.entries(roleMap)) {
            const group = getGroupForRoleName(name);
            if (group === channelData.group) {
              permissionOverwrites.push({
                id: role.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
              });
            }
          }
        }

        await channel.permissionOverwrites.set(permissionOverwrites);
      }
    }
    console.log('');
  }

  console.log('✅ 頻道結構與權限設定完成！');
  console.log('\n你幾乎不需要進 Discord 手動調整，只建議：');
  console.log('1. 檢查 #start-here 內容是否需要置頂歡迎訊息');
  console.log('2. 若有額外管理員身份組，手動給予 #admin 的查看權限');
}

client.once('ready', async () => {
  console.log(`✅ Bot 已上線：${client.user.tag}`);

  const guildId = process.env.DISCORD_GUILD_ID;
  if (!guildId) {
    console.error('❌ 請設定 DISCORD_GUILD_ID');
    process.exit(1);
  }

  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    console.error('❌ 找不到指定的 Server');
    process.exit(1);
  }

  try {
    const roleMap = await ensureRoles(guild);
    await setupChannels(guild, roleMap);
    console.log('\n🎉 全自動設定完成，可以關掉這個腳本了');
  } catch (err) {
    console.error('❌ 設定過程發生錯誤：', err);
  } finally {
    process.exit(0);
  }
});

client.login(process.env.DISCORD_TOKEN);
