import { Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PLAN_QUOTAS } from '@/lib/workspace/quotas';
import { TierBadge } from './FeatureGate';
import { Link } from 'react-router-dom';
import { useTierGating } from '@/hooks/useTierGating';

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
    { key: 'retentionDays', label: 'Data Retention', format: (v) => typeof v === 'number' ? `${v} days` : '' },
    { key: 'aiAnalystQueries', label: 'AI Queries/Month', format: (v) => typeof v === 'number' ? (v === -1 ? 'Unlimited' : v.toString()) : '' },
    { key: 'darkWebAccess', label: 'Dark Web Access', format: (v) => typeof v === 'boolean' ? v : false },
    { key: 'ssoEnabled', label: 'SSO', format: (v) => typeof v === 'boolean' ? v : false },
    { key: 'prioritySupport', label: 'Priority Support', format: (v) => typeof v === 'boolean' ? v : false },
  ];

  const tiers = ['free', 'pro', 'enterprise'] as const;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const quotas = PLAN_QUOTAS[tier];
          const isCurrentTier = subscriptionTier === tier;

          return (
            <Card key={tier} className={isCurrentTier ? 'border-2 border-primary' : ''}>
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
                  {tier === 'pro' && 'Advanced OSINT capabilities'}
                  {tier === 'enterprise' && 'Unlimited power'}
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

                {!isCurrentTier && (
                  <Link to="/settings/billing" className="block">
                    <Button className="w-full">
                      Upgrade to {tier.charAt(0).toUpperCase() + tier.slice(1)}
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
