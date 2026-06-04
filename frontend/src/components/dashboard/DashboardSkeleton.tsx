import { Skeleton, SkeletonCard, SkeletonChart } from '../shared/Skeletons';

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div>
        <Skeleton className="h-10 w-48 mb-4 max-w-[80vw]" />
        <Skeleton className="h-6 w-96 max-w-[90vw]" />
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} className="h-32 p-4" />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-40 rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trends */}
        <div className="lg:col-span-2">
          <SkeletonChart className="h-full min-h-[320px]" />
        </div>

        {/* Injury Risk */}
        <SkeletonCard className="h-full min-h-[320px]" />
      </div>

      {/* Active Plans */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <SkeletonCard key={i} className="h-40" />
          ))}
        </div>
      </div>
    </div>
  );
}
