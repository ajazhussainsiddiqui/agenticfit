import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { getErrorMessage } from '../../lib/utils';

interface Props {
  planId: number;
  planType: 'exercise' | 'diet';
  initialFeedback?: string;
  initialCompletion?: number;
  plan?: any;
}

export function PlanFeedbackForm({ planId, planType, initialFeedback = '', initialCompletion = 0, plan }: Props) {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [completion, setCompletion] = useState(initialCompletion);
  const queryClient = useQueryClient();
  const isGuest = useAuthStore(state => state.isGuest);
  const user = useAuthStore(state => state.user);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: any = { id: planId, user_feedback: feedback };
      if (planType === 'exercise') {
        payload.completed_percentage = completion;
        payload.exercises = plan?.exercises ? plan.exercises : plan || {};
      }
      if (planType === 'diet') {
        payload.user_email = user?.email;
        payload.diet_plan = plan?.diet_plan ? plan.diet_plan : plan || {};
      }
      await api.patch(`/planner/plans/${planType}/update`, payload);
    },
    onSuccess: () => {
      toast.success('Feedback saved successfully');
      queryClient.invalidateQueries({ queryKey: [`${planType}-history`] });
    },
    onError: (err: any) => {
      if (err.isAuthError || err.response?.status === 401) {
        toast.error('Login required to submit feedback');
      } else {
        toast.error(getErrorMessage(err, 'Failed to save feedback'));
      }
    }
  });

  return (
    <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-4">
      {planType === 'exercise' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completion</label>
            <span className="text-sm font-bold text-lime-400 font-mono">{completion}%</span>
          </div>
          <div className="relative pt-1">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={completion || 0}
              onChange={(e) => setCompletion(parseInt(e.target.value, 10))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none shadow-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-lime-400 [&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(190,242,100,0.4)] [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-lime-400 [&::-moz-range-thumb]:shadow-[0_0_20px_rgba(190,242,100,0.4)]"
              style={{ background: `linear-gradient(to right, #bef264 ${completion || 0}%, #1e293b ${completion || 0}%)` }}
            />
          </div>
        </div>
      )}
      
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">Notes & Feedback</label>
        <textarea
          value={feedback || ''}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="How did this plan work for you?"
          rows={2}
          className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500"
        />
      </div>

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || isGuest}
        className="w-full flex items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white disabled:opacity-50"
      >
        {mutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
        Save
      </button>
    </div>
  );
}
