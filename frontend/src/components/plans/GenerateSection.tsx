import { useState } from 'react';
import { GuestUpsell } from '../shared/GuestUpsell';
import { JobStatusCard } from './JobStatusCard';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Loader2, Bot } from 'lucide-react';

interface Props {
  planType: 'exercise' | 'diet';
  onPlanGenerated: () => void;
}

export function GenerateSection({ planType, onPlanGenerated }: Props) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [authError, setAuthError] = useState(false);
  
  const isGuest = useAuthStore(state => state.isGuest);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setAuthError(false);
    setJobId(null);

    try {
      const res = await api.post(`/planner/plans/generate/${planType}`, {});
      setJobId(res.data.job_id);
    } catch (err: any) {
      if (err.isAuthError || err.response?.status === 401) {
        setAuthError(true);
        toast.info('Login required to generate plans');
      } else {
        toast.error(getErrorMessage(err, 'Failed to start plan generation'));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {!jobId && (
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 py-5 px-8 md:px-10 shadow-2xl group flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] ${planType === 'exercise' ? 'from-lime-400/10' : 'from-orange-500/10'} via-slate-900/0 to-transparent opacity-50 pointer-events-none mix-blend-overlay`}></div>
          <div className="absolute top-0 right-0 p-8 opacity-5">
            {planType === 'exercise' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-lime-400"><path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.404 2.768a2 2 0 1 1 2.829 2.829l1.768-1.767a2 2 0 1 1 2.828 2.829L7.465 13.023a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.829-2.828z"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
            )}
          </div>
          
          <div className="relative z-10 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <h3 className={`text-[24px] leading-[30px] font-black italic uppercase tracking-tighter mb-2 ${planType === 'exercise' ? 'text-lime-400' : 'text-orange-500'}`}>
                {planType === 'exercise' ? 'NEED A NEW ROUTINE?' : 'TIME TO MEAL PREP?'}
              </h3>
              <p className="text-xs font-medium uppercase text-[#90a1b9] max-w-md leading-4">
                {planType === 'exercise' ? 'Generates a full week based on your latest metrics.' : 'Generates 7 days of meals matching your dietary profile.'}
              </p>
            </div>
            
            <div className="flex items-start gap-2.5 p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 max-w-xl">
              <Bot className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400/90">Custom AI Model Required</p>
                <p className="text-xs leading-relaxed text-indigo-300 mt-1">
                  Plan generation uses your own LLM configuration to build personalized schedules. Add your API key in <Link to="/llm-config" className="font-bold underline hover:text-indigo-200 transition-colors">LLM Config</Link> to unlock this feature.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 shrink-0">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`relative overflow-hidden w-full md:w-auto flex items-center justify-center rounded-[14px] px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 disabled:opacity-50 shadow-lg ${
                planType === 'exercise' 
                  ? 'bg-lime-400 text-slate-950 hover:bg-lime-300 hover:shadow-[0_4px_12px_rgba(190,242,100,0.15)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]' 
                  : 'bg-orange-500 text-white hover:bg-orange-400 hover:shadow-[0_4px_12px_rgba(249,115,22,0.15)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
              }`}
            >
              {planType === 'exercise' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute -right-2 -bottom-2 opacity-15 text-slate-950 pointer-events-none"><path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.404 2.768a2 2 0 1 1 2.829 2.829l1.768-1.767a2 2 0 1 1 2.828 2.829L7.465 13.023a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.829-2.828z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute -right-2 -bottom-2 opacity-15 text-orange-950 pointer-events-none"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
              )}
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2 relative z-10" /> : null}
              <span className="relative z-10">GENERATE PLAN</span>
            </button>
          </div>
        </div>
      )}

      {jobId && (
        <JobStatusCard 
          jobId={jobId} 
          planType={planType} 
          onComplete={() => {
            onPlanGenerated();
            setTimeout(() => setJobId(null), 3000);
          }}
          onClear={() => setJobId(null)}
        />
      )}

      {authError && isGuest && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <GuestUpsell 
             title="Login Required" 
             description={`Sign in to generate personalized AI ${planType} plans.`}
             actionLabel="Sign In" 
             onAction={() => navigate('/login')} 
             variant="inline"
             className="w-full sm:w-[600px] border-rose-500/30 bg-rose-950/10"
          />
        </div>
      )}
    </div>
  );
}
