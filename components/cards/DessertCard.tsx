import React from 'react';
import { CardProps } from './Types';
import { buildDessertOrderLink } from '../../utils/utmTracking';

interface DessertCardProps extends CardProps {
    anchor: any;
    displayHook?: string;
    langKey?: 'zh' | 'en' | 'ja' | 'ko';
}

export const DessertCard: React.FC<DessertCardProps> = ({ resultData, identitySuffix, anchor, t, onNext, displayHook, langKey = 'zh' }) => {
    return (
        <div className="w-full h-full flex flex-col bg-white overflow-hidden pb-16">
            <div className="flex-1 overflow-y-auto no-scrollbar relative">

                {/* Full Image Background style or Split style */}
                <div className="w-full h-[40vh] bg-gray-100 relative">
                    <img src={resultData.dessert.imageUrl} alt="Soul Dessert" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-80 mb-2 block">{t('soul_dessert')}</span>
                        <h3 className="text-3xl font-serif font-bold leading-tight">{anchor.name}</h3>
                    </div>
                </div>

                <div className="px-6 py-8">
                    <p className={`font-serif text-lg leading-relaxed text-gray-800 mb-6 text-justify ${langKey === 'ja' || langKey === 'ko' ? 'leading-loose' : ''}`}>
                        {displayHook || anchor.hook}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-8">
                        <span className="px-3 py-1 border border-gray-200 text-gray-500 text-[10px] font-bold tracking-[0.1em] rounded-sm">{t('dessert_series')} {anchor.series}</span>
                        <span className="px-3 py-1 border border-gray-200 text-gray-500 text-[10px] font-bold tracking-[0.1em] rounded-sm">{t('dessert_quad')} {anchor.quad}</span>
                    </div>

                    <div className="border-t border-gray-100 pt-6 mb-8">
                        <p className="text-[10px] font-bold text-gray-400 mb-4 tracking-[0.2em] uppercase">{t('drink_recommend')}</p>

                        <div className={`flex justify-between items-center py-3 border-b border-gray-50 ${identitySuffix === 'A' ? 'text-kiwi-dark font-bold' : 'text-gray-400'}`}>
                            <span className="text-xs tracking-widest">{t('drink_a_best')}</span>
                            <span className="font-serif italic">{anchor.drinkA}</span>
                        </div>

                        <div className={`flex justify-between items-center py-3 ${identitySuffix === 'T' ? 'text-kiwi-dark font-bold' : 'text-gray-400'}`}>
                            <span className="text-xs tracking-widest">{t('drink_t_best')}</span>
                            <span className="font-serif italic">{anchor.drinkT}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <a
                            href={buildDessertOrderLink(resultData.id, identitySuffix)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center bg-kiwi-dark text-white py-4 text-xs font-bold tracking-[0.3em] uppercase hover:bg-gray-800 transition-colors"
                        >
                            {t('book_dessert')}
                        </a>
                        <button
                            onClick={onNext}
                            className="block w-full text-center bg-white border border-gray-200 text-gray-500 py-4 text-xs font-bold tracking-[0.3em] uppercase hover:bg-gray-50 transition-colors"
                        >
                            {t('continue_deep')}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
