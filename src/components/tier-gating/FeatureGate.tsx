import { ReactNode } from 'react';
import { useTierGating } from '@/hooks/useTierGating';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Zap, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SubscriptionTier } from '@/lib/workspace/quotas';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback,
  showUpgrade = true 
}: FeatureGateProps) {
  const { checkFeatureAccess } = useTierGating();
  const result = checkFeatureAccess(feature);

  if (result.hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  return (
    <Card className="p-6 border-2 border-dashed border-border/50 bg-muted/20">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          {result.requiresTier === 'enterprise' ? (
            <Crown className="w-6 h-6 text-primary" />
          ) : (
            <Zap className="w-6 h-6 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold">Premium Feature</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {result.reason}
          </p>
          <Link to="/settings/billing">
            <Button>
              Upgrade to {result.requiresTier === 'enterprise' ? 'Enterprise' : 'Pro'}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

interface TierBadgeProps {
  tier: SubscriptionTier;
  className?: string;
}

export function TierBadge({ tier, className = '' }: TierBadgeProps) {
  const config = {
    free: {
      label: 'Free',
      icon: null,
      className: 'bg-muted text-muted-foreground',
    },
    pro: {
      label: 'Pro',
      icon: Zap,
      className: 'bg-primary/10 text-primary',
    },
    enterprise: {
      label: 'Enterprise',
      icon: Crown,
      className: 'bg-primary text-primary-foreground',
    },
  };

  const { label, icon: Icon, className: badgeClass } = config[tier];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${badgeClass} ${className}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </span>
  );
}
