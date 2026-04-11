// V1.5 獨立入口 — 完全與 V1 路由隔離
// Phase 5: GA4 A/B tracking + Discord quiz version + explore_start event
//
// 三條投放 URL：
//   ?v=a&utm_source=threads    → Quiz A（Threads 投放）
//   ?v=b&utm_source=instagram  → Quiz B（IG 投放）
//   （無 param）               → 隨機分配（有機流量 / 直接分享）

import React, { useEffect, useState } from 'react';
import ExploreIntro from './ExploreIntro';
import ExploreQuiz from './ExploreQuiz';
import ExploreResult from './ExploreResult';
import {
  explorePersonalities,
  calculateExploreResult,
  ExploreQuiz as ExploreQuizType,
} from '../../data/questions-explore';
import { Language, useLanguage } from '../../contexts/LanguageContext';
import { exploreTranslations } from '../../i18n/exploreTranslations';
import { sendDiscordNotification } from '../../utils/discord';
import { getSession, trackAction } from '../../utils/userDataCollector';

type Stage = 'intro' | 'quiz' | 'result';

function getQuizVersion(): 'A' | 'B' {
  const params = new URLSearchParams(window.location.search);
  const v = params.get('v');
  if (v === 'b') return 'B';
  if (v === 'a') return 'A';
  return Math.random() < 0.5 ? 'A' : 'B';
}

function getSource(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('utm_source') || 'direct';
}

function getRequestedLanguage(): Language | null {
  const lang = new URLSearchParams(window.location.search).get('lang');
  if (lang === 'zh' || lang === 'en' || lang === 'ja' || lang === 'ko') {
    return lang;
  }

  return null;
}

function fireGtag(event: string, params: Record<string, string>) {
  const w = window as Window & { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === 'function') w.gtag('event', event, params);
}

const RESULT_PENDING_LABEL: Record<Language, string> = {
  zh: '計算結果中…',
  en: 'Calculating your state…',
  ja: '結果を読み込み中…',
  ko: '결과를 계산하는 중…',
};

export default function ExploreApp() {
  const [quizVersion] = useState<'A' | 'B'>(getQuizVersion);
  const [stage, setStage] = useState<Stage>('intro');
  const [result, setResult] = useState<{ mbtiType: string; suffix: 'A' | 'T' } | null>(null);
  const { language, setLanguage } = useLanguage();
  const requestedLanguage = getRequestedLanguage();
  const activeLanguage = requestedLanguage ?? language;
  const localePack = exploreTranslations[activeLanguage];
  const quiz = localePack.quizzes[quizVersion] as ExploreQuizType;

  const source      = getSource();  // utm_source or 'direct'

  useEffect(() => {
    if (requestedLanguage && requestedLanguage !== language) {
      setLanguage(requestedLanguage);
    }
  }, [language, requestedLanguage, setLanguage]);

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
    trackAction('v1_5_complete', {
      mbtiType: r.mbtiType,
      variant: r.suffix,
      quizVersion,
      source,
    });
    const personality = explorePersonalities[r.mbtiType];
    if (personality) {
      void sendDiscordNotification(r.mbtiType, r.suffix, activeLanguage, undefined, {
        funnel: 'v1_5',
        personalityNameOverride: `${localePack.personalities[r.mbtiType as keyof typeof localePack.personalities].state}（5題快測 Quiz-${quizVersion} / ${source}）`,
        stage: 'result',
        source,
        quizVersion,
        path: window.location.pathname,
        sessionId: getSession(),
        isLoggedIn: false,
      });
    }
  };

  const handleRetest = () => {
    setResult(null);
    setStage('intro');
    window.location.reload();
  };

  if (stage === 'intro') {
    return <ExploreIntro introCopy={localePack.intro} quizTitle={quiz.title} onStart={handleStart} />;
  }

  if (stage === 'result' && result) {
    const personalityBase = explorePersonalities[result.mbtiType];
    const personalityCopy = localePack.personalities[result.mbtiType as keyof typeof localePack.personalities];

    if (!personalityBase || !personalityCopy) {
      return (
        <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#1A1A1A' }}>{RESULT_PENDING_LABEL[activeLanguage]}</p>
        </div>
      );
    }

    const personality = {
      ...personalityBase,
      ...personalityCopy,
    };

    return (
      <ExploreResult
        language={activeLanguage}
        mbtiType={result.mbtiType}
        suffix={result.suffix}
        personality={personality}
        quizVersion={quizVersion}
        resultCopy={localePack.result}
        onRetest={handleRetest}
      />
    );
  }

  return <ExploreQuiz language={activeLanguage} quiz={quiz} onComplete={handleComplete} />;
}
