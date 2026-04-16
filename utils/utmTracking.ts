// 統一 UTM 追蹤系統
// 確保所有外部連結都有正確的 UTM 參數，便於追蹤來源和轉換

import { SITE_ID, compactUtmParams, getUtmParamsFromUrl, trackEvent } from './crossSiteTracking';

interface UTMParams {
  utm_source: string;      // 來源：mbti-lab, moon-map, passport
  utm_medium: string;      // 媒介：result-cta, navigation, share
  utm_campaign?: string;   // 活動名稱：2026-q1, spring-promo
  utm_content?: string;    // 內容：dessert-button, explore-card
  utm_term?: string;       // 關鍵字：可選
}

interface ExternalLink {
  name: string;
  baseUrl: string;
  defaultSource: string;
}

const TARGET_SITE_BY_LINK_KEY: Record<string, string> = {
  DESSERT_BOOKING: 'dessert_booking',
  MOON_MAP: 'moon_map',
  PASSPORT: 'passport',
  LINE_OA: 'external',
  DISCORD: 'external',
  INSTAGRAM: 'external',
};

// ============================================
// 外部連結配置 - 統一管理所有外部連結
// ============================================
export const EXTERNAL_LINKS: Record<string, ExternalLink> = {
  // Dessert Booking - 訂購系統
  DESSERT_BOOKING: {
    name: '月島甜點菜單',
    baseUrl: 'https://map.kiwimu.com/menu',
    defaultSource: 'mbti-lab'
  },

  // Moon Map - 導覽地圖
  MOON_MAP: {
    name: '月島導覽地圖',
    baseUrl: 'https://map.kiwimu.com',
    defaultSource: 'mbti-lab'
  },

  // Passport - 趣味測驗
  PASSPORT: {
    name: '甜點護照測驗',
    baseUrl: 'https://passport.kiwimu.com',
    defaultSource: 'mbti-lab'
  },

  // LINE Official Account
  LINE_OA: {
    name: 'LINE 官方帳號',
    baseUrl: 'https://lin.ee/r19wTnY',
    defaultSource: 'mbti-lab'
  },

  // Discord
  DISCORD: {
    name: 'Discord 社群',
    baseUrl: 'https://discord.gg/WJMQEAXx',
    defaultSource: 'mbti-lab'
  },

  // Instagram
  INSTAGRAM: {
    name: 'Instagram',
    baseUrl: 'https://www.instagram.com/moon_moon_dessert/',
    defaultSource: 'mbti-lab'
  }
};

// ============================================
// UTM 建構函數
// ============================================

/**
 * 建立帶有 UTM 參數的完整連結
 * @param linkKey - EXTERNAL_LINKS 的 key
 * @param medium - 媒介（result-cta, navigation, share, etc.）
 * @param options - 其他選項
 */
export function buildUTMLink(
  linkKey: keyof typeof EXTERNAL_LINKS,
  medium: string,
  options?: {
    campaign?: string;
    content?: string;
    term?: string;
    additionalParams?: Record<string, string>; // 額外參數（如 mbti=INTJ）
  }
): string {
  const link = EXTERNAL_LINKS[linkKey];
  if (!link) {
    console.error(`Invalid link key: ${linkKey}`);
    return '';
  }

  const url = new URL(link.baseUrl);

  // 基本 UTM 參數
  const utmParams: UTMParams = {
    utm_source: link.defaultSource,
    utm_medium: medium,
  };

  // 可選參數
  if (options?.campaign) utmParams.utm_campaign = options.campaign;
  if (options?.content) utmParams.utm_content = options.content;
  if (options?.term) utmParams.utm_term = options.term;

  // 添加 UTM 參數
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  // 添加額外參數（如 MBTI 類型）
  if (options?.additionalParams) {
    Object.entries(options.additionalParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
}

// ============================================
// 預設的 UTM 連結建構器
// ============================================

/**
 * 訂購按鈕連結（結果頁專用）
 */
export function buildDessertOrderLink(mbtiType: string, variant: string): string {
  return buildUTMLink('DESSERT_BOOKING', 'result-cta', {
    campaign: '2026-q2-kiwimu-routing',
    content: 'soul-dessert-button',
    additionalParams: {
      mbti: `${mbtiType}-${variant}`,
      from: 'mbti-test',
      source: 'result-page'
    }
  });
}

/**
 * 月島地圖連結（結果頁專用）
 */
export function buildMoonMapLink(mbtiType: string): string {
  return buildUTMLink('MOON_MAP', 'result-cta', {
    campaign: '2026-q1-integration',
    content: 'moon-map-cta',
    additionalParams: {
      mbti: mbtiType
    }
  });
}

/**
 * 護照測驗連結（交叉導流）
 */
export function buildPassportLink(): string {
  return buildUTMLink('PASSPORT', 'navigation', {
    campaign: '2026-q1-integration',
    content: 'explore-more-card'
  });
}

/**
 * 護照領章連結（附 claim code + MBTI 類型，自動解鎖）
 */
export function buildPassportClaimLink(claimCode: string, mbtiType?: string, variant?: string): string {
  const additionalParams: Record<string, string> = {
    claim: claimCode,
    auto_unlock: 'true',
    stamp: 'mbti_complete',
    from: 'mbti',
  };
  if (mbtiType) additionalParams.mbti_type = mbtiType;
  if (variant) additionalParams.variant = variant;

  return buildUTMLink('PASSPORT', 'navigation', {
    campaign: '2026-q1-integration',
    content: 'mbti-claim',
    additionalParams,
  });
}

/**
 * Discord 連結（結果頁專用）
 */
export function buildDiscordLink(): string {
  return buildUTMLink('DISCORD', 'result-cta', {
    campaign: '2026-q1-community',
    content: 'join-discord-button'
  });
}

/**
 * LINE 連結（結果頁專用）
 */
export function buildLineLink(context: 'header' | 'result' | 'floating-menu' = 'result'): string {
  return buildUTMLink('LINE_OA', 'result-cta', {
    campaign: '2026-q1-line-growth',
    content: `line-${context}`
  });
}

// ============================================
// UTM 追蹤事件
// ============================================

/**
 * 追蹤外部連結點擊
 */
export function trackOutboundClick(
  linkKey: keyof typeof EXTERNAL_LINKS,
  medium: string,
  additionalData?: Record<string, any>
) {
  const link = EXTERNAL_LINKS[linkKey];
  const { url, link_url, target_site, targetSite, ...rest } = additionalData || {};
  const trackedUrl = (url || link_url || link.baseUrl) as string;
  const finalTargetSite = (target_site || targetSite || TARGET_SITE_BY_LINK_KEY[linkKey]) as string;

  const utmParams = compactUtmParams(getUtmParamsFromUrl(trackedUrl));
  if (!utmParams.utm_source) {
    utmParams.utm_source = link.defaultSource;
  }
  if (!utmParams.utm_medium) {
    utmParams.utm_medium = medium;
  }

  const payload = {
    site_id: SITE_ID,
    source_site: SITE_ID,
    target_site: finalTargetSite,
    label: link.name,
    url: trackedUrl,
    link_domain: new URL(link.baseUrl).hostname,
    link_name: link.name,
    link_url: trackedUrl,
    ...utmParams,
    ...rest,
  };

  trackEvent('outbound_click', payload);

  // Console log（開發模式）
  if (import.meta.env.DEV) {
    console.log(`[UTM] Outbound Click:`, {
      link: link.name,
      medium,
      ...payload,
    });
  }
}

/**
 * 追蹤訂購按鈕點擊
 */
export function trackDessertOrderClick(mbtiType: string, variant: string) {
  const orderUrl = buildDessertOrderLink(mbtiType, variant);
  trackOutboundClick('DESSERT_BOOKING', 'result-cta', {
    destination_type: 'order_menu',
    entry_surface: 'result_dessert_card',
    mbti_type: mbtiType,
    mbti_variant: variant,
    variant: variant,
    conversion_type: 'dessert_order_intent',
    url: orderUrl,
  });

  // 行銷像素追蹤（如果已啟用）
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'InitiateCheckout', {
      content_name: `MBTI ${mbtiType}-${variant} 推薦甜點`,
      value: 100,
      currency: 'TWD'
    });
  }
}

// ============================================
// UTM 解析（接收端使用）
// ============================================

/**
 * 解析當前頁面的 UTM 參數
 */
export function parseUTMParams(): UTMParams | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);

  const utmParams: Partial<UTMParams> = {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_content: params.get('utm_content') || undefined,
    utm_term: params.get('utm_term') || undefined,
  };

  // 如果沒有任何 UTM 參數，返回 null
  if (!utmParams.utm_source && !utmParams.utm_medium) {
    return null;
  }

  return utmParams as UTMParams;
}

/**
 * 儲存 UTM 參數到 localStorage（用於後續追蹤）
 */
export function saveUTMParams() {
  const params = parseUTMParams();
  if (params) {
    try {
      localStorage.setItem('utm_first_touch', JSON.stringify({
        ...params,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.error('Failed to save UTM params', e);
    }
  }
}

/**
 * 取得首次接觸的 UTM 參數
 */
export function getFirstTouchUTM(): (UTMParams & { timestamp: number }) | null {
  try {
    const stored = localStorage.getItem('utm_first_touch');
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
}

// ============================================
// 初始化（在 App.tsx 中調用）
// ============================================
export function initUTMTracking() {
  if (typeof window === 'undefined') return;

  // 解析並儲存 UTM 參數
  saveUTMParams();

  // 追蹤頁面載入（如果有 UTM 參數）
  const params = parseUTMParams();
  if (params) {
    trackEvent('utm_landing', {
      utm_source: params.utm_source,
      utm_medium: params.utm_medium,
      utm_campaign: params.utm_campaign || 'none',
      utm_content: params.utm_content || 'none',
    });
  }
}
