import React from 'react';
import { TestRun } from '../types';

interface TestStatsProps {
    testRuns: TestRun[];
}

// Helper function: 計算最常見類型
function getMostCommonType(runs: TestRun[]): string {
    if (runs.length === 0) return 'N/A';

    const counts: Record<string, number> = {};
    runs.forEach(run => {
        const type = `${run.resultType}-${run.suffix}`;
        counts[type] = (counts[type] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'N/A';
}

// Helper function: 獲取演變路徑（最近 5 次）
function getEvolutionPath(runs: TestRun[]): string[] {
    const sorted = [...runs].sort((a, b) => a.finishedAt - b.finishedAt);
    return sorted.slice(-5).map(run => `${run.resultType}-${run.suffix}`);
}

// Helper function: 格式化日期
function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

export const TestStats: React.FC<TestStatsProps> = ({ testRuns }) => {
    if (testRuns.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">還沒有測驗記錄</h2>
                <p className="text-gray-500">完成測驗後，這裡會顯示你的性格演變軌跡</p>
            </div>
        );
    }

    const stats = {
        total: testRuns.length,
        firstTest: testRuns[testRuns.length - 1]?.finishedAt || Date.now(),
        lastTest: testRuns[0]?.finishedAt || Date.now(),
        mostCommon: getMostCommonType(testRuns),
        evolution: getEvolutionPath(testRuns)
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-2 border-kiwi-dark">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 font-display flex items-center gap-2">
                <span>📊</span> 你的測驗足跡
            </h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl md:text-4xl font-bold text-kiwi-dark mb-1">{stats.total}</div>
                    <div className="text-xs md:text-sm text-gray-500">總測驗次數</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-xl md:text-2xl font-bold text-kiwi-dark mb-1">{stats.mostCommon}</div>
                    <div className="text-xs md:text-sm text-gray-500">最常見類型</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs md:text-sm text-gray-600 mb-1">{formatDate(stats.firstTest)}</div>
                    <div className="text-xs md:text-sm text-gray-500">首次測驗</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs md:text-sm text-gray-600 mb-1">{formatDate(stats.lastTest)}</div>
                    <div className="text-xs md:text-sm text-gray-500">最近測驗</div>
                </div>
            </div>

            {/* Evolution Path */}
            <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span>📈</span> 人格演變軌跡
                </h3>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {stats.evolution.map((type, i) => (
                        <React.Fragment key={i}>
                            <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-300 rounded-full text-sm font-mono font-bold whitespace-nowrap">
                                {type}
                            </span>
                            {i < stats.evolution.length - 1 && (
                                <span className="text-gray-400 text-xl">→</span>
                            )}
                        </React.Fragment>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                    💡 顯示最近 5 次測驗的演變軌跡
                </p>
            </div>

            {/* Stability Indicator (optional) */}
            {stats.total >= 3 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-bold text-blue-900 mb-2">🎯 穩定度指標</h4>
                    <p className="text-xs text-blue-700">
                        {stats.evolution.slice(-3).every(t => t === stats.mostCommon)
                            ? '✅ 最近 3 次測驗結果一致，性格穩定度高'
                            : '🔄 最近測驗結果有變化，可能反映了你的成長或環境影響'
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default TestStats;
