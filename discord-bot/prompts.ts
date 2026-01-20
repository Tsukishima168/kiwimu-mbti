export const DAILY_PROMPTS = [
    // Week 1: 自由的定義
    {
        id: 1,
        question: "如果自由有一個顏色，你覺得是什麼顏色？為什麼？",
        category: "freedom",
        emoji: "🎨"
    },
    {
        id: 2,
        question: "對你來說，自由是「做任何想做的事」還是「不做不想做的事」？",
        category: "freedom",
        emoji: "🤔"
    },
    {
        id: 3,
        question: "如果自由有一種味道，你覺得是什麼？",
        category: "freedom",
        emoji: "👃"
    },
    {
        id: 4,
        question: "你最近一次感受到自由是什麼時候？",
        category: "freedom",
        emoji: "⛵"
    },
    {
        id: 5,
        question: "自由和孤獨，你覺得它們是一體兩面嗎？",
        category: "freedom",
        emoji: "💭"
    },
    {
        id: 6,
        question: "如果可以選擇，你想要「時間的自由」還是「空間的自由」？",
        category: "freedom",
        emoji: "⏰"
    },
    {
        id: 7,
        question: "你覺得完全的自由存在嗎？",
        category: "freedom",
        emoji: "🌌"
    },

    // Week 2: 甜點與情緒
    {
        id: 8,
        question: "今天的心情如果是一種甜點，會是什麼？",
        category: "dessert",
        emoji: "🍰"
    },
    {
        id: 9,
        question: "你覺得哪種甜點最能代表「療癒」？",
        category: "dessert",
        emoji: "💝"
    },
    {
        id: 10,
        question: "吃甜點的時候，你喜歡一個人還是和別人分享？",
        category: "dessert",
        emoji: "🤝"
    },
    {
        id: 11,
        question: "如果能創造一款專屬於你的甜點，你會加入什麼元素？",
        category: "dessert",
        emoji: "✨"
    },
    {
        id: 12,
        question: "甜點對你來說，是必需品還是奢侈品？",
        category: "dessert",
        emoji: "🎁"
    },
    {
        id: 13,
        question: "你最懷念的童年甜點是什麼？",
        category: "dessert",
        emoji: "🧒"
    },
    {
        id: 14,
        question: "鹹甜混合的甜點，你能接受嗎？為什麼？",
        category: "dessert",
        emoji: "🧂"
    },

    // Week 3: 航行與探索
    {
        id: 15,
        question: "如果人生是一艘船，你現在航行在什麼樣的海域？",
        category: "journey",
        emoji: "🌊"
    },
    {
        id: 16,
        question: "你更喜歡有地圖的旅行，還是說走就走的冒險？",
        category: "journey",
        emoji: "🗺️"
    },
    {
        id: 17,
        question: "迷航的時候，你會尋求幫助還是自己摸索？",
        category: "journey",
        emoji: "🧭"
    },
    {
        id: 18,
        question: "如果可以和一個人一起航行，你會選誰？",
        category: "journey",
        emoji: "👥"
    },
    {
        id: 19,
        question: "風暴來臨時，你是會躲起來還是迎面而上？",
        category: "journey",
        emoji: "⛈️"
    },
    {
        id: 20,
        question: "你覺得目的地重要，還是航行的過程重要？",
        category: "journey",
        emoji: "🎯"
    },
    {
        id: 21,
        question: "如果可以在航程中帶三樣東西，你會帶什麼？",
        category: "journey",
        emoji: "🎒"
    },

    // Week 4: 自我與關係
    {
        id: 22,
        question: "你更喜歡「被理解」還是「被接納」？",
        category: "self",
        emoji: "💫"
    },
    {
        id: 23,
        question: "獨處的時候，你都在做什麼？",
        category: "self",
        emoji: "🌙"
    },
    {
        id: 24,
        question: "你覺得自己是「容易滿足」還是「永遠在追尋」的人？",
        category: "self",
        emoji: "🌟"
    },
    {
        id: 25,
        question: "如果可以對 10 年前的自己說一句話，你會說什麼？",
        category: "self",
        emoji: "⏮️"
    },
    {
        id: 26,
        question: "你覺得「做自己」容易嗎？",
        category: "self",
        emoji: "🪞"
    },
    {
        id: 27,
        question: "什麼樣的人會讓你想要靠近？",
        category: "self",
        emoji: "🧲"
    },
    {
        id: 28,
        question: "你更在意別人對你的看法，還是自己對自己的看法？",
        category: "self",
        emoji: "👁️"
    },

    // Week 5+: 創意與夢想
    {
        id: 29,
        question: "如果有一整天完全屬於你，沒有任何義務，你會怎麼過？",
        category: "dream",
        emoji: "☁️"
    },
    {
        id: 30,
        question: "你心中的理想生活是什麼樣子？",
        category: "dream",
        emoji: "✨"
    }
];

export function getTodayPrompt(): typeof DAILY_PROMPTS[0] {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const promptIndex = dayOfYear % DAILY_PROMPTS.length;
    return DAILY_PROMPTS[promptIndex];
}

export function getPromptById(id: number) {
    return DAILY_PROMPTS.find(p => p.id === id);
}
