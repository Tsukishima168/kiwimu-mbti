import React, { useEffect, useState } from 'react';
import { getAuthSupabaseClient } from '../utils/supabaseAuthBridge';

/**
 * Supabase OAuth callback handler.
 * Supabase (detectSessionInUrl: true) automatically exchanges the code in the URL
 * for a session. onAuthStateChange in App.tsx will fire and handle routing.
 * This component just shows a loading state during the exchange.
 */
const LoginCallback: React.FC = () => {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const supabase = getAuthSupabaseClient();
        if (!supabase) {
            setError('Auth client not available');
            return;
        }

        let active = true;
        const fail = (message: string) => {
            if (!active) return;
            setError(message);
        };

        // If detectSessionInUrl cannot materialize a session, avoid spinning forever.
        const timeoutId = window.setTimeout(async () => {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
                fail('登入逾時，請重新嘗試');
            }
        }, 8000);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                window.clearTimeout(timeoutId);
            }
        });

        // getSession triggers detectSessionInUrl internally.
        supabase.auth.getSession().then(({ data, error: e }) => {
            if (e) {
                window.clearTimeout(timeoutId);
                fail(e.message);
                return;
            }

            if (data.session) {
                window.clearTimeout(timeoutId);
            }
        });

        return () => {
            active = false;
            window.clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
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
