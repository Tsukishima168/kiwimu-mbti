import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { TestRun } from '../types';
import { useFirestoreSync } from '../hooks/useFirestoreSync';
import RunTimeline from './RunTimeline';
import RunDetail from './RunDetail';
import Comparison from './Comparison';
import TestStats from './TestStats';
import UserSettings from './UserSettings';

interface MyArchiveProps {
    user: User;
    onBack?: () => void;
}

type ViewMode = 'timeline' | 'comparison' | 'detail' | 'stats' | 'settings';

export const MyArchive: React.FC<MyArchiveProps> = ({ user, onBack }) => {
    const [testRuns, setTestRuns] = useState<TestRun[]>([]);
    const [selectedRun, setSelectedRun] = useState<TestRun | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('timeline');

    const { getUserTestRuns } = useFirestoreSync(user);

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
                    <p className="text-gray-600 font-mono text-sm tracking-wider">載入你的人格檔案...</p>
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
                    {/* Tab Navigation */}
                    {testRuns.length > 0 && (
                        <div className="max-w-4xl mx-auto px-6 pt-12 pb-6">
                            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
                                <button
                                    onClick={() => handleViewChange('timeline')}
                                    className={`flex-shrink-0 px-6 py-3 font-serif text-lg font-medium transition-all ${viewMode === 'timeline'
                                        ? 'text-kiwi-dark border-b-2 border-kiwi-dark'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    時間線
                                </button>
                                <button
                                    onClick={() => handleViewChange('comparison')}
                                    disabled={testRuns.length < 2}
                                    className={`flex-shrink-0 px-6 py-3 font-serif text-lg font-medium transition-all ${viewMode === 'comparison'
                                        ? 'text-kiwi-dark border-b-2 border-kiwi-dark'
                                        : testRuns.length < 2
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    對比分析
                                    {testRuns.length < 2 && (
                                        <span className="ml-2 text-xs">（需 2+ 筆）</span>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleViewChange('stats')}
                                    className={`flex-shrink-0 px-6 py-3 font-serif text-lg font-medium transition-all ${viewMode === 'stats'
                                        ? 'text-kiwi-dark border-b-2 border-kiwi-dark'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    📊 統計
                                </button>
                                <button
                                    onClick={() => handleViewChange('settings')}
                                    className="flex-shrink-0 px-6 py-3 font-serif text-lg font-medium text-gray-400 hover:text-gray-600 transition-all ml-auto"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block mr-1">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M12 1v6m0 6v6" />
                                        <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24" />
                                        <path d="M1 12h6m6 0h6" />
                                        <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24" />
                                    </svg>
                                    設定
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Content Area */}
                    <div className="max-w-4xl mx-auto px-6 py-8">
                        {viewMode === 'stats' && <TestStats testRuns={testRuns} />}
                        {viewMode === 'timeline' && <RunTimeline runs={testRuns} onSelect={handleSelectRun} onBack={onBack} user={user} />}
                        {viewMode === 'comparison' && <Comparison runs={testRuns} />}
                    </div>
                </>
            ) : null}
        </div>
    );
};

export default MyArchive;
