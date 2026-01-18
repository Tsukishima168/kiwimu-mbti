import React from 'react';

export const ExploreMore: React.FC = () => {
    const upcomingFeatures = [
        {
            icon: '🤖',
            title: 'AI 性格對話',
            description: '與專屬 AI 助手深度探討你的性格特質',
            status: '開發中',
            eta: '2026 Q2'
        },
        {
            icon: '👥',
            title: '好友配對系統',
            description: '找到與你性格互補的靈魂夥伴',
            status: '規劃中',
            eta: '2026 Q2'
        },
        {
            icon: '📚',
            title: '心理成長課程',
            description: '基於你的 MBTI 類型的個人化學習路徑',
            status: '規劃中',
            eta: '2026 Q3'
        },
        {
            icon: '🎯',
            title: '職涯發展地圖',
            description: '根據性格特質規劃最適合的職業路徑',
            status: '探索中',
            eta: 'TBD'
        }
    ];

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">探索更多可能性</h2>
                <p className="text-gray-600 text-lg">我們正在打造更多功能，讓你更深入了解自己</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingFeatures.map((feature, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-kiwi-dark transition-all hover:shadow-lg relative overflow-hidden group"
                    >
                        {/* Coming Soon Badge */}
                        <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold rounded-full">
                                {feature.status}
                            </span>
                        </div>

                        {/* Icon */}
                        <div className="text-5xl mb-4 filter grayscale group-hover:grayscale-0 transition-all">
                            {feature.icon}
                        </div>

                        {/* Content */}
                        <h3 className="text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
                        <p className="text-gray-600 mb-4 text-sm leading-relaxed">{feature.description}</p>

                        {/* ETA */}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>預計上線：{feature.eta}</span>
                        </div>

                        {/* Lock Overlay */}
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-2 text-gray-400">
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <p className="text-sm font-medium text-gray-600">敬請期待</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Feedback Section */}
            <div className="mt-12 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 text-center border border-purple-200">
                <h3 className="text-xl font-bold mb-3">你期待什麼功能？</h3>
                <p className="text-gray-600 mb-6">你的建議將幫助我們打造更好的產品</p>
                <a
                    href="https://discord.gg/WJMQEAXx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-kiwi-dark text-white rounded-full font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.42-2.157 2.42zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.42-2.157 2.42z" />
                    </svg>
                    加入 Discord 分享想法
                </a>
            </div>
        </div>
    );
};

export default ExploreMore;
