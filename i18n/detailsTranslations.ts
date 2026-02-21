export type DetailsTranslation = {
    strengths: string[];
    blindSpots: string[];
    career: {
        style: string;
        advice: string;
    };
    relationships: {
        style: string;
        advice: string;
    };
};

export const detailsTranslations: Record<string, Record<'en' | 'ja' | 'ko', DetailsTranslation>> = {
    INTJ: {
        en: {
            strengths: ["Strategic Vision", "Strong Logical Analysis", "Independent", "Pursues Excellence"],
            blindSpots: ["Can seem arrogant", "Overrides emotions", "Overthinking", "Impatient with details"],
            career: { style: "Excellent architect or strategist. Needs autonomy.", advice: "Try adding more empathy in communication." },
            relationships: { style: "Seeks an intellectual partner rather than pure emotional dependence.", advice: "Love isn't a debate; learn to accept and express feelings." }
        },
        ja: {
            strengths: ["長期的な戦略的ビジョン", "高い論理的分析力", "独立心が強い", "卓越性の追求"],
            blindSpots: ["傲慢に見えがち", "他人の感情を軽視", "考えすぎ", "細部への忍耐不足"],
            career: { style: "優れた建築家や戦略家。自律性を必要とします。", advice: "コミュニケーションにもっと共感を加えましょう。" },
            relationships: { style: "知的に対等なパートナーを求めます。", advice: "愛は議論ではありません。感情を受け入れ表現することを学びましょう。" }
        },
        ko: {
            strengths: ["장기적인 전략적 비전", "뛰어난 논리적 분석력", "독립적", "탁월함 추구"],
            blindSpots: ["오만해 보일 수 있음", "타인의 감정 간과", "과도한 생각", "세부 사항에 대한 인내심 부족"],
            career: { style: "뛰어난 기획자나 전략가. 높은 자율성이 필요합니다.", advice: "의사소통 시 약간의 공감 능력을 더해보세요." },
            relationships: { style: "지적으로 대등한 파트너를 찾습니다.", advice: "사랑은 토론이 아닙니다. 감정을 받아들이고 표현하는 법을 배우세요." }
        }
    },
    INTP: {
        en: {
            strengths: ["Innovative Thinking", "Objective & Fair", "Quick Learner", "Analytical"],
            blindSpots: ["Lacks practical sense", "Insensitive to feelings", "Procrastination", "Theory over execution"],
            career: { style: "Suited for roles requiring high intellect and complex problem-solving.", advice: "Translate your ideas into simple language and focus on finishing tasks." },
            relationships: { style: "Rational romantic. Wants a partner to debate intellectually with.", advice: "Learn to express your feelings verbally. Silence can be misunderstood as coldness." }
        },
        ja: {
            strengths: ["革新的な思考", "客観的で公平", "学習能力が高い", "分析力"],
            blindSpots: ["現実感覚の欠如", "感情に鈍感", "先延ばし", "実行より理論"],
            career: { style: "高い知能と複雑な問題解決を必要とする仕事に向いています。", advice: "アイデアを分かりやすい言葉で伝え、タスクを終わらせることに集中しましょう。" },
            relationships: { style: "理性的ロマンチスト。知的な議論を楽しめるパートナーを求めます。", advice: "感情を言葉で表現することを学びましょう。沈黙は冷たさと誤解されがちです。" }
        },
        ko: {
            strengths: ["혁신적인 사고방식", "객관적이고 공정함", "빠른 학습 능력", "분석력"],
            blindSpots: ["현실 감각 부족", "감정에 둔감함", "미루는 습관", "이론이 실행보다 앞섬"],
            career: { style: "높은 지능과 복잡한 문제 해결이 요구되는 직무에 적합합니다.", advice: "아이디어를 쉬운 언어로 전달하고 일을 끝마치는 데 집중하세요." },
            relationships: { style: "이성적인 로맨티스트. 지적인 토론을 즐길 수 있는 파트너를 원합니다.", advice: "감정을 말로 표현하는 법을 배우세요. 침묵은 차가움으로 오해받을 수 있습니다." }
        }
    },
    ENTJ: {
        en: {
            strengths: ["Executive Decision Making", "Strategic Planning", "Confident", "Operational Efficiency"],
            blindSpots: ["Can seem ruthless", "Arrogant", "Impatient", "Ignores others' feelings"],
            career: { style: "Ideal for leading organizations or pioneering new markets.", advice: "Learn to wait for others. Show more human empathy instead of just demanding results." },
            relationships: { style: "Power couple dynamic. Looks for a partner who fights alongside them.", advice: "Don't treat your partner like a subordinate. Show your vulnerability." }
        },
        ja: {
            strengths: ["経営陣レベルの意思決定", "戦略的計画", "自信", "運営の効率化"],
            blindSpots: ["冷酷に見えがち", "傲慢", "忍耐不足", "他人の感情を軽視"],
            career: { style: "組織を率いたり、新市場を開拓するのに最適です。", advice: "他人を待つことを学びましょう。結果だけでなく人間的な共感を示してください。" },
            relationships: { style: "対等に戦えるパートナーを探します。", advice: "パートナーを部下のように扱わないでください。弱さを見せることも大切です。" }
        },
        ko: {
            strengths: ["경영진급 의사결정", "전략적 기획", "자신감", "운영 효율성"],
            blindSpots: ["냉혹해 보일 수 있음", "오만함", "인내심 부족", "타인의 감정 경시"],
            career: { style: "조직을 이끌거나 새로운 시장을 개척하는 일에 이상적입니다.", advice: "타인을 기다려주는 법을 배우세요. 결과만 요구하기보다 인간적인 공감을 보여주세요." },
            relationships: { style: "동등한 위치에서 함께 싸울 파트너를 찾습니다.", advice: "파트너를 부하 직원처럼 대하지 마세요. 약점을 드러내는 것도 필요합니다." }
        }
    },
    ENTP: {
        en: {
            strengths: ["Brilliant", "Creative", "Highly Adaptable", "Strategic Thinking"],
            blindSpots: ["Argumentative", "Lacks follow-through", "Ignores feelings", "Gets bored easily"],
            career: { style: "Thrives in innovative startups and solving complex problems.", advice: "Turn your destructive tendencies into constructive reform. Learn to finish boring details." },
            relationships: { style: "Attracted to smart, independent individuals.", advice: "Learn to yield in arguments. Respecting the relationship is more important than winning." }
        },
        ja: {
            strengths: ["頭脳明晰", "創造力", "高い適応力", "戦略的思考"],
            blindSpots: ["議論好き", "最後までやり遂げない", "感情の無視", "すぐ飽きる"],
            career: { style: "革新的なスタートアップや複雑な問題解決に向いています。", advice: "退屈な細部を終わらせることを学び、破壊的な傾向を建設的な改革に変えましょう。" },
            relationships: { style: "賢く自立した人に惹かれます。", advice: "議論で譲ることを学びましょう。勝つことより関係を大切にしてください。" }
        },
        ko: {
            strengths: ["명석함", "창의력", "탁월한 적응력", "전략적 사고"],
            blindSpots: ["논쟁을 즐김", "마무리가 약함", "감정 무시", "쉽게 지루해함"],
            career: { style: "혁신적인 스타트업과 복잡한 문제 해결에 적합합니다.", advice: "지루한 세부 사항을 마무리하는 법을 배우고 건전한 개혁에 힘쓰세요." },
            relationships: { style: "똑똑하고 독립적인 사람에게 끌립니다.", advice: "논쟁에서 양보하는 법을 배우세요. 이기는 것보다 관계가 더 중요합니다." }
        }
    },
    INFJ: {
        en: {
            strengths: ["Sharp Intuition", "Deep Empathy", "Unwavering Dedication", "Insightful"],
            blindSpots: ["Absorbs others' pain", "Perfectionism delays action", "Oversensitive to criticism", "Neglects physical needs"],
            career: { style: "Needs meaningful work. Thrives in roles offering creative independence.", advice: "Don't let perfectionism paralyze you. Learn to set emotional boundaries at work." },
            relationships: { style: "Seeks a soulmate to forge a deep, spiritual connection.", advice: "Don't idealize your partner. Accept their flaws and communicate your unique needs clearly." }
        },
        ja: {
            strengths: ["鋭い直感", "深い共感力", "信念への献身", "本質を見抜く力"],
            blindSpots: ["他人の感情を吸収しすぎる", "完璧主義による遅れ", "批判に敏感", "身体的欲求の軽視"],
            career: { style: "意義のある仕事を求めます。独立した創造的な環境が向いています。", advice: "完璧主義にとらわれずに行動してください。職場での感情の境界線を引きましょう。" },
            relationships: { style: "深く精神的なつながりを持つソウルメイトを探します。", advice: "パートナーを理想化せず、欠点を受け入れましょう。自分のニーズを明確に伝えてください。" }
        },
        ko: {
            strengths: ["날카로운 직관", "깊은 공감 능력", "신념에 대한 헌신", "본질을 뚫어보는 눈"],
            blindSpots: ["타인의 감정 흡수", "완벽주의로 인한 지연", "비판에 예민함", "신체적 요구 소홀"],
            career: { style: "의미 있는 일이 필요합니다. 독립적이고 창의적인 환경에 적합합니다.", advice: "완벽주의에 사로잡히지 마세요. 직장에서는 감정적인 선을 긋는 법을 배우세요." },
            relationships: { style: "깊고 정신적인 교감을 나눌 소울메이트를 찾습니다.", advice: "파트너를 이상화하지 마세요. 결점을 수용하고 자신의 필요를 명확히 표현하세요." }
        }
    },
    INFP: {
        en: {
            strengths: ["Rich Imagination", "Pure Authenticity", "High Emotional Intelligence", "Open-minded"],
            blindSpots: ["Prone to be unrealistic", "Hurt easily", "Lacks stamina to finish", "Avoids conflict"],
            career: { style: "Needs a free, highly creative environment where personal values align with work.", advice: "Build daily routines to turn your brilliant ideas into reality instead of escaping." },
            relationships: { style: "Dreams of magical, devoted romance.", advice: "Don't ghost your partner when resolving real-world conflicts. Face the tough conversations." }
        },
        ja: {
            strengths: ["豊かな想像力", "純粋な真実性", "高い感情知能", "偏見のない心"],
            blindSpots: ["非現実的になりがち", "傷つきやすい", "最後までやり遂げる持久力不足", "対立を避ける"],
            career: { style: "価値観が一致する自由で創造的な環境が必要です。", advice: "逃避するのではなく、アイデアを現実に変えるための毎日の習慣を作りましょう。" },
            relationships: { style: "魔法のような献身的なロマンスを夢見ます。", advice: "葛藤が生じたときには逃げ出さず、正面から対話することを学びましょう。" }
        },
        ko: {
            strengths: ["풍부한 상상력", "순수한 진정성", "높은 감수성", "열린 마음"],
            blindSpots: ["비현실적 성향", "쉽게 상처받음", "마무리하는 지구력 부족", "갈등 회피"],
            career: { style: "가치관과 일치하는 자유롭고 창의적인 환경이 필요합니다.", advice: "도피하지 말고 아이디어를 현실로 만들기 위한 매일의 루틴을 만드세요." },
            relationships: { style: "마법 같고 헌신적인 로맨스를 꿈꿉니다.", advice: "갈등이 생겼을 때 회피하지 말고 정면으로 대화하는 법을 배우세요." }
        }
    },
    ENFJ: {
        en: {
            strengths: ["Inspiring Persuasion", "Overwhelming Empathy", "Natural Leadership", "Passionate"],
            blindSpots: ["Overly idealistic", "Vulnerable to criticism", "Over-controlling", "Avoids hard truths"],
            career: { style: "Perfect as a coach, facilitator, or transformational leader.", advice: "Add a bit of business 'coolness'. You don't need to save everyone. Take care of yourself." },
            relationships: { style: "Romantic giver who wants to build an empire with their partner.", advice: "Don't micromanage your partner's growth. Supporting silently is often more powerful." }
        },
        ja: {
            strengths: ["インスピレーションを与える説得力", "圧倒的な共感力", "生まれながらのリーダーシップ", "情熱"],
            blindSpots: ["理想が高すぎる", "批判に弱い", "過剰な干渉", "不都合な真実を避ける"],
            career: { style: "コーチ、ファシリテーター、変革的リーダーに最適です。", advice: "ビジネス上の「冷徹さ」も学びましょう。全員を救う必要はありません。自分を大切に。" },
            relationships: { style: "パートナーと共に帝国を築きたいと願うロマンチスト。", advice: "パートナーの成長を細かくコントロールしないでください。静かに見守ることも大切です。" }
        },
        ko: {
            strengths: ["영감을 주는 설득력", "압도적인 공감 능력", "타고난 리더십", "열정"],
            blindSpots: ["지나치게 높은 이상", "비판에 취약함", "과도한 통제/간섭", "불편한 진실 회피"],
            career: { style: "코치, 조력자, 조직 변화를 이끄는 리더에 완벽합니다.", advice: "때로는 비즈니스적인 냉정함을 가지세요. 모든 사람을 구원할 필요는 없습니다." },
            relationships: { style: "파트너와 함께 세상을 지배하길 원하는 로맨티스트입니다.", advice: "파트너의 성장을 마이크로매니징하지 마세요. 묵묵히 곁을 지키는 것도 큰 힘이 됩니다." }
        }
    },
    ENFP: {
        en: {
            strengths: ["Fresh Ideas", "Excellent Communicator", "Endless Enthusiasm", "Insightful"],
            blindSpots: ["Easily distracted", "Over-emotional", "Overthinking", "Zero patience for rules"],
            career: { style: "A catalyst in brainstorming. Thrives in highly creative, dynamic environments.", advice: "Train yourself to finish what you start. Don't lose your potential by neglecting boring details." },
            relationships: { style: "Needs unpredictable passion and a partner willing to explore.", advice: "Don't over-analyze your partner's quiet moments. Comfortable silence is part of adult relationships." }
        },
        ja: {
            strengths: ["斬新な発想", "優れたコミュニケーション力", "無限の情熱", "洞察力"],
            blindSpots: ["気が散りやすい", "感情過多", "考えすぎ", "規則への忍耐がゼロ"],
            career: { style: "創造的でダイナミックな環境での起爆剤となります。", advice: "始めたことを最後までやり遂げる訓練をしてください。退屈な細部を無視しないでください。" },
            relationships: { style: "予測不可能な情熱と冒険心を共有できるパートナーを求めます。", advice: "パートナーの静かな瞬間を深読みしすぎないでください。沈黙を共有することも大人の愛です。" }
        },
        ko: {
            strengths: ["신선한 발상", "탁월한 의사소통", "무한한 열정", "통찰력"],
            blindSpots: ["산만함", "감정 과잉", "생각이 너무 많음", "규칙에 대한 인내심 제로"],
            career: { style: "창의적이고 역동적인 환경에서 훌륭한 기폭제 역할을 합니다.", advice: "시작한 일을 끝맺는 훈련을 하세요. 지루한 세부 사항을 놓치지 마세요." },
            relationships: { style: "예측 불가능한 열정과 모험심이 강한 파트너를 원합니다.", advice: "파트너의 침묵을 너무 과도하게 분석하지 마세요. 편안한 침묵도 어른스러운 사랑의 일부입니다." }
        }
    },
    ISTJ: {
        en: {
            strengths: ["Straightforward Honesty", "Strong Responsibility", "Meticulously Detailed", "Strict with rules"],
            blindSpots: ["Too stubborn", "Zero flexibility", "Lacks situational awareness", "Resists change"],
            career: { style: "A gatekeeper who prefers clear systems, stable environments, and manuals.", advice: "Don't become an 'inflexible dinosaur.' Open up to new ways and learn to delegate." },
            relationships: { style: "Expresses heavy love through practical support and stability, not cheesy words.", advice: "Let go of your obsession with the 'right answers.' Your partner often just needs empathy, not a lecture." }
        },
        ja: {
            strengths: ["実直さ", "強い責任感", "細部への徹底したこだわり", "規則の厳守"],
            blindSpots: ["頑固すぎる", "柔軟性ゼロ", "状況を読むのが苦手", "変化への抵抗"],
            career: { style: "明確なシステムとマニュアルを好む完璧なゲートキーパーです。", advice: "融通のきかない人にならないでください。新しい方法に心を開き、人に仕事を任せましょう。" },
            relationships: { style: "甘い言葉よりも、実用的な行動と安定で愛を表現します。", advice: "『正解』への固執を手放しましょう。正論よりも共感が必要な時があります。" }
        },
        ko: {
            strengths: ["정직함", "강한 책임감", "철저한 꼼꼼함", "규칙 엄수"],
            blindSpots: ["너무 완고함", "융통성 제로", "눈치 부족", "변화 거부"],
            career: { style: "명확한 체계와 안정성을 선호하는 완벽한 문지기입니다.", advice: "융통성 없는 꼰대가 되지 마세요. 새로운 방식에 마음을 열고 일을 위임하는 법을 배우세요." },
            relationships: { style: "로맨틱한 말보다는 실질적인 도움과 안정감으로 사랑을 표현합니다.", advice: "정답에 대한 집착을 내려놓으세요. 때로는 팩트 폭력보다 따뜻한 공감이 필요합니다." }
        }
    },
    ISFJ: {
        en: {
            strengths: ["Warm and Caring", "Icon of Patience", "Practical Sense", "Excellent Observer"],
            blindSpots: ["Unable to say NO", "Over-sacrificing", "Bound by tradition", "Suppresses own feelings"],
            career: { style: "Thrives when supporting others in a harmonious environment. Needs to feel essential.", advice: "Set strict boundaries at work so you aren't taken advantage of. Claim credit for your hard work." },
            relationships: { style: "The textbook devoted partner who wants to build a warm, stable nest.", advice: "Don't expect your partner to read your mind. Voice your needs clearly. Your feelings matter just as much." }
        },
        ja: {
            strengths: ["思いやり", "忍耐の象徴", "実用的な感覚", "優れた観察力"],
            blindSpots: ["NOと言えない", "自己犠牲が過ぎる", "伝統に縛られる", "感情を抑え込む"],
            career: { style: "調和のとれた環境で他人をサポートすることに向いています。", advice: "職場では明確な境界線を引き、利用されないように注意してください。自分の成果をアピールしましょう。" },
            relationships: { style: "温かく安定した家庭を築きたいと願う献身的なパートナーです。", advice: "相手が心の内を読んでくれると期待しないでください。自分の要望はちゃんと言葉にして伝えましょう。" }
        },
        ko: {
            strengths: ["다정다감함", "인내심의 아이콘", "실용적인 감각", "탁월한 관찰력"],
            blindSpots: ["거절을 못함(No 콤플렉스)", "지나친 자기 희생", "관습에 얽매임", "자신의 감정 억누름"],
            career: { style: "조화로운 환경에서 타인을 지원할 때 빛이 납니다.", advice: "직장에서 확실하게 선을 긋는 법을 배우세요. 호구가 되지 말고 당신의 성과를 어필하세요." },
            relationships: { style: "안정적인 울타리를 꾸리길 원하는 헌신적인 파트너입니다.", advice: "당신의 마음을 파트너가 다 알아줄 거라 기대하지 마세요. 원하는 것을 명확히 말로 표현하세요." }
        }
    },
    ESTJ: {
        en: {
            strengths: ["Overwhelming Leadership", "Strong Responsibility", "Ultra-efficient", "Iron Will"],
            blindSpots: ["Dictatorial tendencies", "Lacks empathy", "Inflexible", "Severe workaholic"],
            career: { style: "A natural leader excelling in management, administration, and execution of structured goals.", advice: "Don't choke your team. Listen to opposing views for breakthroughs and consciously praise your staff." },
            relationships: { style: "Shows love by providing solid financial stability and dutiful commitment.", advice: "Stop managing your family like a corporation. Put down the 'manager badge' and show your softer side." }
        },
        ja: {
            strengths: ["圧倒的な統率力", "強い責任感", "超高効率", "鋼の意志"],
            blindSpots: ["独裁的", "共感力の欠如", "融通がきかない", "重度のワーカーホリック"],
            career: { style: "経営、行政、または目標達成に向けた実行において能力を発揮します。", advice: "チームを締め付けすぎないでください。反対意見にも耳を傾け、意図的に褒めるよう努めましょう。" },
            relationships: { style: "経済的な安定と責任ある約束で愛を表現します。", advice: "家族を会社のように管理しないでください。「管理職のバッジ」を外し、柔らかい一面を見せましょう。" }
        },
        ko: {
            strengths: ["압도적인 통솔력", "강한 책임감", "초고효율성", "불굴의 강철 멘탈"],
            blindSpots: ["독단적(꼰대 기질)", "공감 능력 부족", "융통성 없음", "심각한 워커홀릭"],
            career: { style: "경영 및 목표 달성 직무에서 압도적인 능력을 발휘하는 천상 리더입니다.", advice: "직원들을 너무 숨 막히게 하지 마세요. 반대 의견에 귀 기울이고 의식적으로 칭찬을 던져주세요." },
            relationships: { style: "물질적 안정과 묵직한 책임감으로 사랑을 표현합니다.", advice: "가정을 주식회사처럼 경영하려 하지 마세요. 잔소리 대신 안아주고 끝까지 이야기를 들어주는 것이 필요합니다." }
        }
    },
    ESFJ: {
        en: {
            strengths: ["Endless Loyalty", "Exceptional Hospitality", "Grounded in Reality", "Team-oriented"],
            blindSpots: ["Lacks own strict opinions", "Emotional manipulation", "Excessive sacrifice", "Can't stand being alone"],
            career: { style: "Shines in frontline networking, service, or education fields. Needs a warm team vibe.", advice: "Separate 'doing a favor' from your actual KPI. Advance your career with hard data, not just social likability." },
            relationships: { style: "100% genuine and dedicated. Highly values anniversaries and fast communication (texts).", advice: "Don't guilt-trip your partner for your sacrifices. Give them breathing room; independence strengthens the bond." }
        },
        ja: {
            strengths: ["無限の忠誠心", "卓越したおもてなし", "現実的", "チーム志向"],
            blindSpots: ["自分の意見を持たない", "感情的な押し付け", "過剰な自己犠牲", "独りを耐えられない"],
            career: { style: "対人ネットワークや教育の分野で輝きます。温かいチームの雰囲気を重視します。", advice: "「親切」と「業務目標」を分けて考えましょう。社交性だけでなく、データと実績で勝負してください。" },
            relationships: { style: "100%真っ直ぐで献身的。記念日やこまめな連絡をとても重視します。", advice: "自分の犠牲を理由に相手を責めないでください。相手に一人になる時間を与えましょう。" }
        },
        ko: {
            strengths: ["무한한 충성심", "극진한 보살핌", "현실 감각", "팀 지향성"],
            blindSpots: ["본인 주관 부족", "정서적 강요", "과도한 자기 희생", "혼자 있는 시간 못 견딤"],
            career: { style: "대면 서비스, 교육 및 협업 분야에서 빛을 발합니다. 팀 분위기가 생존의 필수재입니다.", advice: "호의와 핵심 KPI를 구분하세요. 인싸력만으로는 승진에 한계가 있으니 성과 데이터로 승부해야 합니다." },
            relationships: { style: "과도할 만큼 진정성 있게 헌신하며, 기념일과 연락을 cực도로 중시합니다.", advice: "희생을 무기로 상대방을 감정적으로 압박하지 마세요. 파트너에게 독자적인 혼자만의 시간을 보장해 주세요." }
        }
    },
    ISTP: {
        en: {
            strengths: ["Resourceful Problem Solver", "Adaptable", "Calm Under Crisis", "Practical Efficiency"],
            blindSpots: ["Too detached", "Reckless risk-taking", "Easily bored", "Ignores protocols"],
            career: { style: "A pragmatic troubleshooter. Flourishes with hands-on tools and complete independence without bureaucracy.", advice: "Don't rely only on your quick reflexes. Developing a slightly longer-term plan won't kill your freedom." },
            relationships: { style: "Low maintenance. Shows affection through physical actions and fixing things, not emotional words.", advice: "Your partner isn't a machine to be fixed. Sometimes they just want a listener, not a mechanic." }
        },
        ja: {
            strengths: ["課題解決力", "適応力", "危機への冷静さ", "実用的な効率性"],
            blindSpots: ["無関心すぎる", "無謀なリスク", "すぐ飽きる", "ルールを無視する"],
            career: { style: "実践的なトラブルシューター。完全な独立性と自由な環境が必要です。", advice: "反射神経だけでなく、長期的な計画を立てることもあなたの自由を奪うものではありません。" },
            relationships: { style: "ローメンテナンス。言葉よりも行動や物を修理することで愛情を示します。", advice: "パートナーは修理すべき機械ではありません。時には解決策よりもただ傾聴することが大切です。" }
        },
        ko: {
            strengths: ["뛰어난 문제 해결력", "적응력", "위기 상황에서의 냉정함", "실용적인 효율성"],
            blindSpots: ["지나친 무관심", "무모한 위험 감수", "쉽게 지루해함", "규칙 무시"],
            career: { style: "실전 문제 해결사입니다. 관료주의가 없는 환경과 독립적인 권한이 필수적입니다.", advice: "단기적인 순발력에만 의존하지 마세요. 장기적인 계획을 세우는 것이 자유를 뺏지는 않습니다." },
            relationships: { style: "피곤하지 않은 연애를 추구합니다. 달콤한 말보다 행동과 실질적인 도움으로 애정을 표현합니다.", advice: "파트너는 고쳐야 할 기계가 아닙니다. 때로는 해결책 대신 조용히 들어주는 것이 필요합니다." }
        }
    },
    ISFP: {
        en: {
            strengths: ["Artistic Sensibility", "Highly Empathetic", "Lives in the Moment", "Gentle Avoidance of Conflict"],
            blindSpots: ["Unpredictable", "Too sensitive to stress", "Can't handle criticism", "Lacks future planning"],
            career: { style: "Needs a beautiful, low-pressure aesthetic environment. Enjoys tasks with visible, tangible art outcomes.", advice: "It's okay to push back. Voicing an unpopular opinion is better than suffering in silence." },
            relationships: { style: "Requires a lot of personal space but gives pure, non-judgmental love.", advice: "Running away whenever conflict arises only delays the inevitable. Stand your ground gracefully." }
        },
        ja: {
            strengths: ["芸術的センス", "強い共感力", "今を生きる", "穏やかに争いを避ける"],
            blindSpots: ["予測不可能", "ストレスに脆い", "批判に耐えられない", "将来の計画不足"],
            career: { style: "美しくプレッシャーの少ない環境が必要です。具体的な成果が見える仕事を好みます。", advice: "反論しても大丈夫です。黙って苦しむより、意見を言う方が良い結果をもたらします。" },
            relationships: { style: "プライベートな空間を必要としますが、純粋で偏見のない愛を与えます。", advice: "葛藤から逃げるのは問題を先送りするだけです。勇気を持って向き合いましょう。" }
        },
        ko: {
            strengths: ["예술적 감수성", "뛰어난 공감 능력", "현재를 즐김", "부드러운 갈등 회피"],
            blindSpots: ["예측 불가능성", "스트레스에 취약함", "비판에 예민함", "미래 계획 부족"],
            career: { style: "아름답고 압박이 적은 환경이 필요합니다. 눈에 보이고 만져지는 결과물을 내는 일을 즐깁니다.", advice: "가끔은 목소리를 내도 괜찮습니다. 침묵하며 고통받는 것보다 반대 의견을 말하는 것이 낫습니다." },
            relationships: { style: "많은 개인 공간을 필요로 하지만, 편견 없이 순수한 사랑을 줍니다.", advice: "갈등이 생길 때마다 회피하는 것은 문제를 미룰 뿐입니다. 우아하게 상황에 맞서세요." }
        }
    },
    ESTP: {
        en: {
            strengths: ["Action-Oriented", "Sharp Perception", "Bold & Daring", "Charismatic Sociability"],
            blindSpots: ["Impulsive", "Skips details", "Bored easily", "Misses the big picture"],
            career: { style: "A fast-paced hustler. Thrives in high-stakes sales, sports, or fast entrepreneurial sprints.", advice: "Taking 10 seconds to think before jumping won’t ruin the thrill. Be aware of collateral damage." },
            relationships: { style: "Exciting, unpredictable, and fiercely loyal. Love is an adventure.", advice: "Commitment isn't a trap. Settling down slightly doesn't mean your fun life is over." }
        },
        ja: {
            strengths: ["行動力", "鋭い知覚", "大胆不敵", "カリスマ性のある社交性"],
            blindSpots: ["衝動的", "細部を無視する", "すぐ飽きる", "全体像を見失いがち"],
            career: { style: "動きの速い環境やリスクの高い営業、起業の最前線で真価を発揮します。", advice: "行動する前に10秒考えることで、スリルが失われることはありません。影響範囲を意識しましょう。" },
            relationships: { style: "刺激的で予測不可能、そして忠実です。愛は冒険です。", advice: "深いコミットメントは罠ではありません。少し落ち着くことは、楽しい人生の終わりを意味しません。" }
        },
        ko: {
            strengths: ["강력한 행동력", "예리한 상황 판단", "대담함", "매력적인 사교성"],
            blindSpots: ["충동성", "디테일 무시", "쉽게 지루해함", "큰 그림을 놓침"],
            career: { style: "빠른 속도로 진행되는 세일즈, 스포츠, 혹은 창업의 최전선에서 능력을 발휘합니다.", advice: "움직이기 전에 10초만 멈춰 생각해보세요. 약간의 계획이 스릴을 망치진 않습니다." },
            relationships: { style: "자극적이고 예측 불가능하며 충성스럽습니다. 사랑은 곧 모험입니다.", advice: "헌신은 함정이 아닙니다. 관계에 정착한다고 해서 당신의 재미있는 인생이 끝나는 것은 아닙니다." }
        }
    },
    ESFP: {
        en: {
            strengths: ["Outstanding Showmanship", "Extreme Practicality", "Highly Observant", "Infectiously Positive"],
            blindSpots: ["Easily distracted", "Poor long-term planning", "Over-indulgent", "Avoids serious issues"],
            career: { style: "The star of the team. Thrives in event planning, acting, or anything involving crowd interaction.", advice: "You can't laugh away every serious issue. Learning to handle 'heavy' administrative work will upgrade you." },
            relationships: { style: "A fun-loving partner who makes every day a movie scene.", advice: "When your partner needs a deep, serious talk, don't change the subject or try to cheer them up artificially." }
        },
        ja: {
            strengths: ["卓越したエンターテイナー", "実用性", "高い観察力", "感染力のあるポジティブさ"],
            blindSpots: ["気が散りやすい", "長期計画が苦手", "自己甘やかし", "深刻な問題を避ける"],
            career: { style: "チームのスターです。イベント企画や人との交流が多い職場で輝きます。", advice: "すべての問題を笑い飛ばすことはできません。重たい事務作業にも耐える力をつけると成長できます。" },
            relationships: { style: "毎日を映画のワンシーンのように楽しくしてくれるパートナーです。", advice: "パートナーが真剣な話をしている時、話題を変えたり無理に明るく振る舞おうとしないでください。" }
        },
        ko: {
            strengths: ["탁월한 쇼맨십", "현실적인 감각", "뛰어난 관찰력", "전염성 강한 긍정 에너지"],
            blindSpots: ["산만함", "장기적 계획의 부재", "유혹에 약함", "심각한 문제 회피"],
            career: { style: "팀에서 가장 빛나는 스타입니다. 이벤트 기획, 접객 등 사람들과 만나는 일에서 뛰어납니다.", advice: "모든 심각한 문제를 웃음으로 넘길 수는 없습니다. 때로는 무거운 책임과 마주하는 법을 배우세요." },
            relationships: { style: "매일을 축제처럼 즐겁게 만들어주는 연인입니다.", advice: "상대방이 진지하고 깊은 대화를 원할 때, 농담으로 넘기거나 무리하게 분위기를 띄우려 하지 마세요." }
        }
    }
};
