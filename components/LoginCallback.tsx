import React, { useEffect, useState } from 'react';
import { getAuthSupabaseClient, restoreAuthSessionFromUrl } from '../utils/supabaseAuthBridge';
import { trackLoginCallback, trackLoginFailure } from '../utils/analytics';
import { trackAction } from '../utils/userDataCollector';

/**
 * Supabase OAuth callback handler.
 * We explicitly exchange the PKCE code here so callback failures surface as
 * real auth errors instead of a silent timeout.
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
            trackLoginCallback('error', 'google', {
                path: window.location.pathname,
                error_message: message,
            });
            trackLoginFailure('google', message, {
                path: window.location.pathname,
                stage: 'callback',
            });
            trackAction('login_callback_error', {
                provider: 'google',
                path: window.location.pathname,
                error: message,
            });
            setError(message);
        };

        const finalize = async () => {
            const restore = await restoreAuthSessionFromUrl();
            if (restore.error) {
                fail(restore.error);
                return;
            }

            const { data, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
                fail(sessionError.message);
                return;
            }

            if (!data.session) {
                fail('登入逾時，請重新嘗試');
                return;
            }

            trackLoginCallback('restored', 'google', {
                path: window.location.pathname,
                provider: data.session.user.app_metadata?.provider || 'google',
            });
            trackAction('login_callback_restored', {
                provider: data.session.user.app_metadata?.provider || 'google',
                path: window.location.pathname,
            });
        };

        void finalize();

        return () => {
            active = false;
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
