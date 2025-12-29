import { Button } from '@/components/ui/button';
import { TrendingUp, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTierGating } from '@/hooks/useTierGating';

interface DashboardUpgradeHeaderProps {
  scanCount: number;
}

const STORAGE_KEY = 'dashboard-upgrade-dismissed';

/**
 * Subtle upgrade prompt shown in dashboard header for free users with ≥1 scan.
 * Dismissible and remembers dismissal in localStorage.
 */
export function DashboardUpgradeHeader({ scanCount }: DashboardUpgradeHeaderProps) {
  const navigate = useNavigate();
  const { isFree, isLoading } = useTierGating();
  const [dismissed, setDismissed] = useState(true); // Start hidden until we check

  useEffect(() => {
    const wasDismissed = localStorage.getItem(STORAGE_KEY);
    setDismissed(wasDismissed === 'true');
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (isLoading || !isFree || dismissed || scanCount < 1) {
    return null;
  }

  return (
    <div className="relative flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 mb-6">
      <div className="flex items-center gap-3 min-w-0">
        <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            Reduce false positives with Pro
          </p>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Get context enrichment, correlation insights, and priority support.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/pricing')}
          className="text-primary hover:text-primary"
        >
          See plans
        </Button>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-full hover:bg-muted/50 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
