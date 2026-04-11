import React from 'react';
import { trackLineCTA } from '../utils/analytics';
import { useLanguage } from '../contexts/LanguageContext';

interface LineCTAProps {
    className?: string;
    variant?: 'default' | 'compact';
    mbtiType?: string;
}

// LINE official account URL
const LINE_OFFICIAL_ID = '@kiwimu';
const LINE_ADD_FRIEND_URL = `https://line.me/R/ti/p/${LINE_OFFICIAL_ID}`;

export const LineCTA: React.FC<LineCTAProps> = ({
    className = '',
    variant = 'default',
    mbtiType
}) => {
    const { t } = useLanguage();

    if (variant === 'compact') {
        return (
            <div className={`bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 ${className}`}>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                            {t('line_cta_title')}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                            {t('line_cta_desc')}
                        </p>
                    </div>
                    <a
                        href={LINE_ADD_FRIEND_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-[#00B900] text-white rounded-full font-bold hover:bg-[#00A000] transition-all shadow-md hover:shadow-lg text-sm"
                    >
                        {t('line_cta_join')}
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <a
                href={LINE_ADD_FRIEND_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                    trackLineCTA('minimal', mbtiType);
                }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#00B900] hover:bg-[#00A000] text-white font-bold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 group"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                <span>{t('line_cta_official')}</span>
            </a>
        </div>
    );
};

export default LineCTA;
