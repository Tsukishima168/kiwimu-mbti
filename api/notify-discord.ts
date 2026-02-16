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

    // Enhanced validation with detailed logging
    if (!botToken) {
        console.error('[DISCORD] ❌ DISCORD_TOKEN not configured in environment variables');
        console.error('[DISCORD] Debug info:', {
            hasToken: !!botToken,
            channel: CHANNEL_ID,
            env: process.env.NODE_ENV,
            availableEnvKeys: Object.keys(process.env).filter(key => !key.startsWith('npm_') && !key.startsWith('VERCEL_')), // Filter noise
            timestamp: new Date().toISOString()
        });
        return response.status(500).json({
            status: 'error',
            message: 'Bot token not configured (DEBUG MODE)',
            debug: {
                hasToken: !!botToken,
                channel: CHANNEL_ID,
                hint: 'Please set DISCORD_TOKEN in Vercel environment variables',
                availableEnvKeys: Object.keys(process.env).filter(key => !key.startsWith('npm_') && !key.startsWith('VERCEL_'))
            }
        });
    }

    console.log('[DISCORD] 📤 Preparing to send notification:', {
        channel: CHANNEL_ID,
        resultType,
        personalityName,
        timestamp: new Date().toISOString()
    });

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

        const responseData = await discordRes.json();

        if (!discordRes.ok) {
            console.error('[DISCORD] ❌ Discord API error:', {
                status: discordRes.status,
                statusText: discordRes.statusText,
                response: responseData,
                channel: CHANNEL_ID
            });
            throw new Error(`Discord API error: ${discordRes.statusText} - ${JSON.stringify(responseData)}`);
        }

        console.log('[DISCORD] ✅ Notification sent successfully:', {
            messageId: responseData.id,
            channel: CHANNEL_ID,
            resultType,
            timestamp: new Date().toISOString()
        });

        return response.status(200).json({
            status: 'sent',
            messageId: responseData.id,
            debug: { resultType, personalityName }
        });
    } catch (error) {
        console.error('[DISCORD] ❌ Failed to send Discord notification:', error);
        console.error('[DISCORD] Error details:', {
            error: error instanceof Error ? error.message : String(error),
            resultType,
            personalityName,
            timestamp: new Date().toISOString()
        });
        // Return 200 to front-end to avoid blocking user flow, but log error server-side
        return response.status(200).json({
            status: 'error',
            error: error instanceof Error ? error.message : String(error),
            debug: { resultType, personalityName }
        });
    }
}
