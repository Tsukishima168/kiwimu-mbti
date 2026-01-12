// Deployment trigger: 2026-01-11-23-32
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from './firebase';
import { db } from './firestore.config';
import { Option, MbtiResultData, Score } from './types';
import { calculateResults, getVariant } from './utils/logic';
import { getResultData } from './constants';
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

type Stage = 'login' | 'callback' | 'intro' | 'manifesto' | 'quiz' | 'loading' | 'result' | 'archive';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stage, setStage] = useState<Stage>('intro');
  const [resultData, setResultData] = useState<MbtiResultData | null>(null);
  const [scores, setScores] = useState<Score | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  const { saveCompletedTest, saveToCloud } = useFirestoreSync(user);

  useEffect(() => {
    const init = async () => {
      await auth.authStateReady();
      setLoading(false);
    };
    init();
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
      }

      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [stage]);

  const goToManifesto = () => {
    setStage('manifesto');
  };

  const startQuiz = () => {
    setStage('quiz');
  };

  const handleQuizComplete = async (answers: Option[]) => {
    const { type, scores } = calculateResults(answers);
    const variant = getVariant(scores);
    const data = getResultData(type, variant);
    setScores(scores);
    setResultData(data);
    sessionStorage.setItem('last_quiz_result', JSON.stringify(data));
    sessionStorage.setItem('last_quiz_scores', JSON.stringify(scores));
    if (user) {
      await saveCompletedTest(type, variant, scores);
    }
    setStage('loading');
  };

  const handleLoadingFinished = () => {
    setStage('result');
  };

  const handleLoginSuccess = () => {
    console.log('Login successful! Checking for saved results...');

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
      setResultData(null);
      setScores(null);
      sessionStorage.clear();
      setStage('intro');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleViewArchive = () => {
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

  if (loadingAuth && stage !== 'callback') {
    return <div className="min-h-screen bg-kiwi-bg flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="antialiased min-h-screen bg-kiwi-bg overflow-x-hidden">
      <div className={`min-h-screen bg-kiwi-bg transition-colors duration-1000 ${stage === 'quiz' ? 'bg-[#fff5e6]' : ''} overflow-x-hidden`}>
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
        {stage === 'intro' && <Intro onStart={goToManifesto} />}
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
        {stage === 'archive' && user && (
          <MyArchive user={user} onBack={handleBackFromArchive} />
        )}
      </div>
    </div>
  );
};

export default App;
