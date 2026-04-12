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
      'Kiwimu 公開答案中心：先把 MBTI 的 16 型、A/T、32 變體、可共用內容、要分流內容、權威背書與 Kiwimu 觀點一次講清楚。',
    canonicalPath: '/answers',
    keywords:
      'MBTI 答案,MBTI 16型,A/T,32變體,人格測驗,MBTI 指南,Kiwimu,月島甜點,AI SEO,繁體中文',
  },
  hero: {
    eyebrow: 'PUBLIC ANSWERS / AI SEO',
    title: 'MBTI 答案中心',
    subtitle:
      '先講結論，再補來源。這一頁是 Kiwimu 的公開答案樞紐，目標不是把話說神，而是把 MBTI 的定義、邊界、A/T、32 變體與我們的編輯觀點拆清楚，讓人看得懂，也讓 AI 敢引用。',
    summary:
      'MBTI 的官方核心是 16 型偏好。A/T 不是官方 MBTI 分類，而是 Kiwimu 參考 16Personalities 的 identity 觀點做出的內容分層。Kiwimu 的 32 種結果，指的是 16 型 × A/T 的 editorial layer，不是新的官方人格系統。',
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
      label: '哪些內容可以共用？',
      answer:
        'MBTI 基本定義、測驗方式、隱私與資料使用、A/T 的來源說明、品牌語氣與 CTA 可以共用；這些屬於 hub 的固定層，適合讓所有頁面都一致。',
    },
    {
      label: '哪些內容一定要分流？',
      answer:
        '每個型別的例子、壓力反應、人際節奏、職涯提醒、甜點配對、FAQ 例句都應該分流；不然會變成所有人都看到一樣的空話。',
    },
    {
      label: '哪些是權威背書？',
      answer:
        'MBTI 16 型的基本定義、MBTI 只是偏好模型不是能力測驗、以及 16Personalities 對 A/T 的 identity 說明，都屬於可引用的外部參考。',
    },
  ] satisfies AnswersHubQuickAnswer[],
  fixedSections: [
    {
      title: '哪些固定內容可以一樣',
      lead: '適合放在所有答案頁、導覽頁與報告頁的公共層，讓整個站的語言一致。',
      bullets: [
        'MBTI 的基本框架與 4 個維度定義。',
        'A/T 的來源說明與使用邊界。',
        'Kiwimu 的品牌聲明、資料使用、CTA 與導流語氣。',
        '測驗流程、閱讀方式、隱私與保存規則。',
      ],
    },
    {
      title: '哪些內容不一樣',
      lead: '真正影響搜尋意圖與使用者體驗的部分，不能共用同一套字。',
      bullets: [
        '各型人格的語氣、例子、壓力反應與決策風格。',
        'A 型與 T 型的自我敘事差異、提醒方式與建議密度。',
        '不同情境的甜點配對、送禮語境與飲品建議。',
        '不同頁面的標題、摘要、FAQ 與內部連結。',
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
      label: 'The Myers-Briggs Company - Facts and common criticisms',
      url: 'https://eu.themyersbriggs.com/en-IE/Knowledge-centre/Blog/mbti-facts-and-common-criticisms',
      supports: 'MBTI 的常見批評與使用邊界，適合用來避免過度解讀。',
    },
    {
      label: '16Personalities - Identity: Assertive vs. Turbulent',
      url: 'https://www.16personalities.com/articles/identity-assertive-vs-turbulent',
      supports: 'A/T 的 identity 說明，適合當作 Kiwimu 內容分層的參考，但不是官方 MBTI 第五維。',
    },
    {
      label: '16Personalities - Our Theory',
      url: 'https://www.16personalities.com/articles/our-theory%E2%80%8C',
      supports: '用來理解其模型如何延伸 MBTI 與 identity 層的寫法。',
    },
  ] satisfies AnswersHubReference[],
  editorialViews: [
    'Kiwimu 的 32 變體是內容設計，不是學術上的新人格系統。',
    '甜點映射是品牌語言，不是心理診斷；它的價值在於讓抽象人格變成可理解、可分享的語言。',
    '台灣在地情境、月島甜點、LINE / Map / Passport 導流，都是 Kiwimu 的 editorial layer。',
    '如果一段文案沒有辦法被摘成一句話、被搜尋理解、再回到產品頁，就還不夠像公開答案頁。',
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
        '不是。32 變體只是 Kiwimu 的 editorial layer，目的是讓內容更容易閱讀、更容易被引用，也更容易對應實際情境。它不是新理論，只是更細的內容切片。',
    },
    {
      question: '哪些頁面可以共用同一套說明？',
      answer:
        '答案中心、導覽總覽、隱私頁、測驗說明、FAQ 與品牌聲明都可以共用固定層；只要是定義與流程，通常不需要每頁重寫。',
    },
    {
      question: '哪些頁面應該完全寫自己的內容？',
      answer:
        '每個 MBTI 型別頁、每個 A/T 版本頁、每個甜點配對頁都要有自己的例子與提醒，因為這些文字才是真正影響搜尋意圖和轉換的內容。',
    },
    {
      question: '這一頁可以拿去被 AI 引用嗎？',
      answer:
        '可以。這一頁刻意把結論、邊界、來源與觀點分開，方便搜尋引擎與 AI 取用；不過引用時仍應保留官方來源與 Kiwimu 觀點的區分。',
    },
  ] satisfies AnswersHubFaq[],
  relatedGuides: [
    {
      title: '提拉米蘇怎麼選',
      href: '/answers/tiramisu-guide',
      summary: '從口感、酒香、保存與送禮需求切入的永久型答案頁。',
    },
    {
      title: '送禮甜點怎麼選',
      href: '/answers/gift-guide',
      summary: '把體面、好切、保存與預訂說清楚，適合做第二篇 evergreen。',
    },
    {
      title: '月島導覽地圖',
      href: 'https://map.kiwimu.com',
      summary: '把答案導到實體體驗與門市資訊。',
    },
    {
      title: 'Kiwimu MBTI Lab',
      href: 'https://kiwimu.com/read',
      summary: '把人格答案導向深度報告與測驗流程。',
    },
  ] satisfies AnswersHubGuideLink[],
} as const;

