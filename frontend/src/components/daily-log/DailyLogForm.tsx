import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StrainSlider } from './StrainSlider';
import { RecoverySlider } from './RecoverySlider';
import { InjuryToggle } from './InjuryToggle';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../lib/utils';
import { GuestUpsell } from '../shared/GuestUpsell';
import { useNavigate } from 'react-router-dom';
import { HelpTooltip } from '../shared/HelpTooltip';
import { Loader2, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useQueryClient } from '@tanstack/react-query';

export const dailyLogSchema = z.object({
  day_strain: z.number().min(0).max(21).optional(),
  recovery_score: z.number().min(0).max(100).optional(),
  sleep_hours: z.number().min(0).max(24).optional(),
  hrv: z.number().min(0).optional(),
  total_calories_consumed: z.number().min(0).optional(),
  workout_completed: z.number().min(0).max(100).optional(),
  workout_duration_min: z.number().min(0).optional(),
  injury_status: z.boolean().optional(),
  injury_note: z.string().optional(),
  calories_burned: z.number().min(0).optional(),
});

export type DailyLogFormData = z.infer<typeof dailyLogSchema>;

interface Props {
  initialData?: DailyLogFormData & { id?: number };
  onSuccess?: () => void;
  onDisplayedLogChange?: (id: number | undefined) => void;
}

export function DailyLogForm({ initialData, onSuccess, onDisplayedLogChange }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [displayedLogId, setDisplayedLogId] = useState<number | undefined>(initialData?.id);
  const [submitAction, setSubmitAction] = useState<'create' | 'update'>('create');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isGuest = useAuthStore(state => state.isGuest);
  const hasFetchedLatest = useRef(false);

  useEffect(() => {
    if (onDisplayedLogChange) {
      onDisplayedLogChange(displayedLogId);
    }
  }, [displayedLogId, onDisplayedLogChange]);

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm<DailyLogFormData>({
    resolver: zodResolver(dailyLogSchema),
    defaultValues: initialData || {
      day_strain: 0,
      recovery_score: 100,
      sleep_hours: 8,
      hrv: 60,
      total_calories_consumed: 0,
      workout_completed: 0,
      workout_duration_min: 0,
      injury_status: false,
      injury_note: '',
      calories_burned: 0,
    }
  });

  const injuryStatus = watch('injury_status');

  const fetchLatest = async (silent = false) => {
    setIsUpdateLoading(true);
    setAuthError(false);
    try {
      const res = await api.get('/planner/daily-logs/search?search_limit=1');
      if (res.data && res.data.length > 0) {
        const latest = { ...res.data[0] };
        Object.keys(latest).forEach(key => {
          if (latest[key] === null) {
            latest[key] = undefined;
          }
        });
        reset(latest);
        setDisplayedLogId(latest.id);
        if (!silent) toast.success('Latest log fetched');
      } else {
        if (!silent) toast.info('No previous logs found');
      }
    } catch (err: any) {
      if (err.isAuthError || err.response?.status === 401) {
        setAuthError(true);
        if (!silent) toast.info('Login required to fetch logs');
      } else {
        if (!silent) toast.error('Failed to fetch latest log');
      }
    } finally {
      setIsUpdateLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setDisplayedLogId(initialData.id);
      hasFetchedLatest.current = true;
    } else if (!hasFetchedLatest.current && !isGuest) {
      hasFetchedLatest.current = true;
      fetchLatest(true);
    }
  }, [initialData, reset, isGuest]);

  const onSubmit = async (data: DailyLogFormData) => {
    setIsLoading(true);
    setAuthError(false);
    
    // Process input formats
    const payload = {
        ...data,
        sleep_hours: Number(data.sleep_hours),
        hrv: Number(data.hrv),
        total_calories_consumed: Number(data.total_calories_consumed),
        workout_duration_min: Number(data.workout_duration_min),
        calories_burned: Number(data.calories_burned),
        day_strain: data.day_strain || 0,
        recovery_score: data.recovery_score || 0,
        workout_completed: data.workout_completed || 0,
    };

    try {
      if (submitAction === 'update' && displayedLogId) {
        await api.patch('/planner/daily-logs/update', { ...payload, id: displayedLogId });
        toast.success('Log updated successfully');
      } else {
        await api.post('/planner/daily-logs/create', payload);
        toast.success('New log created successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['daily-logs'] });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (err.isAuthError || err.response?.status === 401) {
        setAuthError(true);
        toast.info('Login required to save logs');
      } else {
        toast.error(getErrorMessage(err, 'Failed to save log'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Sliders */}
          <div className="space-y-8 rounded-[32px] border border-slate-800 bg-slate-900 md:p-8 p-6">
            <Controller
              control={control}
              name="day_strain"
              render={({ field }) => (
                <StrainSlider value={field.value || 0} onChange={field.onChange} />
              )}
            />
            <Controller
              control={control}
              name="recovery_score"
              render={({ field }) => (
                <RecoverySlider value={field.value || 0} onChange={field.onChange} />
              )}
            />
            <Controller
              control={control}
              name="workout_completed"
              render={({ field }) => (
                <RecoverySlider value={field.value || 0} onChange={field.onChange} label="Workout Completed" />
              )}
            />
          </div>

          {/* Number Inputs */}
          <div className="space-y-4 rounded-[32px] border border-slate-800 bg-slate-900 md:p-8 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Sleep (h)</label>
                <input 
                  {...register('sleep_hours', { valueAsNumber: true })}
                  type="number" 
                  step="0.5"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 font-mono text-slate-50 outline-none focus:border-lime-400/50 focus:ring-2 focus:ring-lime-400/20 transition-all" 
                />
              </div>
              <div>
                <label className="mb-2 flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  HRV (ms)
                  <HelpTooltip content="Amount of variation in time between one heartbeat and the next." className="ml-1.5" />
                </label>
                <input 
                  {...register('hrv', { valueAsNumber: true })}
                  type="number" 
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 font-mono text-slate-50 outline-none focus:border-lime-400/50 focus:ring-2 focus:ring-lime-400/20 transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Cal Consumed</label>
                <input 
                  {...register('total_calories_consumed', { valueAsNumber: true })}
                  type="number" 
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 font-mono text-slate-50 outline-none focus:border-lime-400/50 focus:ring-2 focus:ring-lime-400/20 transition-all" 
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Cal Burned</label>
                <input 
                  {...register('calories_burned', { valueAsNumber: true })}
                  type="number" 
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 font-mono text-slate-50 outline-none focus:border-lime-400/50 focus:ring-2 focus:ring-lime-400/20 transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Workout Duration (min)</label>
              <input 
                {...register('workout_duration_min', { valueAsNumber: true })}
                type="number" 
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 font-mono text-slate-50 outline-none focus:border-lime-400/50 focus:ring-2 focus:ring-lime-400/20 transition-all" 
              />
            </div>
            
            <InjuryToggle 
               checked={!!injuryStatus} 
               onChange={(val) => {
                 setValue('injury_status', val);
                 if (!val) setValue('injury_note', '');
               }}
               register={register}
               errors={errors}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-end gap-4">
          <button
            type="submit"
            onClick={() => setSubmitAction('create')}
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center rounded-xl bg-lime-400 px-8 py-3.5 font-bold text-slate-950 transition-all duration-200 hover:bg-lime-500 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-50 shadow-[0_0_40px_rgba(190,242,100,0.15)] uppercase tracking-wider"
          >
            {isLoading && submitAction === 'create' ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            + NEW LOG
          </button>
          
          <button
            type="submit"
            onClick={() => setSubmitAction('update')}
            disabled={isLoading || !displayedLogId}
            className="w-full sm:w-auto flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-6 py-3.5 font-bold text-slate-300 transition-colors hover:bg-slate-700 hover:text-slate-100 disabled:opacity-50"
          >
            {isLoading && submitAction === 'update' ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            UPDATE LOG {displayedLogId ? `#${displayedLogId}` : ''}
          </button>
        </div>
      </form>

      {authError && isGuest && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <GuestUpsell 
             title="Login Required" 
             description="Sign in to save or fetch your daily health logs." 
             actionLabel="Sign In" 
             onAction={() => navigate('/login')} 
             variant="inline"
             className="w-full border-red-500/30 bg-red-950/10"
          />
        </div>
      )}
    </div>
  );
}
