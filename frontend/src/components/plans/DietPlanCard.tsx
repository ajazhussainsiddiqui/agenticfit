import { useState } from 'react';
import { Calendar, ChevronRight, Trash2, Loader2, Utensils } from 'lucide-react';
import { PlanFeedbackForm } from './PlanFeedbackForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/utils';

interface Props {
  plan: any;
  onViewDetails: (plan: any) => void;
}

export function DietPlanCard({ plan, onViewDetails }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/planner/plan/diet/delete?diet_id=${plan.id}`);
    },
    onSuccess: () => {
      toast.success('Plan deleted');
      queryClient.invalidateQueries({ queryKey: ['diet-history'] });
    },
    onError: (err: any) => {
      if (err.isAuthError || err.response?.status === 401) {
        toast.error('Login required to delete plan');
      } else {
        toast.error(getErrorMessage(err, 'Failed to delete plan'));
      }
    }
  });

  return (
    <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
      <div>
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
             <div className="rounded-full bg-orange-500/10 p-3 text-orange-500">
               <Utensils className="h-6 w-6" />
             </div>
             <div>
               <h3 className="text-xl font-bold text-slate-50">Diet Plan</h3>
               <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                 <Calendar className="h-3 w-3" />
                 {new Date(plan.created_at).toLocaleDateString()}
               </div>
             </div>
          </div>
          
          <button 
            onClick={() => setShowConfirm(true)}
            className="p-2 text-slate-500 hover:text-rose-500 transition-colors bg-slate-800 rounded-xl"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => onViewDetails(plan)}
          className="flex w-full items-center justify-between rounded-xl bg-slate-800 px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-300 transition-colors hover:bg-slate-700 hover:text-slate-100"
        >
          VIEW FULL PLAN
          <ChevronRight className="h-4 w-4 text-orange-500" />
        </button>

        <PlanFeedbackForm 
          planId={plan.id} 
          planType="diet" 
          initialFeedback={plan.user_feedback} 
          plan={plan}
        />
      </div>

      {showConfirm && (
        <div className="absolute inset-x-4 bottom-4 rounded-[32px] border border-rose-500/20 bg-slate-950 p-6 shadow-2xl z-20">
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-4">Confirm Deletion?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 rounded-xl bg-slate-800 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-100"
            >
              CANCEL
            </button>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="flex-1 flex items-center justify-center rounded-xl bg-rose-500 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-50 hover:bg-rose-600 disabled:opacity-50 transition-colors"
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'DELETE'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
