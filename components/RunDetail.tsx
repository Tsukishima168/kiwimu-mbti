import React, { useState } from 'react';
import { TestRun } from '../types';
import { getResultData } from '../constants';
import { CURRENT_DESSERT_VERSION } from '../constants/versions';
import { useLanguage } from '../contexts/LanguageContext';
import Result from './Result';

interface RunDetailProps {
    run: TestRun;
    onBack: () => void;
}

export const RunDetail: React.FC<RunDetailProps> = ({ run, onBack }) => {
    const [viewLatestDessert, setViewLatestDessert] = useState(false);
    const { language, t } = useLanguage();

    const dateLocale = language === 'ja' ? 'ja-JP' : language === 'ko' ? 'ko-KR' : language === 'en' ? 'en-US' : 'zh-TW';

    // Check if dessert catalog has been updated
    const hasNewDessert = run.dessertCatalogVersion !== CURRENT_DESSERT_VERSION;

    // Reconstruct the result data from the saved test run
    const resultData = getResultData(
        run.resultType as any,
        run.suffix
    );

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString(dateLocale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-kiwi-bg">
            {/* Back Button */}
            <div className="max-w-4xl mx-auto px-6 pt-8 pb-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm font-mono text-gray-400 hover:text-kiwi-dark transition-colors tracking-wider uppercase"
                >
                    <span>←</span>
                    <span>{t('detail_back')}</span>
                </button>
            </div>

            {/* Archive Banner */}
            <div className="max-w-4xl mx-auto px-6 pb-6">
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 text-amber-600 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-amber-800">
                                <span className="font-semibold">{t('detail_history')}</span> — {t('detail_completed_at').replace('{date}', formatDate(run.finishedAt))}
                            </p>
                            <p className="text-xs text-amber-700 mt-1 font-mono">
                                {t('detail_version')
                                    .replace('{quiz}', run.quizVersion)
                                    .replace('{dessert}', run.dessertCatalogVersion)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Latest Dessert Notification */}
            {hasNewDessert && (
                <div className="max-w-4xl mx-auto px-6 pb-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 text-purple-500 mt-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-serif font-semibold text-purple-900 mb-2">
                                    {t('detail_new_dessert')}
                                </h3>
                                <p className="text-sm text-purple-800 mb-4 leading-relaxed">
                                    {t('detail_new_dessert_desc').replace('{type}', `${run.resultType}-${run.suffix}`)}
                                </p>
                                {!viewLatestDessert ? (
                                    <button
                                        onClick={() => setViewLatestDessert(true)}
                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                                    >
                                        <span>{t('detail_view_latest')}</span>
                                        <span className="text-lg">→</span>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-purple-700 font-medium">
                                            {t('detail_switched')}
                                        </span>
                                        <button
                                            onClick={() => setViewLatestDessert(false)}
                                            className="text-sm text-purple-600 underline hover:text-purple-800 transition-colors"
                                        >
                                            {t('detail_revert')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Result Display */}
            <Result
                resultData={resultData}
                rawScores={run.scores}
                onRetest={() => { }}
                onOpenConsultant={() => { }}
                isArchiveMode={true}
            />
        </div>
    );
};

export default RunDetail;
