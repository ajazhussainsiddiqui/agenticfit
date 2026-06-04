import { RefreshCcw, ChevronDown, Sparkles, Zap, Settings, Server } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export function ChatHeader() {
  const setOpen = useChatStore(state => state.setIsOpen);
  const startNewThread = useChatStore(state => state.startNewThread);
  const threadId = useChatStore(state => state.threadId);
  const navigate = useNavigate();
  const user = useAuthStore(state => state.session?.user)

  const { data: currentConfig, isLoading: configLoading } = useQuery({
    queryKey: ['byok-details', user?.email],
    queryFn: async () => {
      try {
        const endpoint = user?.email 
          ? `/planner/get-byok-details?email=${encodeURIComponent(user.email)}` 
          : `/planner/get-byok-details`;
        const res = await api.get(endpoint);
        return res.data;
      } catch (err: any) {
        if (err.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    retry: false
  });

  const { data: tokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ['left-tokens'],
    queryFn: async () => {
      try {
        const res = await api.get('/chat/left-tokens');
        return res.data;
      } catch (err: any) {
        return null;
      }
    },
    retry: false
  });

  const isCustomModel = currentConfig && (currentConfig.model_name || currentConfig.provider) && currentConfig.provider !== 'builtin-model';

  return (
    <div className="flex items-center justify-between border-b border-slate-800/50 bg-transparent px-3 sm:px-6 py-2 sm:py-4 shrink-0 gap-2 shrink-0">
      <div className="flex items-center gap-1.5 sm:gap-3 text-slate-100 sm:min-w-[140px] shrink-0">
        <Sparkles className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-lime-400" />
        <span className="text-[10px] sm:text-sm font-bold uppercase tracking-widest">AgenticFit</span>
        <span className="rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-500 font-mono hidden sm:inline-block tracking-wider">
          {threadId.substring(0, 8)}
        </span>
      </div>

      <div className="flex flex-1 items-center justify-center sm:px-4 gap-2 sm:gap-6 min-w-0">
        {configLoading || tokenLoading ? (
          <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-500">Loading...</p>
        ) : isCustomModel ? (
          <div className="flex items-center gap-1.5 sm:gap-2 rounded bg-slate-900 border border-slate-800 px-2 py-1 sm:px-4 sm:py-2 truncate">
             <Server className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-lime-400 shrink-0" />
             <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">
               <span className="hidden sm:inline">{currentConfig.provider && `${currentConfig.provider} / `}MODEL: </span>
               <span className="sm:hidden">MDL: </span>
               <span className="text-lime-400">{currentConfig.model_name}</span>
             </span>
          </div>
        ) : tokenData ? (
          <div className="w-16 sm:w-full sm:max-w-[200px] flex flex-col justify-center gap-0.5 sm:gap-0 sm:space-y-1.5 opacity-80 hover:opacity-100 transition-opacity shrink-0">
            <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">
              <span className="text-slate-500 hidden sm:flex items-center gap-1"><Zap className="h-3 w-3" /> TOKEN QUOTA</span>
              <span className="text-slate-500 sm:hidden flex items-center"><Zap className="h-2.5 w-2.5" /></span>
              <span className={tokenData.remaining_tokens > 0 ? "text-lime-400" : "text-red-400"}>
                <span className="hidden sm:inline">{tokenData.remaining_tokens.toLocaleString()} / {tokenData.daily_token_limit.toLocaleString()}</span>
                <span className="sm:hidden">{Math.round((tokenData.remaining_tokens / Math.max(tokenData.daily_token_limit, 1)) * 100)}%</span>
              </span>
            </div>
            <div className="h-1 sm:h-1.5 w-full bg-[#619150] rounded-full overflow-hidden border border-slate-800">
              <div 
                className={`h-full transition-all duration-500 ${tokenData.remaining_tokens > 0 ? "bg-lime-400" : "bg-red-500"}`} 
                style={{ width: `${Math.min(100, Math.max(0, (tokenData.remaining_tokens / Math.max(tokenData.daily_token_limit, 1)) * 100))}%` }}
              />
            </div>
          </div>
        ) : null}
        
        <button
          onClick={() => {
            setOpen(false);
            navigate('/llm-config');
          }}
          className="hidden sm:flex items-center gap-1.5 rounded bg-slate-800 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-300 hover:bg-slate-700 hover:text-white transition-colors shrink-0"
        >
          <Settings className="h-3 w-3" />
          LLM Config
        </button>
      </div>

      <div className="flex items-center justify-end gap-1 sm:gap-3 sm:min-w-[140px] shrink-0">
        <button
          onClick={() => {
            setOpen(false);
            navigate('/llm-config');
          }}
          className="sm:hidden flex items-center justify-center rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-50 transition-colors"
          title="LLM Config"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={startNewThread}
          className="flex items-center justify-center gap-2 rounded sm:rounded-xl p-1 sm:px-3 sm:py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-800 hover:text-slate-50 transition-colors"
          title="New Thread"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Thread</span>
        </button>
        <div className="hidden sm:block h-5 w-px bg-slate-800 mx-2" />
        <button
          onClick={() => setOpen(false)}
          className="rounded sm:rounded-xl p-1 sm:p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-50 transition-colors"
          title="Close (Esc)"
        >
          <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </div>
  );
}
