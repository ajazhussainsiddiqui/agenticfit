import { Search, Loader2 } from 'lucide-react';

interface Props {
  query: string;
  setQuery: (q: string) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

export function SearchBar({ query, setQuery, onSearch, isLoading }: Props) {
  return (
    <div className="space-y-4">
      <div className="relative flex flex-col sm:block gap-3 sm:gap-0">
        <div className="absolute left-4 sm:left-6 top-4 sm:top-1/2 sm:-translate-y-1/2 text-slate-500 z-10 pointer-events-none">
          <Search className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <input
          type="text"
          value={query || ''}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          placeholder="Describe your ideal exercise..."
          className="w-full rounded-[24px] sm:rounded-[32px] border border-slate-800 bg-slate-900 shadow-inner py-4 sm:py-5 pl-12 sm:pl-16 pr-4 sm:pr-[120px] text-slate-50 placeholder-slate-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400 transition-all text-sm md:text-base font-mono tracking-tight"
        />
        <button 
          onClick={onSearch}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full sm:w-auto sm:absolute sm:right-3 sm:top-1/2 sm:-translate-y-1/2 rounded-[24px] bg-lime-400 px-6 py-4 sm:py-3 text-[10px] uppercase tracking-widest font-bold text-slate-950 transition-colors hover:bg-lime-500 focus:outline-none shadow-[0_0_20px_rgba(190,242,100,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              SEARCHING...
            </>
          ) : (
            'SEARCH'
          )}
        </button>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-2">
        <span>Try:</span>
        <button 
          onClick={() => { 
            setQuery("low impact chest exercise"); 
          }} 
          className="rounded-full bg-slate-900 px-4 py-1.5 hover:bg-slate-800 transition-colors hover:text-slate-50 border border-slate-800 focus:outline-none"
        >
          low impact chest exercise
        </button>
        <button 
          onClick={() => { 
            setQuery("beginner full body"); 
          }} 
          className="rounded-full bg-slate-900 px-4 py-1.5 hover:bg-slate-800 transition-colors hover:text-slate-50 border border-slate-800 focus:outline-none"
        >
          beginner full body
        </button>
      </div>
    </div>
  );
}
