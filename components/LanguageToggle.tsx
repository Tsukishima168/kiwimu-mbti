import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <button
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white border border-gray-200 hover:border-kiwi-dark transition-all shadow-sm hover:shadow-md"
            aria-label="Toggle Language"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 group-hover:text-kiwi-dark transition-colors">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                <path d="M2 12h20" />
            </svg>
            <span className="text-xs font-mono font-bold text-gray-600 group-hover:text-kiwi-dark transition-colors tracking-wider">
                {language === 'zh' ? 'EN' : '中'}
            </span>
        </button>
    );
};

export default LanguageToggle;
