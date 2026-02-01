import React from 'react';
import { trackButtonClick } from '../utils/analytics';

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
                        生命像鮮奶油一樣，<br />柔軟而流動。
                    </h2>

                    <div className="space-y-6 text-gray-600 font-serif text-lg leading-relaxed text-center md:text-justify max-w-lg mx-auto">
                        <p>
                            這不是一場尋找答案的測驗，而是一面鏡子，映照此刻的你。
                        </p>
                        <p>
                            請帶著好奇與開放，讓 KIWIMU 陪你探索那些尚未察覺的可能性。
                        </p>
                    </div>
                </div>

                {/* Action */}
                <div className="pt-8">
                    <button
                        onClick={() => { trackButtonClick('我準備好了', 'manifesto'); onProceed(); }}
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
