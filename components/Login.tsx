import React, { useState, useEffect } from 'react';
import { getAuthSupabaseClient } from '../utils/supabaseAuthBridge';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginProps {
    isUnlockMode?: boolean;
}

const Login: React.FC<LoginProps> = ({ isUnlockMode = false }) => {
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
                        <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
                          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z"/>
                        </svg>
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
