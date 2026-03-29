// V1.5 /explore 題庫 — A/B 兩套各 5 題
// 來源：Obsidian 企劃_前導測驗10題.md
// ⚠️ 不是 V1 的 i18n/questionsTranslations.ts（那是 40 題）

export interface ExploreOption {
  text: string;
  value: string; // E | I | S | N | T | F | J | P | A | T(turbulent)
  visual: string; // Kiwimu 反應文字
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
  state: string;       // Kiwimu 今日狀態標籤
  stateGroup: 1 | 2 | 3 | 4 | 5 | 6; // 狀態圖分組（6 種 Kiwimu 狀態圖）
  core: string;        // 核心一句話
  kiwimuSays: string;  // Kiwimu 角色台詞
  imageUrl?: string;   // 各狀態 Kiwimu 圖（主理人提供後填入）
}

// stateGroup 對應：
// 1 — 內縮靜止 (INTJ, ISTJ)
// 2 — 冷眼觀察 (ISTP, INTP)
// 3 — 輕輕融化 (INFP, ISFP, ISFJ)
// 4 — 靜默感應 (INFJ, ENFJ)
// 5 — 四散發光 (ENFP, ESFP, ENTP)
// 6 — 全速前進 (ENTJ, ESTJ, ESTP, ESFJ)

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
        { text: '跳脫事件本身，開始思考這反映了什麼「社會底層現象」，或腦中自動衍生成荒謬梗圖。', value: 'N', visual: 'Kiwimu 飄到半空中，變成一朵形狀怪異的雲' }
      ]
    },
    {
      id: 'q3',
      dimension: 'T/F',
      text: '朋友在群組崩潰大哭：「我又被炎上了 / 被主管羞辱了！」你的鍵盤會先打出什麼？',
      options: [
        { text: '「先截圖留底！我們來盤點這件事的邏輯漏洞，準備反擊。」先解決問題。', value: 'T', visual: 'Kiwimu 瞬間冷凍，變成一塊理性的冰磚' },
        { text: '「天啊抱抱你！這真的太委屈了，他們有病吧！」先接住情緒。', value: 'F', visual: 'Kiwimu 融化成一灘溫柔，把對方包圍起來' }
      ]
    },
    {
      id: 'q4',
      dimension: 'J/P',
      text: '看看你手機瀏覽器的「分頁」跟「未讀通知」，最符合你的狀態是？',
      options: [
        { text: '定期清理！看到未讀小紅點會極度焦慮，清空才有一種「人生還在掌控中」的錯覺。', value: 'J', visual: 'Kiwimu 把自己擠成完美的形狀，不容許一絲歪斜' },
        { text: '分頁永遠 99+。雖然不記得裡面有什麼，但我相信「哪天一定會用到它」。', value: 'P', visual: 'Kiwimu 隨意地趴在桌上，變成一坨毫無形狀的快樂軟泥' }
      ]
    },
    {
      id: 'q5',
      dimension: 'A/T',
      text: '如果你發了一則自認超好笑的限動，結果半小時過去，完全沒人理你？',
      options: [
        { text: '「這屆網友真不懂幽默。」或者「演算法壞了吧。」滑掉手機，毫不在意去吃宵夜。', value: 'A', visual: 'Kiwimu 依然完好，毫不在意地抖動了一下' },
        { text: '「是不是不好笑？我得罪人了嗎？」內心小劇場爆發，最後默默刪掉。', value: 'T', visual: 'Kiwimu 開始冒汗，邊緣漸漸融化塌陷' }
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
        { text: '好啊！反正週末沒事，去聽聽八卦打發時間也不錯，有人約就走。', value: 'E', visual: 'Kiwimu 開心地跳出去，準備融入任何場合' },
        { text: '放鬆？跟你們出去就是加班！大腦瞬間高速運轉，搜尋一百種「禮貌拒絕」的藉口。', value: 'I', visual: 'Kiwimu 瞬間結成硬殼，拒絕任何外來物靠近' }
      ]
    },
    {
      id: 'q2',
      dimension: 'S/N',
      text: '家裡水龍頭壞了或軟體閃退，上網查教學時，你會點開什麼？',
      options: [
        { text: '找「30 秒短影音」或圖文步驟。別講原理，告訴我第一步轉哪、第二步按哪就好。', value: 'S', visual: 'Kiwimu 變成一本精準的說明書，只顯示下一步' },
        { text: '查著查著，突然對這東西的「運作原理」或歷史產生興趣，最後看了一堆維基百科。', value: 'N', visual: 'Kiwimu 戴上偵探帽，鑽進問題深處探險' }
      ]
    },
    {
      id: 'q3',
      dimension: 'T/F',
      text: '看劇時，發現主角因為「太重感情」而做出極度愚蠢的決定，你的反應是？',
      options: [
        { text: '翻白眼。「這邏輯根本不通！把話說清楚不就好了，浪費大家時間！」', value: 'T', visual: 'Kiwimu 舉起一塊冷靜的小牌子：「邏輯錯誤」' },
        { text: '雖然覺得笨，但心裡酸酸的。「唉，我懂他為什麼這樣選，因為太害怕失去了……」', value: 'F', visual: 'Kiwimu 跟著主角一起默默流淚' }
      ]
    },
    {
      id: 'q4',
      dimension: 'J/P',
      text: '本來計畫週末要「徹底躺平」，朋友突然傳訊：「我剛好在你家附近，半小時後去找你！」',
      options: [
        { text: '崩潰！我的「什麼都不做」是排定好的行程！突發變動讓我必須重新整頓心情，超煩！', value: 'J', visual: 'Kiwimu 的行程被打破，氣到表面開始冒泡' },
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

// ── 16 型 Kiwimu 今日狀態 ─────────────────────────────────────────

const IMG = {
  1: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1774758443/Carton_Home_ww4nmq.webp',
  2: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1774758442/Hidden_in_Foam_mwzmej.webp',
  3: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1774758441/Melting_Cream_bvabdv.webp',
  4: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1774758439/Floating_on_Cocoa_akhrjp.webp',
  5: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1774758439/Fluffy_Laugh_t30avu.webp',
  6: 'https://res.cloudinary.com/dvizdsv4m/image/upload/v1774758439/Running_Dollop_tpb0xl.webp',
} as const;

export const explorePersonalities: Record<string, ExplorePersonality> = {
  INTJ: { id: 'INTJ', state: '低電量靜止中', stateGroup: 1, core: '在規劃一個沒人知道的計畫', kiwimuSays: '你看了所有人三秒，就知道誰值得繼續說下去。然後你選擇安靜。Kiwimu 不怪你。', imageUrl: IMG[1] },
  INTP: { id: 'INTP', state: '超頻思考中',   stateGroup: 2, core: '大腦跑太快，身體跟不上',   kiwimuSays: '你腦子裡正在進行一場沒有人被邀請的辯論。結束了再跟我說誰贏。Kiwimu 在外面等。', imageUrl: IMG[2] },
  INFJ: { id: 'INFJ', state: '靜默感應中',   stateGroup: 4, core: '什麼都沒說，什麼都知道',   kiwimuSays: '你早就知道了，只是沒說。Kiwimu 也知道你知道。', imageUrl: IMG[4] },
  INFP: { id: 'INFP', state: '緩慢融化中',   stateGroup: 3, core: '情緒太滿，需要一個角落',   kiwimuSays: '你在另一個宇宙裡沸騰，但別人看到的只有你安靜坐在那裡。Kiwimu 也覺得這樣很孤單。', imageUrl: IMG[3] },
  ISTJ: { id: 'ISTJ', state: '穩定運作中',   stateGroup: 1, core: '不需要掌聲，只要不被打斷', kiwimuSays: '你已經把這件事做了很久，沒有人說謝謝。Kiwimu 知道。', imageUrl: IMG[1] },
  ISTP: { id: 'ISTP', state: '冷靜觀察中',   stateGroup: 2, core: '沒在聽，但什麼都記住了',   kiwimuSays: '你沒在聽，你只是不想讓別人知道你都聽進去了。Kiwimu 也假裝沒注意到。', imageUrl: IMG[2] },
  ISFJ: { id: 'ISFJ', state: '默默守護中',   stateGroup: 3, core: '不說愛，但一直在',         kiwimuSays: '你記得每個人的細節，但沒有人記得問你過得怎樣。Kiwimu 現在問你。', imageUrl: IMG[3] },
  ISFP: { id: 'ISFP', state: '輕輕存在中',   stateGroup: 3, core: '不佔位，但少了就不對',     kiwimuSays: '你沒什麼主張，但你其實什麼都有主張。只是懶得跟不值得的人解釋。Kiwimu 懂。', imageUrl: IMG[3] },
  ENTJ: { id: 'ENTJ', state: '全速執行中',   stateGroup: 6, core: '停下來才是真的累',         kiwimuSays: '你往前衝的速度讓大家跟不上，然後你回頭看，發現只剩你自己。Kiwimu 跑得比較慢，但一直在。', imageUrl: IMG[6] },
  ENTP: { id: 'ENTP', state: '拋出問題中',   stateGroup: 5, core: '沒有答案，但有更好的問題', kiwimuSays: '你把對話帶進了沒人想去的深坑，然後自己跳進去。Kiwimu 佩服你，也有點替你捏把冷汗。', imageUrl: IMG[5] },
  ENFJ: { id: 'ENFJ', state: '全頻接收中',   stateGroup: 4, core: '扛著所有人的情緒往前走',   kiwimuSays: '你扛著所有人的情緒往前走，臉上還掛著笑。Kiwimu 想知道，你真的還好嗎？', imageUrl: IMG[4] },
  ENFP: { id: 'ENFP', state: '四散發光中',   stateGroup: 5, core: '能量滿載，方向待定',       kiwimuSays: '你同時在做六件事，都做到一半。但每一半都比別人的全部更有意思。Kiwimu 覺得這樣其實還行。', imageUrl: IMG[5] },
  ESTJ: { id: 'ESTJ', state: '精準校準中',   stateGroup: 6, core: '一切都要在對的位置',       kiwimuSays: '你心裡有一個標準答案，大部分人交出來的都不對。你沒說，但你的臉說了。Kiwimu 建議你偶爾降低一點期待。', imageUrl: IMG[6] },
  ESTP: { id: 'ESTP', state: '即時反應中',   stateGroup: 6, core: '先行動，再想清楚',         kiwimuSays: '你在每個當下都是最好的那個人。下一個當下再說。Kiwimu 跟不上你，但很享受看著你。', imageUrl: IMG[6] },
  ESFJ: { id: 'ESFJ', state: '持續供暖中',   stateGroup: 6, core: '怕你冷，也怕你餓',         kiwimuSays: '你嘴上說不在意，但你把每個人的反應都記得一清二楚。Kiwimu 不會說出去。', imageUrl: IMG[6] },
  ESFP: { id: 'ESFP', state: '燃燒當下中',   stateGroup: 5, core: '過了今天再說，今天先開心', kiwimuSays: '你不是不想深，你只是不願意在不值得的地方深。Kiwimu 覺得這是一種本能。', imageUrl: IMG[5] },
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
