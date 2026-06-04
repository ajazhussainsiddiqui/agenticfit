import { cn } from '../../lib/utils';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export function InjuryToggle({ checked, onChange, register, errors }: Props) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Reporting Injury?</label>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-slate-950",
            checked ? "bg-rose-500" : "bg-slate-800"
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-50 shadow ring-0 transition duration-200 ease-in-out",
              checked ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>

      {checked && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200 pt-2">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Injury Details</label>
          <textarea
            {...register('injury_note')}
            rows={3}
            placeholder="Describe your injury and how it happened..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:border-lime-400/50 focus:outline-none focus:ring-2 focus:ring-lime-400/20"
          />
          {errors.injury_note && (
            <p className="mt-1 text-xs text-rose-500">{errors.injury_note.message as string}</p>
          )}
        </div>
      )}
    </div>
  );
}
