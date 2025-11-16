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
import { Crown, CreditCard, Zap, ArrowRight, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SUBSCRIPTION_PLANS } from '@/config/stripe';

interface OutOfCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditsNeeded?: number;
}

export const OutOfCreditsDialog = ({ 
  open, 
  onOpenChange,
  creditsNeeded = 5
}: OutOfCreditsDialogProps) => {
  const [loading, setLoading] = useState(false);

  const handleUpgradeToPro = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('billing-checkout', {
        body: { priceId: SUBSCRIPTION_PLANS.pro.priceId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Opening Stripe Checkout...');
        onOpenChange(false);
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Could not open checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyCredits = async () => {
    // Navigate to buy credits
    toast.info('Opening credit purchase options...');
    onOpenChange(false);
    window.location.href = '/pricing#credits';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-primary/20">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="destructive" className="text-xs">
              Out of Credits
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogTitle className="text-2xl">
            Unlock Premium for More
          </DialogTitle>
          <DialogDescription className="text-base">
            You need <strong>{creditsNeeded} credits</strong> to run this scan. 
            Upgrade to Pro for unlimited scans!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Pro Plan Option (Recommended) */}
          <div className="border-2 border-primary rounded-lg p-4 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">Pro Plan</h3>
                  <Badge variant="default" className="mt-1">
                    Recommended
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">$15</p>
                <p className="text-xs text-muted-foreground">/month</p>
              </div>
            </div>
            
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2 text-sm">
                <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Unlimited scans</strong> – no credit limits</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Advanced OSINT tools</strong> – Maigret and more</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>AI-powered analysis</strong> – catfish detection and insights</span>
              </li>
            </ul>

            <Button 
              onClick={handleUpgradeToPro}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              {loading ? 'Opening Checkout...' : (
                <>
                  Upgrade to Pro Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Buy Credits Option */}
          <div className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">Buy Credits</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    One-time purchase
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Purchase credit packs starting from <strong>$9 for 500 credits</strong>
            </p>

            <Button 
              onClick={handleBuyCredits}
              variant="outline"
              className="w-full"
            >
              View Credit Packs
            </Button>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Cancel anytime • Secure payment via Stripe • No hidden fees
        </p>
      </DialogContent>
    </Dialog>
  );
};
