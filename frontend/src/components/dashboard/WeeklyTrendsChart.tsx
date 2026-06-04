import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { chartDefaults } from '../charts/chartDefaults';
import { GuestUpsell } from '../shared/GuestUpsell';
import { useNavigate } from 'react-router-dom';

const dummyData = [
  { name: 'Mon', recovery: 65, sleep: 6.5 },
  { name: 'Tue', recovery: 78, sleep: 7.2 },
  { name: 'Wed', recovery: 85, sleep: 8.0 },
  { name: 'Thu', recovery: 72, sleep: 6.8 },
  { name: 'Fri', recovery: 90, sleep: 8.5 },
  { name: 'Sat', recovery: 95, sleep: 9.0 },
  { name: 'Sun', recovery: 88, sleep: 7.5 },
];

interface Props {
  isAuthError: boolean;
  weeklyLogs?: any[];
}

export function WeeklyTrendsChart({ isAuthError, weeklyLogs }: Props) {
  const navigate = useNavigate();

  const chartData = React.useMemo(() => {
    if (!weeklyLogs || !Array.isArray(weeklyLogs) || weeklyLogs.length === 0) {
      return dummyData;
    }
    return [...weeklyLogs].reverse().map((log: any) => ({
      name: new Date(log.created_at).toLocaleDateString('en-US', { weekday: 'short' }),
      recovery: log.recovery_score || 0,
      sleep: log.sleep_hours || 0
    }));
  }, [weeklyLogs]);

  return (
    <div className="relative rounded-[32px] bg-slate-900 border border-slate-800 p-6">
      <h3 className="mb-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Weekly Trends</h3>
      
      {isAuthError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-[32px]">
          <GuestUpsell 
             title="Track Your Progress" 
             description="Log daily data to see trends and analyze your recovery over time." 
             actionLabel="Sign In" 
             onAction={() => navigate('/login')} 
             className="shadow-2xl rounded-[32px] bg-slate-900/50 border border-slate-800 border-dashed p-6"
          />
        </div>
      )}

      <div className={`h-[300px] w-full ${isAuthError ? 'opacity-30 pointer-events-none' : ''}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={isAuthError ? [] : chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid {...chartDefaults.cartesianGrid} />
            <XAxis dataKey="name" {...chartDefaults.xAxis} />
            <YAxis yAxisId="left" {...chartDefaults.yAxis} tickFormatter={(v) => `${v}%`} />
            <YAxis yAxisId="right" orientation="right" {...chartDefaults.yAxis} tickFormatter={(v) => `${v}h`} />
            <Tooltip 
              {...chartDefaults.tooltip}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
            />
            <Line yAxisId="left" type="monotone" dataKey="recovery" stroke="#818cf8" strokeWidth={3} dot={{ fill: '#818cf8', r: 4 }} activeDot={{ r: 6, fill: '#818cf8' }} name="Recovery Score" />
            <Line yAxisId="right" type="monotone" dataKey="sleep" stroke="#bef264" strokeWidth={3} dot={{ fill: '#bef264', r: 4 }} activeDot={{ r: 6, fill: '#bef264' }} name="Sleep Hours" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
