export const SITE_ID = 'mbti_lab' as const;
export const DEFAULT_UTM_SOURCE = 'mbti-lab';

export type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

function buildUtmParams(params: URLSearchParams): UtmParams {
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_content: params.get('utm_content') || undefined,
    utm_term: params.get('utm_term') || undefined,
  };
}

export function getUtmParamsFromUrl(input?: string): UtmParams {
  if (typeof window === 'undefined') return {};

  try {
    if (!input) {
      return buildUtmParams(new URLSearchParams(window.location.search));
    }

    if (input.startsWith('?')) {
      return buildUtmParams(new URLSearchParams(input));
    }

    if (input.includes('://')) {
      return buildUtmParams(new URL(input).searchParams);
    }

    return buildUtmParams(new URLSearchParams(input));
  } catch {
    return {};
  }
}

export function hasUtmParams(params: UtmParams): boolean {
  return Object.values(params).some(Boolean);
}

export function compactUtmParams(params: UtmParams): Record<string, string> {
  const cleaned: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value) cleaned[key] = value;
  });
  return cleaned;
}

export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window === 'undefined' || typeof (window as any).gtag === 'undefined') {
    return;
  }

  (window as any).gtag('event', eventName, {
    site_id: SITE_ID,
    ...params,
  });
}

export function trackUtmLanding(search?: string) {
  const params = getUtmParamsFromUrl(search);
  if (!hasUtmParams(params)) return;

  trackEvent('utm_landing', compactUtmParams(params));
}
