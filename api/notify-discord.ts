import type { VercelRequest, VercelResponse } from '@vercel/node';

const DISCORD_API_URL = 'https://discord.com/api/v10';
const CHANNEL_ID = '1466020032310939823'; // #results channel

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { resultType, personalityName } = request.body;
    const botToken = process.env.DISCORD_TOKEN;

    if (!botToken) {
        console.warn('DISCORD_TOKEN not configured');
        return response.status(200).json({ status: 'skipped', message: 'Bot token not configured' });
    }

    try {
        const discordPayload = {
            content: `🎉 **新成員誕生！** \n一位 **${resultType} ${personalityName}** 剛剛完成了測驗，歡迎加入 KIWIMU 宇宙！`,
            // When using Bot Token, 'username' and 'avatar_url' overrides might not work 
            // the same way as webhooks depending on permissions, but usually the Bot's identity is used.
            // We can rely on the Bot's default appearance.
        };

        const discordRes = await fetch(`${DISCORD_API_URL}/channels/${CHANNEL_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${botToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(discordPayload),
        });

        if (!discordRes.ok) {
            const errorText = await discordRes.text();
            throw new Error(`Discord API error: ${discordRes.statusText} - ${errorText}`);
        }

        return response.status(200).json({ status: 'sent' });
    } catch (error) {
        console.error('Failed to send Discord notification:', error);
        // Return 200 to front-end to avoid blocking user flow, but log error server-side
        return response.status(200).json({ status: 'error', error: String(error) });
    }
}
