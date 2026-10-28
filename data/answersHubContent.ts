export type AnswersHubQuickAnswer = {
  label: string;
  answer: string;
};

export type AnswersHubSection = {
  title: string;
  lead: string;
  bullets: string[];
};

export type AnswersHubReference = {
  label: string;
  url: string;
  supports: string;
};

export type AnswersHubFaq = {
  question: string;
  answer: string;
};

export type AnswersHubGuideLink = {
  title: string;
  href: string;
  summary: string;
};

export const answersHubContent = {
  meta: {
    title: 'MBTI 答案中心｜16 型、A/T、32 變體怎麼看｜Kiwimu',
    description:
      'Kiwimu MBTI 答案中心：用白話說明 MBTI 的 16 型、A/T 傾向、Kiwimu 的 32 種結果，以及哪些是官方說法、哪些是 Kiwimu 自己的觀點。',
    canonicalPath: '/answers',
    keywords:
      'MBTI 答案,MBTI 16型,A/T,32變體,人格測驗,MBTI 指南,Kiwimu,月島甜點,繁體中文',
  },
  hero: {
    eyebrow: 'MBTI ANSWERS',
    title: 'MBTI 答案中心',
    subtitle:
      '先講結論，再補來源。這一頁整理 MBTI 的定義、界線、A/T 傾向與 Kiwimu 的 32 種結果，哪些是官方說法、哪些是 Kiwimu 自己的觀點，都分開說清楚。',
    summary:
      'MBTI 的官方核心是 16 型偏好。A/T 不是官方 MBTI 分類，而是 Kiwimu 參考 16Personalities 的 identity（自我認同）觀點做出的內容分層。Kiwimu 的 32 種結果，指的是 16 型 × A/T 的內容設計，不是新的官方人格系統。',
  },
  quickAnswers: [
    {
      label: 'MBTI 的官方核心是什麼？',
      answer:
        '官方核心是 16 型人格偏好，重點在於你傾向怎麼接收資訊、做決定、處理世界，而不是能力高低、智商分數或職涯成敗。',
    },
    {
      label: 'A / T 是官方 MBTI 嗎？',
      answer:
        '不是。A/T 是 16Personalities 的 identity 觀點，常用來描述自我感受與壓力反應；Kiwimu 會把它當成內容分層，而不是官方第五維。',
    },
    {
      label: '為什麼你們會有 32 種結果？',
      answer:
        '因為 Kiwimu 把 16 型再切成 A / T 兩種敘事版本，方便把語氣、建議、風險提醒與生活情境寫得更準，最後形成 16 × 2 = 32 種公開報告。',
    },
    {
      label: 'Kiwimu 有哪些測驗？',
      answer:
        'V1 是 40 題完整測驗，V1.5 是 5 題的狀態快測，V2 是 40 道生活情境題的深度測驗。測驗與完整報告的第 01 章試讀免費，完整報告為付費內容，價格與活動以報告頁面為準。',
    },
    {
      label: '靈魂甜點是怎麼配對的？',
      answer:
        '靈魂甜點是 Kiwimu 的品牌語言，不是心理診斷：我們把每個型別的氣質對照到月島甜點現行菜單上的一款甜點，讓抽象的人格變成能想像的味道。實際供應與價格以菜單頁為準。',
    },
    {
      label: '哪些說法有官方依據？',
      answer:
        'MBTI 16 型的基本定義、MBTI 只是偏好模型而不是能力測驗，以及 16Personalities 對 A/T 的 identity 說明，都有外部來源可以查證，下方列出了連結。',
    },
  ] satisfies AnswersHubQuickAnswer[],
  fixedSections: [
    {
      title: '這個答案中心整理了什麼',
      lead: '先把基本概念講清楚，讓你看報告時不會被名詞卡住。',
      bullets: [
        'MBTI 的基本框架與 4 個維度定義。',
        'A/T 的來源說明與使用邊界。',
        'Kiwimu 的品牌聲明與資料使用方式。',
        '測驗流程、閱讀方式、隱私與保存規則。',
      ],
    },
    {
      title: '每個人不一樣的地方',
      lead: '同樣的框架裡，每個人的樣子還是不同，報告會依你的型別與 A/T 傾向寫不同的內容。',
      bullets: [
        '各型人格的語氣、例子、壓力反應與決策風格。',
        'A 型與 T 型的自我敘事差異、提醒方式與建議密度。',
        '不同情境的甜點配對、送禮語境與飲品建議。',
        '每個型別各自的例子、提醒與延伸閱讀。',
      ],
    },
  ] satisfies AnswersHubSection[],
  authorityReferences: [
    {
      label: 'The Myers-Briggs Company - MBTI Facts',
      url: 'https://www.themyersbriggs.com/en-us/support/mbti-facts',
      supports: 'MBTI 是人格偏好模型，不該被包裝成能力測驗或成敗預言。',
    },
    {
      label: 'The Myers-Briggs Company - Creating clarity: Addressing misconceptions about the MBTI assessment',
      url: 'https://www.themyersbriggs.com/hubfs/MyersBriggsCompany_January2026/pdfs/Creating%20Clarity%20Addressing%20Micsconceptions%20About%20the%20MBTI%20Assessment.pdf',
      supports: 'MBTI 的常見批評與使用邊界，適合用來避免過度解讀。',
    },
    {
      label: '16Personalities - Identity: Assertive vs. Turbulent',
      url: 'https://www.16personalities.com/articles/identity-assertive-vs-turbulent',
      supports: 'A/T 的 identity 說明，適合當作 Kiwimu 內容分層的參考，但不是官方 MBTI 第五維。',
    },
    {
      label: '16Personalities - Our Theory',
      url: 'https://www.16personalities.com/articles/our-theory',
      supports: '用來理解其模型如何延伸 MBTI 與 identity 層的寫法。',
    },
  ] satisfies AnswersHubReference[],
  editorialViews: [
    'Kiwimu 的 32 變體是內容設計，不是學術上的新人格系統。',
    '甜點映射是品牌語言，不是心理診斷；它的價值在於讓抽象人格變成可理解、可分享的語言。',
    '台灣在地情境、月島甜點，以及 LINE、菜單地圖、Passport 收藏這些延伸玩法，都是 Kiwimu 自己加上的內容設計。',
    'Kiwimu 的內容會盡量標明哪些是官方說法、哪些是我們的詮釋，方便你自己判斷。',
  ],
  faqs: [
    {
      question: 'MBTI 可以直接拿來預測工作能力嗎？',
      answer:
        '不行。MBTI 比較適合描述偏好與溝通方式，不能被當成能力排名、錄取標準或命運判決。這也是我們只把它當作內容結構，不把它當作硬性分類的原因。',
    },
    {
      question: 'A/T 和 16 型要怎麼一起看？',
      answer:
        '先看 16 型，理解你的資訊偏好、決策偏好與行動風格，再用 A/T 看壓力反應與自我敘事的穩定度。前者是骨架，後者是語氣。',
    },
    {
      question: 'Kiwimu 的 32 變體是不是比官方 MBTI 更準？',
      answer:
        '不是。32 變體只是 Kiwimu 的內容分層，目的是讓內容更容易閱讀，也更容易對應實際情境。它不是新理論，只是更細的內容切片。',
    },
    {
      question: 'MBTI 結果每次都會一樣嗎？',
      answer:
        '不一定。MBTI 描述的是偏好，作答時的狀態與情境都會影響結果，同一個人在不同時期得到不同結果很常見。想看自己的變化，可以隔一段時間再做一次來比較。',
    },
    {
      question: '靈魂甜點可以直接訂購嗎？',
      answer:
        '結果頁會附上月島甜點的菜單連結，你可以直接去看你的靈魂甜點。實際供應、規格與價格以菜單頁為準。',
    },
    {
      question: '可以引用這一頁的內容嗎？',
      answer:
        '可以。這一頁把結論、界線、來源與 Kiwimu 的觀點分開寫；引用時請標明出處，並保留官方說法與 Kiwimu 觀點的區別。',
    },
  ] satisfies AnswersHubFaq[],
  relatedGuides: [
    {
      title: 'MBTI 是什麼',
      href: '/answers/mbti',
      summary: '先理解 16 型人格偏好與 Kiwimu 的使用邊界。',
    },
    {
      title: 'A/T 是什麼',
      href: '/answers/at-variants',
      summary: '理解 Kiwimu 為什麼會有 16 × A/T 的 32 變體。',
    },
    {
      title: '靈魂甜點是什麼',
      href: '/answers/soul-dessert',
      summary: '把人格偏好翻譯成甜點、角色與生活體驗。',
    },
    {
      title: '提拉米蘇怎麼選',
      href: '/answers/tiramisu-guide',
      summary: '從口感、酒香、保存與送禮需求切入。',
    },
    {
      title: '送禮甜點怎麼選',
      href: '/answers/gift-guide',
      summary: '把體面、好切、保存與預訂說清楚。',
    },
  ] satisfies AnswersHubGuideLink[],
} as const;
