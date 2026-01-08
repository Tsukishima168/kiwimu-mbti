
import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { signInWithCustomToken } from 'firebase/auth';

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
            const state = params.get('state');

            if (!code) {
                setError('No code found in URL');
                return;
            }

            try {
                setStatus('Verifying with LINE...');

                // Call our Vercel Serverless Function
                const response = await fetch(`/api/line-auth?code=${code}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to exchange token');
                }

                setStatus('Signing into Firebase...');
                await signInWithCustomToken(auth, data.customToken);

                // Login success
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
