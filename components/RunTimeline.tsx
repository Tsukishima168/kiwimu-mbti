import React from 'react';
import type { AppUser } from '../types';
import { TestRun } from '../types';
import { trackButtonClick } from '../utils/analytics';
import { useLanguage } from '../contexts/LanguageContext';

interface RunTimelineProps {
    runs: TestRun[];
    onSelect: (run: TestRun) => void;
    onBack?: () => void;
    user: AppUser;
}

export const RunTimeline: React.FC<RunTimelineProps> = ({ runs, onSelect, onBack, user }) => {
    const { language, t } = useLanguage();

    const dateLocale = language === 'ja' ? 'ja-JP' : language === 'ko' ? 'ko-KR' : language === 'en' ? 'en-US' : 'zh-TW';

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString(dateLocale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString(dateLocale, {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="mb-12">
                {onBack && (
                    <button
                        onClick={() => { trackButtonClick('back_archive', 'archive_timeline'); onBack(); }}
                        className="mb-6 flex items-center gap-2 text-sm font-mono text-gray-400 hover:text-kiwi-dark transition-colors tracking-wider uppercase"
                    >
                        <span>←</span>
                        <span>{t('archive_back')}</span>
                    </button>
                )}
                <h1 className="text-4xl md:text-5xl font-serif font-medium text-kiwi-dark mb-4">
                    {t('archive_title')}
                </h1>
                <p className="text-gray-600 leading-relaxed">
                    {t('archive_welcome').replace('{name}', user.displayName || 'Explorer')}
                </p>
            </div>

            {/* Empty State */}
            {runs.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                            <path d="M12 22V12" /><path d="M5 12H2a10 10 0 0 0 20 0h-3" /><path d="M8 6a4 4 0 0 1 8 0" /><path d="M5.8 9H2" /><path d="M22 9h-3.8" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-serif text-gray-700 mb-3">{t('archive_empty_title')}</h2>
                    <p className="text-gray-500 mb-8">{t('archive_empty_desc')}</p>
                    {onBack && (
                        <button
                            onClick={() => { trackButtonClick('start_explore_archive', 'archive_empty'); onBack(); }}
                            className="px-8 py-3 bg-kiwi-dark text-white hover:bg-opacity-90 transition-all font-medium tracking-wide"
                        >
                            {t('archive_start_explore')}
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Summary Card */}
                    <div className="mb-10 p-8 bg-white border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-serif font-medium text-kiwi-dark">{t('archive_explore_records')}</h2>
                            <span className="text-sm font-mono text-gray-400 tracking-wider">
                                {t('archive_tests_count').replace('{count}', String(runs.length))}
                            </span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {t('archive_latest_test').replace('{date}', formatDate(runs[0].finishedAt))}{' '}
                            <span className="font-semibold text-kiwi-dark">
                                {runs[0].resultType}-{runs[0].suffix}
                            </span>
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-serif font-medium text-gray-700 mb-6">{t('archive_timeline_title')}</h3>
                        {runs.map((run, index) => (
                            <button
                                key={run.id}
                                onClick={() => onSelect(run)}
                                className="group w-full p-6 bg-white border border-gray-200 hover:border-kiwi-dark hover:shadow-md transition-all duration-300 text-left"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-2xl font-serif font-medium text-kiwi-dark group-hover:text-black transition-colors mb-1">
                                            {run.resultType}-{run.suffix}
                                        </h3>
                                        <p className="text-sm text-gray-500 font-mono tracking-wide">
                                            {formatDate(run.finishedAt)} · {formatTime(run.finishedAt)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {index === 0 && (
                                            <span className="text-xs font-mono bg-kiwi-dark text-white px-3 py-1 tracking-wider">
                                                {t('archive_latest')}
                                            </span>
                                        )}
                                        <span className="text-2xl group-hover:translate-x-1 transition-transform">
                                            →
                                        </span>
                                    </div>
                                </div>

                                {/* Version Info */}
                                <div className="flex gap-2 text-xs text-gray-400 font-mono mt-3">
                                    <span className="px-2 py-1 bg-gray-50 rounded border border-gray-200">
                                        {t('archive_quiz_version').replace('{version}', run.quizVersion)}
                                    </span>
                                    <span className="px-2 py-1 bg-gray-50 rounded border border-gray-200">
                                        {t('archive_dessert_version').replace('{version}', run.dessertCatalogVersion)}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default RunTimeline;
