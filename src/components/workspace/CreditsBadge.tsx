import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWorkspace } from "@/hooks/useWorkspace";

interface CreditsBadgeProps {
  workspaceId: string;
}

export function CreditsBadge({ workspaceId }: CreditsBadgeProps) {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();

  const { data: balance, isLoading } = useQuery({
    queryKey: ['credits-balance', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_credits_balance', {
        _workspace_id: workspaceId,
      });
      if (error) throw error;
      return data as number;
    },
  });

  // Use workspace from hook instead of direct query (avoids RLS 406 errors)
  const tier = workspace?.subscription_tier || 'free';
  const isPremium = ['pro', 'enterprise'].includes(tier.toLowerCase());

  if (isLoading) {
    return (
      <Badge variant="outline" className="gap-1">
        <Coins className="h-3 w-3" />
        <span>...</span>
      </Badge>
    );
  }

  if (isPremium) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="gap-1">
              <Coins className="h-3 w-3" />
              <span>Unlimited</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Premium features included in your plan</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={balance && balance > 0 ? "default" : "destructive"} 
        className="gap-1 cursor-pointer"
        onClick={() => navigate('/buy-credits')}
      >
        <Coins className="h-3 w-3" />
        <span>{balance ?? 0} credits</span>
      </Badge>
      {(!balance || balance < 5) && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate('/buy-credits')}
        >
          Buy Credits
        </Button>
      )}
    </div>
  );
}
