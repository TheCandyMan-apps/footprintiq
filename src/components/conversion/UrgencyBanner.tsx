/**
 * UrgencyBanner
 * 
 * Time-limited offer banner shown after a free scan completes.
 * Creates a sense of urgency with a countdown timer.
 * Dismissible; persists dismiss state for the session.
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, X, Zap } from 'lucide-react';

interface UrgencyBannerProps {
  scanId: string;
  onUpgradeClick: () => void;
  /** Duration in minutes for the countdown (default: 15) */
  durationMinutes?: number;
}

const DISMISS_PREFIX = 'dismiss_urgency_';

export function UrgencyBanner({
  scanId,
  onUpgradeClick,
  durationMinutes = 15,
}: UrgencyBannerProps) {
  const storageKey = `${DISMISS_PREFIX}${scanId}`;
  const startKey = `urgency_start_${scanId}`;

  const [dismissed, setDismissed] = useState(true);
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [expired, setExpired] = useState(false);

  // Initialize start time (persisted so refresh doesn't reset)
  useEffect(() => {
    if (sessionStorage.getItem(storageKey)) {
      setDismissed(true);
      return;
    }

    let startTime = Number(sessionStorage.getItem(startKey));
    if (!startTime) {
      startTime = Date.now();
      sessionStorage.setItem(startKey, String(startTime));
    }

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = durationMinutes * 60 - elapsed;

    if (remaining <= 0) {
      setExpired(true);
      setDismissed(true);
      return;
    }

    setTimeLeft(remaining);
    setDismissed(false);
  }, [scanId, durationMinutes, storageKey, startKey]);

  // Countdown ticker
  useEffect(() => {
    if (dismissed || expired) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setExpired(true);
          setDismissed(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [dismissed, expired]);

  const handleDismiss = useCallback(() => {
    sessionStorage.setItem(storageKey, '1');
    setDismissed(true);
  }, [storageKey]);

  if (dismissed) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLow = timeLeft < 120; // under 2 minutes

  return (
    <Card className="overflow-hidden border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-background to-amber-500/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="h-4 w-4 text-amber-500" />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Unlock your full results
              </h3>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Your scan results are ready. Upgrade now to see the complete analysis before this offer expires.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold ${
                isLow 
                  ? 'bg-destructive/10 text-destructive animate-pulse' 
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}>
                <Clock className="h-3.5 w-3.5" />
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>

              <Button
                size="sm"
                className="h-9 gap-1.5 bg-amber-500 hover:bg-amber-600 text-white active:scale-[0.97] transition-transform duration-130"
                onClick={onUpgradeClick}
              >
                Unlock Now
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
