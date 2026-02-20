import { getResultData } from '../constants';

export const sendDiscordNotification = async (
    resultType: string,
    suffix: 'A' | 'T',
    locale: string = 'zh',
    userId?: string
) => {
    try {
        // 獲取人格數據
        const personalityData = getResultData(resultType, suffix);

        // 發送請求到 API
        const response = await fetch('/api/notify-discord', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                resultType: `${resultType}-${suffix}`,
                personalityName: personalityData.title,
                locale, // 傳遞 locale
                userId  // 傳遞用戶 ID（用於 Firestore 分析）
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.warn(`Discord API error: ${response.statusText}`, data);
        } else {
            console.log('[DISCORD] ✅ Notification sent:', {
                locale,
                resultType: `${resultType}-${suffix}`,
                messageId: data.messageId
            });
        }
    } catch (e) {
        console.warn('Error sending Discord notification:', e);
    }
};
