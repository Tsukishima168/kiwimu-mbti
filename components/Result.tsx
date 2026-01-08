
import React, { useRef, useState, useEffect } from 'react';
import { MbtiResultData, Score } from '../types';
import { calculatePercentages } from '../utils/logic';
import { DIMENSION_EXPLANATIONS, getResultData } from '../constants';
import html2canvas from 'html2canvas';

interface ResultProps {
  resultData: MbtiResultData;
  rawScores: Score;
  onRetest: () => void;
  onOpenConsultant: () => void;
}

const ALL_TYPES = ['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'];

const SOUL_ANCHOR_MAP: Record<string, any> = {
  INTJ: { name: "北海道經典巴斯克", series: "巴斯克", quad: "經典", alt: ["檸檬巴斯克", "茶香巴斯克"], drinkA: "美式咖啡", drinkT: "經典拿鐵", hook: "極致的濃度直達靈魂核心，是理智與感官的完美角力。" },
  INTP: { name: "檸檬柚子千層蛋糕", series: "千層", quad: "亮色", alt: ["蜜香紅茶千層", "草莓莓果千層"], drinkA: "日本柚子美式", drinkT: "薄荷茶", hook: "結構細膩且層次分明，適合在深度思考中尋求一絲清亮。" },
  ENTJ: { name: "奶酒提拉米蘇", series: "提拉米蘇", quad: "深色", alt: ["經典提拉米蘇", "抹茶提拉米蘇"], drinkA: "美式咖啡", drinkT: "焙茶拿鐵", hook: "微醺的權力展演，苦甜之間盡是掌控局勢的餘韻。" },
  ENTP: { name: "柚子蘋果提拉米蘇", series: "提拉米蘇", quad: "亮色", alt: ["奶酒提拉米蘇", "抹茶提拉米蘇"], drinkA: "日本柚子美式", drinkT: "烤布丁拿鐵", hook: "打破常規的驚喜風味，在每一次味覺挑戰中看見邊界。" },
  INFJ: { name: "茶香巴斯克", series: "巴斯克", quad: "深色", alt: ["北海道經典巴斯克", "檸檬巴斯克"], drinkA: "博士茶", drinkT: "抹茶拿鐵", hook: "沈穩的茶韻撫平外界的嘈雜，帶你潛入最深的內在宇宙。" },
  INFP: { name: "北海道十勝戚風蛋糕", series: "戚風", quad: "經典", alt: ["檸檬蘋果戚風", "莓果戚風"], drinkA: "博士茶", drinkT: "花草茶", hook: "輕盈柔軟的著陸點，在銳利的世界裡提供一場溫柔的安放。" },
  ENFJ: { name: "檸檬蘋果戚風蛋糕", series: "戚風", quad: "亮色", alt: ["北海道十勝戚風", "莓果戚風"], drinkA: "西西里美式", drinkT: "抹茶拿鐵", hook: "明亮如陽光的清新力量，溫暖並照亮每一個被遺忘的角落。" },
  ENFP: { name: "草莓莓果千層蛋糕", series: "千層", quad: "果香", alt: ["檸檬柚子千層", "蜜香紅茶千層"], drinkA: "日本柚子美式", drinkT: "花草茶", hook: "層次繽紛且富有生命力，裝滿奇奇怪怪且閃亮的靈感碎片。" },
  ISTJ: { name: "經典十勝原味千層", series: "千層", quad: "經典", alt: ["巧克力布朗尼千層", "蜜香紅茶千層"], drinkA: "美式咖啡", drinkT: "經典拿鐵", hook: "結構的絕對精準與對承諾的執著，最值得信賴的味覺基石。" },
  ISFJ: { name: "經典烤布丁", series: "單品", quad: "經典", alt: ["本口味目前為最佳配對"], drinkA: "蕎麥茶", drinkT: "烤布丁拿鐵", hook: "安全感的終極錨點，最純粹、最直接的溫柔安撫與回歸。" },
  ESTJ: { name: "鹹蛋黃巴斯克", series: "巴斯克", quad: "深色", alt: ["北海道經典巴斯克", "茶香巴斯克"], drinkA: "美式咖啡", drinkT: "焙茶拿鐵", hook: "鋼鐵意志與濃郁核心的結合，穩健中帶有不容忽視的力量。" },
  ESFJ: { name: "莓果戚風蛋糕", series: "戚風", quad: "果香", alt: ["綜合水果戚風", "檸檬蘋果戚風"], drinkA: "日本柚子美式", drinkT: "經典拿鐵", hook: "溫和友善的包覆感，與摯愛分享這份純粹快樂的本質。" },
  ISTP: { name: "經典提拉米蘇", series: "提拉米蘇", quad: "經典", alt: ["抹茶提拉米蘇", "柚子蘋果提拉米蘇"], drinkA: "美式咖啡", drinkT: "焙茶拿鐵", hook: "冷靜大膽的口感平衡，無需多言的硬派實力展現。" },
  ISFP: { name: "抹茶提拉米蘇", series: "提拉米蘇", quad: "深色", alt: ["經典提拉米蘇", "奶酒提拉米蘇"], drinkA: "日本柚子美式", drinkT: "花草茶", hook: "細膩美感的微苦回甘，用最溫柔的方式對抗世界的喧囂。" },
  ESTP: { name: "巧克力布朗尼千層", series: "千層", quad: "深色", alt: ["經典十勝原味千層", "蜜香紅茶千層"], drinkA: "西西里美式", drinkT: "焙茶拿鐵", hook: "極致感官的爆發體驗，追求速度與最直白的生命熱情。" },
  ESFP: { name: "綜合水果戚風蛋糕", series: "戚風", quad: "果香", alt: ["莓果戚風", "檸檬蘋果戚風"], drinkA: "日本柚子美式", drinkT: "烤布丁拿鐵", hook: "點亮全場的色彩盛宴，將每一刻都轉化為永恆的快樂慶典。" }
};

const MENU_DATA = {
  desserts: [
    { title: "提拉米蘇系列", items: ["經典提拉米蘇", "抹茶提拉米蘇", "柚子蘋果提拉米蘇", "奶酒提拉米蘇"], desc: "苦甜平衡與大人感，收斂但有餘韻。" },
    { title: "戚風蛋糕系列", items: ["北海道十勝戚風蛋糕", "檸檬蘋果戚風蛋糕", "莓果戚風蛋糕", "綜合水果戚風蛋糕"], desc: "輕盈柔軟的著陸點，讓情緒慢慢回到穩定。" },
    { title: "千層蛋糕系列", items: ["經典十勝原味千層", "巧克力布朗尼千層", "蜜香紅茶千層蛋糕", "檸檬柚子千層蛋糕", "草莓莓果千層蛋糕"], desc: "層次與結構，適合需要清醒與比較的人。" },
    { title: "巴斯克系列", items: ["北海道經典巴斯克", "檸檬巴斯克", "鹹蛋黃巴斯克", "茶香巴斯克"], desc: "高濃度直達核心，安靜但有壓迫感。" },
    { title: "單品", items: ["經典烤布丁"], desc: "安全感錨點，最直接的安撫與回歸。" }
  ],
  drinks: [
    { title: "美式系", items: ["美式咖啡", "西西里美式", "日本柚子美式"] },
    { title: "拿鐵系", items: ["經典拿鐵", "烤布丁拿鐵", "抹茶拿鐵", "焙茶拿鐵"] },
    { title: "茶系", items: ["花草茶", "博士茶", "薄荷茶", "蕎麥茶"] }
  ]
};

const Result: React.FC<ResultProps> = ({ resultData, rawScores, onRetest }) => {
  const percentages = calculatePercentages(rawScores);
  const resultRef = useRef<HTMLDivElement>(null);
  const [selectedOtherType, setSelectedOtherType] = useState<MbtiResultData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAlt, setShowAlt] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const resultAT = percentages.A >= percentages.Turbulent ? 'A' : 'T';
  const identitySuffix = resultAT;
  const identityChinese = resultAT === 'A' ? '堅定型' : '動盪型';
  const anchor = SOUL_ANCHOR_MAP[resultData.id] || SOUL_ANCHOR_MAP["ISFP"];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowMenu(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  /* 
   * SAVE REPORT FUNCTIONALITY (Download as Image)
   */
  const handleSave = async () => {
    const element = document.getElementById('result-container');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true, // For external images
        backgroundColor: '#F9F7F5', // Match bg color
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `KIWIMU_MBTI_${resultData.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to save report:', err);
    }
  };

  /* 
   * DOWNLOAD IG STORY FUNCTIONALITY 
   */
  const handleDownloadIG = async () => {
    const element = document.getElementById('ig-story-container');
    if (!element) return;

    try {
      // Temporarily move into view but keep hidden visually if needed, 
      // or just render it off-screen which html2canvas supports.
      // But html2canvas requires the element to be in the DOM.
      // We already positioned it off-screen with transform.

      const canvas = await html2canvas(element, {
        scale: 1, // 1080x1920 is already large enough
        useCORS: true,
        backgroundColor: '#F9F7F5',
        windowWidth: 1080,
        windowHeight: 1920
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `KIWIMU_STORY_${resultData.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to save IG story:', err);
    }
  };

  return (
    <div className="min-h-screen bg-kiwi-bg pb-24 fade-in">
      <div ref={resultRef} className="bg-white">

        {/* 1. HEADER - 響應式字體與間距 */}
        <div className="w-full py-12 md:py-20 border-b border-gray-100 transition-colors duration-1000" style={{ backgroundColor: resultData.bgColor }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="border border-kiwi-dark px-4 py-1.5 mb-6 md:mb-8 inline-block bg-white shadow-sm">
              <p className="text-[10px] font-mono tracking-[0.2em] md:tracking-[0.4em] uppercase font-bold text-kiwi-dark">COMPREHENSIVE ANALYSIS 綜合分析</p>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-kiwi-dark tracking-tighter mb-2 md:mb-4 leading-none md:leading-tight">
              {resultData.id}
            </h1>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-kiwi-dark tracking-[0.15em] md:tracking-[0.2em] mb-6 md:mb-10 font-serif italic">{resultData.title}</h2>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-500 font-serif leading-relaxed italic max-w-2xl mx-auto px-4">「{resultData.quote.replace(/[「」]/g, '')}」</p>
          </div>
        </div>

        {/* 2. OVERVIEW - 響應式佈局 (Mobile: Column, Desktop: Row) */}
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 border-b border-gray-100 pb-12 md:pb-20">
            <div className="md:col-span-5">
              <div className="aspect-[3/4] bg-white relative overflow-hidden border border-gray-100 shadow-xl mx-auto max-w-sm md:max-w-none">
                <img src={resultData.characterImage} alt={resultData.id} className="w-full h-full object-cover" />
              </div>
              <div className="mt-6 md:mt-8 pt-6 border-t border-gray-100 flex justify-between items-end">
                <div className="space-y-1 text-left">
                  <p className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.3em] text-gray-300 uppercase font-mono">IDENTITY</p>
                  <p className="text-xs md:text-sm font-display font-bold text-kiwi-dark tracking-widest italic uppercase">{identityChinese} ({identitySuffix})</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.3em] text-gray-300 uppercase font-mono">TYPE</p>
                  <p className="text-xs md:text-sm font-display font-bold text-kiwi-dark tracking-widest italic uppercase">{resultData.id}-{identitySuffix}</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-7 flex flex-col justify-center text-left">
              <div className="mb-8 md:mb-10">
                <span className="text-[10px] font-bold tracking-[0.3em] md:tracking-[0.5em] border-b-2 border-kiwi-dark pb-2 mb-6 md:mb-8 inline-block uppercase text-gray-400 font-mono">CORE ESSENCE 核心本質</span>
                <p className="text-gray-800 leading-relaxed font-serif text-xl md:text-2xl lg:text-3xl font-medium text-justify md:text-left">{resultData.coreAnalysis}</p>
              </div>
              <div className="flex flex-wrap gap-3 md:gap-4">
                {resultData.keywords.map(k => (
                  <span key={k} className="px-4 py-1.5 md:px-5 border border-gray-200 text-gray-400 text-[10px] tracking-[0.2em] md:tracking-[0.4em] uppercase font-mono font-bold">{k}</span>
                ))}
              </div>
            </div>
          </div>

          {/* 3. COGNITIVE SPECTRUM - 優化手機版顯示 */}
          <div className="py-12 md:py-20 border-b border-gray-100">
            <h3 className="text-center text-lg md:text-xl font-display font-bold mb-12 md:mb-20 tracking-[0.3em] md:tracking-[0.4em] uppercase text-kiwi-dark">COGNITIVE SPECTRUM <br className="md:hidden" /> 認知光譜</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 md:gap-x-20 gap-y-12 md:gap-y-20">
              <SpectrumBar leftLabel="EXTROVERT (E)" rightLabel="INTROVERT (I)" leftScore={percentages.E} rightScore={percentages.I} leftDesc="在領導與開拓中獲取能量。" rightDesc="在深度反思中沈澱力量。" />
              <SpectrumBar leftLabel="SENSING (S)" rightLabel="INTUITION (N)" leftScore={percentages.S} rightScore={percentages.N} leftDesc="關注現實Facts與實務。" rightDesc="洞悉Pattern與未來機遇。" />
              <SpectrumBar leftLabel="THINKING (T)" rightLabel="FEELING (F)" leftScore={percentages.T} rightScore={percentages.F} leftDesc="極度理性與目標導向。" rightDesc="關注核心價值與感性連結。" />
              <SpectrumBar leftLabel="JUDGING (J)" rightLabel="PERCEIVING (P)" leftScore={percentages.J} rightScore={percentages.P} leftDesc="果斷決策，追求確定感。" rightDesc="靈活開放，擁抱彈性。" />
              <div className="md:col-span-2">
                <SpectrumBar leftLabel="ASSERTIVE (A)" rightLabel="TURBULENT (T)" leftScore={percentages.A} rightScore={percentages.Turbulent} leftDesc="自信穩定，心理韌性強。" rightDesc="精益求精，對環境高度敏感。" />
              </div>
            </div>
          </div>

          {/* 4. IDENTITY ANALYSIS (維度解析盒) - 響應式重構 */}
          <div className="py-16 md:py-24 border-b border-gray-100">
            <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start text-left">
              <div className="w-full md:w-1/3 border-l-4 border-kiwi-dark pl-6 md:pl-10 py-2">
                <h3 className="text-2xl md:text-3xl font-display font-bold tracking-widest uppercase mb-2">IDENTITY <br /> 維度解析</h3>
                <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-gray-400 mb-6 font-bold">THE 32ND VARIANCE</p>
                <span className="px-4 py-2 md:px-6 bg-kiwi-dark text-white text-[10px] md:text-[11px] font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase shadow-lg" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{identityChinese}</span>
              </div>
              <div className="w-full md:w-2/3">
                <h4 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold mb-6 md:mb-8 text-kiwi-dark">「銳敏、卓越與情緒能量」</h4>
                <p className="text-lg md:text-xl lg:text-2xl font-serif text-gray-700 leading-relaxed text-justify">
                  身為 <span className="font-bold border-b-2 border-kiwi-dark">{resultData.id}-{identitySuffix}</span>，你代表了極高的自我驅動力與特質。在你的世界裡，追求完美並非負擔，而是你與生俱來的使命。雖然你對環境的微小變化與他人的感受有著超乎常人的敏銳度，但也請記得，這種「高度敏感」正是你不斷進步的燃料，讓你在專業領域能達到令人難以企及的深度。
                </p>
              </div>
            </div>
          </div>

          {/* 5. GLOSSARY - 手機版優化 */}
          <div className="py-12 md:py-20 border-b border-gray-100 bg-gray-50/40">
            <h3 className="text-center text-xs md:text-sm font-display font-bold tracking-[0.2em] md:tracking-[0.3em] text-gray-400 uppercase mb-12 md:mb-20 font-bold">THEORETICAL FRAMEWORK & DEFINITIONS <br className="md:hidden" /> 詞彙表指南</h3>
            <div className="max-w-3xl mx-auto space-y-8 md:space-y-12">
              {DIMENSION_EXPLANATIONS.map(dim => (
                <div key={dim.key} className="flex flex-col md:flex-row gap-4 md:gap-10 text-left items-start group border-b border-gray-100/50 pb-8 md:pb-10 last:border-0">
                  <div className="w-full md:w-24 flex items-baseline md:block gap-3 md:gap-0">
                    <span className="text-3xl md:text-4xl font-display font-bold text-kiwi-dark transition-colors group-hover:text-gray-400">{dim.key}</span>
                    <span className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest mt-0 md:mt-2">{dim.label}</span>
                  </div>
                  <p className="flex-1 text-base md:text-lg text-gray-600 font-serif leading-relaxed text-justify opacity-80 group-hover:opacity-100 transition-opacity">{dim.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 6. LIFE INSIGHTS - 強制手機單欄 */}
          <div className="py-16 md:py-24 border-b border-gray-100">
            <h3 className="text-center text-[10px] md:text-[11px] font-bold tracking-[0.5em] md:tracking-[0.8em] text-gray-300 mb-12 md:mb-20 font-mono uppercase">LIFE INSIGHTS 生活洞見</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 text-left">
              <section>
                <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
                  <span className="text-4xl md:text-5xl font-display font-bold text-gray-100">01</span>
                  <div>
                    <h3 className="text-xl md:text-2xl font-display font-bold text-kiwi-dark tracking-widest uppercase">Career</h3>
                    <p className="text-[10px] font-mono font-bold text-gray-400 tracking-widest uppercase">職涯策略</p>
                  </div>
                </div>
                <div className="space-y-8 md:space-y-12">
                  <div className="border-l-2 border-kiwi-dark pl-6">
                    <h4 className="text-[10px] font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase text-gray-400 mb-4 font-mono">WORK STYLE</h4>
                    <p className="text-lg md:text-xl font-serif text-gray-800 leading-relaxed">{resultData.career.style}</p>
                  </div>
                  <div className="border-l-2 border-kiwi-dark pl-6">
                    <h4 className="text-[10px] font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase text-gray-400 mb-4 font-mono">STRATEGIC ADVICE</h4>
                    <p className="text-lg md:text-xl font-serif text-gray-600 leading-relaxed italic">{resultData.career.advice}</p>
                  </div>
                </div>
              </section>
              <section>
                <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
                  <span className="text-4xl md:text-5xl font-display font-bold text-gray-100">02</span>
                  <div>
                    <h3 className="text-xl md:text-2xl font-display font-bold text-kiwi-dark tracking-widest uppercase">Relationships</h3>
                    <p className="text-[10px] font-mono font-bold text-gray-400 tracking-widest uppercase">關係哲學</p>
                  </div>
                </div>
                <div className="space-y-8 md:space-y-12">
                  <div className="border-l-2 border-kiwi-dark pl-6">
                    <h4 className="text-[10px] font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase text-gray-400 mb-4 font-mono">LOVE PHILOSOPHY</h4>
                    <p className="text-lg md:text-xl font-serif text-gray-800 leading-relaxed">{resultData.relationships.style}</p>
                  </div>
                  <div className="border-l-2 border-kiwi-dark pl-6">
                    <h4 className="text-[10px] font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase text-gray-400 mb-4 font-mono">NAVIGATIONAL ADVICE</h4>
                    <p className="text-lg md:text-xl font-serif text-gray-600 leading-relaxed italic">{resultData.relationships.advice}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* 7. RELATIONSHIP NAVIGATION - 響應式 Box */}
          <div className="py-16 md:py-24 border-b border-gray-100">
            <h3 className="text-center text-[10px] md:text-[11px] font-bold tracking-[0.5em] md:tracking-[0.6em] uppercase text-gray-400 mb-12 md:mb-16 font-mono">RELATIONSHIP NAVIGATION <br className="md:hidden" /> 人際導航</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-black overflow-hidden shadow-xl text-left">
              <div className="bg-white p-8 md:p-14 lg:p-20 border-b md:border-b-0 md:border-r border-black">
                <h4 className="font-bold text-[10px] tracking-[0.3em] md:tracking-[0.5em] uppercase mb-6 md:mb-10 text-kiwi-dark font-mono">SUPERPOWER 關係強項</h4>
                <p className="text-gray-800 text-lg md:text-xl font-serif leading-relaxed">{resultData.relationships.strengths}</p>
              </div>
              <div className="bg-kiwi-dark text-white p-8 md:p-14 lg:p-20">
                <h4 className="font-bold text-[10px] tracking-[0.3em] md:tracking-[0.5em] uppercase mb-6 md:mb-10 text-gray-400 font-mono">GROWTH AREA 關係盲點與建議</h4>
                <p className="text-gray-100 text-lg md:text-xl font-serif leading-relaxed" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{resultData.relationships.advice}</p>
              </div>
            </div>
          </div>

          {/* 8. SOUL REFLECTION - 響應式字體 */}
          <div className="py-16 md:py-24 border-b border-gray-100 bg-gray-50/20">
            <h3 className="text-center text-[10px] md:text-[11px] font-bold tracking-[0.5em] md:tracking-[0.6em] uppercase text-gray-400 mb-16 md:mb-24 font-mono">SOUL REFLECTION 靈魂拷問</h3>
            <div className="space-y-8 md:space-y-12 max-w-3xl mx-auto px-0 md:px-4">
              {resultData.soulQuestions.map((q, idx) => (
                <div key={idx} className="bg-white border border-gray-100 p-8 md:p-12 text-center group transition-all duration-700 hover:bg-kiwi-dark hover:text-white hover:shadow-xl">
                  <span className="text-4xl md:text-5xl font-display font-bold text-gray-100 group-hover:text-white/20 transition-colors block mb-4 md:mb-6">0{idx + 1}</span>
                  <p className="text-xl md:text-2xl lg:text-3xl font-serif leading-relaxed italic px-2 md:px-6">{q}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 9. STRENGTHS & BLIND SPOTS - 手機單欄 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 py-16 md:py-24 border-b border-gray-100 text-left px-0 md:px-4">
            <div>
              <h4 className="text-2xl md:text-3xl font-serif font-bold text-kiwi-dark mb-8 md:mb-10 border-l-8 border-kiwi-dark pl-6">STRENGTHS 優勢</h4>
              <ul className="space-y-4 md:space-y-6">
                {resultData.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-4 text-gray-700 font-serif">
                    <span className="text-[11px] font-mono text-gray-300 font-bold mt-1">0{i + 1}.</span>
                    <span className="text-lg md:text-xl lg:text-2xl leading-snug">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-2xl md:text-3xl font-serif font-bold text-gray-400 mb-8 md:mb-10 border-l-8 border-gray-100 pl-6">BLIND SPOTS 盲點</h4>
              <ul className="space-y-4 md:space-y-6">
                {resultData.blindSpots.map((s, i) => (
                  <li key={i} className="flex items-start gap-4 text-gray-400 font-serif opacity-60">
                    <span className="text-[11px] font-mono text-gray-200 font-bold mt-1">0{i + 1}.</span>
                    <span className="text-lg md:text-xl lg:text-2xl leading-snug">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 10. QUOTE */}
          <div className="py-24 md:py-40 text-center">
            <div className="text-gray-100 text-[100px] md:text-[180px] font-display opacity-40 mb-[-40px] md:mb-[-90px] select-none font-bold">“</div>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold text-kiwi-dark leading-snug italic max-w-4xl mx-auto px-6 relative z-10">
              越是深刻地理解自己，越能溫柔地擁抱世界。
            </h2>
          </div>

          {/* 11. SOUL DESSERT HEART ANCHOR MODULE - 重寫 CSS 使其完整響應 */}
          <div className="soul-module mb-32 md:mb-48 px-0 md:px-12">
            <style>{`
                .soul-card { border: 1px solid #121212; display: flex; flex-direction: column; background: #fff; padding: 0; position: relative; }
                @media (min-width: 768px) { .soul-card { flex-direction: row; } }
                
                .soul-img-box { width: 100%; min-height: 250px; background: #f9f9f9; overflow: hidden; }
                @media (min-width: 768px) { .soul-img-box { flex: 1; min-height: 400px; } }
                
                .soul-img-box img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s ease; }
                .soul-img-box:hover img { transform: scale(1.05); }
                
                .soul-info-box { width: 100%; padding: 30px; display: flex; flex-direction: column; justify-content: center; text-align: left; }
                @media (min-width: 768px) { .soul-info-box { flex: 1.3; padding: 50px; } }
                
                .soul-label { font-family: 'Noto Sans TC', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.3em; color: #999; text-transform: uppercase; margin-bottom: 12px; }
                
                .soul-name { font-family: 'Noto Serif TC', serif; font-size: 32px; font-weight: 700; color: #121212; margin-bottom: 15px; line-height: 1.1; }
                @media (min-width: 768px) { .soul-name { font-size: 42px; } }
                
                .soul-hook { font-family: 'Noto Serif TC', serif; font-size: 16px; line-height: 1.8; color: #444; margin-bottom: 25px; text-justify: inter-word; }
                @media (min-width: 768px) { .soul-hook { font-size: 18px; } }
                
                .soul-chips { display: flex; gap: 8px; margin-bottom: 30px; flex-wrap: wrap; }
                .soul-chip { border: 1px solid #eee; padding: 4px 12px; font-size: 9px; font-weight: 700; color: #888; letter-spacing: 0.1em; border-radius: 2px; }
                
                .soul-drink-section { border-top: 1px solid #f5f5f5; padding-top: 25px; }
                .soul-drink-label { font-size: 9px; font-weight: 700; color: #ccc; margin-bottom: 15px; tracking: 0.2em; uppercase; }
                
                .soul-drink-row { display: flex; flex-direction: column; font-size: 13px; margin-bottom: 8px; color: #aaa; padding: 8px 0; transition: all 0.3s; }
                @media (min-width: 500px) { .soul-drink-row { flex-direction: row; justify-content: space-between; font-size: 14px; padding: 10px 0; } }
                
                .soul-drink-row.active { color: #121212; font-weight: 700; border-l-4 border-kiwi-dark pl-4 bg-gray-50; }
                
                .soul-btns { margin-top: 35px; display: flex; flex-direction: column; gap: 15px; }
                @media (min-width: 500px) { .soul-btns { flex-direction: row; gap: 20px; } }
                
                .soul-btn { flex: 1; border: 1px solid #121212; background: none; padding: 14px; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; transition: all 0.3s; text-align: center; }
                @media (min-width: 768px) { .soul-btn { padding: 16px; font-size: 11px; letter-spacing: 0.3em; } }
                
                .soul-btn:hover { background: #121212; color: #fff; }
                .soul-btn-black { background: #121212; color: #fff; }
                
                .soul-alt-box { border-top: 1px solid #f0f0f0; margin-top: 0px; background: #fff; padding: 30px; }
                @media (min-width: 768px) { .soul-alt-box { padding: 50px; } }
              `}</style>

            <div className="soul-card shadow-2xl overflow-hidden">
              <div className="soul-img-box">
                <img src={resultData.dessert.imageUrl} alt="Soul Dessert" />
              </div>
              <div className="soul-info-box">
                <span className="soul-label">SOUL DESSERT 靈魂甜點</span>
                <h3 className="soul-name">{anchor.name}</h3>
                <p className="soul-hook">{anchor.hook}</p>
                <div className="soul-chips">
                  <span className="soul-chip">系列：{anchor.series}</span>
                  <span className="soul-chip">象限：{anchor.quad}</span>
                </div>
                <div className="soul-drink-section">
                  <p className="soul-drink-label">你的狀態加成飲品推薦</p>
                  <div className={`soul-drink-row ${resultAT === 'A' ? 'active' : ''}`}>
                    <span className="tracking-widest">A（穩定型）最佳推薦</span>
                    <span className="font-serif italic mt-1 md:mt-0">{anchor.drinkA}</span>
                  </div>
                  <div className={`soul-drink-row ${resultAT === 'T' ? 'active' : ''}`}>
                    <span className="tracking-widest">T（敏感型）最佳推薦</span>
                    <span className="font-serif italic mt-1 md:mt-0">{anchor.drinkT}</span>
                  </div>
                </div>
                <div className="soul-btns">
                  <a href="https://lin.ee/r19wTnY" target="_blank" rel="noopener noreferrer" className="soul-btn" style={{ backgroundColor: '#06C755', color: 'white', border: '1px solid #06C755' }}>跟 KIWIMU 當朋友，抽幸運甜點</a>
                  <button className="soul-btn" onClick={() => setShowAlt(!showAlt)}>{showAlt ? '收起建議' : '同象限替換'}</button>
                  <button className="soul-btn soul-btn-black" onClick={() => setShowMenu(true)}>完整菜單</button>
                </div>
              </div>
            </div>

            {showAlt && (
              <div className="soul-alt-box border-x border-b border-black fade-in text-left">
                <p className="text-[10px] font-mono tracking-[0.3em] md:tracking-[0.4em] uppercase text-gray-300 mb-6 md:mb-8 font-bold">Alternative Selection 替換建議（同系同象限）</p>
                <div className="flex flex-col md:flex-row gap-8 md:gap-10">
                  {anchor.alt.map((item: string) => (
                    <div key={item} className="flex flex-col">
                      <span className="font-serif text-xl md:text-2xl text-kiwi-dark font-bold border-b-2 border-kiwi-dark pb-2 mb-2">{item}</span>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest">OPTIMAL MATCH</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODAL MENU - 全螢幕響應式 */}
            {showMenu && (
              <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4 md:p-16 transition-all fade-in" onClick={() => setShowMenu(false)}>
                <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-16 relative rounded-sm shadow-2xl border border-white/20" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowMenu(false)} className="sticky top-0 right-0 float-right ml-4 text-4xl md:text-5xl font-light hover:rotate-90 transition-transform duration-300 z-50">&times;</button>
                  <div className="mb-8 md:mb-12 mt-4 md:mt-0">
                    <h3 className="font-display text-3xl md:text-5xl font-bold mb-4 tracking-tighter">THE FULL MENU</h3>
                    <p className="text-gray-400 text-[10px] md:text-[11px] tracking-[0.3em] md:tracking-[0.4em] uppercase font-bold border-b border-gray-100 pb-4">把人格解析轉化為一份靈魂心錨</p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-mono font-bold text-kiwi-dark tracking-widest uppercase mb-6 bg-gray-50 px-4 py-2">Desserts 甜點類別</p>
                    {MENU_DATA.desserts.map(cat => (
                      <div key={cat.title} className="border-b border-gray-100 last:border-0">
                        <button className="w-full text-left py-4 md:py-6 font-serif text-xl md:text-2xl font-bold flex justify-between items-center group" onClick={() => setOpenAccordion(openAccordion === cat.title ? null : cat.title)}>
                          <span className="group-hover:pl-4 transition-all duration-300">{cat.title}</span>
                          <span className="font-light text-2xl md:text-3xl">{openAccordion === cat.title ? '−' : '+'}</span>
                        </button>
                        {openAccordion === cat.title && (
                          <div className="pb-8 md:pb-10 space-y-6 fade-in px-2 md:px-4">
                            <p className="text-xs md:text-sm italic text-gray-400 mb-6 border-l-4 border-kiwi-dark pl-4 md:pl-6 leading-relaxed">{cat.desc}</p>
                            <div className="grid gap-3 md:gap-4">
                              {cat.items.map(i => (
                                <div key={i} className="flex justify-between items-center text-lg md:text-xl font-serif border-b border-gray-50 pb-2">
                                  <span>{i}</span>
                                  <span className="text-[9px] font-mono text-gray-300 tracking-widest hidden md:inline">AVAILABLE</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <p className="text-[10px] font-mono font-bold text-kiwi-dark tracking-widest uppercase mb-6 bg-gray-50 px-4 py-2 mt-8 md:mt-12">Drinks 飲品類別</p>
                    {MENU_DATA.drinks.map(cat => (
                      <div key={cat.title} className="border-b border-gray-100 last:border-0">
                        <button className="w-full text-left py-4 md:py-6 font-serif text-xl md:text-2xl font-bold flex justify-between items-center group" onClick={() => setOpenAccordion(openAccordion === cat.title ? null : cat.title)}>
                          <span className="group-hover:pl-4 transition-all duration-300">{cat.title}</span>
                          <span className="font-light text-2xl md:text-3xl">{openAccordion === cat.title ? '−' : '+'}</span>
                        </button>
                        {openAccordion === cat.title && (
                          <div className="pb-8 md:pb-10 space-y-6 fade-in px-2 md:px-4">
                            <div className="grid gap-3 md:gap-4">
                              {cat.items.map(i => (
                                <div key={i} className="flex justify-between items-center text-lg md:text-xl font-serif border-b border-gray-50 pb-2">
                                  <span>{i}</span>
                                  <span className="text-[9px] font-mono text-gray-300 tracking-widest hidden md:inline">CRAFTED</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 12. ARCHIVE - 2 columns on mobile, 4 on desktop */}
          <div className="border-t border-gray-100 pt-20 md:pt-32">
            <h3 className="text-center text-[10px] md:text-[11px] font-bold tracking-[0.6em] md:tracking-[0.8em] uppercase mb-20 md:mb-32 text-gray-300 font-mono">PERSONALITY ARCHIVE <br className="md:hidden" /> 深度檔案館</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12 mb-20 md:mb-32">
              {ALL_TYPES.map(type => {
                const data = getResultData(type);
                return (
                  <button key={type} onClick={() => setSelectedOtherType(data)} className="group flex flex-col text-left transition-all duration-700 bg-white p-3 md:p-6 hover:shadow-2xl border border-gray-100 relative hover:-translate-y-2">
                    <div className="w-full aspect-square overflow-hidden bg-gray-50 mb-4 md:mb-8 border border-gray-100 shadow-sm relative">
                      <img src={data.characterImage} alt={type} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                      {/* Overlay for aesthetic */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-baseline mb-1 md:mb-2">
                      <span className="font-display font-bold text-xl md:text-3xl text-kiwi-dark">{type}</span>
                      <span className="text-[8px] md:text-[9px] font-mono text-gray-300 uppercase tracking-widest font-bold group-hover:text-black transition-colors hidden md:inline">INSPECT</span>
                    </div>
                    <span className="text-xs md:text-sm font-serif text-gray-500 italic font-medium truncate w-full">{data.title}</span>
                    <p className="mt-2 md:mt-4 text-[10px] md:text-[11px] text-gray-400 line-clamp-2 leading-relaxed opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden md:block">{data.summary}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DISCLAIMER & FOOTER */}
          <div className="text-center max-w-2xl mx-auto py-16 md:py-24 border-t border-gray-100 px-6">
            <p className="text-[10px] md:text-[11px] font-mono text-gray-300 tracking-[0.4em] md:tracking-[0.5em] uppercase mb-6 font-bold">DISCLAIMER 免責聲明</p>
            <p className="text-[11px] md:text-[12px] text-gray-300 leading-loose">此測驗結果僅供自我觀察參考。人格具有高度流動性，你的結果可能會隨著環境、心理發展與生命階段而有所變化。請將此報告視為探索之旅的微光，而非絕對的枷鎖。</p>
          </div>

          <div className="flex flex-col items-center py-12 md:py-20">
            <a href="https://linktr.ee/moon_moon_dessert" target="_blank" rel="noopener noreferrer" className="group relative w-16 h-16 md:w-20 md:h-20 mb-8 md:mb-10 rounded-full overflow-hidden border border-gray-100 shadow-2xl hover:scale-110 transition-all duration-500">
              <img src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3N2cW13djJidTVwZ2YxdnlrcHRwZGFuNmExdGZnbDN4eW85YXZiaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LTRNEJfeVV17OTUEGF/giphy.gif" alt="Logo" className="w-full h-full object-cover" />
            </a>
            <p className="text-[9px] md:text-[10px] text-gray-300 tracking-[0.4em] md:tracking-[0.6em] uppercase font-mono font-bold">KIWIMU MBTI LAB V2 © 2024</p>
          </div>
        </div>
      </div>

      {/* Floating Menu - Mobile responsive */}
      <div className="fixed bottom-8 md:bottom-12 left-1/2 transform -translate-x-1/2 bg-black/95 text-white p-2 md:p-3 rounded-full shadow-2xl flex items-center gap-2 md:gap-3 z-50 max-w-[90vw] overflow-x-hidden border border-white/10 backdrop-blur-xl">
        <a href="https://lin.ee/r19wTnY" target="_blank" rel="noopener noreferrer" className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-[#06C755] hover:bg-[#05b34c] transition-colors border border-white/20">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6"><path d="M12 2C6.48 2 2 5.92 2 10.75c0 3.39 2.21 6.36 5.56 7.82-.16.63-.58 2.24-.66 2.65-.12.65.26 1.07 1 1.07.39 0 .86-.17 3.5-3.04.83.1 1.68.16 2.55.16 5.52 0 10-3.92 10-8.75S19.52 2 12 2zm1.09 11h-2.18c-.28 0-.5-.22-.5-.5v-1.63H8.78c-.28 0-.5-.22-.5-.5V8.87c0-.28.22-.5.5-.5h4.31c.28 0 .5.22.5.5v1.63h1.63c.28 0 .5.22.5.5v1.62c0 .28-.22.5-.5.5z" /></svg>
        </a>
        <div className="w-[1px] h-4 md:h-6 bg-white/20"></div>
        <button onClick={onRetest} className="px-5 md:px-8 py-2 md:py-3 rounded-full hover:bg-gray-800 transition-colors text-[10px] md:text-[11px] font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase whitespace-nowrap">Retest 重測</button>
        <div className="w-[1px] h-4 md:h-6 bg-white/20"></div>
        <button onClick={handleSave} className="px-6 md:px-10 py-2 md:py-3 rounded-full bg-white text-black hover:bg-gray-100 text-[10px] md:text-[11px] font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase shadow-lg transition-transform active:scale-95 whitespace-nowrap">Save Report 保存</button>
        <div className="w-[1px] h-4 md:h-6 bg-white/20"></div>
        <button onClick={handleDownloadIG} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-pink-500 hover:bg-pink-600 transition-colors text-white border border-white/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
        </button>
      </div>

      {/* HIDDEN IG STORY CONTAINER (1080x1920) */}
      <div
        id="ig-story-container"
        className="fixed top-0 left-0 -z-50 bg-[#F9F7F5] flex flex-col items-center justify-between p-[120px] text-center"
        style={{ width: '1080px', height: '1920px', transform: 'translateX(-9999px)' }}
      >
        {/* Header */}
        <div className="flex flex-col items-center w-full">
          <p className="text-[32px] font-mono tracking-[0.4em] uppercase text-gray-400 mb-8 font-bold">KIWIMU MBTI LAB</p>
          <div className="w-[80px] h-[2px] bg-black mb-16"></div>
          <h1 className="text-[140px] font-display font-bold text-kiwi-dark leading-none tracking-tighter mb-4">{resultData.id}</h1>
          <p className="text-[40px] font-serif italic text-gray-500">{resultData.title}</p>
        </div>

        {/* Main Visual (Icon/Image) */}
        <div className="w-[800px] h-[800px] relative">
          <div className="absolute inset-0 border-[3px] border-black/10 rounded-full animate-pulse-slow"></div>
          <img src={resultData.characterImage} alt={resultData.id} className="w-full h-full object-contain drop-shadow-2xl" />
        </div>

        {/* Description */}
        <div className="w-full max-w-[800px] mb-20 bg-white p-12 shadow-xl border border-gray-100 rounded-3xl relative">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white px-8 py-2 text-[24px] font-mono font-bold tracking-widest uppercase rounded-full">Characteristics</div>
          <p className="text-[42px] leading-snug font-serif text-gray-800 font-medium">
            {resultData.quote}
          </p>
        </div>

        {/* Footer */}
        <div className="mb-20">
          <div className="flex items-center gap-4 justify-center mb-6">
            <span className="text-[32px] font-bold text-kiwi-dark">KIWIMU</span>
            <span className="text-[32px] text-gray-400">×</span>
            <span className="text-[32px] font-bold text-kiwi-dark">DESSERT</span>
          </div>
          <p className="text-[28px] text-gray-400 font-mono tracking-widest">www.kiwimutaiwan.com</p>
        </div>
      </div>

      {/* MODAL ARCHIVE (Fully Responsive) */}
      {selectedOtherType && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/95 p-0 md:p-8 fade-in" onClick={() => setSelectedOtherType(null)}>
          <div className="w-full md:max-w-4xl h-[90vh] md:h-auto md:max-h-[85vh] overflow-y-auto bg-white flex flex-col md:flex-row relative slide-up shadow-2xl rounded-t-2xl md:rounded-sm" onClick={e => e.stopPropagation()}>

            {/* Close Button */}
            <button
              onClick={() => setSelectedOtherType(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-black z-20 hover:rotate-90 transition-all duration-300 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-black hover:text-white shadow-lg"
            >
              <span className="text-xl md:text-2xl font-light">&times;</span>
            </button>

            {/* Left: Compact Image Column */}
            <div className="w-full md:w-1/3 bg-gray-50 relative group h-[200px] md:h-auto shrink-0">
              <img src={selectedOtherType.characterImage} className="w-full h-full object-cover absolute inset-0" alt={selectedOtherType.id} />
              <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tighter">{selectedOtherType.id}</h3>
                <p className="text-white/80 text-[10px] md:text-xs font-serif italic mt-1">{selectedOtherType.title}</p>
              </div>
            </div>

            {/* Right: Content Column */}
            <div className="w-full md:w-2/3 p-6 md:p-12 text-kiwi-dark text-left overflow-y-auto">
              <div className="mb-6 md:mb-8 pb-6 md:pb-8 border-b border-gray-100">
                <div className="border border-kiwi-dark/20 px-3 py-1 inline-block mb-4 md:mb-6 bg-white shadow-sm">
                  <p className="text-[8px] md:text-[9px] font-mono tracking-[0.3em] uppercase font-bold text-gray-500">ARCHIVE DATA</p>
                </div>
                <h4 className="text-xl md:text-3xl font-serif font-bold text-gray-800 leading-snug mb-3 md:mb-4">
                  {selectedOtherType.summary}
                </h4>
                <p className="text-sm md:text-base text-gray-500 font-serif italic">
                  {selectedOtherType.quote}
                </p>
              </div>

              <div className="space-y-6 md:space-y-8">
                <div>
                  <span className="block text-[8px] md:text-[9px] font-mono tracking-[0.3em] uppercase text-gray-400 mb-2 md:mb-3 font-bold">CORE ANALYSIS</span>
                  <p className="text-gray-700 leading-relaxed font-serif text-sm md:text-base text-justify">
                    {selectedOtherType.coreAnalysis}
                  </p>
                </div>

                <div>
                  <span className="block text-[8px] md:text-[9px] font-mono tracking-[0.3em] uppercase text-gray-400 mb-2 md:mb-3 font-bold">KEYWORDS</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedOtherType.keywords.map(k => (
                      <span key={k} className="px-2 md:px-3 py-1 bg-gray-50 text-gray-500 text-[9px] md:text-[10px] tracking-widest font-bold uppercase">{k}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-6 pt-2 md:pt-4">
                  <div>
                    <span className="block text-[8px] md:text-[9px] font-mono tracking-[0.2em] uppercase text-gray-300 mb-1 md:mb-2 font-bold">WORK</span>
                    <p className="text-[11px] md:text-xs text-gray-600 leading-relaxed">{selectedOtherType.career.style}</p>
                  </div>
                  <div>
                    <span className="block text-[8px] md:text-[9px] font-mono tracking-[0.2em] uppercase text-gray-300 mb-1 md:mb-2 font-bold">LOVE</span>
                    <p className="text-[11px] md:text-xs text-gray-600 leading-relaxed">{selectedOtherType.relationships.style}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SpectrumBar = ({ leftLabel, rightLabel, leftScore, rightScore, leftDesc, rightDesc }: any) => (
  <div className="mb-8 md:mb-12 border-b border-gray-200 pb-8 md:pb-12 last:border-0 text-left">
    <div className="flex justify-between items-baseline mb-3 md:mb-4">
      <span className="text-[10px] md:text-xs tracking-[0.15em] uppercase text-black font-bold">{leftLabel}</span>
      <span className="text-[10px] md:text-xs tracking-[0.15em] uppercase text-black font-bold">{rightLabel}</span>
    </div>
    <div className="relative h-[2px] bg-gray-200 w-full mb-4 md:mb-6 overflow-hidden">
      <div className="absolute top-0 left-0 h-full bg-black transition-all duration-[1.5s] ease-out" style={{ width: `${leftScore}%` }} />
      <div className="absolute top-1/2 -mt-1 w-2 h-2 bg-black rounded-full z-10" style={{ left: `calc(${leftScore}% - 4px)` }}></div>
    </div>
    <div className="flex justify-between items-center mb-4 md:mb-6 font-serif">
      <div className="text-3xl md:text-5xl font-bold text-black tracking-tighter">{leftScore}<span className="text-sm md:text-lg font-normal text-black font-sans ml-1">%</span></div>
      <div className="text-3xl md:text-5xl font-bold text-black text-right tracking-tighter">{rightScore}<span className="text-sm md:text-lg font-normal text-black font-sans ml-1">%</span></div>
    </div>
    <div className="flex justify-between text-[10px] text-black font-mono tracking-[0.1em] font-medium uppercase">
      <p className="max-w-[140px] md:max-w-[180px] leading-relaxed">{leftDesc}</p>
      <p className="max-w-[140px] md:max-w-[180px] text-right leading-relaxed">{rightDesc}</p>
    </div>
  </div>
);

export default Result;
