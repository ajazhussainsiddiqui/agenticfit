import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';
import { useAuthStore } from '../../stores/authStore';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  title?: string | ReactNode;
  description?: string | ReactNode;
  hideGuestBanner?: boolean;
}

export function PageWrapper({ children, className = '', title, description, hideGuestBanner }: PageWrapperProps) {
  const isGuest = useAuthStore(state => state.isGuest);
  const session = useAuthStore(state => state.session);

  return (
    <div className={`p-4 md:p-8 pb-24 md:pb-28 max-w-7xl mx-auto w-full ${className}`}>
      {isGuest && !session && !hideGuestBanner && (
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-lime-900/40 to-slate-900/40 border border-lime-500/20 p-3 sm:px-5 shadow-lg backdrop-blur-sm animate-fade-in-up">
          <div className="flex-1">
            <h3 className="text-xs font-bold text-lime-400 uppercase tracking-widest mb-0.5">Create an Account</h3>
            <p className="text-[10px] font-medium text-slate-300 tracking-wide">Save your progress, sync across devices, and unlock premium features.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link to="/login" className="flex-1 sm:flex-none text-center px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-lime-400 transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="flex-1 sm:flex-none text-center rounded-xl bg-lime-400 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-950 hover:bg-lime-500 transition-colors shadow-[0_0_20px_rgba(190,242,100,0.15)]">
              Sign Up
            </Link>
          </div>
        </div>
      )}
      {(title || description) && (
        <div className="mb-8 pl-1">
          {title && <h1 className="text-4xl md:text-[48px] leading-tight md:leading-[48px] font-black italic uppercase tracking-tighter text-slate-50 mb-4 break-words">{title}</h1>}
          {description && <p className="font-bold text-[12px] leading-[16px] uppercase tracking-widest text-slate-400 max-w-2xl break-words">{description}</p>}
        </div>
      )}
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </div>
  );
}
