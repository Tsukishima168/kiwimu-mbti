import React from 'react';

interface RecommendationEntry {
  flavor: string;
  reason: string;
}

interface ResultRecommendationProps {
  resultType: string;
  lineUrl: string;
  onCtaClick?: () => void;
}

const RECOMMENDATION_MAP: Record<string, RecommendationEntry> = {
  INTJ: { flavor: '深焙可可', reason: '你偏好結構清晰、濃度分明的體驗，這種收斂卻有深度的風味很貼近你的節奏。' },
  INTP: { flavor: '柚香奶霜', reason: '你需要一點跳脫常規的清亮感，讓思緒在複雜推演之間仍保有空氣與餘韻。' },
  ENTJ: { flavor: '酒香摩卡', reason: '俐落的苦甜對比和強烈存在感，適合你這種總想把局勢掌握在手中的人格。' },
  ENTP: { flavor: '辛香柑橘', reason: '你適合帶有反差與驚喜的味道，因為你最有魅力的地方就是不按牌理出牌。' },
  INFJ: { flavor: '焙茶雲霧', reason: '安靜、內斂又有層次的茶感，能接住你細膩而深邃的內在世界。' },
  INFP: { flavor: '蜂蜜香草', reason: '柔軟、溫暖又帶一點夢感的甜度，最適合你這種把感受活得很真的人格。' },
  ENFJ: { flavor: '檸光奶油', reason: '明亮的果香和溫柔的包覆感，很像你總能把能量帶給別人的方式。' },
  ENFP: { flavor: '莓果氣泡', reason: '自由、活潑又帶靈感爆發感的口味，很適合你跳躍又有感染力的節奏。' },
  ISTJ: { flavor: '經典原味', reason: '你重視可靠與穩定，越是簡潔純粹的風味，越能凸顯你真正的品味。' },
  ISFJ: { flavor: '焦糖布丁', reason: '你給人的安全感需要被溫柔回應，這種熟悉又安定的口味最能接住你。' },
  ESTJ: { flavor: '鹽焙焦糖', reason: '扎實、明確、有力量的味道，很適合你這種做事直接而有主導性的性格。' },
  ESFJ: { flavor: '莓果鮮奶', reason: '親和、討喜又容易被喜歡的風味，和你總想照顧大家的氣質很一致。' },
  ISTP: { flavor: '黑咖提拉', reason: '乾淨、俐落、功能感強的苦甜平衡，符合你偏好的低噪音高效率。' },
  ISFP: { flavor: '抹茶絲絨', reason: '細膩的香氣與慢慢回甘的尾韻，很像你安靜但很有審美堅持的感受方式。' },
  ESTP: { flavor: '濃巧脆片', reason: '直接、強烈、感官先行的風味，最適合你說來就來的生命力。' },
  ESFP: { flavor: '熱帶水果', reason: '鮮明、開心、存在感很高的口味，就像你總能把現場氣氛點亮。' },
};

const FALLBACK_RECOMMENDATION: RecommendationEntry = {
  flavor: '經典奶霜',
  reason: '這是一版暫定推薦，先用來串起結果頁到底部 CTA 的導流路徑。',
};

const ResultRecommendation: React.FC<ResultRecommendationProps> = ({
  resultType,
  lineUrl,
  onCtaClick,
}) => {
  const recommendation = RECOMMENDATION_MAP[resultType] || FALLBACK_RECOMMENDATION;

  return (
    <section className="max-w-5xl mx-auto px-6 py-20 md:py-24 border-t border-gray-100">
      <div className="border border-kiwi-dark bg-[#fbfbf8] shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr]">
          <div className="p-8 md:p-12 lg:p-14 text-left">
            <p className="text-[10px] md:text-[11px] font-mono text-gray-400 tracking-[0.35em] uppercase mb-4 font-bold">
              KIWIMU DESSERT MATCH
            </p>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-kiwi-dark tracking-tight mb-5">
              你的 Kiwimu 專屬甜點
            </h3>
            <div className="inline-flex items-center border border-kiwi-dark px-4 py-2 mb-6 bg-white">
              <span className="text-[11px] md:text-xs font-mono tracking-[0.2em] uppercase text-gray-500 mr-3">
                {resultType}
              </span>
              <span className="text-lg md:text-xl font-serif font-bold text-kiwi-dark">
                {recommendation.flavor}
              </span>
            </div>
            <p className="text-base md:text-lg text-gray-700 font-serif leading-8 mb-8 max-w-2xl">
              {recommendation.reason}
            </p>
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onCtaClick}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-3 px-6 py-4 bg-[#06C755] text-white text-sm md:text-base font-bold tracking-[0.08em] rounded-full transition-all hover:opacity-90 active:scale-[0.99]"
            >
              <span>嚐嚐看</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-gray-200 bg-white p-8 md:p-10 flex flex-col justify-center">
            <p className="text-[10px] md:text-[11px] font-mono text-gray-300 tracking-[0.3em] uppercase mb-4 font-bold">
              WHY THIS MATCH
            </p>
            <p className="text-xl md:text-2xl font-serif font-bold text-kiwi-dark leading-relaxed mb-4">
              先用一個口味，替你的測驗結果留下一個可被帶走的記憶點。
            </p>
            <p className="text-sm md:text-base text-gray-500 leading-7 font-serif">
              這個區塊目前使用暫定口味對應，之後可直接替換成你提供的 16 型正式對應表，不需再改結果頁結構。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResultRecommendation;
