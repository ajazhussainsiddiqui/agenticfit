import { cn } from '../../lib/utils';
import { SearchWorkoutsPayload } from '../../pages/WorkoutsPage';

type Difficulty = SearchWorkoutsPayload['difficulty_filter'];
type Method = SearchWorkoutsPayload['method'];

interface Props {
  method: Method;
  setMethod: (m: Method) => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  limit: number;
  setLimit: (l: number) => void;
}

export function FilterPanel({ method, setMethod, difficulty, setDifficulty, limit, setLimit }: Props) {
  const difficulties: Difficulty[] = ['beginner', 'intermediate', 'expert'];
  const methods: Method[] = ['hybrid', 'vector', 'fts'];

  return (
    <div className="flex flex-col gap-6 border-t border-slate-800/80 pt-6 md:flex-row md:items-center md:justify-between">
      
      {/* Difficulty segmented control */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">Difficulty</span>
        <div className="flex rounded-full bg-slate-950 p-1 border border-slate-800 text-[10px] w-full max-w-full overflow-x-auto no-scrollbar">
          {difficulties.map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={cn(
                "flex-1 min-w-max rounded-full px-4 py-2 font-bold uppercase tracking-widest transition-all focus:outline-none",
                difficulty === d ? "bg-slate-800 text-slate-50 shadow-sm" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Methods Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Search Method</span>
        <div className="flex gap-2">
          {methods.map(m => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={cn(
                "rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all focus:outline-none",
                method === m ? "bg-lime-400 text-slate-950" : "bg-slate-950 text-slate-500 border border-slate-800 hover:bg-slate-800"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Limit Slider */}
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 w-20">Results: {limit || 10}</span>
        <input 
          type="range" 
          min="1" max="20" 
          value={limit || 10}
          onChange={(e) => setLimit(parseInt(e.target.value))}
          className="w-24 md:w-32 accent-lime-400 cursor-pointer h-1.5 bg-slate-800 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-lime-400 [&::-webkit-slider-thumb]:rounded-full" 
        />
      </div>

    </div>
  );
}
