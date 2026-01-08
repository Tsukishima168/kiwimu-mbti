
import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, User } from 'firebase/auth';

interface LoginProps {
    onLoginSuccess: (user: User) => void;
    isUnlockMode?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, isUnlockMode = false }) => {
    const [error, setError] = useState<string | null>(null);
    const [isInAppBrowser, setIsInAppBrowser] = useState(false);

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
            const result = await signInWithPopup(auth, googleProvider);

            // Log user to Google Sheets
            try {
                await fetch('/api/save-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: result.user.uid,
                        email: result.user.email,
                        displayName: result.user.displayName,
                        method: 'google'
                    })
                });
            } catch (logError) {
                console.error('Failed to log user', logError);
            }

            onLoginSuccess(result.user);
        } catch (err: any) {
            setError(err.message);
            console.error(err);
        }
    };


    const handleLineLogin = () => {
        // Generate a random state for CSRF protection
        const state = Math.random().toString(36).substring(7);
        sessionStorage.setItem('line_auth_state', state);

        const clientID = import.meta.env.VITE_LINE_CHANNEL_ID;
        // Construct the Redirect URI based on current location if not specified
        const redirectURI = import.meta.env.VITE_LINE_REDIRECT_URI || `${window.location.origin}/callback`;

        if (!clientID) {
            alert("LINE Channel ID is missing. Please set VITE_LINE_CHANNEL_ID in .env");
            return;
        }

        const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&state=${state}&scope=profile%20openid`;

        window.location.href = lineAuthUrl;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-kiwi-bg p-6">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
                {isUnlockMode ? (
                    <>
                        <h1 className="text-2xl font-bold mb-4 text-kiwi-dark">您的靈魂甜點已分析完成！</h1>
                        <p className="text-gray-600 mb-8 text-sm">請登入以解鎖完整人格分析報告，<br />並領取您的專屬甜點優惠。</p>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold mb-6 text-kiwi-dark">Welcome</h1>
                        <p className="text-gray-600 mb-8">Please sign in to continue</p>
                    </>
                )}

                {/* Privacy Notice */}
                <p className="text-xs text-gray-400 mb-6">
                    繼續即表示您同意我們的{' '}
                    <a href="/privacy.html" target="_blank" className="text-kiwi-dark underline">隱私權政策</a>
                    {' '}與{' '}
                    <a href="/privacy.html" target="_blank" className="text-kiwi-dark underline">使用條款</a>
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

                <button
                    onClick={handleLineLogin}
                    className="w-full flex items-center justify-center gap-3 bg-[#06C755] hover:bg-[#05b34c] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                    {/* Simple LINE icon SVG */}
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M10 0.5C4.48 0.5 0 4.53 0 9.5C0 12.92 2.1 15.89 5.25 17.5C5.25 17.5 5.58 17.61 5.68 17.84C5.78 18.06 5.55 19.34 5.51 19.55C5.45 19.98 5.79 20.37 6.17 20.1C7.81 18.96 11.45 16.48 12.43 15.79C16.89 14.97 20 12.45 20 9.5C20 4.53 15.52 0.5 10 0.5ZM6.59 11.96H5.21C4.94 11.96 4.73 11.75 4.73 11.48V7.52C4.73 7.25 4.94 7.04 5.21 7.04C5.48 7.04 5.69 7.25 5.69 7.52V9.32H6.59C6.86 9.32 7.07 9.53 7.07 9.8C7.07 10.07 6.86 10.28 6.59 10.28H5.69V11.48C5.69 11.75 5.48 11.96 5.21 11.96H6.59ZM8.93 11.96H7.55C7.29 11.96 7.07 11.75 7.07 11.48V7.52C7.07 7.25 7.29 7.04 7.55 7.04C7.82 7.04 8.03 7.25 8.03 7.52V11.48C8.03 11.75 7.82 11.96 7.55 11.96H8.93ZM10.21 11.96C9.94 11.96 9.73 11.75 9.73 11.48V7.52C9.73 7.25 9.94 7.04 10.21 7.04C10.36 7.04 10.51 7.11 10.59 7.23L12.01 9.49V7.52C12.01 7.25 12.22 7.04 12.49 7.04C12.76 7.04 12.97 7.25 12.97 7.52V11.48C12.97 11.75 12.76 11.96 12.49 11.96C12.33 11.96 12.19 11.89 12.11 11.77L10.69 9.51V11.48C10.69 11.75 10.48 11.96 10.21 11.96ZM15.63 9.8H14.73V10.28H15.63C15.9 10.28 16.11 10.49 16.11 10.76C16.11 11.03 15.9 11.24 15.63 11.24H14.73V11.48C14.73 11.75 14.52 11.96 14.25 11.96C13.98 11.96 13.77 11.75 13.77 11.48V7.52C13.77 7.25 13.98 7.04 14.25 7.04H15.63C15.9 7.04 16.11 7.25 16.11 7.52C16.11 7.79 15.9 8 15.63 8H14.73V9.32H15.63C15.9 9.32 16.11 9.53 16.11 9.8C16.11 10.07 15.9 10.28 15.63 10.28H15.63V9.8Z" fill="white" />
                    </svg>
                    Sign in with LINE
                </button>

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
