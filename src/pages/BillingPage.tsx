import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSubscription, usePlanConfig } from '@/hooks/useSubscription';
import { useWorkspace } from '@/hooks/useWorkspace';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function BillingPage() {
  const { data: subscription, isLoading } = useSubscription();
  const planConfig = usePlanConfig();
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const handleManageBilling = async () => {
    if (!workspace?.id) return;

    if (subscription?.plan === 'free' || !subscription?.isActive) {
      navigate('/pricing');
      return;
    }

    setIsLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-portal', {
        body: { workspaceId: workspace.id },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast({
        title: 'Error',
        description: 'Failed to open billing portal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const usagePercent = subscription ? (subscription.scansUsed / subscription.scanLimit) * 100 : 0;
  const isHighUsage = usagePercent >= 80;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Billing & Usage</h1>
            <p className="text-muted-foreground mt-2">
              Manage your subscription and monitor usage
            </p>
          </div>
          {subscription?.isActive && subscription.plan !== 'free' && (
            <Button onClick={handleManageBilling} disabled={isLoadingPortal}>
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Billing
            </Button>
          )}
        </div>

        {/* Current Plan Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Current Plan
                  <Badge variant={subscription?.isActive ? 'default' : 'secondary'}>
                    {planConfig.name}
                  </Badge>
                </CardTitle>
                <CardDescription>{planConfig.description}</CardDescription>
              </div>
              {subscription?.plan === 'free' && (
                <Button onClick={handleUpgrade}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription?.currentPeriodEnd && (
              <div className="text-sm text-muted-foreground">
                Current period ends: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </div>
            )}

            {subscription?.status === 'past_due' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your payment is past due. Please update your payment method to continue service.
                </AlertDescription>
              </Alert>
            )}

            {/* Features */}
            <div className="grid gap-2 pt-4">
              <h4 className="font-semibold text-sm">Plan Features</h4>
              <div className="grid gap-1">
                {planConfig.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Card */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Usage</CardTitle>
            <CardDescription>
              Track your scan usage for the current billing period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Scans Used</span>
                <span className="text-muted-foreground">
                  {subscription?.scansUsed || 0} / {subscription?.scanLimit || 5}
                </span>
              </div>
              <Progress value={usagePercent} className="h-2" />
            </div>

            {isHighUsage && subscription?.canScan && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You've used {Math.round(usagePercent)}% of your monthly scan limit.
                  {subscription.plan === 'free' && (
                    <Button
                      variant="link"
                      className="h-auto p-0 ml-1"
                      onClick={handleUpgrade}
                    >
                      Upgrade now
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {!subscription?.canScan && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You've reached your monthly scan limit.
                  {subscription.plan === 'free' ? (
                    <>
                      {' '}Upgrade to PRO for 100 scans per month.
                      <Button
                        variant="link"
                        className="h-auto p-0 ml-1 text-destructive-foreground underline"
                        onClick={handleUpgrade}
                      >
                        Upgrade now
                      </Button>
                    </>
                  ) : (
                    ' Your limit will reset at the start of your next billing period.'
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Allowed Providers */}
            <div className="pt-4 border-t">
              <h4 className="font-semibold text-sm mb-2">Available OSINT Providers</h4>
              <div className="flex flex-wrap gap-2">
                {planConfig.allowedProviders.map((provider) => (
                  <Badge key={provider} variant="outline">
                    {provider}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade CTA for Free Users */}
        {subscription?.plan === 'free' && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Unlock More Features</CardTitle>
              <CardDescription>
                Upgrade to PRO or Business for advanced OSINT capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleUpgrade} className="w-full" size="lg">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Pricing Plans
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
