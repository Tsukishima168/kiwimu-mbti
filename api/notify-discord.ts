import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

const DISCORD_API_URL = 'https://discord.com/api/v10';
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1466020032310939823'; // #results channel

// 初始化 Firebase（如果還未初始化）
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });
}

const db = admin.firestore();

// 多語言配置
const LOCALES = {
    zh: {
        emoji: '🎉',
        color: 0xFF6B9D,
        header: '新成員誕生！',
        footer: 'KIWIMU MBTI Lab',
        country: '🇹🇼 台灣',
    },
    ja: {
        emoji: '🌈',
        color: 0xFF69B4,
        header: '新しい仲間が誕生しました！',
        footer: 'KIWIMU MBTI Lab 日本版',
        country: '🇯🇵 日本',
    },
    ko: {
        emoji: '✨',
        color: 0xFF1493,
        header: '새로운 멤버가 탄생했습니다!',
        footer: 'KIWIMU MBTI Lab 한국판',
        country: '🇰🇷 韓國',
    },
    en: {
        emoji: '🚀',
        color: 0x0099FF,
        header: 'New Member Joined!',
        footer: 'KIWIMU MBTI Lab',
        country: '🌍 Global',
    },
};

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { resultType, personalityName, locale = 'zh', userId } = request.body;
    const botToken = process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN;

    if (!botToken) {
        console.error('[DISCORD] ❌ DISCORD_TOKEN or DISCORD_BOT_TOKEN not configured');
        return response.status(500).json({
            status: 'error',
            message: 'Bot token not configured',
            debug: {
                hasToken: false,
                channel: CHANNEL_ID,
                hint: 'Please set DISCORD_TOKEN or DISCORD_BOT_TOKEN in Vercel environment variables'
            }
        });
    }



    const localeConfig = (LOCALES as any)[locale] || LOCALES.zh;

    console.log('[DISCORD] 📤 Preparing to send notification:', {
        channel: CHANNEL_ID,
        resultType,
        personalityName,
        locale,
        timestamp: new Date().toISOString()
    });

    try {
        const discordPayload = {
            embeds: [{
                title: `${localeConfig.emoji} ${localeConfig.header}`,
                description: `**${personalityName}** (${resultType})`,
                color: localeConfig.color,
                fields: [
                    {
                        name: '🌍 Market / 市場',
                        value: localeConfig.country,
                        inline: true
                    },
                    {
                        name: '🎯 Type / 類型',
                        value: resultType,
                        inline: true
                    },
                    {
                        name: '⏰ Time / 時間',
                        value: new Date().toLocaleString(),
                        inline: true
                    }
                ],
                thumbnail: {
                    url: `https://api.dicebear.com/7.x/identicons/svg?seed=${resultType}`,
                    height: 100,
                    width: 100
                },
                footer: {
                    text: localeConfig.footer,
                },
                timestamp: new Date().toISOString()
            }]
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
            locale,
            timestamp: new Date().toISOString()
        });

        // 記錄到 Firestore（用於分析）
        try {
            await db.collection('discord_notifications').add({
                resultType,
                personalityName,
                locale,
                userId: userId || 'anonymous',
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                messageId: responseData.id,
                channelId: CHANNEL_ID,
                platform: 'discord',
                market: localeConfig.country
            });
        } catch (firestoreError) {
            console.warn('[DISCORD] Failed to log to Firestore:', firestoreError);
            // 不中斷推播流程
        }

        return response.status(200).json({
            status: 'sent',
            messageId: responseData.id,
            locale,
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
