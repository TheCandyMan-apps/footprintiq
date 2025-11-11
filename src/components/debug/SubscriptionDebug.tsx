import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Coins, Shield, AlertCircle } from "lucide-react";

export function SubscriptionDebug() {
  const { subscriptionTier, isLoading: subLoading } = useSubscription();
  const { workspace } = useWorkspace();

  const { data: balance, isLoading: creditsLoading } = useQuery({
    queryKey: ['credits-debug', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return 0;
      const { data, error } = await supabase.rpc('get_credits_balance', {
        _workspace_id: workspace.id
      });
      if (error) throw error;
      return data || 0;
    },
    enabled: !!workspace?.id,
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'premium':
      case 'pro':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'analyst':
      case 'family':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Subscription Debug
        </CardTitle>
        <CardDescription className="text-xs">
          Current tier and credits (dev-only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Tier:</span>
          </div>
          {subLoading ? (
            <Badge variant="outline">Loading...</Badge>
          ) : (
            <Badge className={getTierColor(subscriptionTier)}>
              {subscriptionTier}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Credits:</span>
          </div>
          {creditsLoading ? (
            <Badge variant="outline">Loading...</Badge>
          ) : (
            <Badge variant="secondary">
              {balance?.toLocaleString() || 0}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
