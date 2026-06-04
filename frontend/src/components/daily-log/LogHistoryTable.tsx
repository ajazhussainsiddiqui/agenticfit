import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { Loader2, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { getErrorMessage } from '../../lib/utils';
import { DailyLogFormData } from './DailyLogForm';
import { SkeletonTable } from '../shared/Skeletons';
import { AuthErrorHandler } from '../shared/AuthErrorHandler';

interface Props {
  onEdit: (log: DailyLogFormData & { id: number }) => void;
}

export function LogHistoryTable({ onEdit }: Props) {
  const [searchLimit, setSearchLimit] = useState(10);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data: logs, error, isLoading } = useQuery<any[], any>({
    queryKey: ['daily-logs', searchLimit],
    queryFn: async () => {
      const res = await api.get(`/planner/daily-logs/search?search_limit=${searchLimit}`);
      return res.data;
    },
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/planner/daily-logs/delete?log_id=${id}`);
    },
    onSuccess: () => {
      toast.success('Log deleted');
      queryClient.invalidateQueries({ queryKey: ['daily-logs'] });
      setDeleteConfirmId(null);
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err, 'Failed to delete log'));
    }
  });

  return (
    <div className="mt-16">
      <div className="mb-6 flex items-center justify-between">
         <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Log History</h3>
      </div>

      <AuthErrorHandler 
        error={error} 
        isInitialLoad={true}
        fallbackTitle="View Your History"
        fallbackDescription="Sign in to view your past daily logs, trends, and history."
      >
        {isLoading ? (
          <SkeletonTable columns={4} rows={4} />
        ) : (
          <div className="overflow-x-auto rounded-[32px] border border-slate-800 bg-slate-900">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-slate-800/50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Strain</th>
                  <th className="px-6 py-4 font-semibold">Recovery</th>
                  <th className="px-6 py-4 font-semibold">Sleep</th>
                  <th className="px-6 py-4 font-semibold hidden sm:table-cell">L7 Trend</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {logs?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                       No logs found.
                    </td>
                  </tr>
                ) : (
                  logs?.map((log, index, allLogs) => (
                    <React.Fragment key={log.id}>
                      <tr className="transition-colors hover:bg-slate-800/30">
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                           #{log.id}
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-mono text-sm">
                           {new Date(log.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                           <span className="inline-flex rounded-full bg-slate-800 px-2 py-1 text-[10px] font-mono font-bold text-slate-300">
                             {Number(log.day_strain).toFixed(1)}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <span className="inline-flex rounded-full bg-lime-400/10 px-2 py-1 text-[10px] font-mono font-bold text-lime-400">
                             {log.recovery_score}%
                           </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-mono text-sm">
                           {log.sleep_hours}h
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                           <div className="h-8 w-24">
                             <ResponsiveContainer width="100%" height="100%">
                               <LineChart data={[...allLogs].slice(index, index + 7).reverse()}>
                                 <Line type="monotone" dataKey="recovery_score" stroke="#a3e635" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                                 <Line type="monotone" dataKey="day_strain" stroke="#f43f5e" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                               </LineChart>
                             </ResponsiveContainer>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2">
                             <button 
                               onClick={() => onEdit(log)}
                               className="p-2 text-slate-500 transition-colors hover:text-lime-400 focus:outline-none bg-slate-800 rounded-lg rounded-xl"
                               title="Edit Log"
                               aria-label="Edit Log"
                             >
                               <Edit2 className="h-4 w-4" />
                             </button>
                             <button 
                               onClick={() => setDeleteConfirmId(log.id)}
                               className="p-2 text-slate-500 transition-colors hover:text-rose-500 focus:outline-none bg-slate-800 rounded-lg rounded-xl"
                               title="Delete Log"
                               aria-label="Delete Log"
                             >
                               <Trash2 className="h-4 w-4" />
                             </button>
                           </div>
                        </td>
                      </tr>
                      
                      {/* Inline Delete Confirmation */}
                      {deleteConfirmId === log.id && (
                        <tr className="bg-rose-500/5 border-l-4 border-rose-500">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <span className="text-xs font-bold uppercase tracking-widest text-rose-500">Confirm Deletion?</span>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setDeleteConfirmId(null)}
                                  disabled={deleteMutation.isPending}
                                  className="px-4 py-2 text-xs font-bold tracking-widest text-slate-400 hover:text-slate-100 transition-colors disabled:opacity-50 uppercase"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={() => deleteMutation.mutate(log.id)}
                                  disabled={deleteMutation.isPending}
                                  className="px-4 py-2 text-xs font-bold tracking-widest bg-rose-500 text-slate-50 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center uppercase"
                                >
                                  {deleteMutation.isPending ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : null}
                                  DELETE
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </AuthErrorHandler>
      
      {logs && logs.length >= searchLimit && (
        <div className="mt-6 flex justify-center">
           <button 
             onClick={() => setSearchLimit(prev => prev + 10)}
             className="px-6 py-3 rounded-xl border border-slate-800 bg-slate-900 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
           >
             LOAD MORE
           </button>
        </div>
      )}
    </div>
  );
}
