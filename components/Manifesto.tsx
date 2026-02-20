import React, { useState } from 'react';
import { trackButtonClick } from '../utils/analytics';
import SealedEnvelope from './SealedEnvelope';
import { useLanguage } from '../contexts/LanguageContext';

interface ManifestoProps {
    onProceed: () => void;
}

const Manifesto: React.FC<ManifestoProps> = ({ onProceed }) => {
    const [clickCount, setClickCount] = useState(0);
    const [showEasterEgg, setShowEasterEgg] = useState(false);
    const { t } = useLanguage();

    const handleTitleClick = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);
        if (newCount >= 5) {
            setShowEasterEgg(true);
            setClickCount(0); // reset
            trackButtonClick('easter_egg_triggered', 'manifesto');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-kiwi-bg p-8 fade-in relative">
            {showEasterEgg && <SealedEnvelope onClose={() => setShowEasterEgg(false)} />}

            <div className="max-w-xl w-full text-center space-y-12">

                {/* Decorative Header */}
                <div className="space-y-4">
                    <div className="w-12 h-[1px] bg-kiwi-dark mx-auto"></div>
                    <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-gray-400">{t('manifesto_guideline')}</p>
                </div>

                {/* Polished Content */}
                <div className="space-y-8">
                    <h2
                        className="text-2xl md:text-3xl font-serif font-bold text-kiwi-dark leading-snug cursor-pointer select-none"
                        onClick={handleTitleClick}
                        title={t('manifesto_title_hint')}
                    >
                        {t('manifesto_title_1')}<br />{t('manifesto_title_2')}
                    </h2>

                    <div className="space-y-6 text-gray-600 font-serif text-lg leading-relaxed text-center md:text-justify max-w-lg mx-auto">
                        <p>
                            {t('manifesto_desc_1')}
                        </p>
                        <p>
                            {t('manifesto_desc_2')}
                        </p>
                    </div>
                </div>

                {/* Action */}
                <div className="pt-8">
                    <button
                        onClick={() => { trackButtonClick('I am ready', 'manifesto'); onProceed(); }}
                        className="group relative inline-flex items-center justify-center px-16 py-5 border border-black overflow-hidden transition-all hover:bg-black hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-xl"
                    >
                        <span className="relative z-10 text-xs font-bold tracking-[0.3em] uppercase group-hover:text-white transition-colors duration-500 whitespace-nowrap">
                            {t('manifesto_ready')}
                        </span>
                        <div className="absolute inset-0 bg-black translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
                    </button>
                    <p className="mt-8 text-[9px] font-mono text-gray-300 tracking-[0.2em] uppercase">
                        {t('manifesto_time')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Manifesto;
