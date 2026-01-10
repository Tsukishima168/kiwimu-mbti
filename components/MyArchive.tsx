import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { TestRun } from '../types';
import { useFirestoreSync } from '../hooks/useFirestoreSync';
import RunTimeline from './RunTimeline';
import RunDetail from './RunDetail';
import Comparison from './Comparison';

interface MyArchiveProps {
    user: User;
    onBack?: () => void;
}

type ViewMode = 'timeline' | 'comparison' | 'detail';

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
            {viewMode === 'detail' && selectedRun ? (
                <RunDetail run={selectedRun} onBack={handleBackToTimeline} />
            ) : (
                <>
                    {/* Tab Navigation */}
                    {testRuns.length > 0 && (
                        <div className="max-w-4xl mx-auto px-6 pt-12 pb-6">
                            <div className="flex gap-2 border-b border-gray-200">
                                <button
                                    onClick={() => handleViewChange('timeline')}
                                    className={`px-6 py-3 font-serif text-lg font-medium transition-all ${viewMode === 'timeline'
                                            ? 'text-kiwi-dark border-b-2 border-kiwi-dark'
                                            : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    時間線
                                </button>
                                <button
                                    onClick={() => handleViewChange('comparison')}
                                    disabled={testRuns.length < 2}
                                    className={`px-6 py-3 font-serif text-lg font-medium transition-all ${viewMode === 'comparison'
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
                            </div>
                        </div>
                    )}

                    {viewMode === 'timeline' && (
                        <RunTimeline runs={testRuns} onSelect={handleSelectRun} onBack={onBack} user={user} />
                    )}

                    {viewMode === 'comparison' && (
                        <Comparison runs={testRuns} onBack={() => handleViewChange('timeline')} />
                    )}
                </>
            )}
        </div>
    );
};

export default MyArchive;
