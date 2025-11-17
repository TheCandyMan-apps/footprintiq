import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, TrendingUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { isProviderAllowed, getProviderUpgradeMessage } from '@/lib/billing/quotas';
import { getPlan } from '@/lib/billing/tiers';
import { useNavigate } from 'react-router-dom';

interface ProviderBadgeProps {
  provider: string;
  planId: string | null | undefined;
  showUpgrade?: boolean;
}

export function ProviderBadge({ provider, planId, showUpgrade = true }: ProviderBadgeProps) {
  const navigate = useNavigate();
  const allowed = isProviderAllowed(planId, provider);
  const plan = getPlan(planId);

  if (allowed) {
    return (
      <Badge variant="secondary" className="gap-1">
        {provider}
      </Badge>
    );
  }

  const requiredPlan = provider === 'gosearch' ? 'Business' : 'Pro';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="gap-1 opacity-60 cursor-not-allowed">
            <Lock className="h-3 w-3" />
            {provider}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">Requires {requiredPlan} plan</p>
          {showUpgrade && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/settings/billing');
              }}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Upgrade to {requiredPlan}
            </Button>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ProviderListProps {
  providers: string[];
  planId: string | null | undefined;
  onProviderClick?: (provider: string) => void;
}

export function ProviderList({ providers, planId, onProviderClick }: ProviderListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {providers.map((provider) => (
        <div
          key={provider}
          onClick={() => {
            if (isProviderAllowed(planId, provider) && onProviderClick) {
              onProviderClick(provider);
            }
          }}
          className={isProviderAllowed(planId, provider) ? 'cursor-pointer' : ''}
        >
          <ProviderBadge provider={provider} planId={planId} />
        </div>
      ))}
    </div>
  );
}
