import React, { useState } from 'react';
import { V2_TAIWAN_QUESTIONS } from '../../data/v2TaiwanQuestions.generated';
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
import './v2-dark.css';

const MARQUEE = 'KIWIMU V2 · 狀態光譜測驗 · DEEP REPORT · ';
const QUESTIONS = V2_TAIWAN_QUESTIONS;
const QUIZ_CHAPTER_COUNT = 5;

export default function V2QuizFlow() {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Option[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const totalQuestions = QUESTIONS.length;
  const question = QUESTIONS[currentIndex];
  const questionsPerChapter = Math.ceil(totalQuestions / QUIZ_CHAPTER_COUNT);
  const currentChapter = Math.min(QUIZ_CHAPTER_COUNT, Math.floor(currentIndex / questionsPerChapter) + 1);
  const chapterProgress = ((currentIndex % questionsPerChapter) / questionsPerChapter) * 100;
  const quizPath = buildV2QuizPath();

  React.useEffect(() => {
    const normalizedPath = normalizeV2Pathname(window.location.pathname);
    if (normalizedPath !== window.location.pathname) {
      window.history.replaceState({}, '', `${normalizedPath}${window.location.search}`);
    }
  }, []);

  React.useEffect(() => {
    applyRuntimeSeo({
      title: 'Kiwimu V2 40 題狀態光譜測驗｜Kiwimu',
      description: 'Kiwimu V2 以貼近台灣生活的情境題，整理你的深度狀態光譜與專屬報告。',
      canonical: `https://kiwimu.com${quizPath}`,
      ogType: 'website',
      image: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1771485556/index-image-2_prd43w.png',
      keywords: 'Kiwimu,V2,MBTI,人格測驗,深度報告,台灣版',
      robots: 'index,follow',
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
    trackAction('v2_quiz_flow_start', { quizId: 'v2-tw-40' });
  };

  const finishQuiz = async (nextAnswers: Option[]) => {
    setIsResolving(true);
    try {
      const { type, scores } = calculateResults(nextAnswers, QUESTIONS);
      const variant = getVariant(scores);
      const resultData = await loadResultData(type, variant) || getResultData(type, variant);
      setLastV2PrototypeResult({ resultData, scores });
      trackAction('v2_quiz_flow_complete', {
        mbtiType: type,
        variant,
        source: 'v2_quiz_tw_40',
      });
      window.location.assign(buildV2ReportPath(`${type}-${variant}`));
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
      label: question.options[optionIndex].label,
      value: question.options[optionIndex].value,
    };
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    trackAction('v2_quiz_flow_answer', {
      questionId: question.questionId,
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

  const CHARACTER_IMG = 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1774772303/redesigned-photo-1774598290392_wlohqn.png';

  if (!started) {
    return (
      <div className="ad-landing-screen">
        <div className="ad-orb ad-orb-1" />
        <div className="ad-orb ad-orb-2" />

        {/* Marquee */}
        <div className="marquee-container" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
          <div className="marquee-track">
            <span className="marquee-text">{MARQUEE.repeat(4)}</span>
            <span className="marquee-text">{MARQUEE.repeat(4)}</span>
          </div>
        </div>

        <div className="ad-landing-col">
          {/* Character above panel */}
          <div className="ad-character-wrap">
            <span className="ad-character-glow" />
            <img
              className="ad-character-img"
              src={CHARACTER_IMG}
              alt="Kiwimu"
            />
          </div>

          {/* Panel */}
          <div className="ad-landing-panel">
            <p className="v2-eyebrow" style={{ marginBottom: 20 }}>
              KIWIMU V2 · 狀態光譜測驗
            </p>

            <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 34, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--t1)', marginBottom: 14 }}>
              找到你的<br />真實樣子
            </h1>

            <p style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.85, marginBottom: 24 }}>
              這份測驗用貼近台灣生活的情境，整理你此刻更深層的狀態光譜，生成一份專屬深度報告。
            </p>

            {/* Stats */}
            <div className="ad-stats">
              <div className="ad-stat">
                <div className="ad-stat-num">40</div>
                <div className="ad-stat-label">道題目</div>
              </div>
              <div className="ad-stat">
                <div className="ad-stat-num">5</div>
                <div className="ad-stat-label">個章節</div>
              </div>
              <div className="ad-stat">
                <div className="ad-stat-num is-acid">∞</div>
                <div className="ad-stat-label">深度報告</div>
              </div>
            </div>

            {/* Bullets */}
            <div className="ad-bullets">
              <div className="ad-bullet">
                <span className="ad-bullet-dot" />
                不套制式人設，先看你真實的反應方式
              </div>
              <div className="ad-bullet">
                <span className="ad-bullet-dot" />
                先照第一反應選，不需要想太久
              </div>
            </div>

            {/* CTA */}
            <div className="ad-btn-row">
              <button type="button" className="ad-btn-primary" onClick={handleStart}>
                探索靈魂狀態 →
              </button>
              <a href={buildV2QuizPath().replace('/quiz', '')} className="ad-btn-ghost">
                ← 返回 Kiwimu
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isResolving) {
    return (
      <div className="ad-resolving">
        <div className="ad-resolving-panel">
          <div className="ad-resolving-dots">
            <span className="ad-resolving-dot" />
            <span className="ad-resolving-dot" />
            <span className="ad-resolving-dot" />
          </div>
          <p className="v2-eyebrow" style={{ marginBottom: 16 }}>FINAL PASS</p>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 26, fontWeight: 700, color: 'var(--t1)', marginBottom: 12 }}>
            Kiwimu 正在翻你的靈魂...
          </h2>
          <p style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.75 }}>
            把你剛才的反應整理成一份深報告，馬上就好。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-quiz-screen">
      {/* Marquee */}
      <div className="marquee-container" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div className="marquee-track">
          <span className="marquee-text">{MARQUEE.repeat(4)}</span>
          <span className="marquee-text">{MARQUEE.repeat(4)}</span>
        </div>
      </div>

      {/* Topbar */}
      <div className="ad-quiz-topbar">
        <a href={buildV2QuizPath().replace('/quiz', '')} className="ad-quiz-back">← 回到 V2</a>
        <span className="ad-quiz-status">Kiwimu 正在收集你的第一反應</span>
      </div>

      {/* Quiz panel */}
      <section className="ad-quiz-panel" aria-label="測驗題目">
        {/* Header */}
        <div className="ad-quiz-header">
          <div>
            <p className="ad-quiz-q-num">QUESTION {String(currentIndex + 1).padStart(2, '0')}</p>
            <h1 className="ad-quiz-lab-title">Kiwimu Lab</h1>
          </div>
        </div>

        {/* Chapter progress */}
        <div className="ad-chapter-block" aria-label={`狀態顯影 ${currentChapter} / ${QUIZ_CHAPTER_COUNT}`}>
          <div className="ad-chapter-row">
            <span className="ad-chapter-label">狀態顯影</span>
            <strong className="ad-chapter-count">
              {String(currentChapter).padStart(2, '0')} / {String(QUIZ_CHAPTER_COUNT).padStart(2, '0')}
            </strong>
          </div>
          <div className="ad-chapter-track" aria-hidden="true">
            <span className="ad-chapter-fill" style={{ width: `${chapterProgress}%` }} />
          </div>
          <div className="ad-chapter-dots" aria-hidden="true">
            {Array.from({ length: QUIZ_CHAPTER_COUNT }).map((_, index) => (
              <span
                key={index}
                className={[
                  'ad-chapter-dot',
                  index < currentChapter - 1 ? 'is-complete' : '',
                  index === currentChapter - 1 ? 'is-current' : '',
                ].filter(Boolean).join(' ')}
              />
            ))}
          </div>
          <p className="ad-chapter-hint">先保留第一反應，Kiwimu 會在後面整理它。</p>
        </div>

        {/* Question */}
        <div className="ad-question-wrap">
          <h2 className={`ad-question-text${isAnimating ? ' is-fading' : ''}`}>
            {question.text}
          </h2>
          <p className="ad-question-hint">先照你的第一個反應回答就好，不需要把自己解釋得很完整。</p>
        </div>

        {/* Options */}
        <div className="ad-option-grid">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              type="button"
              className="ad-option"
              onClick={() => handleOptionSelect(idx as 0 | 1)}
              disabled={isAnimating || isResolving}
            >
              <span className="ad-option-badge">{idx === 0 ? 'A' : 'B'}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="ad-quiz-footer">
          <button
            type="button"
            className="ad-quiz-prev"
            onClick={handlePrevious}
            disabled={currentIndex === 0 || isResolving}
          >
            ← 上一題
          </button>
          <p className="ad-quiz-helper">KIWIMU V2 · 40 題 · 狀態光譜</p>
        </div>
      </section>
    </div>
  );
}
