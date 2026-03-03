import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton placeholder for a profile/account card.
 * Mimics AccountRow layout to prevent layout shift.
 */
export function ProfileCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-border/20 last:border-0">
      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-44" />
      </div>
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
  );
}

export function AccountsListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="border border-border/30 rounded-lg overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <ProfileCardSkeleton key={i} />
      ))}
    </div>
  );
}
