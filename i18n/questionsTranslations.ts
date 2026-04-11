import { Language } from '../contexts/LanguageContext';

export interface LocalizedQuestion {
    text: string;
    options: Record<string, string>;
}

export const questionTranslations: Record<number, Partial<Record<Language, LocalizedQuestion>>> = {
    // --- E vs I ---
    1: {
        en: {
            text: 'You had a crazy busy week, and you finally close the shop/get home on Friday night. Right now, what you want to do most is:',
            options: {
                E: 'Check your phone to see where your friends are, asking: "Any plans tonight?"',
                I: 'Put your phone away, make a hot drink, ignore all messages, and just enjoy some quiet alone time.'
            }
        },
        ja: {
            text: '怒涛の1週間を終え、金曜日の夜にようやく店を閉める/帰宅したあなた。今一番したいことは：',
            options: {
                E: 'スマホを開いて友達の居場所を確認し、「今から集まらない？」と誘う。',
                I: 'スマホを遠ざけ、温かい飲み物を淹れ、連絡をすべて後回しにして静かに一人で過ごす。'
            }
        },
        ko: {
            text: '일주일 내내 미친듯이 바빴고, 금요일 밤 마침내 가게 문을 닫거나 퇴근하고 집에 왔습니다. 지금 가장 하고 싶은 것은:',
            options: {
                E: '휴대폰을 열어 친구들이 어디 있는지 확인하고, "이따가 약속 있어?"라고 물어본다.',
                I: '휴대폰을 멀리 두고, 따뜻한 음료를 타서 모든 메시지를 무시한 채 혼자 조용히 쉰다.'
            }
        }
    },
    2: {
        en: {
            text: 'A friend dragged you to a party/networking event at the last minute where you barely know anyone. In the first 10 minutes, you usually:',
            options: {
                E: 'Grab a drink and start circling the room, striking up conversations and making new friends.',
                I: 'Find a spot in the corner, by the wall, or at the bar, observing the vibe and seeing if there\'s anyone approachable.'
            }
        },
        ja: {
            text: '友達に急遽誘われ、知り合いがほとんどいないパーティーや交流会に参加しました。最初の10分間、あなたはどうしていますか：',
            options: {
                E: 'とりあえず飲み物を手に取り、会場を回りながら人に話しかけ、新しい友達を作る。',
                I: '隅っこや壁際、バーカウンターの席を確保し、まずは雰囲気を観察しながら話しやすそうな人を探す。'
            }
        },
        ko: {
            text: '친구가 갑자기 아는 사람이 거의 없는 파티나 네트워킹 행사에 데려갔습니다. 처음 10분 동안 당신의 모습은:',
            options: {
                E: '일단 음료를 하나 집어 들고, 행사장을 돌아다니며 사람들에게 말을 걸고 새로운 친구를 사귄다.',
                I: '구석이나 벽 쪽, 바 자리를 찾아 분위기를 살피며 대화하기 편해 보이는 사람이 있는지 관찰한다.'
            }
        }
    },
    3: {
        en: {
            text: 'When you have an idea in your head that isn\'t fully formed yet, you usually prefer to:',
            options: {
                E: 'Talk it out and discuss it with others, letting the idea take shape during the conversation.',
                I: 'Run it through in your head several times and only share it when it feels more complete.'
            }
        },
        ja: {
            text: 'まだまとまっていないアイデアが頭に浮かんだ時、あなたのいつもの反応は：',
            options: {
                E: 'まずは誰かに話し、議論する中で徐々にアイデアを形にしていく。',
                I: '頭の中で何度もシミュレーションし、ある程度まとまってから人に共有する。'
            }
        },
        ko: {
            text: '머릿속에 아직 완성되지 않은 아이디어가 떠올랐을 때, 당신이 선호하는 방식은:',
            options: {
                E: '먼저 사람들에게 말하고 토론하면서, 대화하는 과정 중에 아이디어를 구체화한다.',
                I: '머릿속으로 여러 번 시뮬레이션을 돌려보고, 어느 정도 완성되었다고 느낄 때 공유한다.'
            }
        }
    },
    4: {
        en: {
            text: 'Your phone rings, and it\'s an unknown number. Your first reaction is:',
            options: {
                E: 'A bit curious about who it is, so you just answer it to find out.',
                I: 'Frown slightly, hesitate to answer, or even let it ring out and check later.'
            }
        },
        ja: {
            text: '知らない番号から急に電話がかかってきました。あなたの第一反応は：',
            options: {
                E: '「何だろう？」と少し好奇心が湧き、とりあえず出てみる。',
                I: '少し眉をひそめ、出るのをためらう。鳴り終わるのを待ってから必要ならかけなおす。'
            }
        },
        ko: {
            text: '갑자기 모르는 번호로 전화가 왔습니다. 당신의 첫 반응은:',
            options: {
                E: '무슨 일인지 약간 궁금해서 일단 받아본다.',
                I: '살짝 미간을 찌푸리며 전화를 받을지 망설이거나, 아예 끊길 때까지 기다렸다가 나중에 확인한다.'
            }
        }
    },
    5: {
        en: {
            text: 'During a team brainstorming meeting, the host says, "Just shout out any ideas!" You will:',
            options: {
                E: 'Throw out a few ideas right away, not worrying if they are half-baked. Better to have something to work with.',
                I: 'Listen to others first, wait until you formulate a relatively complete thought before speaking up.'
            }
        },
        ja: {
            text: 'チームのブレインストーミングで、司会者が「思いついたことをどんどん言って！」と言いました。あなたは：',
            options: {
                E: 'まだ未完成でも気にせずアイデアをいくつか出し、そこから調整すればいいと考える。',
                I: 'まずはみんなの意見を聞き、自分の頭の中でまとまった発言ができるようになってから口を開く。'
            }
        },
        ko: {
            text: '팀 브레인스토밍 회의 중 진행자가 "아이디어가 있으면 자유롭게 말해주세요!"라고 합니다. 당신은:',
            options: {
                E: '일단 생각나는 대로 몇 가지 던진다. 아직 부족하더라도 나중에 수정하면 된다고 생각한다.',
                I: '먼저 다른 사람들의 의견을 듣고, 머릿속에서 비교적 완성된 형태로 정리된 후에 입을 연다.'
            }
        }
    },
    6: {
        en: {
            text: 'To you, "friends" are more like:',
            options: {
                E: 'People from many different circles. There\'s always someone to hang out or chat with.',
                I: 'A very few close individuals. They are the only ones you truly confide in.'
            }
        },
        ja: {
            text: 'あなたにとって「友達」とは、どちらに近いですか？',
            options: {
                E: 'さまざまなコミュニティにいる多くの人たち。普段からいつでも遊んだり話したりできる。',
                I: 'ごく少数の親しい人たち。本当に心の内を明かせるのはその数人だけ。'
            }
        },
        ko: {
            text: '당신에게 "친구"란 어느 쪽에 더 가깝나요?',
            options: {
                E: '다양한 무리의 많은 사람들. 평소에 언제든지 만나거나 연락할 수 있는 사람이 많다.',
                I: '소수의 매우 친밀한 사람들. 진심으로 속마음을 털어놓을 수 있는 사람은 그 몇 명뿐이다.'
            }
        }
    },
    7: {
        en: {
            text: 'Suppose you are stuck at home all day with no schedule and can\'t go out. You feel:',
            options: {
                E: 'A bit stifled. I\'d proactively initiate video or voice calls to catch up with someone.',
                I: 'Actually relieved. It\'s a rare moment of peace where I can focus on my own things without interruption.'
            }
        },
        ja: {
            text: '今日一日、予定もなく家から出られない状況になりました。あなたはどう感じますか？',
            options: {
                E: '少し息苦しく感じ、自分から友達にビデオ通話や電話をかけて話したくなる。',
                I: '誰にも邪魔されず、自分のことに集中できる貴重な静かな時間だと嬉しく思う。'
            }
        },
        ko: {
            text: '만약 오늘 하루 종일 일정 없이 집에만 있어야 하는 상황이라면, 당신의 기분은:',
            options: {
                E: '좀 답답해서, 먼저 영상 통화나 음성 통화를 걸어 누군가와 대화하고 싶어질 것이다.',
                I: '오히려 조용해서 좋다. 방해받지 않고 내 일에 온전히 집중할 수 있는 귀중한 시간이다.'
            }
        }
    },
    8: {
        en: {
            text: 'When something genuinely happy happens to you (promotion, winning a pitch, getting noticed by a crush), you will:',
            options: {
                E: 'Immediately screenshot, post a story, or call friends to share the great news with as many people as possible.',
                I: 'Smile to yourself first, and probably only share it with one or two of your closest people.'
            }
        },
        ja: {
            text: 'とても嬉しい出来事（昇進、当選、好きな人からの連絡など）があった時、あなたは：',
            options: {
                E: 'すぐにスクショしたり、ストーリーに上げたり、友達に電話して、多くの人と喜びを分かち合う。',
                I: 'まずは心の中でガッツポーズをし、ごく親しい1〜2人にしか伝えないかもしれない。'
            }
        },
        ko: {
            text: '정말 기쁜 일(승진, 공모전 당선, 짝사랑 상대의 연락 등)이 생겼을 때, 당신은:',
            options: {
                E: '즉시 캡처하거나 스토리를 올리거나 친구에게 전화해서 최대한 많은 사람과 소식을 공유한다.',
                I: '혼자 속으로 미소 짓고, 아마 가장 친한 한두 사람에게만 살짝 알릴 것이다.'
            }
        }
    },

    // --- S vs N ---
    9: {
        en: {
            text: 'Standing by a window looking at a quiet forest/mountain photo, the first thing that comes to your mind is:',
            options: {
                S: 'How cold the wind is, the color of the leaves, and whether the air smells damp or dry.',
                N: 'It feels like the beginning of a story. I imagine, "What would happen if I walked in there?"'
            }
        },
        ja: {
            text: '窓辺に立ち、静かな森や山の風景写真を見つめています。最初に頭に浮かぶことは：',
            options: {
                S: '風の冷たさ、葉の色、空気の湿っぽさや乾燥具合など、具体的な状況。',
                N: '「ここに入っていったら何が起きるだろう」という、物語の始まりのような想像。'
            }
        },
        ko: {
            text: '창가에 서서 조용한 숲이나 산의 사진을 바라보고 있습니다. 가장 먼저 떠오르는 생각은:',
            options: {
                S: '바람은 얼마나 찰지, 나뭇잎 색깔, 공기 냄새가 습할지 건조할지 같은 구체적인 감각.',
                N: '어떤 이야기의 시작처럼 느껴지고, "저 안으로 걸어 들어가면 무슨 일이 생길까?" 하는 상상.'
            }
        }
    },
    10: {
        en: {
            text: 'When someone describes an event to you, you naturally tend to ask:',
            options: {
                S: '"So what time was it? Where did it happen? What exactly happened next?"',
                N: '"Why did that happen? What do you think that means? Where is this leading to?"'
            }
        },
        ja: {
            text: '誰かから出来事の説明を受けた時、あなたが自然と深掘りしたくなるのは：',
            options: {
                S: '「それ何時？どこで？その後具体的にどうなったの？」',
                N: '「どうしてそうなったの？それってどういう意味？この先どうなると思う？」'
            }
        },
        ko: {
            text: '누군가 어떤 사건에 대해 이야기할 때, 당신이 자연스럽게 더 묻게 되는 것은:',
            options: {
                S: '"그래서 몇 시였어? 어디서? 그 다음에 구체적으로 어떻게 됐어?"',
                N: '"왜 그런 일이 생겼을까? 그게 무슨 의미인 것 같아? 앞으로 어떻게 될까?"'
            }
        }
    },
    11: {
        en: {
            text: 'When learning a completely new tool or software, your usual process is:',
            options: {
                S: 'Read the tutorial or manual first, follow it step-by-step, confirm its functions, and then expand.',
                N: 'Just open it and start clicking around, guessing its logic as you play with it.'
            }
        },
        ja: {
            text: '新しいツールやソフトウェアを学ぶ時のあなたの一般的な手順は：',
            options: {
                S: 'まずはチュートリアルや説明書を読み、手順通りに進めて機能を確認してから応用する。',
                N: 'とりあえず開いて色々とクリックし、触りながらその仕組みを推測していく。'
            }
        },
        ko: {
            text: '새로운 도구나 소프트웨어를 배울 때, 당신의 일반적인 방식은:',
            options: {
                S: '먼저 튜토리얼이나 설명서를 읽고, 단계별로 따라 하면서 기능을 확인한 후 활용한다.',
                N: '일단 열어서 이것저것 클릭해 보고, 만져보면서 작동 원리를 유추한다.'
            }
        }
    },
    12: {
        en: {
            text: 'If I ask: "Do you have a picture of yourself 5 years from now?", you would likely say:',
            options: {
                S: 'Let\'s just focus on doing things well right now. The future is built on present accumulations.',
                N: 'I have multiple versions playing in my head, imagining different cities, jobs, or lifestyles.'
            }
        },
        ja: {
            text: '「5年後の自分のイメージはありますか？」と聞かれたら、あなたは：',
            options: {
                S: 'まずは目の前のことをしっかりやる。未来は今の積み重ねだから。',
                N: '頭の中でいくつかのパラレルワールドがあり、違う都市、仕事、ライフスタイルを想像している。'
            }
        },
        ko: {
            text: '"5년 후의 자신에 대한 그림을 가지고 있나요?"라고 묻는다면, 당신의 대답은:',
            options: {
                S: '일단 지금 눈앞의 일에 집중하자. 미래는 현재가 쌓여서 만들어지는 거니까.',
                N: '머릿속에 여러 가지 버전이 있고, 다른 도시, 직업, 라이프스타일을 다양하게 상상해 본다.'
            }
        }
    },
    13: {
        en: {
            text: 'You go to a new "creative cuisine" restaurant with friends, and the menu is full of dishes you\'ve never seen. You will:',
            options: {
                S: 'Conservatively pick the safest option, the one that sounds closest to familiar flavors.',
                N: 'Want to try the weirdest or most unique dish. Even if it\'s a miss, it\'s a fun experience.'
            }
        },
        ja: {
            text: '「創作料理」がウリの新しいレストランへ友達と来ました。メニューは見たことのない料理ばかりです。あなたは：',
            options: {
                S: '保守的に、一番安全そうで馴染みのある味に近いものを選ぶ。',
                N: '一番変わった名前や珍しい料理に惹かれる。もしハズレでも「面白い経験」として楽しめる。'
            }
        },
        ko: {
            text: '친구들과 유니크한 "퓨전 창작 요리" 식당에 갔습니다. 메뉴판에는 처음 보는 요리들이 가득합니다. 당신은:',
            options: {
                S: '보수적으로, 가장 안전해 보이고 아는 맛에 가까울 것 같은 요리를 고른다.',
                N: '이름이 가장 특이하거나 독특한 요리를 고르고 싶다. 맛이 없더라도 재미있는 경험이니까.'
            }
        }
    },
    14: {
        en: {
            text: 'If you were asked to write an article, you would feel more confident writing:',
            options: {
                S: 'A record of a real event, explaining the scene clearly with concrete details.',
                N: 'A fictional world, writing a story with metaphors, symbols, or fantasy elements.'
            }
        },
        ja: {
            text: 'もし文章を書くように頼まれたら、どちらのほうが自信がありますか：',
            options: {
                S: '実際に起きた出来事の記録や、細部を明確にした具体的なレポート。',
                N: '隠喩や象徴、ファンタジー要素を交えた架空のストーリー。'
            }
        },
        ko: {
            text: '글을 써야 한다면, 어느 쪽에 더 자신 있나요?',
            options: {
                S: '실제로 일어난 일을 구체적인 세부 묘사를 통해 생생하게 기록한 글.',
                N: '은유, 상징, 혹은 판타지적 요소가 가미된 허구의 세계나 이야기.'
            }
        }
    },
    15: {
        en: {
            text: 'When making a choice, you tend to trust:',
            options: {
                S: 'Visible facts, numbers, and past experiences.',
                N: 'An intuition of "I can\'t explain it, but it just feels right/wrong."'
            }
        },
        ja: {
            text: '選択をするとき、あなたがより信じるのは：',
            options: {
                S: 'すでに目に見えている事実、データ、そして過去の経験。',
                N: '「言葉では説明できないけれど、何となくこれだ（違う）」という直感。'
            }
        },
        ko: {
            text: '선택을 할 때, 당신이 더 믿는 것은:',
            options: {
                S: '눈에 보이는 사실, 수치 데이터, 그리고 과거의 경험.',
                N: '"말로 설명할 수는 없지만 그냥 느낌이 좋아/별로야" 하는 직감.'
            }
        }
    },
    16: {
        en: {
            text: 'For you, how often do you "zone out / daydream"?',
            options: {
                S: 'Rarely. My brain is mostly turning over to-do lists and practical problems.',
                N: 'Very often. My brain runs its own mini-theaters and imagines different possible paths.'
            }
        },
        ja: {
            text: 'あなたにとって、「ぼーっとする／空想にふける」頻度はどのくらいですか？',
            options: {
                S: '少ない。私の頭の中は、ほとんどやるべきことや現実的な問題の処理に占められている。',
                N: 'とても多い。頭の中で劇が上演され、色んな結末の可能性を想像している。'
            }
        },
        ko: {
            text: '당신에게 "멍 때리기/백일몽 꾸기"의 빈도는 어느 정도인가요?',
            options: {
                S: '거의 없다. 내 머릿속은 대부분 할 일 목록이나 현실적인 문제들로 바쁘게 돌아간다.',
                N: '매우 잦다. 머릿속으로 혼자 작은 상황극을 연출하거나 다양한 시나리오를 상상한다.'
            }
        }
    },

    // --- T vs F ---
    17: {
        en: {
            text: 'A friend messed up at work because of their own mistake. They ask you out for a drink and start crying as soon as they sit down. Where does your very first reaction go?',
            options: {
                T: 'Listen to the details first, then start analyzing the problem together and how to fix it next time.',
                F: 'Comfort their emotions first, saying "You must feel terrible," making them feel understood.'
            }
        },
        ja: {
            text: '自分のミスで仕事に失敗した友達から飲みに誘われました。席に着くや否や泣き出した友達に対し、あなたの最初の反応は？',
            options: {
                T: 'まずは詳細を聞き、どこに問題があったのか、次はどう改善できるかを一緒に分析し始める。',
                F: 'まずは相手の感情に寄り添い、「つらかったね」と慰め、理解されていると感じてもらう。'
            }
        },
        ko: {
            text: '친구가 본인의 실수로 직장에서 사고를 쳤습니다. 당신에게 술을 마시자고 불러내더니, 자리에 앉자마자 울기 시작합니다. 당신의 첫 반응은 어디로 향하나요?',
            options: {
                T: '먼저 자초지종을 듣고, 문제의 원인이 무엇인지 분석하며 다음엔 어떻게 대비할지 같이 생각한다.',
                F: '먼저 감정을 달래주고, "진짜 힘들었겠다"라며 공감해주고 마음을 알아준다.'
            }
        }
    },
    18: {
        en: {
            text: 'When making important decisions, your internal priority is usually:',
            options: {
                T: 'Is this reasonable? Is it the fairest and most efficient way for the task itself?',
                F: 'Will this hurt anyone? How will everyone feel, and will this create awkward relationships?'
            }
        },
        ja: {
            text: '重要な決断を下す時、あなたが心の中で優先するのはどちらですか：',
            options: {
                T: 'これは合理的か？物事にとって最も公平で効率的な選択か？',
                F: 'これは誰かを傷つけないか？みんなはどう感じるか、関係が気まずくならないか？'
            }
        },
        ko: {
            text: '중요한 결정을 내릴 때, 당신의 마음속 우선순위는 어느 쪽에 가깝나요:',
            options: {
                T: '이 선택이 합리적인가? 일 자체적으로 가장 공정하고 효율적인 방법인가?',
                F: '이 결정으로 상처받는 사람이 생길까? 사람들의 기분은 어떨지, 분위기가 어색해지진 않을까?'
            }
        }
    },
    19: {
        en: {
            text: 'If you were forced to participate in a "layoff decision", you would lean towards:',
            options: {
                T: 'Ranking based on objective performance, contribution, and future developmental potential.',
                F: 'Trying to protect those with heavy family burdens, high seniority, or deep emotional ties to the company.'
            }
        },
        ja: {
            text: 'もし「リストラの決断」に関わらなければならないとしたら、あなたはどちらを重視しますか：',
            options: {
                T: '客観的なパフォーマンス、貢献度、将来の伸び代に基づいて順位づけする。',
                F: '家庭の事情が厳しい人、勤続年数が長い人、会社への思い入れが強い人をできるだけ守る。'
            }
        },
        ko: {
            text: '만약 당신이 어쩔 수 없이 "구조조정(해고) 명단 작성"에 참여해야 한다면, 당신의 기준은:',
            options: {
                T: '객관적인 실적, 기여도, 미래 성장 가능성을 기준으로 순위를 매긴다.',
                F: '가족 부양 부담이 크거나, 근속 연수가 길거나, 회사에 남다른 애정을 가진 사람을 최대한 보호한다.'
            }
        }
    },
    20: {
        en: {
            text: 'You prefer people to describe you privately as:',
            options: {
                T: '"This person has great judgment; they are very professional and competent."',
                F: '"This person is so easy to get along with; being with them feels safe and warm."'
            }
        },
        ja: {
            text: '人から陰でこう評価されるなら、どちらが嬉しいですか：',
            options: {
                T: '「あの人は判断力があって、仕事もプロフェッショナルで優秀だよね。」',
                F: '「あの人は付き合いやすくて、一緒にいると安心するし心が温かくなるよね。」'
            }
        },
        ko: {
            text: '사람들이 뒤에서 당신을 어떻게 묘사해 주기를 더 원하나요?',
            options: {
                T: '"저 사람은 판단력이 좋고, 일을 정말 프로페셔널하게 잘해."',
                F: '"저 사람은 무척 다정하고, 같이 있으면 마음이 편안하고 따뜻해져."'
            }
        }
    },
    21: {
        en: {
            text: 'When arguing with someone and both sides hold a firm stance, what bothers you most is:',
            options: {
                T: 'My argument was clearly more logical, but it got derailed by emotions, which makes me uncomfortable.',
                F: 'Even if I\'m right, I don\'t want to burn bridges. Winning by force makes me feel uneasy.'
            }
        },
        ja: {
            text: '誰かと議論になり、お互いに意見が食い違っている時、あなたが気にするのは：',
            options: {
                T: '私の主張のほうが論理的なのに、感情論に引っ張られて不快だ。',
                F: '仮に私が正しくても、関係を壊したくない。押し切って勝っても後味が悪い。'
            }
        },
        ko: {
            text: '다른 사람과 논쟁이 생기고 서로의 입장이 평행선을 달릴 때, 당신의 마음을 불편하게 하는 것은:',
            options: {
                T: '내 주장이 분명 더 논리적인데, 상대가 감정적으로 나와서 본질이 흐려지는 상황.',
                F: '내 말이 맞다 하더라도, 관계를 망치고 싶지 않다. 매정하게 이기고 나면 마음이 불편하다.'
            }
        }
    },
    22: {
        en: {
            text: 'To you, "useful criticism" should look like this:',
            options: {
                T: 'Directly point out the problem and give specific directions for improvement, no need to coddle feelings.',
                F: 'Acknowledge the good parts first, then offer suggestions, making me feel supported rather than negated.'
            }
        },
        ja: {
            text: 'あなたにとって「有益な批判」とはどのようなものですか：',
            options: {
                T: '問題を直接指摘し、具体的な改善策を提示してくれるもの。私の感情に配慮しすぎる必要はない。',
                F: 'まず長所を認めた上でアドバイスをくれるもの。否定ではなくサポートだと感じられる言葉。'
            }
        },
        ko: {
            text: '당신에게 "유용한 비판"이란 어떤 모습인가요?',
            options: {
                T: '내 기분은 굳이 고려하지 않아도 되니, 문제를 직접적으로 지적하고 구체적인 개선 방향을 주는 것.',
                F: '먼저 장점을 짚어주고 조언을 건네어, 나를 무시하는 게 아니라 도와준다고 느끼게 하는 것.'
            }
        }
    },
    23: {
        en: {
            text: 'In movies or TV shows, the scene that most easily brings you to tears is:',
            options: {
                T: 'A character making a powerful or sacrificial choice in an extreme dilemma, making perfect logical sense for the plot.',
                F: 'Families hugging, tearful reunions, or someone doing an incredible act of gentleness out of love or friendship.'
            }
        },
        ja: {
            text: '映画やドラマで、あなたが思わず涙してしまうシーンはどちらですか：',
            options: {
                T: '極限状態の中で、キャラクターが論理的かつ力強い決断や犠牲を払う自己完結した展開。',
                F: '家族の抱擁、久々の再会、愛や友情のための優しさに溢れた行動。'
            }
        },
        ko: {
            text: '영화나 드라마에서 당신의 눈물샘을 자극하는 장면은?',
            options: {
                T: '캐릭터가 극한의 딜레마 속에서 논리적으로 완벽하게 납득되는, 그러나 묵직한 선택이나 희생을 할 때.',
                F: '가족들의 포옹, 눈물의 재회, 누군가 사랑이나 우정을 위해 헌신적이고 따뜻한 행동을 할 때.'
            }
        }
    },
    24: {
        en: {
            text: 'When facing someone who is completely unreasonable, your inner autopilot is to:',
            options: {
                T: 'Dismantle their contradictions with cold logic until they are left speechless.',
                F: 'Feel emotionally hurt or angry first, finding it difficult to compose a neat comeback on the spot.'
            }
        },
        ja: {
            text: '全く理不尽な人に出会った時、あなたの自動的な内面反応は：',
            options: {
                T: '冷静な論理で相手の矛盾を解体し、ぐうの音も出ないようにしたい。',
                F: 'まずは感情的に傷ついたり怒ったりしてしまい、その場で見事な反論をするのが難しい。'
            }
        },
        ko: {
            text: '완전히 말이 안 통하는 막무가내인 사람을 만났을 때, 당신의 내면 자동 반응은:',
            options: {
                T: '차가운 논리로 상대의 모순을 조목조목 짚어, 아무 말도 못 하게 논파하고 싶다.',
                F: '일단 감정적으로 상처받거나 화가 나서, 바로 그 자리에서 멋지게 반박하기가 어렵다.'
            }
        }
    },

    // --- J vs P ---
    25: {
        en: {
            text: 'The night before traveling abroad, what does your luggage usually look like?',
            options: {
                J: 'Pretty much packed days ago, and I\'ve double-checked my tick-box list.',
                P: 'Half open on the floor, throwing things in as I think of them—some items get tossed in right before I leave.'
            }
        },
        ja: {
            text: '海外旅行の前夜、あなたのスーツケースはどんな状態ですか？',
            options: {
                J: '数日前からほとんどパッキングが終わっており、チェックリストで再確認も済んでいる。',
                P: '床に半開きのままで、思いついたものをポンポン入れている状態。家を出る直前に入れるものもある。'
            }
        },
        ko: {
            text: '해외여행 가기 전날 밤, 당신의 캐리어는 어떤 상태인가요?',
            options: {
                J: '며칠 전부터 진작에 짐을 다 쌌고, 체크리스트로 두 번 이상 확인했다.',
                P: '방바닥에 반쯤 열려 있고, 생각나는 대로 쑤셔 넣고 있다. 심지어 출발 직전에 넣는 것도 있다.'
            }
        }
    },
    26: {
        en: {
            text: 'For the weekend, you prefer to:',
            options: {
                J: 'Schedule it ahead: what time to wake up, where to go, what to eat. Have a rough plan.',
                P: 'See how I feel that morning. Go out if I want to, sleep in if I want to.'
            }
        },
        ja: {
            text: '週末の過ごし方として、あなたが好むのは：',
            options: {
                J: '事前に予定を組む。起きる時間、行く場所、食べるものなど、大体の計画がある。',
                P: '当日の朝の気分で決める。外出したい気分の時は外出し、寝ていたい時は寝る。'
            }
        },
        ko: {
            text: '주말을 보낼 때 당신이 선호하는 방식은:',
            options: {
                J: '미리 일정을 짠다. 몇 시에 일어나고, 어딜 가고, 뭘 먹을지 대략적인 계획이 있어야 안심된다.',
                P: '당일 아침의 기분에 맡긴다. 나가고 싶으면 나가고, 침대에서 뒹굴고 싶으면 뒹군다.'
            }
        }
    },
    27: {
        en: {
            text: 'When a "rush job" is suddenly thrown into your workflow, you mostly:',
            options: {
                J: 'Feel your rhythm is disrupted; it\'s stressful, but you force it into the timeline.',
                P: 'Feel a bit stimulated; sometimes this kind of fire-fighting feels more engaging than following a schedule.'
            }
        },
        ja: {
            text: '仕事中に突然「緊急の割り込みタスク」を投げられた時、あなたの反応は：',
            options: {
                J: 'ペースを乱されてストレスを感じるが、どうにか既存のスケジュールにねじ込む。',
                P: '少しアドレナリンが出て、予定通りに動くより臨機応変に対応する方が燃える。'
            }
        },
        ko: {
            text: '업무 중 갑자기 "긴급 끼어들기 업무"가 들어왔을 때, 당신의 반응은:',
            options: {
                J: '리듬이 깨진 것 같아 스트레스받지만, 어떻게든 기존 일정표에 욱여넣는다.',
                P: '은근히 자극을 받는다. 가끔은 정해진 대로 하는 것보다 이런 즉흥적인 소방수 역할이 더 재밌다.'
            }
        }
    },
    28: {
        en: {
            text: 'Your computer desktop or cloud drive mostly looks like:',
            options: {
                J: 'Clearly categorized by project, date, or file type; it takes a while for it to get disorganized.',
                P: 'A chaotic scatter of files and screenshots, but you generally know where everything is.'
            }
        },
        ja: {
            text: 'あなたのPCのデスクトップやクラウドフォルダは、どんな状態ですか：',
            options: {
                J: 'プロジェクト、日付、ファイル形式などで整理されており、普段からきれい。',
                P: 'ファイルやスクショが散乱しているが、自分では大事なものがどこにあるか大体把握している。'
            }
        },
        ko: {
            text: '당신의 컴퓨터 바탕화면이나 클라우드 폴더의 상태는:',
            options: {
                J: '프로젝트, 날짜, 또는 유형별로 깔끔하게 분류되어 있어서 웬만해선 어질러지지 않는다.',
                P: '파일과 캡처본이 바탕화면에 여기저기 흩어져 있지만, 본인은 뭐가 어디 있는지 대충 다 안다.'
            }
        }
    },
    29: {
        en: {
            text: 'Faced with a pending decision, your internal feeling is more like:',
            options: {
                J: 'Hanging in limbo makes me anxious; I\'d rather finalize it quickly and adjust later if needed.',
                P: 'Keep as many options open as possible; I don\'t want to lock it down until the last minute.'
            }
        },
        ja: {
            text: 'まだ決断が下されていない選択に対して、あなたはどのように感じますか：',
            options: {
                J: '宙ぶらりんな状態は焦る。早く決着をつけて、後から修正する方がいい。',
                P: '可能な限り選択肢を残しておきたい。ギリギリになるまで確定させたくない。'
            }
        },
        ko: {
            text: '아직 결정되지 않은 선택지를 앞두고 있을 때, 당신의 기분은:',
            options: {
                J: '미결 상태로 두는 건 너무 불안하다. 차라리 빨리 결정을 내리고 나중에 고치는 게 낫다.',
                P: '가능한 한 많은 선택지를 남겨두고 싶다. 마지막 순간 전까지는 결정을 확정 짓고 싶지 않다.'
            }
        }
    },
    30: {
        en: {
            text: 'When it comes to "rules," which statement resonates more with you?',
            options: {
                J: 'Having certain rules and processes helps everyone know how to cooperate, creating real efficiency.',
                P: 'Rules are references; in special situations, flexibility and creativity are far more important.'
            }
        },
        ja: {
            text: '「ルール」について、あなたの考えに近いのは：',
            options: {
                J: '一定のルールや手順があるからこそ、みんなが協力しやすく、効率が上がる。',
                P: 'ルールはあくまで参考。特別な状況では、柔軟性とクリエイティビティの方がはるかに重要だ。'
            }
        },
        ko: {
            text: '"규칙"에 대해 당신의 마음에 더 와닿는 말은?',
            options: {
                J: '확실한 규칙과 프로세스가 있어야 사람들이 어떻게 협력할지 알게 되고, 효율도 올라간다.',
                P: '규칙은 참고용일 뿐이다. 상황에 따라 유연함과 창의성을 발휘하는 게 훨씬 중요하다.'
            }
        }
    },
    31: {
        en: {
            text: 'After finishing a project, if you had to pick the most satisfying moment, it would be:',
            options: {
                J: 'Checking off the last box, archiving the files, and closing the case. So refreshing.',
                P: 'Having an epiphany or trying a new method during the process, feeling like you\'ve unlocked a new skill.'
            }
        },
        ja: {
            text: 'プロジェクトが完了した時、一番達成感を感じる瞬間はどちらですか：',
            options: {
                J: 'リストの最後の一つにチェックを入れ、ファイルを閉じて完了させた爽快感。',
                P: '途中で新しいアプローチやインスピレーションが湧き、自分自身がアップデートされたと感じた時。'
            }
        },
        ko: {
            text: '프로젝트를 마친 후, 가장 성취감을 느끼는 순간을 하나만 꼽자면?',
            options: {
                J: '마지막 체크 항목에 브이(V) 표시를 하고 파일을 폴더에 정리해 끝낼 때의 그 짜릿한 상쾌함.',
                P: '과정 중에 새로운 아이디어나 접근법을 떠올리고, 내 스킬이 한 단계 레벨 업했다고 느낄 때.'
            }
        }
    },
    32: {
        en: {
            text: 'Your phone battery habits:',
            options: {
                J: 'I plug it in when it drops to 40-50%. I don\'t like seeing it turn red.',
                P: 'I often use it until it\'s in the single digits, and only then frantically look for a charger.'
            }
        },
        ja: {
            text: 'あなたのスマホの充電の習慣は：',
            options: {
                J: '40～50%になったら充電する。バッテリー表示が赤くなるのは嫌だ。',
                P: '一桁になるまで気づかずに使い、慌てて充電ケーブルを探すことが多い。'
            }
        },
        ko: {
            text: '당신의 휴대폰 배터리 충전 습관은?',
            options: {
                J: '40~50% 정도 남으면 충전기를 꽂는다. 빨간색 배터리 아이콘을 보는 게 싫다.',
                P: '배터리가 한 자릿수가 될 때까지 쓰다가, 경고음이 울려야 허둥지둥 충전기를 찾는다.'
            }
        }
    },

    // --- A vs T ---
    33: {
        en: {
            text: 'Things suddenly don\'t go as planned, and there\'s a big plot twist. Your immediate internal reaction is:',
            options: {
                A: 'Take a deep breath and think: "Alright, what can I do next?"',
                Turbulent: 'A wave of anxiety hits, and my mind replays what I might have done wrong.'
            }
        },
        ja: {
            text: '予定通りにいかず、突然のアクシデントが発生しました。あなたの最初の内面的な反応は：',
            options: {
                A: '深呼吸をして、「よし、じゃあ次はどうするべきか？」と考える。',
                Turbulent: '焦りの波が押し寄せ、自分がどこでミスをしたのか頭の中で反芻し始める。'
            }
        },
        ko: {
            text: '일이 계획대로 진행되지 않고 예기치 못한 큰 반전이 생겼습니다. 당신의 첫 심리적 반응은:',
            options: {
                A: '심호흡을 한 번 하고 "좋아, 그럼 이제 내가 할 수 있는 건 뭐지?"라고 생각한다.',
                Turbulent: '불안감이 엄습하며, 내가 뭣을 잘못했는지 머릿속으로 상황을 끝없이 되감기 한다.'
            }
        }
    },
    34: {
        en: {
            text: 'When it comes to your own abilities, the thought that pops up more often is:',
            options: {
                A: '"I generally trust myself. Even if I face something new, I can learn it eventually."',
                Turbulent: '"I feel like I\'m not good enough yet. I need to show results or be validated to feel at ease."'
            }
        },
        ja: {
            text: '自分の能力について、心の中でよく浮かぶ考えはどちらですか：',
            options: {
                A: '「基本的には自分を信じている。新しいことでも少しずつ学べるはずだ。」',
                Turbulent: '「私はまだ十分じゃない。結果を出したり、認められたりしないと安心できない。」'
            }
        },
        ko: {
            text: '당신의 능력에 대해, 속으로 더 자주 떠올리는 생각은:',
            options: {
                A: '"대체로 나 자신을 믿는다. 새로운 걸 만나더라도 천천히 배우면 할 수 있다."',
                Turbulent: '"나는 아직 부족한 것 같다. 성과를 내거나 타인에게 인정받아야 비로소 마음이 놓인다."'
            }
        }
    },
    35: {
        en: {
            text: 'If you say something wrong or make a bad joke in a social setting, afterwards you will:',
            options: {
                A: 'Laugh it off on the spot and not really dwell on it later.',
                Turbulent: 'Replay the scene over and over in your head after going home, feeling embarrassed for a long time.'
            }
        },
        ja: {
            text: '社交の場で失言したり、空気を凍らせるような冗談を言ってしまった後、あなたは：',
            options: {
                A: 'その場で笑ってごまかし、その後は特に気に留めない。',
                Turbulent: '家に帰ってからそのシーンを何度も何度も思い出し、しばらく気まずさを引きずる。'
            }
        },
        ko: {
            text: '사람들과 모인 자리에서 말실수를 하거나 재미없는 농담을 던져 분위기가 싸해졌습니다. 그 후 당신은:',
            options: {
                A: '그 자리에서 슬쩍 웃어넘기고, 나중에도 크게 마음에 담아두지 않는다.',
                Turbulent: '집에 돌아와서도 그 장면을 끝없이 반복 재생하며 한참 동안 이불 킥을 한다.'
            }
        }
    },
    36: {
        en: {
            text: 'When pushed by the stress of an approaching deadline for a big project, you:',
            options: {
                A: 'Enter a state of hyper-focus. You know you actually run faster under pressure.',
                Turbulent: 'Easily lose sleep and panic, deeply worried that you\'ll make a mistake or run out of time.'
            }
        },
        ja: {
            text: '大きなプロジェクトの締め切りが近づき、プレッシャーを与えられている時、あなたは：',
            options: {
                A: '逆に高い集中状態に入る。プレッシャーがある方がスピーディにこなせるとわかっている。',
                Turbulent: 'プレッシャーでよく眠れずパニックに陥り、失敗しないか、間に合わないかと深く恐れる。'
            }
        },
        ko: {
            text: '중요한 프로젝트 마감이 다가와 압박감에 쫓길 때, 당신은:',
            options: {
                A: '오히려 엄청난 집중 모드에 돌입한다. 나는 압박감이 있을 때 더 효율이 좋다는 걸 안다.',
                Turbulent: '잠도 잘 못 자고 안절부절못하며, 혹시나 실수하거나 제시간에 끝내지 못할까 봐 겁이 난다.'
            }
        }
    },
    37: {
        en: {
            text: 'How much influence do other people\'s emotions have on you?',
            options: {
                A: 'I can clearly separate "that\'s their emotion, not mine," so I don\'t get dragged down easily.',
                Turbulent: 'I am highly affected by the room\'s vibe. If someone is down, my mood drops with them.'
            }
        },
        ja: {
            text: '他人の感情は、あなたにどのくらい影響を与えますか？',
            options: {
                A: '「それは相手の感情で、自分のものではない」と切り離せるので、あまり引きずられない。',
                Turbulent: 'その場の空気に影響されやすく、周りが暗い雰囲気だと自分のテンションも一緒に下がる。'
            }
        },
        ko: {
            text: '다른 사람의 감정이 당신에게 미치는 영향력은 어느 정도인가요?',
            options: {
                A: '"저건 저 사람 감정이고, 내 감정은 아니지"라고 선을 그을 수 있어서 쉽게 휘둘리지 않는다.',
                Turbulent: '주변 분위기에 매우 민감하다. 누군가 기분이 안 좋으면 내 기분도 함께 덩달아 다운된다.'
            }
        }
    },
    38: {
        en: {
            text: 'Facing potential future risks, you usually:',
            options: {
                A: 'Lean towards optimism: "I\'ll deal with it when it actually happens."',
                Turbulent: 'Pre-play the worst-case scenario in my head and prepare various backup plans.'
            }
        },
        ja: {
            text: '将来起こりうるリスクに対して、あなたは普段：',
            options: {
                A: '「本当に起きた時に考えよう」と、楽観的に構える傾向がある。',
                Turbulent: '最悪のシナリオを頭の中で何度もシミュレーションし、あらゆる代替案を用意する。'
            }
        },
        ko: {
            text: '미래에 발생할 수 있는 리스크를 대할 때, 당신의 평소 태도는:',
            options: {
                A: '"진짜 일이 터지면 그때 가서 생각하자"라며 비교적 낙관적으로 생각하려 한다.',
                Turbulent: '머릿속으로 최악의 시나리오를 수십 번 돌려보고, 여러 가지 플랜 B를 철저히 세워둔다.'
            }
        }
    },
    39: {
        en: {
            text: 'Speaking of your current state in life, you feel closer to:',
            options: {
                A: 'There are still things I want to do, but overall, I appreciate myself and my life right now.',
                Turbulent: 'I always feel like something is missing, often telling myself "Push harder, be better."'
            }
        },
        ja: {
            text: '自分の現在の人生のステータスについて、どちらの感覚に近いですか：',
            options: {
                A: 'やりたいことはまだあるけれど、全体的には今の自分や生活に満足している。',
                Turbulent: 'いつも何かが足りない気がして、「もっと頑張らないと、もっと上にいかないと」と自分に言い聞かせている。'
            }
        },
        ko: {
            text: '지금 당신의 인생 상태를 생각했을 때, 어느 쪽에 더 가까운가요?',
            options: {
                A: '아직 하고 싶은 일이 많긴 하지만, 전반적으로 지금의 나와 내 삶에 감사하고 만족한다.',
                Turbulent: '늘 뭔가 부족한 것 같고, 마음속으로 수시로 "좀 더 버텨야 해, 더 잘해야 해"라며 스스로를 채찍질한다.'
            }
        }
    },
    40: {
        en: {
            text: 'When someone critiques your work, saying "I think this part can be adjusted," you are more like:',
            options: {
                A: 'Automatically unpacking it into actionable advice, treating it as reference data for correction.',
                Turbulent: 'Feeling a sting of rejection initially. I need time to reframe it from "I am bad" to "the work can be better."'
            }
        },
        ja: {
            text: '誰かがあなたの作品を見て「ここは修正した方がいいと思う」と評価した時、あなたは：',
            options: {
                A: '自動的にそれを具体的なアドバイスに変換し、修正のための参考データとして扱う。',
                Turbulent: '最初は自分が否定されたように感じ傷つく。「私がダメなんだ」から「作品を良くするための言葉だ」と切り替えるのに時間がかかる。'
            }
        },
        ko: {
            text: '누군가 당신의 작업물을 보고 "이 부분은 좀 수정하는 게 좋겠어"라고 코멘트할 때, 당신은:',
            options: {
                A: '그 말을 자동으로 구체적인 조언으로 필터링해서, 더 나은 결과물을 위한 참고 데이터로 활용한다.',
                Turbulent: '처음엔 약간 부정당한 느낌에 상처를 받는다. "내가 부족하다"는 감정에서 "작업물을 좋게 만들자"로 생각을 전환하는 데 시간이 좀 걸린다.'
            }
        }
    }
};
