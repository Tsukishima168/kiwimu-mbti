import React from 'react';
import { buildDessertOrderLink, buildMoonMapLink, buildPassportLink, trackOutboundClick } from '../utils/utmTracking';

interface ExploreMoreProps {
  mbtiType?: string;
  variant?: string;
  passportClaimUrl?: string | null;
}

export const ExploreMore: React.FC<ExploreMoreProps> = ({ mbtiType, variant, passportClaimUrl }) => {
  const products = [
    {
      id: 'dessert-booking',
      number: '01',
      title: '訂購靈魂甜點',
      subtitle: 'ORDER DESSERT',
      description: '線上預訂你的專屬甜點，到店取貨享受美味',
      url: mbtiType ? buildDessertOrderLink(mbtiType, variant || 'A') : 'https://dessert-booking.vercel.app',
      onClick: () => trackOutboundClick('DESSERT_BOOKING', 'navigation', { section: 'explore-more', mbti_type: mbtiType })
    },
    {
      id: 'passport',
      number: '02',
      title: passportClaimUrl ? '領取護照印章' : '甜點護照測驗',
      subtitle: passportClaimUrl ? 'PASSPORT STAMP' : 'PASSPORT QUIZ',
      description: passportClaimUrl
        ? '完成 MBTI 後可直接領取護照印章'
        : '趣味測驗找到你的專屬角色貼紙與幸運甜點',
      url: passportClaimUrl || buildPassportLink(),
      onClick: () =>
        trackOutboundClick('PASSPORT', 'navigation', {
          section: 'explore-more',
          claim_ready: Boolean(passportClaimUrl)
        })
    },
    {
      id: 'moon-map',
      number: '03',
      title: '月島導覽地圖',
      subtitle: 'ISLAND MAP',
      description: '探索 Moon Moon 品牌生態，發現完整的島嶼世界',
      url: mbtiType ? buildMoonMapLink(mbtiType) : 'https://moon-map-original.vercel.app',
      onClick: () => trackOutboundClick('MOON_MAP', 'navigation', { section: 'explore-more', mbti_type: mbtiType })
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-20 md:py-32 border-t border-gray-100">
      {/* Header - Minimal */}
      <div className="mb-16 md:mb-24">
        <p className="text-[9px] md:text-[10px] font-mono text-gray-300 tracking-[0.5em] md:tracking-[0.6em] uppercase mb-2 font-bold text-center">
          NEXT JOURNEY
        </p>
        <div className="w-16 h-[1px] bg-kiwi-dark mx-auto"></div>
      </div>

      {/* Products Grid - Minimalist Black & White */}
      <div className="space-y-0">
        {products.map((product, index) => (
          <a
            key={product.id}
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={product.onClick}
            className="group block border-b border-gray-100 last:border-b-0 py-10 md:py-14 transition-all hover:bg-gray-50"
          >
            <div className="flex items-start justify-between gap-6 md:gap-12">
              {/* Left: Number */}
              <div className="flex-shrink-0">
                <span className="text-5xl md:text-7xl font-display font-bold text-gray-100 group-hover:text-kiwi-dark transition-colors duration-500">
                  {product.number}
                </span>
              </div>

              {/* Middle: Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[9px] md:text-[10px] font-mono text-gray-400 tracking-[0.3em] uppercase mb-3 font-bold">
                  {product.subtitle}
                </p>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-kiwi-dark mb-3 md:mb-4 group-hover:text-black transition-colors">
                  {product.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed font-serif max-w-2xl">
                  {product.description}
                </p>
              </div>

              {/* Right: Arrow */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="32" 
                  height="32" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="text-kiwi-dark transform group-hover:translate-x-2 transition-transform duration-300"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Bottom CTA - Minimal */}
      <div className="mt-20 md:mt-32 pt-12 md:pt-16 border-t border-gray-100 text-center">
        <p className="text-xs md:text-sm text-gray-500 font-serif mb-6">
          Stay connected
        </p>
        <div className="flex items-center justify-center gap-6">
          <a
            href="https://lin.ee/r19wTnY"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] md:text-[11px] font-mono text-gray-600 hover:text-kiwi-dark tracking-wider uppercase font-bold transition-colors underline underline-offset-4"
            onClick={() => trackOutboundClick('LINE_OA', 'navigation', { section: 'explore-more-cta' })}
          >
            LINE Official
          </a>
          <span className="text-gray-300">|</span>
          <a
            href="https://www.instagram.com/moon_moon_dessert/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] md:text-[11px] font-mono text-gray-600 hover:text-kiwi-dark tracking-wider uppercase font-bold transition-colors underline underline-offset-4"
            onClick={() => trackOutboundClick('INSTAGRAM', 'navigation', { section: 'explore-more-cta' })}
          >
            Instagram
          </a>
        </div>
      </div>
    </div>
  );
};

export default ExploreMore;
