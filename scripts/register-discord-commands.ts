/**
 * Register Discord slash commands (guild-scoped for instant update).
 *
 * Env required:
 * - DISCORD_BOT_TOKEN
 * - DISCORD_APPLICATION_ID
 * - DISCORD_GUILD_ID
 */
const DISCORD_API = 'https://discord.com/api/v10';

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function main() {
  const token = requireEnv('DISCORD_BOT_TOKEN');
  const appId = requireEnv('DISCORD_APPLICATION_ID');
  const guildId = requireEnv('DISCORD_GUILD_ID');

  const commands = [
    { name: 'help', description: '指令說明與隱私說明' },
    { name: 'link', description: '綁定你的網站帳號（用於查詢結果）' },
    { name: 'unlink', description: '解除綁定' },
    { name: 'result', description: '查看你的最新測驗結果' },
  ];

  const url = `${DISCORD_API}/applications/${appId}/guilds/${guildId}/commands`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bot ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord API error ${res.status}: ${text}`);
  }

  const json = await res.json();
  console.log('Registered commands:', json.map((c: any) => c.name).join(', '));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

