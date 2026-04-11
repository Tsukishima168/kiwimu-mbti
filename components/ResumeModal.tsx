import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ResumeModalProps {
    onResume: () => void;
    onRestart: () => void;
    progress: { currentIndex: number; total: number };
}

export const ResumeModal: React.FC<ResumeModalProps> = ({
    onResume,
    onRestart,
    progress,
}) => {
    const { t } = useLanguage();
    const progressText = t('resume_progress')
        .replace('{current}', String(progress.currentIndex))
        .replace('{total}', String(progress.total));

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-10 rounded-sm max-w-md mx-4 shadow-2xl border border-gray-100">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-serif font-medium text-kiwi-dark mb-3">
                        {t('resume_title')}
                    </h2>
                    <p className="text-gray-600 text-base leading-relaxed">
                        {progressText}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        {t('resume_saved')}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="h-1 bg-gray-100 w-full rounded-full overflow-hidden">
                        <div
                            className="h-full bg-kiwi-dark transition-all duration-500"
                            style={{ width: `${(progress.currentIndex / progress.total) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={onResume}
                        className="flex-1 bg-kiwi-dark text-white py-3.5 px-6 hover:bg-opacity-90 transition-all duration-200 font-medium tracking-wide"
                    >
                        {t('resume_resume')}
                    </button>
                    <button
                        onClick={onRestart}
                        className="flex-1 border-2 border-gray-200 text-gray-700 py-3.5 px-6 hover:border-kiwi-dark hover:text-kiwi-dark transition-all duration-200 font-medium tracking-wide"
                    >
                        {t('resume_restart')}
                    </button>
                </div>

                {/* Hint */}
                <p className="text-xs text-gray-400 text-center mt-5 font-mono tracking-wider">
                    {t('resume_hint')}
                </p>
            </div>
        </div>
    );
};

export default ResumeModal;
