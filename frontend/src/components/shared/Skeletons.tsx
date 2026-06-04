
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-[24px] bg-slate-800 ${className}`} />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`rounded-[32px] border border-slate-800 bg-slate-900 p-8 flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4 w-full">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <div className="space-y-3 w-full">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      </div>
      <div className="space-y-4 mt-6">
        <Skeleton className="h-10 w-full rounded-[24px]" />
        <Skeleton className="h-10 w-full rounded-[24px]" />
      </div>
    </div>
  );
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={`rounded-[32px] border border-slate-800 bg-slate-900 p-8 ${className}`}>
      <Skeleton className="h-4 w-40 mb-8" />
      <Skeleton className="h-64 w-full rounded-[24px]" />
    </div>
  );
}

export function SkeletonTable({ columns = 4, rows = 5, className }: { columns?: number, rows?: number, className?: string }) {
  return (
    <div className={`rounded-[32px] border border-slate-800 bg-slate-900 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <div className="p-6 space-y-6">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-6">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
