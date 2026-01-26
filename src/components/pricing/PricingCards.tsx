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
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm group relative">
                      {feature}
                      {feature === 'Reputation & Abuse Intelligence' && (
                        <span className="ml-1 text-muted-foreground cursor-help" title="Signals are advisory and designed to reduce false positives. We don't expose raw intelligence feeds.">ⓘ</span>
                      )}
                    </span>
                  </li>
                ))}
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
