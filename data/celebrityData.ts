// Celebrity archetypes for personality resonance
export interface CelebrityArchetype {
    name: string;           // Chinese name
    nameEn: string;        // English name  
    era: 'classic' | 'contemporary';  // Classic or contemporary
    resonanceTraits: string[];  // 3 resonance characteristics
    profession: string;     // Professional field
}

// Celebrity archetypes for each MBTI type
// Mix of classic (historical/legendary) and contemporary (modern) figures
export const CELEBRITY_ARCHETYPES: Record<string, CelebrityArchetype[]> = {
    'INTJ': [
        {
            name: '埃隆·馬斯克',
            nameEn: 'Elon Musk',
            era: 'contemporary',
            profession: '企業家、工程師',
            resonanceTraits: [
                '長期戰略思維與願景規劃',
                '系統化解決複雜問題',
                '不受傳統框架限制的創新'
            ]
        },
        {
            name: '克里斯多福·諾蘭',
            nameEn: 'Christopher Nolan',
            era: 'contemporary',
            profession: '導演、編劇',
            resonanceTraits: [
                '複雜敘事結構設計',
                '追求完美的執行力',
                '深度思考時間與空間概念'
            ]
        }
    ],

    'INFJ': [
        {
            name: '卡爾·榮格',
            nameEn: 'Carl Jung',
            era: 'classic',
            profession: '心理學家',
            resonanceTraits: [
                '洞察人性深層動機',
                '追求心靈成長與整合',
                '直覺理解象徵與原型'
            ]
        },
        {
            name: 'Lady Gaga',
            nameEn: 'Lady Gaga',
            era: 'contemporary',
            profession: '歌手、演員',
            resonanceTraits: [
                '透過藝術表達深層情感',
                '倡導弱勢族群權益',
                '真實性與脆弱的勇氣'
            ]
        }
    ],

    'INTP': [
        {
            name: '愛因斯坦',
            nameEn: 'Albert Einstein',
            era: 'classic',
            profession: '物理學家',
            resonanceTraits: [
                '抽象理論建構',
                '質疑既有框架的勇氣',
                '長時間獨立思考'
            ]
        },
        {
            name: '馬克·祖克柏',
            nameEn: 'Mark Zuckerberg',
            era: 'contemporary',
            profession: '程式設計師、企業家',
            resonanceTraits: [
                '系統性問題解決',
                '邏輯驅動的決策模式',
                '持續優化與迭代思維'
            ]
        }
    ],

    'INFP': [
        {
            name: '村上春樹',
            nameEn: 'Haruki Murakami',
            era: 'contemporary',
            profession: '作家',
            resonanceTraits: [
                '深刻的內在情感探索',
                '透過創作表達理想',
                '保持個人獨特世界觀'
            ]
        },
        {
            name: 'Johnny Depp',
            nameEn: 'Johnny Depp',
            era: 'contemporary',
            profession: '演員',
            resonanceTraits: [
                '選擇非主流角色',
                '藝術性高於商業考量',
                '忠於內在真實感受'
            ]
        }
    ],

    'ENTJ': [
        {
            name: '史蒂夫·賈伯斯',
            nameEn: 'Steve Jobs',
            era: 'classic',
            profession: '企業家',
            resonanceTraits: [
                '願景驅動的領導風格',
                '追求卓越與完美',
                '果斷的戰略決策'
            ]
        },
        {
            name: '瑪格麗特·柴契爾',
            nameEn: 'Margaret Thatcher',
            era: 'classic',
            profession: '政治家',
            resonanceTraits: [
                '堅定的目標執行力',
                '不畏反對的領導勇氣',
                '系統性改革思維'
            ]
        }
    ],

    'ENTP': [
        {
            name: '小勞勃·道尼',
            nameEn: 'Robert Downey Jr.',
            era: 'contemporary',
            profession: '演員',
            resonanceTraits: [
                '機智幽默的即興反應',
                '挑戰傳統角色詮釋',
                '從失敗中重新崛起'
            ]
        },
        {
            name: '伊隆·馬斯克',
            nameEn: 'Elon Musk',
            era: 'contemporary',
            profession: '創新者',
            resonanceTraits: [
                '顛覆性創新思維',
                '多領域跨界探索',
                '挑戰不可能的目標'
            ]
        }
    ],

    'ENFJ': [
        {
            name: '歐普拉·溫芙蕾',
            nameEn: 'Oprah Winfrey',
            era: 'contemporary',
            profession: '主持人、企業家',
            resonanceTraits: [
                '啟發他人成長的天賦',
                '真誠的情感連結',
                '倡導社會正向改變'
            ]
        },
        {
            name: '馬丁·路德·金',
            nameEn: 'Martin Luther King Jr.',
            era: 'classic',
            profession: '民權運動領袖',
            resonanceTraits: [
                '理想主義的社會願景',
                '感召他人的演說魅力',
                '為信念奮鬥的決心'
            ]
        }
    ],

    'ENFP': [
        {
            name: '羅賓·威廉斯',
            nameEn: 'Robin Williams',
            era: 'contemporary',
            profession: '演員、喜劇演員',
            resonanceTraits: [
                '充滿活力的創造力',
                '深刻的情感表達',
                '鼓舞他人的熱情'
            ]
        },
        {
            name: '艾倫·狄珍妮絲',
            nameEn: 'Ellen DeGeneres',
            era: 'contemporary',
            profession: '主持人、喜劇演員',
            resonanceTraits: [
                '自然的社交魅力',
                '樂觀積極的人生態度',
                '真實做自己的勇氣'
            ]
        }
    ],

    'ISTJ': [
        {
            name: '華倫·巴菲特',
            nameEn: 'Warren Buffett',
            era: 'contemporary',
            profession: '投資家',
            resonanceTraits: [
                '長期穩健的投資策略',
                '重視數據與事實',
                '紀律嚴謹的決策流程'
            ]
        },
        {
            name: '安潔拉·梅克爾',
            nameEn: 'Angela Merkel',
            era: 'contemporary',
            profession: '政治家',
            resonanceTraits: [
                '務實的問題解決',
                '穩定可靠的領導',
                '數據驅動的決策'
            ]
        }
    ],

    'ISFJ': [
        {
            name: '德蕾莎修女',
            nameEn: 'Mother Teresa',
            era: 'classic',
            profession: '人道工作者',
            resonanceTraits: [
                '無私的服務精神',
                '對他人需求的敏感',
                '堅持實際行動幫助'
            ]
        },
        {
            name: '凱特·米道頓',
            nameEn: 'Kate Middleton',
            era: 'contemporary',
            profession: '王室成員',
            resonanceTraits: [
                '傳統價值的守護者',
                '溫暖體貼的關懷',
                '穩定支持的角色'
            ]
        }
    ],

    'ESTJ': [
        {
            name: '傑克·威爾許',
            nameEn: '傑克·威爾許',
            era: 'contemporary',
            profession: '企業管理者',
            resonanceTraits: [
                '高效的組織管理',
                '明確的目標導向',
                '果斷的執行力'
            ]
        },
        {
            name: '米雪兒·歐巴馬',
            nameEn: 'Michelle Obama',
            era: 'contemporary',
            profession: '律師、作家',
            resonanceTraits: [
                '有序的計劃執行',
                '實務導向的社會參與',
                '堅定的價值觀'
            ]
        }
    ],

    'ESFJ': [
        {
            name: '泰勒絲',
            nameEn: 'Taylor Swift',
            era: 'contemporary',
            profession: '歌手、詞曲創作人',
            resonanceTraits: [
                '與粉絲建立深厚連結',
                '重視人際關係和諧',
                '關注他人感受'
            ]
        },
        {
            name: '珍妮佛·加納',
            nameEn: 'Jennifer Garner',
            era: 'contemporary',
            profession: '演員',
            resonanceTraits: [
                '溫暖的公眾形象',
                '家庭與社群價值',
                '實際幫助他人'
            ]
        }
    ],

    'ISTP': [
        {
            name: '克林·伊斯威特',
            nameEn: 'Clint Eastwood',
            era: 'contemporary',
            profession: '演員、導演',
            resonanceTraits: [
                '沉著冷靜的行動力',
                '實用主義的問題解決',
                '獨立自主的風格'
            ]
        },
        {
            name: '麥可·喬丹',
            nameEn: 'Michael Jordan',
            era: 'contemporary',
            profession: '籃球運動員',
            resonanceTraits: [
                '即時反應的專注力',
                '技術精湛的執行',
                '危機下的冷靜決斷'
            ]
        }
    ],

    'ISFP': [
        {
            name: '李安',
            nameEn: 'Ang Lee',
            era: 'contemporary',
            profession: '導演',
            resonanceTraits: [
                '細膩的情感表達',
                '美學與藝術追求',
                '內斂的創作風格'
            ]
        },
        {
            name: '碧昂絲',
            nameEn: 'Beyoncé',
            era: 'contemporary',
            profession: '歌手、表演藝術家',
            resonanceTraits: [
                '透過表演展現真我',
                '藝術性的自我表達',
                '情感豐富的創作'
            ]
        }
    ],

    'ESTP': [
        {
            name: '唐納·川普',
            nameEn: 'Donald Trump',
            era: 'contemporary',
            profession: '企業家、政治家',
            resonanceTraits: [
                '大膽的冒險決策',
                '即時反應與機會把握',
                '實用主義的談判'
            ]
        },
        {
            name: '布魯斯·威利',
            nameEn: 'Bruce Willis',
            era: 'contemporary',
            profession: '演員',
            resonanceTraits: [
                '行動導向的個性',
                '危機處理的冷靜',
                '直接了當的溝通'
            ]
        }
    ],

    'ESFP': [
        {
            name: '瑪麗蓮·夢露',
            nameEn: 'Marilyn Monroe',
            era: 'classic',
            profession: '演員',
            resonanceTraits: [
                '自然的魅力與表演天賦',
                '活在當下的生活態度',
                '感染他人的熱情'
            ]
        },
        {
            name: '威爾·史密斯',
            nameEn: 'Will Smith',
            era: 'contemporary',
            profession: '演員、饒舌歌手',
            resonanceTraits: [
                '充滿活力的表演力',
                '樂觀積極的人生觀',
                '與人自然互動的魅力'
            ]
        }
    ],
};

export const getCelebrityArchetypes = (type: string): CelebrityArchetype[] => {
    return CELEBRITY_ARCHETYPES[type] || [];
};
