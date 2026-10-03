import { getAuthSupabaseClient } from './supabaseAuthBridge';

export interface DiscordNotificationMetadata {
    funnel: 'v1' | 'v1_5';
    personalityNameOverride?: string;
    stage?: string;
    source?: string;
    quizVersion?: string;
    path?: string;
    sessionId?: string;
    userId?: string;
    isLoggedIn?: boolean;
}

export const sendDiscordNotification = async (
    resultType: string,
    suffix: 'A' | 'T',
    locale: string = 'zh',
    userId?: string,
    metadata?: DiscordNotificationMetadata
) => {
    try {
        const client = getAuthSupabaseClient();
        if (!client) return;
        const { data, error } = await client.auth.getSession();
        const session = data.session;
        // Free anonymous quizzes still complete; only account sessions notify.
        if (error || !session?.access_token || session.user.is_anonymous || (userId && session.user.id !== userId)) return;
        const response = await fetch('/api/notify-discord', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({
                resultType: `${resultType}-${suffix}`,
                locale,
                metadata: { funnel: metadata?.funnel },
            })
        });

        if (!response.ok) {
            console.warn('Discord notification failed:', response.status);
        }
    } catch {
        console.warn('Discord notification failed');
    }
};
