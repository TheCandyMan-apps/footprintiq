import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { PLANS, PlanId } from '@/lib/billing/tiers';
import { useWorkspace } from '@/hooks/useWorkspace';
import { startCheckout } from '@/lib/billing/checkout';
import { useNavigate } from 'react-router-dom';
import { getPlan } from '@/lib/billing/tiers';

export function PricingCards() {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const currentPlan = getPlan((workspace as any)?.plan);

  const handleSelectPlan = async (planId: PlanId) => {
    if (!workspace?.id) {
      navigate('/auth');
      return;
    }

    if (planId === 'free') {
      navigate('/settings/billing');
      return;
    }

    await startCheckout({ planId, workspaceId: workspace.id });
  };

  const plansArray = Object.values(PLANS);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {plansArray.map((plan) => {
        const isCurrentPlan = currentPlan.id === plan.id;
        const isBestValue = plan.id === 'pro';

        return (
          <Card 
            key={plan.id} 
            className={`relative ${isBestValue ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
          >
            {isBestValue && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Best Value
              </Badge>
            )}
            {isCurrentPlan && (
              <Badge variant="secondary" className="absolute -top-3 right-4">
                Current Plan
              </Badge>
            )}
            
            <CardHeader>
              <CardTitle className="text-2xl">{plan.label}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {plan.priceMonthly === 0 ? 'Free' : `£${plan.priceMonthly}`}
                </span>
                {plan.priceMonthly > 0 && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => {
                  const isLensFeature = feature.includes('LENS');
                  return (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isLensFeature ? 'text-primary' : 'text-primary'}`} />
                      <span className={`text-sm group relative ${isLensFeature ? 'font-semibold text-foreground' : ''}`}>
                        {isLensFeature ? feature.replace('✦ ', '') : feature}
                        {isLensFeature && (
                          <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">NEW</span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 pt-6 border-t">
                <div className="text-sm text-muted-foreground">
                  <div className="font-medium mb-2">Intelligence Sources:</div>
                  <div className="flex flex-wrap gap-1">
                    {plan.allowedProviders.map((source) => (
                      <Badge key={source} variant="outline" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {plan.id === 'pro' && (
                <div className="mt-4 pt-4 border-t border-dashed border-border/50">
                  <div className="text-[11px] text-muted-foreground/70 uppercase tracking-wider font-semibold mb-1.5">
                    Enterprise Features
                    <Badge variant="outline" className="ml-1.5 text-[9px] px-1 py-0 leading-tight align-middle border-muted-foreground/30">
                      Coming Soon
                    </Badge>
                  </div>
                  <ul className="space-y-0.5 text-[11px] text-muted-foreground/60">
                    <li>• Team dashboards</li>
                    <li>• Multi-user access</li>
                    <li>• API integration</li>
                    <li>• Threat intel enrichment</li>
                    <li>• SIEM export</li>
                  </ul>
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={isCurrentPlan ? 'outline' : isBestValue ? 'default' : 'secondary'}
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isCurrentPlan}
              >
                {isCurrentPlan ? 'Current Plan' : plan.id === 'free' ? 'Get Started' : 'Upgrade Now'}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
