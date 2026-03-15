import React from 'react';
import { CardProps } from './Types';
import { trackAction } from '../../utils/userDataCollector';

export const V2UpgradeCard: React.FC<CardProps> = ({
  resultData,
  identitySuffix,
  displayKeywords,
  onPrev,
}) => {
  const fullType = `${resultData.id}-${identitySuffix}`;

  const handleUpgrade = () => {
    trackAction('v2_upgrade_click', {
      source: 'v1_result_card',
      mbtiType: fullType,
    });

    window.location.assign(`/v2?source=v1_result_card&mbti=${fullType}`);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0F172A] text-white overflow-hidden pb-16">
      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth px-6 pt-16 pb-10">
        <div className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#C6FF00]">
          MBTI V2 Upgrade
        </div>

        <div className="mt-8 space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/50">Free V1 complete</p>
          <h2 className="text-4xl font-display font-bold leading-none">{fullType}</h2>
          <p className="text-lg font-serif leading-relaxed text-white/80">{resultData.summary}</p>
        </div>

        <div className="mt-10 rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#C6FF00]">V2 unlocks</p>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/80">
            <li>職涯策略與盲點拆解</li>
            <li>關係模式與成長建議</li>
            <li>完整靈魂提問與後續追蹤入口</li>
          </ul>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-2">
          {displayKeywords.slice(0, 3).map((keyword) => (
            <div key={keyword} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-center text-xs font-medium tracking-wide text-white/80">
              {keyword}
            </div>
          ))}
        </div>

        <div className="mt-10 space-y-4 rounded-[28px] border border-dashed border-white/20 bg-white/5 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40">Preview</p>
          <p className="blur-[3px] select-none text-sm leading-relaxed text-white/55">
            你擅長在熟悉的秩序與個人節奏之間找到平衡，但真正讓你持續前進的，往往不是外界期待，而是你內在那條更安靜的判準線。
          </p>
          <p className="text-sm leading-relaxed text-white/70">
            V1 永久免費保留，V2 只負責把這份人格往更深一層打開。
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/20 px-6 py-5 backdrop-blur-sm">
        <button
          onClick={handleUpgrade}
          className="w-full rounded-full bg-[#C6FF00] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-black transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          Unlock MBTI V2
        </button>
        {onPrev && (
          <button
            onClick={onPrev}
            className="mt-3 w-full rounded-full border border-white/15 px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 transition-colors hover:bg-white/5"
          >
            Back to free report
          </button>
        )}
      </div>
    </div>
  );
};
