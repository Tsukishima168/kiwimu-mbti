// Celebrity archetypes for personality resonance
export interface CelebrityArchetype {
    name: string;           // Chinese name
    nameEn: string;        // English name
    era: 'classic' | 'contemporary';  // Classic or contemporary
    resonanceTraits: string[];  // 3 resonance characteristics (Chinese)
    resonanceTraitsEn?: string[];  // 3 resonance characteristics (English)
    profession: string;     // Professional field (Chinese)
    professionEn?: string;  // Professional field (English)
    lifestyleStyle: string; // Personality style (not diet)
    dessertPairing: string; // Recommended KIWIMU dessert
    pairingReason: string;  // Why this dessert fits their personality
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
            professionEn: 'Entrepreneur & Engineer',
            resonanceTraits: [
                '長期戰略思維與願景規劃',
                '系統化解決複雜問題',
                '不受傳統框架限制的創新'
            ],
            resonanceTraitsEn: [
                'Long-term strategic thinking and visionary planning',
                'Systematic approach to solving complex problems',
                'Innovation unconstrained by conventional frameworks'
            ],
            lifestyleStyle: '極致效率、高濃度思考、5分鐘時間管理',
            dessertPairing: '北海道經典巴斯克',
            pairingReason: '濃烈直接的焦糖風味，不拖泥帶水，如同他極致效率的工作哲學'
        },
        {
            name: '克里斯多福·諾蘭',
            nameEn: 'Christopher Nolan',
            era: 'contemporary',
            profession: '導演、編劇',
            professionEn: 'Director & Screenwriter',
            resonanceTraits: [
                '複雜敘事結構設計',
                '追求完美的執行力',
                '深度思考時間與空間概念'
            ],
            resonanceTraitsEn: [
                'Designing intricate, multi-layered narrative structures',
                'Relentless pursuit of perfection in execution',
                'Deep contemplation of time and space as concepts'
            ],
            lifestyleStyle: '多層架構、精準計算、完美主義者',
            dessertPairing: '檸檬柚子千層蛋糕',
            pairingReason: '如同電影的多層敘事，每一層都精準計算、層次分明'
        }
    ],

    'INFJ': [
        {
            name: '卡爾·榮格',
            nameEn: 'Carl Jung',
            era: 'classic',
            profession: '心理學家',
            professionEn: 'Psychologist',
            resonanceTraits: [
                '洞察人性深層動機',
                '追求心靈成長與整合',
                '直覺理解象徵與原型'
            ],
            resonanceTraitsEn: [
                'Profound insight into the deep motivations of human nature',
                'A relentless pursuit of psychological growth and integration',
                'Intuitive grasp of symbols, archetypes, and the unconscious'
            ],
            lifestyleStyle: '深度內省、象徵思維、靈性探索',
            dessertPairing: '茶香巴斯克',
            pairingReason: '沈穩茶韻如同他對潛意識的深層探索，帶你潛入最深的內在宇宙'
        },
        {
            name: 'Lady Gaga',
            nameEn: 'Lady Gaga',
            era: 'contemporary',
            profession: '歌手、演員',
            professionEn: 'Singer & Actress',
            resonanceTraits: [
                '透過藝術表達深層情感',
                '倡導弱勢族群權益',
                '真實性與脆弱的勇氣'
            ],
            resonanceTraitsEn: [
                'Channeling deep emotions through fearless artistic expression',
                'Advocating for the marginalized and underrepresented',
                'The courage to be authentic, even in vulnerability'
            ],
            lifestyleStyle: '勇敢表達、藝術創作、深度情感',
            dessertPairing: '抹茶提拉米蘇',
            pairingReason: '表面強悍內心細膩的層次感，如同她透過表演傳遞深層的愛與真實'
        }
    ],

    'INTP': [
        {
            name: '愛因斯坦',
            nameEn: 'Albert Einstein',
            era: 'classic',
            profession: '物理學家',
            professionEn: 'Physicist',
            resonanceTraits: [
                '抽象理論建構',
                '質疑既有框架的勇氣',
                '長時間獨立思考'
            ],
            resonanceTraitsEn: [
                'Building abstract theoretical frameworks from first principles',
                'The courage to question and dismantle established paradigms',
                'Extended solitary thinking to reach breakthrough insight'
            ],
            lifestyleStyle: '理論推演、孤獨思考、打破常規',
            dessertPairing: '檸檬巴斯克',
            pairingReason: '清亮的酸度打破濃郁，如同他顛覆牛頓物理學的革命性思維'
        },
        {
            name: '馬克·祖克柏',
            nameEn: 'Mark Zuckerberg',
            era: 'contemporary',
            profession: '程式設計師、企業家',
            professionEn: 'Programmer & Entrepreneur',
            resonanceTraits: [
                '系統性問題解決',
                '邏輯驅動的決策模式',
                '持續優化與迭代思維'
            ],
            resonanceTraitsEn: [
                'Systematic, scalable approach to complex problem-solving',
                'Logic-driven decision-making at every level',
                'Continuous optimization and iterative improvement mindset'
            ],
            lifestyleStyle: '持續迭代、邏輯至上、系統思維',
            dessertPairing: '經典十勝原味千層',
            pairingReason: '結構精準、層次分明，如同他對平台架構的持續優化'
        }
    ],

    'INFP': [
        {
            name: '村上春樹',
            nameEn: 'Haruki Murakami',
            era: 'contemporary',
            profession: '作家',
            professionEn: 'Author',
            resonanceTraits: [
                '深刻的內在情感探索',
                '透過創作表達理想',
                '保持個人獨特世界觀'
            ],
            resonanceTraitsEn: [
                'Profound exploration of inner emotional landscapes',
                'Expressing personal ideals and dreams through creative work',
                'Maintaining a distinctly personal and idiosyncratic worldview'
            ],
            lifestyleStyle: '早晨儀式、文青pure、內在探索',
            dessertPairing: '北海道十勝戚風蛋糕',
            pairingReason: '輕盈但深刻的純粹，就像他早晨4點的寫作儀式一樣澄澈'
        },
        {
            name: 'Johnny Depp',
            nameEn: 'Johnny Depp',
            era: 'contemporary',
            profession: '演員',
            professionEn: 'Actor',
            resonanceTraits: [
                '選擇非主流角色',
                '藝術性高於商業考量',
                '忠於內在真實感受'
            ],
            resonanceTraitsEn: [
                'A preference for unconventional, offbeat character choices',
                'Placing artistic integrity above commercial considerations',
                'Unwavering loyalty to authentic inner feeling over expectation'
            ],
            lifestyleStyle: '藝術至上、非主流、真實自我',
            dessertPairing: '經典烤布丁',
            pairingReason: '最純粹直接的安撫，如同他對角色選擇的忠於內心'
        }
    ],

    'ENTJ': [
        {
            name: '史蒂夫·賈伯斯',
            nameEn: 'Steve Jobs',
            era: 'classic',
            profession: '企業家',
            professionEn: 'Entrepreneur',
            resonanceTraits: [
                '願景驅動的領導風格',
                '追求卓越與完美',
                '果斷的戰略決策'
            ],
            resonanceTraitsEn: [
                'Vision-driven leadership style that inspires entire industries',
                'Uncompromising pursuit of excellence and perfection',
                'Decisive strategic thinking with the confidence to act on it'
            ],
            lifestyleStyle: '完美主義、願景領導、絕不妥協',
            dessertPairing: '鹹蛋黃巴斯克',
            pairingReason: '獨特且強悍的風味組合，如同他對產品設計的絕不妥協'
        },
        {
            name: '瑪格麗特·柴契爾',
            nameEn: 'Margaret Thatcher',
            era: 'classic',
            profession: '政治家',
            professionEn: 'Politician',
            resonanceTraits: [
                '堅定的目標執行力',
                '不畏反對的領導勇氣',
                '系統性改革思維'
            ],
            resonanceTraitsEn: [
                'Unwavering focus on executing goals against all opposition',
                'The courage to lead decisively even when deeply unpopular',
                'Systemic and structural approach to reform and governance'
            ],
            lifestyleStyle: '鋼鐵意志、果斷決策、改革魄力',
            dessertPairing: '奶酒提拉米蘇',
            pairingReason: '微醺的權力展演，苦甜之間盡是掌控局勢的餘韻'
        }
    ],

    'ENTP': [
        {
            name: '小勞勃·道尼',
            nameEn: 'Robert Downey Jr.',
            era: 'contemporary',
            profession: '演員',
            professionEn: 'Actor',
            resonanceTraits: [
                '機智幽默的即興反應',
                '挑戰傳統角色詮釋',
                '從失敗中重新崛起'
            ],
            resonanceTraitsEn: [
                'Quick-witted, improvisational humor that commands any room',
                'Challenging and redefining conventional character archetypes',
                'The resilience to rise and reinvent after failure'
            ],
            lifestyleStyle: '即興創意、機智幽默、挑戰傳統',
            dessertPairing: '柚子蘋果提拉米蘇',
            pairingReason: '打破常規的驚喜風味，在每一次味覺挑戰中看見邊界'
        },
        {
            name: '伊隆·馬斯克',
            nameEn: 'Elon Musk',
            era: 'contemporary',
            profession: '創新者',
            professionEn: 'Innovator',
            resonanceTraits: [
                '顛覆性創新思維',
                '多領域跨界探索',
                '挑戰不可能的目標'
            ],
            resonanceTraitsEn: [
                'Disruptive thinking that overturns entire industry assumptions',
                'Cross-domain exploration spanning EVs, rockets, and AI',
                'Setting audacious targets that most deem impossible'
            ],
            lifestyleStyle: '跨界探索、顛覆思維、無限可能',
            dessertPairing: '巧克力布朗尼千層',
            pairingReason: '濃郁且多層次的爆發，如同他從電動車到火箭的跨界衝擊'
        }
    ],

    'ENFJ': [
        {
            name: '歐普拉·溫芙蕾',
            nameEn: 'Oprah Winfrey',
            era: 'contemporary',
            profession: '主持人、企業家',
            professionEn: 'TV Host & Entrepreneur',
            resonanceTraits: [
                '啟發他人成長的天賦',
                '真誠的情感連結',
                '倡導社會正向改變'
            ],
            resonanceTraitsEn: [
                'A gift for inspiring others to grow and find their purpose',
                'Genuine emotional connection that transcends the screen',
                'Championing positive social change through storytelling'
            ],
            lifestyleStyle: '啟發他人、真誠連結、正向影響',
            dessertPairing: '檸檬蘋果戚風蛋糕',
            pairingReason: '明亮如陽光的清新力量，溫暖並照亮每一個被遺忘的角落'
        },
        {
            name: '馬丁·路德·金',
            nameEn: 'Martin Luther King Jr.',
            era: 'classic',
            profession: '民權運動領袖',
            professionEn: 'Civil Rights Leader',
            resonanceTraits: [
                '理想主義的社會願景',
                '感召他人的演說魅力',
                '為信念奮鬥的決心'
            ],
            resonanceTraitsEn: [
                'An idealistic social vision that galvanized a movement',
                'The magnetic power to move others through speech alone',
                'Unwavering determination to fight for what is right'
            ],
            lifestyleStyle: '願景感召、演說魅力、堅定信念',
            dessertPairing: '莓果戚風蛋糕',
            pairingReason: '溫和友善的包覆感，如同他用演說凝聚人心的力量'
        }
    ],

    'ENFP': [
        {
            name: '羅賓·威廉斯',
            nameEn: 'Robin Williams',
            era: 'contemporary',
            profession: '演員、喜劇演員',
            professionEn: 'Actor & Comedian',
            resonanceTraits: [
                '充滿活力的創造力',
                '深刻的情感表達',
                '鼓舞他人的熱情'
            ],
            resonanceTraitsEn: [
                'Boundless creative energy that could fill any space',
                'Profound emotional depth beneath the surface of laughter',
                'The rare ability to uplift and energize others genuinely'
            ],
            lifestyleStyle: '活力創造、深刻情感、鼓舞熱情',
            dessertPairing: '草莓莓果千層蛋糕',
            pairingReason: '層次繽紛且富有生命力，裝滿奇奇怪怪且閃亮的靈感碎片'
        },
        {
            name: '艾倫·狄珍妮絲',
            nameEn: 'Ellen DeGeneres',
            era: 'contemporary',
            profession: '主持人、喜劇演員',
            professionEn: 'TV Host & Comedian',
            resonanceTraits: [
                '自然的社交魅力',
                '樂觀積極的人生態度',
                '真實做自己的勇氣'
            ],
            resonanceTraitsEn: [
                'Effortless social charisma that puts everyone at ease',
                'Consistently optimistic and forward-looking outlook on life',
                'The courage to be fully and unapologetically oneself'
            ],
            lifestyleStyle: '樂觀積極、社交魅力、真實自我',
            dessertPairing: '蜜香紅茶千層蛋糕',
            pairingReason: '溫暖香甜的療癒感，如同她帶給大家的歡笑與正能量'
        }
    ],

    'ISTJ': [
        {
            name: '華倫·巴菲特',
            nameEn: 'Warren Buffett',
            era: 'contemporary',
            profession: '投資家',
            professionEn: 'Investor',
            resonanceTraits: [
                '長期穩健的投資策略',
                '重視數據與事實',
                '紀律嚴謹的決策流程'
            ],
            resonanceTraitsEn: [
                'Long-term, patient investment strategy grounded in fundamentals',
                'Deep respect for data, evidence, and factual analysis',
                'Disciplined decision-making process with unwavering consistency'
            ],
            lifestyleStyle: '數據至上、紀律嚴謹、長期思維',
            dessertPairing: '經典十勝原味千層',
            pairingReason: '結構的絕對精準與對承諾的執著，最值得信賴的味覺基石'
        },
        {
            name: '安潔拉·梅克爾',
            nameEn: 'Angela Merkel',
            era: 'contemporary',
            profession: '政治家',
            professionEn: 'Politician',
            resonanceTraits: [
                '務實的問題解決',
                '穩定可靠的領導',
                '數據驅動的決策'
            ],
            resonanceTraitsEn: [
                'Pragmatic, results-focused approach to complex challenges',
                'Steady and reliable leadership that earns deep trust over time',
                'Data-driven decision-making grounded in evidence and analysis'
            ],
            lifestyleStyle: '務實穩健、數據驅動、可靠領導',
            dessertPairing: '經典提拉米蘇',
            pairingReason: '冷靜大膽的口感平衡，如同她穩定歐洲的務實決策'
        }
    ],

    'ISFJ': [
        {
            name: '德蕾莎修女',
            nameEn: 'Mother Teresa',
            era: 'classic',
            profession: '人道工作者',
            professionEn: 'Humanitarian',
            resonanceTraits: [
                '無私的服務精神',
                '對他人需求的敏感',
                '堅持實際行動幫助'
            ],
            resonanceTraitsEn: [
                'Selfless dedication to service without expectation of return',
                'Acute sensitivity to the unspoken needs of others',
                'A commitment to helping through tangible, direct action'
            ],
            lifestyleStyle: '無私服務、實際行動、溫柔堅持',
            dessertPairing: '經典烤布丁',
            pairingReason: '安全感的終極錨點，最純粹直接的溫柔安撫與回歸'
        },
        {
            name: '凱特·米道頓',
            nameEn: 'Kate Middleton',
            era: 'contemporary',
            profession: '王室成員',
            professionEn: 'Royalty',
            resonanceTraits: [
                '傳統價值的守護者',
                '溫暖體貼的關懷',
                '穩定支持的角色'
            ],
            resonanceTraitsEn: [
                'Guardian of traditional values and enduring institutions',
                'Warm, considerate care that feels genuine and personal',
                'The stabilizing force that quietly supports those around her'
            ],
            lifestyleStyle: '優雅傳統、溫暖體貼、穩定支持',
            dessertPairing: '北海道十勝戚風蛋糕',
            pairingReason: '輕盈柔軟的著陸點，在銳利的世界裡提供一場溫柔的安放'
        }
    ],

    'ESTJ': [
        {
            name: '傑克·威爾許',
            nameEn: 'Jack Welch',
            era: 'contemporary',
            profession: '企業管理者',
            professionEn: 'Business Executive',
            resonanceTraits: [
                '高效的組織管理',
                '明確的目標導向',
                '果斷的執行力'
            ],
            resonanceTraitsEn: [
                'Highly efficient organizational leadership and management',
                'Laser-focused goal orientation that drives measurable results',
                'Decisive execution — moving from decision to action with speed'
            ],
            lifestyleStyle: '高效執行、目標導向、果斷決策',
            dessertPairing: '鹹蛋黃巴斯克',
            pairingReason: '鋼鐵意志與濃郁核心的結合，穩健中帶有不容忽視的力量'
        },
        {
            name: '米雪兒·歐巴馬',
            nameEn: 'Michelle Obama',
            era: 'contemporary',
            profession: '律師、作家',
            professionEn: 'Lawyer & Author',
            resonanceTraits: [
                '有序的計劃執行',
                '實務導向的社會參與',
                '堅定的價值觀'
            ],
            resonanceTraitsEn: [
                'Organized, methodical approach to planning and execution',
                'Practical, grounded engagement with social and civic issues',
                'A strong, unwavering set of personal values that guides action'
            ],
            lifestyleStyle: '有序計劃、實務導向、堅定價值',
            dessertPairing: '茶香巴斯克',
            pairingReason: '沈穩茶韻收斂而有餘韻，如同她對社會議題的堅定倡議'
        }
    ],

    'ESFJ': [
        {
            name: '泰勒絲',
            nameEn: 'Taylor Swift',
            era: 'contemporary',
            profession: '歌手、詞曲創作人',
            professionEn: 'Singer-Songwriter',
            resonanceTraits: [
                '與粉絲建立深厚連結',
                '重視人際關係和諧',
                '關注他人感受'
            ],
            resonanceTraitsEn: [
                'Building deep, authentic connections with her fanbase',
                'Prioritizing harmony and warmth in all relationships',
                'Genuine attentiveness to how others around her feel'
            ],
            lifestyleStyle: '情感連結、關懷他人、社群經營',
            dessertPairing: '莓果戚風蛋糕',
            pairingReason: '溫和友善的包覆感，與摯愛分享這份純粹快樂的本質'
        },
        {
            name: '珍妮佛·加納',
            nameEn: 'Jennifer Garner',
            era: 'contemporary',
            profession: '演員',
            professionEn: 'Actress',
            resonanceTraits: [
                '溫暖的公眾形象',
                '家庭與社群價值',
                '實際幫助他人'
            ],
            resonanceTraitsEn: [
                'A warm, approachable public presence that feels genuine',
                'Deep commitment to family and community values',
                'Helping others through practical, hands-on action'
            ],
            lifestyleStyle: '溫暖親和、家庭優先、實際幫助',
            dessertPairing: '綜合水果戚風蛋糕',
            pairingReason: '點亮全場的色彩盛宴，如同她對家庭與社區的溫暖付出'
        }
    ],

    'ISTP': [
        {
            name: '克林·伊斯威特',
            nameEn: 'Clint Eastwood',
            era: 'contemporary',
            profession: '演員、導演',
            professionEn: 'Actor & Director',
            resonanceTraits: [
                '沉著冷靜的行動力',
                '實用主義的問題解決',
                '獨立自主的風格'
            ],
            resonanceTraitsEn: [
                'Cool-headed action that speaks louder than words ever could',
                'A pragmatic, no-frills approach to problem-solving',
                'A fiercely independent style that answers to no one'
            ],
            lifestyleStyle: '冷靜沉著、實用主義、獨立自主',
            dessertPairing: '經典提拉米蘇',
            pairingReason: '冷靜大膽的口感平衡，無需多言的硬派實力展現'
        },
        {
            name: '麥可·喬丹',
            nameEn: 'Michael Jordan',
            era: 'contemporary',
            profession: '籃球運動員',
            professionEn: 'Basketball Player',
            resonanceTraits: [
                '即時反應的專注力',
                '技術精湛的執行',
                '危機下的冷靜決斷'
            ],
            resonanceTraitsEn: [
                'Instant-reaction focus and sharp situational awareness',
                'Masterful technical execution refined through relentless practice',
                'Ice-cold composure and decisive judgment under pressure'
            ],
            lifestyleStyle: '極致專注、技術精湛、關鍵時刻',
            dessertPairing: '巧克力布朗尼千層',
            pairingReason: '極致感官的爆發體驗，如同他關鍵時刻的致勝一擊'
        }
    ],

    'ISFP': [
        {
            name: '李安',
            nameEn: 'Ang Lee',
            era: 'contemporary',
            profession: '導演',
            professionEn: 'Director',
            resonanceTraits: [
                '細膩的情感表達',
                '美學與藝術追求',
                '內斂的創作風格'
            ],
            resonanceTraitsEn: [
                'Delicate and nuanced emotional expression on screen',
                'A deep pursuit of aesthetics, beauty, and artistic truth',
                'A restrained, introspective creative style that speaks volumes'
            ],
            lifestyleStyle: '細膩情感、美學追求、內斂創作',
            dessertPairing: '抹茶提拉米蘇',
            pairingReason: '細膩美感的微苦回甘，用最溫柔的方式對抗世界的喧囂'
        },
        {
            name: '碧昂絲',
            nameEn: 'Beyoncé',
            era: 'contemporary',
            profession: '歌手、表演藝術家',
            professionEn: 'Singer & Performer',
            resonanceTraits: [
                '透過表演展現真我',
                '藝術性的自我表達',
                '情感豐富的創作'
            ],
            resonanceTraitsEn: [
                'Revealing her truest self through electrifying performance',
                'Artistic self-expression that pushes boundaries with intention',
                'Emotionally rich creative work that resonates at a deep level'
            ],
            lifestyleStyle: '藝術表達、情感豐富、真我展現',
            dessertPairing: '草莓莓果千層蛋糕',
            pairingReason: '透過層次豐富的莓果，展現最真實的藝術情感'
        }
    ],

    'ESTP': [
        {
            name: '唐納·川普',
            nameEn: 'Donald Trump',
            era: 'contemporary',
            profession: '企業家、政治家',
            professionEn: 'Entrepreneur & Politician',
            resonanceTraits: [
                '大膽的冒險決策',
                '即時反應與機會把握',
                '實用主義的談判'
            ],
            resonanceTraitsEn: [
                'Bold, high-stakes risk-taking in decision-making',
                'Rapid situational response and seizing opportunities',
                'Pragmatic, results-driven negotiation tactics'
            ],
            lifestyleStyle: '大膽冒險、即時反應、實用談判',
            dessertPairing: '鹹蛋黃巴斯克',
            pairingReason: '大膽創新的風味組合，如同他顛覆傳統的商業手法'
        },
        {
            name: '布魯斯·威利',
            nameEn: 'Bruce Willis',
            era: 'contemporary',
            profession: '演員',
            professionEn: 'Actor',
            resonanceTraits: [
                '行動導向的個性',
                '危機處理的冷靜',
                '直接了當的溝通'
            ],
            resonanceTraitsEn: [
                'Action-first mentality — doing over deliberating',
                'Steady, calm composure when handling high-pressure crises',
                'Blunt, direct communication that cuts right to the point'
            ],
            lifestyleStyle: '行動至上、危機處理、直接溝通',
            dessertPairing: '巧克力布朗尼千層',
            pairingReason: '極致感官的爆發體驗，追求速度與最直白的生命熱情'
        }
    ],

    'ESFP': [
        {
            name: '瑪麗蓮·夢露',
            nameEn: 'Marilyn Monroe',
            era: 'classic',
            profession: '演員',
            professionEn: 'Actress',
            resonanceTraits: [
                '自然的魅力與表演天賦',
                '活在當下的生活態度',
                '感染他人的熱情'
            ],
            resonanceTraitsEn: [
                'An effortless, natural magnetism and performance gift',
                'A fully present, live-for-the-moment approach to life',
                'The ability to infect an entire room with her warmth and energy'
            ],
            lifestyleStyle: '魅力四射、活在當下、感染熱情',
            dessertPairing: '綜合水果戚風蛋糕',
            pairingReason: '點亮全場的色彩盛宴，將每一刻都轉化為永恆的快樂慶典'
        },
        {
            name: '威爾·史密斯',
            nameEn: 'Will Smith',
            era: 'contemporary',
            profession: '演員、饒舌歌手',
            professionEn: 'Actor & Rapper',
            resonanceTraits: [
                '充滿活力的表演力',
                '樂觀積極的人生觀',
                '與人自然互動的魅力'
            ],
            resonanceTraitsEn: [
                'High-energy performance ability that captivates any audience',
                'An unwavering, sunny optimism about life and people',
                'Natural, disarming charm in every personal interaction'
            ],
            lifestyleStyle: '活力四射、樂觀積極、自然互動',
            dessertPairing: '草莓莓果千層蛋糕',
            pairingReason: '層次繽紛且充滿活力，如同他感染人心的樂觀能量'
        }
    ],
};

export const getCelebrityArchetypes = (type: string): CelebrityArchetype[] => {
    return CELEBRITY_ARCHETYPES[type] || [];
};
