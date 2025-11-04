import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { PLAN_QUOTAS } from '@/lib/workspace/quotas';

export default function SubscriptionSettings() {
  const { subscriptionTier, subscriptionEnd, isLoading } = useSubscription();
  const { toast } = useToast();

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('billing/create-portal', {
        body: { workspace_id: 'default' } // TODO: Get actual workspace ID
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast({
        title: 'Error',
        description: 'Failed to open billing portal',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const quotas = PLAN_QUOTAS[subscriptionTier];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Subscription</h2>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold capitalize">{subscriptionTier} Plan</h3>
              {subscriptionEnd && (
                <p className="text-sm text-muted-foreground">
                  Renews on {format(new Date(subscriptionEnd), 'PPP')}
                </p>
              )}
            </div>
            <Badge variant={subscriptionTier !== 'free' ? 'default' : 'secondary'}>
              {subscriptionTier !== 'free' ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Free Tier
                </>
              )}
            </Badge>
          </div>

          {subscriptionTier !== 'free' && (
            <Button onClick={handleManageSubscription} variant="outline" className="gap-2">
              Manage Subscription
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Plan Quotas</h3>
        <div className="grid gap-4">
          <QuotaItem
            label="Scans per Month"
            value={quotas.scansPerMonth}
          />
          <QuotaItem
            label="Dark Web Monitors"
            value={quotas.monitorsPerWorkspace}
          />
          <QuotaItem
            label="API Calls per Hour"
            value={quotas.apiCallsPerHour}
          />
          <QuotaItem
            label="Team Members"
            value={quotas.teamMembers}
          />
          <QuotaItem
            label="AI Analyst Queries"
            value={quotas.aiAnalystQueries}
          />
          <QuotaItem
            label="Dark Web Access"
            value={quotas.darkWebAccess ? 'Enabled' : 'Disabled'}
          />
          <QuotaItem
            label="SSO"
            value={quotas.ssoEnabled ? 'Enabled' : 'Disabled'}
          />
          <QuotaItem
            label="Priority Support"
            value={quotas.prioritySupport ? 'Yes' : 'No'}
          />
        </div>
      </Card>
    </div>
  );
}

function QuotaItem({ label, value }: { label: string; value: number | string | boolean }) {
  const displayValue = typeof value === 'number' 
    ? value === -1 ? 'Unlimited' : value.toLocaleString()
    : String(value);

  return (
    <div className="flex justify-between items-center py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{displayValue}</span>
    </div>
  );
}
