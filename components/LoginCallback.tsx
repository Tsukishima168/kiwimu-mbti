
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

            if (!code) {
                setError('No code found in URL');
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
                onLoginSuccess();

            } catch (err: any) {
                console.error('LINE Login Error:', err);
                setError(err.message || 'Login failed');
            }
        };

        processLogin();
    }, [onLoginSuccess]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-kiwi-bg p-6 text-center">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Login Failed</h2>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <button onClick={() => window.location.href = '/'} className="px-4 py-2 bg-kiwi-green text-white rounded">
                        Return to Home
                    </button>
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
