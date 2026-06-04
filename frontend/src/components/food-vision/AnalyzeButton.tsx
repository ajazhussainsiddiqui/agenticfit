import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export function AnalyzeButton({ onClick, isLoading, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "flex w-full sm:w-auto mt-8 items-center justify-center gap-2 rounded-xl px-8 py-4 text-[10px] font-bold uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-slate-950 active:scale-[0.98]",
        disabled || isLoading
          ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-transparent"
          : "bg-lime-400 text-slate-950 hover:bg-lime-500 shadow-[0_0_30px_rgba(190,242,100,0.2)] hover:shadow-[0_0_40px_rgba(190,242,100,0.3)]"
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing with AI...
        </>
      ) : (
        "Analyze Meal"
      )}
    </button>
  );
}
