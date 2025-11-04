import { Badge } from '@/components/ui/badge';
import { Shield, Zap, Building2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export function SubscriptionBadge() {
  const { subscriptionTier } = useSubscription();

  if (subscriptionTier === 'free') {
    return null;
  }

  const config = {
    analyst: {
      label: 'Analyst',
      icon: Shield,
      variant: 'secondary' as const,
    },
    pro: {
      label: 'Pro',
      icon: Zap,
      variant: 'default' as const,
    },
    enterprise: {
      label: 'Enterprise',
      icon: Building2,
      variant: 'default' as const,
    },
  };

  const tierConfig = config[subscriptionTier as keyof typeof config];
  if (!tierConfig) return null;

  const Icon = tierConfig.icon;

  return (
    <Badge variant={tierConfig.variant} className="gap-1.5">
      <Icon className="w-3 h-3" />
      {tierConfig.label}
    </Badge>
  );
}
