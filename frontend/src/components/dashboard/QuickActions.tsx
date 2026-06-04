import { useNavigate } from 'react-router-dom';
import { CalendarCheck, Dumbbell, Utensils, Camera } from 'lucide-react';

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-4">
      <button 
        onClick={() => navigate('/daily-log')}
        className="flex-1 sm:flex-none flex items-center justify-center gap-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-lime-400 hover:bg-slate-800 text-slate-300 px-4 sm:px-6 py-4 font-bold uppercase tracking-widest text-[10px] sm:text-[10px] transition-all active:scale-[0.98] min-w-[140px]"
      >
        <CalendarCheck className="h-4 w-4 text-lime-400 shrink-0" />
        <span className="truncate">LOG TODAY</span>
      </button>

      <button 
        onClick={() => navigate('/plans?tab=exercise')}
        className="flex-1 sm:flex-none flex items-center justify-center gap-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-lime-400 hover:bg-slate-800 text-slate-300 px-4 sm:px-6 py-4 font-bold uppercase tracking-widest text-[10px] sm:text-[10px] transition-all active:scale-[0.98] min-w-[140px]"
      >
        <Dumbbell className="h-4 w-4 text-lime-400 shrink-0" />
        <span className="truncate">NEW WORKOUT</span>
      </button>

      <button 
        onClick={() => navigate('/plans?tab=diet')}
        className="flex-1 sm:flex-none flex items-center justify-center gap-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-lime-400 hover:bg-slate-800 text-slate-300 px-4 sm:px-6 py-4 font-bold uppercase tracking-widest text-[10px] sm:text-[10px] transition-all active:scale-[0.98] min-w-[140px]"
      >
        <Utensils className="h-4 w-4 text-lime-400 shrink-0" />
        <span className="truncate">NEW DIET</span>
      </button>

      <button 
        onClick={() => navigate('/food-vision')}
        className="flex-1 sm:flex-none flex items-center justify-center gap-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-lime-400 hover:bg-slate-800 text-slate-300 px-4 sm:px-6 py-4 font-bold uppercase tracking-widest text-[10px] sm:text-[10px] transition-all active:scale-[0.98] min-w-[140px]"
      >
        <Camera className="h-4 w-4 text-lime-400 shrink-0" />
        <span className="truncate">ANALYZE MEAL</span>
      </button>
    </div>
  );
}
