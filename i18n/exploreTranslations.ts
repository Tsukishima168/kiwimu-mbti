export type ExploreLocale = 'zh' | 'en' | 'ja' | 'ko';

export type ExploreMBTIType =
  | 'INTJ'
  | 'INTP'
  | 'INFJ'
  | 'INFP'
  | 'ISTJ'
  | 'ISTP'
  | 'ISFJ'
  | 'ISFP'
  | 'ENTJ'
  | 'ENTP'
  | 'ENFJ'
  | 'ENFP'
  | 'ESTJ'
  | 'ESTP'
  | 'ESFJ'
  | 'ESFP';

export type ExploreAnswerValue = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P' | 'A' | 'T';

export interface ExploreLocalizedOption {
  text: string;
  value: ExploreAnswerValue;
  visual: string;
}

export interface ExploreLocalizedQuestion {
  id: 'q1' | 'q2' | 'q3' | 'q4' | 'q5';
  dimension: 'E/I' | 'S/N' | 'T/F' | 'J/P' | 'A/T';
  text: string;
  options: [ExploreLocalizedOption, ExploreLocalizedOption];
}

export interface ExploreLocalizedQuiz {
  id: 'A' | 'B';
  title: string;
  description: string;
  questions: ExploreLocalizedQuestion[];
}

export interface ExploreLocalizedPersonality {
  state: string;
  core: string;
  kiwimuSays: string;
}

export interface ExploreLocalePack {
  intro: {
    eyebrow: string;
    sideLabel: string;
    subtitle: string;
    cta: string;
    note: string;
  };
  result: {
    stateLabel: string;
    coreLabel: string;
    saysLabel: string;
    shareLabel: string;
    shareButton: string;
    shareCopied: string;
    retestButton: string;
    fullQuizButton: string;
    stickerButton: string;
  };
  quizzes: {
    A: ExploreLocalizedQuiz;
    B: ExploreLocalizedQuiz;
  };
  personalities: Record<ExploreMBTIType, ExploreLocalizedPersonality>;
}

export const exploreTranslations: Record<ExploreLocale, ExploreLocalePack> = {
  zh: {
    intro: {
      eyebrow: '5 題 · 1 MIN',
      sideLabel: 'KIWIMU STATE TEST',
      subtitle: '今天的你，打發到哪了？',
      cta: '開始打發 →',
      note: '不需要登入 · 完全免費',
    },
    result: {
      stateLabel: '今日狀態',
      coreLabel: '核心一句',
      saysLabel: 'Kiwimu 說',
      shareLabel: '截圖 → 分享 IG',
      shareButton: '傳給朋友來測 →',
      shareCopied: '連結已複製 ✓',
      retestButton: '重新測驗',
      fullQuizButton: '做完整 40 題免費測驗 →',
      stickerButton: '收藏 Kiwimu LINE 貼圖 →',
    },
    quizzes: {
      A: {
        id: 'A',
        title: '數位焦慮生存原型',
        description: '5 題測出你的 2026 數位生存原型，你是哪種社交動物？',
        questions: [
          {
            id: 'q1',
            dimension: 'E/I',
            text: '週五深夜，你其實已經累到靈魂出竅，但你躺在床上的「數位反射動作」是？',
            options: [
              {
                text: '在 IG、Threads、LINE 之間瘋狂切換，看看大家在幹嘛、吃什麼瓜，確認自己還連接著世界。',
                value: 'E',
                visual: 'Kiwimu 膨脹成一大坨，試圖沾染每一個社群平台',
              },
              {
                text: '切換到沒人認識的小帳 (Finsta)，在黑暗中毫無目的地狂刷廢片。我現在不想跟任何「活人」交集。',
                value: 'I',
                visual: 'Kiwimu 縮成一小滴，躲進沒有人找得到的角落',
              },
            ],
          },
          {
            id: 'q2',
            dimension: 'S/N',
            text: '在社群看到一篇萬人轉發、吵得不可開交的爭議貼文，你的大腦第一反應是？',
            options: [
              {
                text: '立刻滑留言區找「懶人包」。我需要搞清楚時間線、誰對誰錯、證據在哪。',
                value: 'S',
                visual: 'Kiwimu 變成一把精準的抹刀，把資訊刮得平平整整',
              },
              {
                text: '跳脫事件本身，開始思考這反映了什麼「社會底層現象」，或腦中自動衍生成荒謬梗圖。',
                value: 'N',
                visual: 'Kiwimu 飄到半空中，變成一朵形狀怪異的雲',
              },
            ],
          },
          {
            id: 'q3',
            dimension: 'T/F',
            text: '朋友在群組崩潰大哭：「我又被炎上了 / 被主管羞辱了！」你的鍵盤會先打出什麼？',
            options: [
              {
                text: '「先截圖留底！我們來盤點這件事的邏輯漏洞，準備反擊。」先解決問題。',
                value: 'T',
                visual: 'Kiwimu 瞬間冷凍，變成一塊理性的冰磚',
              },
              {
                text: '「天啊抱抱你！這真的太委屈了，他們有病吧！」先接住情緒。',
                value: 'F',
                visual: 'Kiwimu 融化成一灘溫柔，把對方包圍起來',
              },
            ],
          },
          {
            id: 'q4',
            dimension: 'J/P',
            text: '看看你手機瀏覽器的「分頁」跟「未讀通知」，最符合你的狀態是？',
            options: [
              {
                text: '定期清理！看到未讀小紅點會極度焦慮，清空才有一種「人生還在掌控中」的錯覺。',
                value: 'J',
                visual: 'Kiwimu 把自己擠成完美的形狀，不容許一絲歪斜',
              },
              {
                text: '分頁永遠 99+。雖然不記得裡面有什麼，但我相信「哪天一定會用到它」。',
                value: 'P',
                visual: 'Kiwimu 隨意地趴在桌上，變成一坨毫無形狀的快樂軟泥',
              },
            ],
          },
          {
            id: 'q5',
            dimension: 'A/T',
            text: '如果你發了一則自認超好笑的限動，結果半小時過去，完全沒人理你？',
            options: [
              {
                text: '「這屆網友真不懂幽默。」或者「演算法壞了吧。」滑掉手機，毫不在意去吃宵夜。',
                value: 'A',
                visual: 'Kiwimu 依然完好，毫不在意地抖動了一下',
              },
              {
                text: '「是不是不好笑？我得罪人了嗎？」內心小劇場爆發，最後默默刪掉。',
                value: 'T',
                visual: 'Kiwimu 開始冒汗，邊緣漸漸融化塌陷',
              },
            ],
          },
        ],
      },
      B: {
        id: 'B',
        title: '潛水躺平生存原型',
        description: '如果人生是一場生存遊戲，這 5 個抉擇將決定你靈魂深處的隱藏天賦。',
        questions: [
          {
            id: 'q1',
            dimension: 'E/I',
            text: '半熟不熟的同事突然提議：「週末大家要不要一起去喝咖啡放鬆？」你的內心 OS 是？',
            options: [
              {
                text: '好啊！反正週末沒事，去聽聽八卦打發時間也不錯，有人約就走。',
                value: 'E',
                visual: 'Kiwimu 開心地跳出去，準備融入任何場合',
              },
              {
                text: '放鬆？跟你們出去就是加班！大腦瞬間高速運轉，搜尋一百種「禮貌拒絕」的藉口。',
                value: 'I',
                visual: 'Kiwimu 瞬間結成硬殼，拒絕任何外來物靠近',
              },
            ],
          },
          {
            id: 'q2',
            dimension: 'S/N',
            text: '家裡水龍頭壞了或軟體閃退，上網查教學時，你會點開什麼？',
            options: [
              {
                text: '找「30 秒短影音」或圖文步驟。別講原理，告訴我第一步轉哪、第二步按哪就好。',
                value: 'S',
                visual: 'Kiwimu 變成一本精準的說明書，只顯示下一步',
              },
              {
                text: '查著查著，突然對這東西的「運作原理」或歷史產生興趣，最後看了一堆維基百科。',
                value: 'N',
                visual: 'Kiwimu 戴上偵探帽，鑽進問題深處探險',
              },
            ],
          },
          {
            id: 'q3',
            dimension: 'T/F',
            text: '看劇時，發現主角因為「太重感情」而做出極度愚蠢的決定，你的反應是？',
            options: [
              {
                text: '翻白眼。「這邏輯根本不通！把話說清楚不就好了，浪費大家時間！」',
                value: 'T',
                visual: 'Kiwimu 舉起一塊冷靜的小牌子：「邏輯錯誤」',
              },
              {
                text: '雖然覺得笨，但心裡酸酸的。「唉，我懂他為什麼這樣選，因為太害怕失去了……」',
                value: 'F',
                visual: 'Kiwimu 跟著主角一起默默流淚',
              },
            ],
          },
          {
            id: 'q4',
            dimension: 'J/P',
            text: '本來計畫週末要「徹底躺平」，朋友突然傳訊：「我剛好在你家附近，半小時後去找你！」',
            options: [
              {
                text: '崩潰！我的「什麼都不做」是排定好的行程！突發變動讓我必須重新整頓心情，超煩！',
                value: 'J',
                visual: 'Kiwimu 的行程被打破，氣到表面開始冒泡',
              },
              {
                text: '喔，好啊。反正我也只是一坨會呼吸的肉，你就來吧，大不了我們一起躺在沙發滑手機。',
                value: 'P',
                visual: 'Kiwimu 攤成一張地毯：「來吧，踩過我也沒關係」',
              },
            ],
          },
          {
            id: 'q5',
            dimension: 'A/T',
            text: '你不小心把一張有點尷尬的梗圖，傳到了「有主管在的工作群組」。',
            options: [
              {
                text: '秒收回，打個「哈哈傳錯抱歉」。只要我不尷尬，尷尬的就是別人，三分鐘後忘記。',
                value: 'A',
                visual: 'Kiwimu 優雅地滑過螢幕，假裝什麼都沒發生',
              },
              {
                text: '雖然秒收回了，但接下來兩小時瘋狂內耗：「主管有看到嗎？我的考績是不是毀了？」',
                value: 'T',
                visual: 'Kiwimu 緊張到把自己攪拌過度，變成油水分離',
              },
            ],
          },
        ],
      },
    },
    personalities: {
      INTJ: {
        state: '低電量靜止中',
        core: '在規劃一個沒人知道的計畫',
        kiwimuSays: '你看了所有人三秒，就知道誰值得繼續說下去。然後你選擇安靜。Kiwimu 不怪你。',
      },
      INTP: {
        state: '超頻思考中',
        core: '大腦跑太快，身體跟不上',
        kiwimuSays: '你腦子裡正在進行一場沒有人被邀請的辯論。結束了再跟我說誰贏。Kiwimu 在外面等。',
      },
      INFJ: {
        state: '靜默感應中',
        core: '什麼都沒說，什麼都知道',
        kiwimuSays: '你早就知道了，只是沒說。Kiwimu 也知道你知道。',
      },
      INFP: {
        state: '緩慢融化中',
        core: '情緒太滿，需要一個角落',
        kiwimuSays: '你在另一個宇宙裡沸騰，但別人看到的只有你安靜坐在那裡。Kiwimu 也覺得這樣很孤單。',
      },
      ISTJ: {
        state: '穩定運作中',
        core: '不需要掌聲，只要不被打斷',
        kiwimuSays: '你已經把這件事做了很久，沒有人說謝謝。Kiwimu 知道。',
      },
      ISTP: {
        state: '冷靜觀察中',
        core: '沒在聽，但什麼都記住了',
        kiwimuSays: '你沒在聽，你只是不想讓別人知道你都聽進去了。Kiwimu 也假裝沒注意到。',
      },
      ISFJ: {
        state: '默默守護中',
        core: '不說愛，但一直在',
        kiwimuSays: '你記得每個人的細節，但沒有人記得問你過得怎樣。Kiwimu 現在問你。',
      },
      ISFP: {
        state: '輕輕存在中',
        core: '不佔位，但少了就不對',
        kiwimuSays: '你沒什麼主張，但你其實什麼都有主張。只是懶得跟不值得的人解釋。Kiwimu 懂。',
      },
      ENTJ: {
        state: '全速執行中',
        core: '停下來才是真的累',
        kiwimuSays: '你往前衝的速度讓大家跟不上，然後你回頭看，發現只剩你自己。Kiwimu 跑得比較慢，但一直在。',
      },
      ENTP: {
        state: '拋出問題中',
        core: '沒有答案，但有更好的問題',
        kiwimuSays: '你把對話帶進了沒人想去的深坑，然後自己跳進去。Kiwimu 佩服你，也有點替你捏把冷汗。',
      },
      ENFJ: {
        state: '全頻接收中',
        core: '扛著所有人的情緒往前走',
        kiwimuSays: '你扛著所有人的情緒往前走，臉上還掛著笑。Kiwimu 想知道，你真的還好嗎？',
      },
      ENFP: {
        state: '四散發光中',
        core: '能量滿載，方向待定',
        kiwimuSays: '你同時在做六件事，都做到一半。但每一半都比別人的全部更有意思。Kiwimu 覺得這樣其實還行。',
      },
      ESTJ: {
        state: '精準校準中',
        core: '一切都要在對的位置',
        kiwimuSays: '你心裡有一個標準答案，大部分人交出來的都不對。你沒說，但你的臉說了。Kiwimu 建議你偶爾降低一點期待。',
      },
      ESTP: {
        state: '即時反應中',
        core: '先行動，再想清楚',
        kiwimuSays: '你在每個當下都是最好的那個人。下一個當下再說。Kiwimu 跟不上你，但很享受看著你。',
      },
      ESFJ: {
        state: '持續供暖中',
        core: '怕你冷，也怕你餓',
        kiwimuSays: '你嘴上說不在意，但你把每個人的反應都記得一清二楚。Kiwimu 不會說出去。',
      },
      ESFP: {
        state: '燃燒當下中',
        core: '過了今天再說，今天先開心',
        kiwimuSays: '你不是不想深，你只是不願意在不值得的地方深。Kiwimu 覺得這是一種本能。',
      },
    },
  },

  en: {
    intro: {
      eyebrow: '5 Qs · 1 MIN',
      sideLabel: 'KIWIMU STATE TEST',
      subtitle: "Where are you even taking your energy today?",
      cta: 'Start the chaos →',
      note: 'No login needed · totally free',
    },
    result: {
      stateLabel: "Today's state",
      coreLabel: 'Core line',
      saysLabel: 'Kiwimu says',
      shareLabel: 'Screenshot → Share to IG',
      shareButton: 'Send this to a friend →',
      shareCopied: 'Link copied ✓',
      retestButton: 'Retake',
      fullQuizButton: 'Take the full 40-question free test →',
      stickerButton: 'Grab the Kiwimu LINE sticker pack →',
    },
    quizzes: {
      A: {
        id: 'A',
        title: 'Digital Survival Archetype',
        description: '5 questions to read your 2026 digital survival mode. What kind of social creature are you?',
        questions: [
          {
            id: 'q1',
            dimension: 'E/I',
            text: 'It is Friday night, you are fully cooked, but your body still has one last digital reflex. What do you do?',
            options: [
              {
                text: 'Bounce between IG, Threads, and LINE to see what everyone is doing, what drama is moving, and stay plugged into the world.',
                value: 'E',
                visual: 'Kiwimu inflates into a giant social blob, trying to stick to every platform',
              },
              {
                text: 'Switch to a private alt account and scroll random trash in the dark. I do not want contact with any living human right now.',
                value: 'I',
                visual: 'Kiwimu shrinks into a tiny drop and hides where nobody can find it',
              },
            ],
          },
          {
            id: 'q2',
            dimension: 'S/N',
            text: 'You see a post getting thousands of shares and starting a huge fight. Your brain instantly goes:',
            options: [
              {
                text: 'Open the comments and find the receipts. I need the timeline, the facts, and who actually did what.',
                value: 'S',
                visual: 'Kiwimu turns into a precision scraper, smoothing the info flat',
              },
              {
                text: 'Zoom out and ask what this says about the culture underneath it, or let it mutate into a ridiculous meme in my head.',
                value: 'N',
                visual: 'Kiwimu floats up and becomes a weird-shaped cloud',
              },
            ],
          },
          {
            id: 'q3',
            dimension: 'T/F',
            text: 'A friend is spiraling in the group chat: "I got dragged online again / my boss just cooked me." What do you type first?',
            options: [
              {
                text: '“Screenshot first. Let’s break down the logic holes and build the reply.” Fix the problem first.',
                value: 'T',
                visual: 'Kiwimu flash-freezes into a clean, rational ice brick',
              },
              {
                text: '“Oh no, come here. That is actually so messed up.” Hold the feeling first.',
                value: 'F',
                visual: 'Kiwimu melts into a warm puddle and wraps around the person',
              },
            ],
          },
          {
            id: 'q4',
            dimension: 'J/P',
            text: 'Look at your phone browser tabs and unread notifications. Which one sounds most like you?',
            options: [
              {
                text: 'I clean them regularly. The red badge makes me weirdly anxious, and clearing it feels like life is under control again.',
                value: 'J',
                visual: 'Kiwimu squeezes itself into perfect alignment and refuses any wobble',
              },
              {
                text: 'Tabs are always 99+. I do not remember what is in there, but I swear it will come in handy someday.',
                value: 'P',
                visual: 'Kiwimu flops onto the desk as an unshaped happy blob',
              },
            ],
          },
          {
            id: 'q5',
            dimension: 'A/T',
            text: 'You post a story you think is hilarious, and half an hour later nobody has reacted. What happens?',
            options: [
              {
                text: '“This generation just has no taste.” Or “the algorithm is busted.” I lock the phone and go get snacks.',
                value: 'A',
                visual: 'Kiwimu stays perfectly intact and gives one completely unbothered shake',
              },
              {
                text: '“Was it not funny? Did I offend someone?” The inner monologue starts cooking, and I delete it quietly.',
                value: 'T',
                visual: 'Kiwimu starts sweating as the edges slowly melt and cave in',
              },
            ],
          },
        ],
      },
      B: {
        id: 'B',
        title: 'Low-Key Survival Archetype',
        description: 'If life were a survival game, these 5 choices would reveal the hidden trait set under your chill exterior.',
        questions: [
          {
            id: 'q1',
            dimension: 'E/I',
            text: 'A coworker you barely know goes, “Wanna grab coffee this weekend and unwind?” Your inner monologue is:',
            options: [
              {
                text: 'Sure. I have no plans anyway, and hearing some gossip is a perfectly decent way to kill time. If I am invited, I am in.',
                value: 'E',
                visual: 'Kiwimu hops out happily, ready to merge with any crowd',
              },
              {
                text: 'Relax? Going out with you people is basically overtime. My brain instantly starts drafting a hundred polite exit lines.',
                value: 'I',
                visual: 'Kiwimu hardens into a shell and blocks anything from getting close',
              },
            ],
          },
          {
            id: 'q2',
            dimension: 'S/N',
            text: 'Your sink is broken, or the app keeps crashing. When you search for help, what do you click first?',
            options: [
              {
                text: 'A 30-second video or a step-by-step post. Skip the theory. Just tell me what to turn or tap first.',
                value: 'S',
                visual: 'Kiwimu becomes a dead-simple manual that only shows the next move',
              },
              {
                text: 'I start with the fix and somehow end up deep-diving into how the thing works or its history on Wikipedia.',
                value: 'N',
                visual: 'Kiwimu puts on a detective hat and dives into the problem',
              },
            ],
          },
          {
            id: 'q3',
            dimension: 'T/F',
            text: 'You are watching a drama, and the lead makes a wildly stupid decision because they are “too emotional.” Your reaction is:',
            options: [
              {
                text: 'Eye roll. “That logic makes zero sense. Just say what you mean and save everybody time.”',
                value: 'T',
                visual: 'Kiwimu holds up a tiny calm sign that says “Logic Error”',
              },
              {
                text: 'It is dumb, but also weirdly heartbreaking. “Yeah... I get why they chose that, they were scared of losing it.”',
                value: 'F',
                visual: 'Kiwimu quietly cries along with the lead',
              },
            ],
          },
          {
            id: 'q4',
            dimension: 'J/P',
            text: 'You planned a full weekend of doing absolutely nothing, then a friend texts: “I am near your place, coming over in 30.”',
            options: [
              {
                text: 'I am devastated. My nothingness was scheduled. Sudden change means I have to reset my whole mood, which is deeply annoying.',
                value: 'J',
                visual: 'Kiwimu has its schedule interrupted and starts bubbling with rage',
              },
              {
                text: 'Cool, come over. I am just a breathing pile of flesh anyway. Worst case, we both lie on the couch and doomscroll.',
                value: 'P',
                visual: 'Kiwimu flattens into a rug: “Step on me, I guess”',
              },
            ],
          },
          {
            id: 'q5',
            dimension: 'A/T',
            text: 'You accidentally sent a mildly awkward meme into the work group chat, with your manager in it.',
            options: [
              {
                text: 'Instant unsend, followed by “lol sorry wrong chat.” If I am not embarrassed, it never happened. Three minutes later I have moved on.',
                value: 'A',
                visual: 'Kiwimu glides across the screen like nothing ever happened',
              },
              {
                text: 'I unsend it immediately, but then spend the next two hours spiraling: “Did my manager see it? Is my review dead?”',
                value: 'T',
                visual: 'Kiwimu gets overmixed with nerves and separates into oil and water',
              },
            ],
          },
        ],
      },
    },
    personalities: {
      INTJ: {
        state: 'Low-Battery Freeze',
        core: 'Already planning a move nobody knows exists',
        kiwimuSays: 'You clocked the room in three seconds and already know who gets access. Then you go quiet. Kiwimu respects the silence.',
      },
      INTP: {
        state: 'Overclocked Thoughts',
        core: 'Brain running faster than the body can carry',
        kiwimuSays: 'There is a debate happening in your head that nobody was invited to. When it is over, tell me who won. Kiwimu is waiting outside.',
      },
      INFJ: {
        state: 'Silent Sensing',
        core: 'Said nothing, understood everything',
        kiwimuSays: 'You already knew. You just did not say it. Kiwimu knows you know.',
      },
      INFP: {
        state: 'Slow Melt',
        core: 'Emotion is full, and the corner is needed',
        kiwimuSays: 'You are boiling in another universe, but from the outside you just look still. Kiwimu thinks that is lonely too.',
      },
      ISTJ: {
        state: 'Stable Mode',
        core: 'No applause needed, just do not interrupt',
        kiwimuSays: 'You have been doing the job for a long time, and nobody said thanks. Kiwimu noticed.',
      },
      ISTP: {
        state: 'Cool Observation',
        core: 'Not listening, just storing everything',
        kiwimuSays: 'You are not listening. You are just choosing not to show that you heard all of it. Kiwimu will play along.',
      },
      ISFJ: {
        state: 'Quiet Guard',
        core: 'Does not say love, but is always there',
        kiwimuSays: 'You remember everyone else in detail, and somehow nobody asks how you are doing. Kiwimu is asking now.',
      },
      ISFP: {
        state: 'Softly Here',
        core: 'Does not take up space, but feels wrong if missing',
        kiwimuSays: 'You do not act like you have opinions, but you absolutely do. You just cannot be bothered to explain them to people who do not deserve it. Kiwimu gets it.',
      },
      ENTJ: {
        state: 'Full-Speed Execute',
        core: 'Stopping is the real exhaustion',
        kiwimuSays: 'You move so fast that nobody can keep up, then you look back and realize you are alone. Kiwimu runs slower, but it is still here.',
      },
      ENTP: {
        state: 'Throwing Questions',
        core: 'No answer yet, but better questions for sure',
        kiwimuSays: 'You dragged the conversation into a hole nobody wanted to enter, and then jumped in yourself. Kiwimu is impressed and a little worried.',
      },
      ENFJ: {
        state: 'Full-Channel Reception',
        core: 'Carrying everyone else forward on your back',
        kiwimuSays: 'You are hauling everybody’s feelings forward with a smile on your face. Kiwimu wants to know if you are actually okay.',
      },
      ENFP: {
        state: 'Scattering Light',
        core: 'Battery full, direction still loading',
        kiwimuSays: 'You are doing six things at once and all of them are half-done. But each half is more interesting than most people’s whole plan. Kiwimu kind of likes that.',
      },
      ESTJ: {
        state: 'Precision Calibrating',
        core: 'Everything has to land in the right place',
        kiwimuSays: 'You already have the correct answer in your head, and most people are not turning it in. You did not say it, but your face did. Kiwimu suggests easing up a little.',
      },
      ESTP: {
        state: 'Live Reaction',
        core: 'Act first, figure it out after',
        kiwimuSays: 'You are the best version of yourself in every exact moment. The next moment can wait. Kiwimu cannot keep up, but it loves watching.',
      },
      ESFJ: {
        state: 'Always Warm',
        core: 'Worried you are cold, worried you are hungry',
        kiwimuSays: 'You say you do not care, but you remember everybody’s reaction with scary precision. Kiwimu is not telling.',
      },
      ESFP: {
        state: 'Burning the Moment',
        core: 'Tomorrow can wait, today should be fun',
        kiwimuSays: 'You are not afraid of depth. You just do not want to waste it on places that do not deserve it. Kiwimu thinks that is instinct.',
      },
    },
  },

  ja: {
    intro: {
      eyebrow: '5問 · 約1分',
      sideLabel: 'KIWIMU STATE TEST',
      subtitle: '今日はどこで消化する？',
      cta: 'ゆるっと始める →',
      note: 'ログイン不要 · 完全無料',
    },
    result: {
      stateLabel: '今日の状態',
      coreLabel: 'コアのひとこと',
      saysLabel: 'Kiwimu のひとこと',
      shareLabel: 'スクショしてIGへ',
      shareButton: '友だちに投げる →',
      shareCopied: 'リンクをコピーしました ✓',
      retestButton: 'もう一度やる',
      fullQuizButton: '本編40問の無料テストへ →',
      stickerButton: 'Kiwimu LINEスタンプを見る →',
    },
    quizzes: {
      A: {
        id: 'A',
        title: 'デジタル疲労サバイバル原型',
        description: '5問で見る、2026年のデジタル生存モード。あなたはどんなソーシャル生物？',
        questions: [
          {
            id: 'q1',
            dimension: 'E/I',
            text: '金曜の深夜。もう魂は抜けているのに、ベッドで出る「デジタル反射」はどれ？',
            options: [
              {
                text: 'IG、Threads、LINEを行ったり来たりして、みんなの近況や炎上を追いながら世界とつながっていたい。',
                value: 'E',
                visual: 'Kiwimu がでっかく膨らんで、全SNSに張り付こうとしている',
              },
              {
                text: '誰も知らない鍵垢に切り替えて、真っ暗な中で意味もなく廃動画を延々と見る。今は活きた人間と関わりたくない。',
                value: 'I',
                visual: 'Kiwimu が小さなしずくになって、見つからない隅に隠れる',
              },
            ],
          },
          {
            id: 'q2',
            dimension: 'S/N',
            text: 'SNSで数万リポストの大荒れ投稿を見た時、最初に頭に浮かぶのは？',
            options: [
              {
                text: 'まずコメント欄で整理済みまとめを探す。時系列、誰が何をしたか、証拠がどこかを把握したい。',
                value: 'S',
                visual: 'Kiwimu が精密なヘラになって、情報をきれいに削ぎ落としていく',
              },
              {
                text: '出来事そのものから一歩引いて、これが何を映しているのか考えるか、頭の中で勝手に変なミームに育つ。',
                value: 'N',
                visual: 'Kiwimu が空中に浮いて、妙な形の雲になる',
              },
            ],
          },
          {
            id: 'q3',
            dimension: 'T/F',
            text: 'グループチャットで友だちが大荒れ。「また炎上した / 上司に詰められた！」 まず何て打つ？',
            options: [
              {
                text: '「まずスクショ。ロジックの穴を洗って、反論の形を作ろう。」 先に問題を片づける。',
                value: 'T',
                visual: 'Kiwimu が一瞬で冷凍され、理屈の氷になった',
              },
              {
                text: '「うわ、つらいね。ほんとにしんどかったでしょ。」 先に気持ちを受け止める。',
                value: 'F',
                visual: 'Kiwimu がやわらかく溶けて、相手を包み込む',
              },
            ],
          },
          {
            id: 'q4',
            dimension: 'J/P',
            text: 'スマホのタブと未読通知を見た時、一番しっくりくる状態は？',
            options: [
              {
                text: '定期的に片づける。未読バッジがあると落ち着かないし、ゼロにすると人生がまだ管理下にある気がする。',
                value: 'J',
                visual: 'Kiwimu が自分を完璧な形に押し込めて、少しの歪みも許さない',
              },
              {
                text: 'タブはずっと99+。中身は覚えてないけど、いつか絶対使うはずだと信じている。',
                value: 'P',
                visual: 'Kiwimu が机にだらっと広がって、形のない幸せなぬいぐるみになる',
              },
            ],
          },
          {
            id: 'q5',
            dimension: 'A/T',
            text: '自分ではめちゃくちゃ面白いと思ったストーリーを上げたのに、30分たっても完全に無反応だったら？',
            options: [
              {
                text: '「今のネット民、センスないな」か「アルゴリズム死んでるでしょ」。そのままスマホを置いて夜食へ。',
                value: 'A',
                visual: 'Kiwimu は無傷のまま、まったく気にせず一度だけふるえる',
              },
              {
                text: '「これ、つまらなかった？ 誰か怒った？」 内心の小劇場が始まり、最後はそっと削除する。',
                value: 'T',
                visual: 'Kiwimu が汗をかきはじめ、端からじわじわ溶け落ちる',
              },
            ],
          },
        ],
      },
      B: {
        id: 'B',
        title: '潜水・省エネサバイバル原型',
        description: '人生がサバイバルゲームなら、この5つの選択が、あなたの隠れた適性を教えてくれる。',
        questions: [
          {
            id: 'q1',
            dimension: 'E/I',
            text: 'そこまで親しくない同僚から「週末、軽くコーヒーでも行かない？」と突然。心の声は？',
            options: [
              {
                text: 'いいね。週末ヒマだし、ちょっとした雑談や噂話を聞くのも悪くない。誘われたら行く。',
                value: 'E',
                visual: 'Kiwimu が軽やかに飛び出して、どんな場にも溶け込もうとする',
              },
              {
                text: 'リラックス？ それ、私にとっては追加勤務です。脳内で「角が立たない断り文句」を100個検索する。',
                value: 'I',
                visual: 'Kiwimu が一瞬で殻を作り、外のものを寄せつけない',
              },
            ],
          },
          {
            id: 'q2',
            dimension: 'S/N',
            text: '家の蛇口が壊れた、またはアプリが落ちる。調べる時、まず何を開く？',
            options: [
              {
                text: '30秒動画か、手順が一目でわかる図解。理屈はいいから、最初にどこを回すかだけ教えてほしい。',
                value: 'S',
                visual: 'Kiwimu が的確な説明書になって、次の一手だけを見せる',
              },
              {
                text: '調べているうちに、仕組みや歴史のほうが気になって、気づいたらWikipediaを延々読んでいる。',
                value: 'N',
                visual: 'Kiwimu が探偵帽をかぶって、問題の深部へ潜っていく',
              },
            ],
          },
          {
            id: 'q3',
            dimension: 'T/F',
            text: 'ドラマを見ていて、「感情が重すぎて」ありえない選択をする主人公を見た時の反応は？',
            options: [
              {
                text: 'ため息。「そのロジックは通らないでしょ。ちゃんと話せば済むのに、時間のムダ。」',
                value: 'T',
                visual: 'Kiwimu が落ち着いた札を掲げる：「ロジックエラー」',
              },
              {
                text: 'バカだなと思うのに、胸がきゅっとする。「わかる。失うのが怖かったんだろうな……」',
                value: 'F',
                visual: 'Kiwimu が主人公と一緒にそっと泣いている',
              },
            ],
          },
          {
            id: 'q4',
            dimension: 'J/P',
            text: '週末は完全に引きこもる予定だったのに、友だちから「今ちょうど近くにいる、30分後に行く」と連絡。',
            options: [
              {
                text: '無理！ 何もしない時間まで予定に入っているんだよ。突然の変更で気持ちを整え直すの、めちゃくちゃ面倒。',
                value: 'J',
                visual: 'Kiwimu の予定が崩れて、表面がぶくぶく怒りだす',
              },
              {
                text: 'あ、いいよ。どうせ私はただの呼吸する肉塊だし。来ればいいよ、最悪ソファで一緒にダラダラするだけ。',
                value: 'P',
                visual: 'Kiwimu がラグに広がって「踏んでもいいよ」モードになる',
              },
            ],
          },
          {
            id: 'q5',
            dimension: 'A/T',
            text: 'ちょっと気まずい系のミームを、上司入りの仕事グループに誤爆した。',
            options: [
              {
                text: '即削除して「すみません、誤送信です」。私が気にしなければ、恥は存在しない。3分後には忘れてる。',
                value: 'A',
                visual: 'Kiwimu が何事もなかったように画面をすり抜ける',
              },
              {
                text: '即削除したのに、その後2時間ずっと脳内会議。「上司見た？ 評価終わった？」',
                value: 'T',
                visual: 'Kiwimu が緊張しすぎて、混ぜすぎた油水みたいに分離する',
              },
            ],
          },
        ],
      },
    },
    personalities: {
      INTJ: {
        state: '低電力で静止中',
        core: '誰にも言っていない計画を進めている',
        kiwimuSays: '3秒見ただけで、誰と話す価値があるか分かってる。で、静かになる。Kiwimu はその選択をわかってる。',
      },
      INTP: {
        state: '思考オーバークロック',
        core: '頭が回りすぎて、体が追いつかない',
        kiwimuSays: '頭の中で、誰も招待していない討論会が始まってる。終わったら勝者を教えて。Kiwimu は外で待ってる。',
      },
      INFJ: {
        state: '静かに察知中',
        core: '何も言わずに、全部わかっている',
        kiwimuSays: 'もう気づいてるでしょ、っていうやつ。言ってないだけ。Kiwimu もそれはわかってる。',
      },
      INFP: {
        state: 'ゆっくり溶けてる',
        core: '感情がいっぱいで、ひとりの角が欲しい',
        kiwimuSays: '別の宇宙では沸騰してるのに、こっちからは静かに座っているだけに見える。Kiwimu もそれ、ちょっと寂しいと思う。',
      },
      ISTJ: {
        state: '安定運用中',
        core: '拍手はいらない、ただ邪魔しないで',
        kiwimuSays: 'もうずっとやってきたのに、誰もありがとうと言わない。Kiwimu はちゃんと見てる。',
      },
      ISTP: {
        state: '冷静観察中',
        core: '聞いていないようで、全部覚えている',
        kiwimuSays: '聞いてないんじゃない。全部聞いたのを、わざわざ見せたくないだけ。Kiwimu も知らないふりをする。',
      },
      ISFJ: {
        state: '静かな見守り',
        core: '愛は言わないけど、ずっといる',
        kiwimuSays: 'みんなの細かいことは覚えてるのに、あなたに「元気？」って聞く人が少ない。Kiwimu は今聞く。',
      },
      ISFP: {
        state: 'そっと存在中',
        core: '場所は取らない。でもいないと違う',
        kiwimuSays: '主張がないようで、実は全部ある。ただ、価値のない相手に説明するのが面倒なだけ。Kiwimu はわかってる。',
      },
      ENTJ: {
        state: '全速実行中',
        core: '止まるほうが、よっぽど疲れる',
        kiwimuSays: '前に進む速度が速すぎて、周りが追いつけない。振り返ったら一人。Kiwimu は遅いけど、ちゃんといる。',
      },
      ENTP: {
        state: '問いを投げる中',
        core: '答えはまだないけど、問いはもっと良くなる',
        kiwimuSays: '誰も行きたくない深い穴に会話を落として、自分も飛び込む。Kiwimu は感心するし、ちょっと心配でもある。',
      },
      ENFJ: {
        state: '全チャンネル受信中',
        core: 'みんなの感情を背負って進む',
        kiwimuSays: '笑ってる顔のまま、全員の感情を運んでる。Kiwimu は聞きたい。ほんとに大丈夫？',
      },
      ENFP: {
        state: '四方に発光中',
        core: 'エネルギー満タン、方向はまだ未定',
        kiwimuSays: '6個のことを同時にやって、全部半分。でもその半分一つひとつが、他の人の全部より面白い。Kiwimu はわりと好き。',
      },
      ESTJ: {
        state: '精密校正中',
        core: 'すべては正しい場所にあるべき',
        kiwimuSays: '頭の中には正解があるのに、たいてい誰もその通りに出してこない。顔には出してないつもりでも、出てる。Kiwimu は少しだけ期待を下げるのを勧める。',
      },
      ESTP: {
        state: '即応反応中',
        core: 'まず動く、あとで考える',
        kiwimuSays: 'その瞬間ごとに、あなたはいつでも最高。次の瞬間は次でいい。Kiwimu は追いつけないけど、見ていて楽しい。',
      },
      ESFJ: {
        state: 'ずっと温め中',
        core: '寒くないか、空腹じゃないかが気になる',
        kiwimuSays: '気にしてないって言いながら、みんなの反応を全部覚えてる。Kiwimu は言わない。',
      },
      ESFP: {
        state: '今を燃やし中',
        core: '明日は明日、今日はまず楽しく',
        kiwimuSays: '深さが嫌いなわけじゃない。ただ、価値のない場所で深くなりたくないだけ。Kiwimu はそれ、本能だと思う。',
      },
    },
  },

  ko: {
    intro: {
      eyebrow: '5문항 · 1분',
      sideLabel: 'KIWIMU STATE TEST',
      subtitle: '오늘의 나, 어디까지 소모할래?',
      cta: '가볍게 시작 →',
      note: '로그인 없이 · 완전 무료',
    },
    result: {
      stateLabel: '오늘의 상태',
      coreLabel: '핵심 한줄',
      saysLabel: 'Kiwimu 한마디',
      shareLabel: '캡처 → 인스타 공유',
      shareButton: '친구한테 보내기 →',
      shareCopied: '링크가 복사됐어요 ✓',
      retestButton: '다시 하기',
      fullQuizButton: '40문항 무료 테스트로 →',
      stickerButton: 'Kiwimu LINE 스티커 보기 →',
    },
    quizzes: {
      A: {
        id: 'A',
        title: '디지털 과부하 생존형',
        description: '5문항으로 읽는 2026 디지털 생존 모드. 당신은 어떤 소셜 생명체인가요?',
        questions: [
          {
            id: 'q1',
            dimension: 'E/I',
            text: '금요일 밤, 이미 영혼은 퇴근했는데도 침대 위에서 몸이 먼저 하는 디지털 반응은?',
            options: [
              {
                text: '인스타, 쓰레드, 단톡을 계속 왔다 갔다 하면서 다들 뭐 하는지, 무슨 이슈가 도는지 보고 세상과 연결되어 있는다.',
                value: 'E',
                visual: 'Kiwimu가 크게 부풀어 올라 모든 SNS에 들러붙으려 한다',
              },
              {
                text: '아무도 모르는 부계로 바꾸고, 어두운 방에서 의미 없이 영상만 무한 스크롤한다. 지금은 살아 있는 인간이랑 접점이 싫다.',
                value: 'I',
                visual: 'Kiwimu가 작은 물방울이 되어 아무도 못 찾는 구석에 숨는다',
              },
            ],
          },
          {
            id: 'q2',
            dimension: 'S/N',
            text: 'SNS에서 수만 리트윗에 난리 난 논란 글을 봤을 때, 제일 먼저 떠오르는 생각은?',
            options: [
              {
                text: '댓글부터 열어서 정리본 찾기. 타임라인, 누가 뭘 했는지, 증거가 어디 있는지 먼저 알아야 한다.',
                value: 'S',
                visual: 'Kiwimu가 정교한 주걱이 되어 정보를 깔끔하게 밀어낸다',
              },
              {
                text: '사건 자체에서 한 발 물러나, 이게 뭘 보여주는지 생각하거나 머릿속에서 이상한 밈으로 자라난다.',
                value: 'N',
                visual: 'Kiwimu가 공중으로 떠오르며 묘한 모양의 구름이 된다',
              },
            ],
          },
          {
            id: 'q3',
            dimension: 'T/F',
            text: '단톡에서 친구가 멘탈 터짐. “또 저격당했어 / 팀장한테 털렸어!” 그때 가장 먼저 치는 말은?',
            options: [
              {
                text: '“일단 캡처해. 논리 구멍부터 정리하고 반박 준비하자.” 문제부터 해결.',
                value: 'T',
                visual: 'Kiwimu가 바로 냉동돼서 이성적인 얼음덩이가 된다',
              },
              {
                text: '“아 너무 힘들었겠다, 진짜 너무 억울했겠다.” 감정부터 받아주기.',
                value: 'F',
                visual: 'Kiwimu가 말랑하게 녹아 상대를 감싸 안는다',
              },
            ],
          },
          {
            id: 'q4',
            dimension: 'J/P',
            text: '휴대폰 브라우저 탭이랑 안 읽은 알림을 보면, 제일 잘 맞는 상태는?',
            options: [
              {
                text: '정기적으로 정리한다. 빨간 알림 배지가 있으면 괜히 불안하고, 싹 비워야 인생이 아직 통제되는 느낌이 든다.',
                value: 'J',
                visual: 'Kiwimu가 자신을 완벽한 모양으로 눌러서 한 치의 삐뚤어짐도 허용하지 않는다',
              },
              {
                text: '탭은 늘 99+. 뭐가 있는지는 기억 안 나도, 언젠가는 분명 쓸 일이 있을 거라 믿는다.',
                value: 'P',
                visual: 'Kiwimu가 탁자에 푹 퍼져 형체 없는 행복한 말랑이 된다',
              },
            ],
          },
          {
            id: 'q5',
            dimension: 'A/T',
            text: '내 기준 개웃긴 스토리를 올렸는데, 30분 지나도 아무 반응이 없으면?',
            options: [
              {
                text: '“요즘 애들은 유머를 모르네.” 아니면 “알고리즘이 망했나 보다.” 폰 내려놓고 야식 먹으러 간다.',
                value: 'A',
                visual: 'Kiwimu가 멀쩡한 채로 아무렇지 않게 한 번 흔들린다',
              },
              {
                text: '“안 웃긴가? 내가 뭐 잘못했나?” 속으로 시뮬레이션이 폭발하고, 결국 조용히 삭제한다.',
                value: 'T',
                visual: 'Kiwimu가 식은땀을 흘리며 가장자리부터 녹아내린다',
              },
            ],
          },
        ],
      },
      B: {
        id: 'B',
        title: '잠수·저전력 생존형',
        description: '인생이 생존게임이라면, 이 5가지 선택이 당신의 숨은 스탯을 알려준다.',
        questions: [
          {
            id: 'q1',
            dimension: 'E/I',
            text: '덜 친한 회사 동료가 갑자기 “주말에 가볍게 커피 한잔 하자”라고 한다. 속마음은?',
            options: [
              {
                text: '좋지. 주말에 딱히 할 일도 없고, 가서 가벼운 수다나 회사 얘기 듣는 것도 나쁘지 않다. 부르면 간다.',
                value: 'E',
                visual: 'Kiwimu가 신나게 튀어나가 어떤 자리든 섞일 준비를 한다',
              },
              {
                text: '휴식? 너희랑 나가면 그건 그냥 추가 근무다. 머리가 바로 “예의 있게 거절하는 방법” 100개를 검색한다.',
                value: 'I',
                visual: 'Kiwimu가 순식간에 딱딱한 껍질을 만들고 외부를 차단한다',
              },
            ],
          },
          {
            id: 'q2',
            dimension: 'S/N',
            text: '집 수도가 고장 났거나 앱이 튕긴다. 검색할 때 제일 먼저 누르는 건?',
            options: [
              {
                text: '30초짜리 영상이나 한눈에 보이는 단계별 글. 원리는 됐고, 첫 번째로 뭘 돌리거나 눌러야 하는지만 알려줘.',
                value: 'S',
                visual: 'Kiwimu가 정확한 설명서가 되어 다음 행동만 보여준다',
              },
              {
                text: '찾다 보면 작동 원리나 역사 쪽이 더 궁금해져서, 결국 위키백과를 한참 읽고 있다.',
                value: 'N',
                visual: 'Kiwimu가 탐정 모자를 쓰고 문제 속으로 깊이 들어간다',
              },
            ],
          },
          {
            id: 'q3',
            dimension: 'T/F',
            text: '드라마 보다가, 주인공이 “감정이 너무 앞서서” 말도 안 되는 선택을 하는 걸 보면?',
            options: [
              {
                text: '눈에 띄게 한숨. “그 논리는 말이 안 되지. 그냥 말만 했어도 끝날 일을 왜 저래.”',
                value: 'T',
                visual: 'Kiwimu가 차분한 팻말을 들어 올린다: “논리 오류”',
              },
              {
                text: '바보 같긴 한데 마음이 찡하다. “아... 나도 알아. 잃는 게 너무 무서웠겠지.”',
                value: 'F',
                visual: 'Kiwimu가 주인공 옆에서 조용히 같이 운다',
              },
            ],
          },
          {
            id: 'q4',
            dimension: 'J/P',
            text: '주말에 완전 눕눕할 계획이었는데, 친구가 “지금 네 집 근처인데 30분 뒤에 갈게”라고 보낸다면?',
            options: [
              {
                text: '멘붕. 내 “아무것도 안 하기”도 다 스케줄이었거든. 갑작스런 변경은 기분 리셋부터 해야 해서 너무 귀찮다.',
                value: 'J',
                visual: 'Kiwimu의 일정이 깨져서 표면부터 부글부글 끓는다',
              },
              {
                text: '오케이. 어차피 나도 숨 쉬는 고기덩어리니까 와. 최악의 경우 소파에 같이 누워서 폰 보면 된다.',
                value: 'P',
                visual: 'Kiwimu가 러그처럼 퍼지며 “밟아도 돼” 모드가 된다',
              },
            ],
          },
          {
            id: 'q5',
            dimension: 'A/T',
            text: '조금 민망한 밈을, 상사까지 있는 업무 단톡에 잘못 보냈다.',
            options: [
              {
                text: '즉시 회수하고 “ㅋㅋ 잘못 보냈어요 죄송” 한 마디. 내가 안 민망하면 민망한 건 없다. 3분 뒤엔 잊음.',
                value: 'A',
                visual: 'Kiwimu가 아무 일 없었다는 듯 화면을 미끄러져 지나간다',
              },
              {
                text: '즉시 회수했는데도, 다음 2시간 내내 자책: “상사가 봤나? 평가 끝난 거 아냐?”',
                value: 'T',
                visual: 'Kiwimu가 너무 긴장해서 기름과 물처럼 분리된다',
              },
            ],
          },
        ],
      },
    },
    personalities: {
      INTJ: {
        state: '절전 정지 중',
        core: '아무도 모르는 계획 하나를 진행 중',
        kiwimuSays: '3초만 봐도 누가 계속 말할 가치가 있는지 안다. 그리고 조용해진다. Kiwimu는 그 선택 이해한다.',
      },
      INTP: {
        state: '생각 과열 중',
        core: '머리가 너무 빨라서 몸이 못 따라간다',
        kiwimuSays: '머릿속에서 아무도 초대받지 않은 토론이 열리고 있다. 끝나면 누가 이겼는지 말해줘. Kiwimu는 밖에서 기다릴게.',
      },
      INFJ: {
        state: '조용한 감지 중',
        core: '아무 말도 안 했는데 다 알고 있음',
        kiwimuSays: '이미 알고 있잖아, 라는 타입. 안 말했을 뿐. Kiwimu도 그건 알고 있다.',
      },
      INFP: {
        state: '천천히 녹는 중',
        core: '감정이 너무 차서 혼자만의 구석이 필요함',
        kiwimuSays: '다른 우주에서는 펄펄 끓는데, 밖에서는 그냥 조용히 앉아 있는 것처럼 보인다. Kiwimu도 좀 외롭다고 느낀다.',
      },
      ISTJ: {
        state: '안정 가동 중',
        core: '박수는 필요 없고, 방해만 없으면 됨',
        kiwimuSays: '이미 오래 해왔는데도 아무도 고맙다고 안 한다. Kiwimu는 보고 있다.',
      },
      ISTP: {
        state: '냉정 관찰 중',
        core: '듣는 척 안 해도 다 기억함',
        kiwimuSays: '안 듣는 게 아니다. 다 들었는데 그걸 굳이 티 내고 싶지 않을 뿐. Kiwimu도 모른 척한다.',
      },
      ISFJ: {
        state: '조용한 수호 중',
        core: '사랑은 말 안 해도, 늘 거기 있음',
        kiwimuSays: '남들 디테일은 다 기억하면서, 정작 너한테 “괜찮아?” 묻는 사람은 적다. Kiwimu가 지금 묻는다.',
      },
      ISFP: {
        state: '조용히 존재 중',
        core: '자리 차지는 안 하는데, 없으면 이상함',
        kiwimuSays: '겉으론 주장 없어 보여도 사실 다 있다. 다만 가치 없는 사람한테 설명하는 게 귀찮을 뿐. Kiwimu는 안다.',
      },
      ENTJ: {
        state: '풀스피드 실행 중',
        core: '멈추는 게 진짜 피곤함',
        kiwimuSays: '너무 빠르게 앞으로 가서 주변이 못 따라온다. 뒤돌아보면 혼자다. Kiwimu는 느리지만 계속 옆에 있다.',
      },
      ENTP: {
        state: '질문 던지는 중',
        core: '정답은 아직 없지만, 더 좋은 질문은 있음',
        kiwimuSays: '아무도 가고 싶지 않은 깊은 구덩이로 대화를 밀어 넣고, 본인도 뛰어든다. Kiwimu는 감탄도 하고 살짝 걱정도 한다.',
      },
      ENFJ: {
        state: '전채널 수신 중',
        core: '모두의 감정을 등에 지고 앞으로 감',
        kiwimuSays: '웃는 얼굴로 다들 감정까지 끌고 간다. Kiwimu가 묻고 싶다. 진짜 괜찮아?',
      },
      ENFP: {
        state: '사방으로 발산 중',
        core: '에너지는 꽉 찼고, 방향은 아직 미정',
        kiwimuSays: '동시에 6개를 하고 있고 전부 반쯤이지만, 그 반쪽들이 남들 전체보다 훨씬 재밌다. Kiwimu는 그게 꽤 좋다.',
      },
      ESTJ: {
        state: '정밀 교정 중',
        core: '모든 건 제자리에 있어야 함',
        kiwimuSays: '머릿속에 정답은 있는데 대부분 그걸 안 낸다. 말 안 해도 얼굴이 다 말한다. Kiwimu는 기대치를 조금 낮추길 권한다.',
      },
      ESTP: {
        state: '실시간 반응 중',
        core: '일단 움직이고, 나중에 생각',
        kiwimuSays: '매 순간의 너는 언제나 제일 좋다. 다음 순간은 그다음 얘기. Kiwimu는 따라가진 못해도 보는 건 좋아한다.',
      },
      ESFJ: {
        state: '계속 데워두는 중',
        core: '춥진 않은지, 배고프진 않은지 계속 봄',
        kiwimuSays: '괜찮다며 말하면서도, 다들 반응을 하나하나 다 기억한다. Kiwimu는 비밀로 할게.',
      },
      ESFP: {
        state: '지금을 불태우는 중',
        core: '내일은 내일이고, 오늘은 일단 즐겨야 함',
        kiwimuSays: '깊이를 싫어하는 게 아니다. 값어치 없는 데서 깊어지고 싶지 않을 뿐. Kiwimu는 그게 본능이라고 본다.',
      },
    },
  },
};
