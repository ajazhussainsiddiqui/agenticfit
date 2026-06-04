import { useState, useEffect } from 'react';
import { SearchBar } from '../components/workouts/SearchBar';
import { FilterPanel } from '../components/workouts/FilterPanel';
import { WorkoutCard } from '../components/workouts/WorkoutCard';
import { EmptyState } from '../components/workouts/EmptyState';
import { WorkoutDetailsModal } from '../components/workouts/WorkoutDetailsModal';
import api from '../lib/api';
import { getErrorMessage } from '../lib/utils';
import { PageWrapper } from '../components/shared/PageWrapper';
import { SkeletonCard } from '../components/shared/Skeletons';

export interface SearchWorkoutsPayload {
  query_text: string;
  method: "vector" | "fts" | "hybrid";
  difficulty_filter: "beginner" | "intermediate" | "expert";
  page_limit: number;
}

export interface WorkoutResult {
  score: number;
  metadata: {
    id?: string | number;
    name?: string;
    Title?: string;
    exercise_name?: string;
    level?: string;
    difficulty?: string;
    Difficulty?: string;
    target_muscle_group?: string | string[];
    primaryMuscles?: string[];
    secondaryMuscles?: string[];
    muscles?: string | string[];
    equipment?: string;
    instructions?: string | string[];
    [key: string]: any;
  };
}

export function WorkoutsPage() {
  const [query, setQuery] = useState('');
  const [method, setMethod] = useState<SearchWorkoutsPayload["method"]>("hybrid");
  const [difficulty, setDifficulty] = useState<SearchWorkoutsPayload["difficulty_filter"]>("beginner");
  const [limit, setLimit] = useState(10);
  
  const [results, setResults] = useState<WorkoutResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutResult | null>(null);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setHasSearched(true);
    setError(null);
    
    try {
      const payload: SearchWorkoutsPayload = {
        query_text: searchQuery,
        method,
        difficulty_filter: difficulty,
        page_limit: limit,
      };
      const res = await api.post('/planner/search-workouts', payload);
      
      const formattedResults = (res.data || []).map((item: any) => {
        // If the item has a single key which is the score e.g. {"6.004": { ...metadata }}
        const keys = Object.keys(item);
        if (keys.length === 1 && !isNaN(Number(keys[0]))) {
          const scoreStr = keys[0];
          return {
            score: parseFloat(scoreStr),
            metadata: item[scoreStr]
          };
        }
        return item;
      });

      setResults(formattedResults);
    } catch (err: any) {
      console.error('Search failed', err);
      // It's guest mode and server accepts optional auth, but in case of server error
      setError(getErrorMessage(err, 'Failed to fetch workouts'));
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Only re-trigger search on filter changes if there's already a query that was searched
  useEffect(() => {
    if (hasSearched && query.trim()) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, difficulty, limit]);

  return (
    <PageWrapper
      title="Workout Search"
      description="PINPOINT THE PERFECT EXERCISES WITH OUR ADVANCED AI ENGINE."
      className="max-w-6xl"
    >
      <div className="space-y-8">
        <div className="space-y-6 rounded-[32px] border border-slate-800 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-sm">
          <SearchBar 
            query={query} 
            setQuery={setQuery} 
            onSearch={() => handleSearch()} 
            isLoading={isLoading}
          />
          <FilterPanel 
            method={method} setMethod={setMethod}
            difficulty={difficulty} setDifficulty={setDifficulty}
            limit={limit} setLimit={setLimit}
          />
        </div>

        <div>
          {error && (
            <div className="rounded-[24px] border border-rose-500/20 bg-rose-500/10 p-6 text-sm font-mono text-rose-500 mb-8">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} className="h-48" />
              ))}
            </div>
          ) : hasSearched && results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((r, i) => (
                <WorkoutCard 
                  key={r.metadata.id || i} 
                  result={r} 
                  onClick={() => setSelectedWorkout(r)}
                />
              ))}
            </div>
          ) : hasSearched && results.length === 0 ? (
            <div className="py-24 text-center rounded-[32px] border border-slate-800 border-dashed bg-slate-900/30">
               <p className="text-2xl font-bold text-slate-100 mb-2">No results found for "{query}"</p>
               <p className="font-medium text-slate-400 text-sm leading-relaxed">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <EmptyState onSuggestionClick={(q) => { 
              setQuery(q); 
              handleSearch(q); 
            }} />
          )}
        </div>

        {selectedWorkout && (
          <WorkoutDetailsModal 
            result={selectedWorkout} 
            onClose={() => setSelectedWorkout(null)} 
          />
        )}
      </div>
    </PageWrapper>
  );
}
