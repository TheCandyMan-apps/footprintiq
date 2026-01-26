import { useState, useEffect } from 'react';
import { X, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUserPersona } from '@/hooks/useUserPersona';

const HINT_DISMISSED_KEY = 'fpiq_advanced_mode_hint_dismissed';

interface AdvancedModeHintProps {
  /** Show only after scan is complete */
  scanComplete: boolean;
}

/**
 * Subtle, non-blocking banner that suggests switching to Advanced mode.
 * Only shows for Standard users after completing at least one scan.
 * Dismisses permanently on close.
 */
export function AdvancedModeHint({ scanComplete }: AdvancedModeHintProps) {
  const { persona, loading } = useUserPersona();
  const [dismissed, setDismissed] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check localStorage for dismissal
    const wasDismissed = localStorage.getItem(HINT_DISMISSED_KEY);
    setDismissed(!!wasDismissed);
  }, []);

  // Show with a delay after scan completes
  useEffect(() => {
    if (loading || dismissed || persona !== 'standard' || !scanComplete) {
      setVisible(false);
      return;
    }

    // Show after a short delay to not interrupt the results experience
    const timer = setTimeout(() => {
      setVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [loading, dismissed, persona, scanComplete]);

  const handleDismiss = () => {
    localStorage.setItem(HINT_DISMISSED_KEY, 'true');
    setDismissed(true);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="animate-fade-in flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm text-muted-foreground">
      <Settings2 className="h-4 w-4 text-primary/70 flex-shrink-0" />
      <span className="flex-1">
        Want more detail?{' '}
        <Link 
          to="/settings/profile" 
          className="text-primary hover:underline font-medium"
        >
          Switch to Advanced mode in Settings
        </Link>
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:text-foreground"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
