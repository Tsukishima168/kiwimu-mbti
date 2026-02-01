import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * 自動發 Discord 身份組 API
 * 
 * 當用戶完成測驗時，網站可以呼叫這個 API 來自動發身份組
 * 
 * 使用方式：
 * POST /api/discord/assign-role
 * Body: {
 *   discordUserId: "123456789",  // Discord User ID（需要用戶提供或綁定）
 *   mbtiType: "INTJ-A",          // MBTI 類型
 *   guildId: "987654321"         // Discord Server ID
 * }
 */

const MBTI_ROLE_MAPPING: Record<string, string> = {
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
  'ESTJ-T': '⚖️ ESTJ 鐵血執行長',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { discordUserId, mbtiType, guildId: providedGuildId } = req.body || {};

  // Guild ID 從環境變數讀取（如果前端沒提供）
  const guildId = providedGuildId || process.env.DISCORD_GUILD_ID;

  if (!discordUserId || !mbtiType || !guildId) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['discordUserId', 'mbtiType'],
      hint: guildId ? '' : 'DISCORD_GUILD_ID must be set in Vercel environment variables',
    });
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    console.error('DISCORD_BOT_TOKEN is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const roleName = MBTI_ROLE_MAPPING[mbtiType];
  if (!roleName) {
    return res.status(400).json({ error: `Unknown MBTI type: ${mbtiType}` });
  }

  try {
    // 1. 取得 Guild 的所有 Roles
    const guildRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      headers: { Authorization: `Bot ${botToken}` },
    });

    if (!guildRes.ok) {
      const errorText = await guildRes.text();
      throw new Error(`Failed to fetch roles: ${guildRes.status} ${errorText}`);
    }

    const roles = await guildRes.json();
    const targetRole = roles.find((r: any) => r.name === roleName);

    if (!targetRole) {
      return res.status(404).json({
        error: `Role not found: ${roleName}`,
        hint: '請確認 Discord Server 中已建立此身份組',
      });
    }

    // 2. 取得 Guild Member
    const memberRes = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`,
      {
        headers: { Authorization: `Bot ${botToken}` },
      }
    );

    if (!memberRes.ok) {
      if (memberRes.status === 404) {
        return res.status(404).json({
          error: 'User not found in server',
          hint: '請確認用戶已加入 Discord Server',
        });
      }
      const errorText = await memberRes.text();
      throw new Error(`Failed to fetch member: ${memberRes.status} ${errorText}`);
    }

    const member = await memberRes.json();

    // 3. 移除其他 MBTI 身份組
    const mbtiRoleNames = Object.values(MBTI_ROLE_MAPPING);
    const currentMBTIRoles = member.roles.filter((roleId: string) => {
      const role = roles.find((r: any) => r.id === roleId);
      return role && mbtiRoleNames.includes(role.name);
    });

    if (currentMBTIRoles.length > 0) {
      await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}/roles/${currentMBTIRoles[0]}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bot ${botToken}` },
        }
      );
    }

    // 4. 添加新身份組
    const addRoleRes = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}/roles/${targetRole.id}`,
      {
        method: 'PUT',
        headers: { Authorization: `Bot ${botToken}` },
      }
    );

    if (!addRoleRes.ok) {
      const errorText = await addRoleRes.text();
      throw new Error(`Failed to add role: ${addRoleRes.status} ${errorText}`);
    }

    // 5. 添加「測驗完成者」身份組（如果存在）
    const completedRole = roles.find((r: any) => r.name === '🥉 測驗完成者');
    if (completedRole) {
      await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}/roles/${completedRole.id}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bot ${botToken}` },
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: `已成功發放身份組：${roleName}`,
      roleName,
      mbtiType,
    });
  } catch (error: any) {
    console.error('Discord role assignment error:', error);
    return res.status(500).json({
      error: 'Failed to assign role',
      details: error.message,
    });
  }
}
