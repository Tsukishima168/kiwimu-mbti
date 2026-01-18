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
        <div className={`bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 md:p-8 border-2 border-green-200 shadow-lg ${className}`}>
            {/* Header */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-bold mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                        <path d="M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="white" />
                    </svg>
                    <span>100% 免費</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">
                    🎁 免費獲取完整報告
                </h3>
                <p className="text-gray-600">
                    {personalizedMsg.subtitle}
                </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3 mb-6">
                {[
                    { icon: '📄', text: '完整 32 變體深度報告（PDF）' },
                    { icon: '📅', text: '每週性格洞見推播' },
                    { icon: '🎨', text: '搶先體驗新功能（貼圖、主題）' },
                    { icon: '👥', text: '加入專屬社群討論' }
                ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-lg">
                            {benefit.icon}
                        </div>
                        <span className="text-gray-800 font-medium">{benefit.text}</span>
                    </div>
                ))}
            </div>

            {/* CTA Button */}
            <a
                href={LINE_ADD_FRIEND_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                    // Google Analytics 追蹤
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
                <button className="w-full bg-[#00B900] hover:bg-[#00A000] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                    </svg>
                    立即加入 LINE 官方帳號
                </button>
            </a>

            {/* Social Proof */}
            <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                    {subscriberCount > 0 ? (
                        <>已有 <span className="font-bold text-green-600">{subscriberCount.toLocaleString()}</span> 位用戶訂閱</>
                    ) : (
                        <>加入數千位用戶，一起探索性格奧秘</>
                    )}
                    {' '}
                    <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                </p>
            </div>

            {/* Trust Indicators */}
            <div className="mt-4 pt-4 border-t border-green-200">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        隱私保護
                    </span>
                    <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        隨時可退訂
                    </span>
                    <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="m9 12 2 2 4-4" />
                        </svg>
                        永不推銷
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LineCTA;
