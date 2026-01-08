

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth'; // Import User type
import { auth } from './firebase'; // Import auth
import { Option, MbtiResultData, Score } from './types';
import { calculateResults, getVariant } from './utils/logic';
import { getResultData } from './constants';
import Intro from './components/Intro';
import Quiz from './components/Quiz';
import Loading from './components/Loading';
import Result from './components/Result';
import Manifesto from './components/Manifesto';
import Login from './components/Login';
import LoginCallback from './components/LoginCallback'; // Import Callback component

type Stage = 'login' | 'callback' | 'intro' | 'manifesto' | 'quiz' | 'loading' | 'result';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stage, setStage] = useState<Stage>('intro'); // Start with intro
  const [resultData, setResultData] = useState<MbtiResultData | null>(null);
  const [scores, setScores] = useState<Score | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Check for existing auth state
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);

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

  const handleQuizComplete = (answers: Option[]) => {
    const { type, scores } = calculateResults(answers);
    const variant = getVariant(scores); // Determine A or T
    const data = getResultData(type, variant); // Pass variant to get specific content

    setScores(scores);
    setResultData(data);
    setStage('loading');
  };

  const handleLoadingFinished = () => {
    // Check if user is logged in
    if (user) {
      setStage('result');
    } else {
      setStage('login'); // Require login to see result
    }
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
    setResultData(null);
    setScores(null);
    setStage('intro');
  };

  if (loadingAuth && stage !== 'callback') {
    // Don't show generic loading if we are handling callback (which has its own loading)
    return <div className="min-h-screen bg-kiwi-bg flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="antialiased min-h-screen bg-kiwi-bg overflow-x-hidden">
      {stage === 'callback' && <LoginCallback onLoginSuccess={handleLoginSuccess} />}
      {stage === 'login' && <Login onLoginSuccess={handleLoginSuccess} isUnlockMode={true} />}
      {stage === 'intro' && <Intro onStart={goToManifesto} />}
      {stage === 'manifesto' && <Manifesto onProceed={startQuiz} />}
      {stage === 'quiz' && <Quiz onComplete={handleQuizComplete} />}
      {stage === 'loading' && <Loading onFinished={handleLoadingFinished} />}
      {stage === 'result' && resultData && scores && (
        <Result
          resultData={resultData}
          rawScores={scores}
          onRetest={handleRetest}
          onOpenConsultant={() => { }}
        />
      )}
    </div>
  );
};

export default App;
