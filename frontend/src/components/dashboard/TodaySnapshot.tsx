import { GuestUpsell } from '../shared/GuestUpsell';
import { Activity, Moon, Heart, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface Props {
  isAuthError: boolean;
  weeklyLogs?: any[];
}

export function TodaySnapshot({ isAuthError, weeklyLogs }: Props) {
  const navigate = useNavigate();

  const calculateAverage = (logs: any[] | undefined, key: string) => {
    if (!logs || logs.length === 0) return null;
    const validLogs = logs.filter(log => log[key] != null);
    if (validLogs.length === 0) return null;
    const sum = validLogs.reduce((acc, log) => acc + Number(log[key]), 0);
    return Math.round((sum / validLogs.length) * 10) / 10;
  };

  const getTrend = (current: number | null | undefined, avg: number | null | undefined, colorClass: string) => {
    if (current == null || avg == null) return null;
    const diff = current - avg;
    const absDiff = Math.abs(diff);
    // Format diff intelligently
    const displayDiff = Number.isInteger(absDiff) ? absDiff : absDiff.toFixed(1);

    if (diff > 0.05) {
      return (
        <span className={cn("flex items-center gap-1 text-sm font-mono font-bold bg-white/10 px-2 py-1 rounded-lg", colorClass)}>
          <TrendingUp className="h-4 w-4" /> {displayDiff}
        </span>
      );
    } else if (diff < -0.05) {
      return (
        <span className={cn("flex items-center gap-1 text-sm font-mono font-bold bg-white/10 px-2 py-1 rounded-lg", colorClass)}>
          <TrendingDown className="h-4 w-4" /> {displayDiff}
        </span>
      );
    }
    return (
      <span className={cn("flex items-center gap-1 text-sm font-mono font-bold bg-white/10 px-2 py-1 rounded-lg", colorClass)}>
        <Minus className="h-4 w-4" /> 0
      </span>
    );
  };


  const dailyLog = weeklyLogs?.[0]; // today's log for the main display

  const avgRecoveryScore = calculateAverage(weeklyLogs, 'recovery_score');
  const avgDayStrain = calculateAverage(weeklyLogs, 'day_strain');
  const avgSleep = calculateAverage(weeklyLogs, 'sleep_hours');
  const avgHrv = calculateAverage(weeklyLogs, 'hrv');

  return (
    <div className="relative">
      {isAuthError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-[32px]">
          <GuestUpsell 
            title="Personalized Dashboard" 
            description="Sign in to see your health snapshot and trends." 
            actionLabel="Sign In" 
            onAction={() => navigate('/login')} 
            className="shadow-2xl rounded-[32px] bg-slate-900/50 border border-slate-800 border-dashed p-6"
          />
        </div>
      )}

      <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", isAuthError && "opacity-30 pointer-events-none")}>
        {/* Recovery Score */}
        <div className="rounded-[32px] border border-lime-500/30 bg-gradient-to-br from-lime-500/20 to-lime-900/20 p-6 hover:border-lime-500/50 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Recovery Score</span>
            <Activity className="h-4 w-4 text-lime-400" />
          </div>
          <div className="flex items-end gap-3">
            <div className="flex items-end gap-1">
              <div className="font-mono text-4xl font-bold italic text-lime-400">
                {isAuthError ? "—" : dailyLog?.recovery_score != null ? `${dailyLog.recovery_score}%` : "—"}
              </div>
            </div>
            <div className="mb-1">
              {!isAuthError && getTrend(dailyLog?.recovery_score, avgRecoveryScore, "text-lime-400")}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-lime-500/20 pt-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-lime-500/60">7-Day Avg</span>
            <span className="font-mono text-xs text-lime-400/80">{isAuthError ? "—" : avgRecoveryScore != null ? `${Math.round(avgRecoveryScore)}%` : '—'}</span>
          </div>
        </div>

        {/* Day Strain */}
        <div className="rounded-[32px] border border-orange-500/30 bg-gradient-to-br from-orange-500/20 to-orange-900/20 p-6 hover:border-orange-500/50 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Day Strain</span>
            <Zap className="h-4 w-4 text-orange-500" />
          </div>
          <div className="flex items-end gap-3">
             <div className="flex items-end gap-2">
               <div className="font-mono text-4xl font-bold italic text-orange-500">
                 {isAuthError ? "—" : dailyLog?.day_strain != null ? dailyLog.day_strain : "—"}
               </div>
               <div className="font-mono text-sm text-slate-600 pb-1">/ 21</div>
             </div>
             <div className="mb-1">
               {!isAuthError && getTrend(dailyLog?.day_strain, avgDayStrain, "text-orange-500")}
             </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-orange-500/20 pt-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-orange-500/60">7-Day Avg</span>
            <span className="font-mono text-xs text-orange-400/80">{isAuthError ? "—" : avgDayStrain != null ? avgDayStrain : '—'} / 21</span>
          </div>
        </div>

        {/* Sleep Hours */}
        <div className="rounded-[32px] border border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 to-indigo-900/20 p-6 hover:border-indigo-500/50 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sleep</span>
            <Moon className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="flex items-end gap-3">
             <div className="flex items-end gap-2">
               <div className="font-mono text-4xl font-bold italic text-indigo-400">
                 {isAuthError ? "—" : dailyLog?.sleep_hours != null ? dailyLog.sleep_hours : "—"}
               </div>
               <div className="font-mono text-sm text-slate-600 pb-1">HRS</div>
             </div>
             <div className="mb-1">
               {!isAuthError && getTrend(dailyLog?.sleep_hours, avgSleep, "text-indigo-400")}
             </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-indigo-500/20 pt-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-500/60">7-Day Avg</span>
            <span className="font-mono text-xs text-indigo-400/80">{isAuthError ? "—" : avgSleep != null ? avgSleep : '—'} hrs</span>
          </div>
        </div>

        {/* HRV */}
        <div className="rounded-[32px] border border-rose-500/30 bg-gradient-to-br from-rose-500/20 to-rose-900/20 p-6 hover:border-rose-500/50 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">HRV</span>
            <Heart className="h-4 w-4 text-rose-500" />
          </div>
          <div className="flex items-end gap-3">
             <div className="flex items-end gap-2">
               <div className="font-mono text-4xl font-bold italic text-rose-500">
                 {isAuthError ? "—" : dailyLog?.hrv != null ? dailyLog.hrv : "—"}
               </div>
               <div className="font-mono text-sm text-slate-600 pb-1">MS</div>
             </div>
             <div className="mb-1">
               {!isAuthError && getTrend(dailyLog?.hrv, avgHrv, "text-rose-500")}
             </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-rose-500/20 pt-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-rose-500/60">7-Day Avg</span>
            <span className="font-mono text-xs text-rose-400/80">{isAuthError ? "—" : avgHrv != null ? Math.round(avgHrv) : '—'} ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
