import React from 'react';
import { FoodCalorieInfo } from '../../pages/FoodVisionPage';

interface Props {
  info: FoodCalorieInfo;
  imageFile: File;
}

export function FoodResultCard({ info, imageFile }: Props) {
  const [preview, setPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    const objectUrl = URL.createObjectURL(imageFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  return (
    <div className="mt-8 overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900 p-6 md:p-8 flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full md:w-[40%] shrink-0">
        {preview && (
          <img 
            src={preview} 
            alt={info.food_name} 
            className="w-full aspect-square object-cover rounded-[24px] border border-slate-800 shadow-xl bg-slate-950"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col items-start gap-4 border-b border-slate-800/80 pb-6 mb-6">
          <div className="w-full flex justify-between items-start">
            <h3 className="text-2xl font-bold text-slate-50 uppercase tracking-tight mb-1">{info.food_name}</h3>
            <div className="text-right">
              <span className="block text-4xl font-bold text-slate-50">{info.total_calories}</span>
              <span className="text-[10px] font-bold text-lime-400 tracking-widest uppercase">kcal</span>
            </div>
          </div>
          
          <div className="w-full flex items-center gap-3">
             <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-lime-400" style={{ width: `${info.confidence * 100}%` }} />
             </div>
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
               {(info.confidence * 100).toFixed(0)}% Confidence
             </span>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Breakdown</h4>
          <div className="max-h-[300px] overflow-y-auto pr-2">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-sm text-slate-500 text-[10px] font-bold uppercase tracking-widest z-10">
                <tr>
                  <th className="pb-4 font-semibold">Ingredient</th>
                  <th className="pb-4 font-semibold text-right">Calories</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm">
                {info.breakdown.map((item, idx) => (
                  <tr key={idx} className="transition-colors hover:bg-slate-800/40">
                    <td className="py-4 text-slate-400 font-mono capitalize break-words pr-2">{item.name}</td>
                    <td className="py-4 text-slate-50 font-mono text-right shrink-0">{item.calories}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
