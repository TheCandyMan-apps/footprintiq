/**
 * PostCheckoutOnboarding — Celebratory modal shown after successful Stripe checkout.
 * Guides new Pro users to their first full scan.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles, Shield, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { analytics } from '@/lib/analytics';

const PRO_UNLOCKS = [
  { icon: Shield, label: 'Full platform coverage', description: 'All OSINT tools active' },
  { icon: Zap, label: 'AI-powered insights', description: 'Correlation & risk analysis' },
  { icon: Sparkles, label: 'Removal pathways', description: 'Actionable opt-out guides' },
];

export function PostCheckoutOnboarding() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setIsOpen(true);
      analytics.trackEvent('post_checkout_onboarding_shown');
      // Clean URL without triggering navigation
      const next = new URLSearchParams(searchParams);
      next.delete('checkout');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleRunScan = () => {
    setIsOpen(false);
    analytics.trackEvent('post_checkout_first_scan_click');
    navigate('/scan');
  };

  const handleDismiss = () => {
    setIsOpen(false);
    analytics.trackEvent('post_checkout_dismissed');
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6 pb-4 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Welcome to Pro! 🎉
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your upgrade is active. Here's what you've unlocked.
          </p>
        </div>

        {/* Unlocked features */}
        <div className="px-6 py-4 space-y-3">
          {PRO_UNLOCKS.map(({ icon: Icon, label, description }) => (
            <div
              key={label}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40"
            >
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 space-y-2">
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handleRunScan}
          >
            Run Your First Pro Scan
            <ArrowRight className="h-4 w-4" />
          </Button>
          <button
            onClick={handleDismiss}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            I'll explore on my own
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
