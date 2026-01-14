
import React from 'react';
import { User } from 'firebase/auth';

interface IntroProps {
  onStart: () => void;
  user: User | null;
  onLogin: () => void;
}

const Intro: React.FC<IntroProps> = ({ onStart, user, onLogin }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-kiwi-bg p-6 fade-in relative overflow-hidden">

      {/* Login button in top-right corner */}
      {!user || user.isAnonymous ? (
        <button
          onClick={onLogin}
          className="absolute top-6 right-6 px-6 py-2 border border-kiwi-dark text-kiwi-dark hover:bg-kiwi-dark hover:text-white transition-all duration-300 font-bold text-sm z-50"
        >
          登入
        </button>
      ) : (
        <div className="absolute top-6 right-6 flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-md z-50">
          <span className="text-sm font-medium">{user.displayName || user.email}</span>
        </div>
      )}

      {/* 裝飾性背景文字 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-display font-bold text-gray-100 select-none -z-10 pointer-events-none opacity-50">
        MBTI
      </div>

      <div className="flex flex-col items-center z-10 max-w-md w-full text-center">

        {/* 圓形動畫容器 */}
        <div
          className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl mb-12 relative group cursor-pointer bg-gray-100"
          onClick={onStart}
        >
          <img
            src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3N2cW13djJidTVwZ2YxdnlrcHRwZGFuNmExdGZnbDN4eW85YXZiaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LTRNEJfeVV17OTUEGF/giphy.gif"
            alt="KIWIMU Intro"
            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <span className="text-white font-display text-xl tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-300">ENTER 進入</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-widest text-kiwi-dark mb-4">
          KIWIMU 的 MBTI宇宙
        </h1>

        <p className="text-xs font-mono text-gray-500 mb-12 tracking-[0.3em] uppercase">
          Discover Your Inner Self 探索內在自我
        </p>

        <button
          onClick={onStart}
          className="px-12 py-4 border border-black text-black hover:bg-black hover:text-white transition-all duration-300 font-bold tracking-[0.2em] text-sm uppercase hover:scale-105 active:scale-95 hover:shadow-lg"
        >
          Start 開始旅程
        </button>
      </div>
    </div>
  );
};

export default Intro;
