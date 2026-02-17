import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ScoreHeroSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <Skeleton className="h-[180px] w-[180px] rounded-full shrink-0" />
        <div className="flex-1 w-full space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <div className="pt-2 border-t border-border">
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function StatsRowSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-4 space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-12" />
        </Card>
      ))}
    </div>
  );
}

export function PipelineSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function EmptyState({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
    </Card>
  );
}
