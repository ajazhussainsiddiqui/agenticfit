import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setSession, clearSession } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
      } else {
        clearSession();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
      } else {
        clearSession();
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, clearSession]);

  return <>{children}</>;
}
