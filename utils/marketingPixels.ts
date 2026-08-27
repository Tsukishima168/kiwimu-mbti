// 行銷像素追蹤模組
// 此檔案獨立運作，不影響現有功能

// ============================================
// 配置 - 在這裡填入你的 Pixel ID
// ============================================
const PIXEL_CONFIG = {
  facebook: {
    enabled: false, // 設為 true 啟用
    pixelId: '', // 填入 Facebook Pixel ID
  },
  googleAds: {
    enabled: false, // 設為 true 啟用
    conversionId: '', // 填入 Google Ads Conversion ID
  },
  tiktok: {
    enabled: false, // 設為 true 啟用
    pixelId: '', // 填入 TikTok Pixel ID
  },
  line: {
    enabled: true,
    // LINE Tag（LINE Ads 成效追蹤）。非機密值，可用 VITE_LINE_TAG_ID 覆寫
    tagId: import.meta.env.VITE_LINE_TAG_ID || 'f13358fc-4047-4059-8d79-013e0f7b89f6',
  }
};

// ============================================
// 追蹤事件定義
// ============================================
export const MARKETING_EVENTS = {
  // 頁面瀏覽
  PAGE_VIEW: 'PageView',
  
  // 測驗流程
  START_QUIZ: 'StartQuiz',
  QUIZ_PROGRESS: 'QuizProgress',
  COMPLETE_QUIZ: 'CompleteQuiz',
  
  // 結果互動
  VIEW_RESULT: 'ViewResult',
  SHARE_RESULT: 'Share',
  DOWNLOAD_RESULT: 'Download',
  
  // 轉換動作
  CLICK_LINE_CTA: 'ClickLineCTA',
  CLICK_DISCORD_CTA: 'ClickDiscordCTA',
  CLICK_DESSERT_LINK: 'ClickDessertLink',
  
  // 用戶行為
  LOGIN: 'Login',
  VIEW_ARCHIVE: 'ViewArchive',
  RETEST: 'Retest',
};

// ============================================
// Facebook Pixel
// ============================================
declare global {
  interface Window {
    fbq?: any;
  }
}

export function initFacebookPixel() {
  if (!PIXEL_CONFIG.facebook.enabled || !PIXEL_CONFIG.facebook.pixelId) return;
  
  // 載入 Facebook Pixel
  (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    'script',
    'https://connect.facebook.net/en_US/fbevents.js'
  );

  window.fbq('init', PIXEL_CONFIG.facebook.pixelId);
  window.fbq('track', 'PageView');
  
  console.log('✅ Facebook Pixel 已初始化');
}

export function trackFacebookEvent(eventName: string, params?: any) {
  if (!PIXEL_CONFIG.facebook.enabled || !window.fbq) return;
  
  window.fbq('track', eventName, params);
  console.log('📊 Facebook 事件:', eventName, params);
}

// ============================================
// Google Ads Conversion Tracking
// ============================================
declare global {
  interface Window {
    gtag?: any;
    dataLayer?: any[];
  }
}

export function initGoogleAds() {
  if (!PIXEL_CONFIG.googleAds.enabled || !PIXEL_CONFIG.googleAds.conversionId) return;
  
  // 載入 Google Ads
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${PIXEL_CONFIG.googleAds.conversionId}`;
  document.head.appendChild(script);
  
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', PIXEL_CONFIG.googleAds.conversionId);
  
  console.log('✅ Google Ads 已初始化');
}

export function trackGoogleAdsConversion(conversionLabel: string, value?: number) {
  if (!PIXEL_CONFIG.googleAds.enabled || !window.gtag) return;
  
  window.gtag('event', 'conversion', {
    send_to: `${PIXEL_CONFIG.googleAds.conversionId}/${conversionLabel}`,
    value: value || 0,
    currency: 'TWD'
  });
  
  console.log('📊 Google Ads 轉換:', conversionLabel);
}

// ============================================
// TikTok Pixel
// ============================================
declare global {
  interface Window {
    ttq?: any;
  }
}

export function initTikTokPixel() {
  if (!PIXEL_CONFIG.tiktok.enabled || !PIXEL_CONFIG.tiktok.pixelId) return;
  
  // 載入 TikTok Pixel
  (function(w: any, d: any, t: any) {
    w.TiktokAnalyticsObject = t;
    var ttq = (w[t] = w[t] || []);
    ttq.methods = [
      'page',
      'track',
      'identify',
      'instances',
      'debug',
      'on',
      'off',
      'once',
      'ready',
      'alias',
      'group',
      'enableCookie',
      'disableCookie'
    ];
    ttq.setAndDefer = function(t: any, e: any) {
      t[e] = function() {
        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function(t: any) {
      for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++)
        ttq.setAndDefer(e, ttq.methods[n]);
      return e;
    };
    ttq.load = function(e: any, n: any) {
      var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = i;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n || {};
      var o = document.createElement('script');
      o.type = 'text/javascript';
      o.async = !0;
      o.src = i + '?sdkid=' + e + '&lib=' + t;
      var a = document.getElementsByTagName('script')[0];
      a.parentNode?.insertBefore(o, a);
    };
    ttq.load(PIXEL_CONFIG.tiktok.pixelId);
    ttq.page();
  })(window, document, 'ttq');
  
  console.log('✅ TikTok Pixel 已初始化');
}

export function trackTikTokEvent(eventName: string, params?: any) {
  if (!PIXEL_CONFIG.tiktok.enabled || !window.ttq) return;
  
  window.ttq.track(eventName, params);
  console.log('📊 TikTok 事件:', eventName, params);
}

// ============================================
// LINE Tag
// ============================================
export function initLINETag() {
  if (!PIXEL_CONFIG.line.enabled || !PIXEL_CONFIG.line.tagId) return;
  if ((window as any)._lt) return; // 已注入過（StrictMode 重複掛載時避免重複送 pv）
  
  // 載入 LINE Tag
  const script = document.createElement('script');
  script.innerHTML = `
    (function(g,d,o){
      g._ltq=g._ltq||[];g._lt=g._lt||function(){g._ltq.push(arguments)};
      var h=location.protocol==='https:'?'https://d.line-scdn.net':'http://d.line-cdn.net';
      var s=d.createElement('script');s.async=1;
      s.src=o||h+'/n/line_tag/public/release/v1/lt.js';
      var t=d.getElementsByTagName('script')[0];t.parentNode.insertBefore(s,t);
    })(window, document);
    _lt('init', {
      customerType: 'account',
      tagId: '${PIXEL_CONFIG.line.tagId}'
    });
    _lt('send', 'pv', ['${PIXEL_CONFIG.line.tagId}']);
  `;
  document.head.appendChild(script);
  
  console.log('✅ LINE Tag 已初始化');
}

export function trackLINEEvent(eventName: string, params?: any) {
  if (!PIXEL_CONFIG.line.enabled || !(window as any)._lt) return;
  // base code 已送出 pv，PageView 不再重複送成轉換事件（cv）
  if (eventName === MARKETING_EVENTS.PAGE_VIEW) return;
  
  // LINE Tag 官方格式：第 3 參數只吃 { type }，第 4 參數必須帶 tagId 陣列
  // params 不送給 LINE（LINE Tag 不支援自訂參數），僅留給 debug log
  (window as any)._lt(
    'send',
    'cv',
    { type: eventName },
    [PIXEL_CONFIG.line.tagId]
  );
  
  console.log('📊 LINE 事件:', eventName, params);
}

// ============================================
// 統一追蹤函數
// ============================================
export function trackMarketingEvent(
  eventName: string, 
  params?: {
    mbtiType?: string;
    variant?: string;
    value?: number;
    [key: string]: any;
  }
) {
  // Facebook
  if (PIXEL_CONFIG.facebook.enabled) {
    const fbEventMap: Record<string, string> = {
      [MARKETING_EVENTS.START_QUIZ]: 'InitiateCheckout',
      [MARKETING_EVENTS.COMPLETE_QUIZ]: 'Purchase',
      [MARKETING_EVENTS.VIEW_RESULT]: 'ViewContent',
      [MARKETING_EVENTS.CLICK_LINE_CTA]: 'Lead',
      [MARKETING_EVENTS.CLICK_DESSERT_LINK]: 'AddToCart',
    };
    
    const fbEventName = fbEventMap[eventName] || eventName;
    trackFacebookEvent(fbEventName, params);
  }
  
  // TikTok
  if (PIXEL_CONFIG.tiktok.enabled) {
    const ttEventMap: Record<string, string> = {
      [MARKETING_EVENTS.START_QUIZ]: 'InitiateCheckout',
      [MARKETING_EVENTS.COMPLETE_QUIZ]: 'CompletePayment',
      [MARKETING_EVENTS.VIEW_RESULT]: 'ViewContent',
      [MARKETING_EVENTS.CLICK_LINE_CTA]: 'SubmitForm',
    };
    
    const ttEventName = ttEventMap[eventName] || eventName;
    trackTikTokEvent(ttEventName, params);
  }
  
  // LINE
  if (PIXEL_CONFIG.line.enabled) {
    trackLINEEvent(eventName, params);
  }
  
  // Google Ads (需要設定轉換標籤)
  if (PIXEL_CONFIG.googleAds.enabled && eventName === MARKETING_EVENTS.COMPLETE_QUIZ) {
    trackGoogleAdsConversion('quiz_completion', params?.value);
  }
}

// ============================================
// 初始化所有像素
// ============================================
export function initAllPixels() {
  console.log('🚀 初始化行銷像素...');
  
  // 只初始化已啟用的
  if (PIXEL_CONFIG.facebook.enabled) initFacebookPixel();
  if (PIXEL_CONFIG.googleAds.enabled) initGoogleAds();
  if (PIXEL_CONFIG.tiktok.enabled) initTikTokPixel();
  if (PIXEL_CONFIG.line.enabled) initLINETag();
  
  console.log('✅ 行銷像素初始化完成');
}

// ============================================
// 建立自訂受眾（用於再行銷）
// ============================================
export function createCustomAudience(mbtiType: string, variant: string) {
  const audienceData = {
    mbtiType,
    variant,
    personality: `${mbtiType}-${variant}`,
    timestamp: new Date().toISOString()
  };
  
  // Facebook 自訂參數
  if (PIXEL_CONFIG.facebook.enabled && window.fbq) {
    window.fbq('trackCustom', 'PersonalityType', audienceData);
  }
  
  // TikTok 自訂參數
  if (PIXEL_CONFIG.tiktok.enabled && window.ttq) {
    window.ttq.identify({
      personality_type: audienceData.personality
    });
  }
  
  console.log('👥 建立自訂受眾:', audienceData);
}

// ============================================
// 導出配置（方便外部修改）
// ============================================
export function updatePixelConfig(platform: keyof typeof PIXEL_CONFIG, config: any) {
  PIXEL_CONFIG[platform] = { ...PIXEL_CONFIG[platform], ...config };
  console.log(`✅ ${platform} 配置已更新`);
}

export { PIXEL_CONFIG };
