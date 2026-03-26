// V1.5 /explore 題庫 — A/B 兩套各 5 題
// 來源：Obsidian 企劃_前導測驗10題.md + MBTI-Lab-V1.5-TEST/src/data.ts
// ⚠️ 不是 V1 的 i18n/questionsTranslations.ts（那是 40 題）

export interface ExploreOption {
  text: string;
  value: string; // E | I | S | N | T | F | J | P | A | T(turbulent)
  visual: string; // Kiwimu 角色反應文字
}

export interface ExploreQuestion {
  id: string;
  dimension: string; // 'E/I' | 'S/N' | 'T/F' | 'J/P' | 'A/T'
  text: string;
  options: [ExploreOption, ExploreOption];
}

export interface ExploreQuiz {
  id: 'A' | 'B';
  title: string;
  description: string;
  questions: ExploreQuestion[];
}

export interface ExplorePersonality {
  id: string;
  name: string;  // 甜點名稱
  core: string;  // 一句核心描述
  kiwimuSays: string; // Kiwimu 對你說的話
}

// ── Quiz A：數位焦慮生存原型（投放 Threads）──────────────────────

export const quizA: ExploreQuiz = {
  id: 'A',
  title: '數位焦慮生存原型',
  description: '5 題測出你的 2026 數位生存原型，你是哪種社交動物？',
  questions: [
    {
      id: 'q1',
      dimension: 'E/I',
      text: '週五深夜，你其實已經累到靈魂出竅，但你躺在床上的「數位反射動作」是？',
      options: [
        { text: '在 IG、Threads、LINE 之間瘋狂切換，看看大家在幹嘛、吃什麼瓜，確認自己還連接著世界。', value: 'E', visual: 'Kiwimu 膨脹成一大坨，試圖沾染每一個社群平台' },
        { text: '切換到沒人認識的小帳 (Finsta)，在黑暗中毫無目的地狂刷廢片。我現在不想跟任何「活人」交集。', value: 'I', visual: 'Kiwimu 縮成一小滴，躲進沒有人找得到的角落' }
      ]
    },
    {
      id: 'q2',
      dimension: 'S/N',
      text: '在社群看到一篇萬人轉發、吵得不可開交的爭議貼文，你的大腦第一反應是？',
      options: [
        { text: '立刻滑留言區找「懶人包」。我需要搞清楚時間線、誰對誰錯、證據在哪。', value: 'S', visual: 'Kiwimu 變成一把精準的抹刀，把資訊刮得平平整整' },
        { text: '跳脫事件本身，開始思考這反映了什麼「社會底層現象」，或腦中自動衍生成荒謬梗圖。', value: 'N', visual: 'Kiwimu 飄到半空中，變成一朵形狀怪異的鮮奶油雲' }
      ]
    },
    {
      id: 'q3',
      dimension: 'T/F',
      text: '朋友在群組崩潰大哭：「我又被炎上了 / 被主管羞辱了！」你的鍵盤會先打出什麼？',
      options: [
        { text: '「先截圖留底！我們來盤點這件事的邏輯漏洞，準備反擊。」先解決問題。', value: 'T', visual: 'Kiwimu 瞬間冷凍，變成一塊理性的鮮奶油冰磚' },
        { text: '「天啊抱抱你！這真的太委屈了，他們有病吧！」先接住情緒。', value: 'F', visual: 'Kiwimu 融化成一灘溫柔的甜水，把對方包圍起來' }
      ]
    },
    {
      id: 'q4',
      dimension: 'J/P',
      text: '看看你手機瀏覽器的「分頁」跟「未讀通知」，最符合你的狀態是？',
      options: [
        { text: '定期清理！看到未讀小紅點會極度焦慮，清空才有一種「人生還在掌控中」的錯覺。', value: 'J', visual: 'Kiwimu 把自己擠成完美的星型擠花，不容許一絲歪斜' },
        { text: '分頁永遠 99+。雖然不記得裡面有什麼，但我相信「哪天一定會用到它」。', value: 'P', visual: 'Kiwimu 隨意地趴在桌上，變成一坨毫無形狀的快樂軟泥' }
      ]
    },
    {
      id: 'q5',
      dimension: 'A/T',
      text: '如果你發了一則自認超好笑的限動，結果半小時過去，完全沒人理你？',
      options: [
        { text: '「這屆網友真不懂幽默。」或者「演算法壞了吧。」滑掉手機，毫不在意去吃宵夜。', value: 'A', visual: 'Kiwimu 依然是一坨完美的鮮奶油，毫不在意地抖動了一下' },
        { text: '「是不是不好笑？我得罪人了嗎？」內心小劇場爆發，最後默默刪掉。', value: 'T', visual: 'Kiwimu 開始瘋狂冒汗，邊緣漸漸融化塌陷' }
      ]
    }
  ]
};

// ── Quiz B：潛水躺平生存原型（投放 IG）───────────────────────────

export const quizB: ExploreQuiz = {
  id: 'B',
  title: '潛水躺平生存原型',
  description: '如果人生是一場生存遊戲，這 5 個抉擇將決定你靈魂深處的隱藏天賦。',
  questions: [
    {
      id: 'q1',
      dimension: 'E/I',
      text: '半熟不熟的同事突然提議：「週末大家要不要一起去喝咖啡放鬆？」你的內心 OS 是？',
      options: [
        { text: '好啊！反正週末沒事，去聽聽八卦打發時間也不錯，有人約就走。', value: 'E', visual: 'Kiwimu 開心地跳到別人的咖啡上，準備融合' },
        { text: '放鬆？跟你們出去就是加班！大腦瞬間高速運轉，搜尋一百種「禮貌拒絕」的藉口。', value: 'I', visual: 'Kiwimu 瞬間結成硬殼，拒絕任何外來物沾上自己' }
      ]
    },
    {
      id: 'q2',
      dimension: 'S/N',
      text: '家裡水龍頭壞了或軟體閃退，上網查教學時，你會點開什麼？',
      options: [
        { text: '找「30 秒短影音」或圖文步驟。別講原理，告訴我第一步轉哪、第二步按哪就好。', value: 'S', visual: 'Kiwimu 變成一本實用的說明書，只顯示下一步' },
        { text: '查著查著，突然對這東西的「運作原理」或歷史產生興趣，最後看了一堆維基百科。', value: 'N', visual: 'Kiwimu 戴上偵探帽，鑽進水管深處探險' }
      ]
    },
    {
      id: 'q3',
      dimension: 'T/F',
      text: '看劇時，發現主角因為「太重感情」而做出極度愚蠢的決定，你的反應是？',
      options: [
        { text: '翻白眼。「這邏輯根本不通！把話說清楚不就好了，浪費大家時間！」', value: 'T', visual: 'Kiwimu 舉起一塊寫著「邏輯錯誤」的冷酷小牌子' },
        { text: '雖然覺得笨，但心裡酸酸的。「唉，我懂他為什麼這樣選，因為太害怕失去了……」', value: 'F', visual: 'Kiwimu 跟著主角一起流下白色的鮮奶油眼淚' }
      ]
    },
    {
      id: 'q4',
      dimension: 'J/P',
      text: '本來計畫週末要「徹底躺平」，朋友突然傳訊：「我剛好在你家附近，半小時後去找你！」',
      options: [
        { text: '崩潰！我的「什麼都不做」是排定好的行程！突發變動讓我必須重新整頓心情，超煩！', value: 'J', visual: 'Kiwimu 的行事曆被打破，氣到表面開始冒泡' },
        { text: '喔，好啊。反正我也只是一坨會呼吸的肉，你就來吧，大不了我們一起躺在沙發滑手機。', value: 'P', visual: 'Kiwimu 攤成一張地毯：「來吧，踩過我也沒關係」' }
      ]
    },
    {
      id: 'q5',
      dimension: 'A/T',
      text: '你不小心把一張有點尷尬的梗圖，傳到了「有主管在的工作群組」。',
      options: [
        { text: '秒收回，打個「哈哈傳錯抱歉」。只要我不尷尬，尷尬的就是別人，三分鐘後忘記。', value: 'A', visual: 'Kiwimu 優雅地滑過螢幕，假裝什麼都沒發生' },
        { text: '雖然秒收回了，但接下來兩小時瘋狂內耗：「主管有看到嗎？我的考績是不是毀了？」', value: 'T', visual: 'Kiwimu 緊張到把自己攪拌過度，變成油水分離' }
      ]
    }
  ]
};

// ── 16 型甜點人格（引用 constants.ts 不改，這裡是 V1.5 的簡化版）──

export const explorePersonalities: Record<string, ExplorePersonality> = {
  INFP: { id: 'INFP', name: '熔岩巧克力', core: '內心永遠在沸騰', kiwimuSays: '你把最柔軟的甜都藏在深處，別人嫌燙，但懂的人知道那是最真實的溫度。' },
  ENFP: { id: 'ENFP', name: '跳跳糖氣泡水', core: '隨機爆發的快樂', kiwimuSays: '你總是不按牌理出牌，劈啪作響地炸開，就算氣消了，也曾經甜得讓人忘記煩惱。' },
  INFJ: { id: 'INFJ', name: '伯爵茶千層', core: '藏著無數層的心事', kiwimuSays: '你總是把情緒疊得整整齊齊，切開來才發現有多費工。偶爾塌下來也沒關係，我會接住你。' },
  ENFJ: { id: 'ENFJ', name: '焦糖布丁', core: '溫柔地撐起所有人', kiwimuSays: '你習慣用甜美的焦糖包裹自己，讓大家嚐到甜頭。但別忘了，布丁本身也是需要被輕輕捧著的。' },
  INTP: { id: 'INTP', name: '薄荷巧克力', core: '挑人的絕對理性', kiwimuSays: '愛你的人很愛，不懂的人覺得你在說外星語。保持你的清涼，不需要迎合所有人的胃口。' },
  ENTP: { id: 'ENTP', name: '檸檬塔', core: '酸得精準，甜得意外', kiwimuSays: '你總愛用酸溜溜的邏輯戳人，但底層的塔皮其實很扎實。偶爾酸過頭，記得加點我來中和。' },
  INTJ: { id: 'INTJ', name: '濃縮咖啡凍', core: '苦澀但極度清醒', kiwimuSays: '你把世界看得很透徹，凝結成一塊不妥協的果凍。太苦的時候，讓我這坨鮮奶油來陪你吧。' },
  ENTJ: { id: 'ENTJ', name: '黑巧克力磚', core: '效率至上的硬派', kiwimuSays: '你總是俐落地切斷猶豫，純度極高。偶爾融化一下，不會損害你的高級感。' },
  ISFP: { id: 'ISFP', name: '草莓大福', core: '柔軟包裹著酸甜', kiwimuSays: '你看起來軟綿綿的，但心裡包著一顆很有主見的草莓。不用急著向世界證明什麼，這樣就很好。' },
  ESFP: { id: 'ESFP', name: '水果聖代', core: '活在當下的華麗', kiwimuSays: '你總是把最鮮豔的自己擺在最上面，享受每一刻的融化。不用管明天，今天開心最重要。' },
  ISFJ: { id: 'ISFJ', name: '原味海綿蛋糕', core: '永遠安靜的陪伴', kiwimuSays: '你總是不搶戲，卻是所有人最安心的基底。偶爾也讓自己當一次主角，加上鮮奶油吧。' },
  ESFJ: { id: 'ESFJ', name: '綜合馬卡龍', core: '照顧每個人的口味', kiwimuSays: '你總是努力讓每個顏色都完美，怕誰不開心。但有時候，碎掉的馬卡龍反而更好吃。' },
  ISTP: { id: 'ISTP', name: '冰滴咖啡', core: '緩慢過濾的冷靜', kiwimuSays: '你總是冷冷地看著一切，一滴一滴萃取你要的答案。不用急著沸騰，你的節奏很完美。' },
  ESTP: { id: 'ESTP', name: '烈酒巧克力', core: '刺激的現實主義', kiwimuSays: '你喜歡直接來點猛的，咬下去才知道裡面藏了什麼。生活就是一場微醺，乾杯吧。' },
  ISTJ: { id: 'ISTJ', name: '傳統磅蛋糕', core: '扎實可靠的規律', kiwimuSays: '你總是按部就班，沒有華麗的裝飾，但永遠不會讓人失望。偶爾烤焦一點，也是一種新口味。' },
  ESTJ: { id: 'ESTJ', name: '經典可頌', core: '層次分明的秩序', kiwimuSays: '你喜歡一切都有條不紊，酥脆且精準。但掉點麵包屑在地上，世界也不會毀滅的。' }
};

// ── 計算結果 ──────────────────────────────────────────────────────

export function calculateExploreResult(answers: Record<string, string>): {
  mbtiType: string;
  suffix: 'A' | 'T';
} {
  const dims: Array<[string, string]> = [
    ['E', 'I'],
    ['S', 'N'],
    ['T', 'F'],
    ['J', 'P'],
  ];

  const qOrder = ['q1', 'q2', 'q3', 'q4', 'q5'];
  const mbtiType = dims.map(([a, b], i) => {
    const ans = answers[qOrder[i]];
    return ans === a ? a : b;
  }).join('');

  const suffix = answers['q5'] === 'A' ? 'A' : 'T';
  return { mbtiType, suffix };
}
