import React from 'react';
import { CardProps } from './Types';
import { MBTI_BG_COLORS } from '../../constants';

interface IdentityCardProps extends CardProps {
    langKey?: 'zh' | 'en' | 'ja' | 'ko';
}

export const IdentityCard: React.FC<IdentityCardProps> = ({ resultData, identitySuffix, identityLabel, t, i18nContent, displayKeywords, langKey = 'zh' }) => {
    const needsLooseLeading = langKey === 'ja' || langKey === 'ko';
    return (
        <div className="w-full h-full flex flex-col bg-white overflow-hidden pb-16">
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {/* Top Header / Language is handled in the parent container now, or we just show MBTI Type */}
                <div className="text-center pt-8 pb-4">
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-black tracking-tighter mb-2 leading-none">
                        {resultData.id}-{identitySuffix}
                    </h1>
                    <h2 className={`text-xl md:text-2xl font-light text-black font-serif italic ${langKey === 'en' ? 'tracking-[0.1em]' : langKey === 'ja' || langKey === 'ko' ? 'tracking-normal' : 'tracking-[0.2em]'}`}>{i18nContent.title}</h2>
                </div>

                {/* Character Image */}
                <div
                    className="w-full max-w-sm mx-auto aspect-[3/4] relative border border-gray-100 shadow-xl"
                    style={{ backgroundColor: MBTI_BG_COLORS[resultData.id] ?? '#f5f5f5' }}
                >
                    <img src={resultData.characterImage} alt={resultData.id} className="w-full h-full object-cover" />
                </div>

                {/* Identity Details */}
                <div className="px-6 py-8 text-center max-w-md mx-auto">
                    <div className="mb-6 flex justify-between items-end border-t border-gray-100 pt-6">
                        <div className="space-y-1 text-left">
                            <p className="text-[10px] font-bold tracking-[0.2em] text-gray-300 uppercase">IDENTITY</p>
                            <p className="text-sm font-display font-bold text-kiwi-dark tracking-widest italic uppercase">{identityLabel} ({identitySuffix})</p>
                        </div>
                    </div>

                    <div className="mb-8 text-left">
                        <span className="text-[10px] font-bold tracking-[0.3em] border-b-2 border-kiwi-dark pb-2 mb-4 inline-block uppercase text-gray-400">{t('core_essence')}</span>
                        <p className={`text-gray-800 font-serif text-lg font-medium ${needsLooseLeading ? 'leading-loose' : 'leading-relaxed'}`}>{i18nContent.coreAnalysis}</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                        {displayKeywords.map((k: string) => (
                            <span key={k} className="px-3 py-1 border border-gray-200 text-gray-400 text-[10px] tracking-[0.2em] uppercase font-bold">{k}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer prompt to swipe / tap next */}
            <div className="absolute bottom-6 left-0 right-0 text-center animate-pulse pointer-events-none">
                <p className="text-[10px] font-bold tracking-[0.4em] text-gray-400 uppercase">Tap right to continue</p>
            </div>
        </div>
    );
};
