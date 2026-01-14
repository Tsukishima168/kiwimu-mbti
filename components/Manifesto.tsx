
import React from 'react';

interface ManifestoProps {
    onProceed: () => void;
}

const Manifesto: React.FC<ManifestoProps> = ({ onProceed }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-kiwi-bg p-8 fade-in">
            <div className="max-w-xl w-full text-center space-y-12">

                {/* Decorative Header */}
                <div className="space-y-4">
                    <div className="w-12 h-[1px] bg-kiwi-dark mx-auto"></div>
                    <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-gray-400">Guideline & Philosophy</p>
                </div>

                {/* Polished Content */}
                <div className="space-y-8">
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-kiwi-dark leading-snug">
                        生命並非定稿，<br />而是一場持續的覺察。
                    </h2>

                    <div className="space-y-6 text-gray-600 font-serif text-lg leading-relaxed text-center md:text-justify max-w-lg mx-auto">
                        <p>
                            人格測驗是一面鏡子，照見當下的你，而非定義永恆的你。
                        </p>
                        <p>
                            請不要將結果視為侷限，而是看作一把鑰匙，去開啟那些你尚未察覺的潛能與驚喜。
                        </p>
                        <p>
                            越是深刻地理解自己，越能溫柔地擁抱世界。願這份報告，能成為你探索旅程中的一點微光。
                        </p>
                    </div>
                </div>

                {/* Action */}
                <div className="pt-8">
                    <button
                        onClick={onProceed}
                        className="group relative inline-flex items-center justify-center px-16 py-5 border border-black overflow-hidden transition-all hover:bg-black hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-xl"
                    >
                        <span className="relative z-10 text-xs font-bold tracking-[0.3em] uppercase group-hover:text-white transition-colors duration-500">
                            I am ready 我準備好了
                        </span>
                        <div className="absolute inset-0 bg-black translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
                    </button>
                    <p className="mt-8 text-[9px] font-mono text-gray-300 tracking-[0.2em] uppercase">
                        Estimated time: 5 minutes
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Manifesto;
