export const sendDiscordNotification = async (message: string) => {
    // Webhook URL should be stored in environment variables
    // For safety, we use a try-catch so it doesn't break the app if it fails
    const webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn('Discord Webhook URL not configured in VITE_DISCORD_WEBHOOK_URL');
        return false;
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: message,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Failed to send Discord webhook:', error);
        return false;
    }
};
