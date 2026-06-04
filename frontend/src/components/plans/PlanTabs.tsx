import { Dumbbell, Utensils } from 'lucide-react';

interface Props {
  activeTab: 'exercise' | 'diet';
  onChange: (tab: 'exercise' | 'diet') => void;
}

export function PlanTabs({ activeTab, onChange }: Props) {
  return (
    <div className="flex space-x-1 rounded-full bg-slate-900 p-1 w-full max-w-md border border-slate-800">
      <button
        onClick={() => onChange('exercise')}
        className={`w-full rounded-full flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
          activeTab === 'exercise'
            ? 'bg-white text-slate-950 shadow-sm'
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <Dumbbell className="w-4 h-4" />
        Exercise Plans
      </button>
      <button
        onClick={() => onChange('diet')}
        className={`w-full rounded-full flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
          activeTab === 'diet'
            ? 'bg-white text-slate-950 shadow-sm'
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <Utensils className="w-4 h-4" />
        Diet Plans
      </button>
    </div>
  );
}
