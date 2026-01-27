// Complete Analytics Tracking System for KIWIMU MBTI Lab
// Integrates with Firebase Analytics (GA4) and custom event tracking

import { logEvent, setUserProperties } from 'firebase/analytics';
import { analytics } from '../firebase';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firestore.config';

// ==================== Types ====================

export interface AnalyticsEvent {
    eventName: string;
    userId?: string;
    sessionId?: string;
    timestamp: number;
    properties: Record<string, any>;
    platform: 'web' | 'line' | 'discord' | 'store';
    source?: string;
}

// ==================== Session Management ====================

let sessionId: string | null = null;

export const getSessionId = (): string => {
    if (sessionId) return sessionId;

    // Try to get from sessionStorage
    if (typeof window !== 'undefined') {
        sessionId = sessionStorage.getItem('analytics_session_id');

        if (!sessionId) {
            // Generate new session ID
            sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
            sessionStorage.setItem('analytics_session_id', sessionId);
        }
    }

    return sessionId || 'unknown';
};

// ==================== Quiz Events ====================

/**
 * Track when user starts the quiz
 */
export const trackQuizStart = (source?: string, campaignId?: string) => {
    const eventData = {
        source: source || 'direct',
        campaign_id: campaignId,
        timestamp: new Date().toISOString(),
    };

    // Log to GA4
    if (analytics) {
        logEvent(analytics, 'quiz_start', eventData);
    }

    // Log to Firestore for detailed analysis
    logToFirestore('quiz_start', eventData);
};

/**
 * Track quiz progress at each question
 */
export const trackQuizProgress = (
    questionNumber: number,
    totalQuestions: number,
    timeSpent?: number
) => {
    const progressPercentage = Math.round((questionNumber / totalQuestions) * 100);

    const eventData = {
        question_number: questionNumber,
        total_questions: totalQuestions,
        progress_percentage: progressPercentage,
        time_spent_seconds: timeSpent,
    };

    // Log all progress to GA4
    if (analytics) {
        logEvent(analytics, 'quiz_progress', eventData);
    }

    // Log all progress to Firestore
    if (questionNumber % 5 === 0) {
        logToFirestore('quiz_progress', eventData);
    }
};

/**
 * Track quiz abandonment
 */
export const trackQuizAbandon = (
    questionNumber: number,
    totalQuestions: number,
    timeSpent: number
) => {
    const eventData = {
        abandoned_at_question: questionNumber,
        total_questions: totalQuestions,
        progress_percentage: Math.round((questionNumber / totalQuestions) * 100),
        time_spent_seconds: timeSpent,
    };

    if (analytics) {
        logEvent(analytics, 'quiz_abandon', eventData);
    }

    logToFirestore('quiz_abandon', eventData);
};

/**
 * Track quiz completion
 */
export const trackQuizComplete = (
    mbtiType: string,
    timeSpent: number,
    userId?: string
) => {
    const eventData = {
        mbti_type: mbtiType,
        time_spent_seconds: timeSpent,
        completion_rate: 100,
        user_id: userId,
    };

    if (analytics) {
        logEvent(analytics, 'quiz_complete', eventData);
    }

    logToFirestore('quiz_complete', eventData);

    // Set user property for MBTI type
    if (analytics && mbtiType) {
        setUserProperties(analytics, {
            mbti_type: mbtiType.split('-')[0], // e.g., "INFP"
            mbti_variant: mbtiType, // e.g., "INFP-A"
        });
    }
};

// ==================== Result Events ====================

/**
 * Track result page view
 */
export const trackResultView = (mbtiType: string, userId?: string) => {
    const eventData = {
        mbti_type: mbtiType,
        user_id: userId,
    };

    if (analytics) {
        logEvent(analytics, 'result_view', eventData);
    }

    logToFirestore('result_view', eventData);
};

/**
 * Track result sharing
 */
export const trackResultShare = (
    platform: 'line' | 'instagram' | 'link' | 'image',
    mbtiType: string,
    userId?: string
) => {
    const eventData = {
        platform,
        mbti_type: mbtiType,
        share_method: platform,
        user_id: userId,
    };

    if (analytics) {
        logEvent(analytics, 'result_share', eventData);
    }

    logToFirestore('result_share', eventData);
};

/**
 * Track downloading of result image
 */
export const trackResultDownload = (
    format: 'full' | 'ig_story',
    mbtiType: string
) => {
    const eventData = {
        download_format: format,
        mbti_type: mbtiType,
    };

    if (analytics) {
        logEvent(analytics, 'result_download', eventData);
    }

    logToFirestore('result_download', eventData);
};

// ==================== Social/Community Events ====================

/**
 * Track LINE Official Account CTA clicks
 */
export const trackLineCTA = (
    location: 'result_page' | 'compact' | 'minimal' | 'other',
    mbtiType?: string
) => {
    const eventData = {
        cta_location: location,
        mbti_type: mbtiType,
        timestamp: new Date().toISOString(),
    };

    if (analytics) {
        logEvent(analytics, 'line_cta_click', {
            ...eventData,
            event_category: 'conversion',
            event_label: location,
            value: 1,
        });
    }

    logToFirestore('line_cta_click', eventData);
};

/**
 * Track Discord join
 */
export const trackDiscordJoin = (mbtiType?: string, userId?: string) => {
    const eventData = {
        mbti_type: mbtiType,
        user_id: userId,
        platform: 'web',
    };

    if (analytics) {
        logEvent(analytics, 'discord_join', eventData);
    }

    logToFirestore('discord_join', eventData);
};

/**
 * Track Discord verification complete
 */
export const trackDiscordVerify = (
    discordId: string,
    mbtiType: string,
    userId: string
) => {
    const eventData = {
        discord_id: discordId,
        mbti_type: mbtiType,
        user_id: userId,
    };

    if (analytics) {
        logEvent(analytics, 'discord_verify_complete', eventData);
    }

    logToFirestore('discord_verify_complete', eventData);
};

// ==================== O2O Events ====================

/**
 * Track QR code scan
 */
export const trackQRScan = (
    location: string,
    campaignId?: string,
    content?: string
) => {
    const eventData = {
        scan_location: location,
        campaign_id: campaignId,
        campaign_content: content,
        source: 'offline',
        timestamp: new Date().toISOString(),
    };

    if (analytics) {
        logEvent(analytics, 'qr_code_scan', eventData);
    }

    logToFirestore('qr_code_scan', eventData);
};

/**
 * Track task card generation
 */
export const trackTaskCardGenerate = (
    state: string,
    mbtiType?: string,
    userId?: string
) => {
    const eventData = {
        emotional_state: state,
        mbti_type: mbtiType,
        user_id: userId,
    };

    if (analytics) {
        logEvent(analytics, 'task_card_generate', eventData);
    }

    logToFirestore('task_card_generate', eventData);
};

/**
 * Track store visit (when user shows task card)
 */
export const trackStoreVisit = (
    hasTaskCard: boolean,
    taskCardState?: string,
    userId?: string
) => {
    const eventData = {
        has_task_card: hasTaskCard,
        task_card_state: taskCardState,
        visit_type: hasTaskCard ? 'with_incentive' : 'organic',
        user_id: userId,
    };

    if (analytics) {
        logEvent(analytics, 'store_visit', eventData);
    }

    logToFirestore('store_visit', eventData);
};

/**
 * Track store reward redemption
 */
export const trackRewardRedemption = (
    rewardType: 'sticker' | 'card' | 'discount',
    mbtiType?: string,
    userId?: string
) => {
    const eventData = {
        reward_type: rewardType,
        mbti_type: mbtiType,
        user_id: userId,
    };

    if (analytics) {
        logEvent(analytics, 'reward_redemption', eventData);
    }

    logToFirestore('reward_redemption', eventData);
};

// ==================== User Events ====================

/**
 * Track user login
 */
export const trackUserLogin = (
    method: 'google' | 'email' | 'discord',
    userId: string
) => {
    const eventData = {
        login_method: method,
        user_id: userId,
    };

    if (analytics) {
        logEvent(analytics, 'login', eventData);
    }

    logToFirestore('user_login', eventData);
};

/**
 * Track user signup
 */
export const trackUserSignup = (
    method: 'google' | 'email',
    userId: string
) => {
    const eventData = {
        signup_method: method,
        user_id: userId,
    };

    if (analytics) {
        logEvent(analytics, 'sign_up', eventData);
    }

    logToFirestore('user_signup', eventData);
};

/**
 * Track profile update
 */
export const trackProfileUpdate = (
    field: string,
    userId: string
) => {
    const eventData = {
        updated_field: field,
        user_id: userId,
    };

    if (analytics) {
        logEvent(analytics, 'profile_update', eventData);
    }

    logToFirestore('profile_update', eventData);
};

// ==================== Navigation Events ====================

/**
 * Track page view (custom)
 */
export const trackPageView = (
    pageName: string,
    referrer?: string
) => {
    const eventData = {
        page_name: pageName,
        referrer: referrer || document.referrer,
    };

    if (analytics) {
        logEvent(analytics, 'page_view', eventData);
    }

    logToFirestore('page_view', eventData);
};

/**
 * Track button/link clicks
 */
export const trackButtonClick = (
    buttonName: string,
    location: string,
    destination?: string
) => {
    const eventData = {
        button_name: buttonName,
        button_location: location,
        destination_url: destination,
    };

    if (analytics) {
        logEvent(analytics, 'button_click', eventData);
    }

    // Only log important buttons to Firestore
    const importantButtons = ['download', 'share', 'join', 'login', 'signup'];
    if (importantButtons.some(btn => buttonName.toLowerCase().includes(btn))) {
        logToFirestore('button_click', eventData);
    }
};

// ==================== Firestore Logging ====================

/**
 * Log event to Firestore for detailed analysis
 */
const logToFirestore = async (
    eventName: string,
    properties: Record<string, any>
) => {
    try {
        const event: AnalyticsEvent = {
            eventName,
            sessionId: getSessionId(),
            timestamp: Date.now(),
            properties,
            platform: 'web',
            source: getCampaignSource(),
        };

        // Save to Firestore
        const eventsRef = collection(db, 'analytics_events');
        await setDoc(doc(eventsRef), {
            ...event,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Failed to log event to Firestore:', error);
    }
};

/**
 * Get campaign source from URL or localStorage
 */
const getCampaignSource = (): string => {
    if (typeof window === 'undefined') return 'unknown';

    // Check URL parameters first
    const params = new URLSearchParams(window.location.search);
    const source = params.get('source') || params.get('utm_source');

    if (source) return source;

    // Check localStorage for saved campaign data
    try {
        const campaignData = localStorage.getItem('campaign_data');
        if (campaignData) {
            const data = JSON.parse(campaignData);
            return data.source || 'organic';
        }
    } catch (e) {
        // Ignore
    }

    return 'organic';
};

// ==================== Batch Logging (for performance) ====================

let eventQueue: AnalyticsEvent[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

/**
 * Queue event for batch logging
 */
export const queueEvent = (event: Omit<AnalyticsEvent, 'sessionId' | 'timestamp'>) => {
    eventQueue.push({
        ...event,
        sessionId: getSessionId(),
        timestamp: Date.now(),
    });

    // Schedule flush if not already scheduled
    if (!flushTimeout) {
        flushTimeout = setTimeout(flushEventQueue, 5000); // Flush every 5 seconds
    }

    // Immediate flush if queue is large
    if (eventQueue.length >= 10) {
        flushEventQueue();
    }
};

/**
 * Flush queued events to Firestore
 */
const flushEventQueue = async () => {
    if (eventQueue.length === 0) return;

    const eventsToFlush = [...eventQueue];
    eventQueue = [];
    flushTimeout = null;

    try {
        // Batch write to Firestore
        const batch = [];
        const eventsRef = collection(db, 'analytics_events');

        for (const event of eventsToFlush) {
            batch.push(
                setDoc(doc(eventsRef), {
                    ...event,
                    createdAt: serverTimestamp(),
                })
            );
        }

        await Promise.all(batch);
    } catch (error) {
        console.error('Failed to flush event queue:', error);
    }
};

// Flush on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        if (eventQueue.length > 0) {
            flushEventQueue();
        }
    });
}

export default {
    trackQuizStart,
    trackQuizProgress,
    trackQuizAbandon,
    trackQuizComplete,
    trackResultView,
    trackResultShare,
    trackResultDownload,
    trackLineCTA,
    trackDiscordJoin,
    trackDiscordVerify,
    trackQRScan,
    trackTaskCardGenerate,
    trackStoreVisit,
    trackRewardRedemption,
    trackUserLogin,
    trackUserSignup,
    trackProfileUpdate,
    trackPageView,
    trackButtonClick,
};
