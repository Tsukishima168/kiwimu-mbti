// Deployment trigger: 2026-01-27-moon-island
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from './firebase';
import { db } from './firestore.config';
import { Option, MbtiResultData, Score } from './types';
import { calculateResults, getVariant } from './utils/logic';
import { getResultData } from './constants';
import { loadResultData } from './utils/dataLoader';
import { useFirestoreSync } from './hooks/useFirestoreSync';
import { signInAnonymously } from 'firebase/auth';
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
import { doc, getDoc } from 'firebase/firestore';
import { trackPageView, trackScreenEngagement, trackQuizComplete, trackUserLogin } from './utils/analytics';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const FooterLinks = () => {
  const { language } = useLanguage();
  const langSuffix = language === 'zh-TW' ? '' : `-${language}`;
  const privacyText = language === 'en' ? 'Privacy Policy' : language === 'ja' ? 'プライバシーポリシー' : language === 'ko' ? '개인정보 보호정책' : '隱私權政策';
  const termsText = language === 'en' ? 'Terms of Use' : language === 'ja' ? '利用規約' : language === 'ko' ? '이용 약관' : '使用者條款';

  return (
    <footer className="py-3 text-center text-xs text-gray-400">
      <a href={`/privacy${langSuffix}.html`} target="_blank" rel="noopener" className="hover:text-kiwi-dark transition-colors">{privacyText}</a>
      <span className="mx-2">·</span>
      <a href={`/terms${langSuffix}.html`} target="_blank" rel="noopener" className="hover:text-kiwi-dark transition-colors">{termsText}</a>
    </footer>
  );
};

// 行銷像素追蹤
import { initAllPixels, trackMarketingEvent, MARKETING_EVENTS, createCustomAudience } from './utils/marketingPixels';
import { initSession, trackAction, saveUserBehavior } from './utils/userDataCollector';
import { initLiff } from './utils/liffShare';

// UTM 追蹤（新增）
import { initUTMTracking } from './utils/utmTracking';

// 推薦追蹤（新增）
import { initReferralTracking, parseReferralParams, saveReferralToFirebase, updateReferralConversion } from './utils/referralTracking';

// Moon Island 整合
import { saveMBTIToMoonIsland } from './utils/moonIslandSync';
// 測驗完成寄結果信（已登入且有 email）
import { sendResultEmail } from './utils/sendResultEmail';

import NotFound from './components/NotFound';
import DiscordLinkGate from './components/DiscordLinkGate';
import { sendDiscordNotification } from './utils/discord';
import ResultLegacyDump from './components/ResultLegacyDump';
import { triggerMbtiCompletePoints } from './utils/questPointsTrigger';

type Stage = 'login' | 'callback' | 'intro' | 'manifesto' | 'quiz' | 'loading' | 'result' | 'archive' | 'og-render' | '404';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stage, setStage] = useState<Stage>('intro');
  const [resultData, setResultData] = useState<MbtiResultData | null>(null);
  const [scores, setScores] = useState<Score | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSaveToast, setShowSaveToast] = useState<{ show: boolean; success: boolean; message: string }>({ show: false, success: true, message: '' });

  // 【新增】測試模式狀態
  const [showTestPanel, setShowTestPanel] = useState(false);

  const { saveCompletedTest, saveToCloud } = useFirestoreSync(user);

  useEffect(() => {
    const init = async () => {
      await auth.authStateReady();
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

      // 【新增】如果有推薦參數，儲存到 Firebase
      const referralData = parseReferralParams();
      if (referralData && auth.currentUser) {
        saveReferralToFirebase(auth.currentUser.uid, referralData, db).catch(console.error);
      }
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
    const checkProfile = async () => {
      if (user && !user.isAnonymous) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (!data.isProfileSetup || !data.displayName) {
              setShowProfileSetup(true);
            }
          } else {
            setShowProfileSetup(true);
          }
        } catch (err) {
          console.error("Error checking profile:", err);
        }
      } else {
        setShowProfileSetup(false);
      }
    };
    if (!loading) {
      checkProfile();
    }
  }, [user, loading]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        try {
          const anonymousUser = await signInAnonymously(auth);
          setUser(anonymousUser.user);
          console.log('Anonymous user created:', anonymousUser.user.uid);
        } catch (error) {
          console.error('Anonymous sign-in failed:', error);
          setUser(null);
        }
      } else {
        setUser(currentUser);
        console.log('User authenticated:', {
          uid: currentUser.uid,
          isAnonymous: currentUser.isAnonymous,
          provider: currentUser.providerData[0]?.providerId || 'anonymous'
        });
      }

      const savedResult = sessionStorage.getItem('last_quiz_result');
      const savedScores = sessionStorage.getItem('last_quiz_scores');
      if (savedResult && savedScores) {
        setResultData(JSON.parse(savedResult));
        setScores(JSON.parse(savedScores));
        const currentStage = sessionStorage.getItem('flow_stage');
        if (currentStage === 'login' && currentUser && !currentUser.isAnonymous) {
          setStage('result');
          sessionStorage.removeItem('flow_stage');
        } else if (currentStage) {
          setStage(currentStage as Stage);
        }
      }

      if (window.location.pathname.includes('callback') || window.location.search.includes('code=')) {
        setStage('callback');
      } else if (window.location.pathname.match(/\/result\/([A-Z]+-[AT])\/og-render/)) {
        const match = window.location.pathname.match(/\/result\/([A-Z]+-[AT])\/og-render/);
        if (match && match[1]) {
          const [type, suffix] = match[1].split('-');
          // Load result data directly from constants for the OG crawler
          import('./constants').then(({ getResultData }) => {
            const data = getResultData(type);
            setResultData(data);
            // Default dummy scores format
            setScores({
              E: 0, I: 0,
              S: 0, N: 0,
              T: 0, F: 0,
              J: 0, P: 0,
              A: suffix === 'A' ? 1 : 0,
              Turbulent: suffix === 'T' ? 1 : 0
            });
            setStage('og-render');
          });
        } else {
          setStage('404');
        }
      } else if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
        // Simple 404 detection: If path is not root/index and not callback, show 404
        // Note: This works because we are using hashing/state routing for the app content itself
        setStage('404');
      }

      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // 各頁停留時間：切換前送出上一頁的 engagement
  const stageEnteredAtRef = React.useRef<number>(Date.now());
  const previousStageRef = React.useRef<Stage | null>(null);

  useEffect(() => {
    const now = Date.now();
    const prev = previousStageRef.current;
    const enteredAt = stageEnteredAtRef.current;

    if (prev != null && prev !== stage) {
      const seconds = Math.round((now - enteredAt) / 1000);
      let path = `/${prev}`;
      if (prev === 'intro') path = '/';
      trackScreenEngagement(path, seconds);
    }

    previousStageRef.current = stage;
    stageEnteredAtRef.current = now;
    window.scrollTo(0, 0);

    let path = `/${stage}`;
    if (stage === 'intro') path = '/';
    trackPageView(path);
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
    sendDiscordNotification(type, variant);

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

    setStage('loading');

    // Save to cloud in background - don't block UI
    if (user) {
      saveCompletedTest(type, variant, scores)
        .then(() => {
          setShowSaveToast({ show: true, success: true, message: '測驗結果已安全儲存' });
          setTimeout(() => setShowSaveToast({ show: false, success: true, message: '' }), 3000);
        })
        .catch(err => {
          console.error('Failed to save test results:', err);
          setShowSaveToast({ show: true, success: false, message: '結果已保存在此裝置，請稍後登入同步' });
          setTimeout(() => setShowSaveToast({ show: false, success: true, message: '' }), 4000);
        });

      // 儲存用戶行為資料到 Firebase
      saveUserBehavior(user.uid, type, variant).catch(console.error);

      // 【新增】如果是通過推薦進入的，更新轉換狀態
      updateReferralConversion(user.uid, type, db).catch(console.error);

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

    setStage('result');

    // 🎮 W2-6 / LIFF-3：MBTI 完成積分觸發（+2 pts，每週限一次）
    triggerMbtiCompletePoints();
  };

  const handleLoginSuccess = () => {
    console.log('Login successful! Checking for saved results...');

    if (user) {
      trackUserLogin('google', user.uid); // Assuming google/default for now or check provider

      // 【新增】追蹤登入事件
      trackMarketingEvent(MARKETING_EVENTS.LOGIN);
      trackAction('login', { provider: user.providerData[0]?.providerId || 'unknown' });
    }

    // Try to restore previous results from session storage
    const savedResult = sessionStorage.getItem('last_quiz_result');
    const savedScores = sessionStorage.getItem('last_quiz_scores');

    if (savedResult && savedScores) {
      console.log('Restoring saved results...');
      setResultData(JSON.parse(savedResult));
      setScores(JSON.parse(savedScores));
      setStage('result');

      // Clear flow_stage marker
      sessionStorage.removeItem('flow_stage');
    } else {
      console.log('No saved results, going to intro');
      setStage('intro');
    }
  };

  const handleRetest = () => {
    // 【新增】追蹤重測事件
    trackMarketingEvent(MARKETING_EVENTS.RETEST);
    trackAction('retest', { previousType: resultData?.id });

    if (user && !user.isAnonymous) {
      setStage('result');
    } else {
      setStage('intro');
    }
    setResultData(null);
    setScores(null);
    sessionStorage.removeItem('last_quiz_result');
    sessionStorage.removeItem('last_quiz_scores');
    sessionStorage.removeItem('flow_stage');
  };

  const handleLogin = () => {
    if (resultData && scores) {
      sessionStorage.setItem('last_quiz_result', JSON.stringify(resultData));
      sessionStorage.setItem('last_quiz_scores', JSON.stringify(scores));
      sessionStorage.setItem('flow_stage', 'login');
    }
    setStage('login');
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      // After logout, Firebase will auto-create a new anonymous user via onAuthStateChanged
      // Don't clear sessionStorage here - user might want to see their results
      // Only clear auth-related data
      sessionStorage.removeItem('flow_stage');
      sessionStorage.removeItem('processed_line_code');

      // If on result page, stay there. Otherwise go to intro
      if (stage !== 'result') {
        setStage('intro');
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
      sessionStorage.setItem('flow_stage', 'result');
      setStage('login');
    } else {
      setStage('archive');
    }
  };

  const handleBackFromArchive = () => {
    if (resultData && scores) {
      setStage('result');
    } else {
      setStage('intro');
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

  if (loadingAuth && stage !== 'callback') {
    return <div className="min-h-screen bg-kiwi-bg flex items-center justify-center">Loading...</div>;
  }


  return (
    <LanguageProvider>
      <div className="antialiased min-h-screen bg-kiwi-bg overflow-x-hidden">
        <div className={`min-h-screen bg-kiwi-bg transition-colors duration-1000 ${stage === 'quiz' ? 'bg-[#fff5e6]' : ''} overflow-x-hidden`}>
          <DiscordLinkGate user={user} onLogin={handleLogin} />
          {stage !== 'intro' && stage !== 'manifesto' && (
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

          {stage === 'callback' && <LoginCallback onLoginSuccess={handleLoginSuccess} />}
          {stage === 'login' && <Login onLoginSuccess={handleLoginSuccess} isUnlockMode={true} />}
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
