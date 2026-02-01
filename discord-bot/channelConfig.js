// 新架構的頻道名稱對應（符合 DISCORD_CHANNEL_STRUCTURE.md）
const CHANNEL_NAMES = {
  // 📢 公告區
  START_HERE: 'start-here',
  ANNOUNCEMENTS: 'announcements',
  EVENTS: 'events',

  // 💬 交流區
  GENERAL: 'general',
  NF_COMMUNITY: 'nf-community',
  NT_COMMUNITY: 'nt-community',
  SF_COMMUNITY: 'sf-community',
  ST_COMMUNITY: 'st-community',

  // 🍰 甜點相關
  DESSERT_BOOKING: 'dessert-booking',
  DESSERT_SHOWCASE: 'dessert-showcase',
  STORE_INFO: 'store-info',

  // 🎮 互動區
  RESULTS: 'results',
  DAILY_STATE: 'daily-state',
  CROSS_PRODUCT: 'cross-product',

  // 🛠️ 管理區
  BOT_COMMANDS: 'bot-commands',
  FEEDBACK: 'feedback',
  ADMIN: 'admin'
};

// MBTI 類型對應到社群頻道
const MBTI_TO_CHANNEL = {
  // NF 族群
  'INFP': 'nf-community',
  'INFP-A': 'nf-community',
  'INFP-T': 'nf-community',
  'ENFP': 'nf-community',
  'ENFP-A': 'nf-community',
  'ENFP-T': 'nf-community',
  'INFJ': 'nf-community',
  'INFJ-A': 'nf-community',
  'INFJ-T': 'nf-community',
  'ENFJ': 'nf-community',
  'ENFJ-A': 'nf-community',
  'ENFJ-T': 'nf-community',

  // NT 族群
  'INTP': 'nt-community',
  'INTP-A': 'nt-community',
  'INTP-T': 'nt-community',
  'ENTP': 'nt-community',
  'ENTP-A': 'nt-community',
  'ENTP-T': 'nt-community',
  'INTJ': 'nt-community',
  'INTJ-A': 'nt-community',
  'INTJ-T': 'nt-community',
  'ENTJ': 'nt-community',
  'ENTJ-A': 'nt-community',
  'ENTJ-T': 'nt-community',

  // SF 族群
  'ISFP': 'sf-community',
  'ISFP-A': 'sf-community',
  'ISFP-T': 'sf-community',
  'ESFP': 'esfp-community',
  'ESFP-A': 'sf-community',
  'ESFP-T': 'sf-community',
  'ISFJ': 'sf-community',
  'ISFJ-A': 'sf-community',
  'ISFJ-T': 'sf-community',
  'ESFJ': 'esfj-community',
  'ESFJ-A': 'sf-community',
  'ESFJ-T': 'sf-community',

  // ST 族群
  'ISTP': 'st-community',
  'ISTP-A': 'st-community',
  'ISTP-T': 'st-community',
  'ESTP': 'st-community',
  'ESTP-A': 'st-community',
  'ESTP-T': 'st-community',
  'ISTJ': 'st-community',
  'ISTJ-A': 'st-community',
  'ISTJ-T': 'st-community',
  'ESTJ': 'st-community',
  'ESTJ-A': 'st-community',
  'ESTJ-T': 'st-community'
};

// 尋找頻道的輔助函數（支援多個備選名稱，向後兼容）
function findChannel(guild, channelNames) {
  if (!Array.isArray(channelNames)) {
    channelNames = [channelNames];
  }

  for (const name of channelNames) {
    const channel = guild.channels.cache.find(ch => ch.name === name);
    if (channel) return channel;
  }

  return null;
}

module.exports = {
  CHANNEL_NAMES,
  MBTI_TO_CHANNEL,
  findChannel
};
