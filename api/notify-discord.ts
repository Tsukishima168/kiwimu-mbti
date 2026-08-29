import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const DISCORD_API_URL = 'https://discord.com/api/v10';
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1466020032310939823'; // #results channel
const DETAIL_CHANNEL_ID =
    process.env.DISCORD_DETAIL_CHANNEL_ID ||
    process.env.DISCORD_EVENTS_CHANNEL_ID ||
    CHANNEL_ID;

interface NotifyMetadata {
    funnel?: 'v1' | 'v1_5';
    stage?: string;
    source?: string;
    quizVersion?: string;
    path?: string;
    sessionId?: string;
    userId?: string;
    isLoggedIn?: boolean;
}

function getAdminDb() {
    const url = process.env.SUPABASE_USER_URL || process.env.VITE_SUPABASE_USER_URL;
    const serviceRoleKey =
        process.env.SUPABASE_USER_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) return null;
    return createClient(url, serviceRoleKey, {
        db: { schema: 'mbti' },
        auth: { persistSession: false, autoRefreshToken: false },
    } as unknown as Parameters<typeof createClient>[2]);
}

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

    const { resultType, personalityName, locale = 'zh', userId, metadata = {} } = request.body as {
        resultType: string;
        personalityName: string;
        locale?: string;
        userId?: string;
        metadata?: NotifyMetadata;
    };
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

    const localeConfig = (LOCALES as Record<string, typeof LOCALES.zh>)[locale] || LOCALES.zh;

    console.log('[DISCORD] 📤 Preparing to send notification:', {
        channel: CHANNEL_ID,
        resultType,
        personalityName,
        locale,
        timestamp: new Date().toISOString()
    });

    try {
        // 取得目前總測驗人數（Supabase test_runs）
        let totalCount = 0;
        try {
            const db = getAdminDb();
            if (db) {
                const { count } = await db
                    .from('test_runs')
                    .select('*', { count: 'exact', head: true });
                totalCount = count ?? 0;
            }
        } catch (e) {
            console.warn('[DISCORD] Failed to get count', e);
        }

        const funnelLabel = metadata.funnel === 'v1_5' ? 'V1.5 快測' : 'V1 完整版';
        const summaryPayload = {
            content: '@everyone',
            allowed_mentions: {
                parse: ['everyone']
            },
            embeds: [{
                title: `${localeConfig.emoji} ${localeConfig.header}`,
                description: `**${personalityName}** (${resultType})\n\n來自 **${funnelLabel}** 的新完成回報。${totalCount > 0 ? `\n🏆 已入庫測驗紀錄 **${totalCount}** 筆` : ''}`,
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
                        name: '🪜 Funnel / 漏斗',
                        value: funnelLabel,
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

        const detailPayload = {
            embeds: [{
                title: `🧾 Completion Detail · ${resultType}`,
                color: 0x2F3136,
                fields: [
                    { name: 'funnel', value: metadata.funnel || 'unknown', inline: true },
                    { name: 'stage', value: metadata.stage || 'result', inline: true },
                    { name: 'source', value: metadata.source || 'direct', inline: true },
                    { name: 'quiz_version', value: metadata.quizVersion || '-', inline: true },
                    { name: 'path', value: metadata.path || '-', inline: true },
                    { name: 'logged_in', value: String(Boolean(metadata.isLoggedIn)), inline: true },
                    { name: 'user_id', value: metadata.userId || userId || 'anonymous', inline: false },
                    { name: 'session_id', value: metadata.sessionId || 'unknown', inline: false },
                ],
                footer: {
                    text: `detail → ${DETAIL_CHANNEL_ID === CHANNEL_ID ? '#results (same channel)' : '#events/detail'}`,
                },
                timestamp: new Date().toISOString(),
            }],
        };

        const sendDiscordMessage = async (channelId: string, payload: unknown) => {
            const discordRes = await fetch(`${DISCORD_API_URL}/channels/${channelId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bot ${botToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            });

            const responseData = await discordRes.json() as { id?: string };

            if (!discordRes.ok) {
                console.error('[DISCORD] ❌ Discord API error:', {
                    status: discordRes.status,
                    statusText: discordRes.statusText,
                    response: responseData,
                    channel: channelId
                });
                throw new Error(`Discord API error: ${discordRes.statusText} - ${JSON.stringify(responseData)}`);
            }

            return responseData;
        };

        const [summaryResponse, detailResponse] = await Promise.all([
            sendDiscordMessage(CHANNEL_ID, summaryPayload),
            sendDiscordMessage(DETAIL_CHANNEL_ID, detailPayload),
        ]);

        console.log('[DISCORD] ✅ Notification sent successfully:', {
            messageId: summaryResponse.id,
            detailMessageId: detailResponse.id,
            channel: CHANNEL_ID,
            detailChannel: DETAIL_CHANNEL_ID,
            resultType,
            locale,
            timestamp: new Date().toISOString()
        });

        return response.status(200).json({
            status: 'sent',
            messageId: summaryResponse.id,
            detailMessageId: detailResponse.id,
            locale,
            debug: { resultType, personalityName, metadata }
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
