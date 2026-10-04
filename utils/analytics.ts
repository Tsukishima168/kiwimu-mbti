// Complete Analytics Tracking System for KIWIMU MBTI Lab
// Integrates with GA4 via global gtag() loaded in index.html
import { V2_REPORT_CURRENCY, V2_REPORT_PRICE_TWD } from '../shared/v2Product';

// gtag.js 由 index.html 全域載入，此處只做型別宣告
declare function gtag(command: string, ...args: unknown[]): void;

const gtagSafe = (command: string, ...args: unknown[]): void => {
  if (typeof window !== 'undefined' && typeof gtag === 'function') {
    gtag(command, ...args);
  }
};

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

    gtagSafe('event', 'quiz_start', withSiteId(eventData));
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

    gtagSafe('event', 'quiz_progress', withSiteId(eventData));
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
        // Fired from pagehide / visibilitychange(hidden), right as the page goes
        // away — beacon transport ensures gtag doesn't lose the hit.
        transport_type: 'beacon' as const,
    };

    gtagSafe('event', 'quiz_abandon', withSiteId(eventData));
};

/**
 * Once-per-attempt guard around trackQuizAbandon. `fire()` is safe to call from
 * pagehide, visibilitychange(hidden) and unmount cleanup: it never fires after
 * completion, before any answer, or more than once. Returns true if it sent.
 */
export const createQuizAbandonGuard = (deps: {
    isCompleted: () => boolean;
    getAnsweredCount: () => number;
    getTotalQuestions: () => number;
    getStartTime: () => number;
    now?: () => number;
}) => {
    let fired = false;
    const now = deps.now ?? Date.now;
    return {
        fire: (): boolean => {
            if (fired || deps.isCompleted()) return false;
            // No answers yet means the quiz never really started — skip the noise.
            const answered = deps.getAnsweredCount();
            if (answered === 0) return false;
            fired = true;
            const timeSpentSeconds = Math.round((now() - deps.getStartTime()) / 1000);
            trackQuizAbandon(answered, deps.getTotalQuestions(), timeSpentSeconds);
            return true;
        },
    };
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

    gtagSafe('event', 'quiz_completion', withSiteId(eventData));

    // Set user property for MBTI type
    if (mbtiType) {
        gtagSafe('set', 'user_properties', {
            mbti_type: mbtiType.split('-')[0], // e.g., "INFP"
            mbti_variant: mbtiType, // e.g., "INFP-A"
        });
    }
};

// ==================== Result Events ====================

/**
 * Track result page view
 */
export const trackResultView = (
    mbtiType: string,
    userId?: string,
    context: Record<string, any> = {}
) => {
    const eventData = {
        mbti_type: mbtiType,
        user_id: userId,
        ...context,
    };

    gtagSafe('event', 'result_view', withSiteId(eventData));
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

    gtagSafe('event', 'result_share', withSiteId(eventData));
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

    gtagSafe('event', 'result_download', withSiteId(eventData));
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

    gtagSafe('event', 'stamp_claim', withSiteId(eventData));
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

    gtagSafe('event', 'line_cta_click', withSiteId({
        ...eventData,
        event_category: 'conversion',
        event_label: location,
        value: 1,
    }));
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

    gtagSafe('event', 'discord_join', withSiteId(eventData));
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

    gtagSafe('event', 'discord_verify_complete', withSiteId(eventData));
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

    gtagSafe('event', 'qr_code_scan', withSiteId(eventData));
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

    gtagSafe('event', 'task_card_generate', withSiteId(eventData));
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

    gtagSafe('event', 'store_visit', withSiteId(eventData));
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

    gtagSafe('event', 'reward_redemption', withSiteId(eventData));
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

    gtagSafe('event', 'login', withSiteId(eventData));
};

export const trackLoginAttempt = (
    method: 'google' | 'email' | 'discord',
    context: Record<string, any> = {}
) => {
    gtagSafe('event', 'login_attempt', withSiteId({
        login_method: method,
        ...context,
    }));
};

export const trackLoginCallback = (
    status: 'success' | 'error' | 'restored',
    method: 'google' | 'email' | 'discord',
    context: Record<string, any> = {}
) => {
    gtagSafe('event', 'login_callback', withSiteId({
        login_status: status,
        login_method: method,
        ...context,
    }));
};

export const trackLoginFailure = (
    method: 'google' | 'email' | 'discord',
    reason: string,
    context: Record<string, any> = {}
) => {
    gtagSafe('event', 'login_failure', withSiteId({
        login_method: method,
        failure_reason: reason,
        ...context,
    }));
};

/**
 * Track user signup (GA4 recommended event `sign_up`).
 * Deliberately sends no raw Supabase user id as an event parameter.
 */
export const trackUserSignup = (
    method: 'google' | 'email'
) => {
    const eventData = {
        method,
        source_site: SITE_ID,
    };

    gtagSafe('event', 'sign_up', withSiteId(eventData));
};

/** An account counts as "brand new" when it was created within this window of the sign-in. */
export const NEW_ACCOUNT_WINDOW_MS = 120_000;

const SIGNUP_SENT_KEY_PREFIX = 'kiwimu_ga_signup_sent:';
const signupSentInMemory = new Set<string>();

/**
 * Pure helper: is this sign-in the one that created the account?
 * Compares `created_at` with `last_sign_in_at` (fallback: now when missing/unparseable).
 */
export const isNewlyCreatedAccount = (
    createdAt: string | null | undefined,
    lastSignInAt: string | null | undefined,
    nowMs: number = Date.now(),
    windowMs: number = NEW_ACCOUNT_WINDOW_MS
): boolean => {
    const created = createdAt ? Date.parse(createdAt) : NaN;
    if (!Number.isFinite(created)) return false;
    const lastSignIn = lastSignInAt ? Date.parse(lastSignInAt) : NaN;
    const reference = Number.isFinite(lastSignIn) ? lastSignIn : nowMs;
    return Math.abs(reference - created) <= windowMs;
};

/**
 * Send `sign_up` once per user, only for brand-new accounts. Guarded by a
 * localStorage key (plus an in-memory set when storage is unavailable) so
 * reloads / repeated SIGNED_IN events do not resend. Returns true if sent.
 */
export const trackUserSignupIfNew = (
    user: { id?: string | null; created_at?: string | null; last_sign_in_at?: string | null },
    method: 'google' | 'email' = 'google',
    nowMs: number = Date.now()
): boolean => {
    if (!user?.id) return false;
    if (!isNewlyCreatedAccount(user.created_at, user.last_sign_in_at, nowMs)) return false;

    const key = `${SIGNUP_SENT_KEY_PREFIX}${user.id}`;
    if (signupSentInMemory.has(key)) return false;
    try {
        if (typeof localStorage !== 'undefined') {
            if (localStorage.getItem(key)) {
                signupSentInMemory.add(key);
                return false;
            }
            localStorage.setItem(key, String(nowMs));
        }
    } catch {
        // Storage blocked (private mode etc.): fall back to the in-memory guard.
    }
    signupSentInMemory.add(key);

    trackUserSignup(method);
    return true;
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

    gtagSafe('event', 'profile_update', withSiteId(eventData));
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

    gtagSafe('event', 'page_view', withSiteId(eventData));
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

    gtagSafe('event', 'screen_engagement', withSiteId(eventData));
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

    gtagSafe('event', 'button_click', withSiteId(eventData));
};

// ==================== V2 Paywall Funnel ====================

/**
 * Track V2 paywall view (user sees locked state)
 * GA4 standard: view_item
 */
export const trackV2PaywallView = (mbtiType: string, source: string) => {
    gtagSafe('event', 'view_item', withSiteId({
        item_list_id: 'v2_deep_report',
        item_list_name: 'V2 Deep Report',
        items: [{
            item_id: `v2_report_${mbtiType}`,
            item_name: `V2 深度靈魂報告 — ${mbtiType}`,
            item_category: 'deep_report',
            price: V2_REPORT_PRICE_TWD,
            currency: V2_REPORT_CURRENCY,
        }],
        mbti_type: mbtiType,
        source,
    }));
};

/**
 * Track V2 checkout start. Payment URLs must never enter analytics.
 * GA4 standard: begin_checkout
 */
export const trackV2CheckoutStart = (mbtiType: string, source: string, _checkoutUrl: string) => {
    gtagSafe('event', 'begin_checkout', withSiteId({
        currency: V2_REPORT_CURRENCY,
        value: V2_REPORT_PRICE_TWD,
        items: [{
            item_id: `v2_report_${mbtiType}`,
            item_name: `V2 深度靈魂報告 — ${mbtiType}`,
            item_category: 'deep_report',
            price: V2_REPORT_PRICE_TWD,
            quantity: 1,
        }],
        mbti_type: mbtiType,
        source,
    }));
};

/**
 * Reading an unlocked report is not proof of a new purchase. Restored access,
 * free previews and historical purchases must not inflate revenue.
 */
export const trackV2Unlocked = (mbtiType: string, unlockType: string, source: string) => {
    gtagSafe('event', 'v2_report_unlocked', withSiteId({
        mbti_type: mbtiType,
        unlock_type: unlockType,
        source,
    }));
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

// ==================== Funnel Canonical Events ====================

export const trackLoginGateOpened = (context: {
    trigger?: 'view' | 'click';
    path?: string;
    has_result?: boolean;
    is_shared_view?: boolean;
    session_id?: string;
    mbti_type?: string;
} = {}) => {
    gtagSafe('event', 'login_gate_opened', withSiteId(context));
};

export const trackLoginSuccess = (context: {
    from_stage?: string;
    restore_destination?: string;
    had_result_before_login?: boolean;
    provider?: string;
    session_id?: string;
} = {}) => {
    gtagSafe('event', 'login_success', withSiteId(context));
};

export const trackArchiveGateOpened = (context: {
    has_result?: boolean;
    session_id?: string;
    mbti_type?: string;
} = {}) => {
    gtagSafe('event', 'archive_gate_opened', withSiteId(context));
};

export const trackArchiveView = (context: {
    has_result?: boolean;
    session_id?: string;
    mbti_type?: string;
} = {}) => {
    gtagSafe('event', 'archive_view', withSiteId(context));
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
    trackLoginAttempt,
    trackLoginCallback,
    trackLoginFailure,
    trackUserSignup,
    trackUserSignupIfNew,
    isNewlyCreatedAccount,
    createQuizAbandonGuard,
    trackProfileUpdate,
    trackPageView,
    trackScreenEngagement,
    trackButtonClick,
    trackLoginGateOpened,
    trackLoginSuccess,
    trackArchiveGateOpened,
    trackArchiveView,
};
