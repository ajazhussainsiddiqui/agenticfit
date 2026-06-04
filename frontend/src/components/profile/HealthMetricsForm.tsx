import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DaySelector } from './DaySelector';
import { TimeMultiSelect } from './TimeMultiSelect';
import { Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/utils';
import { GuestUpsell } from '../shared/GuestUpsell';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useQueryClient } from '@tanstack/react-query';

export const healthMetricsSchema = z.object({
  date_of_birth: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  height_cm: z.number().min(50).max(300).optional(),
  weight_kg: z.number().min(20).max(300).optional(),
  activity_level: z.enum(["Sedentary", "Lightly Active", "Moderate", "Very Active"]).optional(),
  primary_goal: z.enum(["Weight Loss", "Muscle Building", "Endurance", "Wellness"]).optional(),
  experience_level: z.enum(["beginner", "intermediate", "expert"]).optional(),
  workout_days_per_week: z.array(z.string()).optional(),
  workout_duration_min: z.number().min(5).max(300).optional(),
  starting_date: z.string().optional(),
  water_reminders: z.array(z.string().regex(/^\d{2}:\d{2}:\d{2}$/)).optional(),
});

type HealthMetricsData = z.infer<typeof healthMetricsSchema>;

interface Props {
  initialData?: HealthMetricsData & { id?: number };
}

export function HealthMetricsForm({ initialData }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isGuest = useAuthStore(state => state.isGuest);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<HealthMetricsData>({
    resolver: zodResolver(healthMetricsSchema),
    defaultValues: initialData || {
      workout_days_per_week: [],
      water_reminders: [],
    }
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmit = async (data: HealthMetricsData) => {
    setIsLoading(true);
    setAuthError(false);

    try {
      await api.patch('/planner/health-metrics/update', data);
      toast.success('Health metrics saved');
      queryClient.invalidateQueries({ queryKey: ['health-metrics'] });
    } catch (err: any) {
      if (err.isAuthError || err.response?.status === 401) {
        setAuthError(true);
        toast.info('Login required to save profile');
      } else {
        toast.error(getErrorMessage(err, 'Failed to save health metrics'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Basic Info */}
           <div className="space-y-6 rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
             <h3 className="mb-6 text-[20px] leading-[28px] font-black italic uppercase tracking-tighter text-slate-100">Basic Info</h3>
             
             <div>
               <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Date of Birth</label>
               <input 
                 {...register('date_of_birth')}
                 type="date"
                 className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 [color-scheme:dark] transition-colors" 
               />
               {errors.date_of_birth && <p className="mt-1 text-xs text-red-500">{errors.date_of_birth.message}</p>}
             </div>

             <div>
               <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Gender</label>
               <select 
                 {...register('gender')}
                 className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
               >
                 <option value="">Select...</option>
                 <option value="Male">Male</option>
                 <option value="Female">Female</option>
                 <option value="Other">Other</option>
               </select>
               {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>}
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Height (cm)</label>
                 <input 
                   {...register('height_cm', { valueAsNumber: true })}
                   type="number"
                   className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors" 
                 />
                 {errors.height_cm && <p className="mt-1 text-xs text-red-500">{errors.height_cm.message}</p>}
               </div>
               <div>
                 <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Weight (kg)</label>
                 <input 
                   {...register('weight_kg', { valueAsNumber: true })}
                   type="number"
                   className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors" 
                 />
                 {errors.weight_kg && <p className="mt-1 text-xs text-red-500">{errors.weight_kg.message}</p>}
               </div>
             </div>
           </div>

           {/* Fitness Profile */}
           <div className="space-y-6 rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
             <h3 className="mb-6 text-xl font-black italic uppercase tracking-tighter text-slate-100">Fitness Profile</h3>

             <div>
               <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Activity Level</label>
               <select 
                 {...register('activity_level')}
                 className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
               >
                 <option value="">Select...</option>
                 <option value="Sedentary">Sedentary</option>
                 <option value="Lightly Active">Lightly Active</option>
                 <option value="Moderate">Moderate</option>
                 <option value="Very Active">Very Active</option>
               </select>
             </div>

             <div>
               <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Primary Goal</label>
               <select 
                 {...register('primary_goal')}
                 className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
               >
                 <option value="">Select...</option>
                 <option value="Weight Loss">Weight Loss</option>
                 <option value="Muscle Building">Muscle Building</option>
                 <option value="Endurance">Endurance</option>
                 <option value="Wellness">Wellness</option>
               </select>
             </div>

             <div>
               <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Experience Level</label>
               <select 
                 {...register('experience_level')}
                 className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
               >
                 <option value="">Select...</option>
                 <option value="beginner">Beginner</option>
                 <option value="intermediate">Intermediate</option>
                 <option value="expert">Expert</option>
               </select>
             </div>
           </div>

           {/* Workout Routine */}
           <div className="space-y-6 rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm md:col-span-2">
             <h3 className="mb-6 text-xl font-black italic uppercase tracking-tighter text-slate-100">Workout Routine</h3>

             <div>
               <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Workout Days (per week)</label>
               <Controller
                 control={control}
                 name="workout_days_per_week"
                 render={({ field }) => (
                   <DaySelector selectedDays={field.value || []} onChange={field.onChange} />
                 )}
               />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
               <div>
                 <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Duration per Session (minutes)</label>
                 <input 
                   {...register('workout_duration_min', { valueAsNumber: true })}
                   type="number"
                   className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors" 
                 />
               </div>
               <div>
                 <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Starting Date</label>
                 <input 
                   {...register('starting_date')}
                   type="date"
                   className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 [color-scheme:dark] transition-colors" 
                 />
               </div>
             </div>

             <div className="mt-6 border-t border-slate-800/80 pt-6 max-w-2xl">
               <label className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Water Reminders</label>
               <Controller
                 control={control}
                 name="water_reminders"
                 render={({ field }) => (
                   <TimeMultiSelect times={field.value || []} onChange={field.onChange} />
                 )}
               />
             </div>
           </div>
         </div>

         <div className="pt-4 flex justify-end">
           <button
             type="submit"
             disabled={isLoading}
             className="inline-flex items-center justify-center rounded-xl bg-lime-400 px-8 py-4 text-[10px] tracking-widest uppercase font-bold text-slate-950 transition-all duration-200 hover:bg-lime-500 shadow-[0_0_20px_rgba(190,242,100,0.15)] focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
             SAVE HEALTH METRICS
           </button>
         </div>
      </form>

      {authError && isGuest && (
        <div className="animate-in fade-in slide-in-from-bottom-2 mt-6">
          <GuestUpsell 
             title="Login Required" 
             description="Sign in to save your personal profile and health metrics." 
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
