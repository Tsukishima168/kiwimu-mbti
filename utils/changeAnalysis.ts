import { Score } from '../types';

export interface ChangeInsight {
    dimension: string;
    dimensionName: string;
    oldValue: number;
    newValue: number;
    delta: number;
    direction: 'increase' | 'decrease' | 'stable';
    significance: 'major' | 'minor' | 'stable';
    interpretation: string;
}

/**
 * 分析兩次測驗分數的變化
 */
export function analyzeChange(oldScores: Score, newScores: Score): ChangeInsight[] {
    const insights: ChangeInsight[] = [];

    const dimensions = [
        { key: 'E', name: 'E/I (外向/內向)', left: 'E', right: 'I' },
        { key: 'S', name: 'S/N (實感/直覺)', left: 'S', right: 'N' },
        { key: 'T', name: 'T/F (理性/感性)', left: 'T', right: 'F' },
        { key: 'J', name: 'J/P (計劃/彈性)', left: 'J', right: 'P' },
        { key: 'A', name: 'A/T (穩定/敏感)', left: 'A', right: 'T' },
    ];

    dimensions.forEach(dim => {
        const oldVal = oldScores[dim.key as keyof Score] || 0;
        const newVal = newScores[dim.key as keyof Score] || 0;
        const delta = newVal - oldVal;

        let direction: 'increase' | 'decrease' | 'stable';
        let significance: 'major' | 'minor' | 'stable';

        if (Math.abs(delta) < 3) {
            direction = 'stable';
            significance = 'stable';
        } else {
            direction = delta > 0 ? 'increase' : 'decrease';
            significance = Math.abs(delta) >= 10 ? 'major' : 'minor';
        }

        const interpretation = generateInterpretation(dim.key, delta, direction, significance);

        insights.push({
            dimension: dim.key,
            dimensionName: dim.name,
            oldValue: oldVal,
            newValue: newVal,
            delta,
            direction,
            significance,
            interpretation,
        });
    });

    return insights;
}

/**
 * 生成變化解讀文案
 */
function generateInterpretation(
    dimension: string,
    delta: number,
    direction: 'increase' | 'decrease' | 'stable',
    significance: 'major' | 'minor' | 'stable'
): string {
    if (significance === 'stable') {
        return interpretationTemplates[dimension].stable;
    }

    const template = interpretationTemplates[dimension][direction];
    const magTemplate = significance === 'major'
        ? template.major
        : template.minor;

    return magTemplate.replace('{delta}', Math.abs(delta).toString());
}

/**
 * 解讀文案模板
 */
const interpretationTemplates: Record<string, any> = {
    E: {
        stable: '你的能量獲取方式保持穩定',
        increase: {
            major: '你變得更外向了！外向特質提升 {delta}%，更願意在人群中獲取能量',
            minor: '你略微偏向外向，外向特質提升 {delta}%',
        },
        decrease: {
            major: '你變得更內向了！內向特質提升 {delta}%，更需要獨處時光充電',
            minor: '你略微偏向內向，內向特質提升 {delta}%',
        },
    },
    S: {
        stable: '你的訊息接收方式保持一致',
        increase: {
            major: '你變得更重視實際！實感特質提升 {delta}%，更關注具體細節與事實',
            minor: '你略微偏向實感，實感特質提升 {delta}%',
        },
        decrease: {
            major: '你變得更直覺！直覺特質提升 {delta}%，更善於洞察模式與可能性',
            minor: '你略微偏向直覺，直覺特質提升 {delta}%',
        },
    },
    T: {
        stable: '你的決策方式維持平衡',
        increase: {
            major: '你變得更加理性！理性特質提升 {delta}%，決策時更重視邏輯與效率',
            minor: '你略微偏向理性思考，理性特質提升 {delta}%',
        },
        decrease: {
            major: '你變得更感性！感性特質提升 {delta}%，更關注人際關係與情感連結',
            minor: '你略微偏向感性，感性特質提升 {delta}%',
        },
    },
    J: {
        stable: '你的生活方式保持穩定',
        increase: {
            major: '你變得更有計劃！計劃特質提升 {delta}%，更追求確定性與結構',
            minor: '你略微偏向計劃性，計劃特質提升 {delta}%',
        },
        decrease: {
            major: '你變得更彈性！彈性特質提升 {delta}%，更能適應變化與即興',
            minor: '你略微偏向彈性，彈性特質提升 {delta}%',
        },
    },
    A: {
        stable: '你的情緒穩定性維持一致',
        increase: {
            major: '你的情緒穩定性顯著提升！穩定特質提升 {delta}%，更有自信面對挑戰',
            minor: '你的情緒穩定性略有提升，穩定特質提升 {delta}%',
        },
        decrease: {
            major: '你變得更敏感！敏感特質提升 {delta}%，對環境變化更加警覺',
            minor: '你略微偏向敏感，敏感特質提升 {delta}%',
        },
    },
};

/**
 * 計算人格類型變化摘要
 */
export function getPersonalityChangeSummary(
    oldType: string,
    oldSuffix: 'A' | 'T',
    newType: string,
    newSuffix: 'A' | 'T'
): string {
    const oldFull = `${oldType}-${oldSuffix}`;
    const newFull = `${newType}-${newSuffix}`;

    if (oldFull === newFull) {
        return '你的人格類型保持穩定';
    }

    if (oldType === newType && oldSuffix !== newSuffix) {
        return `你的核心人格保持 ${oldType}，但從${oldSuffix === 'A' ? '穩定型' : '敏感型'}轉變為${newSuffix === 'A' ? '穩定型' : '敏感型'}`;
    }

    if (oldType !== newType && oldSuffix === newSuffix) {
        return `你的人格類型從 ${oldType} 演變為 ${newType}`;
    }

    return `你的人格從 ${oldFull} 完全轉變為 ${newFull}`;
}
