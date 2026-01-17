// Result Page Translations
export const resultTranslations = {
    zh: {
        // Header
        comprehensive_analysis: '綜合分析',
        ig_story_share: 'IG Story 分享',
        full_report_share: '完整報告分享',
        join_discord: '加入實驗室 / Join Discord',

        // Sections
        cognitive_spectrum: '認知光譜',
        identity: '維度解析',
        definitions: '詞彙表指南',
        life_insights: '生活洞見',
        navigation: '人際導航',
        rarity: '人格稀有度',
        archetypes: '共鳴原型',
        soul_reflection: '靈魂拷問',
        strengths: '優勢',
        blind_spots: '盲點',

        // Content Labels
        the_32nd_variance: 'THE 32ND VARIANCE',
        soul_dessert: 'SOUL DESSERT',
        keywords: 'KEYWORDS',
        work: 'WORK',
        love: 'LOVE',
        career: 'Career',
        career_strategy: '職涯策略',
        relationships: 'Relationships',
        relationship_philosophy: '關係哲學',
        work_style: 'WORK STYLE',
        strategic_advice: 'STRATEGIC ADVICE',
        love_philosophy: 'LOVE PHILOSOPHY',
        navigational_advice: 'NAVIGATIONAL ADVICE',
        superpower: 'SUPERPOWER 關係強項',
        growth_area: 'GROWTH AREA 關係盲點與建議',

        // Rarity Section
        appearance_rate: '在人群中的出現率',
        rarity_rank: '稀有度排名',
        male: '男性',
        female: '女性',
        rarity_disclaimer: 'ⓘ 稀有度是參考指標，用來提供共鳴與視角，不代表稀有=更好，也不代表人格固定不變。數值會因資料來源、地區、年齡與量表不同而有差異。',

        // Archetypes
        archetypes_intro: '這不是你=他們，而是你可能與他們在思考風格、工作節奏、價值傾向有相似點',
        resonance_traits: '共鳴特徵',

        // Buttons
        retest: '重新測驗',
        view_archive: '查看歷史紀錄',
        copy_link: '複製連結',
        copied: '已複製連結到剪貼簿',

        // Spectrum
        extrovert: '在領導與開拓中獲取能量。',
        introvert: '在深度反思中沈澱力量。',
        sensing: '關注現實Facts與實務。',
        intuition: '洞悉Pattern與未來機遇。',
        thinking: '極度理性與目標導向。',
        feeling: '關注核心價值與感性連結。',
        judging: '果斷決策，追求確定感。',
        perceiving: '靈活開放，擁抱彈性。',
        assertive: '自信穩定，心理韌性強。',
        turbulent: '精益求精，對環境高度敏感。',
    },

    en: {
        // Header
        comprehensive_analysis: 'COMPREHENSIVE ANALYSIS',
        ig_story_share: 'IG Story Share',
        full_report_share: 'Full Report Share',
        join_discord: 'Join Lab / Discord',

        // Sections
        cognitive_spectrum: 'Cognitive Spectrum',
        identity: 'Identity Analysis',
        definitions: 'Definitions',
        life_insights: 'Life Insights',
        navigation: 'Relationship Navigation',
        rarity: 'Personality Rarity',
        archetypes: 'Resonance Archetypes',
        soul_reflection: 'Soul Reflection',
        strengths: 'Strengths',
        blind_spots: 'Blind Spots',

        // Content Labels
        the_32nd_variance: 'THE 32ND VARIANCE',
        soul_dessert: 'SOUL DESSERT',
        keywords: 'KEYWORDS',
        work: 'WORK',
        love: 'LOVE',
        career: 'Career',
        career_strategy: 'Career Strategy',
        relationships: 'Relationships',
        relationship_philosophy: 'Relationship Philosophy',
        work_style: 'WORK STYLE',
        strategic_advice: 'STRATEGIC ADVICE',
        love_philosophy: 'LOVE PHILOSOPHY',
        navigational_advice: 'NAVIGATIONAL ADVICE',
        superpower: 'SUPERPOWER',
        growth_area: 'GROWTH AREA',

        // Rarity Section
        appearance_rate: 'Population Prevalence',
        rarity_rank: 'Rarity Rank',
        male: 'Male',
        female: 'Female',
        rarity_disclaimer: 'ⓘ Rarity is a reference indicator to provide resonance and perspective. It does not mean rare = better, nor that personality is fixed. Values may vary by data source, region, age, and assessment tool.',

        // Archetypes
        archetypes_intro: 'This doesn\'t mean you = them, but you may share similar thinking styles, work rhythms, and value orientations',
        resonance_traits: 'Resonance Traits',

        // Buttons
        retest: 'Retake Test',
        view_archive: 'View Archive',
        copy_link: 'Copy Link',
        copied: 'Link copied to clipboard',

        // Spectrum
        extrovert: 'Energized by leadership and exploration.',
        introvert: 'Recharged through deep reflection.',
        sensing: 'Focus on reality, facts, and practicality.',
        intuition: 'Perceive patterns and future opportunities.',
        thinking: 'Highly rational and goal-oriented.',
        feeling: 'Focus on core values and emotional connection.',
        judging: 'Decisive, seeking certainty.',
        perceiving: 'Flexible and open to possibilities.',
        assertive: 'Confident, psychologically resilient.',
        turbulent: 'Perfectionistic, highly sensitive to environment.',
    }
};

export type TranslationKey = keyof typeof resultTranslations.zh;
