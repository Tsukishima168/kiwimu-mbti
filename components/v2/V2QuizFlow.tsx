import React, { useState } from 'react';
import { quizA } from './data';
import { calculateResults, getVariant } from '../../utils/logic';
import { getResultData } from '../../constants';
import { loadResultData } from '../../utils/dataLoader';
import { setLastV2PrototypeResult } from '../../utils/v2Access';
import { trackAction } from '../../utils/userDataCollector';
import { trackPageView, trackScreenEngagement } from '../../utils/analytics';
import { applyRuntimeSeo } from '../../utils/seo';
import { buildV2QuizPath, buildV2ReportPath, normalizeV2Pathname } from '../../utils/v2Routes';
import type { Option } from '../../types';
import './v2-tailwind.css';
import './v2.css';

const MARQUEE = 'KIWIMU V2 · 5 題找到靈魂甜點 · DEEP REPORT · ';

export default function V2QuizFlow() {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Option[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const quiz = quizA;
  const totalQuestions = quiz.questions.length;
  const question = quiz.questions[currentIndex];
  const progress = started ? Math.max((answers.length / totalQuestions) * 100, 2.5) : 0;
  const quizPath = buildV2QuizPath();

  React.useEffect(() => {
    const normalizedPath = normalizeV2Pathname(window.location.pathname);
    if (normalizedPath !== window.location.pathname) {
      window.history.replaceState({}, '', `${normalizedPath}${window.location.search}`);
    }
  }, []);

  React.useEffect(() => {
    applyRuntimeSeo({
      title: 'Kiwimu V2 5 題深度人格測驗（未公開）｜Moon Moon 月島甜點',
      description: '這是 Kiwimu V2 未公開的 5 題深度人格測驗入口，用來定位你的 V2 台灣版深度報告。',
      canonical: `https://kiwimu.com${quizPath}`,
      ogType: 'website',
      image: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1771485556/index-image-2_prd43w.png',
      keywords: 'Kiwimu,V2,MBTI,人格測驗,深度報告,台灣版',
      robots: 'noindex,nofollow,noarchive',
    });
  }, [quizPath]);

  React.useEffect(() => {
    const enteredAt = Date.now();
    trackPageView(quizPath);
    return () => {
      trackScreenEngagement(quizPath, Math.round((Date.now() - enteredAt) / 1000));
    };
  }, [quizPath]);

  const handleStart = () => {
    setStarted(true);
    trackAction('v2_quiz_flow_start', { quizId: quiz.id });
  };

  const finishQuiz = async (nextAnswers: Option[]) => {
    setIsResolving(true);
    try {
      const { type, scores } = calculateResults(nextAnswers);
      const variant = getVariant(scores);
      const resultData = await loadResultData(type, variant) || getResultData(type, variant);
      setLastV2PrototypeResult({ resultData, scores });
      trackAction('v2_quiz_flow_complete', { mbtiType: type, variant });
      window.location.assign(`${buildV2ReportPath(`${type}-${variant}`)}?source=v2_quiz`);
    } catch (err) {
      console.error('V2QuizFlow: failed to resolve result', err);
      setAnswers(nextAnswers.slice(0, -1));
      setIsResolving(false);
    }
  };

  const handleOptionSelect = (optionIndex: 0 | 1) => {
    if (!question || isAnimating || isResolving) return;
    setIsAnimating(true);
    const selected: Option = {
      label: question.options[optionIndex].text,
      value: question.options[optionIndex].value,
    };
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    trackAction('v2_quiz_flow_answer', {
      questionId: question.id,
      index: currentIndex,
      dimension: question.dimension,
      choice: optionIndex === 0 ? 'A' : 'B',
    });
    window.setTimeout(() => {
      if (nextAnswers.length === totalQuestions) {
        setIsAnimating(false);
        void finishQuiz(nextAnswers);
        return;
      }
      setCurrentIndex(currentIndex + 1);
      setIsAnimating(false);
    }, 250);
  };

  const handlePrevious = () => {
    if (currentIndex === 0 || isAnimating || isResolving) return;
    setAnswers(prev => prev.slice(0, -1));
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  if (!started) {
    return (
      <div className="v2-root min-h-screen px-5 pt-24 pb-16">
        <div className="marquee-container">
          <div className="marquee-track">
            <span className="marquee-text">{MARQUEE.repeat(3)}</span>
            <span className="marquee-text">{MARQUEE.repeat(3)}</span>
          </div>
        </div>
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-xl items-center">
          <div className="v2-panel w-full p-8 md:p-10">
            <p className="v2-eyebrow">KIWIMU V2 · 5 題靈魂定位</p>
            <h1
              className="mt-4 text-4xl font-bold leading-none md:text-5xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {quiz.title}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-black/70">
              {quiz.description}
            </p>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-black/50" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#CCFF00', border: '1px solid #1A1A1A' }} />
                5 個問題，找到你的靈魂甜點原型
              </div>
              <div className="flex items-center gap-2 text-black/50" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#CCFF00', border: '1px solid #1A1A1A' }} />
                沒有對錯，只有最真實的你
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="kiwimu-btn kiwimu-btn-primary flex-1 px-6 py-4 text-sm font-black uppercase tracking-[0.18em]"
                style={{ color: '#1A1A1A' }}
                onClick={handleStart}
              >
                開始掃描靈魂
              </button>
              <a
                href={buildV2QuizPath().replace('/quiz', '')}
                className="kiwimu-btn flex-1 px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.18em]"
                style={{ color: '#1A1A1A' }}
              >
                ← 返回
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isResolving) {
    return (
      <div className="v2-root min-h-screen px-5 pt-24 pb-16">
        <div className="marquee-container">
          <div className="marquee-track">
            <span className="marquee-text">{MARQUEE.repeat(3)}</span>
            <span className="marquee-text">{MARQUEE.repeat(3)}</span>
          </div>
        </div>
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-xl items-center">
          <div className="v2-panel w-full p-8 md:p-10 text-center">
            <p className="v2-eyebrow">FINAL PASS</p>
            <h2
              className="mt-4 text-3xl font-bold"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Kiwimu 正在翻你的靈魂...
            </h2>
            <p className="mt-4 text-base leading-relaxed text-black/70">
              把你剛才的反應整理成一份深報告，馬上就好。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="v2-root min-h-screen px-5 pt-24 pb-16">
      <div className="marquee-container">
        <div className="marquee-track">
          <span className="marquee-text">{MARQUEE.repeat(3)}</span>
          <span className="marquee-text">{MARQUEE.repeat(3)}</span>
        </div>
      </div>
      <div className="mx-auto max-w-2xl">
        <div className="v2-quiz-topbar">
          <a href={buildV2QuizPath().replace('/quiz', '')} className="v2-quiz-link">← 回到 V2</a>
          <div className="flex items-center gap-2">
            <span className="v2-pill">{currentIndex + 1} / {totalQuestions}</span>
          </div>
        </div>

        <section className="v2-panel v2-quiz-panel">
          <div className="v2-quiz-header">
            <div>
              <p className="v2-eyebrow">QUESTION {String(currentIndex + 1).padStart(2, '0')}</p>
              <h1 className="v2-quiz-title-sm mt-3">
                {question.dimension} · Kiwimu Lab
              </h1>
            </div>
          </div>

          <div className="v2-quiz-progress-shell mt-6">
            <div className="v2-quiz-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="v2-quiz-stage-row mt-5">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <span
                key={i}
                className={i < answers.length ? 'v2-quiz-stage is-active' : 'v2-quiz-stage'}
              />
            ))}
          </div>

          <div className="v2-quiz-question-wrap">
            <h2 className={`v2-quiz-question ${isAnimating ? 'is-fading' : ''}`}>
              {question.text}
            </h2>
            <p className="v2-quiz-subcopy">先照你的第一個反應回答就好，不需要把自己解釋得很完整。</p>
          </div>

          <div className="v2-quiz-option-grid">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                type="button"
                className="v2-quiz-option"
                onClick={() => handleOptionSelect(idx as 0 | 1)}
                disabled={isAnimating || isResolving}
              >
                <span className="v2-quiz-option-badge">{idx === 0 ? 'A' : 'B'}</span>
                <span>{option.text}</span>
              </button>
            ))}
          </div>

          <div className="v2-quiz-footer">
            <button
              type="button"
              className="v2-quiz-link is-button"
              onClick={handlePrevious}
              disabled={currentIndex === 0 || isResolving}
            >
              上一題
            </button>
            <p className="v2-quiz-helper">Kiwimu V2 · 5 題靈魂定位 · {quiz.id}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
