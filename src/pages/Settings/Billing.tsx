import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Users, Zap, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function BillingSettings() {
  const [loading, setLoading] = useState(false);

  const { data: workspace } = useQuery({
    queryKey: ['current-workspace'],
    queryFn: async (): Promise<any> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data } = await supabase
        .from('workspaces' as any)
        .select('id, name')
        .eq('owner_id', user.id)
        .single();

      return data;
    },
  });

  const { data: billing, refetch } = useQuery<any>({
    queryKey: ['billing', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return null;

      const { data } = await supabase
        .from('billing_customers' as any)
        .select('*')
        .eq('workspace_id', workspace.id)
        .single();

      return data;
    },
    enabled: !!workspace?.id,
  });

  const handleUpgrade = async (plan: string) => {
    if (!workspace?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('billing/checkout', {
        body: { workspace_id: workspace.id, plan, seats: 1 },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to start upgrade process');
    } finally {
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    if (!workspace?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('billing/create-portal', {
        body: { workspace_id: workspace.id },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  const planColors: Record<string, 'default' | 'secondary'> = {
    free: 'secondary',
    analyst: 'default',
    pro: 'default',
    enterprise: 'default',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing details
        </p>
      </div>

      {/* Current Plan */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Current Plan</h2>
            <Badge variant={planColors[billing?.plan || 'free']}>
              {billing?.plan?.toUpperCase() || 'FREE'}
            </Badge>
          </div>
          {billing?.stripe_subscription_id && (
            <Button onClick={handlePortal} disabled={loading}>
              Manage Subscription
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Seats</p>
              <p className="font-semibold">{billing?.seats || 1}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Metered Scans (Month)</p>
              <p className="font-semibold">{billing?.metered_scans_month || 0}</p>
            </div>
          </div>

          {billing?.current_period_end && (
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Next Billing</p>
                <p className="font-semibold">
                  {new Date(billing.current_period_end).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Upgrade Options */}
      {billing?.plan === 'free' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Upgrade Your Plan</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4 border-2">
              <h3 className="font-semibold mb-2">Analyst</h3>
              <p className="text-2xl font-bold mb-4">£29/mo</p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                <li>• 500 scans/month</li>
                <li>• 5 team members</li>
                <li>• API access</li>
              </ul>
              <Button
                className="w-full"
                onClick={() => handleUpgrade('analyst')}
                disabled={loading}
              >
                Upgrade
              </Button>
            </Card>

            <Card className="p-4 border-2 border-primary">
              <Badge className="mb-2">Popular</Badge>
              <h3 className="font-semibold mb-2">Pro</h3>
              <p className="text-2xl font-bold mb-4">£79/mo</p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                <li>• Unlimited scans</li>
                <li>• 20 team members</li>
                <li>• White-label reports</li>
              </ul>
              <Button
                className="w-full"
                onClick={() => handleUpgrade('pro')}
                disabled={loading}
              >
                Upgrade
              </Button>
            </Card>

            <Card className="p-4 border-2">
              <h3 className="font-semibold mb-2">Enterprise</h3>
              <p className="text-2xl font-bold mb-4">Custom</p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                <li>• Everything in Pro</li>
                <li>• Unlimited members</li>
                <li>• SSO & SIEM</li>
              </ul>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => window.location.href = '/support'}
              >
                Contact Sales
              </Button>
            </Card>
          </div>
        </Card>
      )}

      {/* Payment Method */}
      {billing?.stripe_customer_id && (
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <div>
                <h2 className="text-lg font-semibold">Payment Method</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your payment details in the Stripe portal
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handlePortal} disabled={loading}>
              Update
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
