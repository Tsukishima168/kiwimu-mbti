import React from 'react';

interface LineCTAProps {
    className?: string;
    variant?: 'default' | 'compact';
    mbtiType?: string; // 例如：'INFP-T'
}

// MBTI 類型個人化訊息
const getPersonalizedMessage = (mbtiType?: string): { title: string; subtitle: string } => {
    if (!mbtiType) {
        return {
            title: '加入 LINE 獲取完整報告',
            subtitle: '與數千位用戶一起探索性格奧秘'
        };
    }

    const type = mbtiType.split('-')[0]; // 取得基礎類型（例如 INFP）

    const messages: Record<string, { title: string; subtitle: string }> = {
        'INFP': { title: '🌈 加入 INFP 專屬社群', subtitle: 'INFP 們都在這裡找到共鳴' },
        'ENFP': { title: '✨ 與其他 ENFP 一起探險', subtitle: '充滿創意的靈魂聚集地' },
        'INTJ': { title: '🎯 INTJ 策略者之家', subtitle: '與同樣追求卓越的人交流' },
        'ENTJ': { title: '👑 ENTJ 領導者社群', subtitle: '與其他領導者共同成長' },
        'INTP': { title: '🔬 INTP 思考者天堂', subtitle: '深度思考者的聚集地' },
        'ENTP': { title: '💡 ENTP 創新者聯盟', subtitle: '挑戰常規的思想家們' },
        'INFJ': { title: '🦉 INFJ 洞察者圈子', subtitle: '稀有靈魂的溫暖之家' },
        'ENFJ': { title: '🌟 ENFJ 引導者社群', subtitle: '啟發他人的力量' },
        'ISTJ': { title: '📋 ISTJ 守護者聯盟', subtitle: '可靠的基石們聚在一起' },
        'ESTJ': { title: '⚖️ ESTJ 執行者群組', subtitle: '高效管理者的交流平台' },
        'ISFJ': { title: '🤗 ISFJ 守護者之家', subtitle: '溫暖關懷者的港灣' },
        'ESFJ': { title: '💝 ESFJ 照顧者社群', subtitle: '用心連結每一個人' },
        'ISTP': { title: '🔧 ISTP 實踐者工坊', subtitle: '動手創造者的天地' },
        'ESTP': { title: '⚡ ESTP 行動派群組', subtitle: '活力四射的冒險家們' },
        'ISFP': { title: '🎨 ISFP 藝術家聚落', subtitle: '自由靈魂的創作空間' },
        'ESFP': { title: '🎭 ESFP 表演者舞台', subtitle: '讓生活充滿歡樂' }
    };

    return messages[type] || {
        title: `加入 ${type} 專屬社群`,
        subtitle: '與同類型的人一起成長'
    };
};

export const LineCTA: React.FC<LineCTAProps> = ({
    className = '',
    variant = 'default',
    mbtiType
}) => {
    // LINE 官方帳號 ID
    const LINE_OFFICIAL_ID = '@kiwimu'; // KIWIMU 官方帳號（付費）
    const LINE_ADD_FRIEND_URL = `https://line.me/R/ti/p/${LINE_OFFICIAL_ID}`;

    // 訂閱數（可以從 Firestore 動態獲取）
    const subscriberCount = 0; // TODO: 連接實際數據

    // 獲取個人化訊息
    const personalizedMsg = getPersonalizedMessage(mbtiType);

    if (variant === 'compact') {
        return (
            <div className={`bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 ${className}`}>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                            {personalizedMsg.title} 📊
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                            {personalizedMsg.subtitle}
                        </p>
                    </div>
                    <a
                        href={LINE_ADD_FRIEND_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                            // Google Analytics 追蹤
                            if (typeof gtag !== 'undefined') {
                                gtag('event', 'line_cta_click', {
                                    event_category: 'conversion',
                                    event_label: 'result_page_compact',
                                    value: 1
                                });
                            }
                        }}
                        className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-[#00B900] text-white rounded-full font-bold hover:bg-[#00A000] transition-all shadow-md hover:shadow-lg text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                        </svg>
                        加入
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 p-8 border border-amber-200/50 ${className}`}>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-200/30 to-purple-200/30 rounded-full blur-3xl" />

            <div className="relative">
                {/* Header with gift emoji */}
                <div className="text-center mb-6">
                    <div className="inline-block text-6xl mb-4 animate-bounce-slow">
                        🎁
                    </div>
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-800 mb-2">
                        專屬禮物等你領取
                    </h3>
                    <p className="text-sm text-gray-600">
                        {personalizedMsg.subtitle}
                    </p>
                </div>

                {/* Gift items - minimal list */}
                <div className="mb-6 space-y-2">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                        <span className="text-lg">📄</span>
                        <span>完整性格報告（PDF）</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                        <span className="text-lg">🎨</span>
                        <span>專屬性格貼圖抽獎資格</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                        <span className="text-lg">💬</span>
                        <span>每週性格洞見</span>
                    </div>
                </div>

                {/* Gentle CTA */}
                <a
                    href={LINE_ADD_FRIEND_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'line_cta_click', {
                                event_category: 'conversion',
                                event_label: 'result_page',
                                value: 1
                            });
                        }
                    }}
                    className="block w-full"
                >
                    <button className="w-full bg-white hover:bg-gradient-to-r hover:from-green-400 hover:to-emerald-500 text-gray-800 hover:text-white font-medium py-3 px-6 rounded-xl border-2 border-gray-200 hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-lg flex items-center justify-center gap-2 group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform">
                            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                        </svg>
                        <span>領取專屬禮物</span>
                    </button>
                </a>

                {/* Subtle social proof */}
                <p className="text-center text-xs text-gray-500 mt-4">
                    {subscriberCount > 0
                        ? `已有 ${subscriberCount.toLocaleString()} 位用戶領取`
                        : '加入數千位用戶，探索性格奧秘'
                    }
                </p>

                {/* Trust badge - very subtle */}
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                        </svg>
                        可隨時退訂
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        隱私保護
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LineCTA;
