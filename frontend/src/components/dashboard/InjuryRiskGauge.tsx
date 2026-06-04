import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { GuestUpsell } from '../shared/GuestUpsell';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { AlertCircle } from 'lucide-react';

interface Props {
  isAuthError: boolean;
  prediction?: number; // 0.0 to 1.0
}

export function InjuryRiskGauge({ isAuthError, prediction = 0 }: Props) {
  const navigate = useNavigate();

  const percentage = isAuthError ? 0 : Math.round(prediction * 100);
  const data = [
    { name: 'Risk', value: percentage },
    { name: 'Safe', value: 100 - percentage },
  ];

  let color = '#bef264'; // lime-400 (safe)
  if (percentage >= 40 && percentage <= 70) color = '#f97316'; // orange-500 (warning)
  if (percentage > 70) color = '#f43f5e'; // rose-500 (danger)

  return (
    <div className="relative flex flex-col justify-between h-full rounded-[32px] border border-slate-800 bg-slate-900 p-6 min-h-[300px]">
      <h3 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Injury Risk</h3>
      
      {isAuthError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-[32px]">
           <GuestUpsell 
             title="Injury Prevention" 
             description="Sign in to calculate your injury risk based on workout habits." 
             actionLabel="Sign In" 
             onAction={() => navigate('/login')} 
             className="shadow-2xl rounded-[32px] bg-slate-900/50 border border-slate-800 border-dashed p-6"
           />
        </div>
      )}

      <div className={cn("relative flex-1 flex flex-col items-center justify-start mt-2", isAuthError && "opacity-30 pointer-events-none")}>
        <div className="h-[120px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={color} />
                <Cell fill="#1e293b" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center pb-2">
            <span className="text-2xl font-mono font-bold text-slate-50">{percentage}%</span>
            <span className="text-xs uppercase tracking-widest text-slate-500">Risk Level</span>
          </div>
        </div>

        {percentage > 60 && !isAuthError && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-500 w-full mb-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="text-xs font-medium leading-relaxed shadow-sm">High Risk — Consider scheduling a rest day or deload week.</p>
          </div>
        )}

        <div className="mt-4 text-[9px] leading-tight text-slate-500 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
          This prediction is based on a ML model trained on wearable-grade biometric data (WHOOP). Because we currently do not collect all required physiological signals, some fields are approximated with constants or random, this score is an experimental indicator, not a medical diagnosis. The model is tuned to catch potential risks (high recall), which means it may occasionally flag safe days as cautious.
        </div>
      </div>
    </div>
  );
}
