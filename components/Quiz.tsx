
import React, { useState, useEffect, useMemo } from 'react';
import type { AppUser } from '../types';
import { Option, Question } from '../types';
import { QUESTIONS } from '../constants';
import { loadQuestions } from '../utils/dataLoader';
import { useProgressStorage } from '../hooks/useProgressStorage';
import ResumeModal from './ResumeModal';
import { trackQuizStart, trackQuizProgress, trackQuizComplete, createQuizAbandonGuard, registerQuizAbandonListeners } from '../utils/analytics';
import { useLanguage } from '../contexts/LanguageContext';
import { questionTranslations } from '../i18n/questionsTranslations';
import { useReducedMotion } from '../hooks/useReducedMotion';
import './quiz-ui.css';

interface QuizProps {
    user: AppUser | null;
    onComplete: (answers: Option[]) => void;
    onSaveToCloud?: (answers: Option[], currentIndex: number) => void;
}

const Quiz: React.FC<QuizProps> = ({ user, onComplete, onSaveToCloud }) => {
    const { language, t } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Option[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);
    const [selectedValue, setSelectedValue] = useState<Option['value'] | null>(null);
    const reducedMotion = useReducedMotion();
    const answerTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const answering = React.useRef(false);
    const headingRef = React.useRef<HTMLHeadingElement>(null);
    const [questions, setQuestions] = useState<Question[]>(QUESTIONS); // 預設使用 constants
    const [questionsLoaded, setQuestionsLoaded] = useState(false);

    const { saveProgress, loadProgress, clearProgress } = useProgressStorage();

    // R5: quiz_abandon — fired at most once per quiz attempt, when the page is
    // being unloaded mid-quiz (pagehide), when the tab/app goes to the background
    // (visibilitychange → hidden; mobile app switches often skip pagehide), or when
    // this component unmounts without having reached onComplete (SPA navigation away).
    // If the user returns after hiding the tab we do not resend (acceptable).
    const quizStartTimeRef = React.useRef<number>(Date.now());
    const completedRef = React.useRef(false);
    const answersCountRef = React.useRef(0);
    const abandonGuardRef = React.useRef<ReturnType<typeof createQuizAbandonGuard> | null>(null);
    const questionsLengthRef = React.useRef(questions.length);

    useEffect(() => {
        answersCountRef.current = answers.length;
    }, [answers]);

    useEffect(() => {
        questionsLengthRef.current = questions.length;
    }, [questions.length]);

    // Registered once on mount ([] deps) — questions.length is read from a ref,
    // not a dependency, so the async question-set load (loadQuestions() → a
    // later setQuestions) does not re-run this effect and fire a false
    // quiz_abandon via the cleanup path.
    useEffect(() => {
        const guard = createQuizAbandonGuard({
            isCompleted: () => completedRef.current,
            getAnsweredCount: () => answersCountRef.current,
            getTotalQuestions: () => questionsLengthRef.current,
            getStartTime: () => quizStartTimeRef.current,
        });
        abandonGuardRef.current = guard;
        const cleanup = registerQuizAbandonListeners(guard, window, document);
        return () => {
            cleanup();
            abandonGuardRef.current = null;
        };
    }, []);

    // 載入題目（優先從 Supabase，中文版例外則鎖定 V1）
    useEffect(() => {
        const fetchQuestions = async () => {
            // 如果是中文版，鎖定使用 constants.ts 中的 QUESTIONS (V1)
            if (language === 'zh') {
                setQuestions(QUESTIONS);
                setQuestionsLoaded(true);
                return;
            }

            const loadedQuestions = await loadQuestions();
            if (loadedQuestions && loadedQuestions.length > 0) {
                setQuestions(loadedQuestions);
            }
            setQuestionsLoaded(true);
        };
        fetchQuestions();
    }, [language]);

    const currentQuestion: Question | undefined = questions[currentIndex];
    const progress = questionsLoaded && currentQuestion ? (answers.length / questions.length) * 100 : 0;
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const rawV15Result = urlParams?.get('v15_result') || '';
    const v15Result = /^[A-Z]{4}-[AT]$/.test(rawV15Result) ? rawV15Result : null;
    const shouldShowV15Banner = urlParams?.get('source') === 'v15_quiz' && Boolean(v15Result);
    useEffect(() => () => { if (answerTimer.current !== null) clearTimeout(answerTimer.current); }, []);
    useEffect(() => {
        if (questionsLoaded && !showResumeModal) headingRef.current?.focus({ preventScroll: true });
    }, [currentIndex, questionsLoaded, showResumeModal]);

    const getQuestionText = (q: Question) => {
        if (language === 'zh') return q.text;
        return questionTranslations[q.id]?.[language]?.text || q.text;
    };

    const getOptionLabel = (qId: number, option: Option) => {
        if (language === 'zh') return option.label;
        return questionTranslations[qId]?.[language]?.options[option.value as string] || option.label;
    };

    // Track quiz start and check for existing progress on mount
    useEffect(() => {
        // Track quiz start
        const urlParams = new URLSearchParams(window.location.search);
        const source = urlParams.get('source') || urlParams.get('utm_source');
        const campaignId = urlParams.get('campaign') || urlParams.get('utm_campaign');
        trackQuizStart(source || undefined, campaignId || undefined);

        const saved = loadProgress();
        if (saved) {
            setAnswers(saved.answers);
            setCurrentIndex(saved.currentIndex);
            // Ask before resuming a longer session; show its actual saved count.
            setShowResumeModal(saved.answers.length >= 10);
        }
    }, [loadProgress]);

    // Image Preloading Logic - Enhanced to preload 2 images ahead
    useEffect(() => {
        setImageLoaded(false);
        setImageFailed(false);
        const imagesToPreload = [
            QUESTIONS[currentIndex]?.imageUrl,
            QUESTIONS[currentIndex + 1]?.imageUrl,
            QUESTIONS[currentIndex + 2]?.imageUrl
        ].filter(Boolean);

        imagesToPreload.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }, [currentIndex]);

    // Auto-save progress after each answer (local + cloud)
    useEffect(() => {
        if (answers.length > 0) {
            // Save to local storage
            saveProgress(answers, currentIndex);

            // Save to cloud if user is logged in
            if (user && onSaveToCloud) {
                onSaveToCloud(answers, currentIndex);
            }
        }
    }, [answers, currentIndex, user]);

    // 隨機洗牌邏輯
    const shuffledOptions = useMemo(() => {
        return [...(currentQuestion?.options ?? [])].sort(() => Math.random() - 0.5);
    }, [currentQuestion]);

    const handleResume = () => {
        const saved = loadProgress();
        if (saved) {
            setAnswers(saved.answers);
            setCurrentIndex(saved.currentIndex);
        }
        setShowResumeModal(false);
    };

    const handleRestart = () => {
        clearProgress();
        setAnswers([]);
        setCurrentIndex(0);
        setShowResumeModal(false);
        // New attempt: re-arm quiz_abandon and restart its timer.
        abandonGuardRef.current?.reset();
        answersCountRef.current = 0;
        quizStartTimeRef.current = Date.now();
        completedRef.current = false;
    };

    const handleOptionSelect = (option: Option) => {
        if (answering.current || isAnimating || showResumeModal) return;
        answering.current = true;
        setSelectedValue(option.value);
        setIsAnimating(true);

        const newAnswers = [...answers, option];
        setAnswers(newAnswers);

        // Track progress
        trackQuizProgress(currentIndex + 1, questions.length);

        answerTimer.current = setTimeout(() => {
            answerTimer.current = null;
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setIsAnimating(false);
                setSelectedValue(null);
                answering.current = false;
            } else {
                clearProgress(); // Clear progress when quiz is completed
                completedRef.current = true; // Prevents a false quiz_abandon on unmount
                onComplete(newAnswers);
            }
        }, reducedMotion ? 0 : 600);
    };

    const handlePrevious = () => {
        if (currentIndex === 0 || answering.current || isAnimating) return;
        setCurrentIndex(prev => prev - 1);
        setAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers.pop();
            return newAnswers;
        });
    };

    return (
        <>
            {showResumeModal && (
                <ResumeModal
                    onResume={handleResume}
                    onRestart={handleRestart}
                    progress={{ currentIndex: answers.length, total: questions.length }}
                />
            )}

            <div className="classic-quiz flex flex-col min-h-screen bg-kiwi-bg">
                {/* Header */}
                <div className="fixed top-[var(--ku-rail-height)] left-0 right-0 z-50 bg-kiwi-bg/95 backdrop-blur-sm">
                    <div className="max-w-3xl mx-auto px-6 h-20 flex items-end justify-between pb-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-sm font-serif font-bold text-kiwi-dark tracking-[0.08em] uppercase">
                                Kiwimu Lab
                            </h1>
                            {currentIndex > 0 && (
                                <button
                                    onClick={handlePrevious}
                                    disabled={isAnimating}
                                    className="min-h-11 px-2 text-sm text-gray-600 hover:text-kiwi-dark transition-colors tracking-wide uppercase disabled:opacity-40"
                                >
                                    ← {t('quiz_previous')}
                                </button>
                            )}
                        </div>
                        <span className="text-xs font-mono text-gray-400 tracking-wider">
                            {questionsLoaded && currentQuestion ? `${currentIndex + 1} / ${questions.length}` : t('quiz_loading')}
                        </span>
                    </div>
                    <div className="h-[2px] bg-gray-100 w-full" role="progressbar" aria-label={t('resume_progress').replace('{current}', String(answers.length)).replace('{total}', String(questions.length))} aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={answers.length}>
                        <div
                            className="h-full bg-kiwi-dark transition-[width] duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col pt-24 pb-12 px-6 justify-center">
                    <div className="max-w-2xl mx-auto w-full">
                        {shouldShowV15Banner && (
                            <div className="mb-8 border border-kiwi-dark bg-white px-5 py-4 shadow-sm">
                                <p className="text-xs font-mono font-bold uppercase tracking-wide text-gray-600">
                                    V1.5 初判結果
                                </p>
                                <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                                    你剛剛的快速探索偏向 <span className="font-mono font-bold text-kiwi-dark">{v15Result}</span>。接下來是 V1 的 40 題免費測驗；結果也會提供 V2 敘事報告的入口。
                                </p>
                            </div>
                        )}
                        {!questionsLoaded || !currentQuestion ? (
                            <div className="text-center py-20" role="status">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kiwi-dark mx-auto mb-4"></div>
                                <p className="text-gray-500">{t('quiz_loading_questions')}</p>
                            </div>
                        ) : (
                            <div className="classic-quiz-question" aria-busy={isAnimating}>

                                {/* Atmospheric Image Block */}
                                {!imageFailed ? <div className="classic-quiz-image w-full aspect-[21/9] mb-10 relative overflow-hidden bg-gray-100" aria-hidden="true">
                                    {!imageLoaded && (
                                        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                                    )}
                                    <img
                                        src={currentQuestion.imageUrl}
                                        alt=""
                                        width={840}
                                        height={360}
                                        onLoad={() => setImageLoaded(true)}
                                        onError={() => setImageFailed(true)}
                                        className={`w-full h-full object-cover grayscale opacity-90 transition-all duration-500 ease-out hover:scale-105 ${imageLoaded ? 'opacity-90' : 'opacity-0'}`}
                                    />
                                    <div className="absolute inset-0 border border-black/5 pointer-events-none"></div>
                                </div> : null}

                                {/* Text Area */}
                                <div className="mb-12 md:mb-16">
                                    <h2 ref={headingRef} tabIndex={-1} className="text-xl md:text-3xl font-serif font-medium text-kiwi-dark text-center leading-relaxed tracking-wide">
                                        {getQuestionText(currentQuestion)}
                                    </h2>
                                </div>

                                {/* Options Area */}
                                <div className="grid gap-5 max-w-xl mx-auto mb-16">
                                    {shuffledOptions.map((option, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            disabled={isAnimating}
                                            aria-pressed={selectedValue === option.value}
                                            onClick={() => handleOptionSelect(option)}
                                            className="classic-quiz-option group relative w-full p-6 md:p-8 text-center border border-gray-200 hover:border-kiwi-dark hover:bg-white transition-colors duration-200 bg-white/50"
                                        >
                                            <span aria-hidden="true" className="absolute top-4 left-4 text-xs font-mono text-gray-500 group-hover:text-kiwi-dark transition-colors uppercase tracking-wide">
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span className="block text-base md:text-lg text-gray-700 font-light leading-relaxed group-hover:text-black group-hover:font-normal transition-all">
                                                {getOptionLabel(currentQuestion.id, option)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Quiz;
