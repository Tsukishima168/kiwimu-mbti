
import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { signInWithCustomToken } from 'firebase/auth';
import { linkAnonymousAccount } from '../utils/accountLinking';

interface LoginCallbackProps {
    onLoginSuccess: () => void;
}

const LoginCallback: React.FC<LoginCallbackProps> = ({ onLoginSuccess }) => {
    const [status, setStatus] = useState('Processing LINE login...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const processLogin = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const callbackState = params.get('state');
            const expectedState = sessionStorage.getItem('line_auth_state');

            if (!code) {
                setError('No code found in URL');
                return;
            }

            if (!callbackState || !expectedState || callbackState !== expectedState) {
                setError('Invalid login state');
                sessionStorage.removeItem('processed_line_code');
                sessionStorage.removeItem('line_auth_state');
                return;
            }

            // Check if we've already processed this code
            const processedCode = sessionStorage.getItem('processed_line_code');
            if (processedCode === code) {
                console.log('Code already processed, skipping...');
                return;
            }

            try {
                setStatus('Verifying with LINE...');

                // Mark code as processing immediately to prevent duplicate requests
                sessionStorage.setItem('processed_line_code', code);

                const redirectUri = `${window.location.origin}/callback`;

                const response = await fetch('/api/line-auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        code: code,
                        redirectUri: redirectUri,
                    }),
                });

                const data = await response.json();

                if (!response.ok || !data.ok) {
                    // Clean up the processed code marker on error
                    sessionStorage.removeItem('processed_line_code');
                    throw new Error(data.error || 'Failed to exchange token');
                }

                setStatus('Linking account...');

                await linkAnonymousAccount(data.firebaseCustomToken);

                setStatus('Finalizing...');

                const currentUser = auth.currentUser;
                if (currentUser) {
                    try {
                        await fetch('/api/save-user', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                uid: currentUser.uid,
                                email: currentUser.email,
                                displayName: currentUser.displayName || data.lineProfile?.displayName,
                                method: 'line'
                            })
                        });
                    } catch (logError) {
                        console.error('Failed to log user', logError);
                    }
                }

                // Clear the processed code after successful login
                sessionStorage.removeItem('processed_line_code');
                sessionStorage.removeItem('line_auth_state');
                onLoginSuccess();

            } catch (err: any) {
                console.error('LINE Login Error:', err);
                sessionStorage.removeItem('line_auth_state');
                setError(err.message || 'Login failed');
            }
        };

        processLogin();
    }, [onLoginSuccess]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-kiwi-bg p-6 text-center">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
                    <h2 className="text-xl font-bold text-red-600 mb-4">登入失敗</h2>
                    <p className="text-gray-700 mb-2">
                        {error.includes('code') ? '驗證碼無效或已過期' :
                            error.includes('token') ? 'LINE 帳號連結失敗' :
                                '登入過程發生錯誤'}
                    </p>
                    <p className="text-sm text-gray-500 mb-6">請重新嘗試登入</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                sessionStorage.removeItem('processed_line_code');
                                window.location.href = '/';
                            }}
                            className="flex-1 px-4 py-3 bg-kiwi-dark text-white rounded-lg font-medium hover:bg-black transition-all"
                        >
                            重新登入
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
                        >
                            返回首頁
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-kiwi-bg">
            <div className="text-xl font-display tracking-widest animate-pulse">
                {status}
            </div>
        </div>
    );
};

export default LoginCallback;
