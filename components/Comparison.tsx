import React, { useState } from 'react';
import { TestRun } from '../types';
import { analyzeChange, getPersonalityChangeSummary } from '../utils/changeAnalysis';
import { calculatePercentages } from '../utils/logic';
import { useLanguage } from '../contexts/LanguageContext';

interface ComparisonProps {
    runs: TestRun[];
    onBack?: () => void;
}

export const Comparison: React.FC<ComparisonProps> = ({ runs, onBack }) => {
    const [selectedA, setSelectedA] = useState<string>(runs[0]?.id || '');
    const [selectedB, setSelectedB] = useState<string>(runs[1]?.id || '');
    const { language, t } = useLanguage();

    const dateLocale = language === 'ja' ? 'ja-JP' : language === 'ko' ? 'ko-KR' : language === 'en' ? 'en-US' : 'zh-TW';

    if (runs.length < 2) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-20 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-3xl">📊</span>
                </div>
                <h2 className="text-2xl font-serif text-gray-700 mb-3">{(t as any).comparison_need_more}</h2>
                <p className="text-gray-500 mb-8">
                    {(t as any).comparison_need_more_desc}
                </p>
                {onBack && (
                    <button
                        onClick={onBack}
                        className="px-8 py-3 bg-kiwi-dark text-white hover:bg-opacity-90 transition-all font-medium tracking-wide"
                    >
                        {(t as any).comparison_back_timeline}
                    </button>
                )}
            </div>
        );
    }

    const runA = runs.find(r => r.id === selectedA);
    const runB = runs.find(r => r.id === selectedB);

    if (!runA || !runB) return null;

    const percentagesA = calculatePercentages(runA.scores);
    const percentagesB = calculatePercentages(runB.scores);

    const insights = analyzeChange(runB.scores, runA.scores);
    const changeSummary = getPersonalityChangeSummary(
        runB.resultType,
        runB.suffix,
        runA.resultType,
        runA.suffix
    );

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString(dateLocale, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        });
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="mb-12">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="mb-6 flex items-center gap-2 text-sm font-mono text-gray-400 hover:text-kiwi-dark transition-colors tracking-wider uppercase"
                    >
                        <span>←</span>
                        <span>{(t as any).archive_back}</span>
                    </button>
                )}
                <h1 className="text-4xl md:text-5xl font-serif font-medium text-kiwi-dark mb-4">
                    {(t as any).comparison_title}
                </h1>
                <p className="text-gray-600 leading-relaxed">
                    {(t as any).comparison_desc}
                </p>
            </div>

            {/* Test Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div>
                    <label className="block text-sm font-mono font-bold text-gray-400 uppercase tracking-wider mb-3">
                        {(t as any).comparison_test_a}
                    </label>
                    <select
                        value={selectedA}
                        onChange={(e) => setSelectedA(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded bg-white font-serif text-lg focus:outline-none focus:ring-2 focus:ring-kiwi-dark"
                    >
                        {runs.map((run) => (
                            <option key={run.id} value={run.id}>
                                {formatDate(run.finishedAt)} - {run.resultType}-{run.suffix}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-mono font-bold text-gray-400 uppercase tracking-wider mb-3">
                        {(t as any).comparison_test_b}
                    </label>
                    <select
                        value={selectedB}
                        onChange={(e) => setSelectedB(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded bg-white font-serif text-lg focus:outline-none focus:ring-2 focus:ring-kiwi-dark"
                    >
                        {runs.map((run) => (
                            <option key={run.id} value={run.id}>
                                {formatDate(run.finishedAt)} - {run.resultType}-{run.suffix}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Change Summary */}
            <div className="mb-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 text-4xl">🔄</div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-serif font-semibold text-blue-900 mb-3">
                            {(t as any).comparison_summary}
                        </h2>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl font-display font-bold text-kiwi-dark">
                                {runB.resultType}-{runB.suffix}
                            </span>
                            <span className="text-2xl text-blue-400">→</span>
                            <span className="text-3xl font-display font-bold text-kiwi-dark">
                                {runA.resultType}-{runA.suffix}
                            </span>
                        </div>
                        <p className="text-lg text-blue-800 font-serif leading-relaxed">
                            {changeSummary}
                        </p>
                        <p className="text-sm text-blue-600 mt-2 font-mono">
                            {((t as any).comparison_timespan || '')
                                .replace('{from}', formatDate(runB.finishedAt))
                                .replace('{to}', formatDate(runA.finishedAt))}
                        </p>
                    </div>
                </div>
            </div>

            {/* Dimension Changes */}
            <div className="space-y-8">
                <h3 className="text-2xl font-serif font-medium text-gray-800 mb-6">
                    {(t as any).comparison_dimension_detail}
                </h3>

                {insights.map((insight, index) => {
                    const isSignificant = insight.significance === 'major';
                    const borderColor = isSignificant ? 'border-kiwi-dark' : 'border-gray-200';
                    const bgClass = insight.direction === 'increase'
                        ? 'from-green-50 to-emerald-50'
                        : insight.direction === 'decrease'
                            ? 'from-orange-50 to-amber-50'
                            : 'from-gray-50 to-gray-100';

                    return (
                        <div
                            key={insight.dimension}
                            className={`p-6 bg-gradient-to-r ${bgClass} border ${borderColor} rounded-lg ${isSignificant ? 'shadow-md' : ''}`}
                        >
                            {/* Dimension Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="text-xl font-serif font-semibold text-gray-800">
                                        {insight.dimensionName}
                                    </h4>
                                    <p className="text-sm text-gray-500 font-mono mt-1">
                                        {((t as any).comparison_dimension_count || '').replace('{index}', String(index + 1))}
                                    </p>
                                </div>
                                {isSignificant && (
                                    <span className="px-3 py-1 bg-kiwi-dark text-white text-xs font-mono font-bold tracking-wider rounded">
                                        {(t as any).comparison_significant}
                                    </span>
                                )}
                            </div>

                            {/* Values Comparison */}
                            <div className="grid grid-cols-3 gap-4 mb-4 items-center">
                                <div className="text-center">
                                    <p className="text-xs text-gray-400 font-mono uppercase mb-1">{(t as any).comparison_test_b_short}</p>
                                    <p className="text-3xl font-display font-bold text-gray-700">
                                        {insight.oldValue}%
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        {insight.direction === 'increase' && (
                                            <span className="text-2xl text-green-600">↑</span>
                                        )}
                                        {insight.direction === 'decrease' && (
                                            <span className="text-2xl text-orange-600">↓</span>
                                        )}
                                        {insight.direction === 'stable' && (
                                            <span className="text-2xl text-gray-400">→</span>
                                        )}
                                        <span className={`text-xl font-bold ${insight.direction === 'increase' ? 'text-green-600' :
                                            insight.direction === 'decrease' ? 'text-orange-600' :
                                                'text-gray-400'
                                            }`}>
                                            {insight.delta > 0 ? '+' : ''}{insight.delta}%
                                        </span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-400 font-mono uppercase mb-1">{(t as any).comparison_test_a_short}</p>
                                    <p className="text-3xl font-display font-bold text-kiwi-dark">
                                        {insight.newValue}%
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
                                <div
                                    className="absolute top-0 left-0 h-full bg-gray-400 transition-all duration-500"
                                    style={{ width: `${insight.oldValue}%` }}
                                />
                                <div
                                    className="absolute top-0 left-0 h-full bg-kiwi-dark transition-all duration-500"
                                    style={{ width: `${insight.newValue}%`, opacity: 0.7 }}
                                />
                            </div>

                            {/* Interpretation */}
                            <p className="text-base text-gray-700 font-serif leading-relaxed italic">
                                {insight.interpretation}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Comparison;
