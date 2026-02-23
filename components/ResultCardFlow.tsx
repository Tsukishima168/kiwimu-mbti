import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { MbtiResultData, Score } from '../types';
import { calculatePercentages } from '../utils/logic';
import { SOUL_ANCHOR_MAP } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { mbtiReportTranslations } from '../i18n/mbtiReportTranslations';
import { detailsTranslations } from '../i18n/detailsTranslations';
import { trackResultView } from '../utils/analytics';

import { IdentityCard } from './cards/IdentityCard';
import { RadarCard } from './cards/RadarCard';
import { DessertCard } from './cards/DessertCard';
import { RegistrationGateCard } from './cards/RegistrationGateCard';
import { DeepAnalysisCard } from './cards/DeepAnalysisCard';

interface ResultCardFlowProps {
    resultData: MbtiResultData;
    rawScores: Score;
    onRetest: () => void;
    onOpenConsultant: () => void;
    onViewArchive?: () => void;
    isArchiveMode?: boolean;
    user?: User | null;
    onLogin?: () => void;
    onLogout?: () => void;
}

export const ResultCardFlow: React.FC<ResultCardFlowProps> = ({
    resultData,
    rawScores,
    user,
    onLogin,
    isArchiveMode = false,
    onViewArchive
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [hasSkippedGate, setHasSkippedGate] = useState(false);

    const percentages = calculatePercentages(rawScores);
    const resultAT = percentages.A >= percentages.Turbulent ? 'A' : 'T';
    const identitySuffix = resultAT;

    const { language, t } = useLanguage();
    const langKey = (language === 'zh-TW' ? 'zh' : language) as 'zh' | 'en' | 'ja' | 'ko';

    const i18nContent = mbtiReportTranslations[resultData.id]?.[langKey] || mbtiReportTranslations[resultData.id]?.zh;
    const extraI18n = langKey !== 'zh' ? (detailsTranslations[resultData.id]?.[langKey as 'en' | 'ja' | 'ko'] || null) : null;

    const identityLabel = (percentages.A >= percentages.Turbulent)
        ? (t('assertive_label') || '堅定型')
        : (t('turbulent_label') || '動盪型');

    const displayKeywords = (extraI18n as any)?.keywords || resultData.keywords;
    const anchor = SOUL_ANCHOR_MAP[resultData.id] || SOUL_ANCHOR_MAP["ISFP"];

    const displayStrengths = extraI18n ? extraI18n.strengths : resultData.strengths;
    const displayBlindSpots = extraI18n ? extraI18n.blindSpots : resultData.blindSpots;
    const displayCareerStyle = extraI18n ? extraI18n.career.style : resultData.career.style;
    const displayCareerAdvice = extraI18n ? extraI18n.career.advice : resultData.career.advice;
    const displayRelStyle = extraI18n ? extraI18n.relationships.style : (resultData.relationships.romance || resultData.relationships.style);
    const displayRelAdvice = extraI18n ? extraI18n.relationships.advice : resultData.relationships.advice;
    const displayRelStrengths = extraI18n ? extraI18n.relationships.style : (resultData.relationships.strengths || resultData.relationships.style || resultData.relationships.romance);

    // Pick localized hook for DessertCard
    const displayHook = langKey === 'zh'
        ? anchor.hook
        : (anchor[`hook${langKey.charAt(0).toUpperCase() + langKey.slice(1)}`] || anchor.hook);

    useEffect(() => {
        trackResultView(resultData.id, user?.uid);
        window.scrollTo(0, 0);
    }, [resultData.id, user]);

    // Handle Native Web Share API
    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: t('share_title')?.replace('{id}', resultData.id).replace('{suffix}', identitySuffix).replace('{title}', i18nContent.title) || `我是 ${resultData.id}-${identitySuffix}，${i18nContent.title}｜Kiwimu MBTI`,
                    text: t('share_text')?.replace('{dessert}', anchor.name) || `我的靈魂甜點是 ${anchor.name}！來看看你的 Kiwimu 檔案吧✨`,
                    url: `https://kiwimu.com/` // Replace with user-specific share link URL if available later
                });
            } catch (err) {
                console.warn('Share rejected or failed:', err);
            }
        } else {
            // Fallback behavior if needed (e.g. copy link to clipboard)
            navigator.clipboard.writeText(`https://kiwimu.com/`);
            alert(t('share_alert') || '已複製連結');
        }
    };

    // User proposed Card Logic Order: 1. Identity -> 2. Dessert -> 3. Radar -> Gate -> 4. Deep
    const cards = [
        { id: 'identity', component: IdentityCard },
        { id: 'dessert', component: DessertCard },
        { id: 'radar', component: RadarCard },
    ];

    const showRegistrationGate = !user && !hasSkippedGate && !isArchiveMode;

    if (showRegistrationGate) {
        cards.push({ id: 'gate', component: RegistrationGateCard as any });
    }

    if (user || hasSkippedGate || isArchiveMode) {
        cards.push({ id: 'deep_analysis', component: DeepAnalysisCard as any });
    }

    const handleNext = () => {
        if (activeIndex < cards.length - 1) {
            setActiveIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (activeIndex > 0) {
            setActiveIndex(prev => prev - 1);
        }
    };

    const commonProps = {
        resultData,
        rawScores,
        percentages,
        identitySuffix,
        identityLabel,
        t,
        i18nContent,
        extraI18n,
        displayKeywords,
        user,
        onNext: handleNext,
        onPrev: handlePrev,
        onLogin,
        onSkipRegistration: () => setHasSkippedGate(true),
        isArchiveMode,
        anchor,
        displayHook,
        displayStrengths,
        displayBlindSpots,
        displayCareerStyle,
        displayCareerAdvice,
        displayRelStyle,
        displayRelAdvice,
        displayRelStrengths,
        langKey,
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
            {/* Mobile container constraint */}
            <div className="w-full h-full max-w-md mx-auto bg-white relative shadow-2xl overflow-hidden">

                {/* Top Floating Actions (Close Archive, Share) */}
                <div className="absolute top-4 right-4 z-[60] flex gap-2">
                    <button
                        onClick={handleNativeShare}
                        className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center shadow hover:bg-white text-kiwi-dark transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                    </button>

                    {isArchiveMode && onViewArchive && (
                        <button
                            onClick={onViewArchive}
                            className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center shadow hover:bg-white text-kiwi-dark transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    )}
                </div>

                {/* Stories Progress Bar */}
                <div className="absolute top-0 left-0 right-0 z-50 px-2 py-3 flex gap-1 pointer-events-none mix-blend-difference">
                    {cards.map((_, idx) => (
                        <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-white transition-all duration-300 ${idx < activeIndex ? 'w-full' : idx === activeIndex ? 'w-full' : 'w-0'}`}
                            />
                        </div>
                    ))}
                </div>

                {/* Tap/Click Navigation Hitboxes */}
                <div className="absolute inset-x-0 top-16 bottom-24 z-40 flex cursor-pointer">
                    <div className="w-1/3 h-full" onClick={handlePrev} />
                    <div className="w-2/3 h-full" onClick={handleNext} />
                </div>

                {/* CSS Transform Slide Track */}
                <div
                    className="w-full h-full flex transition-transform duration-300 ease-out"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                    {cards.map((card) => {
                        const ActiveComponent = card.component;
                        return (
                            <div key={card.id} className="w-full h-full flex-shrink-0 relative">
                                {/* Pass through pointer events correctly; cards need ptr events for scrolling */}
                                <div className="absolute inset-0 z-30 pointer-events-auto">
                                    <ActiveComponent {...commonProps} />
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default ResultCardFlow;
