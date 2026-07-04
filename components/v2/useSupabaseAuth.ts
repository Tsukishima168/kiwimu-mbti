import { useState, useEffect } from 'react';
import { getAuthSupabaseClient } from '../../utils/supabaseAuthBridge';
import { openPassportLogin, PASSPORT_AUTH_COMPLETE_EVENT, type PassportLoginUiOptions } from '../../utils/authStorage';

export interface SupabaseAuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  email: string | null;
}

export function useSupabaseAuth(): SupabaseAuthState {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getAuthSupabaseClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const applySession = (session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) => {
      setIsLoggedIn(session !== null);
      setEmail(session?.user?.email ?? null);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    const handlePassportAuthComplete = () => {
      void supabase.auth.getSession().then(({ data: { session } }) => {
        applySession(session);
        setIsLoading(false);
      });
    };
    window.addEventListener(PASSPORT_AUTH_COMPLETE_EVENT, handlePassportAuthComplete);

    return () => {
      window.removeEventListener(PASSPORT_AUTH_COMPLETE_EVENT, handlePassportAuthComplete);
      subscription.unsubscribe();
    };
  }, []);

  return { isLoggedIn, isLoading, email };
}

export async function loginWithGoogle(options: Pick<PassportLoginUiOptions, 'onError'> = {}): Promise<void> {
  openPassportLogin({
    intent: 'v2_login',
    onError: (detail) => {
      options.onError?.(detail.message || '登入視窗已關閉，請再試一次。');
    },
  });
}
