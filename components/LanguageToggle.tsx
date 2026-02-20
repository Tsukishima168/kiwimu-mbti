import React from 'react';
import { useLanguage, Language } from '../contexts/LanguageContext';

const LANG_OPTIONS: { value: Language; label: string }[] = [
    { value: 'zh', label: '繁體中文' },
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' }
];

const LanguageToggle: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as Language);
    };

    return (
        <div className="relative inline-flex items-center group">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 text-gray-500 group-hover:text-kiwi-dark pointer-events-none transition-colors">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                <path d="M2 12h20" />
            </svg>
            <select
                value={language}
                onChange={handleChange}
                className="appearance-none bg-white/80 hover:bg-white border border-gray-200 hover:border-kiwi-dark text-gray-700 text-xs font-mono font-bold py-1.5 pl-8 pr-7 rounded-full shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-1 focus:ring-kiwi-dark cursor-pointer tracking-wider"
                aria-label="Select Language"
            >
                {LANG_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 text-gray-500 group-hover:text-kiwi-dark pointer-events-none transition-colors">
                <polyline points="6 9 12 15 18 9" />
            </svg>
        </div>
    );
};

export default LanguageToggle;
