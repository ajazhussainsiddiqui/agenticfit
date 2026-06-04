import { useEffect } from 'react';
import { X, Activity, Dumbbell } from 'lucide-react';
import { WorkoutResult } from '../../pages/WorkoutsPage';

interface Props {
  result: WorkoutResult;
  onClose: () => void;
}

export function WorkoutDetailsModal({ result, onClose }: Props) {
  const meta = result.metadata;
  const name = meta.name || meta.Title || meta.exercise_name || 'Unknown Exercise';
  
  const difficultyRaw = meta.level || meta.difficulty || meta.Difficulty || 'unknown';
  const diffStr = typeof difficultyRaw === 'string' ? difficultyRaw.toLowerCase() : 'unknown';

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

  let instructions: string[] = [];
  if (Array.isArray(meta.instructions)) {
    instructions = meta.instructions;
  } else if (typeof meta.instructions === 'string') {
    instructions = [meta.instructions];
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900 shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-8 py-6">
          <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-slate-50 pr-8">{name}</h2>
          <button 
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-50 focus:outline-none absolute right-6 top-6"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Badges */}
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">
              {diffStr}
            </span>
            {(meta.category) && (
              <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                {meta.category}
              </span>
            )}
            {(meta.equipment) && (
              <span className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                <Activity className="h-3 w-3" />
                {meta.equipment}
              </span>
            )}
            {(meta.force) && (
              <span className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Force: {meta.force}
              </span>
            )}
            {(meta.mechanic) && (
              <span className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                MECH: {meta.mechanic}
              </span>
            )}
          </div>
          
          {muscles.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Dumbbell className="h-4 w-4" /> Targets
              </h3>
              <div className="flex flex-wrap gap-2">
                {muscles.filter(Boolean).map((m, idx) => (
                  <span key={idx} className="rounded-lg border border-lime-400/20 bg-lime-400/10 px-4 py-2 text-[10px] uppercase font-bold tracking-widest text-lime-400">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {instructions.length > 0 ? (
            <div>
              <h3 className="mb-6 border-b border-slate-800 pb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Instructions</h3>
              <div className="space-y-6">
                {instructions.map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-mono font-bold text-slate-400">
                      {idx + 1}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300 font-medium">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
             <div className="rounded-[32px] border border-dashed border-slate-800 p-8 text-center bg-slate-900/50">
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">No instructions available.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
