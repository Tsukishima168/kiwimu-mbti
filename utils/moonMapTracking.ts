// Moon Map Integration
export const buildMoonMapUrl = (mbtiType: string, variant: 'A' | 'T'): string => {
    const baseUrl = 'https://map.kiwimu.com';
    return `${baseUrl}?from=mbti&type=${mbtiType}&variant=${variant}#easter-egg`;
};

// MBTI Easter Egg Clues (16 personalities)
export const MBTI_EASTER_EGG_CLUES: Record<string, {
    title: string;
    clue: string;
    moonMapHint: string;
}> = {
    INTJ: {
        title: "建築師的藍圖",
        clue: "在月島的圖書館角落，藏著一張只有你能看懂的設計圖...",
        moonMapHint: "尋找黑色的書籍圖標"
    },
    INTP: {
        title: "邏輯學家的謎題",
        clue: "月島的實驗室裡，有一個尚未被解開的方程式...",
        moonMapHint: "尋找燒杯圖標"
    },
    ENTJ: {
        title: "指揮官的戰略",
        clue: "在月島的高塔頂端，有一份屬於領導者的宣言...",
        moonMapHint: "尋找旗幟圖標"
    },
    ENTP: {
        title: "辯論家的挑戰",
        clue: "月島的辯論台上，留著一個等待被推翻的論點...",
        moonMapHint: "尋找對話框圖標"
    },
    INFJ: {
        title: "提倡者的預言",
        clue: "月島的靜默神殿裡，藏著一段只為你寫的禱文...",
        moonMapHint: "尋找蓮花圖標"
    },
    INFP: {
        title: "調停者的詩篇",
        clue: "在月島的秘密花園，有一首尚未譜完的詩...",
        moonMapHint: "尋找花朵圖標"
    },
    ENFJ: {
        title: "主人公的使命",
        clue: "月島的集會廣場中央，有一封寫給你的邀請函...",
        moonMapHint: "尋找手牽手圖標"
    },
    ENFP: {
        title: "競選者的旅程",
        clue: "月島的冒險小徑上，有一張藏寶圖等著你...",
        moonMapHint: "尋找星星圖標"
    },
    ISTJ: {
        title: "物流師的清單",
        clue: "月島的檔案室裡，有一份屬於你的完美紀錄...",
        moonMapHint: "尋找文件夾圖標"
    },
    ISFJ: {
        title: "守衛者的回憶",
        clue: "在月島的溫暖小屋，藏著一本珍貴的相簿...",
        moonMapHint: "尋找相機圖標"
    },
    ESTJ: {
        title: "總經理的計畫",
        clue: "月島的管理中心，有一份等待你簽署的方案...",
        moonMapHint: "尋找公事包圖標"
    },
    ESFJ: {
        title: "執政官的慶典",
        clue: "月島的慶祝大廳裡，為你準備了一場驚喜派對...",
        moonMapHint: "尋找蛋糕圖標"
    },
    ISTP: {
        title: "鑑賞家的工具",
        clue: "在月島的工坊角落，有一件為你量身打造的工具...",
        moonMapHint: "尋找扳手圖標"
    },
    ISFP: {
        title: "探險家的畫布",
        clue: "月島的藝術工作室裡，有一幅未完成的傑作...",
        moonMapHint: "尋找調色盤圖標"
    },
    ESTP: {
        title: "企業家的賭注",
        clue: "月島的競技場中，有一場只為你設計的挑戰...",
        moonMapHint: "尋找骰子圖標"
    },
    ESFP: {
        title: "表演者的舞台",
        clue: "在月島的劇院聚光燈下，等著你的精彩演出...",
        moonMapHint: "尋找面具圖標"
    }
};
