import { getResultData } from '../constants';

export const sendDiscordNotification = async (resultType: string, suffix: 'A' | 'T') => {
    try {
        // 獲取人格數據
        const personalityData = getResultData(resultType, suffix);

        // 發送請求到 API
        const response = await fetch('/api/notify-discord', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                resultType: `${resultType}-${suffix}`,
                personalityName: personalityData.title
            })
        });

        if (!response.ok) {
            console.warn(`Discord API error: ${response.statusText}`);
        }
    } catch (e) {
        console.warn('Error sending Discord notification:', e);
    }
};
