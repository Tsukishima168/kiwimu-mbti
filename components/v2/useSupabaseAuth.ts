import { useState, useEffect } from 'react';
import { getAuthSupabaseClient } from '../../utils/supabaseAuthBridge';
import { buildPassportLoginUrl } from '../../utils/authStorage';

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

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(session !== null);
      setEmail(session?.user?.email ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(session !== null);
      setEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isLoggedIn, isLoading, email };
}

export async function loginWithGoogle(): Promise<void> {
  window.location.href = buildPassportLoginUrl();
}
