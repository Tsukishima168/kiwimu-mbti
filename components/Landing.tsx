import React from 'react';

interface LandingProps {
  onStart: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-kiwi-bg p-6 text-center fade-in">
      <div className="max-w-md w-full border border-black p-12 relative">
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-black -mt-1 -ml-1"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-black -mt-1 -mr-1"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-black -mb-1 -ml-1"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-black -mb-1 -mr-1"></div>

        <h1 className="text-5xl font-display font-bold tracking-tight text-kiwi-dark mb-4">
          KIWIMU LAB
        </h1>
        <p className="text-sm font-mono tracking-widest text-gray-500 mb-12 uppercase">
          Advanced Personality Analysis V2 進階人格分析 V2
        </p>

        <button
            onClick={onStart}
            className="w-full py-4 bg-kiwi-dark text-white font-bold tracking-[0.2em] hover:bg-gray-800 transition-all uppercase text-sm"
        >
            Start Assessment 開始測驗
        </button>
      </div>
    </div>
  );
};

export default Landing;