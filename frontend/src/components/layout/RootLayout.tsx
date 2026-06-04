import { useEffect, useState } from 'react';
import { Outlet, useLocation} from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { CommandBar } from './CommandBar';
import { useUiStore } from '../../stores/uiStore';
import { Menu } from 'lucide-react';
import api, { API_BASE_URL } from '../../lib/api';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';

export function RootLayout() {
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const session = useAuthStore(state => state.session);
  const isGuest = useAuthStore(state => state.isGuest);
  const location = useLocation();
  
  const isLandingPage = location.pathname === '/';

  // Auto-creates user & dependencies on the backend if authenticated
  useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const res = await api.get('/planner/users/search');
      return res.data;
    },
    enabled: !!session && !isGuest,
    retry: false,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  useEffect(() => {
    let mounted = true;
    
    // Check health endpoint on mount
    api.get(`${API_BASE_URL}/health`)
      .then(() => {
        if (mounted) setApiStatus('ok');
      })
      .catch((err) => {
        console.error('Health check failed', err);
        if (mounted) setApiStatus('error');
      });

    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-950 text-slate-50">
      {!isLandingPage && <Sidebar apiStatus={apiStatus} />}
      
      {/* Mobile Sidebar Overlay */}
      {!isLandingPage && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <main 
        className={cn(
          "flex-1 transition-[padding] duration-300 ease-in-out flex flex-col",
          !isLandingPage ? (sidebarOpen ? 'pl-64' : 'pl-0 lg:pl-64') : ''
        )}
      >
        {/* Mobile header */}
        {!isLandingPage && (
          <header className="sticky top-0 z-30 flex shrink-0 h-16 items-center gap-4 border-b border-slate-800 bg-slate-950 px-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-slate-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-1 text-2xl font-black italic uppercase tracking-tighter text-slate-50">
              AgenticFit
            </div>
          </header>
        )}

        <div className="flex-1 min-h-[calc(100vh-64px)] lg:min-h-screen bg-slate-950">
          <Outlet />
        </div>
      </main>

      <CommandBar />
    </div>
  );
}
