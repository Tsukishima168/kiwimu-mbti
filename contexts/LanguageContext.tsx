// Language Context for i18n support
import React, { createContext, useContext, useState, useEffect } from 'react';
import { resultTranslations, TranslationKey } from '../i18n/resultTranslations';

export type Language = 'zh' | 'en' | 'ja' | 'ko';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('zh');

    useEffect(() => {
        // Load language preference from localStorage
        const savedLang = localStorage.getItem('kiwimu_language') as Language;
        if (savedLang === 'zh' || savedLang === 'en' || savedLang === 'ja' || savedLang === 'ko') {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('kiwimu_language', lang);
    };

    const t = (key: TranslationKey): string => {
        // 從翻譯字典中取得對應語系的字串，若無則降級為英文，再無則回傳 key 本身
        const langDict = resultTranslations[language] as Record<string, string>;
        const enDict = resultTranslations['en'] as Record<string, string>;

        if (langDict && langDict[key]) {
            return langDict[key];
        }
        if (enDict && enDict[key]) {
            return enDict[key];
        }
        return key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
