import React from 'react';

interface NotFoundProps {
    onHome: () => void;
}

const NotFound: React.FC<NotFoundProps> = ({ onHome }) => {
    return (
        <div className="min-h-screen bg-kiwi-bg flex flex-col items-center justify-center p-6 text-center select-none fade-in">

            {/* Visual: Lost Ghost / Kiwimu */}
            <div className="relative mb-12">
                <div className="w-40 h-40 md:w-56 md:h-56 bg-kiwi-dark rounded-full flex items-center justify-center relative overflow-hidden animate-float-slow shadow-2xl">
                    {/* Eyes looking confused */}
                    <div className="flex gap-8 md:gap-10">
                        <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full animate-blink"></div>
                        <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full animate-blink" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    {/* Mouth */}
                    <div className="absolute bottom-10 md:bottom-14 w-4 h-4 border-2 border-white rounded-full opacity-60"></div>
                </div>

                {/* Floating elements */}
                <div className="absolute top-0 right-0 text-4xl animate-bounce" style={{ animationDuration: '3s' }}>?</div>
                <div className="absolute bottom-0 left-0 text-3xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>?</div>
            </div>

            {/* Text Content */}
            <div className="space-y-4 md:space-y-6 max-w-md">
                <h1 className="text-4xl md:text-6xl font-display font-bold text-kiwi-dark tracking-tighter">
                    404
                </h1>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-gray-500 italic">
                    這裡只有虛無...
                </h2>
                <p className="text-sm md:text-base text-gray-400 font-mono leading-relaxed">
                    看來你漫遊到了實驗室的邊界。<br />
                    別擔心，迷路也是探索的一部分。
                </p>
            </div>

            {/* Action Button */}
            <button
                onClick={onHome}
                className="mt-12 group relative px-8 py-3 bg-white text-kiwi-dark border border-kiwi-dark rounded-full font-mono text-xs md:text-sm font-bold tracking-[0.2em] uppercase hover:bg-kiwi-dark hover:text-white transition-all duration-500 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
                <span>Return to Lab</span>
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    回到實驗室
                </span>
            </button>

            <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
      `}</style>
        </div>
    );
};

export default NotFound;
