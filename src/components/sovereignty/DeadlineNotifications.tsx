import { useEffect, useRef } from 'react';
import { SovereigntyRequest } from '@/hooks/useSovereignty';
import { differenceInDays, format } from 'date-fns';
import { toast } from 'sonner';

interface DeadlineNotificationsProps {
  requests: SovereigntyRequest[];
}

/**
 * Fires toast alerts for approaching/overdue deadlines on mount.
 * Shows: overdue (red), 3-day warning (amber), 7-day warning (yellow).
 */
export function DeadlineNotifications({ requests }: DeadlineNotificationsProps) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current || requests.length === 0) return;
    hasFired.current = true;

    const now = new Date();
    const active = requests.filter(
      r => r.deadline_at && !['completed', 'rejected'].includes(r.status)
    );

    const overdue = active.filter(r => new Date(r.deadline_at!) < now);
    const within3 = active.filter(r => {
      const d = differenceInDays(new Date(r.deadline_at!), now);
      return d >= 0 && d <= 3;
    });
    const within7 = active.filter(r => {
      const d = differenceInDays(new Date(r.deadline_at!), now);
      return d > 3 && d <= 7;
    });

    if (overdue.length > 0) {
      toast.error(
        `${overdue.length} erasure request${overdue.length > 1 ? 's' : ''} past statutory deadline`,
        {
          description: overdue.map(r => r.target_entity).join(', '),
          duration: 8000,
        }
      );
    }

    if (within3.length > 0) {
      toast.warning(
        `${within3.length} request${within3.length > 1 ? 's' : ''} due within 3 days`,
        {
          description: within3.map(r => `${r.target_entity} — ${format(new Date(r.deadline_at!), 'MMM d')}`).join(', '),
          duration: 6000,
        }
      );
    }

    if (within7.length > 0) {
      toast.info(
        `${within7.length} request${within7.length > 1 ? 's' : ''} due within 7 days`,
        { duration: 5000 }
      );
    }
  }, [requests]);

  return null; // render-less notification component
}
