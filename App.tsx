

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
import Login from './components/Login'; // Import Login component

type Stage = 'login' | 'intro' | 'manifesto' | 'quiz' | 'loading' | 'result';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stage, setStage] = useState<Stage>('login'); // Start with login
  const [resultData, setResultData] = useState<MbtiResultData | null>(null);
  const [scores, setScores] = useState<Score | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Check for existing auth state
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // If already at login stage or just loaded, move to intro
        if (stage === 'login') {
          setStage('intro');
        }
      } else {
        setStage('login');
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [stage]);

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
    setStage('result');
  };

  const handleRetest = () => {
    setResultData(null);
    setScores(null);
    setStage('intro');
  };

  if (loadingAuth) {
    return <div className="min-h-screen bg-kiwi-bg flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="antialiased min-h-screen bg-kiwi-bg overflow-x-hidden">
      {stage === 'login' && <Login onLoginSuccess={() => setStage('intro')} />}
      {stage === 'intro' && user && <Intro onStart={goToManifesto} />}
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
