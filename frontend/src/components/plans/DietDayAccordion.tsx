import { useState } from 'react';
import { ChevronDown, Utensils } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  dietPlan: Record<string, any>;
}

export function DietDayAccordion({ dietPlan }: Props) {
  const [openDay, setOpenDay] = useState<string | null>(Object.keys(dietPlan)[0] || null);

  const toggleDay = (day: string) => {
    setOpenDay(openDay === day ? null : day);
  };

  return (
    <div className="space-y-4">
      {Object.entries(dietPlan).map(([day, details]: [string, any]) => {
        const totalCals = details.meals?.reduce((acc: number, m: any) => acc + (m.calories || 0), 0) || 0;

        return (
          <div key={day} className="rounded-[32px] border border-slate-800 bg-slate-900 overflow-hidden">
            <button
              onClick={() => toggleDay(day)}
              className="flex w-full items-center justify-between px-6 py-6 transition-colors hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-bold text-slate-50 uppercase tracking-widest">{day}</h3>
              </div>
              <div className="flex items-center gap-4 text-slate-500">
                {totalCals > 0 && (
                  <span className="text-[10px] font-mono font-bold text-orange-500">
                    {totalCals} kcal
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
                
                <div className="space-y-8">
                  {details.meals?.map((meal: any, idx: number) => (
                    <div key={idx} className="relative pl-6 border-l-2 border-slate-800">
                      <div className="absolute -left-3 top-0 rounded-full bg-slate-900 border border-slate-700 p-1">
                        <Utensils className="h-3 w-3 text-slate-500" />
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="rounded-lg bg-orange-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-500 mt-1">
                          {meal.meal_type}
                        </span>
                        {(meal.calories) && (
                          <span className="text-sm font-mono font-bold text-slate-50">{meal.calories} kcal</span>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-300 font-medium leading-relaxed mb-3">
                        {meal.food_items?.map((fi: any) => `${fi.portion_size} ${fi.name}`).join(', ')}
                      </p>

                      <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                        {meal.protein && <span><strong className="text-lime-400 font-mono">{meal.protein}g</strong> PRO</span>}
                        {meal.carbs && <span><strong className="text-orange-500 font-mono">{meal.carbs}g</strong> CARB</span>}
                        {meal.fat && <span><strong className="text-rose-500 font-mono">{meal.fat}g</strong> FAT</span>}
                        {meal.prep_time_min && <span><strong className="text-slate-400 font-mono">{meal.prep_time_min}m</strong> PREP</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
