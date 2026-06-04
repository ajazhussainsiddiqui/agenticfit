import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, ChevronUp } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useUiStore } from '../../stores/uiStore';
import { ChatHeader } from '../chat/ChatHeader';
import { ChatMessageList } from '../chat/ChatMessageList';
import { HITLBanner } from '../chat/HITLBanner';
import { ChatInput } from '../chat/ChatInput';
import { useChatStream } from '../../hooks/useChatStream';
import { cn } from '../../lib/utils';

export function CommandBar() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isOpen = useChatStore(state => state.isOpen);
  const setIsOpen = useChatStore(state => state.setIsOpen);
  const toggleOpen = useChatStore(state => state.toggleOpen);
  const sidebarOpen = useUiStore(state => state.sidebarOpen);
  const { isStreaming } = useChatStream();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleOpen();
      }
      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleOpen, setIsOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className={cn("fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-[opacity,margin] duration-300 ease-in-out", !isLandingPage && (sidebarOpen ? "ml-64" : "ml-0 lg:ml-64"))}
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen ? (
        <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none transition-[margin] duration-300 ease-in-out", !isLandingPage && (sidebarOpen ? "ml-64" : "ml-0 lg:ml-64"))}>
          <div className="w-full max-w-4xl h-[85dvh] lg:h-[80vh] flex flex-col overflow-hidden rounded-[32px] border border-slate-800/50 bg-slate-950/20 backdrop-blur-3xl shadow-[0_20px_80px_rgba(0,0,0,0.8)] pointer-events-auto animate-in zoom-in-95 duration-200">
            <ChatHeader />
            <ChatMessageList />
            <HITLBanner />
            <ChatInput />
          </div>
        </div>
      ) : (
        <div className={cn("fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 transition-[margin] duration-300 ease-in-out", !isLandingPage && (sidebarOpen ? "ml-64" : "ml-0 lg:ml-64"))}>
          <div 
            className="w-full max-w-2xl bg-white/5 backdrop-blur-xl rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-white/10 transition-all active:scale-[0.98]"
            onClick={() => setIsOpen(true)}
            role="button"
            aria-label="Open AI Chat"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setIsOpen(true);
              }
            }}
          >
            <div className="flex items-center gap-3 text-slate-500 hover:text-slate-400">
              <div className="relative">
                <Sparkles className="h-5 w-5 text-lime-400" />
                {isStreaming && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-400"></span>
                  </span>
                )}
              </div>
              <span className="text-sm font-bold tracking-tight text-slate-100">Ask AgenticFit anything...</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden gap-1 sm:flex text-slate-400">
                <kbd className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 font-mono text-[10px]">
                  ⌘
                </kbd>
                <kbd className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 font-mono text-[10px]">
                  K
                </kbd>
              </div>
              <div className="p-1 text-slate-500 bg-slate-800/50 rounded-full border border-slate-700 hover:bg-slate-700 transition-colors">
                <ChevronUp className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
