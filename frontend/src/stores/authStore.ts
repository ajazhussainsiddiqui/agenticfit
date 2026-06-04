import { create } from 'zustand';

interface AuthState {
  session: any | null;        // Supabase session
  user: { email: string; name: string } | null;
  isAuthenticated: boolean;   // true if session exists
  isGuest: boolean;          // always true when !isAuthenticated
  setSession: (session: any) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isAuthenticated: false,
  isGuest: true,
  setSession: (session) => set({ 
    session, 
    user: session?.user ? { email: session.user.email, name: session.user.user_metadata?.full_name || session.user.email.split('@')[0] || 'User' } : null,
    isAuthenticated: !!session, 
    isGuest: !session 
  }),
  clearSession: () => set({ session: null, user: null, isAuthenticated: false, isGuest: true }),
}));
