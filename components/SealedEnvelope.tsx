import React, { useState, useEffect } from 'react';

interface SealedEnvelopeProps {
    onClose: () => void;
}

const SealedEnvelope: React.FC<SealedEnvelopeProps> = ({ onClose }) => {
    const [stampBroken, setStampBroken] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);

    // 避免背景滑動
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const handleOpen = () => {
        setStampBroken(true);
        setTimeout(() => {
            setContentVisible(true);
        }, 1200);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in font-serif transition-opacity duration-700">

            {/* Container max width */}
            <div className="relative w-full max-w-lg mx-auto flex flex-col items-center justify-center min-h-[500px]">

                {/* Envelope Stage */}
                <div
                    className={`relative w-full max-w-sm transition-all duration-1000 ease-in-out transform ${contentVisible ? 'opacity-0 scale-95 pointer-events-none absolute' : 'opacity-100 scale-100'
                        }`}
                >
                    {/* Main Envelope Body */}
                    <div className="bg-[#fdfaf6] shadow-2xl border border-[#e5d9c5] pt-[60%] w-full relative sm:rounded flex items-center justify-center cursor-pointer group" onClick={handleOpen}>

                        {/* Flap lines (CSS illusion for envelope) */}
                        <div className="absolute top-0 left-0 right-0 h-1/2 border-b border-[#e5d9c5] shadow-sm transform origin-top skew-x-12 opacity-50 z-10" />
                        <div className="absolute top-0 left-0 right-0 h-1/2 border-b border-[#e5d9c5] shadow-sm transform origin-top -skew-x-12 opacity-50 z-10" />

                        {/* Wax Stamp */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-700 ${stampBroken ? 'scale-150 opacity-0 blur-sm' : 'scale-100 opacity-100 group-hover:scale-110'}`}>
                            <div className="w-16 h-16 rounded-full bg-red-800 shadow-xl flex items-center justify-center border-4 border-red-900 border-opacity-30">
                                <span className="text-red-200 font-serif text-2xl tracking-widest italic">K</span>
                            </div>
                        </div>

                        <div className="absolute bottom-6 w-full text-center tracking-[0.3em] text-[#a09078] text-xs uppercase animate-pulse">
                            Tap to open
                        </div>
                    </div>
                </div>

                {/* Letter Content */}
                <div
                    className={`w-full max-w-md bg-[#fdfaf6] shadow-2xl p-8 md:p-12 transition-all duration-1000 ease-out transform ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none absolute'
                        }`}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
                    >
                        ✕
                    </button>

                    <div className="space-y-6 text-[#2c2c2c] text-sm md:text-base leading-relaxed tracking-wide">

                        <div className="text-center pb-4 border-b border-gray-200">
                            <span className="block text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-2">Secret Origin</span>
                            <h3 className="text-xl italic font-semibold">這是一條找回光芒的路</h3>
                        </div>

                        <p>
                            你發現了隱藏的抽屜。很高興能在這裡遇見你。
                        </p>
                        <p>
                            很多人以為這只是一個用來娛樂或貼上標籤的測驗，但其實，這是 Kiwimu (奇威鳥) 的誕生之旅。
                        </p>
                        <p>
                            從廣播主持的麥克風、行銷總監的策略報表、到開拓甜點店的艱辛，我曾經在無數個角色中切換，卻也曾在一路的跌跌撞撞中迷失了身為創作者的光芒。
                        </p>
                        <p>
                            直到遇見了 AI，我意識到魔法不只存在於童話中。技術不是冰冷的代碼，而是將靈感具象化的魔杖。
                        </p>
                        <p className="font-semibold italic text-center py-2 text-kiwi-dark">
                            「MBTI 不是用來限制自己的框架，而是理解自我、重新出發的指南。」
                        </p>
                        <p>
                            這座實驗室，就是 AI 魔術師 Kiwimu 獻給每一位還在尋找自我定位的主角們的一份禮物。希望你在這裡，也能找到屬於你的不可取代性。
                        </p>

                        <div className="pt-6 border-t border-gray-200 text-center space-y-4">
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Connect with Penso</p>
                            <a
                                href="https://www.instagram.com/moon_moon_dessert/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-8 py-3 bg-black text-white text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors"
                            >
                                領取魔法鑰匙 (IG)
                            </a>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default SealedEnvelope;
