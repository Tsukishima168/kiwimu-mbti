import React from 'react';
import { CardProps } from './Types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const SpectrumBar = ({ leftLabel, rightLabel, leftScore, rightScore, leftDesc, rightDesc }: any) => (
    <div className="mb-6 border-b border-gray-200 pb-6 last:border-0 text-left">
        <div className="flex justify-between items-baseline mb-2">
            <span className="text-[10px] tracking-[0.15em] uppercase text-black font-bold">{leftLabel}</span>
            <span className="text-[10px] tracking-[0.15em] uppercase text-black font-bold">{rightLabel}</span>
        </div>
        <div className="relative h-[2px] bg-gray-200 w-full mb-3 overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-black transition-all duration-[1.5s] ease-out" style={{ width: `${leftScore}%` }} />
            <div className="absolute top-1/2 -mt-1 w-2 h-2 bg-black rounded-full z-10" style={{ left: `calc(${leftScore}% - 4px)` }}></div>
        </div>
        <div className="flex justify-between items-center mb-2 font-serif">
            <div className="text-2xl font-bold text-black tracking-tighter">{leftScore}<span className="text-xs font-normal ml-1">%</span></div>
            <div className="text-2xl font-bold text-black text-right tracking-tighter">{rightScore}<span className="text-xs font-normal ml-1">%</span></div>
        </div>
        <div className="flex justify-between text-[9px] text-gray-500 tracking-[0.1em] font-medium uppercase">
            <p className="max-w-[120px] leading-relaxed">{leftDesc}</p>
            <p className="max-w-[120px] text-right leading-relaxed">{rightDesc}</p>
        </div>
    </div>
);

export const RadarCard: React.FC<CardProps> = ({ resultData, percentages, t }) => {
    // Create radar chart data dynamically from actual percentages
    const chartData = [
        { subject: t('dim_ei_label')?.split(' ')[0] || '外向', A: percentages.E || 50, fullMark: 100 },
        { subject: t('dim_sn_label')?.split(' ')[0] || '實務', A: percentages.S || 50, fullMark: 100 },
        { subject: t('dim_tf_label')?.split(' ')[0] || '邏輯', A: percentages.T || 50, fullMark: 100 },
        { subject: t('dim_jp_label')?.split(' ')[0] || '計畫', A: percentages.J || 50, fullMark: 100 },
        { subject: t('dim_at_label')?.split(' ')[0] || '自信', A: percentages.A || 50, fullMark: 100 }
    ];

    return (
        <div className="w-full h-full flex flex-col bg-white overflow-hidden pb-16">
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-10">

                <div className="text-center mb-6">
                    <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-gray-400 mb-2">COGNITIVE SPECTRUM</h3>
                    <h2 className="text-2xl font-display font-bold text-kiwi-dark tracking-widest uppercase">{t('cognitive_spectrum')}</h2>
                </div>

                {/* Radar Chart */}
                <div className="w-full h-64 mb-8 -ml-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                            <PolarGrid gridType="polygon" stroke="#f0f0f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name={t('radar_capability') || '能力'} dataKey="A" stroke="#121212" strokeWidth={2} fill="#121212" fillOpacity={0.1} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Spectrum Bars */}
                <div className="space-y-2 mb-8">
                    <SpectrumBar leftLabel="EXTROVERT (E)" rightLabel="INTROVERT (I)" leftScore={percentages.E} rightScore={percentages.I} leftDesc={t('extrovert')} rightDesc={t('introvert')} />
                    <SpectrumBar leftLabel="SENSING (S)" rightLabel="INTUITION (N)" leftScore={percentages.S} rightScore={percentages.N} leftDesc={t('sensing')} rightDesc={t('intuition')} />
                    <SpectrumBar leftLabel="THINKING (T)" rightLabel="FEELING (F)" leftScore={percentages.T} rightScore={percentages.F} leftDesc={t('thinking')} rightDesc={t('feeling')} />
                    <SpectrumBar leftLabel="JUDGING (J)" rightLabel="PERCEIVING (P)" leftScore={percentages.J} rightScore={percentages.P} leftDesc={t('judging')} rightDesc={t('perceiving')} />
                    <SpectrumBar leftLabel="ASSERTIVE (A)" rightLabel="TURBULENT (T)" leftScore={percentages.A} rightScore={percentages.Turbulent} leftDesc={t('assertive')} rightDesc={t('turbulent')} />
                </div>

            </div>
        </div>
    );
};
