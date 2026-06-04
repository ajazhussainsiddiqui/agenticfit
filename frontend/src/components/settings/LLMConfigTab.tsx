import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/utils';
import { Loader2, Server, KeyRound, EyeOff, Eye, Zap, ShieldCheck, AlertCircle } from 'lucide-react';
import { GuestUpsell } from '../shared/GuestUpsell';
import { useNavigate } from 'react-router-dom';

export function LLMConfigTab() {
  const [provider, setProvider] = useState('');
  const [modelName, setModelName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [showKey, setShowKey] = useState(false);
  
  const [authError, setAuthError] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.session?.user);
  const isGuest = useAuthStore(state => state.isGuest);
  

  const { data: currentConfig, isLoading: configLoading, error: configError } = useQuery({
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

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/planner/set-llm-keys', payload);
      return res.data;
    },
    onSuccess: (data, variables) => {
      if (variables.provider === 'builtin-model') {
        toast.success('Custom LLM config removed. Reverted to default model.');
      } else {
        toast.success('Model configuration saved');
      }
      queryClient.setQueryData(['byok-details', user?.email], data);
      queryClient.invalidateQueries({ queryKey: ['left-tokens'] });
      setAuthError(false);
      setApiKey(''); // clear key on save
    },
    onError: (err: any) => {
      if (err.isAuthError || err.response?.status === 401) {
        setAuthError(true);
        toast.info('Login required to update LLM configuration');
      } else {
        toast.error(getErrorMessage(err, 'Failed to save configuration'));
      }
    }
  });

  const handleSave = () => {
    saveMutation.mutate({ provider, model_name: modelName, api_key: apiKey, base_url: baseUrl });
  };

  const handleUseBuiltin = () => {
    saveMutation.mutate({ provider: 'builtin-model', model_name: '' });
  };

  const isApiKeyOptional = !['OpenAI', 'Anthropic', 'huggingface', 'Gemini'].includes(provider);

  return (
    <div className="space-y-6">
      {/* Current Config Display */}
      <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-950 border border-slate-800 text-lime-400 shadow-inner">
            <Server className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase tracking-widest text-slate-100">Active Pipeline</h3>
            {configLoading ? (
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Loading...</p>
            ) : currentConfig && (currentConfig.model_name || currentConfig.provider) && currentConfig.provider !== 'builtin-model' ? (
              <p className="mt-2 text-sm text-slate-400 font-mono">
                {currentConfig.provider && (<>PROVIDER_ACTIVE: <span className="text-lime-400">{currentConfig.provider}</span> / </>)}MODEL: <span className="text-lime-400">{currentConfig.model_name}</span>
              </p>
            ) : (
              <div className="mt-2">
                {configError ? (
                  <p className="text-sm text-amber-500 font-mono">{configError.message}</p>
                ) : (
                  <div>
                    <p className="text-sm text-slate-400 font-mono">DEFAULT MODEL ACTIVE</p>
                    <p className="text-xs text-slate-500 mt-1">Only for chat support (text only model)</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {(!currentConfig || !((currentConfig.model_name || currentConfig.provider) && currentConfig.provider !== 'builtin-model')) && !configLoading && (
          <div className="w-full sm:w-64 shrink-0">
            {tokenLoading ? (
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Fetching Quota...</p>
            ) : tokenData ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500 flex items-center gap-1"><Zap className="h-3 w-3" /> TOKEN QUOTA</span>
                  <span className={tokenData.remaining_tokens > 0 ? "text-lime-400" : "text-red-400"}>
                    {tokenData.remaining_tokens.toLocaleString()} / {tokenData.daily_token_limit.toLocaleString()}
                  </span>
                </div>
                <div className="h-[10px] w-full max-w-[256px] bg-[#619150] rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full transition-all duration-500 ${tokenData.remaining_tokens > 0 ? "bg-lime-400" : "bg-red-500"}`} 
                    style={{ width: `${Math.min(100, Math.max(0, (tokenData.remaining_tokens / Math.max(tokenData.daily_token_limit, 1)) * 100))}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        )}

        {currentConfig && (currentConfig.model_name || currentConfig.provider) && currentConfig.provider !== 'builtin-model' && (
          <button
            onClick={handleUseBuiltin}
            disabled={saveMutation.isPending}
            className="rounded-xl border border-slate-800 bg-slate-950 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:bg-slate-900 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-500 text-center"
          >
            Remove Custom Config
          </button>
        )}
      </div>

      {/* Form */}
      <div className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
        <h3 className="mb-2 text-2xl font-black italic uppercase tracking-tighter text-slate-100">CONFIGURATION</h3>
        <p className="text-sm font-medium text-slate-400 mb-8 max-w-2xl leading-relaxed">Connect your own API key to bypass token limits and unlock features.</p>
        
        <div className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Provider</label>
              <input
                type="text"
                list="provider-options"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="Select or type a provider"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors appearance-none"
              />
              <datalist id="provider-options">
                <option value="Gemini">Gemini (Google)</option>
                <option value="OpenAI">OpenAI</option>
                <option value="Anthropic">Anthropic</option>
                <option value="huggingface">Hugging Face</option>
                <option value="Mistral">Mistral</option>
                <option value="Ollama">Ollama (Local)</option>
              </datalist>
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Model Name <span className="text-rose-500 border-none">*</span>
              </label>
              <input
                type="text"
                required
                value={modelName || ''}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. gpt-4o"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 placeholder:text-slate-700 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">API Key</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey || ''}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                autoComplete="off"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-4 pr-12 py-3 text-slate-300 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 placeholder:text-slate-700 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-top-2">
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Base URL <span className="text-slate-600 font-normal normal-case">(Optional)</span></label>
            <input
              type="text"
              value={baseUrl || ''}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1 or http://localhost:11434/v1"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 placeholder:text-slate-700 transition-colors font-mono"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending || !modelName}
              className="inline-flex items-center justify-center rounded-xl bg-lime-400 px-8 py-4 text-[10px] tracking-widest uppercase font-bold text-slate-950 transition-all duration-200 hover:bg-lime-500 shadow-[0_0_20px_rgba(190,242,100,0.15)] focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <KeyRound className="h-4 w-4 mr-2" />}
              SAVE KEY
            </button>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[32px] border border-slate-800 bg-slate-900/10 p-6 backdrop-blur-md hover:border-indigo-500/30 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4">
             <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
               <Zap className="h-5 w-5" />
             </div>
             <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Unlock Features</h4>
          </div>
          <p className="text-sm font-medium text-slate-400 leading-relaxed">
            A custom model is required for <span className="text-indigo-400">Plans</span> (diet/exercise) generation and <span className="text-indigo-400">Food Vision</span> (requires a vision-supported LLM).
          </p>
        </div>
        
        <div className="rounded-[32px] border border-slate-800 bg-slate-900/10 p-6 backdrop-blur-md hover:border-lime-500/30 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4">
             <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-500/10 text-lime-400">
               <ShieldCheck className="h-5 w-5" />
             </div>
             <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-300">100% Private</h4>
          </div>
          <p className="text-sm font-medium text-slate-400 leading-relaxed">
            Keys auto-delete after 24 hours. You can also manually revoke access instantly via <span className="text-lime-400">"Remove Custom Config"</span> button.
          </p>
        </div>
        
        <div className="rounded-[32px] border border-slate-800 bg-slate-900/10 p-6 backdrop-blur-md hover:border-rose-500/30 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4">
             <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
               <AlertCircle className="h-5 w-5" />
             </div>
             <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Important</h4>
          </div>
          <p className="text-sm font-medium text-slate-400 leading-relaxed">
            Please <span className="text-rose-400">log in first</span>! Keys saved in <span className="text-rose-400">guest mode risk</span> being use by other temporary (guest) users.
          </p>
        </div>
      </div>

      {authError && isGuest && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <GuestUpsell 
            title="Authentication Error" 
            description="You must be logged in to modify network configurations."
            actionLabel="Sign In" 
            onAction={() => navigate('/login')} 
            variant="inline"
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
