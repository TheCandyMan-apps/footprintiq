import { Skeleton } from '@/components/ui/skeleton';

interface AccountsTabSkeletonProps {
  viewMode?: 'list' | 'grid';
}

function FilterBarSkeleton() {
  return (
    <div className="space-y-1.5">
      {/* Quick filter pills */}
      <div className="flex gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6 rounded-full" style={{ width: `${60 + i * 12}px` }} />
        ))}
      </div>
      {/* Focus toggle + search + sort + view toggle */}
      <div className="flex gap-1 items-center">
        <Skeleton className="h-5 w-10 rounded-full shrink-0" />
        <Skeleton className="h-6 flex-1 rounded" />
        <Skeleton className="h-6 w-[100px] rounded" />
        <Skeleton className="h-6 w-[90px] rounded" />
        <Skeleton className="h-6 w-14 rounded" />
      </div>
      {/* Summary bar */}
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-16 rounded" />
        <Skeleton className="h-5 w-16 rounded" />
        <Skeleton className="h-5 w-20 rounded" />
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-2 px-2 py-1 min-h-[44px] border-b border-border/15">
      {/* Icon + thumbnail */}
      <div className="shrink-0 w-12">
        <Skeleton className="w-11 h-11 rounded" />
      </div>
      {/* Text */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2.5 w-16" />
        </div>
        <Skeleton className="h-2 w-32" />
      </div>
      {/* Badge */}
      <div className="shrink-0 flex gap-1">
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-lg border-2 border-border bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-2.5 pt-2 pb-1">
        <Skeleton className="w-8 h-8 rounded shrink-0" />
        <div className="flex-1 min-w-0 space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2.5 w-14" />
        </div>
        <Skeleton className="h-5 w-12 rounded-full shrink-0" />
      </div>
      {/* Bio */}
      <div className="px-2.5 pb-1.5">
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-2 w-3/4 mt-1" />
      </div>
      {/* Actions */}
      <div className="flex border-t border-border/15 divide-x divide-border/15">
        <Skeleton className="flex-1 h-7 rounded-none" />
        <Skeleton className="flex-1 h-7 rounded-none" />
      </div>
    </div>
  );
}

export function AccountsTabSkeleton({ viewMode = 'list' }: AccountsTabSkeletonProps) {
  return (
    <div className="space-y-1.5">
      <FilterBarSkeleton />
      {viewMode === 'list' ? (
        <div className="border border-border/20 rounded overflow-hidden bg-card">
          {Array.from({ length: 8 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
