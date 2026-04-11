
import React, { useState, useEffect, useMemo } from 'react';
import type { AppUser } from '../types';
import { Option, Question } from '../types';
import { QUESTIONS } from '../constants';
import { loadQuestions } from '../utils/dataLoader';
import { useProgressStorage } from '../hooks/useProgressStorage';
import ResumeModal from './ResumeModal';
import { trackQuizStart, trackQuizProgress, trackQuizComplete } from '../utils/analytics';
import { useLanguage } from '../contexts/LanguageContext';
import { questionTranslations } from '../i18n/questionsTranslations';

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
    const [questions, setQuestions] = useState<Question[]>(QUESTIONS); // 預設使用 constants
    const [questionsLoaded, setQuestionsLoaded] = useState(false);

    const { hasProgress, saveProgress, loadProgress, clearProgress } = useProgressStorage();

    // 載入題目（優先從 Supabase，中文版例外則鎖定 V1）
    useEffect(() => {
        const fetchQuestions = async () => {
            // 如果是中文版，鎖定使用 constants.ts 中的 QUESTIONS (V1)
            if (language === 'zh' || language === 'zh-TW') {
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
    const progress = questionsLoaded && currentQuestion ? ((currentIndex + 1) / questions.length) * 100 : 0;

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

        if (hasProgress) {
            const saved = loadProgress();
            // Only show resume modal if user has answered at least 10 questions (25% progress)
            if (saved && saved.answers.length >= 10) {
                setShowResumeModal(true);
            } else if (saved) {
                // Silently restore progress without modal if less than 10 questions
                setAnswers(saved.answers);
                setCurrentIndex(saved.currentIndex);
            }
        }
    }, []);

    // Image Preloading Logic - Enhanced to preload 2 images ahead
    useEffect(() => {
        setImageLoaded(false);
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
        return [...currentQuestion.options].sort(() => Math.random() - 0.5);
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
    };

    const handleOptionSelect = (option: Option) => {
        if (isAnimating) return;
        setIsAnimating(true);

        const newAnswers = [...answers, option];
        setAnswers(newAnswers);

        // Track progress
        trackQuizProgress(currentIndex + 1, questions.length);

        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setIsAnimating(false);
            } else {
                clearProgress(); // Clear progress when quiz is completed
                onComplete(newAnswers);
            }
        }, 600);
    };

    const handlePrevious = () => {
        if (currentIndex === 0 || isAnimating) return;
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

            <div className="flex flex-col min-h-screen bg-kiwi-bg">
                {/* Header */}
                <div className="fixed top-0 left-0 right-0 z-50 bg-kiwi-bg/95 backdrop-blur-sm">
                    <div className="max-w-3xl mx-auto px-6 h-20 flex items-end justify-between pb-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-sm font-display font-bold text-kiwi-dark tracking-[0.2em] uppercase">
                                Kiwimu Lab
                            </h1>
                            {currentIndex > 0 && (
                                <button
                                    onClick={handlePrevious}
                                    className="text-xs text-gray-400 hover:text-kiwi-dark transition-colors tracking-wider uppercase"
                                >
                                    ← {t('quiz_previous')}
                                </button>
                            )}
                        </div>
                        <span className="text-xs font-mono text-gray-400 tracking-wider">
                            {questionsLoaded && currentQuestion ? `${currentIndex + 1} / ${questions.length}` : t('quiz_loading')}
                        </span>
                    </div>
                    <div className="h-[1px] bg-gray-100 w-full">
                        <div
                            className="h-full bg-kiwi-dark transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col pt-24 pb-12 px-6 justify-center">
                    <div className="max-w-2xl mx-auto w-full">
                        {!questionsLoaded || !currentQuestion ? (
                            <div className="text-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kiwi-dark mx-auto mb-4"></div>
                                <p className="text-gray-500">{t('quiz_loading_questions')}</p>
                            </div>
                        ) : (
                            <div className={`transition-all duration-500 transform ${isAnimating ? 'opacity-0 translate-y-[-10px]' : 'opacity-100 translate-y-0'}`}>

                                {/* Atmospheric Image Block */}
                                <div className="w-full aspect-[21/9] mb-10 relative overflow-hidden bg-gray-100">
                                    {!imageLoaded && (
                                        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                                    )}
                                    <img
                                        src={currentQuestion.imageUrl}
                                        alt="Atmosphere"
                                        onLoad={() => setImageLoaded(true)}
                                        className={`w-full h-full object-cover grayscale opacity-90 transition-all duration-500 ease-out hover:scale-105 ${imageLoaded ? 'opacity-90' : 'opacity-0'}`}
                                    />
                                    <div className="absolute inset-0 border border-black/5 pointer-events-none"></div>
                                </div>

                                {/* Text Area */}
                                <div className="mb-12 md:mb-16">
                                    <h2 className="text-xl md:text-3xl font-serif font-medium text-kiwi-dark text-center leading-relaxed tracking-wide">
                                        {getQuestionText(currentQuestion)}
                                    </h2>
                                </div>

                                {/* Options Area */}
                                <div className="grid gap-5 max-w-xl mx-auto mb-16">
                                    {shuffledOptions.map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionSelect(option)}
                                            className="group relative w-full p-6 md:p-8 text-center border border-gray-200 hover:border-kiwi-dark hover:bg-white transition-all duration-300 active:scale-[0.99] hover:scale-[1.01] hover:shadow-xl bg-white/50"
                                        >
                                            <span className="absolute top-4 left-4 text-[10px] font-mono text-gray-300 group-hover:text-kiwi-dark transition-colors uppercase tracking-widest">
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
