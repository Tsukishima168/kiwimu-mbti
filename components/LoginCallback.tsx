import React, { useEffect, useState } from 'react';
import { getAuthSupabaseClient } from '../utils/supabaseAuthBridge';

interface LoginCallbackProps {
    onLoginSuccess: () => void;
}

/**
 * Supabase OAuth callback handler.
 * Supabase (detectSessionInUrl: true) automatically exchanges the code in the URL
 * for a session. onAuthStateChange in App.tsx will fire and handle routing.
 * This component just shows a loading state during the exchange.
 */
const LoginCallback: React.FC<LoginCallbackProps> = ({ onLoginSuccess }) => {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const supabase = getAuthSupabaseClient();
        if (!supabase) {
            setError('Auth client not available');
            return;
        }

        // getSession triggers detectSessionInUrl internally.
        // onAuthStateChange in App.tsx will handle navigation.
        supabase.auth.getSession().then(({ error: e }) => {
            if (e) setError(e.message);
            // On success, onAuthStateChange fires → App.tsx routes to result
        });
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-kiwi-bg p-6 text-center">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
                    <h2 className="text-xl font-bold text-red-600 mb-4">登入失敗</h2>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-3 bg-kiwi-dark text-white rounded-lg font-medium hover:bg-black transition-all"
                    >
                        返回首頁
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-kiwi-bg">
            <div className="text-xl font-display tracking-widest animate-pulse">
                登入中...
            </div>
        </div>
    );
};

export default LoginCallback;
