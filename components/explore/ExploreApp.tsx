// V1.5 獨立入口 — 完全與 V1 路由隔離
// Phase 2: 接 ExploreQuiz + ExploreResult

import React, { useState } from 'react';
import ExploreQuiz from './ExploreQuiz';
import ExploreResult from './ExploreResult';
import {
  quizA,
  quizB,
  explorePersonalities,
  calculateExploreResult,
  ExploreQuiz as ExploreQuizType,
} from '../../data/questions-explore';

type Stage = 'quiz' | 'result';

function getQuiz(): ExploreQuizType {
  const params = new URLSearchParams(window.location.search);
  const v = params.get('v');
  if (v === 'b') return quizB;
  if (v === 'a') return quizA;
  // 無 param 時隨機分配
  return Math.random() < 0.5 ? quizA : quizB;
}

export default function ExploreApp() {
  const [quiz] = useState<ExploreQuizType>(getQuiz);
  const [stage, setStage] = useState<Stage>('quiz');
  const [result, setResult] = useState<{ mbtiType: string; suffix: 'A' | 'T' } | null>(null);

  const handleComplete = (answers: Record<string, string>) => {
    const r = calculateExploreResult(answers);
    setResult(r);
    setStage('result');
  };

  const handleRetest = () => {
    setResult(null);
    setStage('quiz');
    // 重置到題目第一題（ExploreQuiz 本身會 remount，因為 key 會改變）
    window.location.reload();
  };

  if (stage === 'result' && result) {
    const personality = explorePersonalities[result.mbtiType];
    if (!personality) {
      // fallback（不應發生，防禦性處理）
      return (
        <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#1A1A1A' }}>計算結果中…</p>
        </div>
      );
    }
    return (
      <ExploreResult
        mbtiType={result.mbtiType}
        suffix={result.suffix}
        personality={personality}
        onRetest={handleRetest}
      />
    );
  }

  return <ExploreQuiz quiz={quiz} onComplete={handleComplete} />;
}
