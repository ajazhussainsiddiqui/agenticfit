import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ExerciseDayAccordion } from './ExerciseDayAccordion';
import { DietDayAccordion } from './DietDayAccordion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  plan: any;
  planType: 'exercise' | 'diet';
}

export function PlanDetailSheet({ isOpen, onClose, plan, planType }: Props) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !plan) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div 
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-slate-950 border-l border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-50">
              Weekly {planType} Plan
            </h2>
            <p className="text-[10px] font-mono mt-1 text-slate-500 uppercase tracking-widest">
              Created on {new Date(plan.created_at).toLocaleDateString()}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-800 hover:text-slate-50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {planType === 'exercise' && plan.exercises && (
            <ExerciseDayAccordion exercises={plan.exercises} />
          )}
          {planType === 'diet' && plan.diet_plan && (
            <DietDayAccordion dietPlan={plan.diet_plan} />
          )}
        </div>
      </div>
    </>
  );
}
