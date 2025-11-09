import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const FootprintDNASkeleton = () => {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 border-border shadow-lg">
      {/* Animated glow effect */}
      <div className="absolute inset-0 opacity-20 blur-3xl pointer-events-none animate-pulse">
        <div className="absolute inset-0 bg-gradient-radial from-primary/30 to-transparent" />
      </div>
      
      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Circular Progress Ring Skeleton */}
          <div className="relative flex-shrink-0">
            <Skeleton className="w-[160px] h-[160px] rounded-full" />
            
            {/* Score in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Skeleton className="h-10 w-16 mb-1" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>

          {/* Title and Metrics Skeleton */}
          <div className="flex-1 w-full space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              
              {/* Rescan button skeleton */}
              <Skeleton className="h-9 w-24 flex-shrink-0" />
            </div>

            {/* Mini Metrics Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="relative p-3 rounded-lg border border-border bg-secondary/30 animate-pulse"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-6 w-8" />
                  </div>
                  
                  <Skeleton className="h-3 w-16 mb-2" />
                  
                  {/* Sparkline skeleton */}
                  <div className="h-8 flex items-end gap-0.5">
                    {[...Array(12)].map((_, i) => (
                      <Skeleton
                        key={i}
                        className="flex-1"
                        style={{
                          height: `${20 + Math.random() * 40}%`,
                          animationDelay: `${i * 50}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[slide-in-right_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
    </Card>
  );
};
