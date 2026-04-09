import React, { useState, useEffect } from 'react';
import { getAuthSupabaseClient, trackSsoEvent } from '../utils/supabaseAuthBridge';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginProps {
    onLoginSuccess: () => void;
    isUnlockMode?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, isUnlockMode = false }) => {
    const [error, setError] = useState<string | null>(null);
    const [isInAppBrowser, setIsInAppBrowser] = useState(false);
    const { language } = useLanguage();

    const langSuffix = language === 'zh-TW' ? '' : `-${language}`;
    const privacyText = language === 'en' ? 'Privacy Policy' : language === 'ja' ? 'プライバシーポリシー' : language === 'ko' ? '개인정보 보호정책' : '隱私權政策';
    const termsText = language === 'en' ? 'Terms of Use' : language === 'ja' ? '利用規約' : language === 'ko' ? '이용 약관' : '使用者條款';

    useEffect(() => {
        const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
        const isLine = /Line\//i.test(ua);
        const isFB = /FBAN|FBAV/i.test(ua);
        if (isLine || isFB) {
            setIsInAppBrowser(true);
        }
    }, []);

    const handleGoogleLogin = async () => {
        try {
            const supabase = getAuthSupabaseClient();
            if (!supabase) throw new Error('Auth client not available');

            const redirectTo = `${window.location.origin}/callback`;
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo },
            });

            if (oauthError) throw oauthError;
            // Browser will redirect to Google — no further action needed here
        } catch (err: any) {
            setError(err.message);
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-kiwi-bg p-6">
            <div className="max-w-md mx-auto px-6 py-12 bg-white rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-kiwi-green to-kiwi-dark flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-gray-800 mb-3">
                        {isUnlockMode ? '儲存你的人格紀錄' : '開始你的人格探索'}
                    </h1>
                    <p className="text-gray-600 leading-relaxed">
                        {isUnlockMode
                            ? '登入以保存你的測驗結果，並追蹤你的成長軌跡。每一次的測驗，都是下一次冒險的起點。'
                            : '請登入以將測驗進度同步至雲端，並追蹤你的靈魂甜點歷險記。'
                        }
                    </p>
                    <p className="text-sm text-gray-400 mt-4">
                        {isUnlockMode
                            ? '儲存後你可以隨時回看、對比不同時期的自己'
                            : '無論您在哪裡，都能續寫您的故事'
                        }
                    </p>
                </div>
                <p className="text-xs text-gray-400 mb-6">
                    您的記錄僅供您回看與長期追蹤。繼續即表示同意
                    <a href={`/privacy${langSuffix}.html`} target="_blank" rel="noopener" className="text-kiwi-dark underline ml-1">{privacyText}</a>
                    <span className="mx-1">與</span>
                    <a href={`/terms${langSuffix}.html`} target="_blank" rel="noopener" className="text-kiwi-dark underline">{termsText}</a>
                </p>

                {!isInAppBrowser && (
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors mb-4"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        Sign in with Google
                    </button>
                )}

                {isInAppBrowser && (
                    <p className="text-sm text-gray-500 text-center py-4">
                        請用瀏覽器開啟此頁面以使用 Google 登入
                    </p>
                )}

                {error && (
                    <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
