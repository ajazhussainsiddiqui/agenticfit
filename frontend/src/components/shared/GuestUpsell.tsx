import { Lock, LucideIcon } from 'lucide-react';

export interface GuestUpsellProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  variant?: "inline" | "card" | "banner";
  className?: string;
}

export function GuestUpsell({ 
  icon: Icon = Lock, 
  title, 
  description, 
  actionLabel, 
  onAction, 
  variant = 'card',
  className = ''
}: GuestUpsellProps) {
  if (variant === 'inline') {
    return (
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[24px] bg-slate-900 border border-slate-800 p-4 shadow-sm ${className}`}>
        <div className="flex items-center gap-4">
          <Icon className="h-5 w-5 text-lime-400 shrink-0" />
          <div className="flex flex-col sm:flex-row sm:gap-2">
            <span className="font-bold uppercase tracking-widest text-[10px] text-slate-100">{title}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 hidden sm:inline">- {description}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 sm:hidden">{description}</span>
          </div>
        </div>
        <button
          onClick={onAction}
          className="shrink-0 rounded-full bg-slate-800 px-6 py-2.5 text-[10px] uppercase font-bold tracking-widest text-slate-50 hover:bg-lime-400 hover:text-slate-950 transition-colors w-full sm:w-auto"
        >
          {actionLabel}
        </button>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`flex w-full flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border-b border-slate-800 px-6 py-4 shadow-md ${className}`}>
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-lime-400/10 p-2 shrink-0">
            <Icon className="h-5 w-5 text-lime-400" />
          </div>
          <div>
            <h3 className="font-bold uppercase tracking-widest text-[10px] text-slate-50">{title}</h3>
            <p className="text-[10px] font-mono text-slate-400 mt-1">{description}</p>
          </div>
        </div>
        <button
          onClick={onAction}
          className="shrink-0 rounded-full bg-lime-400 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-950 hover:bg-lime-500 transition-colors w-full sm:w-auto"
        >
          {actionLabel}
        </button>
      </div>
    );
  }

  // default: card
  return (
    <div className={`flex flex-col items-center justify-center rounded-[32px] border border-slate-800 bg-slate-900 p-8 text-center sm:p-12 shadow-xl ${className}`}>
      <div className="rounded-full bg-slate-950 p-4 mb-6 shadow-inner border border-slate-800">
        <Icon className="h-8 w-8 text-lime-400" />
      </div>
      <h3 className="text-2xl font-bold uppercase tracking-tight text-slate-50 mb-3">{title}</h3>
      <p className="text-[10px] font-mono tracking-widest text-slate-400 max-w-sm mb-8 leading-relaxed uppercase">
        {description}
      </p>
      <button
        onClick={onAction}
        className="rounded-full bg-lime-400 px-8 py-4 text-[10px] font-bold tracking-widest uppercase text-slate-950 hover:bg-lime-500 transition-colors shadow-[0_0_20px_rgba(190,242,100,0.15)] w-full sm:w-auto"
      >
        {actionLabel}
      </button>
    </div>
  );
}
