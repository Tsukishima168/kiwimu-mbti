// Complete Analytics Tracking System for KIWIMU MBTI Lab
// Integrates with Firebase Analytics (GA4) and custom event tracking

import { logEvent, setUserProperties } from 'firebase/analytics';
import { analytics } from '../firebase';

const SITE_ID = 'mbti_lab';

const withSiteId = (properties: Record<string, any>) => ({
    site_id: SITE_ID,
    ...properties,
});

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

    if (analytics) {
        logEvent(analytics, 'quiz_start', withSiteId(eventData));
    }
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

    if (analytics) {
        logEvent(analytics, 'quiz_progress', withSiteId(eventData));
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
        logEvent(analytics, 'quiz_abandon', withSiteId(eventData));
    }
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
        logEvent(analytics, 'quiz_completion', withSiteId(eventData));
    }

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
        logEvent(analytics, 'result_view', withSiteId(eventData));
    }
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
        logEvent(analytics, 'result_share', withSiteId(eventData));
    }
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
        logEvent(analytics, 'result_download', withSiteId(eventData));
    }
};

/**
 * Track passport stamp claim events
 */
export const trackStampClaim = (
    status: 'issued' | 'failed',
    data?: Record<string, any>
) => {
    const eventData = {
        status,
        ...(data || {}),
    };

    if (analytics) {
        logEvent(analytics, 'stamp_claim', withSiteId(eventData));
    }
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
        logEvent(analytics, 'line_cta_click', withSiteId({
            ...eventData,
            event_category: 'conversion',
            event_label: location,
            value: 1,
        }));
    }
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
        logEvent(analytics, 'discord_join', withSiteId(eventData));
    }
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
        logEvent(analytics, 'discord_verify_complete', withSiteId(eventData));
    }
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
        logEvent(analytics, 'qr_code_scan', withSiteId(eventData));
    }
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
        logEvent(analytics, 'task_card_generate', withSiteId(eventData));
    }
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
        logEvent(analytics, 'store_visit', withSiteId(eventData));
    }
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
        logEvent(analytics, 'reward_redemption', withSiteId(eventData));
    }
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
        logEvent(analytics, 'login', withSiteId(eventData));
    }
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
        logEvent(analytics, 'sign_up', withSiteId(eventData));
    }
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
        logEvent(analytics, 'profile_update', withSiteId(eventData));
    }
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
        logEvent(analytics, 'page_view', withSiteId(eventData));
    }
};

/**
 * Track 各頁停留時間（螢幕參與時間）
 * GA4 報表可依 screen_name 看「哪一頁停留最久」
 */
export const trackScreenEngagement = (
    screenName: string,
    engagementTimeSeconds: number
) => {
    if (engagementTimeSeconds <= 0) return;

    const eventData = {
        screen_name: screenName,
        engagement_time_seconds: engagementTimeSeconds,
        page_name: screenName,
    };

    if (analytics) {
        logEvent(analytics, 'screen_engagement', withSiteId(eventData));
    }
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
        logEvent(analytics, 'button_click', withSiteId(eventData));
    }
};

// ==================== Campaign Source ====================

/**
 * Get campaign source from URL or localStorage
 */
export const getCampaignSource = (): string => {
    if (typeof window === 'undefined') return 'unknown';

    const params = new URLSearchParams(window.location.search);
    const source = params.get('source') || params.get('utm_source');

    if (source) return source;

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
    trackScreenEngagement,
    trackButtonClick,
};
