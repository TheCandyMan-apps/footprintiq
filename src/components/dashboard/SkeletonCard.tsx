import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const SkeletonStatCard = () => {
  return (
    <Card className="group relative overflow-hidden rounded-lg bg-card p-6 shadow-card">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="p-2 rounded-lg bg-muted animate-pulse">
          <div className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 bg-muted rounded mb-2 animate-pulse" />
        <div className="h-3 w-32 bg-muted rounded animate-pulse" />
      </CardContent>
    </Card>
  );
};

export const SkeletonScanCard = () => {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-card p-6 shadow-card">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 rounded-lg bg-muted animate-pulse">
              <div className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 bg-muted rounded animate-pulse" />
              <div className="h-3 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="h-8 w-24 bg-muted rounded animate-pulse" />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
          <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
          <div className="h-6 w-32 bg-muted rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonRecentScans = () => {
  return (
    <Card className="group relative overflow-hidden rounded-lg bg-card p-6 shadow-card">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-card to-card/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted animate-pulse">
            <div className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <SkeletonScanCard key={i} />
        ))}
      </CardContent>
    </Card>
  );
};
