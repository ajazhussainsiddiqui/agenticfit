import { WorkoutResult } from '../../pages/WorkoutsPage';
import { cn } from '../../lib/utils';
import { Activity } from 'lucide-react';

export function WorkoutCard({ result, onClick }: { result: WorkoutResult, onClick?: () => void }) {
  const meta = result.metadata;
  
  const diffMap: Record<string, string> = {
    beginner: 'bg-lime-400/10 text-lime-400 border-lime-400/20',
    intermediate: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    expert: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
  };

  const difficultyRaw = meta.level || meta.difficulty || meta.Difficulty || 'unknown';
  const diffStr = typeof difficultyRaw === 'string' ? difficultyRaw.toLowerCase() : 'unknown';
  const badgeClass = diffMap[diffStr] || 'bg-slate-800 text-slate-400 border-slate-700';

  let muscles: string[] = [];
  if (Array.isArray(meta.primaryMuscles)) {
    muscles = [...meta.primaryMuscles];
    if (Array.isArray(meta.secondaryMuscles)) {
      muscles = [...muscles, ...meta.secondaryMuscles];
    }
  } else if (Array.isArray(meta.muscles)) {
    muscles = meta.muscles;
  } else if (typeof meta.muscles === 'string') {
    muscles = meta.muscles.split(',').map(s => s.trim());
  } else if (typeof meta.target_muscle_group === 'string') {
    muscles = [meta.target_muscle_group];
  } else if (Array.isArray(meta.target_muscle_group)) {
    muscles = meta.target_muscle_group;
  }

  const name = meta.name || meta.Title || meta.exercise_name || 'Unknown Exercise';

  return (
    <div 
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
      className="group relative flex flex-col h-full rounded-[32px] border border-slate-800 bg-slate-900 pt-[35px] pb-[32px] px-[32px] m-0 transition-all hover:bg-slate-800/80 hover:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/50 cursor-pointer overflow-hidden"
    >
      <div className="absolute right-4 top-4 flex w-[150px] h-[20px] items-center justify-center border-none text-[9px] uppercase font-normal italic leading-[7px] text-[#949494] font-mono tracking-widest">
        {result.score} search score
      </div>
      
      <div className="mb-6 pr-24 mt-2">
        <h3 className="line-clamp-2 text-xl font-bold uppercase tracking-tight text-slate-50 transition-colors">
          {name}
        </h3>
      </div>

      {(meta.equipment && meta.equipment !== 'body weight' && meta.equipment !== 'bodyweight') && (
        <div className="mb-6 flex flex-col gap-2">
           <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 flex items-center gap-2">
             <Activity className="h-4 w-4" />
             {meta.equipment}
           </p>
        </div>
      )}

      <div className="mt-auto pt-4 flex flex-wrap items-center gap-3">
        <span className={cn("shrink-0 rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest", badgeClass)}>
          {diffStr}
        </span>
        {muscles.filter(Boolean).map((m, idx) => (
          <span key={idx} className="shrink-0 rounded-full border border-slate-800 bg-slate-950 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
