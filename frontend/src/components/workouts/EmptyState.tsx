import { Dumbbell } from 'lucide-react';

interface Props {
  onSuggestionClick: (q: string) => void;
}

export function EmptyState({ onSuggestionClick }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95 duration-700">
      <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-700 shadow-2xl">
        <Dumbbell className="h-16 w-16" />
      </div>
      <h3 className="mb-4 text-2xl font-bold text-slate-100">Find Your Next Workout</h3>
      <p className="font-medium text-slate-400 text-sm leading-relaxed max-w-lg mb-12">
        Search across thousands of exercises from our vector database using AI. Describe your targets, equipment, or format.
      </p>
      <button 
        onClick={() => onSuggestionClick("low impact chest exercise")}
        className="text-[10px] font-bold tracking-widest uppercase text-lime-400 hover:text-lime-300 transition-colors border-b-2 border-lime-400/30 hover:border-lime-400 pb-1"
      >
        Try searching for "low impact chest"
      </button>
    </div>
  );
}
