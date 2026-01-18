import React, { useEffect, useState } from 'react';

interface ExitIntentPopupProps {
    currentQuestionIndex: number;
    totalQuestions: number;
    onContinue: () => void;
    onSaveProgress: () => void;
}

export const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({
    currentQuestionIndex,
    totalQuestions,
    onContinue,
    onSaveProgress
}) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // 只在完成 10 題以上時才觸發
        if (currentQuestionIndex < 10) return;

        const handleMouseLeave = (e: MouseEvent) => {
            // 滑鼠移出視窗頂部時觸發
            if (e.clientY <= 0 && !show) {
                setShow(true);
            }
        };

        document.addEventListener('mouseout', handleMouseLeave);

        return () => {
            document.removeEventListener('mouseout', handleMouseLeave);
        };
    }, [currentQuestionIndex, show]);

    if (!show) return null;

    const remainingQuestions = totalQuestions - currentQuestionIndex;
    const progressPercentage = Math.round((currentQuestionIndex / totalQuestions) * 100);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
                onClick={() => setShow(false)}
            />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 animate-scale-in">
                <div className="bg-white rounded-2xl shadow-2xl p-8 relative">
                    {/* Close Button */}
                    <button
                        onClick={() => setShow(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Icon */}
                    <div className="text-center mb-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            等等！你快完成了！⏰
                        </h3>
                    </div>

                    {/* Progress */}
                    <div className="mb-6">
                        <div className="bg-gray-200 h-2 rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <p className="text-center text-sm text-gray-600">
                            已完成 <span className="font-bold text-green-600">{progressPercentage}%</span>
                        </p>
                    </div>

                    {/* Message */}
                    <div className="text-center mb-6 space-y-2">
                        <p className="text-lg font-semibold text-gray-700">
                            只剩 <span className="text-2xl text-blue-600 font-bold">{remainingQuestions}</span> 題
                        </p>
                        <p className="text-sm text-gray-600">
                            離發現真實自我只差一步
                        </p>
                        <p className="text-xs text-gray-500 italic">
                            已有 10,000+ 人完成並找到人生方向
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                setShow(false);
                                onContinue();
                            }}
                            className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all hover:scale-105"
                        >
                            ✨ 繼續測驗
                        </button>
                        <button
                            onClick={() => {
                                setShow(false);
                                onSaveProgress();
                            }}
                            className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-xl hover:bg-gray-200 transition-all"
                        >
                            💾 稍後繼續
                        </button>
                        <button
                            onClick={() => setShow(false)}
                            className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
                        >
                            我確定要離開
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ExitIntentPopup;
