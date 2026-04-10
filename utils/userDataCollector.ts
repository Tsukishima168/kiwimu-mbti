// 用戶資料收集模組
// 整合 Firebase + GA4 + Marketing Pixels

import { saveUserBehaviorToSupabase, upsertUserStats } from '../services/supabase-user.service';

// ============================================
// 用戶資料結構
// ============================================
export interface UserBehaviorData {
  uid: string;
  sessionId: string;

  // 基本資訊
  timestamp: number;
  userAgent: string;
  referrer: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;

  // 測驗資料
  mbtiType?: string;
  variant?: string;
  completionTime?: number; // 完成測驗花費時間（秒）

  // 行為資料
  actions: UserAction[];

  // 裝置資訊
  device: {
    type: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser: string;
  };
}

export interface UserAction {
  action: string;
  timestamp: number;
  metadata?: any;
}

// ============================================
// Session 管理
// ============================================
let currentSession: string | null = null;
let sessionStartTime: number | null = null;
let userActions: UserAction[] = [];

export function initSession() {
  // 生成 Session ID
  currentSession = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStartTime = Date.now();
  userActions = [];

  // 記錄進入來源
  const urlParams = new URLSearchParams(window.location.search);
  const sessionData = {
    sessionId: currentSession,
    startTime: sessionStartTime,
    referrer: document.referrer,
    utmSource: urlParams.get('utm_source') || urlParams.get('source'),
    utmMedium: urlParams.get('utm_medium'),
    utmCampaign: urlParams.get('utm_campaign'),
    utmContent: urlParams.get('utm_content'),
    utmTerm: urlParams.get('utm_term'),
  };

  // 儲存到 localStorage
  localStorage.setItem('kiwimu_session', JSON.stringify(sessionData));

  console.log('📊 Session 已初始化:', currentSession);
  return currentSession;
}

export function getSession() {
  if (!currentSession) {
    return initSession();
  }
  return currentSession;
}

// ============================================
// 記錄用戶行為
// ============================================
export function trackAction(action: string, metadata?: any) {
  const actionData: UserAction = {
    action,
    timestamp: Date.now(),
    metadata
  };

  userActions.push(actionData);

  // 同步到 localStorage（防止重新整理遺失）
  const sessionData = JSON.parse(localStorage.getItem('kiwimu_session') || '{}');
  sessionData.actions = userActions;
  localStorage.setItem('kiwimu_session', JSON.stringify(sessionData));

  console.log('📝 行為記錄:', action, metadata);
}

// ============================================
// 裝置偵測
// ============================================
export function detectDevice() {
  const ua = navigator.userAgent;

  // 裝置類型
  let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    type = 'tablet';
  } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    type = 'mobile';
  }

  // 作業系統
  let os = 'Unknown';
  if (ua.indexOf('Win') !== -1) os = 'Windows';
  else if (ua.indexOf('Mac') !== -1) os = 'macOS';
  else if (ua.indexOf('Linux') !== -1) os = 'Linux';
  else if (ua.indexOf('Android') !== -1) os = 'Android';
  else if (ua.indexOf('iOS') !== -1 || ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) os = 'iOS';

  // 瀏覽器
  let browser = 'Unknown';
  if (ua.indexOf('Chrome') !== -1) browser = 'Chrome';
  else if (ua.indexOf('Safari') !== -1) browser = 'Safari';
  else if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
  else if (ua.indexOf('MSIE') !== -1 || ua.indexOf('Trident/') !== -1) browser = 'IE';
  else if (ua.indexOf('Edge') !== -1) browser = 'Edge';

  return { type, os, browser };
}

// ============================================
// 儲存到 Firebase（可選）
// ============================================
export async function saveUserBehavior(uid: string, mbtiType?: string, variant?: string) {
  try {
    const sessionData = JSON.parse(localStorage.getItem('kiwimu_session') || '{}');
    const device = detectDevice();

    const behaviorData: Partial<UserBehaviorData> = {
      uid,
      sessionId: getSession(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      utmSource: sessionData.utmSource,
      utmMedium: sessionData.utmMedium,
      utmCampaign: sessionData.utmCampaign,
      mbtiType,
      variant,
      completionTime: sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : undefined,
      actions: userActions,
      device
    };

    await saveUserBehaviorToSupabase(uid, behaviorData);

    // 更新用戶統計
    await updateUserStats(uid, mbtiType, variant);

  } catch (error) {
    console.error('❌ 儲存用戶行為失敗:', error);
  }
}

// ============================================
// 更新用戶統計
// ============================================
async function updateUserStats(uid: string, mbtiType?: string, variant?: string) {
  try {
    const sessionData = JSON.parse(localStorage.getItem('kiwimu_session') || '{}');
    await upsertUserStats(uid, mbtiType, variant, sessionData.utmSource);
  } catch (error) {
    console.error('❌ 更新用戶統計失敗:', error);
  }
}

// ============================================
// 匯出用戶資料（用於分析）
// ============================================
export function exportUserData() {
  const sessionData = JSON.parse(localStorage.getItem('kiwimu_session') || '{}');
  const device = detectDevice();

  return {
    session: sessionData,
    device,
    actions: userActions,
    duration: sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0,
    pageViews: userActions.filter(a => a.action === 'page_view').length,
    interactions: userActions.filter(a => a.action !== 'page_view').length,
  };
}

// ============================================
// 建立行銷名單（依據 MBTI 分群）
// ============================================
export interface MarketingSegment {
  segment: string;
  mbtiTypes: string[];
  description: string;
  targetProducts?: string[];
}

export const MARKETING_SEGMENTS: MarketingSegment[] = [
  {
    segment: '分析師群組',
    mbtiTypes: ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
    description: '理性、邏輯、策略導向',
    targetProducts: ['深度分析報告', '專業課程', '策略諮詢']
  },
  {
    segment: '外交官群組',
    mbtiTypes: ['INFJ', 'INFP', 'ENFJ', 'ENFP'],
    description: '理想主義、富有同理心、創意',
    targetProducts: ['心靈成長課程', '創意工作坊', '人際關係諮詢']
  },
  {
    segment: '守護者群組',
    mbtiTypes: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
    description: '務實、負責、重視傳統',
    targetProducts: ['實用指南', '家庭服務', '傳統美食']
  },
  {
    segment: '探險家群組',
    mbtiTypes: ['ISTP', 'ISFP', 'ESTP', 'ESFP'],
    description: '靈活、行動派、享受當下',
    targetProducts: ['限時優惠', '體驗活動', '新品試吃']
  }
];

export function getUserSegment(mbtiType: string): MarketingSegment | undefined {
  return MARKETING_SEGMENTS.find(seg => seg.mbtiTypes.includes(mbtiType));
}

// ============================================
// 清理 Session（當用戶離開時）
// ============================================
export function endSession() {
  if (sessionStartTime) {
    const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
    trackAction('session_end', { duration });

    console.log(`📊 Session 結束，持續時間: ${duration}秒`);
  }

  // 清理（可選，也可以保留供下次使用）
  // localStorage.removeItem('kiwimu_session');
}

// 監聽頁面離開
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', endSession);
}
