// 推薦與分享追蹤系統
// 追蹤用戶從哪裡來，以及他們分享給誰

interface ReferralData {
  referrer_id?: string;      // 推薦人 ID
  referrer_type?: string;     // 推薦人 MBTI 類型
  share_method?: string;      // 分享方式（link, line, ig_story）
  campaign?: string;          // 活動代碼
}

// ============================================
// 生成推薦連結
// ============================================

/**
 * 為當前用戶生成推薦連結
 */
export function generateReferralLink(
  userId: string, 
  mbtiType: string,
  shareMethod: 'link' | 'line' | 'ig_story' | 'whatsapp' = 'link'
): string {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams({
    ref: userId,                    // 推薦人 ID
    ref_type: mbtiType,             // 推薦人 MBTI 類型
    share: shareMethod,             // 分享方式
    utm_source: 'user_share',       // UTM 來源
    utm_medium: 'referral',         // UTM 媒介
    utm_campaign: '2026-referral'   // UTM 活動
  });
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * 生成短推薦碼（6位數字母）
 */
export function generateShortCode(userId: string): string {
  // 使用 userId 的 hash 生成短碼
  const hash = userId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  const code = hash.toString(36).toUpperCase().slice(0, 6);
  return code.padEnd(6, '0');
}

/**
 * 生成帶短碼的推薦連結
 */
export function generateShortReferralLink(userId: string, mbtiType: string): string {
  const baseUrl = window.location.origin;
  const shortCode = generateShortCode(userId);
  
  return `${baseUrl}?code=${shortCode}&type=${mbtiType}`;
}

// ============================================
// 解析推薦參數
// ============================================

/**
 * 解析網址中的推薦參數
 */
export function parseReferralParams(): ReferralData | null {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  
  const referralData: ReferralData = {
    referrer_id: params.get('ref') || params.get('referrer') || undefined,
    referrer_type: params.get('ref_type') || params.get('type') || undefined,
    share_method: params.get('share') || undefined,
    campaign: params.get('utm_campaign') || undefined,
  };
  
  // 如果有短碼，記錄但不立即解析（需要後端查詢）
  const shortCode = params.get('code');
  if (shortCode) {
    referralData.referrer_id = `code:${shortCode}`;
  }
  
  // 如果沒有任何推薦參數，返回 null
  if (!referralData.referrer_id && !referralData.share_method) {
    return null;
  }
  
  return referralData;
}

/**
 * 儲存推薦資訊到 localStorage
 */
export function saveReferralData(data: ReferralData) {
  try {
    localStorage.setItem('referral_data', JSON.stringify({
      ...data,
      timestamp: Date.now(),
      landing_page: window.location.pathname
    }));
  } catch (e) {
    console.error('Failed to save referral data', e);
  }
}

/**
 * 取得推薦資訊
 */
export function getReferralData(): (ReferralData & { timestamp: number; landing_page: string }) | null {
  try {
    const stored = localStorage.getItem('referral_data');
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
}

// ============================================
// 追蹤分享事件
// ============================================

/**
 * 追蹤分享按鈕點擊
 */
export function trackShare(
  shareMethod: 'link' | 'line' | 'ig_story' | 'whatsapp' | 'full_report',
  mbtiType: string,
  userId?: string
) {
  // GA4 追蹤
  if (typeof gtag !== 'undefined') {
    gtag('event', 'share', {
      method: shareMethod,
      content_type: 'mbti_result',
      content_id: mbtiType,
      user_id: userId || 'anonymous'
    });
  }
  
  // 行銷像素追蹤
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Share', {
      content_name: `MBTI ${mbtiType}`,
      content_category: 'personality_test',
      value: 1
    });
  }
  
  // Console log
  if (import.meta.env.DEV) {
    console.log(`[REFERRAL] Share clicked:`, {
      method: shareMethod,
      mbti: mbtiType,
      user: userId
    });
  }
}

/**
 * 追蹤推薦轉換（新用戶完成測驗）
 */
export function trackReferralConversion(
  newUserId: string,
  newUserMbtiType: string,
  referrerData: ReferralData
) {
  // GA4 追蹤
  if (typeof gtag !== 'undefined') {
    gtag('event', 'referral_conversion', {
      referrer_id: referrerData.referrer_id,
      referrer_type: referrerData.referrer_type,
      share_method: referrerData.share_method,
      new_user_type: newUserMbtiType,
      value: 10 // 虛擬轉換價值
    });
  }
  
  // Console log
  console.log(`[REFERRAL] Conversion:`, {
    referrer: referrerData.referrer_id,
    new_user: newUserId,
    new_type: newUserMbtiType
  });
}

/**
 * 追蹤連結複製
 */
export function trackLinkCopy(mbtiType: string) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'copy_link', {
      content_type: 'referral_link',
      mbti_type: mbtiType
    });
  }
}

// ============================================
// 初始化（在 App.tsx 中調用）
// ============================================

export function initReferralTracking() {
  if (typeof window === 'undefined') return;
  
  // 解析並儲存推薦參數
  const referralData = parseReferralParams();
  if (referralData) {
    saveReferralData(referralData);
    
    // 追蹤推薦進入
    if (typeof gtag !== 'undefined') {
      gtag('event', 'referral_landing', {
        referrer_id: referralData.referrer_id,
        referrer_type: referralData.referrer_type,
        share_method: referralData.share_method
      });
    }
    
    console.log('[REFERRAL] Landing from referral:', referralData);
  }
}

// ============================================
// 分享對話框
// ============================================

/**
 * 打開原生分享對話框
 */
export async function openNativeShare(
  title: string,
  text: string,
  url: string
): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }
  
  try {
    await navigator.share({
      title,
      text,
      url
    });
    return true;
  } catch (err) {
    console.log('Share cancelled or failed', err);
    return false;
  }
}

/**
 * 複製推薦連結到剪貼簿
 */
export async function copyReferralLink(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
}
