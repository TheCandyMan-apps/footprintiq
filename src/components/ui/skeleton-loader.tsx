import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonLoaderProps {
  variant?: 'card' | 'table' | 'list' | 'text';
  count?: number;
}

export const SkeletonLoader = ({ variant = 'card', count = 1 }: SkeletonLoaderProps) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'card') {
    return (
      <div className="space-y-4">
        {items.map((i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="bg-muted p-4 border-b border-border">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        {items.map((i) => (
          <div key={i} className="p-4 border-b border-border last:border-0">
            <div className="flex gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {items.map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  // text variant
  return (
    <div className="space-y-2">
      {items.map((i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
};

export const ScanResultsSkeleton = () => (
  <div className="space-y-6">
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <Skeleton className="h-px w-full" />
        <div className="flex gap-3">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    </div>
    
    <SkeletonLoader variant="table" count={5} />
  </div>
);
