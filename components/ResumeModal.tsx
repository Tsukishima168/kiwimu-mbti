import React from 'react';

interface ResumeModalProps {
    onResume: () => void;
    onRestart: () => void;
    progress: { currentIndex: number; total: number };
}

export const ResumeModal: React.FC<ResumeModalProps> = ({
    onResume,
    onRestart,
    progress,
}) => {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-10 rounded-sm max-w-md mx-4 shadow-2xl border border-gray-100">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-serif font-medium text-kiwi-dark mb-3">
                        繼續你的探索？
                    </h2>
                    <p className="text-gray-600 text-base leading-relaxed">
                        你已經完成了 <span className="font-semibold text-kiwi-dark">{progress.currentIndex}</span> / {progress.total} 題
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        我們已經保存你的進度，可以從上次的地方繼續
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="h-1 bg-gray-100 w-full rounded-full overflow-hidden">
                        <div
                            className="h-full bg-kiwi-dark transition-all duration-500"
                            style={{ width: `${(progress.currentIndex / progress.total) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={onResume}
                        className="flex-1 bg-kiwi-dark text-white py-3.5 px-6 hover:bg-opacity-90 transition-all duration-200 font-medium tracking-wide"
                    >
                        繼續測驗
                    </button>
                    <button
                        onClick={onRestart}
                        className="flex-1 border-2 border-gray-200 text-gray-700 py-3.5 px-6 hover:border-kiwi-dark hover:text-kiwi-dark transition-all duration-200 font-medium tracking-wide"
                    >
                        重新開始
                    </button>
                </div>

                {/* Hint */}
                <p className="text-xs text-gray-400 text-center mt-5 font-mono tracking-wider">
                    不用一次完成，隨時可以回來
                </p>
            </div>
        </div>
    );
};

export default ResumeModal;
