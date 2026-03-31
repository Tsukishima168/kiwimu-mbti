// V1.5 獨立入口 — 完全與 V1 路由隔離
// Phase 5: GA4 A/B tracking + Discord quiz version + explore_start event
//
// 三條投放 URL：
//   ?v=a&utm_source=threads    → Quiz A（Threads 投放）
//   ?v=b&utm_source=instagram  → Quiz B（IG 投放）
//   （無 param）               → 隨機分配（有機流量 / 直接分享）

import React, { useState } from 'react';
import ExploreIntro from './ExploreIntro';
import ExploreQuiz from './ExploreQuiz';
import ExploreResult from './ExploreResult';
import {
  quizA,
  quizB,
  explorePersonalities,
  calculateExploreResult,
  ExploreQuiz as ExploreQuizType,
} from '../../data/questions-explore';

type Stage = 'intro' | 'quiz' | 'result';

function getQuiz(): ExploreQuizType {
  const params = new URLSearchParams(window.location.search);
  const v = params.get('v');
  if (v === 'b') return quizB;
  if (v === 'a') return quizA;
  return Math.random() < 0.5 ? quizA : quizB;
}

function getSource(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('utm_source') || 'direct';
}

function fireGtag(event: string, params: Record<string, string>) {
  const w = window as Window & { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === 'function') w.gtag('event', event, params);
}

export default function ExploreApp() {
  const [quiz]  = useState<ExploreQuizType>(getQuiz);
  const [stage, setStage] = useState<Stage>('intro');
  const [result, setResult] = useState<{ mbtiType: string; suffix: 'A' | 'T' } | null>(null);

  const quizVersion = quiz.id;      // 'A' | 'B'
  const source      = getSource();  // utm_source or 'direct'

  // ── 封面 CTA 點擊 → 記錄漏斗頂部 ──
  const handleStart = () => {
    fireGtag('explore_start', { quiz_version: quizVersion, source });
    setStage('quiz');
  };

  // ── 5 題完成 → 結果 + Discord 通知 ──
  const handleComplete = (answers: Record<string, string>) => {
    const r = calculateExploreResult(answers);
    setResult(r);
    setStage('result');
    const personality = explorePersonalities[r.mbtiType];
    if (personality) {
      fetch('/api/notify-discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultType:      `${r.mbtiType}-${r.suffix}`,
          personalityName: `${personality.state}（5題快測 Quiz-${quizVersion} / ${source}）`,
          locale:          'zh',
        }),
      }).catch(() => {});
    }
  };

  const handleRetest = () => {
    setResult(null);
    setStage('intro');
    window.location.reload();
  };

  if (stage === 'intro') {
    return <ExploreIntro quizTitle={quiz.title} onStart={handleStart} />;
  }

  if (stage === 'result' && result) {
    const personality = explorePersonalities[result.mbtiType];
    if (!personality) {
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
        quizVersion={quizVersion}
        onRetest={handleRetest}
      />
    );
  }

  return <ExploreQuiz quiz={quiz} onComplete={handleComplete} />;
}
