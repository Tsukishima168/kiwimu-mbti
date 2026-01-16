
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { resultType, personalityName } = request.body;
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn('DISCORD_WEBHOOK_URL not configured');
        return response.status(200).json({ status: 'skipped', message: 'Webhook not configured' });
    }

    try {
        const discordPayload = {
            content: `🎉 **新成員誕生！** \n一位 **${resultType} ${personalityName}** 剛剛完成了測驗，歡迎加入 KIWIMU 宇宙！`,
            username: "KIWIMU Lab Bot",
            // avatar_url: "https://kiwimu.com/brand-icon.png", 
        };

        const discordRes = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordPayload),
        });

        if (!discordRes.ok) {
            throw new Error(`Discord API error: ${discordRes.statusText}`);
        }

        return response.status(200).json({ status: 'sent' });
    } catch (error) {
        console.error('Failed to send Discord notification:', error);
        return response.status(500).json({ error: 'Failed to send notification' });
    }
}
