import { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface Props {
  times: string[];
  onChange: (times: string[]) => void;
}

export function TimeMultiSelect({ times = [], onChange }: Props) {
  const [timeValue, setTimeValue] = useState('08:00');

  const addTime = () => {
    // Format HH:MM to HH:MM:SS
    const formatted = `${timeValue}:00`;
    if (!times.includes(formatted)) {
      onChange([...times, formatted]);
    }
  };

  const removeTime = (timeToRemove: string) => {
    onChange(times.filter(t => t !== timeToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="time"
          value={timeValue || ''}
          onChange={(e) => setTimeValue(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 [color-scheme:dark] transition-colors"
        />
        <button
          type="button"
          onClick={addTime}
          className="flex items-center justify-center rounded-xl bg-slate-800 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-300 transition-colors hover:bg-slate-700 hover:text-slate-100"
        >
          <Plus className="h-4 w-4 mr-2" /> ADD TIME
        </button>
      </div>

      {times.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {times.map(time => (
            <span 
              key={time} 
              className="flex items-center gap-1 rounded-lg bg-lime-400/10 border border-lime-400/20 px-3 py-1.5 text-xs font-mono font-medium text-lime-400"
            >
              {time.substring(0, 5)} {/* Display HH:MM */}
              <button
                type="button"
                onClick={() => removeTime(time)}
                className="text-lime-400/70 hover:text-lime-400 focus:outline-none ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
