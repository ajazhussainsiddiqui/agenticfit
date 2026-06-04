import { GuestUpsell } from '../shared/GuestUpsell';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { ChevronRight, Loader2, Plus, Dumbbell, Utensils } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

interface Props {
  isAuthError: boolean;
}

export function ActivePlans({ isAuthError }: Props) {
  const navigate = useNavigate();

  const { data: exerciseHistory, isLoading: exLoading } = useQuery({
    queryKey: ['exercise-history', 1],
    queryFn: async () => {
      const res = await api.get(`/planner/plans/exercise/history?search_limit=1`);
      return res.data;
    },
    enabled: !isAuthError,
    retry: false,
  });

  const { data: dietHistory, isLoading: dietLoading } = useQuery({
    queryKey: ['diet-history', 1],
    queryFn: async () => {
      const res = await api.get(`/planner/plans/diet/history?search_limit=1`);
      return res.data;
    },
    enabled: !isAuthError,
    retry: false,
  });

  const activeExercise = exerciseHistory?.[0];
  const activeDiet = dietHistory?.[0];

  const exFocus = activeExercise?.exercises 
    ? (Object.values(activeExercise.exercises)[0] as any)?.focus || "Custom Workout"
    : "Custom Workout";
    
  const totalWeeklyCalories = activeDiet?.diet_plan 
    ? Object.values(activeDiet.diet_plan).reduce((acc: number, details: any) => {
        const dailyCals = details.meals?.reduce((mAcc: number, meal: any) => mAcc + (meal.calories || 0), 0) || 0;
        return acc + dailyCals;
      }, 0) as number
    : 0;

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Active Plans</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {isAuthError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-[32px]">
             <GuestUpsell 
               title="Custom Action Plans" 
               description="Generate personalized plans after signing in to achieve your fitness goals." 
               actionLabel="Sign In" 
               onAction={() => navigate('/login')} 
             />
          </div>
        )}

        {/* Exercise Plan */}
        <div className={cn("flex flex-col justify-between rounded-[32px] border border-slate-800 border-l-4 border-l-lime-400 bg-slate-900 p-6", isAuthError && "opacity-30 pointer-events-none")}>
           <div>
             <div className="mb-2 flex items-center justify-between">
               <span className="text-[10px] font-bold uppercase tracking-widest text-lime-400 bg-lime-400/10 px-2 py-1 rounded-lg flex items-center gap-1">
                 <Dumbbell className="h-3 w-3" /> Exercise
               </span>
               <span className="text-xs text-slate-500 font-mono">
                 {activeExercise ? `Created: ${new Date(activeExercise.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : ''}
               </span>
             </div>
             
             {exLoading ? (
               <div className="flex justify-center items-center h-24">
                 <Loader2 className="h-6 w-6 animate-spin text-lime-400" />
               </div>
             ) : activeExercise ? (
               <>
                 <h4 className="text-xl font-bold text-slate-50 mt-4 mb-4 truncate" title={exFocus}>
                   {exFocus}
                 </h4>
                 
                 <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Progress</span>
                      <span className="font-medium text-slate-50 font-mono">{activeExercise.completed_percentage || '0'}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800">
                      <div className="h-2 rounded-full bg-lime-400 transition-all" style={{ width: `${activeExercise.completed_percentage || 0}%` }}></div>
                    </div>
                 </div>
               </>
             ) : (
               <div className="flex flex-col items-center justify-center py-6 text-center">
                 <p className="text-sm text-slate-400 mb-2">No active exercise plan</p>
                 <button 
                   onClick={() => navigate('/plans')}
                   className="text-[10px] font-bold uppercase tracking-widest text-lime-400 flex items-center gap-1 hover:text-lime-300 transition-colors"
                 >
                   <Plus className="h-3 w-3" /> Create One
                 </button>
               </div>
             )}
           </div>
           
           <button 
             onClick={() => navigate('/plans')}
             className="flex items-center justify-between rounded-full bg-slate-800 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-300 transition-all hover:bg-slate-700 hover:text-slate-100 mt-2 hover:text-lime-400 group"
           >
             {activeExercise ? 'VIEW DETAILS' : 'GO TO PLANS'}
             <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>

        {/* Diet Plan */}
        <div className={cn("flex flex-col justify-between rounded-[32px] border border-slate-800 border-l-4 border-l-orange-500 bg-slate-900 p-6", isAuthError && "opacity-30 pointer-events-none")}>
           <div>
             <div className="mb-2 flex items-center justify-between">
               <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 bg-orange-500/10 px-2 py-1 rounded-lg flex items-center gap-1">
                 <Utensils className="h-3 w-3" /> Diet
               </span>
               <span className="text-xs text-slate-500 font-mono">
                 {activeDiet ? `Created: ${new Date(activeDiet.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : ''}
               </span>
             </div>
             
             {dietLoading ? (
               <div className="flex justify-center items-center h-24">
                 <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
               </div>
             ) : activeDiet ? (
               <>
                 <h4 className="text-xl font-bold text-slate-50 mt-4 mb-4 truncate" title="Structured Diet Plan">
                   Structured Diet Plan
                 </h4>
                 
                 <div className="mb-6 flex gap-4">
                    <div>
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Weekly Target</p>
                       <p className="text-3xl font-bold text-slate-50 font-mono">
                         {totalWeeklyCalories > 0 ? totalWeeklyCalories.toLocaleString() : 'N/A'}
                         <span className="text-sm font-medium text-slate-400 ml-1">kcal</span>
                       </p>
                    </div>
                 </div>
               </>
             ) : (
               <div className="flex flex-col items-center justify-center py-6 text-center">
                 <p className="text-sm text-slate-400 mb-2">No active diet plan</p>
                 <button 
                   onClick={() => navigate('/plans')}
                   className="text-[10px] font-bold uppercase tracking-widest text-orange-500 flex items-center gap-1 hover:text-orange-400 transition-colors"
                 >
                   <Plus className="h-3 w-3" /> Create One
                 </button>
               </div>
             )}
           </div>

           <button 
             onClick={() => navigate('/plans')}
             className="flex items-center justify-between rounded-full bg-slate-800 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-300 transition-all hover:bg-slate-700 hover:text-slate-100 mt-2 hover:text-orange-400 group"
           >
             {activeDiet ? 'VIEW DETAILS' : 'GO TO PLANS'}
             <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>

      </div>
    </div>
  );
}
