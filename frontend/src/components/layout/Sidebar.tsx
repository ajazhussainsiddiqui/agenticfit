import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';
import { Home, LayoutDashboard, CalendarCheck, Map, Dumbbell, Camera, Brain, User} from 'lucide-react';

import { Logo } from '../shared/Logo';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/daily-log', icon: CalendarCheck, label: 'Daily Log' },
  { to: '/plans', icon: Map, label: 'Plans' },
  { to: '/workouts', icon: Dumbbell, label: 'Workouts' },
  { to: '/food-vision', icon: Camera, label: 'Food Vision' },
  { to: '/profile', icon: User, label: 'My Profile' },
  { to: '/llm-config', icon: Brain, label: 'LLM Config' },
];

interface SidebarProps {
  apiStatus: 'checking' | 'ok' | 'error';
}

export function Sidebar({ apiStatus }: SidebarProps) {
  const { isGuest, user, clearSession } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  return (
    <>
      {/* Sidebar background: #0f0f12 */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-800 bg-slate-950/95 backdrop-blur-xl transition-[width] duration-300 ease-in-out lg:w-64 overflow-hidden focus-visible:outline-none whitespace-nowrap",
          sidebarOpen ? "w-64" : "w-0"
        )}
        aria-label="Main Navigation Sidebar"
      >
        <div className="flex h-20 shrink-0 items-center justify-center gap-3 px-4 pt-6 pb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-lime-400 font-bold text-slate-950 text-lg shadow-inner overflow-hidden" aria-hidden="true">
            <Logo className="w-full h-full text-white" />
          </div>
          <span className="text-2xl font-black italic uppercase tracking-tighter text-slate-50">AgenticFit</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto" aria-label="Main menu">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all mb-1 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none",
                isActive 
                  ? "bg-slate-900 text-lime-400 border border-slate-800" 
                  : "text-slate-500 hover:text-lime-400 border border-transparent"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-800 p-4">
          <div className="mb-[7px] h-[25.6px] px-[12px] py-[8px] flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50" aria-live="polite">
            <span className="relative flex h-2 w-2 shrink-0">
              {apiStatus === 'ok' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>}
              <span className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                apiStatus === 'ok' ? "bg-lime-400 shadow-[0_0_8px_#bef264]" : 
                apiStatus === 'checking' ? "bg-indigo-400 animate-pulse" : "bg-rose-500"
              )} aria-hidden="true"></span>
            </span>
            <div className="flex-1 truncate">
              <p className={cn(
                "text-[10px] font-bold uppercase tracking-widest truncate font-mono",
                apiStatus === 'ok' ? "text-lime-400" : 
                apiStatus === 'checking' ? "text-indigo-400" : "text-rose-500"
              )}>
                {apiStatus === 'ok' ? 'Connected (API)' : apiStatus === 'checking' ? 'Connecting (API)...' : 'Disconnected (API)'}
              </p>
            </div>
          </div>

          <div className="mb-2 px-1">
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-lime-400" aria-hidden="true">
                <User className="h-5 w-5" />
              </div>
              <div className="flex flex-1 flex-col min-w-0">
                {isGuest ? (
                  <>
                    <span className="truncate text-sm font-medium text-slate-50" title="Guest User">
                      Guest User
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1 truncate">
                      Unregistered
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] w-full text-center font-mono text-slate-400 break-all leading-tight mt-0.5" title={user?.email}>
                      {user?.email}
                    </span>
                    <button 
                      onClick={async () => {
                        const { supabase } = await import('../../lib/supabase');
                        await supabase.auth.signOut();
                        clearSession();
                      }}
                      className="flex items-center mx-auto justify-center w-fit gap-1 text-[10px] font-bold uppercase tracking-widest text-red-500 transition-colors cursor-pointer hover:text-red-400 text-center focus-visible:outline-none focus-visible:underline mt-1.5"
                      aria-label="Log Out"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
