import React, { useState, useCallback, useEffect } from 'react';
import '../components/v2/v2.css';
import { trackAction } from '../utils/userDataCollector';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Option {
  id: 'a' | 'b';
  label: string;
  kiwimu: string;
  value: 0 | 1; // 0 = E/S/T/J/A, 1 = I/N/F/P/Turbulent
}

interface Question {
  id: number;
  text: string;
  options: [Option, Option];
}

interface StateResult {
  id: number;
  title: string;
  description: string;
  pairing: string;
  lineCTA: string;
  illustration: string;
  // prototype[i]: value for each dimension [E/I, S/N, T/F, J/P, A/T]
  // 0 = E / S / T / J / A,  1 = I / N / F / P / Turbulent
  prototype: [number, number, number, number, number];
}

// ─── A卷｜數位焦慮派 ──────────────────────────────────────────────────────────

const QUESTIONS_A: Question[] = [
  {
    id: 1,
    text: '週五深夜，你已經累到靈魂出竅，躺在床上的「數位反射動作」是？',
    options: [
      {
        id: 'a',
        label: '在 IG、Threads、LINE 之間瘋狂切換，確認自己還連接著世界。',
        kiwimu: '在甜點盤之間跳來跳去',
        value: 0, // E
      },
      {
        id: 'b',
        label: '切換到沒人認識的小帳，在黑暗中毫無目的地狂刷廢片。',
        kiwimu: '默默縮進烤模裡',
        value: 1, // I
      },
    ],
  },
  {
    id: 2,
    text: '看到萬人轉發的爭議貼文，你的大腦第一反應是？',
    options: [
      {
        id: 'a',
        label: '立刻滑留言區找懶人包，搞清楚時間線跟證據。',
        kiwimu: '被精準地切成兩半',
        value: 0, // S
      },
      {
        id: 'b',
        label: '跳脫事件本身，思考背後的社會現象，腦中自動衍生成梗圖。',
        kiwimu: '飛上天變成一朵奶油雲',
        value: 1, // N
      },
    ],
  },
  {
    id: 3,
    text: '朋友在群組崩潰大哭說被炎上了，你鍵盤會先打出什麼？',
    options: [
      {
        id: 'a',
        label: '「先截圖留底！我們來盤點邏輯漏洞，準備反擊。」',
        kiwimu: '撒上一把鹽，表情嚴肅',
        value: 0, // T
      },
      {
        id: 'b',
        label: '「天啊抱抱你！他們有病吧！」',
        kiwimu: '淋上一勺焦糖，眼神溫柔',
        value: 1, // F
      },
    ],
  },
  {
    id: 4,
    text: '看看你手機的分頁跟未讀通知，最符合你的狀態是？',
    options: [
      {
        id: 'a',
        label: '定期清理，看到未讀小紅點會焦慮，清空才覺得人生還在掌控中。',
        kiwimu: '被放進完美的烤模裡',
        value: 0, // J
      },
      {
        id: 'b',
        label: '分頁永遠 99+，不記得裡面有什麼，但相信「哪天一定會用到」。',
        kiwimu: '被隨意打散在桌面',
        value: 1, // P
      },
    ],
  },
  {
    id: 5,
    text: '你發了一則自認超好笑的限動，半小時過去完全沒人理你？',
    options: [
      {
        id: 'a',
        label: '「這屆網友真不懂幽默。」滑掉手機，毫不在意去吃宵夜。',
        kiwimu: '烤出完美堅硬的焦糖外殼',
        value: 0, // A (Assertive)
      },
      {
        id: 'b',
        label: '「是不是不好笑？我得罪人了嗎？」內心小劇場，最後默默刪掉。',
        kiwimu: '表面焦糖裂開，流出苦澀內餡',
        value: 1, // Turbulent
      },
    ],
  },
];

// ─── B卷｜躺平邊界派 ──────────────────────────────────────────────────────────

const QUESTIONS_B: Question[] = [
  {
    id: 1,
    text: '半熟不熟的同事突然說「週末大家要不要一起去喝咖啡？」你的內心 OS 是？',
    options: [
      {
        id: 'a',
        label: '好啊！反正週末沒事，去聽聽八卦也不錯。',
        kiwimu: '開心地戴上出門的帽子',
        value: 0, // E
      },
      {
        id: 'b',
        label: '放鬆？跟你們出去就是加班！大腦高速運轉搜尋一百種禮貌拒絕的藉口。',
        kiwimu: '瞬間縮進蛋殼裡',
        value: 1, // I
      },
    ],
  },
  {
    id: 2,
    text: '家裡水龍頭壞了，上網查教學時你會點開什麼？',
    options: [
      {
        id: 'a',
        label: '找 30 秒短影音或圖文步驟，別講原理，告訴我第一步轉哪就好。',
        kiwimu: '拿出一本精準的說明書',
        value: 0, // S
      },
      {
        id: 'b',
        label: '查著查著對運作原理產生興趣，最後看了一堆維基百科。',
        kiwimu: '戴上偵探眼鏡，陷入無底洞',
        value: 1, // N
      },
    ],
  },
  {
    id: 3,
    text: '看劇時主角因為「太重感情」做出極度愚蠢的決定，你的反應是？',
    options: [
      {
        id: 'a',
        label: '翻白眼。「把話說清楚不就好了，浪費大家時間！」',
        kiwimu: '舉起「X」的牌子',
        value: 0, // T
      },
      {
        id: 'b',
        label: '雖然覺得笨，但心裡酸酸的。「我懂他為什麼這樣選……」',
        kiwimu: '跟著一起流淚',
        value: 1, // F
      },
    ],
  },
  {
    id: 4,
    text: '計畫週末徹底躺平，朋友突然說「半小時後去找你！」',
    options: [
      {
        id: 'a',
        label: '崩潰！我的「什麼都不做」是排定好的行程！突發變動讓我必須重新整頓心情。',
        kiwimu: '烤箱溫度瞬間失控飆高',
        value: 0, // J
      },
      {
        id: 'b',
        label: '喔，好啊。反正我也只是一坨會呼吸的肉，大不了一起躺在沙發滑手機。',
        kiwimu: '變成一灘軟泥',
        value: 1, // P
      },
    ],
  },
  {
    id: 5,
    text: '你不小心把有點尷尬的梗圖傳到有主管在的工作群組。',
    options: [
      {
        id: 'a',
        label: '秒收回，打個「哈哈傳錯抱歉」。只要我不尷尬，尷尬的就是別人。',
        kiwimu: '優雅地舔了舔爪子，毫無波瀾',
        value: 0, // A (Assertive)
      },
      {
        id: 'b',
        label: '雖然秒收回了，接下來兩小時狂內耗：「主管有看到嗎？我考績毀了嗎？」',
        kiwimu: '頭頂冒煙，瘋狂冒汗',
        value: 1, // Turbulent
      },
    ],
  },
];

// ─── 12 State Results ─────────────────────────────────────────────────────────
// prototype: [E/I, S/N, T/F, J/P, A/T]  (0=E/S/T/J/A, 1=I/N/F/P/Turbulent)
// These 12 archetypes are spread across the 5-dimensional space (32 combos → 12 states).
// Hamming distance to nearest prototype determines the result.

const STATE_RESULTS: StateResult[] = [
  {
    id: 1,
    title: '拒絕出罐的液態精靈',
    description: '社交意願是零，今天不想被任何攪拌器打發。只要我不出門，就沒有人能改變我的質地。',
    pairing: '博士茶 — 低調、不張揚，自成一格',
    lineCTA: '我想預訂博士茶',
    illustration: '/illustrations/state-01.png',
    prototype: [1, 1, 1, 1, 1], // INFP-T
  },
  {
    id: 2,
    title: '剛開始轉動的慢速打發',
    description: '引擎還在暖機，請給我十分鐘。不是不想動，只是還沒到溫度。',
    pairing: '靜岡焙茶拿鐵 — 溫柔啟動，慢慢醒來',
    lineCTA: '我想預訂靜岡焙茶拿鐵',
    illustration: '/illustrations/state-02.png',
    prototype: [1, 0, 0, 0, 0], // ISTJ-A
  },
  {
    id: 3,
    title: '柔軟輕盈的雲朵奶霜',
    description: '今天狀態意外地好。心情輕鬆，既不緊繃也不會過度軟爛，游刃有餘地接住了生活的所有變化。',
    pairing: '蜜香紅茶拿鐵｜千層蛋糕 — 輕盈甜美，今天值得獎勵自己',
    lineCTA: '我想預訂蜜香紅茶拿鐵千層',
    illustration: '/illustrations/state-03.png',
    prototype: [0, 1, 1, 1, 0], // ENFP-A
  },
  {
    id: 4,
    title: '生人勿近的完美擠花',
    description: '今天邏輯清晰，防禦點滿。雖然不想跟人廢話，但該做的事都能完美達成。誰都別想破壞你的形狀。',
    pairing: '鹹蛋黃｜巴斯克乳酪 — 稜角分明，個性強烈，不需要討好任何人',
    lineCTA: '我想預訂鹹蛋黃巴斯克',
    illustration: '/illustrations/state-04.png',
    prototype: [1, 1, 0, 0, 0], // INTJ-A
  },
  {
    id: 5,
    title: '一戳就碎的糖霜薄殼',
    description: '今天為了維持氣氛假裝精神很好，但內心社交電池已經見底，處於隨時會破防的邊緣。',
    pairing: '貝里詩奶酒｜提拉米蘇 — 外表華麗，內裡需要被好好接住',
    lineCTA: '我想預訂貝里詩提拉米蘇',
    illustration: '/illustrations/state-05.png',
    prototype: [0, 1, 1, 0, 1], // ENFJ-T
  },
  {
    id: 6,
    title: '打過頭的微黃奶油',
    description: '接收了太多外界資訊，大腦開了一百個分頁。你覺得自己快要當機了，急需拔掉網路線。',
    pairing: '來一顆烤布丁拿鐵 — 過度運轉，需要甜味強制大腦關機',
    lineCTA: '我想預訂烤布丁拿鐵',
    illustration: '/illustrations/state-06.png',
    prototype: [1, 1, 0, 1, 1], // INTP-T
  },
  {
    id: 7,
    title: '油水分離的崩潰現場',
    description: '已經超過負荷了。今天不適合任何決策，不適合任何社交，只適合讓自己乾濕分離一下。',
    pairing: '經典烤布丁｜乾濕分離 — 名字就是今天的狀態，什麼都不用解釋',
    lineCTA: '我想預訂經典烤布丁',
    illustration: '/illustrations/state-07.png',
    prototype: [1, 0, 1, 1, 1], // ISFP-T
  },
  {
    id: 8,
    title: '忘記冰的融化奶水',
    description: '吸收了太多別人的情緒，今天已經無法維持形狀了。攤平也是一種了不起的生存策略。',
    pairing: '格雷伯爵奶蓋｜千層蛋糕 — 軟爛攤平，需要一個穩固的底座把你托住',
    lineCTA: '我想預訂格雷伯爵千層',
    illustration: '/illustrations/state-08.png',
    prototype: [0, 0, 1, 1, 1], // ESFP-T
  },
  {
    id: 9,
    title: '冷藏過頭的硬塊奶油',
    description: '情緒全部關起來了，今天不接受任何感受。不是冷漠，只是需要先讓自己固定住。',
    pairing: '北海道經典｜巴斯克乳酪 — 堅硬經典，放室溫，等它自己慢慢軟',
    lineCTA: '我想預訂北海道巴斯克',
    illustration: '/illustrations/state-09.png',
    prototype: [1, 0, 0, 0, 1], // ISTJ-T
  },
  {
    id: 10,
    title: '表面焦糖化的烤布丁',
    description: '被逼到極限了，但最後一層還是撐住了。外殼焦硬，裡面是軟的，這就是今天的你。',
    pairing: '烤焦糖布丁摩卡｜提拉米蘇 — 苦完就過了，你已經很厲害了',
    lineCTA: '我想預訂烤焦糖布丁摩卡提拉米蘇',
    illustration: '/illustrations/state-10.png',
    prototype: [0, 0, 0, 0, 1], // ESTJ-T
  },
  {
    id: 11,
    title: '輕飄飄的過度奶泡',
    description: '狀態很嗨但沒有重心，容易因一件小事整個破掉。享受這個泡沫的瞬間就好。',
    pairing: '日本柚子美式 — 清爽高亢，泡沫破了就重新打一杯',
    lineCTA: '我想預訂日本柚子美式',
    illustration: '/illustrations/state-11.png',
    prototype: [0, 1, 0, 1, 0], // ENTP-A
  },
  {
    id: 12,
    title: '剛好七分發的微甜奶霜',
    description: '不完美但剛剛好。有型但不死硬，輕盈有彈性，今天可以溫柔地應付一切。',
    pairing: '卡士達十勝草莓｜千層蛋糕 — 不完美但剛剛好，今天值得一塊好蛋糕',
    lineCTA: '我想預訂卡士達十勝草莓千層',
    illustration: '/illustrations/state-12.png',
    prototype: [0, 0, 1, 0, 0], // ESFJ-A
  },
];

// ─── Result calculation (Hamming distance) ───────────────────────────────────

function hammingDist(a: number[], b: readonly number[]): number {
  return a.reduce((sum, v, i) => sum + (v !== b[i] ? 1 : 0), 0);
}

function findResult(answers: number[]): StateResult {
  let minDist = Infinity;
  let closest = STATE_RESULTS[0];
  for (const state of STATE_RESULTS) {
    const d = hammingDist(answers, state.prototype);
    if (d < minDist) {
      minDist = d;
      closest = state;
    }
  }
  return closest;
}

// ─── Marquee content ──────────────────────────────────────────────────────────

const MARQUEE_TEXT = 'KIWIMU STATE TEST · 今天你是哪種奶油狀態？ · MOON DESSERT · 5 QUESTIONS · ';
const LITE_VARIANT_KEY = 'kiwimu_lite_ab_variant';

function resolveLiteAssignment(): { version: 'A' | 'B'; sourceHint: string } {
  const params = new URLSearchParams(window.location.search);
  const forcedVariant = params.get('v')?.toUpperCase();

  if (forcedVariant === 'A' || forcedVariant === 'B') {
    sessionStorage.setItem(LITE_VARIANT_KEY, forcedVariant);
    return {
      version: forcedVariant as 'A' | 'B',
      sourceHint: 'query_override',
    };
  }

  const storedVariant = sessionStorage.getItem(LITE_VARIANT_KEY);
  if (storedVariant === 'A' || storedVariant === 'B') {
    return {
      version: storedVariant,
      sourceHint: 'session_resume',
    };
  }

  const sourceText = [
    params.get('source'),
    params.get('utm_source'),
    params.get('utm_medium'),
    params.get('utm_campaign'),
    document.referrer,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  let version: 'A' | 'B' = 'A';
  let sourceHint = 'default_random';

  if (/(threads|thread)/.test(sourceText)) {
    version = 'A';
    sourceHint = 'threads_signal';
  } else if (/(instagram|insta|l\.instagram|\big\b)/.test(sourceText)) {
    version = 'B';
    sourceHint = 'instagram_signal';
  } else {
    version = Math.random() > 0.5 ? 'A' : 'B';
  }

  sessionStorage.setItem(LITE_VARIANT_KEY, version);

  return { version, sourceHint };
}

function buildFullQuizUrl(version: 'A' | 'B', resultId?: string | number) {
  const currentParams = new URLSearchParams(window.location.search);
  const nextParams = new URLSearchParams();
  const passThroughKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'source'];

  passThroughKeys.forEach((key) => {
    const value = currentParams.get(key);
    if (value) {
      nextParams.set(key, value);
    }
  });

  nextParams.set('from', 'lite_quiz');
  nextParams.set('lite_variant', version);

  if (resultId != null) {
    nextParams.set('lite_result', String(resultId));
  }

  return `/quiz?${nextParams.toString()}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const StateTest: React.FC = () => {
  const [{ version, sourceHint }] = useState(resolveLiteAssignment);
  const questions = version === 'B' ? QUESTIONS_B : QUESTIONS_A;

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [result, setResult] = useState<StateResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  const progressPct = (currentQ / questions.length) * 100;
  const question = questions[currentQ];

  useEffect(() => {
    trackAction('lite_quiz_start', {
      route: window.location.pathname,
      version,
      sourceHint,
    });
  }, [version, sourceHint]);

  useEffect(() => {
    if (!result) {
      return;
    }

    trackAction('lite_quiz_complete', {
      version,
      sourceHint,
      resultId: result.id,
      resultTitle: result.title,
    });

    trackAction('lite_result_view', {
      version,
      sourceHint,
      resultId: result.id,
      resultTitle: result.title,
    });
  }, [result, version, sourceHint]);

  const handleSelect = useCallback(
    (optionId: string, value: number) => {
      if (selectedId !== null) return;
      setSelectedId(optionId);
      setShowTransition(true);
      const newAnswers = [...answers, value];
      setTimeout(() => {
        setShowTransition(false);
        if (currentQ < questions.length - 1) {
          setAnswers(newAnswers);
          setCurrentQ((q) => q + 1);
          setSelectedId(null);
        } else {
          setResult(findResult(newAnswers));
        }
      }, 280);
    },
    [selectedId, answers, currentQ, questions.length],
  );

  const handleCopy = useCallback(() => {
    if (!result) return;
    const text = `${result.title}｜${result.description}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
    function fallbackCopy(t: string) {
      const el = document.createElement('textarea');
      el.value = t;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const handleReset = useCallback(() => {
    window.location.assign('/');
  }, []);

  const handleContinueToV1 = useCallback(() => {
    trackAction('lite_to_v1_click', {
      version,
      sourceHint,
      resultId: result?.id,
      resultTitle: result?.title,
    });

    window.location.assign(buildFullQuizUrl(version, result?.id));
  }, [result, sourceHint, version]);

  // ── Result page ─────────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="v2-root min-h-screen flex flex-col items-center justify-center px-5 pt-24 pb-16">

        {/* Marquee */}
        <div className="marquee-container">
          <div className="marquee-track">
            <span className="marquee-text">{MARQUEE_TEXT.repeat(4)}</span>
            <span className="marquee-text">{MARQUEE_TEXT.repeat(4)}</span>
          </div>
        </div>

        <div className="w-full max-w-sm">

          {/* Result card */}
          <div className="kiwimu-card overflow-hidden mb-6">

            {/* Card top bar */}
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ backgroundColor: '#1A1A1A' }}
            >
              <span
                className="font-mono text-[10px] font-medium tracking-widest uppercase"
                style={{ color: '#CCFF00' }}
              >
                Current State
              </span>
              <span
                className="font-mono text-[10px] font-medium"
                style={{ color: 'rgba(204,255,0,0.5)' }}
              >
                {result.id} / 12
              </span>
            </div>

            {/* Card body */}
            <div className="px-5 py-6">

              {/* Version label */}
              <div
                className="inline-block px-3 py-1 rounded-full font-mono text-[10px] font-medium tracking-widest uppercase mb-4"
                style={{ backgroundColor: 'rgba(26,26,26,0.06)', color: 'rgba(26,26,26,0.5)' }}
              >
                {version === 'B' ? 'B Variant · 邊界原型' : 'A Variant · 數位生存原型'}
              </div>

              {/* Illustration */}
              <img
                src={result.illustration}
                alt={result.title}
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />

              {/* Title */}
              <h1
                className="text-2xl font-medium leading-snug mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A' }}
              >
                {result.title}
              </h1>

              {/* Divider */}
              <div className="mb-4" style={{ height: '1px', backgroundColor: 'rgba(26,26,26,0.1)' }} />

              {/* Description */}
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(26,26,26,0.7)' }}>
                {result.description}
              </p>

              {/* Pairing block */}
              <div
                className="pl-4 pr-3 py-3 rounded-r-xl"
                style={{ borderLeft: '2px solid #CCFF00', backgroundColor: 'rgba(248,248,245,0.6)' }}
              >
                <p
                  className="font-mono text-[10px] font-medium tracking-widest uppercase mb-1"
                  style={{ color: 'rgba(26,26,26,0.4)' }}
                >
                  Pairing
                </p>
                <p className="text-sm leading-snug" style={{ color: '#1A1A1A' }}>
                  {result.pairing}
                </p>
              </div>

              <div
                className="mt-5 rounded-2xl border border-dashed p-4"
                style={{ borderColor: 'rgba(26,26,26,0.12)', backgroundColor: '#FAFAF6' }}
              >
                <p
                  className="font-mono text-[10px] font-medium tracking-widest uppercase mb-2"
                  style={{ color: 'rgba(26,26,26,0.45)' }}
                >
                  5 題前導結果
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(26,26,26,0.72)' }}>
                  這是 A/B test 漏斗中的前導狀態卡，不是完整版 MBTI。下一步進入免費 V1，才會拿到正式人格類型與完整基礎報告。
                </p>
              </div>

            </div>
          </div>

          {/* LINE CTA block */}
          <div
            className="kiwimu-card px-5 py-4 mb-4"
          >
            <p
              className="font-mono text-[10px] font-medium tracking-widest uppercase mb-2"
              style={{ color: 'rgba(26,26,26,0.4)' }}
            >
              一句 teaser
            </p>
            <p className="text-sm font-medium mb-3" style={{ color: '#1A1A1A' }}>
              {result.description}
            </p>
            <button
              onClick={handleCopy}
              className="kiwimu-btn px-4 py-1.5 text-xs font-medium"
              style={{ color: '#1A1A1A' }}
            >
              {copied ? '已複製' : '複製文字'}
            </button>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleContinueToV1}
              className="kiwimu-btn kiwimu-btn-primary block w-full py-4 text-sm font-black tracking-[0.18em] uppercase"
              style={{ color: '#1A1A1A' }}
            >
              進入免費完整版 V1
            </button>
            <button
              onClick={handleReset}
              className="kiwimu-btn block w-full py-4 text-sm font-medium tracking-wide"
              style={{ color: '#1A1A1A' }}
            >
              重新測一次 5 題
            </button>
            <p
              className="text-center font-mono text-[10px] font-medium tracking-widest uppercase"
              style={{ color: 'rgba(26,26,26,0.35)' }}
            >
              A/B test variant {version}
            </p>
          </div>

        </div>
      </div>
    );
  }

  // ── Quiz page ────────────────────────────────────────────────────────────────
  return (
    <div className="v2-root min-h-screen flex flex-col items-center px-5 pt-24 pb-16">

      {/* Marquee */}
      <div className="marquee-container">
        <div className="marquee-track">
          <span className="marquee-text">{MARQUEE_TEXT.repeat(4)}</span>
          <span className="marquee-text">{MARQUEE_TEXT.repeat(4)}</span>
        </div>
      </div>

      {/* Transition illustration overlay */}
      {showTransition && (
        <div className="fixed inset-0 z-10 flex items-center justify-center pointer-events-none">
          <img
            src="/illustrations/state-transition.png"
            alt="transition"
            style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>
      )}

      <div className="w-full max-w-sm flex-1 flex flex-col">

        {/* Progress bar */}
        <div className="mb-8">
          <div className="w-full h-px mb-1" style={{ backgroundColor: 'rgba(26,26,26,0.1)' }}>
            <div
              className="h-px transition-all duration-300"
              style={{ width: `${progressPct}%`, backgroundColor: '#1A1A1A' }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="kiwimu-card flex-1 flex flex-col p-6">

          {/* Quiz header: Q.01 / ANALYZING / 05 */}
          <div
            className="flex items-center justify-between pb-3 mb-5 font-mono font-medium text-xs"
            style={{ borderBottom: '1.5px solid rgba(26,26,26,0.2)', color: 'rgba(26,26,26,0.6)' }}
          >
            <span>Q.{String(currentQ + 1).padStart(2, '0')}</span>
            <span
              className="px-2 py-0.5 rounded-full tracking-widest text-[10px]"
              style={{ backgroundColor: '#1A1A1A', color: '#F8F8F5' }}
            >
              ANALYZING
            </span>
            <span>{String(questions.length).padStart(2, '0')}</span>
          </div>

          {/* Question text */}
          <h2
            className="text-xl font-medium leading-snug mb-7"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A1A' }}
          >
            {question.text}
          </h2>

          {/* Options */}
          <div className="flex flex-col gap-3 mt-auto">
            {question.options.map((opt) => {
              const isSelected = selectedId === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id, opt.value)}
                  disabled={selectedId !== null}
                  className="w-full kiwimu-btn p-4 text-left"
                  style={
                    isSelected
                      ? {
                          backgroundColor: '#1A1A1A',
                          color: '#F8F8F5',
                          transform: 'translate(2px, 2px)',
                          boxShadow: '0px 0px 0px #1A1A1A',
                        }
                      : { color: '#1A1A1A', borderRadius: '16px' }
                  }
                >
                  <p className="text-sm leading-snug font-medium">
                    {opt.label}
                  </p>
                  <p
                    className="font-mono text-[10px] mt-1.5 tracking-wider uppercase"
                    style={{ color: isSelected ? 'rgba(248,248,245,0.5)' : 'rgba(26,26,26,0.4)' }}
                  >
                    {opt.kiwimu}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="font-mono text-[10px] tracking-widest uppercase"
              style={{ color: 'rgba(26,26,26,0.3)' }}
            >
              回首頁
            </a>
          </div>

        </div>
      </div>

    </div>
  );
};

export default StateTest;
