// 使用方式：export DISCORD_TOKEN=你的token && node test_ping.js
require('dotenv').config();

const DISCORD_API_URL = 'https://discord.com/api/v10';
const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1466020032310939823';

if (!TOKEN) {
    console.error('❌ 缺少 DISCORD_TOKEN 環境變數');
    process.exit(1);
}

async function sendTest() {
    const payload = {
        content: '@everyone 【系統測試】機器人已就緒！🔔',
        allowed_mentions: {
            parse: ['everyone']
        },
        embeds: [{
            title: '🎉 測試通知：靈魂檔案館推播測試',
            description: '這是一則受託發出的整合測試訊息。\n\n目前 Discord 機器人已成功恢復 Bot API 與 `@everyone` 音頻權限聲明。',
            color: 0xFF6B9D,
            fields: [
                {
                    name: '🎯 測試類型',
                    value: 'Manual Push Test',
                    inline: true
                },
                {
                    name: '🔊 音效測試',
                    value: '已開啟 @everyone 標記',
                    inline: true
                }
            ],
            footer: {
                text: 'KIWIMU MBTI Lab / Antigravity Debug Assistant'
            },
            timestamp: new Date().toISOString()
        }]
    };

    console.log('Sending test to Discord...');
    try {
        const res = await fetch(`${DISCORD_API_URL}/channels/${CHANNEL_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
            console.log('✅ Test sent successfully! Message ID:', data.id);
        } else {
            console.error('❌ Failed to send test:', data);
        }
    } catch (err) {
        console.error('❌ Error hitting Discord API:', err);
    }
}

sendTest();
