import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Loader2, XCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  jobId: string;
  planType: 'exercise' | 'diet';
  onComplete: () => void;
  onClear: () => void;
}

export function JobStatusCard({ jobId, planType, onComplete, onClear }: Props) {
  const { data, error } = useQuery({
    queryKey: ['plan-status', jobId],
    queryFn: async () => {
      const res = await api.get(`/planner/plans/status/${jobId}`);
      return res.data;
    },
    refetchInterval: (query) => {
      if (query.state.data?.status === 'completed' || 
          query.state.data?.status?.startsWith('failed') || 
          query.state.error) {
        return false;
      }
      return 3000;
    },
  });

  useEffect(() => {
    if (data?.status === 'completed') {
      toast.success(`${planType === 'exercise' ? 'Exercise' : 'Diet'} plan generated successfully!`);
      onComplete();
    } else if (data?.status?.startsWith('failed')) {
      toast.error(`Failed to generate plan: ${data.status.replace('failed: ', '')}`);
    }
  }, [data?.status, planType, onComplete]);

  const isFailed = data?.status?.startsWith('failed') || error;
  const isCompleted = data?.status === 'completed';

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-4">
        {isCompleted ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
        ) : isFailed ? (
          <XCircle className="h-6 w-6 text-red-500" />
        ) : (
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        )}
        
        <div>
          <h4 className="text-sm font-semibold text-white">
            {isCompleted ? 'Plan Ready' : isFailed ? 'Generation Failed' : 'Generating your plan...'}
          </h4>
          <p className="text-xs text-zinc-500 font-mono mt-1">Job ID: {jobId}</p>
          {isFailed && (
            <p className="text-xs text-red-500 mt-1 max-w-md break-words">
              {data?.status?.startsWith('failed') ? data.status.replace('failed: ', '') : (error as Error)?.message || 'Unknown error'}
            </p>
          )}
        </div>
      </div>

      {(isFailed || isCompleted) && (
        <button
          onClick={onClear}
          className="text-sm font-medium text-zinc-400 hover:text-white"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
