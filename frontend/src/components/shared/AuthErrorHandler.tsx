import { ReactNode } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { GuestUpsell } from './GuestUpsell';
import { useNavigate } from 'react-router-dom';

interface AuthErrorHandlerProps {
  error: any;
  isInitialLoad?: boolean;
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export function AuthErrorHandler({ 
  error, 
  isInitialLoad = false, 
  children,
  fallbackTitle = "Authentication Required",
  fallbackDescription = "Sign in to access this feature."
}: AuthErrorHandlerProps) {
  const isGuest = useAuthStore(state => state.isGuest);
  const navigate = useNavigate();

  const isAuthError = error?.isAuthError || error?.response?.status === 401;

  if (isAuthError) {
    return (
      <div className="w-full flex justify-center py-6">
        <GuestUpsell 
          title={fallbackTitle} 
          description={fallbackDescription} 
          actionLabel="Sign In" 
          onAction={() => navigate('/login')} 
          variant={isInitialLoad ? "card" : "inline"}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[32px] border border-rose-500/20 bg-slate-900/40 p-8 text-center shadow-lg">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-2">Error Loading Data</h3>
        <p className="text-sm font-mono text-slate-400">{error.message || 'Something went wrong.'}</p>
      </div>
    );
  }

  return <>{children}</>;
}
