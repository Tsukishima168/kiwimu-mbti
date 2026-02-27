import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { TestRun } from '../types';
import { useFirestoreSync } from '../hooks/useFirestoreSync';
import { trackButtonClick } from '../utils/analytics';
import { useLanguage } from '../contexts/LanguageContext';
import RunTimeline from './RunTimeline';
import RunDetail from './RunDetail';
import Comparison from './Comparison';
import TestStats from './TestStats';
import UserSettings from './UserSettings';
import ExploreMore from './ExploreMore';

interface MyArchiveProps {
    user: User;
    onBack?: () => void;
}

type ViewMode = 'timeline' | 'comparison' | 'detail' | 'stats' | 'settings' | 'explore';

export const MyArchive: React.FC<MyArchiveProps> = ({ user, onBack }) => {
    const [testRuns, setTestRuns] = useState<TestRun[]>([]);
    const [selectedRun, setSelectedRun] = useState<TestRun | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('timeline');

    const { getUserTestRuns } = useFirestoreSync(user);
    const { t } = useLanguage();

    useEffect(() => {
        const loadTestRuns = async () => {
            setLoading(true);
            const runs = await getUserTestRuns();
            setTestRuns(runs);
            setLoading(false);
        };

        if (user) {
            loadTestRuns();
        }
    }, [user]);

    const handleSelectRun = (run: TestRun) => {
        setSelectedRun(run);
        setViewMode('detail');
    };

    const handleBackToTimeline = () => {
        setSelectedRun(null);
        setViewMode('timeline');
    };

    const handleViewChange = (view: ViewMode) => {
        setViewMode(view);
        setSelectedRun(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-kiwi-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-8 h-8 border-2 border-kiwi-dark border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 font-mono text-sm tracking-wider">{(t as any).archive_loading}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-kiwi-bg">
            {/* Settings View */}
            {viewMode === 'settings' && (
                <UserSettings user={user} onBack={() => handleViewChange('timeline')} />
            )}

            {/* Detail View */}
            {viewMode === 'detail' && selectedRun ? (
                <RunDetail run={selectedRun} onBack={handleBackToTimeline} />
            ) : viewMode !== 'settings' ? (
                <>
                    {/* Moon Island Cross-Site Link */}
                    {testRuns.length > 0 && (
                        <div className="max-w-4xl mx-auto px-6 pt-12 pb-6">
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 md:p-8 shadow-lg">
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-2xl">🏝️</span>
                                            <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-800">{(t as any).island_link_title}</h3>
                                        </div>
                                        <p className="text-sm md:text-base text-gray-600 mb-2">
                                            {(t as any).island_link_synced}
                                        </p>
                                        <p className="text-xs md:text-sm text-gray-500">
                                            {(t as any).island_link_desc}
                                        </p>
                                    </div>
                                    <a
                                        href={`https://map.kiwimu.com/?mbti=${testRuns[0]?.result || ''}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => trackButtonClick('island_link', 'archive_cross_site', 'https://map.kiwimu.com/')}
                                        className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:from-amber-500 hover:via-yellow-500 hover:to-orange-500 text-gray-900 font-bold text-base md:text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
                                    >
                                        <span className="text-xl">🍰</span>
                                        <span>{(t as any).island_link_btn}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform duration-300">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Navigation */}
                    {testRuns.length > 0 && (
                        <div className="max-w-4xl mx-auto px-6 pt-6 pb-6">
                            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
                                <button
                                    onClick={() => { trackButtonClick('timeline', 'archive_tabs'); handleViewChange('timeline'); }}
                                    className={`flex-shrink-0 px-6 py-3 font-serif text-lg font-medium transition-all ${viewMode === 'timeline'
                                        ? 'text-kiwi-dark border-b-2 border-kiwi-dark'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {(t as any).tab_timeline}
                                </button>
                                <button
                                    onClick={() => { trackButtonClick('comparison', 'archive_tabs'); handleViewChange('comparison'); }}
                                    disabled={testRuns.length < 2}
                                    className={`flex-shrink-0 px-6 py-3 font-serif text-lg font-medium transition-all ${viewMode === 'comparison'
                                        ? 'text-kiwi-dark border-b-2 border-kiwi-dark'
                                        : testRuns.length < 2
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {(t as any).tab_comparison}
                                    {testRuns.length < 2 && (
                                        <span className="ml-2 text-xs">{(t as any).tab_comparison_min}</span>
                                    )}
                                </button>
                                <button
                                    onClick={() => { trackButtonClick('stats', 'archive_tabs'); handleViewChange('stats'); }}
                                    className={`flex-shrink-0 px-6 py-3 font-serif text-lg font-medium transition-all ${viewMode === 'stats'
                                        ? 'text-kiwi-dark border-b-2 border-kiwi-dark'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {(t as any).tab_stats}
                                </button>
                                <button
                                    onClick={() => { trackButtonClick('settings', 'archive_tabs'); handleViewChange('settings'); }}
                                    className="flex-shrink-0 px-6 py-3 font-serif text-lg font-medium text-gray-400 hover:text-gray-600 transition-all ml-auto"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block mr-1">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M12 1v6m0 6v6" />
                                        <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24" />
                                        <path d="M1 12h6m6 0h6" />
                                        <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24" />
                                    </svg>
                                    {(t as any).tab_settings}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Content Area */}
                    <div className="max-w-4xl mx-auto px-6 py-8">
                        {viewMode === 'stats' && <TestStats testRuns={testRuns} />}
                        {viewMode === 'explore' && <ExploreMore />}
                        {viewMode === 'timeline' && <RunTimeline runs={testRuns} onSelect={handleSelectRun} onBack={onBack} user={user} />}
                        {viewMode === 'comparison' && <Comparison runs={testRuns} />}
                    </div>
                </>
            ) : null}
        </div>
    );
};

export default MyArchive;
