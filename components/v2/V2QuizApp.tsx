import React, { useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import { getResultData } from '../../constants';
import { V2_TAIWAN_QUESTIONS, type V2GeneratedQuestion } from '../../data/v2TaiwanQuestions.generated';
import type { Option } from '../../types';
import { calculateResults, getVariant } from '../../utils/logic';
import { loadResultData } from '../../utils/dataLoader';
import { setLastV2PrototypeResult } from '../../utils/v2Access';
import { trackAction } from '../../utils/userDataCollector';
import './v2.css';

interface V2QuizAppProps {
  user?: User | null;
}

type TransitionBeat = {
  step: number;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
};

const TRANSITION_BEATS: TransitionBeat[] = [
  {
    step: 1,
    eyebrow: 'Kiwimu is still here',
    title: '先不用想自己答得對不對。',
    body: 'Kiwimu 不急著幫你下定論。你剛剛選的那些反應，已經很像你平常讓自己撐過一天的方式了。',
    cta: '繼續往下一點',
  },
  {
    step: 2,
    eyebrow: 'A little deeper',
    title: '有些答案不是想出來的。',
    body: '比較像是，你早就習慣這樣理解世界，只是平常不一定會把它說出來。',
    cta: '好，繼續',
  },
  {
    step: 3,
    eyebrow: 'Stay with Kiwimu',
    title: '走到這裡，開始不是表面習慣了。',
    body: '比較像是，你真正會在意什麼，還有你平常怎麼保護那些你很在意的部分。',
    cta: '再往下',
  },
  {
    step: 4,
    eyebrow: 'Almost there',
    title: '接下來會更靠近你藏起來的那一部分。',
    body: '最後這一段會更靠近你沒那麼常說出口的地方。沒關係，不用漂亮，只要誠實。',
    cta: '進入最後一段',
  },
];

const INTRO_PILLS = ['H1 台灣題庫', 'V1 權重邏輯', 'Kiwimu-only', 'DEV ONLY'];
const INTRO_MARQUEE = 'KIWIMU V2 QUIZ PROTOTYPE · TAIWAN EDITION · DEV ONLY · ';
const INTRO_PROMISES = [
  '這裡沒有標準答案，也不需要把自己說得很完整。',
  '如果兩個選項都像你，就選更接近你第一反應的那個。',
  'Kiwimu 不會急著定義你，只會慢慢把你現在的樣子接住。',
];

const buildAnswerOption = (question: V2GeneratedQuestion, optionIndex: 0 | 1): Option => ({
  label: question.options[optionIndex].label,
  value: question.options[optionIndex].value,
});

export default function V2QuizApp({ user }: V2QuizAppProps) {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Option[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [transitionStep, setTransitionStep] = useState<number | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const question = V2_TAIWAN_QUESTIONS[currentIndex];
  const totalQuestions = V2_TAIWAN_QUESTIONS.length;
  const answeredCount = answers.length;
  const overallProgress = started ? Math.max((answeredCount / totalQuestions) * 100, 2.5) : 0;
  const moduleProgress = question ? ((question.id - 1) % 8) + 1 : 1;
  const moduleIndex = question ? Math.floor((question.id - 1) / 8) : 0;
  const currentBeat = transitionStep ? TRANSITION_BEATS.find((beat) => beat.step === transitionStep) || null : null;
  const scoringBank = useMemo(() => V2_TAIWAN_QUESTIONS.map((item) => ({ weight: item.weight })), []);

  const startQuiz = () => {
    setStarted(true);
    trackAction('v2_quiz_start', {
      source: 'v2_dev_quiz',
      locale: 'zh-TW',
      hasUser: Boolean(user && !user.isAnonymous),
    });
  };

  const handleTransitionContinue = () => {
    if (!transitionStep) {
      return;
    }

    trackAction('v2_quiz_transition_continue', {
      module: transitionStep,
      nextQuestion: currentIndex + 1,
    });
    setTransitionStep(null);
  };

  const handlePrevious = () => {
    if (currentIndex === 0 || isAnimating || isResolving || transitionStep) {
      return;
    }

    setAnswers((prev) => prev.slice(0, -1));
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const finishQuiz = async (nextAnswers: Option[]) => {
    setIsResolving(true);
    setErrorMessage(null);

    try {
      const { type, scores } = calculateResults(nextAnswers, scoringBank);
      const variant = getVariant(scores);
      const resultData = await loadResultData(type, variant) || getResultData(type, variant);

      setLastV2PrototypeResult({ resultData, scores });
      trackAction('v2_quiz_complete', {
        mbtiType: type,
        variant,
        source: 'v2_dev_quiz',
      });

      window.location.assign(`/v2?source=v2_quiz&mbti=${type}`);
    } catch (error) {
      console.error('Failed to resolve V2 quiz result:', error);
      setAnswers(nextAnswers.slice(0, -1));
      setErrorMessage('結果同步時出了點小狀況，請再試一次。');
      setIsResolving(false);
    }
  };

  const handleOptionSelect = (optionIndex: 0 | 1) => {
    if (!question || isAnimating || isResolving || transitionStep) {
      return;
    }

    setIsAnimating(true);
    const selectedOption = buildAnswerOption(question, optionIndex);
    const nextAnswers = [...answers, selectedOption];
    setAnswers(nextAnswers);

    trackAction('v2_quiz_answer', {
      questionId: question.questionId,
      index: question.id,
      dimension: question.dimension,
      choice: question.options[optionIndex].id,
    });

    window.setTimeout(() => {
      const nextCount = nextAnswers.length;

      if (nextCount === totalQuestions) {
        setIsAnimating(false);
        void finishQuiz(nextAnswers);
        return;
      }

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      if (nextCount % 8 === 0) {
        const nextStep = nextCount / 8;
        setTransitionStep(nextStep);
        trackAction('v2_quiz_transition_view', {
          module: nextStep,
          nextQuestion: nextIndex + 1,
        });
      }

      setIsAnimating(false);
    }, 280);
  };

  if (!started) {
    return (
      <div className="v2-root min-h-screen px-5 pt-24 pb-16">
        <div className="marquee-container">
          <div className="marquee-track">
            <span className="marquee-text">{INTRO_MARQUEE.repeat(3)}</span>
            <span className="marquee-text">{INTRO_MARQUEE.repeat(3)}</span>
          </div>
        </div>

        <div className="mx-auto max-w-5xl">
          <section className="v2-panel v2-quiz-intro-panel">
            <div>
              <p className="v2-eyebrow">V2 QUIZ PROTOTYPE</p>
              <h1 className="v2-quiz-title mt-4">先把 V2 的答題體驗跑起來</h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-black/72">
                這條 prototype 只給本地端測試。題目來源是台灣版 H1 題庫，判定仍沿用 V1 的權重邏輯；
                前台則只保留 Kiwimu 陪你走完整段體驗。
              </p>
            </div>

            <div className="v2-quiz-intro-meta">
              <div className="v2-quiz-pill-row">
                {INTRO_PILLS.map((pill) => (
                  <span key={pill} className="v2-pill">{pill}</span>
                ))}
              </div>

              <div className="v2-quiz-intro-card">
                <p className="v2-card-eyebrow">THIS ROUND</p>
                <ul className="v2-quiz-intro-list">
                  <li>40 題完整台灣版題組</li>
                  <li>每 8 題一次 Kiwimu 轉場</li>
                  <li>完成後直接接回現有 `/v2` 報告殼</li>
                  <li>不影響 `V1` 正式入口，也不碰 `main`</li>
                </ul>
              </div>

              <div className="v2-quiz-intro-card">
                <p className="v2-card-eyebrow">Kiwimu 想先跟你說</p>
                <ul className="v2-quiz-intro-list">
                  {INTRO_PROMISES.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" className="kiwimu-btn kiwimu-btn-primary" onClick={startQuiz} style={{ color: '#1A1A1A' }}>
                  開始本地 V2 題組
                </button>
                <a href="/v2" className="kiwimu-btn" style={{ color: '#1A1A1A' }}>
                  先回 V2 報告殼
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (transitionStep && currentBeat) {
    return (
      <div className="v2-root min-h-screen px-5 pt-24 pb-16">
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl items-center">
          <section className="v2-panel v2-quiz-transition-panel w-full">
            <p className="v2-eyebrow">{currentBeat.eyebrow}</p>
            <div className="v2-quiz-stage-row mt-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <span
                  key={index}
                  className={index < transitionStep ? 'v2-quiz-stage is-active' : 'v2-quiz-stage'}
                />
              ))}
            </div>
            <h1 className="v2-quiz-title mt-6">{currentBeat.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-black/72">{currentBeat.body}</p>
            <div className="v2-quiz-kiwimu-note mt-8">
              <span className="v2-pill v2-pill-solid">Kiwimu</span>
              <p>你已經走完 {transitionStep * 8} / {totalQuestions} 題，先呼吸一下，再往下一點。</p>
            </div>
            <button type="button" className="kiwimu-btn kiwimu-btn-primary mt-8" onClick={handleTransitionContinue} style={{ color: '#1A1A1A' }}>
              {currentBeat.cta}
            </button>
          </section>
        </div>
      </div>
    );
  }

  if (isResolving) {
    return (
      <div className="v2-root min-h-screen px-5 pt-24 pb-16">
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl items-center">
          <section className="v2-panel v2-quiz-transition-panel v2-quiz-final-panel w-full">
            <p className="v2-eyebrow">FINAL PASS</p>
            <div className="v2-quiz-stage-row mt-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <span key={index} className="v2-quiz-stage is-active" />
              ))}
            </div>
            <h1 className="v2-quiz-title mt-6">差不多了，Kiwimu 正在幫你把這一路的樣子翻開。</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-black/72">
              不是要替你貼標籤，而是把你剛剛那些反應、偏好和藏起來的力道，整理成一份你自己也看得懂的深報告。
            </p>
            <div className="v2-quiz-kiwimu-note mt-8">
              <span className="v2-pill v2-pill-solid">Kiwimu</span>
              <p>再一下下就好。接著你會直接回到 `/v2`，看這次 prototype 跑出的完整結果殼。</p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="v2-root min-h-screen px-5 pt-24 pb-16">
      <div className="mx-auto max-w-5xl">
        <div className="v2-quiz-topbar">
          <a href="/v2" className="v2-quiz-link">← 回 V2 報告殼</a>
          <div className="flex items-center gap-2">
            <span className="v2-pill">DEV ONLY</span>
            <span className="v2-pill">Kiwimu prototype</span>
          </div>
        </div>

        <section className="v2-panel v2-quiz-panel">
          <div className="v2-quiz-header">
            <div>
              <p className="v2-eyebrow">QUESTION {String(question.id).padStart(2, '0')}</p>
              <h1 className="v2-quiz-title-sm mt-3">Kiwimu 正在慢慢看你怎麼理解自己</h1>
            </div>
            <div className="v2-quiz-counter">
              <span>{question.id} / {totalQuestions}</span>
              <span>第 {moduleIndex + 1} 段 / 5</span>
            </div>
          </div>

          <div className="v2-quiz-progress-shell mt-6">
            <div className="v2-quiz-progress-fill" style={{ width: `${overallProgress}%` }} />
          </div>

          <div className="v2-quiz-stage-row mt-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className={index <= moduleIndex ? 'v2-quiz-stage is-active' : 'v2-quiz-stage'}
              />
            ))}
          </div>

          <div className="v2-quiz-question-wrap">
            <div className="v2-quiz-module-chip">這一小段還有 {9 - moduleProgress} 題</div>
            <h2 className={`v2-quiz-question ${isAnimating ? 'is-fading' : ''}`}>{question.text}</h2>
            <p className="v2-quiz-subcopy">先照你的第一個反應回答就好，不需要把自己解釋得很完整。</p>
          </div>

          <div className="v2-quiz-option-grid">
            {question.options.map((option, index) => (
              <button
                key={option.id}
                type="button"
                className="v2-quiz-option"
                onClick={() => handleOptionSelect(index as 0 | 1)}
                disabled={isAnimating || isResolving}
              >
                <span className="v2-quiz-option-badge">{index === 0 ? 'A' : 'B'}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          <div className="v2-quiz-footer">
            <button type="button" className="v2-quiz-link is-button" onClick={handlePrevious} disabled={currentIndex === 0 || isResolving}>
              上一題
            </button>
            <p className="v2-quiz-helper">台灣版 H1 題庫 × V1 權重邏輯 × V2 Kiwimu 轉場 prototype</p>
          </div>

          {isResolving ? (
            <div className="v2-quiz-loading-state">
              <p className="v2-eyebrow">FINAL PASS</p>
              <h3>Kiwimu 想把你一路以來的樣子，慢慢翻給你看。</h3>
              <p>正在整理結果，接著就會回到 `/v2` 深報告殼。</p>
            </div>
          ) : null}

          {errorMessage ? <p className="v2-quiz-error">{errorMessage}</p> : null}
        </section>
      </div>
    </div>
  );
}
