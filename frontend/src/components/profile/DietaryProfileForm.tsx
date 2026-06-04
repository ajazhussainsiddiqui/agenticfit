import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TagInput } from './TagInput';
import { Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/utils';
import { GuestUpsell } from '../shared/GuestUpsell';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useQueryClient } from '@tanstack/react-query';

export const dietaryProfileSchema = z.object({
  diet_type: z.enum(["Standard", "Keto", "Mediterranean", "Vegetarian", "Vegan"]).optional(),
  allergies: z.array(z.string()).optional(),
  preferred_cuisines: z.array(z.string()).optional(),
  daily_calories: z.number().min(1600).max(3000).optional(),
});

type DietaryProfileData = z.infer<typeof dietaryProfileSchema>;

interface Props {
  initialData?: DietaryProfileData & { id?: number };
}

export function DietaryProfileForm({ initialData }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isGuest = useAuthStore(state => state.isGuest);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<DietaryProfileData>({
    resolver: zodResolver(dietaryProfileSchema),
    defaultValues: initialData || {
      allergies: [],
      preferred_cuisines: [],
    }
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmit = async (data: DietaryProfileData) => {
    setIsLoading(true);
    setAuthError(false);

    try {
      await api.patch('/planner/dietary-profiles/update', data);
      toast.success('Dietary profile saved');
      queryClient.invalidateQueries({ queryKey: ['dietary-profile'] });
    } catch (err: any) {
      if (err.isAuthError || err.response?.status === 401) {
        setAuthError(true);
        toast.info('Login required to save profile');
      } else {
        toast.error(getErrorMessage(err, 'Failed to save dietary profile'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           
           <div className="space-y-6 rounded-[32px] border border-slate-800 bg-slate-900/50 p-8 md:col-span-2 backdrop-blur-sm">
             <h3 className="mb-6 text-xl font-black italic uppercase tracking-tighter text-slate-100">Dietary Preferences</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Diet Type</label>
                 <select 
                   {...register('diet_type')}
                   className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                 >
                   <option value="">No specific diet</option>
                   <option value="Standard">Standard</option>
                   <option value="Keto">Keto</option>
                   <option value="Mediterranean">Mediterranean</option>
                   <option value="Vegetarian">Vegetarian</option>
                   <option value="Vegan">Vegan</option>
                 </select>
                 {errors.diet_type && <p className="mt-1 text-xs text-red-500">{errors.diet_type.message}</p>}
               </div>

               <div>
                 <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Daily Calories (kcal)</label>
                 <input 
                   {...register('daily_calories', { valueAsNumber: true })}
                   type="number"
                   placeholder="e.g. 2500"
                   className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors" 
                 />
                 <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">Range: 1600 - 3000</p>
                 {errors.daily_calories && <p className="mt-1 text-xs text-red-500">{errors.daily_calories.message}</p>}
               </div>
             </div>

             <div className="border-t border-slate-800/80 pt-6 mt-6 max-w-2xl">
               <label className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Allergies / Intolerances</label>
               <Controller
                 control={control}
                 name="allergies"
                 render={({ field }) => (
                   <TagInput 
                     tags={field.value || []} 
                     onChange={field.onChange} 
                     placeholder="e.g. Peanuts, Gluten..." 
                   />
                 )}
               />
             </div>

             <div className="pt-2 max-w-2xl">
               <label className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Preferred Cuisines</label>
               <Controller
                 control={control}
                 name="preferred_cuisines"
                 render={({ field }) => (
                   <TagInput 
                     tags={field.value || []} 
                     onChange={field.onChange} 
                     placeholder="e.g. Italian, Mexican, Sushi..." 
                   />
                 )}
               />
             </div>

           </div>
         </div>

         <div className="pt-4 flex justify-end">
           <button
             type="submit"
             disabled={isLoading}
             className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-8 py-4 text-[10px] tracking-widest uppercase font-bold text-slate-50 transition-all duration-200 hover:bg-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.15)] focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
             SAVE DIETARY PROFILE
           </button>
         </div>
      </form>

      {authError && isGuest && (
        <div className="animate-in fade-in slide-in-from-bottom-2 mt-6">
          <GuestUpsell 
             title="Login Required" 
             description="Sign in to save your personal dietary preferences." 
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
