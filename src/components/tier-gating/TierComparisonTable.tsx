import { Check, X, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TierBadge } from './FeatureGate';
import { Link } from 'react-router-dom';
import { useTierGating, type PlanTier } from '@/hooks/useTierGating';
import { CAPABILITIES_BY_PLAN } from '@/lib/billing/planCapabilities';
import { cn } from '@/lib/utils';

export function TierComparisonTable() {
  const { subscriptionTier } = useTierGating();

  type Feature = {
    key: string;
    label: string;
    format: (v: number | boolean) => string | boolean;
  };

  const features: Feature[] = [
    { key: 'scansPerMonth', label: 'Scans per Month', format: (v) => typeof v === 'number' ? (v === -1 ? 'Unlimited' : v.toString()) : '' },
    { key: 'monitorsPerWorkspace', label: 'Dark Web Monitors', format: (v) => typeof v === 'number' ? (v === -1 ? 'Unlimited' : v.toString()) : '' },
    { key: 'apiCallsPerHour', label: 'API Calls/Hour', format: (v) => typeof v === 'number' ? (v === -1 ? 'Unlimited' : v.toLocaleString()) : '' },
    { key: 'teamMembers', label: 'Team Members', format: (v) => typeof v === 'number' ? (v === -1 ? 'Unlimited' : v.toString()) : '' },
    { key: 'aiQueriesPerMonth', label: 'AI Queries/Month', format: (v) => typeof v === 'number' ? (v === -1 ? 'Unlimited' : v.toString()) : '' },
    { key: 'darkWebMonitoring', label: 'Dark Web Access', format: (v) => typeof v === 'boolean' ? v : false },
    { key: 'sharedWorkspaces', label: 'Shared Workspaces', format: (v) => typeof v === 'boolean' ? v : false },
    { key: 'priorityQueue', label: 'Priority Queue', format: (v) => typeof v === 'boolean' ? v : false },
  ];

  const tiers: PlanTier[] = ['free', 'pro', 'business'];

  const isPro = (tier: PlanTier) => tier === 'pro';

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const quotas = CAPABILITIES_BY_PLAN[tier];
          const isCurrentTier = subscriptionTier === tier;
          const isRecommended = isPro(tier);

          return (
            <Card 
              key={tier} 
              className={cn(
                'relative transition-all duration-200',
                isCurrentTier && 'border-2 border-primary',
                isRecommended && !isCurrentTier && 'border-primary/50 shadow-lg shadow-primary/10 scale-[1.02]'
              )}
            >
              {/* Pro recommended badge */}
              {isRecommended && !isCurrentTier && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  <Star className="w-3 h-3 mr-1" />
                  Recommended
                </Badge>
              )}

              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <TierBadge tier={tier} />
                  {isCurrentTier && (
                    <span className="text-xs text-primary font-medium">Current Plan</span>
                  )}
                </div>
                <CardTitle className="text-2xl capitalize">{tier}</CardTitle>
                <CardDescription>
                  {tier === 'free' && 'Perfect for getting started'}
                  {tier === 'pro' && 'Reduce false positives & unlock full insights'}
                  {tier === 'business' && 'Unlimited power for teams'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {features.map((feature) => {
                    type QuotaKey = keyof typeof quotas;
                    const value = quotas[feature.key as QuotaKey];
                    const formattedValue = feature.format(value as number | boolean);
                    const isBoolean = typeof formattedValue === 'boolean';

                    return (
                      <div key={feature.key} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{feature.label}</span>
                        {isBoolean ? (
                          formattedValue ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground" />
                          )
                        ) : (
                          <span className="font-medium">{formattedValue}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pro-specific CTA messaging */}
                {isRecommended && !isCurrentTier && (
                  <div className="text-xs text-muted-foreground bg-primary/5 rounded-md p-2 mt-2">
                    <p className="font-medium text-foreground mb-1">Pro includes:</p>
                    <ul className="space-y-0.5">
                      <li>• Full source URLs & evidence</li>
                      <li>• Context enrichment</li>
                      <li>• Correlation insights</li>
                    </ul>
                  </div>
                )}

                {!isCurrentTier && (
                  <Link to="/pricing" className="block mt-4">
                    <Button 
                      className={cn(
                        'w-full',
                        isRecommended && 'bg-primary hover:bg-primary/90'
                      )}
                      variant={isRecommended ? 'default' : 'secondary'}
                    >
                      {isRecommended ? 'Upgrade to Pro' : `Choose ${tier.charAt(0).toUpperCase() + tier.slice(1)}`}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
