import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton for the Timeline tab — mimics filter pills + year-grouped event list.
 */
export function TimelineTabSkeleton() {
  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex gap-1.5 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 rounded-full" style={{ width: `${56 + i * 10}px` }} />
        ))}
      </div>

      {/* Summary stats */}
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded" />
        <Skeleton className="h-5 w-28 rounded" />
      </div>

      {/* Year group 1 */}
      <TimelineYearSkeleton eventCount={4} />

      {/* Year group 2 */}
      <TimelineYearSkeleton eventCount={3} />
    </div>
  );
}

function TimelineYearSkeleton({ eventCount }: { eventCount: number }) {
  return (
    <div className="space-y-1">
      {/* Year header */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-12 rounded" />
        <Skeleton className="h-[1px] flex-1" />
      </div>

      {/* Events */}
      <div className="space-y-1 pl-4 border-l-2 border-border/20 ml-2">
        {Array.from({ length: eventCount }).map((_, i) => (
          <div key={i} className="flex items-start gap-2 py-1.5">
            {/* Dot */}
            <Skeleton className="w-2.5 h-2.5 rounded-full shrink-0 mt-1 -ml-[21px]" />
            {/* Content */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-2.5 w-3/4" />
            </div>
            {/* Badge */}
            <Skeleton className="h-5 w-14 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
