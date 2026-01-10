import React, { useState } from 'react';
import { TestRun } from '../types';
import { getResultData } from '../constants';
import { CURRENT_DESSERT_VERSION } from '../firestore.config';
import Result from './Result';

interface RunDetailProps {
    run: TestRun;
    onBack: () => void;
}

export const RunDetail: React.FC<RunDetailProps> = ({ run, onBack }) => {
    const [viewLatestDessert, setViewLatestDessert] = useState(false);

    // Check if dessert catalog has been updated
    const hasNewDessert = run.dessertCatalogVersion !== CURRENT_DESSERT_VERSION;

    // Reconstruct the result data from the saved test run
    // If viewing latest dessert, use current version, otherwise use archived version
    const resultData = getResultData(
        run.resultType as any,
        run.suffix
    );

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('zh-TW', {
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
                    <span>返回檔案館</span>
                </button>
            </div>

            {/* Archive Banner */}
            <div className="max-w-4xl mx-auto px-6 pb-6">
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <span className="text-xl">📜</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-amber-800">
                                <span className="font-semibold">歷史記錄</span> — 測驗於{' '}
                                {formatDate(run.finishedAt)} 完成
                            </p>
                            <p className="text-xs text-amber-700 mt-1 font-mono">
                                版本：{run.quizVersion} · {run.dessertCatalogVersion}
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
                            <div className="flex-shrink-0 text-3xl">🍰</div>
                            <div className="flex-1">
                                <h3 className="text-lg font-serif font-semibold text-purple-900 mb-2">
                                    新甜點已上架！
                                </h3>
                                <p className="text-sm text-purple-800 mb-4 leading-relaxed">
                                    你的人格（{run.resultType}-{run.suffix}）有了全新的靈魂配對。<br />
                                    當時推薦的是舊甜點目錄，現在有更多美味選擇等著你！
                                </p>
                                {!viewLatestDessert ? (
                                    <button
                                        onClick={() => setViewLatestDessert(true)}
                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                                    >
                                        <span>查看最新甜點推薦</span>
                                        <span className="text-lg">→</span>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-purple-700 font-medium">
                                            ✨ 已切換到最新甜點目錄
                                        </span>
                                        <button
                                            onClick={() => setViewLatestDessert(false)}
                                            className="text-sm text-purple-600 underline hover:text-purple-800 transition-colors"
                                        >
                                            返回原版
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
