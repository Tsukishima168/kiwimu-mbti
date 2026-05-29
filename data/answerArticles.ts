export type AnswerArticleSection = {
  title: string;
  body?: string;
  bullets?: string[];
};

export type AnswerArticleFaq = {
  question: string;
  answer: string;
};

export type AnswerArticleLink = {
  title: string;
  href: string;
  summary: string;
};

export type AnswerArticle = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  keywords: string;
  updatedAt: string;
  summary: string;
  takeaways: string[];
  sections: AnswerArticleSection[];
  faqs: AnswerArticleFaq[];
  related: AnswerArticleLink[];
};

const sharedRelated: AnswerArticleLink[] = [
  {
    title: 'MBTI 答案中心',
    href: '/answers',
    summary: '回到 Kiwimu 的公開答案樞紐。',
  },
  {
    title: '開始 V1 完整測驗',
    href: '/quiz',
    summary: '用完整測驗取得你的 Kiwimu 類型與靈魂甜點。',
  },
  {
    title: '進入 V2 深度路徑',
    href: '/read/quiz',
    summary: '從更完整的題組進入 V2 深度報告。',
  },
];

export const answerArticles: AnswerArticle[] = [
  {
    slug: 'mbti',
    title: 'MBTI 是什麼？16 型人格、偏好模型與 Kiwimu 的使用邊界',
    eyebrow: 'MBTI BASICS',
    description:
      'MBTI 是用來描述人格偏好的 16 型模型，不是能力測驗。Kiwimu 把它作為自我理解、甜點映射與深度報告的入口。',
    keywords: 'MBTI 是什麼,16型人格,人格測驗,Kiwimu,靈魂甜點',
    updatedAt: '2026-05-29',
    summary:
      'MBTI 是一套描述人格偏好的 16 型模型，重點在於你傾向如何取得資訊、做決定、恢復能量與安排生活。它不應被當成能力排名、職涯保證或心理診斷。Kiwimu 使用 MBTI 作為自我理解的語言，再把結果延伸成角色、靈魂甜點、V1.5 狀態探索與 V2 深度報告。',
    takeaways: [
      'MBTI 的核心是 16 型偏好，不是能力高低。',
      'Kiwimu 把 MBTI 當作敘事入口，不把它當成診斷工具。',
      '做完 V1 後，使用者可以往 V1.5、V2、Passport、Shop、Gacha、Map 延伸。',
    ],
    sections: [
      {
        title: 'MBTI 主要在描述什麼',
        body:
          'MBTI 以四組偏好描述人如何面對世界：能量方向、資訊接收、決策方式與生活節奏。這些偏好組合成 16 型，幫助人用較清楚的語言理解自己的行為傾向。',
      },
      {
        title: '常見誤解',
        bullets: [
          'MBTI 不是智商、能力或成敗預測。',
          'MBTI 不應用來替人貼死標籤。',
          '測驗結果可以作為自我觀察起點，但不等於完整人格。',
        ],
      },
      {
        title: 'Kiwimu 怎麼使用 MBTI',
        body:
          'Kiwimu 先用 V1 完整測驗建立一個可理解的身份，再用靈魂甜點把抽象人格變成可分享、可收藏、可體驗的生活語言。V1.5 捕捉當下狀態，V2 則承接更深的 A/T 變體、關係、職場與成長解讀。',
      },
    ],
    faqs: [
      {
        question: 'MBTI 可以拿來判斷一個人適不適合某份工作嗎？',
        answer:
          '不建議。MBTI 更適合描述偏好與溝通方式，不應作為錄取、能力判斷或職涯命運的唯一依據。',
      },
      {
        question: 'Kiwimu 的測驗和一般 MBTI 測驗有什麼不同？',
        answer:
          'Kiwimu 除了給出類型，也把結果轉成角色語言、靈魂甜點、分享卡與後續的 V1.5 / V2 體驗。',
      },
      {
        question: '做完 MBTI 後下一步是什麼？',
        answer:
          '第一次來建議先完成 V1；想看當下狀態可進 V1.5；想看更深的個人報告可進 V2；想保存身份則進 Passport。',
      },
    ],
    related: [
      { title: 'A/T 是什麼', href: '/answers/at-variants', summary: '理解 Kiwimu 32 變體的內容分層。' },
      { title: '靈魂甜點是什麼', href: '/answers/soul-dessert', summary: '理解人格如何轉成甜點語言。' },
      ...sharedRelated,
    ],
  },
  {
    slug: 'at-variants',
    title: 'A/T 是什麼？Kiwimu 為什麼會有 32 種人格結果',
    eyebrow: 'A/T VARIANTS',
    description:
      'A/T 不是官方 MBTI 第五維，而是 Kiwimu 用來區分壓力反應、自我敘事與內容語氣的 editorial layer。',
    keywords: 'A/T 是什麼,MBTI A T,32變體,Kiwimu V2',
    updatedAt: '2026-05-29',
    summary:
      'A/T 不是官方 MBTI 的第五個維度。Kiwimu 把 A/T 視為內容分層，用來描述一個人在壓力、自我懷疑、穩定感與行動節奏上的敘事差異。因此 Kiwimu 的 32 種結果是 16 型 × A/T 的內容版本，不是新的官方人格系統。',
    takeaways: [
      '先看 16 型，再看 A/T。',
      'A/T 是語氣與狀態分層，不是能力排名。',
      'V2 會用 A/T 展開更具體的關係、職場與成長建議。',
    ],
    sections: [
      {
        title: 'A 和 T 的差異',
        body:
          'A 通常偏向較穩定的自我感，T 則更容易出現自我監測、壓力敏感與修正慾望。這不是好壞差異，而是敘事重點不同。',
      },
      {
        title: '為什麼 Kiwimu 使用 32 變體',
        body:
          '同樣是 INFP，A 與 T 在壓力語氣、關係提醒與行動建議上會需要不同寫法。32 變體讓報告更細，不必讓所有同型的人都看到一樣的空話。',
      },
      {
        title: '哪些內容會被 A/T 影響',
        bullets: [
          '壓力反應與自我懷疑的描述。',
          '關係與職場建議的提醒密度。',
          'V2 報告中的狀態標籤、原型與帶走的字。',
        ],
      },
    ],
    faqs: [
      {
        question: 'A/T 是官方 MBTI 嗎？',
        answer: '不是。Kiwimu 會明確把 A/T 當成內容分層，而不是官方 MBTI 第五維。',
      },
      {
        question: 'A 比 T 更好嗎？',
        answer: '不是。A 和 T 描述的是自我敘事與壓力節奏，不是價值高低。',
      },
      {
        question: '我應該先看 16 型還是 A/T？',
        answer: '先看 16 型，理解人格骨架；再看 A/T，理解壓力與語氣差異。',
      },
    ],
    related: [
      { title: 'MBTI 是什麼', href: '/answers/mbti', summary: '先理解 16 型人格偏好。' },
      { title: 'V2 深度路徑', href: '/read/quiz', summary: '用 V2 題組進入 A/T 變體報告。' },
      ...sharedRelated,
    ],
  },
  {
    slug: 'soul-dessert',
    title: '靈魂甜點是什麼？Kiwimu 如何把人格變成可以品嘗的語言',
    eyebrow: 'SOUL DESSERT',
    description:
      '靈魂甜點是 Kiwimu 的人格敘事層，把 MBTI 類型轉成真實甜點、角色與生活體驗。',
    keywords: '靈魂甜點,Kiwimu,月島甜點,MBTI 甜點,人格甜點',
    updatedAt: '2026-05-29',
    summary:
      '靈魂甜點不是心理診斷，而是 Kiwimu 的品牌敘事方式。它把抽象的人格偏好轉成具體風味：濃郁、清爽、層次、苦甜、柔軟或穩定。使用者做完 V1 後，會得到對應的甜點語言，再延伸到訂購、地圖、分享與 Passport 收藏。',
    takeaways: [
      '靈魂甜點是人格的生活化翻譯。',
      '甜點映射來自 Kiwimu / Moon Island Dessert 的 editorial layer。',
      '它的任務是讓結果更容易記住、分享與體驗。',
    ],
    sections: [
      {
        title: '為什麼用甜點承接人格',
        body:
          '人格描述容易抽象，甜點能把抽象特質變成味覺與情境。INTJ 的濃度、INFP 的柔軟、ENTP 的刺激感，都能用風味語言讓使用者更容易記住。',
      },
      {
        title: '靈魂甜點不是什麼',
        bullets: [
          '不是醫療、心理或營養診斷。',
          '不是說某類型只能吃某一種甜點。',
          '不是官方 MBTI 理論，而是 Kiwimu 的品牌敘事。',
        ],
      },
      {
        title: '靈魂甜點會導向哪裡',
        body:
          'V1 結果頁會把靈魂甜點導向 Map 菜單、Shop 商品、Gacha 分享、Passport 收藏與 V2 深度報告，讓一次測驗變成可回訪的體驗。',
      },
    ],
    faqs: [
      {
        question: '靈魂甜點是真實商品嗎？',
        answer:
          'Kiwimu 的甜點映射會連到 Moon Island Dessert / 月島甜點的實際品項或品牌體驗，不只是抽象比喻。',
      },
      {
        question: '我的靈魂甜點會改變嗎？',
        answer:
          'V1 的核心類型較穩定，V1.5 的狀態卡較像當下節奏；因此固定身份與當下狀態可以同時存在。',
      },
      {
        question: '我可以用靈魂甜點送禮嗎？',
        answer:
          '可以。送禮時建議同時考慮對方口味、保存方式與場合，不要只看人格對應。',
      },
    ],
    related: [
      { title: '送禮甜點怎麼選', href: '/answers/gift-guide', summary: '把人格推薦轉成實際送禮決策。' },
      { title: '提拉米蘇怎麼選', href: '/answers/tiramisu-guide', summary: '從口感、酒香與保存挑選提拉米蘇。' },
      ...sharedRelated,
    ],
  },
  {
    slug: 'tiramisu-guide',
    title: '提拉米蘇怎麼選？口感、酒香、苦甜、保存與送禮指南',
    eyebrow: 'DESSERT GUIDE',
    description:
      '提拉米蘇選擇指南：從口感、酒香、用途、保存與送禮情境，挑出適合自己的經典或變奏款。',
    keywords: '提拉米蘇怎麼選,提拉米蘇保存,送禮甜點,月島甜點,Kiwimu',
    updatedAt: '2026-05-29',
    summary:
      '提拉米蘇怎麼選？先看三件事：口感偏好、能不能接受酒、用途。喜歡濃郁奶香與咖啡苦甜、不排斥微醺的，選經典或奶酒款；怕酒可選抹茶、柚子等變奏。送禮要考慮好切、好保存、體面，並事先確認冷藏與賞味期限。',
    takeaways: [
      '喜歡經典苦甜可選經典或奶酒款。',
      '怕酒或想清爽可看抹茶、柚子、果香變奏。',
      '送禮前先確認盒裝、冷藏、賞味期限與預訂時間。',
    ],
    sections: [
      {
        title: '用 3 步驟快速選',
        bullets: [
          '看口感與風味：咖啡可可、茶感、果香或酒香。',
          '看用途：馬上吃、多人分享、正式送禮或聚會。',
          '看保存與預訂：冷藏、賞味期限、節慶檔期與取貨方式。',
        ],
      },
      {
        title: '常見錯誤',
        bullets: [
          '以為所有提拉米蘇都一樣，忽略不同店家的配方差異。',
          '忽略冷藏與賞味期限。',
          '送禮只顧外型，沒有確認是否好切、好分、好保存。',
        ],
      },
    ],
    faqs: [
      {
        question: '提拉米蘇會很甜嗎？',
        answer:
          '多數款式是苦甜平衡，咖啡與可可會壓過單純的甜。怕甜可選茶感或果香變奏。',
      },
      {
        question: '有酒精嗎？小孩可以吃嗎？',
        answer:
          '經典款常有微量咖啡酒，奶酒款酒感更明顯；若要給小孩或不喝酒者，請選無酒款或事先詢問。',
      },
      {
        question: '可以放幾天？',
        answer:
          '通常需冷藏，當天食用最佳。隔日或冷凍保存請依店家標示，不要自行延長賞味時間。',
      },
    ],
    related: [
      { title: '靈魂甜點是什麼', href: '/answers/soul-dessert', summary: '理解人格與甜點的品牌映射。' },
      { title: '送禮甜點怎麼選', href: '/answers/gift-guide', summary: '從對象、場合與保存條件挑禮物。' },
      ...sharedRelated,
    ],
  },
  {
    slug: 'gift-guide',
    title: '送禮甜點怎麼選？體面、好切、保存與預訂指南',
    eyebrow: 'GIFT GUIDE',
    description:
      '送禮甜點挑選指南：從體面、好切好分、保存賞味、預訂與對象場合，選出更不容易出錯的甜點。',
    keywords: '送禮甜點怎麼選,甜點禮盒,月島甜點,聚會甜點,伴手禮',
    updatedAt: '2026-05-29',
    summary:
      '送禮甜點怎麼選？抓四件事：體面、好切好分、保存與賞味、預訂。長輩或正式場合偏穩重、少生鮮；同輩或聚會可活潑、多人分；情人或閨蜜可選精緻一人份。務必確認取貨方式、保存方式與賞味期限，並告知收禮者。',
    takeaways: [
      '正式場合優先選穩定、好保存、有盒裝的甜點。',
      '多人聚會要考慮好切、好分、份量與餐具。',
      '節慶與熱門品項要提前預訂。',
    ],
    sections: [
      {
        title: '三步驟挑選',
        bullets: [
          '看對象與場合：正式、輕鬆、多人、獨享。',
          '看品項：戚風輕盈、千層好分、巴斯克濃郁、烤布丁療癒。',
          '看預訂與保存：冷藏、賞味、宅配與到店取貨都要先問清楚。',
        ],
      },
      {
        title: '最容易出錯的地方',
        bullets: [
          '只看外型，忽略好不好切。',
          '節慶當天才買，熱門款已售完。',
          '沒有告知保存方式，收禮者不知道何時吃最好。',
        ],
      },
    ],
    faqs: [
      {
        question: '送禮甜點怎麼選比較體面？',
        answer:
          '選盒裝完整、外型穩定、保存規則清楚的款式。正式場合不要選太容易融化或難分食的甜點。',
      },
      {
        question: '多人聚會適合哪種甜點？',
        answer:
          '千層、戚風、切塊巴斯克通常比易塌的整顆慕斯更好分食，實際仍以店家品項為準。',
      },
      {
        question: '需要提前預訂嗎？',
        answer:
          '建議至少提前 1-3 天；節慶、熱門口味或大量訂購要更早確認。',
      },
    ],
    related: [
      { title: '提拉米蘇怎麼選', href: '/answers/tiramisu-guide', summary: '看酒香、苦甜、口感與保存。' },
      { title: '靈魂甜點是什麼', href: '/answers/soul-dessert', summary: '用人格語言找到更有記憶點的甜點。' },
      ...sharedRelated,
    ],
  },
];

export const getAnswerArticleBySlug = (slug: string) =>
  answerArticles.find((article) => article.slug === slug);
