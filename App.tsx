// Deployment trigger: 2026-01-27-moon-island
import React, { useState, useEffect } from 'react';
import { AppUser, Option, MbtiResultData, Score } from './types';
import { getAuthSupabaseClient, restoreAuthSessionFromUrl, toAppUser, signOutSupabase, trackSsoEvent } from './utils/supabaseAuthBridge';
import { useCloudSync } from './hooks/useCloudSync';
import { calculateResults, getVariant } from './utils/logic';
import { getResultData } from './constants';
import { loadResultData } from './utils/dataLoader';
import Intro from './components/Intro';
import Quiz from './components/Quiz';
import Loading from './components/Loading';
import Result from './components/Result';
import Manifesto from './components/Manifesto';
import Login from './components/Login';
import LoginCallback from './components/LoginCallback';
import MyArchive from './components/MyArchive';
import UserMenu from './components/UserMenu';
import ProfileSetupModal from './components/ProfileSetupModal';
import { trackLoginCallback, trackPageView, trackScreenEngagement, trackQuizComplete, trackUserLogin, trackLoginGateOpened, trackLoginSuccess, trackArchiveGateOpened, trackArchiveView, getSessionId } from './utils/analytics';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import ExploreApp from './components/explore/ExploreApp';

const FooterLinks = () => {
  const { language } = useLanguage();
  const langSuffix = language === 'zh-TW' ? '' : `-${language}`;
  const privacyText = language === 'en' ? 'Privacy Policy' : language === 'ja' ? 'プライバシーポリシー' : language === 'ko' ? '개인정보 보호정책' : '隱私權政策';
  const termsText = language === 'en' ? 'Terms of Use' : language === 'ja' ? '利用規約' : language === 'ko' ? '이용 약관' : '使用者條款';

  return (
    <footer className="py-3 text-center text-xs text-gray-400">
      <a href="/answers" className="hover:text-kiwi-dark transition-colors">MBTI 答案中心</a>
      <span className="mx-2">·</span>
      <a href={`/privacy${langSuffix}.html`} target="_blank" rel="noopener" className="hover:text-kiwi-dark transition-colors">{privacyText}</a>
      <span className="mx-2">·</span>
      <a href={`/terms${langSuffix}.html`} target="_blank" rel="noopener" className="hover:text-kiwi-dark transition-colors">{termsText}</a>
    </footer>
  );
};

// 行銷像素追蹤
import { initAllPixels, trackMarketingEvent, MARKETING_EVENTS, createCustomAudience } from './utils/marketingPixels';
import { getSession, initSession, trackAction, saveUserBehavior } from './utils/userDataCollector';
import { initLiff } from './utils/liffShare';

// UTM 追蹤（新增）
import { initUTMTracking } from './utils/utmTracking';

// 推薦追蹤（新增）
import { initReferralTracking, parseReferralParams } from './utils/referralTracking';

// Moon Island 整合
import { saveMBTIToMoonIsland } from './utils/moonIslandSync';
// 測驗完成寄結果信（已登入且有 email）
import { sendResultEmail } from './utils/sendResultEmail';

import NotFound from './components/NotFound';
import StateTest from './pages/StateTest';
import Today from './pages/Today';
import DiscordLinkGate from './components/DiscordLinkGate';
import { sendDiscordNotification } from './utils/discord';
import ResultLegacyDump from './components/ResultLegacyDump';
import { triggerMbtiCompletePoints } from './utils/questPointsTrigger';
import V2App from './components/v2/V2App';
import V2QuizFlow from './components/v2/V2QuizFlow';
import V2QaNotes from './components/v2/V2QaNotes';
import { isV2Pathname, normalizeV2Pathname } from './utils/v2Routes';
import AnswersHub from './pages/AnswersHub';
import AnswerArticle from './pages/AnswerArticle';
import { applyRuntimeSeo } from './utils/seo';

type Stage = 'login' | 'callback' | 'intro' | 'manifesto' | 'quiz' | 'loading' | 'result' | 'archive' | 'og-render' | 'state-test' | 'today' | '404';
type PostLoginDestination = 'intro' | 'result' | 'archive';

const ROOT_PATHS = new Set(['/', '/index.html']);
const V1_PATHS = new Set(['/quiz', '/v1']);
const POST_LOGIN_DESTINATION_KEY = 'post_login_destination';
const SITE_URL = 'https://kiwimu.com';
const DEFAULT_SOCIAL_IMAGE = 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1771485556/index-image-2_prd43w.png';

const isV1Pathname = (pathname: string) =>
  Array.from(V1_PATHS).some((basePath) => pathname === basePath || pathname.startsWith(`${basePath}/`));
const isExplorePathname = (pathname: string) => pathname.startsWith('/explore') || pathname.startsWith('/state-test');
const isPublicContentPathname = (pathname: string) => pathname.startsWith('/answers');

const normalizeCanonicalPath = (pathname: string) => pathname === '/index.html' ? '/' : pathname;

const buildAbsoluteUrl = (pathname: string) => `${SITE_URL}${normalizeCanonicalPath(pathname)}`;

const getStagePath = (currentStage: Stage, pathname: string) => {
  if (currentStage === 'state-test') {
    return '/state-test';
  }

  if (isV1Pathname(pathname)) {
    if (currentStage === 'intro' || currentStage === 'manifesto' || currentStage === 'quiz') {
      return '/quiz';
    }

    if (currentStage === 'loading') {
      return '/quiz/loading';
    }

    if (currentStage === 'result') {
      return '/quiz/result';
    }

    if (currentStage === 'archive') {
      return '/quiz/archive';
    }
  }

  if (currentStage === 'intro') {
    return '/';
  }

  return `/${currentStage}`;
};

const getPostLoginPath = (destination: PostLoginDestination) => {
  if (destination === 'result') return '/quiz/result';
  if (destination === 'archive') return '/quiz/archive';
  return '/';
};

const buildV1SeoConfig = (stage: Stage, pathname: string, resultData: MbtiResultData | null, hasQuery = false) => {
  const normalizedPath = normalizeCanonicalPath(pathname);
  const onRootPath = ROOT_PATHS.has(pathname);
  const canonicalPath =
    stage === 'intro' && onRootPath
      ? '/'
      : stage === 'manifesto' && onRootPath
        ? '/'
        : normalizedPath;
  const canonical = buildAbsoluteUrl(canonicalPath);
  const defaultKeywords = 'Kiwimu,MBTI,人格測驗,16型,靈魂甜點,月島甜點,台灣';
  const defaultRobots = 'noindex,nofollow';

  if (stage === 'intro' && onRootPath) {
    return {
      title: 'Kiwimu MBTI 人格測驗｜找到你的靈魂甜點｜Moon Moon 月島甜點',
      description: '用 Kiwimu 16 型 MBTI 人格測驗找到你的靈魂甜點與人格語言，支援繁體中文、English、日本語、한국어。',
      canonical,
      image: DEFAULT_SOCIAL_IMAGE,
      keywords: defaultKeywords,
      ogType: 'website',
      robots: hasQuery ? defaultRobots : 'index,follow',
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            '@id': `${canonical}#webpage`,
            name: 'Kiwimu MBTI 人格測驗',
            description: '用 MBTI 找到你的靈魂甜點與人格語言。',
            url: canonical,
            inLanguage: 'zh-TW',
          },
          {
            '@type': 'Quiz',
            '@id': `${canonical}#quiz`,
            name: 'Kiwimu MBTI 人格測驗',
            description: '40 題 MBTI 人格測驗，定位你的類型與靈魂甜點。',
            url: canonical,
            inLanguage: 'zh-TW',
          },
        ],
      },
    };
  }

  if (stage === 'result' && resultData) {
    return {
      title: `${resultData.id} 人格結果｜${resultData.title}｜Kiwimu MBTI`,
      description: `${resultData.summary} 對應靈魂甜點：${resultData.dessert}。`,
      canonical,
      image: resultData.characterImage || DEFAULT_SOCIAL_IMAGE,
      keywords: `${defaultKeywords},${resultData.id},${resultData.title}`,
      ogType: 'article',
      robots: defaultRobots,
    };
  }

  const fallbackMap: Record<Exclude<Stage, 'result' | 'intro'>, { title: string; description: string }> = {
    manifesto: {
      title: 'Kiwimu 測驗前言｜開始你的靈魂甜點測驗',
      description: '在進入 MBTI 測驗前，先讀懂 Kiwimu 想用人格與甜點說的那句話。',
    },
    quiz: {
      title: 'Kiwimu MBTI 測驗進行中｜16 型人格測驗',
      description: '40 題完整測驗進行中，正在定位你的 MBTI 類型與靈魂甜點。',
    },
    loading: {
      title: 'Kiwimu 正在整理你的結果',
      description: 'Kiwimu 正在把你的作答節奏整理成 MBTI 結果與靈魂甜點。',
    },
    archive: {
      title: 'Kiwimu 測驗存檔｜我的人格檔案',
      description: '登入後查看你在 Kiwimu 留下的人格檔案與測驗記錄。',
    },
    login: {
      title: 'Kiwimu 登入中',
      description: '登入 Kiwimu，儲存你的測驗結果與人格檔案。',
    },
    callback: {
      title: 'Kiwimu 登入回應中',
      description: 'Kiwimu 正在完成登入流程。',
    },
    'og-render': {
      title: 'Kiwimu 結果預覽',
      description: 'Kiwimu MBTI 結果分享預覽。',
    },
    'state-test': {
      title: 'Kiwimu State Test',
      description: 'Kiwimu 狀態測試頁。',
    },
    today: {
      title: 'Kiwimu Today',
      description: 'Kiwimu 今日狀態頁。',
    },
    '404': {
      title: '找不到這個頁面｜Kiwimu',
      description: '這個 Kiwimu 頁面不存在，返回首頁重新開始。',
    },
  };

  const fallback = stage === 'intro'
    ? {
        title: 'Kiwimu MBTI 人格測驗',
        description: '用 MBTI 找到你的靈魂甜點與人格語言。',
      }
    : fallbackMap[stage];

  return {
    title: fallback.title,
    description: fallback.description,
    canonical,
    image: DEFAULT_SOCIAL_IMAGE,
    keywords: defaultKeywords,
    ogType: 'website',
    robots: defaultRobots,
  };
};

const replaceRoute = (pathname: string) => {
  if (window.location.pathname === pathname) return;
  window.history.replaceState({}, '', pathname);
};

const App: React.FC = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [stage, setStage] = useState<Stage>('intro');
  const [resultData, setResultData] = useState<MbtiResultData | null>(null);
  const [scores, setScores] = useState<Score | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSaveToast, setShowSaveToast] = useState<{ show: boolean; success: boolean; message: string }>({ show: false, success: true, message: '' });
  // 是否為分享連結瀏覽模式（?r=INFP-A）
  const [isSharedView, setIsSharedView] = useState(false);

  // 【新增】測試模式狀態
  const [showTestPanel, setShowTestPanel] = useState(false);
  const lastSessionRestoreUidRef = React.useRef<string | null>(null);

  const { saveCompletedTest, saveToCloud } = useCloudSync(user);

  const applyRouteFromLocation = (hasSavedResult: boolean) => {
    const rParam = new URLSearchParams(window.location.search).get('r');
    if (rParam && !hasSavedResult) {
      const shareMatch = rParam.match(/^([A-Z]{4})-([AT])$/);
      if (shareMatch) {
        const [, sharedType, sharedSuffix] = shareMatch;
        const sharedData = getResultData(sharedType);
        setResultData(sharedData);
        setScores({
          E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0,
          A: sharedSuffix === 'A' ? 8 : 0,
          Turbulent: sharedSuffix === 'T' ? 8 : 0
        });
        setIsSharedView(true);
        setStage('result');
        return;
      }
    }

    if (window.location.pathname.includes('callback') || window.location.search.includes('code=')) {
      setStage('callback');
      return;
    }

    const ogMatch = window.location.pathname.match(/\/result\/([A-Z]+-[AT])\/og-render/);
    if (ogMatch && ogMatch[1]) {
      const [type, suffix] = ogMatch[1].split('-');
      const data = getResultData(type);
      setResultData(data);
      setScores({
        E: 0, I: 0,
        S: 0, N: 0,
        T: 0, F: 0,
        J: 0, P: 0,
        A: suffix === 'A' ? 1 : 0,
        Turbulent: suffix === 'T' ? 1 : 0
      });
      setStage('og-render');
      return;
    }

    const pathname = window.location.pathname;
    if (isV2Pathname(pathname) || pathname.startsWith('/explore') || pathname.startsWith('/state-test') || isPublicContentPathname(pathname)) {
      return; // handled by top-level render guard
    }
    if (pathname === '/quiz') {
      setStage('quiz');
      return;
    }
    if (pathname === '/quiz/result') {
      if (hasSavedResult) {
        setStage('result');
      } else {
        replaceRoute('/quiz');
        setStage('intro');
      }
      return;
    }
    if (pathname === '/quiz/archive') {
      setStage('archive');
      return;
    }
    if (pathname !== '/' && pathname !== '/index.html') {
      setStage('404');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(false);

      // 初始化行銷像素
      initAllPixels();

      // 初始化用戶 Session
      initSession();

      // 【新增】初始化 UTM 追蹤
      initUTMTracking();

      // 【新增】初始化推薦追蹤
      initReferralTracking();

      // 初始化 LIFF
      initLiff();

      // 追蹤頁面進入
      trackMarketingEvent(MARKETING_EVENTS.PAGE_VIEW);
      trackAction('app_init', { timestamp: Date.now() });

      // 【新增】檢查是否有測試參數
      const params = new URLSearchParams(window.location.search);
      if (params.get('test') === 'true') {
        setShowTestPanel(true);
      }

      // referral tracking (Firebase-based, skipped during Supabase migration)
      parseReferralParams();
    };
    init();
  }, []);

  // 【新增】測試模式快捷鍵（Ctrl+Shift+T）
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setShowTestPanel(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    // Profile setup prompt: show when user is logged in but has no displayName
    if (!loading) {
      if (user && !user.displayName) {
        setShowProfileSetup(true);
      } else {
        setShowProfileSetup(false);
      }
    }
  }, [user, loading]);

  useEffect(() => {
    const supabase = getAuthSupabaseClient();
    let active = true;

    if (!supabase) {
      // No auth client — restore any saved quiz result and proceed
      const savedResult = sessionStorage.getItem('last_quiz_result');
      const savedScores = sessionStorage.getItem('last_quiz_scores');
      if (savedResult && savedScores) {
        setResultData(JSON.parse(savedResult));
        setScores(JSON.parse(savedScores));
        const currentStage = sessionStorage.getItem('flow_stage');
        if (currentStage) setStage(currentStage as Stage);
      }
      applyRouteFromLocation(Boolean(savedResult));
      setLoadingAuth(false);
      return;
    }

    const handleSession = (supabaseUser: import('@supabase/supabase-js').User | null) => {
      const pathname = window.location.pathname;
      const isV1Route = isV1Pathname(pathname);
      const postLoginDestination = sessionStorage.getItem(POST_LOGIN_DESTINATION_KEY) as PostLoginDestination | null;

      if (supabaseUser) {
        const appUser = toAppUser(supabaseUser);
        setUser(appUser);
        if (lastSessionRestoreUidRef.current !== appUser.uid) {
          lastSessionRestoreUidRef.current = appUser.uid;
          trackSsoEvent('session_restored', { provider: appUser.providerData[0]?.providerId });
        }
      } else {
        setUser(null);
        lastSessionRestoreUidRef.current = null;
      }

      const savedResult = sessionStorage.getItem('last_quiz_result');
      const savedScores = sessionStorage.getItem('last_quiz_scores');
      const currentStage = sessionStorage.getItem('flow_stage');
      const isResultRoute = pathname === '/quiz/result';
      const isArchiveRoute = pathname === '/quiz/archive';

      // P1 Fix: check saved post-login restore state outside isV1Route gate
      // so applyRouteFromLocation can't overwrite stage back to 'callback'.
      // Also handles Discord-only flow (no quiz result).
      if (currentStage === 'login' && supabaseUser) {
        sessionStorage.removeItem('flow_stage');
        sessionStorage.removeItem(POST_LOGIN_DESTINATION_KEY);
        if (postLoginDestination === 'archive') {
          replaceRoute(getPostLoginPath('archive'));
          setStage('archive');
        } else if (savedResult && savedScores) {
          const restoredResult = JSON.parse(savedResult);
          const restoredScores = JSON.parse(savedScores);
          setResultData(restoredResult);
          setScores(restoredScores);
          replaceRoute(getPostLoginPath('result'));
          trackAction('report_unlock_success', {
            path: pathname,
            mbtiType: restoredResult.id,
            sessionId: getSession(),
          });
          setStage('result');
        } else {
          // Discord-only login — DiscordLinkGate overlay reads discord_link_state
          // from sessionStorage and renders on top of intro
          replaceRoute(getPostLoginPath('intro'));
          setStage('intro');
        }
        setLoadingAuth(false);
        return;
      }

      // Archive/login CTA can intentionally restore the last result view after OAuth.
      if (currentStage === 'result' && supabaseUser && savedResult && savedScores) {
        sessionStorage.removeItem('flow_stage');
        sessionStorage.removeItem(POST_LOGIN_DESTINATION_KEY);
        setResultData(JSON.parse(savedResult));
        setScores(JSON.parse(savedScores));
        replaceRoute(getPostLoginPath('result'));
        setStage('result');
        setLoadingAuth(false);
        return;
      }

      if (isArchiveRoute && supabaseUser) {
        setStage('archive');
        setLoadingAuth(false);
        return;
      }

      if (isArchiveRoute && !supabaseUser) {
        replaceRoute('/');
        setStage('intro');
        setLoadingAuth(false);
        return;
      }

      if (isResultRoute && savedResult && savedScores) {
        setResultData(JSON.parse(savedResult));
        setScores(JSON.parse(savedScores));
        setStage('result');
        setLoadingAuth(false);
        return;
      }

      if (savedResult && savedScores && isV1Route) {
        setResultData(JSON.parse(savedResult));
        setScores(JSON.parse(savedScores));
        if (currentStage) {
          setStage(currentStage as Stage);
        }
      }

      applyRouteFromLocation(Boolean(savedResult));
      setLoadingAuth(false);
    };

    // Listen for auth changes (login / logout / token refresh)
    // P2 Fix: fire login analytics on fresh OAuth return (flow_stage=login present)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user && sessionStorage.getItem('flow_stage') === 'login') {
        const appUser = toAppUser(session.user);
        const provider = session.user.app_metadata?.provider || 'google';
        trackUserLogin('google', appUser.uid);
        trackLoginCallback('success', 'google', {
          provider,
          path: window.location.pathname,
          previous_stage: sessionStorage.getItem('flow_stage') || 'unknown',
        });
        trackMarketingEvent(MARKETING_EVENTS.LOGIN);
        trackAction('login', { provider });
        trackAction('login_success', {
          provider,
          path: window.location.pathname,
          sessionId: getSession(),
        });
        trackLoginSuccess({
          from_stage: sessionStorage.getItem('login_origin_stage') || 'unknown',
          restore_destination: sessionStorage.getItem(POST_LOGIN_DESTINATION_KEY) || 'intro',
          had_result_before_login: Boolean(sessionStorage.getItem('last_quiz_result')),
          provider,
          session_id: getSessionId(),
        });
        trackSsoEvent('login_success', { provider, path: window.location.pathname });
      }
      handleSession(session?.user ?? null);
    });

    void (async () => {
      const restore = await restoreAuthSessionFromUrl();
      if (!active) return;

      // Skip getSession if we just exchanged a PKCE code — onAuthStateChange
      // already fired handleSession via exchangeCodeForSession.
      if (!restore.handled) {
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        handleSession(data.session?.user ?? null);
      }
    })();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // 各頁停留時間：切換前送出上一頁的 engagement
  const stageEnteredAtRef = React.useRef<number>(Date.now());
  const previousStageRef = React.useRef<Stage | null>(null);

  useEffect(() => {
    const pathname = window.location.pathname;
    if (isV2Pathname(pathname) || isExplorePathname(pathname) || isPublicContentPathname(pathname)) {
      return;
    }

    applyRuntimeSeo(buildV1SeoConfig(stage, pathname, resultData, window.location.search.length > 1));
  }, [resultData, stage]);

  useEffect(() => {
    if (isV2Pathname(window.location.pathname) || isPublicContentPathname(window.location.pathname)) {
      return;
    }

    const now = Date.now();
    const prev = previousStageRef.current;
    const enteredAt = stageEnteredAtRef.current;
    const pathname = window.location.pathname;
    if (isExplorePathname(pathname)) {
      return;
    }

    if (prev != null && prev !== stage) {
      const seconds = Math.round((now - enteredAt) / 1000);
      trackScreenEngagement(getStagePath(prev, pathname), seconds);
    }

    previousStageRef.current = stage;
    stageEnteredAtRef.current = now;
    window.scrollTo(0, 0);

    trackPageView(getStagePath(stage, pathname));
  }, [stage]);

  const goToManifesto = () => {
    trackAction('view_manifesto'); // 【新增】追蹤查看宣言
    setStage('manifesto');
  };

  const startQuiz = () => {
    // 【新增】追蹤開始測驗
    trackMarketingEvent(MARKETING_EVENTS.START_QUIZ);
    trackAction('start_quiz');

    setStage('quiz');
  };

  const handleQuizComplete = async (answers: Option[]) => {
    const { type, scores } = calculateResults(answers);
    const variant = getVariant(scores);

    // 優先從 Supabase 載入，fallback 到 constants
    const data = await loadResultData(type, variant) || getResultData(type, variant);

    setScores(scores);
    setResultData(data);
    sessionStorage.setItem('last_quiz_result', JSON.stringify(data));
    sessionStorage.setItem('last_quiz_scores', JSON.stringify(scores));

    // Track Completion (現有的 GA4)
    trackQuizComplete(type, 0, user?.uid || undefined);

    // Notify Discord (Always, regardless of user login status)
    void sendDiscordNotification(type, variant, 'zh', user?.uid, {
      funnel: 'v1',
      stage: 'result',
      source: isV1Pathname(window.location.pathname) ? 'quiz_route' : 'home_route',
      path: window.location.pathname,
      sessionId: getSession(),
      isLoggedIn: Boolean(user && !user.isAnonymous),
    });

    trackSsoEvent('quiz_completed', { mbti_type: type, variant });

    // 【新增】追蹤行銷轉換事件
    trackMarketingEvent(MARKETING_EVENTS.COMPLETE_QUIZ, {
      mbtiType: type,
      variant: variant,
      value: 100 // 虛擬轉換價值，可依需求調整
    });

    // 【新增】建立自訂受眾（用於再行銷）
    createCustomAudience(type, variant);

    // 【新增】記錄用戶行為
    trackAction('complete_quiz', { mbtiType: type, variant });
    trackAction('v1_complete', { mbtiType: type, variant });

    setStage('loading');

    // Save to cloud in background - don't block UI
    if (user) {
      saveCompletedTest(type, variant, scores)
        .then(() => {
          setShowSaveToast({ show: true, success: true, message: '你的靈魂甜點配方已封存於 Kiwimu 宇宙 ✦' });
          setTimeout(() => setShowSaveToast({ show: false, success: true, message: '' }), 3500);
        })
        .catch(err => {
          console.error('Failed to save test results:', err);
          setShowSaveToast({ show: true, success: false, message: '配方暫存於此裝置，入籍宇宙後可永久封存 🌙' });
          setTimeout(() => setShowSaveToast({ show: false, success: true, message: '' }), 4500);
        });

      // 儲存用戶行為資料到 Firebase
      saveUserBehavior(user.uid, type, variant).catch(console.error);

      // referral conversion tracking skipped (Firebase db removed)

      // 【新增】同步 MBTI 結果到月島品牌資料庫
      const userEmail = user.email || user.providerData[0]?.email;
      if (userEmail) {
        saveMBTIToMoonIsland(
          userEmail,
          type,
          user.displayName || undefined,
          user.photoURL || undefined
        ).catch(err => console.error('Failed to sync to Moon Island:', err));

        // 【新增】測驗完成後寄結果信（僅已登入且有 email）
        sendResultEmail(userEmail, type, variant, {
          title: data.title,
          summary: data.summary,
          dessert: data.dessert,
        }).catch(() => { });
      } else {
        console.warn('⚠️ User email not available, skipping Moon Island sync');
      }
    }
  };

  const handleLoadingFinished = () => {
    // 【新增】追蹤查看結果
    if (resultData) {
      trackMarketingEvent(MARKETING_EVENTS.VIEW_RESULT, {
        mbtiType: resultData.id,
      });
      trackAction('view_result', { mbtiType: resultData.id });
    }

    replaceRoute('/quiz/result');
    setStage('result');

    // 🎮 W2-6 / LIFF-3：MBTI 完成積分觸發（+2 pts，每週限一次）
    triggerMbtiCompletePoints();
  };

  const handleRetest = () => {
    // 【新增】追蹤重測事件
    trackMarketingEvent(MARKETING_EVENTS.RETEST);
    trackAction('retest', { previousType: resultData?.id });

    setResultData(null);
    setScores(null);
    sessionStorage.removeItem('last_quiz_result');
    sessionStorage.removeItem('last_quiz_scores');
    sessionStorage.removeItem('flow_stage');

    if (!isV1Pathname(window.location.pathname)) {
      window.history.pushState({}, '', '/quiz');
    }

    setStage('intro');
  };

  const handleLogin = () => {
    // Always mark flow_stage so handleSession can return to correct stage after OAuth
    sessionStorage.setItem('login_origin_stage', stage);
    sessionStorage.setItem('flow_stage', 'login');
    const shouldRestoreResult = Boolean(resultData && scores && !isSharedView);
    sessionStorage.setItem(POST_LOGIN_DESTINATION_KEY, shouldRestoreResult ? 'result' : 'intro');
    if (shouldRestoreResult && resultData && scores) {
      sessionStorage.setItem('last_quiz_result', JSON.stringify(resultData));
      sessionStorage.setItem('last_quiz_scores', JSON.stringify(scores));
    } else {
      sessionStorage.removeItem('last_quiz_result');
      sessionStorage.removeItem('last_quiz_scores');
    }
    // Preserve discord_link_state across OAuth redirect (URL is lost after /callback)
    const discordState = new URLSearchParams(window.location.search).get('discord_link_state');
    if (discordState) {
      sessionStorage.setItem('discord_link_state', discordState);
    }
    trackAction('login_gate_opened', {
      path: window.location.pathname,
      has_result: shouldRestoreResult,
      is_shared_view: isSharedView,
      sessionId: getSession(),
    });
    trackLoginGateOpened({
      trigger: 'click',
      path: window.location.pathname,
      has_result: shouldRestoreResult,
      is_shared_view: isSharedView,
      session_id: getSessionId(),
    });
    setStage('login');
  };

  const handleLogout = async () => {
    try {
      await signOutSupabase();
      setUser(null);
      sessionStorage.removeItem('flow_stage');
      sessionStorage.removeItem('login_origin_stage');
      sessionStorage.removeItem(POST_LOGIN_DESTINATION_KEY);
      if (stage !== 'result') {
        replaceRoute('/');
        setStage(isV1Pathname(window.location.pathname) || ROOT_PATHS.has(window.location.pathname) ? 'intro' : 'state-test');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleViewArchive = () => {
    // 【新增】追蹤查看檔案
    trackMarketingEvent(MARKETING_EVENTS.VIEW_ARCHIVE);
    trackAction('view_archive');

    if (!user || user.isAnonymous) {
      trackArchiveGateOpened({
        has_result: Boolean(resultData),
        session_id: getSessionId(),
        mbti_type: resultData?.id,
      });
      sessionStorage.setItem('flow_stage', 'login');
      sessionStorage.setItem(POST_LOGIN_DESTINATION_KEY, 'archive');
      if (resultData && scores) {
        sessionStorage.setItem('last_quiz_result', JSON.stringify(resultData));
        sessionStorage.setItem('last_quiz_scores', JSON.stringify(scores));
      }
      setStage('login');
    } else {
      trackArchiveView({
        has_result: Boolean(resultData),
        session_id: getSessionId(),
        mbti_type: resultData?.id,
      });
      replaceRoute('/quiz/archive');
      setStage('archive');
    }
  };

  const handleBackFromArchive = () => {
    if (resultData && scores) {
      replaceRoute('/quiz/result');
      setStage('result');
    } else {
      replaceRoute('/');
      setStage(isV1Pathname(window.location.pathname) || ROOT_PATHS.has(window.location.pathname) ? 'intro' : 'state-test');
    }
  };

  const handleProfileSetupComplete = () => {
    setShowProfileSetup(false);
  };

  // 【新增】測試用：快速跳轉到結果頁面
  const jumpToResult = async (mbtiType: string) => {
    // 生成模擬分數
    const mockScores: Score = {
      E: mbtiType.includes('E') ? 70 : 30,
      I: mbtiType.includes('I') ? 70 : 30,
      S: mbtiType.includes('S') ? 65 : 35,
      N: mbtiType.includes('N') ? 65 : 35,
      T: mbtiType.includes('T') ? 60 : 40,
      F: mbtiType.includes('F') ? 60 : 40,
      J: mbtiType.includes('J') ? 55 : 45,
      P: mbtiType.includes('P') ? 55 : 45,
      A: 60,
      Turbulent: 40
    };

    // 載入結果數據
    const result = await loadResultData(mbtiType);

    setScores(mockScores);
    setResultData(result);
    setStage('result');
    setShowTestPanel(false);

    console.log(`[TEST MODE] Jumped to ${mbtiType} result page`);
  };

  // V1.5 /explore + /state-test 路由 — 完全獨立，不觸發 V1 Firebase 邏輯
  const _path = window.location.pathname;
  if (_path.startsWith('/explore') || _path.startsWith('/state-test')) {
    return (
      <LanguageProvider>
        <ExploreApp />
      </LanguageProvider>
    );
  }

  if (_path === '/answers' || _path.startsWith('/answers/')) {
    const answerSlug = decodeURIComponent(_path.replace(/^\/answers\/?/, '').replace(/\/$/, ''));
    return answerSlug ? <AnswerArticle slug={answerSlug} /> : <AnswersHub />;
  }

  // V2 /read 路由 — 完全獨立，不觸發 V1 Firebase 邏輯
  if (isV2Pathname(_path)) {
    const normalizedV2Path = normalizeV2Pathname(_path);
    return (
      <>
        {normalizedV2Path === '/read/quiz' ? <V2QuizFlow /> : <div className="v2-app"><V2App user={user} /></div>}
        <V2QaNotes />
      </>
    );
  }

  if (loadingAuth && stage !== 'callback') {
    return <div className="min-h-screen bg-kiwi-bg flex items-center justify-center">Loading...</div>;
  }


  return (
    <LanguageProvider>
      <div className="antialiased min-h-screen bg-kiwi-bg overflow-x-hidden">
        <div className={`min-h-screen bg-kiwi-bg transition-colors duration-1000 ${stage === 'quiz' ? 'bg-[#fff5e6]' : ''} overflow-x-hidden`}>
          {stage !== 'og-render' && <DiscordLinkGate user={user} onLogin={handleLogin} />}
          {stage !== 'intro' && stage !== 'manifesto' && stage !== 'og-render' && (
            <div className="fixed top-6 right-6 z-50">
              <UserMenu user={user} onLogin={handleLogin} onLogout={handleLogout} />
            </div>
          )}

          {showProfileSetup && user && (
            <ProfileSetupModal
              user={user}
              onComplete={handleProfileSetupComplete}
              isOpen={showProfileSetup}
            />
          )}

          {stage === 'callback' && <LoginCallback />}
          {stage === 'login' && <Login isUnlockMode={Boolean(resultData && scores)} />}
          {stage === 'intro' && <Intro onStart={goToManifesto} user={user} onLogin={handleLogin} onViewArchive={handleViewArchive} onLogout={handleLogout} />}
          {stage === 'manifesto' && <Manifesto onProceed={startQuiz} />}
          {stage === 'quiz' && <Quiz user={user} onComplete={handleQuizComplete} onSaveToCloud={saveToCloud} />}
          {stage === 'loading' && <Loading onFinished={handleLoadingFinished} />}
          {stage === 'result' && resultData && scores && (
            <Result
              resultData={resultData}
              rawScores={scores}
              onRetest={handleRetest}
              onOpenConsultant={() => console.log('Open consultant modal')}
              onViewArchive={handleViewArchive}
              user={user}
              onLogin={handleLogin}
              onLogout={handleLogout}
              isSharedView={isSharedView}
            />
          )}
          {stage === 'og-render' && resultData && scores && (
            <ResultLegacyDump
              resultData={resultData}
              rawScores={scores}
              onRetest={handleRetest}
              onOpenConsultant={() => console.log('Open consultant modal')}
              onViewArchive={handleViewArchive}
              user={user}
              onLogin={handleLogin}
              onLogout={handleLogout}
            />
          )}
          {stage === 'archive' && user && (
            <MyArchive key={Date.now()} user={user} onBack={handleBackFromArchive} />
          )}
          {stage === 'state-test' && <StateTest />}
          {stage === 'today' && <Today />}
          {stage === '404' && (
            <NotFound onHome={() => {
              window.history.pushState({}, '', '/'); // Reset URL
              setStage('intro');
            }} />
          )}

          {/* 底部法律連結（低調放置） */}
          {stage !== 'login' && stage !== 'callback' && (
            <FooterLinks />
          )}

          {/* Toast Notification for Save Status */}
          {showSaveToast.show && (
            <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[200] fade-in">
              <div className={`${showSaveToast.success ? 'bg-green-600' : 'bg-orange-500'} text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3`}>
                <span className="text-sm font-medium">{showSaveToast.message}</span>
              </div>
            </div>
          )}

          {/* 【新增】測試面板 */}
          {showTestPanel && (
            <div className="fixed bottom-4 right-4 z-[300] bg-black/95 text-white p-6 rounded-lg shadow-2xl border border-white/20 max-w-md animate-slide-in">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold">測試模式</h3>
                  <p className="text-xs text-gray-400 mt-1">快速跳轉到結果頁面</p>
                </div>
                <button
                  onClick={() => setShowTestPanel(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'].map(type => (
                  <button
                    key={type}
                    onClick={() => jumpToResult(type)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-xs font-mono transition-all hover:scale-105 active:scale-95"
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="text-xs text-gray-400 border-t border-white/10 pt-3 space-y-1">
                <p>快捷鍵：<kbd className="bg-white/10 px-2 py-1 rounded font-mono">Ctrl+Shift+T</kbd></p>
                <p>或網址加上 <code className="bg-white/10 px-1 rounded">?test=true</code></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </LanguageProvider>
  );
};

export default App;
