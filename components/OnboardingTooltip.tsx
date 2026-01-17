// Onboarding Tooltip Component
import React from 'react';

interface TooltipProps {
    step: number;
    totalSteps: number;
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    targetRef?: React.RefObject<HTMLElement>;
    onNext: () => void;
    onSkip: () => void;
}

const OnboardingTooltip: React.FC<TooltipProps> = ({
    step,
    totalSteps,
    title,
    description,
    position,
    onNext,
    onSkip
}) => {
    const positionStyles = {
        top: 'bottom-full mb-4',
        bottom: 'top-full mt-4',
        left: 'right-full mr-4',
        right: 'left-full ml-4'
    };

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={onSkip}></div>

            {/* Tooltip */}
            <div className={`absolute pointer-events-auto ${positionStyles[position]} max-w-sm`}
                style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }}>
                <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-kiwi-dark">
                    {/* Progress */}
                    <div className="flex gap-1 mb-4">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-all ${i < step ? 'bg-kiwi-dark' : 'bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-kiwi-dark mb-2">{title}</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">{description}</p>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onSkip}
                            className="flex-1 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                        >
                            跳過
                        </button>
                        <button
                            onClick={onNext}
                            className="flex-1 px-4 py-2 bg-kiwi-dark text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            {step === totalSteps ? '開始探索' : '下一步'}
                        </button>
                    </div>
                </div>

                {/* Arrow indicator */}
                <div className={`absolute w-4 h-4 bg-white border-kiwi-dark rotate-45 
          ${position === 'top' ? 'top-full -mt-2 border-b-2 border-r-2' : ''}
          ${position === 'bottom' ? 'bottom-full -mb-2 border-t-2 border-l-2' : ''}
          ${position === 'left' ? 'left-full -ml-2 border-t-2 border-r-2' : ''}
          ${position === 'right' ? 'right-full -mr-2 border-b-2 border-l-2' : ''}
          left-1/2 -translate-x-1/2`}
                />
            </div>
        </div>
    );
};

export default OnboardingTooltip;
