import { useState } from 'react';
import { DailyLogForm, DailyLogFormData } from '../components/daily-log/DailyLogForm';
import { LogHistoryTable } from '../components/daily-log/LogHistoryTable';
import { PageWrapper } from '../components/shared/PageWrapper';

export function DailyLogPage() {
  const [editingLog, setEditingLog] = useState<(DailyLogFormData & { id: number }) | undefined>(undefined);
  const [displayedLogId, setDisplayedLogId] = useState<number | undefined>(undefined);

  return (
    <PageWrapper
      title="Daily Log"
      description="TRACK YOUR METRICS TO CALIBRATE THE AI MODEL."
    >
      <div className="space-y-12 max-w-4xl mx-auto">
        <section>
          <h2 className="mb-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {displayedLogId ? <><span className="text-lime-400">ID-{displayedLogId}</span> LOG METRICS</> : 'LOG METRICS'}
          </h2>
          <DailyLogForm 
            initialData={editingLog} 
            onSuccess={() => setEditingLog(undefined)} 
            onDisplayedLogChange={setDisplayedLogId}
          />
        </section>

        <section>
          <LogHistoryTable 
            onEdit={(log) => {
              setEditingLog(log);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
          />
        </section>
      </div>
    </PageWrapper>
  );
}
