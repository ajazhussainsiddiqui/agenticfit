import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Logo } from '../shared/Logo';

export function AuthCard({ children, className, showBack = false }: { children: React.ReactNode, className?: string, showBack?: boolean }) {
  const navigate = useNavigate();
  return (
    <div className={cn("w-full max-w-[380px] rounded-[24px] border border-slate-800 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300", className)}>
      <div className="mb-4 flex items-center relative">
        {showBack && (
          <button 
            onClick={() => navigate(-1)}
            className="absolute left-0 flex items-center text-[10px] uppercase font-bold tracking-widest text-slate-500 transition-colors hover:text-slate-50 group"
          >
            <ArrowLeft className="mr-1 h-3 w-3 transition-transform group-hover:-translate-x-1" />
            BACK
          </button>
        )}
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[10px] bg-lime-400 font-bold text-slate-950 text-xl shadow-[0_0_20px_rgba(190,242,100,0.3)] shadow-inner overflow-hidden">
          <Logo className="w-full h-full text-white" />
        </div>
      </div>
      {children}
    </div>
  );
}
