/**
 * InlineUpgradeModal — Focused upgrade modal triggered from results page.
 * Benefit-driven copy, simplified pricing toggle, no redirect to pricing page.
 */
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Check,
  TrendingUp,
  Network,
  ListChecks,
  ArrowRight,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useNavigate } from 'react-router-dom';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { VerificationBlockedMessage } from '@/components/auth/EmailVerificationBanner';

interface InlineUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BENEFITS = [
  { icon: TrendingUp, text: 'Platform-level risk scoring' },
  { icon: Network, text: 'Correlation mapping' },
  { icon: ListChecks, text: 'Exposure reduction checklist' },
  { icon: ArrowRight, text: 'Removal prioritization guidance' },
  { icon: Activity, text: 'Ongoing monitoring' },
] as const;

type BillingCycle = 'monthly' | 'annual';

export function InlineUpgradeModal({ open, onOpenChange }: InlineUpgradeModalProps) {
  const [cycle, setCycle] = useState<BillingCycle>('annual');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const { isVerified, isLoading: verificationLoading } = useEmailVerification();

  const shouldShowVerification = !verificationLoading && !isVerified;

  const handleUpgrade = async () => {
    if (!workspace?.id) {
      toast({ title: 'Error', description: 'No workspace selected', variant: 'destructive' });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: 'Sign in required', description: 'Please sign in to upgrade.', variant: 'destructive' });
      window.location.href = '/auth';
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: { plan: 'pro', interval: cycle === 'annual' ? 'year' : 'month', workspaceId: workspace.id },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast({ title: 'Checkout error', description: err?.message || 'Failed to start checkout', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleComparePlans = () => {
    onOpenChange(false);
    navigate('/pricing');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {shouldShowVerification ? (
          <div className="p-6 space-y-4">
            <DialogHeader className="text-center pb-2">
              <DialogTitle className="text-xl font-semibold">Verify your email first</DialogTitle>
            </DialogHeader>
            <VerificationBlockedMessage />
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="w-full text-muted-foreground">
              Close
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-gradient-to-br from-primary/10 via-background to-accent/5 p-6 pb-4 text-center space-y-2">
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold leading-tight">
                  Unlock Your Full Exposure Report
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground pt-1">
                  See what increases your identity risk — and what to fix first.
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Benefits */}
            <div className="px-6 pt-2 pb-4">
              <ul className="space-y-2.5">
                {BENEFITS.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Billing toggle */}
            <div className="px-6 pb-2">
              <div className="flex items-center justify-center gap-1 p-1 rounded-lg bg-muted/50">
                <button
                  onClick={() => setCycle('monthly')}
                  className={cn(
                    'flex-1 text-sm font-medium py-2 rounded-md transition-all duration-200',
                    cycle === 'monthly'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setCycle('annual')}
                  className={cn(
                    'flex-1 text-sm font-medium py-2 rounded-md transition-all duration-200 flex items-center justify-center gap-1.5',
                    cycle === 'annual'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Annual
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0">
                    Save 20%
                  </Badge>
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="px-6 pb-4 space-y-2.5">
              <Button
                onClick={handleUpgrade}
                disabled={loading}
                size="lg"
                className="w-full h-12 text-base font-semibold gap-2"
              >
                {loading ? 'Processing…' : 'Upgrade Now'}
                {!loading && <ChevronRight className="h-4 w-4" />}
              </Button>

              <button
                onClick={handleComparePlans}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2 text-center"
              >
                Compare Plans
              </button>
            </div>

            {/* Trust */}
            <div className="border-t border-border/50 px-6 py-3 text-center">
              <p className="text-[10px] text-muted-foreground/60 flex items-center justify-center gap-1.5">
                <Shield className="h-2.5 w-2.5" />
                Public sources only · Ethical OSINT · Cancel anytime
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
