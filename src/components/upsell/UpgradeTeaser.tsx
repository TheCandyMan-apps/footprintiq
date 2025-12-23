import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, Zap, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTierGating } from '@/hooks/useTierGating';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

interface UpgradeTeaserProps {
  feature: string;
  title: string;
  description: string;
  benefits: string[];
  plan?: 'pro' | 'business';
  className?: string;
}

export function UpgradeTeaser({
  feature,
  title,
  description,
  benefits,
  plan = 'pro',
  className = ''
}: UpgradeTeaserProps) {
  const navigate = useNavigate();
  const { isFree, isPro } = useTierGating();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      // Refresh session
      await supabase.auth.refreshSession();

      // Try billing-checkout first, then fallback
      const { data, error } = await supabase.functions.invoke('billing-checkout', {
        body: { plan }
      });

      if (error || !data?.url) {
        const fallback = await supabase.functions.invoke('billing/checkout', {
          body: { plan }
        });
        
        if (fallback.error || !fallback.data?.url) {
          throw new Error('Failed to create checkout session');
        }
        
        window.open(fallback.data.url, '_blank');
      } else {
        window.open(data.url, '_blank');
      }

      toast({
        title: 'Redirecting to checkout',
        description: 'Complete your upgrade to unlock premium features.',
      });
    } catch (error) {
      console.error('Upgrade error:', error);
      toast({
        title: 'Upgrade Failed',
        description: error instanceof Error ? error.message : 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  // Don't show if user already has access
  if (plan === 'pro' && (isPro || !isFree)) return null;
  if (plan === 'business' && !isFree && !isPro) return null;

  return (
    <Card className={`relative overflow-hidden border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background ${className}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-accent opacity-10 blur-3xl" />
      
      <div className="relative p-6 space-y-4">
          <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 backdrop-blur-sm">
              {plan === 'business' ? (
                <Crown className="w-6 h-6 text-primary" />
              ) : (
                <Zap className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <Badge variant="secondary" className="text-xs">
                  {plan === 'business' ? 'Business' : 'Pro'} Feature
                </Badge>
              </div>
              <h3 className="font-bold text-lg">{title}</h3>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        </div>

        <p className="text-sm text-muted-foreground">{description}</p>

        <ul className="space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <div className="pt-4 space-y-2">
          <Button
            className="w-full"
            size="lg"
            onClick={handleUpgrade}
            disabled={isUpgrading}
          >
            {isUpgrading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Processing...
              </>
            ) : (
              <>
                Upgrade to {plan === 'business' ? 'Business' : 'Pro'} 
                {plan === 'pro' && ' – £14.99/mo'}
                {plan === 'business' && ' – £49.99/mo'}
              </>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Unlimited scans • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </Card>
  );
}
