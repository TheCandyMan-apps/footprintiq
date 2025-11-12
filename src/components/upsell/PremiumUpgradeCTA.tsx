import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SUBSCRIPTION_PLANS } from '@/config/stripe';

interface PremiumUpgradeCTAProps {
  variant?: 'banner' | 'card' | 'inline';
  message?: string;
  feature?: string;
}

export const PremiumUpgradeCTA = ({ 
  variant = 'card',
  message = 'Upgrade to Pro for unlimited scans',
  feature = 'unlimited scans'
}: PremiumUpgradeCTAProps) => {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('billing-checkout', {
        body: { priceId: SUBSCRIPTION_PLANS.pro.priceId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Opening Stripe Checkout...');
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

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/20">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {message}
                <Badge variant="default" className="bg-primary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  $15/mo
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground">
                Get {feature} and premium features
              </p>
            </div>
          </div>
          <Button 
            onClick={handleUpgrade} 
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? 'Loading...' : (
              <>
                Upgrade Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <Crown className="h-5 w-5 text-primary flex-shrink-0" />
        <p className="text-sm flex-1">
          {message} – <strong>$15/mo</strong>
        </p>
        <Button 
          onClick={handleUpgrade} 
          disabled={loading}
          size="sm"
          className="bg-primary hover:bg-primary/90"
        >
          {loading ? '...' : 'Upgrade'}
        </Button>
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Crown className="h-6 w-6 text-primary" />
          <Badge variant="default" className="bg-primary">
            <Sparkles className="h-3 w-3 mr-1" />
            Pro Plan
          </Badge>
        </div>
        <CardTitle className="text-2xl">{message}</CardTitle>
        <CardDescription>
          Unlock premium features for just <strong className="text-primary">$15/month</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-2">
            <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Unlimited Scans</p>
              <p className="text-sm text-muted-foreground">No limits on scan frequency or depth</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Advanced Tools</p>
              <p className="text-sm text-muted-foreground">Access to premium OSINT tools and dark web scanning</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">AI-Powered Analysis</p>
              <p className="text-sm text-muted-foreground">Get AI insights and catfish detection</p>
            </div>
          </div>
        </div>
        <Button 
          onClick={handleUpgrade} 
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
        <p className="text-xs text-center text-muted-foreground mt-3">
          Cancel anytime • Secure payment via Stripe
        </p>
      </CardContent>
    </Card>
  );
};
