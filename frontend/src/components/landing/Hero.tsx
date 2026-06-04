import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative overflow-hidden rounded-[32px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lime-900/20 via-slate-950 to-slate-950 border-0 pt-16 pb-32 px-0">
      <div className="relative z-10 max-w-4xl mx-auto px-4 flex flex-col items-center text-center">
        <span className="mb-6 inline-block text-[12px] font-bold uppercase tracking-[0.25em] text-lime-400 drop-shadow-[0_0_8px_rgba(163,230,53,0.3)]">
          The Agentic Fitness Platform
        </span>
        <h1 className="mb-8 font-black italic uppercase tracking-tighter text-[56px] leading-[1.1] md:text-[96px] md:leading-[86.4px] text-slate-50 text-center animate-fade-in-up">
          THE FUTURE OF<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400">
            INTELLIGENT
          </span><br />
          FITNESS.
        </h1>
        <p className="mb-10 font-mono text-slate-400 text-[16px] md:text-[20px] leading-relaxed md:leading-[32.5px] text-center max-w-2xl animate-fade-in-up px-4" style={{ animationDelay: '100ms' }}>
          Personalized workout routines, AI-driven diet plans, multimodal food analysis, and injury risk prediction in one seamless platform.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up w-full" style={{ animationDelay: '200ms' }}>
          <Link 
            to="/signup"
            className="w-full sm:w-auto rounded-xl bg-lime-400 px-8 py-4 text-[15px] tracking-widest uppercase font-bold text-slate-950 transition-all duration-200 hover:bg-lime-500 active:scale-[0.98] shadow-[0_0_40px_rgba(190,242,100,0.15)] focus:outline-none focus:ring-2 focus:ring-lime-400 flex items-center justify-center"
          >
            GET STARTED
          </Link>
          <Link to="/dashboard" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-4 text-[15px] tracking-widest uppercase font-bold text-slate-300 border border-slate-800 transition-colors duration-200 hover:bg-slate-800 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500">
            TRY AS GUEST
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex justify-center mt-6 animate-fade-in-up w-full" style={{ animationDelay: '300ms' }}>
          <Link to="/workouts" className="flex items-center justify-center gap-2 rounded-lg bg-transparent px-4 py-2 text-[11px] tracking-widest uppercase font-bold text-slate-400 border border-slate-800 transition-colors duration-200 hover:bg-slate-800/80 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500">
            <Search className="h-3 w-3" />
            WORKOUT SEARCH
          </Link>
        </div>
      </div>
    </div>
  );
}
