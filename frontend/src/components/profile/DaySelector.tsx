import { cn } from '../../lib/utils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Props {
  selectedDays: string[];
  onChange: (days: string[]) => void;
}

export function DaySelector({ selectedDays = [], onChange }: Props) {
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter(d => d !== day));
    } else {
      onChange([...selectedDays, day]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {DAYS.map(day => {
        const isSelected = selectedDays.includes(day);
        return (
          <button
            key={day}
            type="button"
            onClick={() => toggleDay(day)}
            className={cn(
              "rounded-xl px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-all",
              isSelected 
                ? "bg-lime-400 text-slate-950 shadow-[0_0_15px_rgba(190,242,100,0.2)] border border-lime-400" 
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            {day.substring(0, 3)}
          </button>
        );
      })}
    </div>
  );
}
