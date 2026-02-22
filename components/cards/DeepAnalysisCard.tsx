import React from 'react';
import { CardProps } from './Types';
import { getRarityData, getRarityLabel, getRarityMessage } from '../../data/rarityData';
import { getCelebrityArchetypes } from '../../data/celebrityData';

interface DeepAnalysisProps extends CardProps {
    displayStrengths: string[];
    displayBlindSpots: string[];
    displayCareerStyle: string;
    displayCareerAdvice: string;
    displayRelStyle: string;
    displayRelAdvice: string;
    displayRelStrengths: string;
}

export const DeepAnalysisCard: React.FC<DeepAnalysisProps> = ({
    resultData,
    identitySuffix,
    t,
    displayStrengths,
    displayBlindSpots,
    displayCareerStyle,
    displayCareerAdvice,
    displayRelStyle,
    displayRelAdvice,
    displayRelStrengths,
}) => {
    const rarityData = getRarityData(resultData.id);
    const rarityMessage = rarityData ? getRarityMessage(rarityData.rank) : '';
    const archetypes = getCelebrityArchetypes(resultData.id);

    return (
        <div className="w-full h-full flex flex-col bg-white overflow-hidden pb-16">
            <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">

                {/* Header */}
                <div className="px-6 pt-10 pb-8 border-b border-gray-100 bg-[#f8f5f0]">
                    <h2 className="text-3xl font-display font-bold text-kiwi-dark tracking-widest uppercase mb-2">Deep Dive</h2>
                    <p className="text-gray-500 font-serif text-sm">{t('deep_analysis_unlock')}</p>
                </div>

                {/* 1. Life Insights: Career */}
                <div className="px-6 py-10 border-b border-gray-100">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-4xl font-display font-bold text-gray-100">01</span>
                        <div>
                            <h3 className="text-xl font-display font-bold text-kiwi-dark tracking-widest uppercase">Career</h3>
                            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{t('career_strategy')}</p>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="border-l-2 border-kiwi-dark pl-4">
                            <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">{t('work_style')}</h4>
                            <p className="text-base font-serif text-gray-800 leading-relaxed text-justify">{displayCareerStyle}</p>
                        </div>
                        <div className="border-l-2 border-kiwi-dark pl-4">
                            <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">{t('strategic_advice')}</h4>
                            <p className="text-base font-serif text-gray-600 leading-relaxed italic text-justify">{displayCareerAdvice}</p>
                        </div>
                    </div>
                </div>

                {/* 2. Life Insights: Relationships */}
                <div className="px-6 py-10 border-b border-gray-100">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-4xl font-display font-bold text-gray-100">02</span>
                        <div>
                            <h3 className="text-xl font-display font-bold text-kiwi-dark tracking-widest uppercase">Relationships</h3>
                            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{t('relationship_philosophy')}</p>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="border-l-2 border-kiwi-dark pl-4">
                            <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">{t('love_philosophy')}</h4>
                            <p className="text-base font-serif text-gray-800 leading-relaxed text-justify">{displayRelStyle}</p>
                        </div>
                        <div className="border-l-2 border-kiwi-dark pl-4">
                            <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">{t('navigational_advice')}</h4>
                            <p className="text-base font-serif text-gray-600 leading-relaxed italic text-justify">{displayRelAdvice}</p>
                        </div>
                    </div>
                </div>

                {/* 3. Strengths & Blind Spots */}
                <div className="px-6 py-10 border-b border-gray-100 bg-gray-50/50">
                    <div className="mb-10">
                        <h4 className="text-2xl font-serif font-bold text-kiwi-dark mb-6 border-l-4 border-kiwi-dark pl-4">{t('strengths_title')}</h4>
                        <ul className="space-y-4">
                            {displayStrengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-4 text-gray-700 font-serif">
                                    <span className="text-[10px] text-gray-300 font-bold mt-1">0{i + 1}.</span>
                                    <span className="text-base leading-snug">{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-2xl font-serif font-bold text-gray-400 mb-6 border-l-4 border-gray-200 pl-4">{t('blind_spots_title')}</h4>
                        <ul className="space-y-4">
                            {displayBlindSpots.map((s, i) => (
                                <li key={i} className="flex items-start gap-4 text-gray-400 font-serif opacity-80">
                                    <span className="text-[10px] text-gray-200 font-bold mt-1">0{i + 1}.</span>
                                    <span className="text-base leading-snug">{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 4. Rarity */}
                {rarityData && (
                    <div className="px-6 py-12 border-b border-gray-100 text-center">
                        <p className="text-sm font-serif text-gray-800 mb-4">{t('appearance_rate')}</p>
                        <div className="text-5xl font-display font-bold text-kiwi-dark mb-2">{rarityData.totalPopulation}%</div>
                        <div className="inline-block px-4 py-1 bg-gray-50 border border-gray-200 rounded-full mb-6">
                            <span className="text-[10px] text-gray-500 tracking-wider">
                                {t('rarity_rank')}：{rarityData.rank} / 16
                            </span>
                        </div>
                        <p className="text-lg font-serif text-kiwi-dark mb-8">{rarityMessage}</p>

                        <div className="grid grid-cols-2 gap-4 max-w-[200px] mx-auto text-left">
                            <div className="border-l-2 border-kiwi-dark pl-3">
                                <p className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mb-1">{t('male')}</p>
                                <p className="text-2xl font-display font-bold text-gray-700">{rarityData.male}%</p>
                            </div>
                            <div className="border-l-2 border-kiwi-dark pl-3">
                                <p className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mb-1">{t('female')}</p>
                                <p className="text-2xl font-display font-bold text-gray-700">{rarityData.female}%</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. Archetypes */}
                {archetypes.length > 0 && (
                    <div className="px-6 py-12 border-b border-gray-100 bg-[#f8f5f0]">
                        <h3 className="text-center text-[10px] font-bold tracking-[0.5em] uppercase text-gray-400 mb-8">{t('archetypes')}</h3>
                        <div className="space-y-6">
                            {archetypes.map((archetype, index) => (
                                <div key={index} className="bg-white p-6 border border-gray-200 shadow-sm">
                                    <h4 className="text-lg font-serif font-bold text-kiwi-dark">{archetype.name}</h4>
                                    <p className="text-[10px] text-gray-400 tracking-wider uppercase mb-4">{archetype.profession}</p>
                                    <ul className="space-y-2">
                                        {archetype.resonanceTraits.map((trait, i) => (
                                            <li key={i} className="text-sm font-serif text-gray-700 leading-relaxed flex gap-2">
                                                <span className="text-kiwi-dark">•</span>{trait}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 6. Soul Reflection */}
                <div className="px-6 py-16 text-center">
                    <h3 className="text-center text-[10px] font-bold tracking-[0.5em] uppercase text-gray-400 mb-10">{t('soul_reflection')}</h3>
                    <div className="space-y-6">
                        {resultData.soulQuestions.map((q, idx) => (
                            <div key={idx} className="bg-white border border-gray-100 p-6 flex flex-col items-center">
                                <span className="text-3xl font-display font-bold text-gray-100 mb-2 pl-2">0{idx + 1}</span>
                                <p className="text-base font-serif leading-relaxed italic text-gray-800">{q}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 7. Closing Quote */}
                <div className="px-6 py-20 text-center bg-white border-t border-gray-100">
                    <div className="text-gray-100 text-[80px] font-display opacity-40 mb-[-40px] select-none font-bold block">“</div>
                    <h2 className="text-xl font-serif font-bold text-kiwi-dark leading-snug italic relative z-10">
                        {t('closing_quote')}
                    </h2>
                    <div className="text-gray-100 text-[80px] font-display opacity-40 mt-[-20px] select-none font-bold block">”</div>

                    <div className="mt-16 mb-8 text-center">
                        <p className="text-[10px] text-gray-400 tracking-widest font-bold uppercase mb-4">You have reached the end.</p>
                    </div>
                </div>

            </div>
        </div>
    );
};
