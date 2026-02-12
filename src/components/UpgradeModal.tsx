import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Zap, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useState } from 'react';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: 'provider_blocked' | 'insufficient_credits' | 'batch_blocked' | 'darkweb_blocked' | 'email_scan_blocked' | 'phone_scan_blocked';
  blockedFeature?: string;
}

export function UpgradeModal({ open, onOpenChange, reason, blockedFeature }: UpgradeModalProps) {
  const { toast } = useToast();
  const { workspace } = useWorkspace();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (plan: 'pro' | 'business') => {
    if (!workspace?.id) {
      toast({
        title: 'Error',
        description: 'No workspace selected',
        variant: 'destructive',
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to upgrade your plan.',
        variant: 'destructive',
      });
      window.location.href = '/auth';
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: { plan, workspaceId: workspace.id },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast({
        title: 'Checkout error',
        description: err?.message || 'Failed to start checkout',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getMessage = () => {
    switch (reason) {
      case 'provider_blocked':
        return `${blockedFeature} is available with Pro Intelligence.`;
      case 'insufficient_credits':
        return 'Additional scan credits are available with Pro Intelligence.';
      case 'batch_blocked':
        return 'Batch scanning is available with Pro Intelligence.';
      case 'darkweb_blocked':
        return 'Dark web signal detection is available with the Unlimited plan.';
      case 'email_scan_blocked':
        return 'Email intelligence is available with Pro Intelligence. Free plan supports username lookups.';
      case 'phone_scan_blocked':
        return 'Phone intelligence is available with Pro Intelligence. Free plan supports username lookups.';
      default:
        return 'Pro Intelligence provides full correlation visibility and structured reporting.';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Switch to Pro Intelligence</DialogTitle>
          <DialogDescription>{getMessage()}</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {/* Free */}
          <Card className="p-6 border-muted">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">Free</h3>
              <div className="text-3xl font-bold my-2">$0</div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>10 scans/month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>Basic OSINT tools</span>
              </li>
            </ul>
          </Card>

          {/* Pro */}
          <Card className="p-6 border-primary shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
              RECOMMENDED
            </div>
            <div className="text-center mb-4">
              <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="text-lg font-semibold">Pro</h3>
              <div className="text-3xl font-bold my-2">$29<span className="text-base font-normal">/mo</span></div>
              <p className="text-sm text-muted-foreground">Most Popular</p>
            </div>
            <ul className="space-y-2 text-sm mb-4">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <span>100 scans/month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <span>Advanced providers</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <span>Batch scanning</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <span>API access</span>
              </li>
            </ul>
            <Button onClick={() => handleUpgrade('pro')} disabled={loading} className="w-full">
              Switch to Pro Intelligence
            </Button>
          </Card>

          {/* Business */}
          <Card className="p-6 border-muted">
            <div className="text-center mb-4">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-amber-500" />
              <h3 className="text-lg font-semibold">Business</h3>
              <div className="text-3xl font-bold my-2">$99<span className="text-base font-normal">/mo</span></div>
              <p className="text-sm text-muted-foreground">For Teams</p>
            </div>
            <ul className="space-y-2 text-sm mb-4">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-amber-500 mt-0.5" />
                <span>Higher limits & priority</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-amber-500 mt-0.5" />
                <span>Advanced capabilities</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-amber-500 mt-0.5" />
                <span>Priority support</span>
              </li>
            </ul>
            <Button onClick={() => handleUpgrade('business')} disabled={loading} variant="outline" className="w-full">
              Upgrade to Business
            </Button>
          </Card>
        </div>

        <div className="text-center mt-4">
          <Button variant="link" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
