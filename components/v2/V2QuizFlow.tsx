import React, { lazy, Suspense, useEffect, useState } from 'react';
import { V2_TAIWAN_QUESTIONS } from '../../data/v2TaiwanQuestions.generated';
import { calculateResults, getVariant } from '../../utils/logic';
import { getResultData } from '../../constants';
import { loadResultData } from '../../utils/dataLoader';
import { setLastV2PrototypeResult } from '../../utils/v2Access';
import { trackAction } from '../../utils/userDataCollector';
import { trackPageView, trackScreenEngagement } from '../../utils/analytics';
import { applyRuntimeSeo } from '../../utils/seo';
import { buildV2QuizPath, buildV2ReportPath, normalizeV2Pathname } from '../../utils/v2Routes';
import { prepareMbtiAttempt, queueMbtiCompleted } from '../../utils/economyEvents';
import type { AppUser } from '../../types';
import type { Option } from '../../types';

// Kept lazy so the quiz chunk stays small, and prefetched near the end of the
// quiz so the hand-off below has nothing left to download.
const V2App = lazy(() => import('./V2App'));
import { KIWIMU_CAMPAIGN_ASSETS, getSceneAsset } from '../../data/kiwimuVisualAssets';
import KiwimuVisual from '../visuals/KiwimuVisual';
import V2Welcome from './V2Welcome';
import './v2-tailwind.css';
import './v2.css';
import './v2-dark.css';

const MARQUEE = 'KIWIMU V2 · 生活反應探索 · QUIET ATLAS · ';
const QUESTIONS = V2_TAIWAN_QUESTIONS;
const QUIZ_CHAPTER_COUNT = 5;

interface V2QuizFlowProps {
  user?: AppUser | null;
}

export default function V2QuizFlow({ user }: V2QuizFlowProps) {
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Option[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  /** 跨章時的全屏過場；null = 不顯示 */
  const [chapterBreak, setChapterBreak] = useState<number | null>(null);
  /** 答完後接手渲染報告的路徑；null = 還在測驗。設了值代表已 pushState。 */
  const [handoffPath, setHandoffPath] = useState<string | null>(null);

  const totalQuestions = QUESTIONS.length;
  const question = QUESTIONS[currentIndex];
  const questionsPerChapter = Math.ceil(totalQuestions / QUIZ_CHAPTER_COUNT);
  const currentChapter = Math.min(QUIZ_CHAPTER_COUNT, Math.floor(currentIndex / questionsPerChapter) + 1);
  const chapterProgress = (answers.length / totalQuestions) * 100;
  const quizPath = buildV2QuizPath();

  /**
   * 章節區裡那隻常駐 Kiwimu。
   *
   * 用 32 場景的 avatar 而不是既有的 6 張狀態圖：那 6 張是扁平黑白線稿，
   * 和厚塗場景圖是兩種視覺語言，混在同一個 V2 介面裡會破功
   * （角色 brief 明講「不要一張像水彩、一張像扁平 icon」）。
   *
   * 「內收 / 外放」決定看哪一組代表變體，作答進度決定它有多清楚——
   * 一開始是模糊的，答得越多顯影越完整。刻意不顯示任何型別文字：
   * 中途給出可讀的結論會影響後面的作答，這裡只給「越來越清楚」的感覺。
   */
  const INWARD_FACES = ['INFP-A', 'INTJ-A', 'ISFP-A'] as const;
  const OUTWARD_FACES = ['ENFP-A', 'ESFP-A', 'ESTP-A'] as const;

  const avatar = React.useMemo(() => {
    const outward = answers.filter((a) => a.value === 'E').length;
    const inward = answers.filter((a) => a.value === 'I').length;
    const faces = outward > inward ? OUTWARD_FACES : INWARD_FACES;
    const ratio = currentIndex / Math.max(1, totalQuestions);
    const asset = getSceneAsset(faces[Math.min(faces.length - 1, Math.floor(ratio * faces.length))]);
    // 3px → 0px：顯影
    const blur = Math.max(0, 3 * (1 - ratio));
    return { asset, blur };
  }, [answers, currentIndex, totalQuestions]);

  React.useEffect(() => {
    if (chapterBreak === null) return;
    const timer = window.setTimeout(() => setChapterBreak(null), 1900);
    return () => window.clearTimeout(timer);
  }, [chapterBreak]);

  React.useEffect(() => {
    const normalizedPath = normalizeV2Pathname(window.location.pathname);
    if (normalizedPath !== window.location.pathname) {
      window.history.replaceState({}, '', `${normalizedPath}${window.location.search}`);
    }
  }, []);

  React.useEffect(() => {
    applyRuntimeSeo({
      title: '免費 MBTI 自我探索｜Kiwimu V2 40 題生活情境｜MoonType × 月島甜點',
      description: '從 40 個貼近台灣生活的情境開始，整理你的 16 型人格、近期 A/T 回應傾向與對應的 Quiet Atlas 敘事報告。',
      canonical: `https://kiwimu.com${quizPath}`,
      ogType: 'website',
      image: KIWIMU_CAMPAIGN_ASSETS.socialFallback.src,
      keywords: '免費 MBTI 測驗,MBTI 免費,免費 16 型人格測驗,MBTI 深度報告,Kiwimu,MoonType MBTI,月島 MBTI,A 型 T 型,Z 世代 MBTI,月島甜點,靈魂甜點',
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
    void prepareMbtiAttempt('v2-tw-40');
    trackAction('v2_quiz_flow_start', { quizId: 'v2-tw-40' });
  };

  // Warm the report chunk while the last questions are being answered so the
  // hand-off is instant rather than a spinner.
  useEffect(() => {
    if (currentIndex < totalQuestions - 5) return;
    void import('./V2App');
  }, [currentIndex, totalQuestions]);

  // App.tsx picks its route from window.location.pathname at render time and
  // never listens for popstate, so once we have handed off, going back would
  // change the URL without changing the UI. Reload so the router-less shell
  // re-evaluates the path.
  useEffect(() => {
    if (!handoffPath) return;
    const onPop = () => window.location.reload();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [handoffPath]);

  const finishQuiz = async (nextAnswers: Option[]) => {
    setErrorMessage('');
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
      queueMbtiCompleted({
        answers: nextAnswers,
        questionBank: QUESTIONS,
        quizVersion: 'v2-tw-40',
      });
      // Hand off in-place instead of reloading the page. A full navigation here
      // threw away ~1.65MB of already-parsed JS and put a blank frame between
      // the resolving panel and the report, right at the emotional payoff.
      const reportPath = `${buildV2ReportPath(`${type}-${variant}`)}?source=v2_quiz`;
      window.history.pushState({}, '', reportPath);
      setHandoffPath(reportPath);
    } catch (err) {
      console.error('V2QuizFlow: failed to resolve result', err);
      setAnswers(nextAnswers.slice(0, -1));
      setIsResolving(false);
      setErrorMessage('剛才的結果未能儲存。請再選一次最後一題，重新整理結果。');
    }
  };

  const handleOptionSelect = (optionIndex: 0 | 1) => {
    if (!question || isAnimating || isResolving) return;
    setSelectedOption(optionIndex);
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
      const nextIndex = currentIndex + 1;
      const nextChapter = Math.min(QUIZ_CHAPTER_COUNT, Math.floor(nextIndex / questionsPerChapter) + 1);
      // 跨到新章節就插一次過場：40 題純作答太長，這是節奏點
      if (nextChapter !== currentChapter) setChapterBreak(nextChapter);
      setSelectedOption(null);
      setCurrentIndex(nextIndex);
      setIsAnimating(false);
    }, 250);
  };

  const handlePrevious = () => {
    if (currentIndex === 0 || isAnimating || isResolving) return;
    setAnswers(prev => prev.slice(0, -1));
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  if (!started) return <V2Welcome onStart={handleStart} />;

  const resolvingPanel = (
    <div className="v2-surface ad-resolving">
        <div className="ad-resolving-panel">
          <div className="ad-resolving-dots">
            <span className="ad-resolving-dot" />
            <span className="ad-resolving-dot" />
            <span className="ad-resolving-dot" />
          </div>
          <p className="v2-eyebrow" style={{ marginBottom: 16 }}>FINAL PASS</p>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 26, fontWeight: 700, color: 'var(--t1)', marginBottom: 12 }}>
            正在整理你的閱讀座標…
          </h2>
          <p style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.75 }}>
            把剛才的選擇整理成型別、傾向與對應的敘事。
          </p>
      </div>
    </div>
  );

  if (handoffPath) {
    return (
      <div className="v2-app v2-handoff">
        <Suspense fallback={resolvingPanel}>
          <V2App user={user} />
        </Suspense>
      </div>
    );
  }

  if (isResolving) return resolvingPanel;

  if (chapterBreak !== null) {
    const BREAK_FACES = ['INFP-A', 'INTJ-A', 'ISFP-A', 'ENFP-A', 'ESFP-A'] as const;
    const breakAsset = getSceneAsset(BREAK_FACES[(chapterBreak - 1) % BREAK_FACES.length]);
    return (
      <div
        className="v2-surface ad-chapter-break"
        role="button"
        tabIndex={0}
        onClick={() => setChapterBreak(null)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') setChapterBreak(null);
        }}
        aria-label={`狀態顯影 ${chapterBreak} / ${QUIZ_CHAPTER_COUNT}`}
      >
        <div className="ad-chapter-break-inner">
          {breakAsset ? (
            <img
              className="ad-chapter-break-img"
              src={breakAsset.portrait.src}
              width={breakAsset.portrait.width}
              height={breakAsset.portrait.height}
              alt=""
              decoding="async"
            />
          ) : null}
          <p className="ad-chapter-break-label">狀態顯影</p>
          <p className="ad-chapter-break-count">
            {String(chapterBreak).padStart(2, '0')} / {String(QUIZ_CHAPTER_COUNT).padStart(2, '0')}
          </p>
          <p className="ad-chapter-break-hint">選比較接近你的反應就好。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="v2-surface ad-quiz-screen">
      {/* Marquee */}
      <div className="marquee-container ad-marquee-fixed">
        <div className="marquee-track">
          <span className="marquee-text">{MARQUEE.repeat(4)}</span>
          <span className="marquee-text">{MARQUEE.repeat(4)}</span>
        </div>
      </div>

      {/* Topbar */}
      <div className="ad-quiz-topbar">
        <a href={buildV2QuizPath().replace('/quiz', '')} className="ad-quiz-back">← 圖鑑入口</a>
        <span className="ad-quiz-status">照自己的步調回答</span>
      </div>

      {/* Quiz panel */}
      <section className="ad-quiz-panel" aria-label="測驗題目">
        {/* Header */}
        <div className="ad-quiz-header">
          <div>
            <p className="ad-quiz-q-num">QUESTION {String(currentIndex + 1).padStart(2, '0')} / {totalQuestions}</p>
            <h1 className="ad-quiz-lab-title">Kiwimu Lab</h1>
          </div>
        </div>

        {/* Chapter progress */}
        <div className="ad-chapter-block" aria-label={`狀態顯影 ${currentChapter} / ${QUIZ_CHAPTER_COUNT}`}>
          <div className="ad-chapter-head">
            <span className="ad-chapter-avatar" aria-hidden="true">
              {avatar.asset ? (
                <img
                  key={avatar.asset.fullType}
                  src={avatar.asset.avatar.src}
                  width={avatar.asset.avatar.width}
                  height={avatar.asset.avatar.height}
                  alt=""
                  decoding="async"
                  style={{ filter: `blur(${avatar.blur.toFixed(2)}px)` }}
                />
              ) : null}
            </span>
            <span className="ad-chapter-head-text">
              <span className="ad-chapter-row">
                <span className="ad-chapter-label">狀態顯影</span>
                <strong className="ad-chapter-count">
                  {String(currentChapter).padStart(2, '0')} / {String(QUIZ_CHAPTER_COUNT).padStart(2, '0')}
                </strong>
              </span>
            </span>
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
          <p className="ad-chapter-hint">選比較接近你的反應就好。</p>
        </div>

        {/* Question */}
        <div className="ad-question-wrap">
          <h2 aria-live="polite" aria-atomic="true" className={`ad-question-text${isAnimating ? ' is-fading' : ''}`}>
            {question.text}
          </h2>
          <p className="ad-question-hint">兩個都像你時，選最近更常出現的反應。</p>
        </div>

        {errorMessage ? <p className="ad-quiz-error" role="alert">{errorMessage}</p> : null}

        {/* Options */}
        <div className="ad-option-grid">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              type="button"
              className={`ad-option${selectedOption === idx ? ' is-selected' : ''}`}
              aria-pressed={selectedOption === idx}
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
            disabled={currentIndex === 0 || isAnimating || isResolving}
          >
            ← 上一題
          </button>
          <p className="ad-quiz-helper">已完成 {answers.length} / {totalQuestions} 題</p>
        </div>
      </section>
    </div>
  );
}
