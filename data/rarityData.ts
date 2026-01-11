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
