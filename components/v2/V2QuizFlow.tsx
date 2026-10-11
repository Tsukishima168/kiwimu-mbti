import React, { lazy, Suspense, useEffect, useState } from 'react';
import { V2_TAIWAN_QUESTIONS } from '../../data/v2TaiwanQuestions.generated';
import { calculateResults, getVariant } from '../../utils/logic';
import { getResultData } from '../../constants';
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
import { clearQuizDraft, loadQuizDraft, saveQuizDraft } from './quizDraft';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './v2-tailwind.css';
import './v2.css';
import './v2-dark.css';

const QUESTIONS = V2_TAIWAN_QUESTIONS;
const QUIZ_CHAPTER_COUNT = 5;

interface V2QuizFlowProps {
  user?: AppUser | null;
}

export default function V2QuizFlow({ user }: V2QuizFlowProps) {
  const [draft, setDraft] = useState(loadQuizDraft);
  const [draftSaved, setDraftSaved] = useState(true);
  const reducedMotion = useReducedMotion();
  const answerTimer = React.useRef<number | null>(null);
  const answering = React.useRef(false);
  const questionHeading = React.useRef<HTMLHeadingElement>(null);
  const active = React.useRef(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Option[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
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

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; if (answerTimer.current !== null) window.clearTimeout(answerTimer.current); };
  }, []);
  useEffect(() => {
    if (started && !isResolving && !handoffPath) {
      answering.current = false;
      questionHeading.current?.focus({ preventScroll: true });
      // Landscape / enlarged text may require document scrolling. Start each
      // question at its heading, rather than leaving it above the viewport.
      const heading = questionHeading.current;
      if (heading) {
        const rail = document.querySelector('.ku-universe-rail');
        const top = Math.max(0, rail?.getBoundingClientRect().bottom ?? 0);
        if (heading.getBoundingClientRect().top < top) {
          heading.scrollIntoView({ block: 'start', behavior: 'instant' });
        }
      }
    }
  }, [started, currentIndex, isResolving, handoffPath]);

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
    clearQuizDraft();
    setDraft(null);
    setAnswers([]);
    setCurrentIndex(0);
    setStarted(true);
    void prepareMbtiAttempt('v2-tw-40');
    trackAction('v2_quiz_flow_start', { quizId: 'v2-tw-40' });
  };

  const handleResume = () => {
    if (!draft) return;
    setAnswers(draft.answers);
    setCurrentIndex(draft.currentIndex);
    setStarted(true);
    void prepareMbtiAttempt('v2-tw-40');
    trackAction('v2_quiz_flow_resume', { answeredCount: draft.answers.length });
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
      // Menu availability is independent of the quiz. The report loads its
      // own current pairing; a slow menu must not hold the result handoff.
      const resultData = getResultData(type, variant);
      if (!active.current) return;
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
      clearQuizDraft();
      // Hand off in-place instead of reloading the page. A full navigation here
      // threw away ~1.65MB of already-parsed JS and put a blank frame between
      // the resolving panel and the report, right at the emotional payoff.
      const reportPath = `${buildV2ReportPath(`${type}-${variant}`)}?source=v2_quiz`;
      window.history.pushState({}, '', reportPath);
      setHandoffPath(reportPath);
    } catch (err) {
      if (!active.current) return;
      console.error('V2QuizFlow: failed to resolve result', err);
      setAnswers(nextAnswers.slice(0, -1));
      setSelectedOption(null);
      answering.current = false;
      setIsResolving(false);
      setErrorMessage('剛才的結果未能儲存。請再選一次最後一題，重新整理結果。');
    }
  };

  const handleOptionSelect = (optionIndex: 0 | 1) => {
    if (!question || answering.current || isAnimating || isResolving) return;
    answering.current = true;
    setSelectedOption(optionIndex);
    setIsAnimating(true);
    const selected: Option = {
      label: question.options[optionIndex].label,
      value: question.options[optionIndex].value,
    };
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    setDraftSaved(saveQuizDraft(nextAnswers));
    trackAction('v2_quiz_flow_answer', {
      questionId: question.questionId,
      index: currentIndex,
      dimension: question.dimension,
      choice: optionIndex === 0 ? 'A' : 'B',
    });
    answerTimer.current = window.setTimeout(() => {
      answerTimer.current = null;
      if (nextAnswers.length === totalQuestions) {
        setIsAnimating(false);
        void finishQuiz(nextAnswers);
        return;
      }
      const nextIndex = currentIndex + 1;
      setSelectedOption(null);
      setCurrentIndex(nextIndex);
      setIsAnimating(false);
      answering.current = false;
    }, reducedMotion ? 0 : 420);
  };

  const handlePrevious = () => {
    if (currentIndex === 0 || answering.current || isAnimating || isResolving) return;
    answering.current = true;
    const previousAnswers = answers.slice(0, -1);
    setAnswers(previousAnswers);
    setDraftSaved(saveQuizDraft(previousAnswers));
    setSelectedOption(null);
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  if (!started) return <div className="v2-app"><V2Welcome onStart={handleStart} resumeCount={draft?.currentIndex} onResume={handleResume} /></div>;

  const resolvingPanel = (
    <div className="v2-surface ad-resolving" role="status" aria-live="polite">
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

  return (
    <div className="v2-surface ad-quiz-screen">
      {/* Topbar */}
      <div className="ad-quiz-topbar">
        <a href={buildV2QuizPath()} className="ad-quiz-back">← 稍後繼續</a>
        <span className="ad-quiz-status">生活反應探索</span>
      </div>

      {/* Quiz panel */}
      <section className="ad-quiz-panel" aria-label="測驗題目">
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
                <span className="ad-quiz-q-num">第 {String(currentIndex + 1).padStart(2, '0')} / {totalQuestions} 題</span>
                <span className="ad-chapter-label">第 {currentChapter} 段 / {QUIZ_CHAPTER_COUNT}</span>
              </span>
            </span>
          </div>
          <div className="ad-chapter-track" role="progressbar" aria-label="作答進度" aria-valuemin={0} aria-valuemax={totalQuestions} aria-valuenow={answers.length}>
            <span className="ad-chapter-fill" style={{ width: `${chapterProgress}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="ad-question-wrap">
          <h2 ref={questionHeading} tabIndex={-1} className="ad-question-text">
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
              <span className="ad-option-badge" aria-hidden="true">{selectedOption === idx ? '✓' : idx === 0 ? 'A' : 'B'}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
        <p className="ad-option-help">點選後會前往下一題；想修改時可回上一題。</p>

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
        {!draftSaved ? <p className="ad-quiz-error" role="status">這個瀏覽器無法保存進度，請保留此分頁直到完成。</p> : null}
      </section>
    </div>
  );
}
