import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyDiscordSignature } from '../../server/discord/verifyDiscordSignature.js';
import {
  createDiscordLinkState,
  deleteDiscordLink,
  getDiscordLink,
  getLatestDiscordResult,
  logDiscordAction,
} from '../../server/discord/discord-data.service.js';
import type { DiscordInteraction, DiscordInteractionResponse } from '../../server/discord/types.js';

// Discord interaction types
const INTERACTION_PING = 1;
const INTERACTION_APPLICATION_COMMAND = 2;

const EPHEMERAL = 1 << 6; // 64

function json(res: VercelResponse, body: DiscordInteractionResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify(body));
}

function getUserId(interaction: DiscordInteraction): string | undefined {
  return interaction.member?.user?.id || interaction.user?.id;
}

function getStringOption(interaction: DiscordInteraction, name: string): string | undefined {
  const opt = interaction.data?.options?.find((o) => o.name === name);
  return opt?.value;
}

function buildLinkUrl(state: string) {
  const base = process.env.DISCORD_LINK_BASE_URL || 'https://kiwimu.com';
  // Use query so SPA can pick it up without router changes.
  return `${base}/?discord_link_state=${encodeURIComponent(state)}`;
}

async function logAction(params: {
  actionType: string;
  discordUserId?: string;
  guildId?: string;
  appUid?: string;
  payload?: any;
}) {
  await logDiscordAction({
    actionType: params.actionType,
    discordUserId: params.discordUserId,
    guildId: params.guildId,
    appUid: params.appUid,
    payload: params.payload,
  });
}

async function handleLink(interaction: DiscordInteraction): Promise<DiscordInteractionResponse> {
  const discordUserId = getUserId(interaction);
  const guildId = interaction.guild_id;

  if (!discordUserId) {
    return {
      type: 4,
      data: { flags: EPHEMERAL, content: '無法取得你的 Discord 使用者資訊，請稍後再試。' },
    };
  }

  const state = crypto.randomUUID();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  await createDiscordLinkState({
    state,
    discordUserId,
    guildId: guildId || null,
    expiresAt,
    used: false,
    createdAt: Date.now(),
  });

  await logAction({ actionType: 'discord_link_started', discordUserId, guildId, payload: { state } });

  const linkUrl = buildLinkUrl(state);

  return {
    type: 4,
    data: {
      flags: EPHEMERAL,
      content:
        '請點下方按鈕完成綁定（10 分鐘內有效）。\n\n' +
        '綁定後你就可以用 `/result` 在 Discord 直接查看你的測驗結果。',
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 5,
              label: '前往綁定（Link Account）',
              url: linkUrl,
            },
          ],
        },
      ],
    },
  };
}

async function handleUnlink(interaction: DiscordInteraction): Promise<DiscordInteractionResponse> {
  const discordUserId = getUserId(interaction);
  const guildId = interaction.guild_id;
  if (!discordUserId) {
    return { type: 4, data: { flags: EPHEMERAL, content: '無法取得你的 Discord 使用者資訊。' } };
  }

  const deleted = await deleteDiscordLink(guildId, discordUserId);
  if (!deleted) {
    await logAction({ actionType: 'discord_unlink_noop', discordUserId, guildId });
    return { type: 4, data: { flags: EPHEMERAL, content: '你目前沒有綁定任何帳號。' } };
  }

  await logAction({ actionType: 'discord_unlink', discordUserId, guildId });
  return { type: 4, data: { flags: EPHEMERAL, content: '已解除綁定。你可以隨時用 `/link` 重新綁定。' } };
}

async function handleHelp(): Promise<DiscordInteractionResponse> {
  return {
    type: 4,
    data: {
      flags: EPHEMERAL,
      content:
        '**KIWIMU Bot 指令**\n' +
        '- `/link` 綁定你的網站帳號\n' +
        '- `/result` 查看你的最新測驗結果\n' +
        '- `/unlink` 解除綁定\n' +
        '\n' +
        '**隱私說明**：Bot 只會在你綁定後記住 `Discord帳號 ↔ 會員UID` 的對應，不會讀取你的聊天內容。',
    },
  };
}

async function handleResult(interaction: DiscordInteraction): Promise<DiscordInteractionResponse> {
  const discordUserId = getUserId(interaction);
  const guildId = interaction.guild_id;
  if (!discordUserId) {
    return { type: 4, data: { flags: EPHEMERAL, content: '無法取得你的 Discord 使用者資訊。' } };
  }

  const link = await getDiscordLink(guildId, discordUserId);
  if (!link) {
    await logAction({ actionType: 'discord_result_unlinked', discordUserId, guildId });
    return {
      type: 4,
      data: { flags: EPHEMERAL, content: '你尚未綁定帳號，請先使用 `/link`。' },
    };
  }

  if (!link.appUid) {
    return { type: 4, data: { flags: EPHEMERAL, content: '綁定資料異常，請先 `/unlink` 再 `/link`。' } };
  }

  const latest = await getLatestDiscordResult(link.appUid);
  if (!latest) {
    await logAction({ actionType: 'discord_result_no_runs', discordUserId, guildId, appUid: link.appUid });
    return {
      type: 4,
      data: {
        flags: EPHEMERAL,
        content: '找不到你的測驗記錄。請先到網站完成測驗並確保已儲存結果。',
      },
    };
  }

  const mbtiType = latest.mbtiType || 'UNKNOWN';
  const variant = latest.suffix || '';
  const fullType = variant ? `${mbtiType}-${variant}` : mbtiType;

  const base = process.env.DISCORD_REPORT_BASE_URL || 'https://kiwimu.com';
  const reportUrl = `${base}/?utm_source=discord&utm_medium=bot&utm_campaign=mbti_result&mbti=${encodeURIComponent(
    mbtiType
  )}`;

  await logAction({
    actionType: 'discord_result_viewed',
    discordUserId,
    guildId,
    appUid: link.appUid,
    payload: { mbtiType: fullType, runId: latest.id },
  });

  return {
    type: 4,
    data: {
      flags: EPHEMERAL,
      embeds: [
        {
          title: `你的最新結果：${fullType}`,
          description: '點擊下方按鈕查看完整報告（含你的靈魂甜點）。',
          color: 0x111111,
        },
      ],
      components: [
        {
          type: 1,
          components: [
            { type: 2, style: 5, label: '查看完整報告', url: reportUrl },
          ],
        },
      ],
    },
  };
}

// 導出 config 以禁用 Vercel 的自動 body parsing
// 這對於 Discord 的 Ed25519 簽名驗證至關重要，因為我們需要原始的 raw body 字串
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const publicKey = process.env.DISCORD_PUBLIC_KEY || '';

  // 檢查 Public Key 是否設定
  if (!publicKey) {
    console.error('❌ DISCORD_PUBLIC_KEY is not set in environment variables');
    return res.status(500).json({ error: 'Server configuration error: Missing DISCORD_PUBLIC_KEY' });
  }

  const signature = (req.headers['x-signature-ed25519'] as string) || '';
  const timestamp = (req.headers['x-signature-timestamp'] as string) || '';

  // Vercel 禁用 bodyParser 後，我們可以從 req 中讀取原始 body
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const rawBody = Buffer.concat(chunks).toString('utf8');

  // 驗簽（PING 請求也需要驗簽）

  // 驗簽（PING 請求也需要驗簽）
  const ok = verifyDiscordSignature({ publicKey, signature, timestamp, rawBody });
  if (!ok) {
    console.error('❌ Discord signature verification failed', {
      hasPublicKey: !!publicKey,
      publicKeyPreview: `${publicKey.substring(0, 5)}...`,
      hasSignature: !!signature,
      hasTimestamp: !!timestamp,
      bodyLength: rawBody.length,
      bodyPreview: rawBody.substring(0, 50),
    });
    return res.status(401).json({ error: 'Bad request signature' });
  }

  // 解析 interaction
  let interaction: DiscordInteraction;
  try {
    interaction = JSON.parse(rawBody) as DiscordInteraction;
  } catch (e) {
    console.error('❌ Failed to parse interaction body:', e);
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  if (interaction.type === INTERACTION_PING) {
    return json(res, { type: 1 });
  }

  if (interaction.type !== INTERACTION_APPLICATION_COMMAND) {
    return json(res, { type: 4, data: { flags: EPHEMERAL, content: 'Unsupported interaction type.' } });
  }

  const name = interaction.data?.name;
  if (!name) return json(res, { type: 4, data: { flags: EPHEMERAL, content: 'Missing command name.' } });

  try {
    if (name === 'link') return json(res, await handleLink(interaction));
    if (name === 'unlink') return json(res, await handleUnlink(interaction));
    if (name === 'result') return json(res, await handleResult(interaction));
    if (name === 'help') return json(res, await handleHelp());

    // Legacy compatibility: allow /verify userid:... (from old bot)
    if (name === 'verify') {
      const uid = getStringOption(interaction, 'userid');
      return json(res, {
        type: 4,
        data: {
          flags: EPHEMERAL,
          content:
            '此指令已改為「綁定式」流程：請使用 `/link` 綁定後再用 `/result` 查詢。\n' +
            (uid ? `（你輸入的 userid：${uid}）` : ''),
        },
      });
    }

    return json(res, { type: 4, data: { flags: EPHEMERAL, content: `Unknown command: ${name}` } });
  } catch (e: any) {
    console.error('Discord interaction error:', e);
    return json(res, { type: 4, data: { flags: EPHEMERAL, content: '發生錯誤，請稍後再試。' } });
  }
}
