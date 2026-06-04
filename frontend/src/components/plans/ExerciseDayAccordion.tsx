import { useState } from 'react';
import { ChevronDown, Timer } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  exercises: Record<string, any>;
}

export function ExerciseDayAccordion({ exercises }: Props) {
  const [openDay, setOpenDay] = useState<string | null>(Object.keys(exercises)[0] || null);

  const toggleDay = (day: string) => {
    setOpenDay(openDay === day ? null : day);
  };

  return (
    <div className="space-y-4">
      {Object.entries(exercises).map(([day, details]: [string, any]) => (
        <div key={day} className="rounded-[32px] border border-slate-800 bg-slate-900 overflow-hidden">
          <button
            onClick={() => toggleDay(day)}
            className="flex w-full items-center justify-between px-6 py-6 transition-colors hover:bg-slate-800/50"
          >
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-bold text-slate-50 uppercase tracking-widest">{day}</h3>
              {details.focus && (
                <span className="rounded-xl bg-lime-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-lime-400">
                  {details.focus}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              {details.duration_minutes && (
                <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest">
                  <Timer className="h-3 w-3" />
                  {details.duration_minutes} min
                </span>
              )}
              <ChevronDown className={cn("h-4 w-4 transition-transform", openDay === day && "rotate-180")} />
            </div>
          </button>

          {openDay === day && (
            <div className="border-t border-slate-800 bg-slate-950/30 px-6 py-6 animate-in fade-in slide-in-from-top-2">
              {details.notes && (
                <p className="mb-6 text-sm text-slate-400 font-mono italic">{details.notes}</p>
              )}
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <tr>
                      <th className="pb-4 font-semibold">Exercise</th>
                      <th className="pb-4 font-semibold">Sets/Reps</th>
                      <th className="pb-4 font-semibold">Difficulty</th>
                      <th className="pb-4 font-semibold">Muscles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {details.exercises?.map((ex: any, idx: number) => (
                      <tr key={idx} className="text-slate-300">
                        <td className="py-4 font-bold text-slate-100">{ex.name}</td>
                        <td className="py-4 font-mono text-lime-400">{ex.sets} × {ex.reps}</td>
                        <td className="py-4 capitalize text-[10px] uppercase font-bold tracking-widest text-slate-500">{ex.difficulty}</td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-2">
                            {ex.targeted_muscles?.map((m: string) => (
                              <span key={m} className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-[10px] uppercase tracking-wider text-slate-400">
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
