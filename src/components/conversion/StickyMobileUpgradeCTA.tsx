/**
 * StickyMobileUpgradeCTA
 * 
 * Persistent bottom bar on mobile (< md) for free scan results.
 * Shows platform count and a direct upgrade CTA.
 * Dismissible for 24h via localStorage.
 */

import { useState, useEffect } from 'react';
import { Lock, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StickyMobileUpgradeCTAProps {
  hiddenPlatformCount: number;
  totalPlatformCount: number;
  onUpgradeClick: () => void;
}

const DISMISS_KEY = 'dismiss_sticky_upgrade_cta';
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function StickyMobileUpgradeCTA({
  hiddenPlatformCount,
  totalPlatformCount,
  onUpgradeClick,
}: StickyMobileUpgradeCTAProps) {
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

  useEffect(() => {
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_DURATION_MS) {
      setDismissed(true);
    } else {
      setDismissed(false);
    }
  }, []);

  if (dismissed || hiddenPlatformCount <= 0) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  };

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 md:hidden',
        'bg-background/95 backdrop-blur-md border-t border-primary/20',
        'shadow-[0_-4px_20px_-4px_hsl(var(--primary)/0.15)]',
        'pb-[env(safe-area-inset-bottom,0px)]',
        'animate-in slide-in-from-bottom-4 duration-300'
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {hiddenPlatformCount} hidden platform{hiddenPlatformCount > 1 ? 's' : ''}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            You're seeing {totalPlatformCount - hiddenPlatformCount} of {totalPlatformCount} detected
          </p>
        </div>

        <Button
          size="sm"
          className="h-11 px-5 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 active:scale-[0.97] transition-transform duration-130"
          onClick={onUpgradeClick}
        >
          <Lock className="h-3.5 w-3.5" />
          Unlock
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>

        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
