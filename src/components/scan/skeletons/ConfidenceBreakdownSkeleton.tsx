import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Skeleton placeholder for the Confidence Breakdown / Exposure Summary section.
 * Fixed height prevents layout shift.
 */
export function ConfidenceBreakdownSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-3 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-2.5 w-full rounded-full" />
          <Skeleton className="h-2.5 w-3/4 rounded-full" />
          <Skeleton className="h-2.5 w-1/2 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
