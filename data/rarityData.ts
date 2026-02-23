// Rarity data for all 16 MBTI types
export interface RarityData {
    rank: number;           // 1-16 ranking, 1 = rarest
    totalPopulation: number;   // Overall percentage
    male: number;          // Male percentage
    female: number;        // Female percentage
}

// Based on aggregated MBTI research data
export const RARITY_DATA: Record<string, RarityData> = {
    // Rarest types (1-4)
    'INFJ': { rank: 1, totalPopulation: 1.5, male: 1.2, female: 1.6 },
    'ENTJ': { rank: 2, totalPopulation: 1.8, male: 2.7, female: 0.9 },
    'INTJ': { rank: 3, totalPopulation: 2.1, male: 3.3, female: 0.8 },
    'ENFJ': { rank: 4, totalPopulation: 2.5, male: 1.6, female: 3.3 },

    // Rare types (5-8)
    'ENTP': { rank: 5, totalPopulation: 3.2, male: 4.0, female: 2.4 },
    'INTP': { rank: 6, totalPopulation: 3.3, male: 4.8, female: 1.7 },
    'ENFP': { rank: 7, totalPopulation: 8.1, male: 6.4, female: 9.7 },
    'INFP': { rank: 8, totalPopulation: 4.4, male: 4.1, female: 4.6 },

    // Moderately common (9-12)
    'ESTP': { rank: 9, totalPopulation: 4.3, male: 5.6, female: 3.0 },
    'ISTP': { rank: 10, totalPopulation: 5.4, male: 8.5, female: 2.3 },
    'ESFP': { rank: 11, totalPopulation: 8.5, male: 7.4, female: 9.6 },
    'ISFP': { rank: 12, totalPopulation: 8.8, male: 7.6, female: 9.9 },

    // Common types (13-16)
    'ESTJ': { rank: 13, totalPopulation: 8.7, male: 11.2, female: 6.3 },
    'ISTJ': { rank: 14, totalPopulation: 11.6, male: 16.4, female: 6.9 },
    'ESFJ': { rank: 15, totalPopulation: 12.0, male: 7.5, female: 16.9 },
    'ISFJ': { rank: 16, totalPopulation: 13.8, male: 8.1, female: 19.4 },
};

export const getRarityData = (type: string): RarityData | null => {
    return RARITY_DATA[type] || null;
};

export const getRarityLabel = (rank: number): string => {
    if (rank <= 4) return '極稀有';
    if (rank <= 8) return '稀有';
    if (rank <= 12) return '中等';
    return '常見';
};

export const getRarityMessage = (rank: number): string => {
    if (rank <= 4) return '你不是怪，你只是少數';
    if (rank <= 8) return '你擁有獨特的思考方式';
    if (rank <= 12) return '你在人群中有自己的位置';
    return '你代表著穩定與連結';
};

// Internationalized versions — contextually localized, not direct translations
export const getRarityMessageI18n = (rank: number, lang: string): string => {
    const messages: Record<string, Record<number, string>> = {
        en: {
            1: 'You\'re not strange — you\'re simply rare.',
            2: 'Your way of thinking is genuinely distinctive.',
            3: 'You hold a quiet but meaningful place in the crowd.',
            4: 'You are the steady force others rely on.',
        },
        ja: {
            1: 'あなたは変わり者じゃない。ただ、少数派なだけ。',
            2: 'あなたの思考方法は本当にユニークです。',
            3: 'あなたは人々の中で静かながらも確かな存在感を持っています。',
            4: 'あなたは周りが頼りにする、安定した力の源です。',
        },
        ko: {
            1: '당신은 이상한 게 아니에요 — 그저 소수일 뿐이에요.',
            2: '당신만의 독특한 사고 방식을 가지고 있어요.',
            3: '사람들 사이에서 조용하지만 의미 있는 자리를 갖고 있어요.',
            4: '당신은 주변이 의지하는 안정적인 힘이에요.',
        },
    };
    if (lang === 'zh') return getRarityMessage(rank);
    const bucket = rank <= 4 ? 1 : rank <= 8 ? 2 : rank <= 12 ? 3 : 4;
    return (messages[lang] as Record<number, string>)?.[bucket] ?? getRarityMessage(rank);
};
