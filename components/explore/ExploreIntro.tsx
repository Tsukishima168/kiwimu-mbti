import React from 'react';

interface Props {
  quizTitle: string;
  onStart: () => void;
}

const ExploreIntro: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 fade-in relative overflow-hidden"
      style={{ background: '#F0ECFF' }}>

      {/* 右上角標記 */}
      <div className="absolute top-6 right-6 z-50">
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-gray-400">
          5 題 · 1 min
        </span>
      </div>

      {/* 背景大字 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-display font-bold select-none -z-10 pointer-events-none opacity-[0.06] text-[#6B3FA0]">
        STATE
      </div>

      <div className="flex flex-col items-center z-10 max-w-md w-full text-center">

        {/* 圓形 Kiwimu 容器 — 與 V1 相同結構 */}
        <div
          className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl mb-12 relative group cursor-pointer"
          style={{ background: '#E4DCFF' }}
          onClick={onStart}
        >
          <img
            src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3N2cW13djJidTVwZ2YxdnlrcHRwZGFuNmExdGZnbDN4eW85YXZiaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LTRNEJfeVV17OTUEGF/giphy.gif"
            alt="Kiwimu State"
            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <span className="text-white font-display text-xl tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              START
            </span>
          </div>
        </div>

        {/* 標題 */}
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-widest mb-4"
          style={{ color: '#1A1A1A' }}>
          今天的你
          <br />
          打發到哪了？
        </h1>

        <p className="text-xs font-mono text-gray-500 mb-2 tracking-[0.3em] uppercase">
          KIWIMU STATE TEST
        </p>
        <p className="text-sm font-serif text-gray-400 mb-12 italic leading-relaxed px-4">
          5 個情境，找出你現在的 Kiwimu 狀態
        </p>

        {/* CTA */}
        <button
          onClick={onStart}
          className="px-12 py-4 border-2 border-black font-bold tracking-[0.2em] text-sm uppercase hover:scale-105 active:scale-95 transition-all duration-200"
          style={{ background: '#CCFF00', color: '#1A1A1A' }}
        >
          開始打發 →
        </button>

        <p className="mt-4 text-xs font-mono text-gray-400 tracking-wider">
          不需要登入 · 完全免費
        </p>

      </div>
    </div>
  );
};

export default ExploreIntro;
