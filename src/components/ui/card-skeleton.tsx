import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CardSkeletonProps {
  className?: string;
  showHeader?: boolean;
  showDescription?: boolean;
  contentLines?: number;
}

/**
 * CardSkeleton - Reusable skeleton component for loading card states
 * Provides consistent loading UI across the application
 */
export function CardSkeleton({ 
  className, 
  showHeader = true, 
  showDescription = true,
  contentLines = 3 
}: CardSkeletonProps) {
  return (
    <Card className={cn("animate-pulse", className)}>
      {showHeader && (
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-[200px]" />
          </CardTitle>
          {showDescription && (
            <CardDescription>
              <Skeleton className="h-4 w-[300px] mt-2" />
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: contentLines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

interface StatCardSkeletonProps {
  className?: string;
}

/**
 * StatCardSkeleton - Skeleton for stat/metric cards
 */
export function StatCardSkeleton({ className }: StatCardSkeletonProps) {
  return (
    <Card className={cn("animate-pulse", className)}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-8 w-[60px]" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
