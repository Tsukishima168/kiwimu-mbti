import React from 'react';
import { User } from 'firebase/auth';
import { TestRun } from '../types';
import { trackButtonClick } from '../utils/analytics';

interface RunTimelineProps {
    runs: TestRun[];
    onSelect: (run: TestRun) => void;
    onBack?: () => void;
    user: User;
}

export const RunTimeline: React.FC<RunTimelineProps> = ({ runs, onSelect, onBack, user }) => {
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('zh-TW', {
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
                        onClick={() => { trackButtonClick('返回_檔案館', 'archive_timeline'); onBack(); }}
                        className="mb-6 flex items-center gap-2 text-sm font-mono text-gray-400 hover:text-kiwi-dark transition-colors tracking-wider uppercase"
                    >
                        <span>←</span>
                        <span>返回</span>
                    </button>
                )}
                <h1 className="text-4xl md:text-5xl font-serif font-medium text-kiwi-dark mb-4">
                    我的人格檔案館
                </h1>
                <p className="text-gray-600 leading-relaxed">
                    歡迎回來，{user.displayName || '探索者'}。這裡記錄著你每一次的內在旅程。
                </p>
            </div>

            {/* Empty State */}
            {runs.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-3xl">🌱</span>
                    </div>
                    <h2 className="text-2xl font-serif text-gray-700 mb-3">還沒有任何測驗記錄</h2>
                    <p className="text-gray-500 mb-8">完成第一次測驗，開始建立你的人格檔案</p>
                    {onBack && (
                        <button
                            onClick={() => { trackButtonClick('開始探索_檔案館', 'archive_empty'); onBack(); }}
                            className="px-8 py-3 bg-kiwi-dark text-white hover:bg-opacity-90 transition-all font-medium tracking-wide"
                        >
                            開始探索
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Summary Card */}
                    <div className="mb-10 p-8 bg-white border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-serif font-medium text-kiwi-dark">探索記錄</h2>
                            <span className="text-sm font-mono text-gray-400 tracking-wider">
                                {runs.length} 次測驗
                            </span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            最近一次測驗於 {formatDate(runs[0].finishedAt)}，結果為{' '}
                            <span className="font-semibold text-kiwi-dark">
                                {runs[0].resultType}-{runs[0].suffix}
                            </span>
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-serif font-medium text-gray-700 mb-6">時間軸</h3>
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
                                                最新
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
                                        題庫 {run.quizVersion}
                                    </span>
                                    <span className="px-2 py-1 bg-gray-50 rounded border border-gray-200">
                                        甜點 {run.dessertCatalogVersion}
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
