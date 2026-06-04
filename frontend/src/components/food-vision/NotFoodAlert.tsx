import { AlertCircle } from 'lucide-react';

interface Props {
  message: string;
}

export function NotFoodAlert({ message }: Props) {
  return (
    <div className="mt-8 rounded-[32px] border border-orange-500/20 bg-orange-500/10 p-6 md:p-8 flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-full bg-orange-500/20 p-2">
        <AlertCircle className="h-6 w-6 text-orange-500 shrink-0" />
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-orange-500">Image Analysis Warning</h4>
        <p className="mt-2 text-sm text-orange-500/80 leading-relaxed font-mono">{message}</p>
      </div>
    </div>
  );
}
