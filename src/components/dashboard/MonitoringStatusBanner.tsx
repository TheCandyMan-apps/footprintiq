import { Shield, ShieldCheck, Clock } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { addDays, format } from 'date-fns';

export const MonitoringStatusBanner = () => {
  const { isPremium } = useSubscription();

  // Next scheduled scan is always tomorrow for Pro users
  const nextScanDate = addDays(new Date(), 1);

  if (isPremium) {
    return (
      <div className="flex items-center justify-center gap-3 py-2 px-4 rounded-lg bg-primary/5 border border-primary/15 mt-4">
        <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="text-sm font-medium text-primary">
          Monitoring Active – Next scan scheduled on {format(nextScanDate, 'MMM d, yyyy')}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-muted/40 border border-border/40 mt-4">
      <Shield className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">
        Monitoring available with Pro
      </span>
    </div>
  );
};
