import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Github } from 'lucide-react';
import { Hero } from '../components/landing/Hero';
import { FeatureGrid } from '../components/landing/FeatureGrid';
import { useAuthStore } from '../stores/authStore';
import { Logo } from '../components/shared/Logo';

export function LandingPage() {
  const session = useAuthStore(state => state.session);
  const isGuest = useAuthStore(state => state.isGuest);
  const showAuthOptions = !session || isGuest;
  const navigate = useNavigate();

  useEffect(() => {
    if (session && !isGuest) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, isGuest, navigate]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 sm:gap-6 px-4 pt-6 sm:pt-8 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-lime-400 font-bold text-slate-950 text-lg shadow-inner overflow-hidden" aria-hidden="true">
            <Logo className="w-full h-full text-white" />
          </div>
          <span className="text-2xl font-black italic uppercase tracking-tighter text-slate-50">AgenticFit</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href="https://github.com/ajazhussainsiddiqui/agenticfit"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full h-9 sm:h-9 px-3 sm:px-3 transition-all shadow-sm"
            
            title="View on GitHub"
            aria-label="GitHub Repository"
          >
            <Github className="w-4 h-4 sm:w-5 sm:h-5" />
            
          </a>
          {showAuthOptions && (
            <>
              <Link 
                to="/login" 
                className="hidden sm:block text-sm font-semibold text-slate-400 transition-colors hover:text-lime-400"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="flex items-center justify-center border border-slate-700 rounded-xl h-9 sm:h-10 px-4 sm:px-6 bg-transparent text-white hover:bg-slate-800 transition-colors text-sm font-semibold whitespace-nowrap"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>

      <div>
        <Hero />
      </div>
      
      <FeatureGrid />
      
      <footer className="w-full max-w-7xl mx-auto pt-8 pb-16 md:pb-24 mb-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-slate-500 text-[10px] font-bold uppercase tracking-widest px-4 sm:px-8">
        <p>&copy; 2026 AgenticFit. All rights reserved.</p>
      </footer>
    </div>
  );
}
