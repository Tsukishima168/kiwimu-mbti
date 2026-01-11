

// Deployment trigger: 2026-01-08-23-10
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth'; // Import User type
import { auth } from './firebase'; // Import auth
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
import LoginCallback from './components/LoginCallback'; // Import Callback component
import MyArchive from './components/MyArchive';
import UserMenu from './components/UserMenu';
import ProfileSetupModal from './components/ProfileSetupModal';
import { doc, getDoc } from 'firebase/firestore'; // firestore utils needed

type Stage = 'login' | 'callback' | 'intro' | 'manifesto' | 'quiz' | 'loading' | 'result' | 'archive';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stage, setStage] = useState<Stage>('intro'); // Start with intro
  const [resultData, setResultData] = useState<MbtiResultData | null>(null);
  const [scores, setScores] = useState<Score | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [loading, setLoading] = useState(true); // Added loading state for initial auth check

  // Firestore sync hook
  const { saveCompletedTest, saveToCloud } = useFirestoreSync(user);

  // Initial load handling
  useEffect(() => {
    const init = async () => {
      await auth.authStateReady();
      setLoading(false);
    };
    init();
  }, []);

  // Check profile status when user changes
  useEffect(() => {
    const checkProfile = async () => {
      // Only show for logged in, non-anonymous users
      if (user && !user.isAnonymous) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            // Show setup if 'isProfileSetup' flag is missing or false
            // OR if displayName is empty (legacy users)
            if (!data.isProfileSetup || !data.displayName) {
              setShowProfileSetup(true);
            }
          } else {
            // New user doc might not exist yet if created via save-user api implies async
            // But usually we want to force profile setup
            setShowProfileSetup(true);
          }
        } catch (err) {
          console.error("Error checking profile:", err);
        }
      } else {
        setShowProfileSetup(false);
      }
    };

    if (!loading) { // Only check profile once initial auth state is ready
      checkProfile();
    }
  }, [user, loading]);

  useEffect(() => {
    // Check for existing auth state
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      // If no user at all, sign in anonymously
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

      // Restore results if they exist in session storage
      const savedResult = sessionStorage.getItem('last_quiz_result');
      const savedScores = sessionStorage.getItem('last_quiz_scores');
      if (savedResult && savedScores) {
        setResultData(JSON.parse(savedResult));
        setScores(JSON.parse(savedScores));

        // If we were in the middle of a flow, handle it
        const currentStage = sessionStorage.getItem('flow_stage');
        if (currentStage === 'login' && currentUser && !currentUser.isAnonymous) {
          setStage('result');
          sessionStorage.removeItem('flow_stage');
        } else if (currentStage) {
          setStage(currentStage as Stage);
        }
      }

      // Handle callback specifically
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
    const variant = getVariant(scores); // Determine A or T
    const data = getResultData(type, variant); // Pass variant to get specific content

    setScores(scores);
    setResultData(data);

    // Persist to session storage so we can restore after redirect
    sessionStorage.setItem('last_quiz_result', JSON.stringify(data));
    sessionStorage.setItem('last_quiz_scores', JSON.stringify(scores));

    // Save to Firestore if user is logged in
    if (user) {
      await saveCompletedTest(type, variant, scores);
    }

    setStage('loading');
  };

  const handleLoadingFinished = () => {
    setStage('result');
  };

  const handleLoginSuccess = () => {
    // If we have result data, go to result, otherwise go to intro
    if (resultData) {
      setStage('result');
    } else {
      setStage('intro');
    }
  };

  const handleRetest = () => {
    if (user && !user.isAnonymous) {
      // Logged-in users: go back to result page to retest immediately
      setStage('result');
    } else {
      // Anonymous users: clear results and restart from intro
      setStage('intro');
    }
    setResultData(null);
    setScores(null);
    sessionStorage.removeItem('last_quiz_result');
    sessionStorage.removeItem('last_quiz_scores');
    sessionStorage.removeItem('flow_stage'); // Keep this from original retest
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
      // Prompt to bind account
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
    // Optionally refresh user menu or show toast
  };

  if (loadingAuth && stage !== 'callback') {
    // Don't show generic loading if we are handling callback (which has its own loading)
    return <div className="min-h-screen bg-kiwi-bg flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="antialiased min-h-screen bg-kiwi-bg overflow-x-hidden">
      <div className={`min-h-screen bg-kiwi-bg transition-colors duration-1000 ${stage === 'quiz' ? 'bg-[#fff5e6]' : ''
        } overflow-x-hidden`}>
        {/* User Menu (Top Right) */}
        {stage !== 'intro' && stage !== 'splash' && stage !== 'manifesto' && (
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
        {/* Assuming 'splash' stage would render something here if it were fully implemented */}
        {stage === 'splash' && (
          <div className="flex items-center justify-center min-h-screen">
            {/* Splash screen content */}
            <p>Welcome to the Splash Screen!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
