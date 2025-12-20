import { Zap, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type ScanType, getProvidersForScanType, getProvidersForPlan } from '@/lib/providers/registry';
import type { PlanTier } from '@/lib/billing/planCapabilities';

interface ProviderPreviewStripProps {
  scanType: ScanType;
  selectedProviders: string[];
  userPlan: PlanTier;
}

export function ProviderPreviewStrip({
  scanType,
  selectedProviders,
  userPlan,
}: ProviderPreviewStripProps) {
  const allProviders = getProvidersForScanType(scanType);
  const { locked } = getProvidersForPlan(scanType, userPlan);

  // Get names of selected providers (max 3 shown)
  const selectedNames = selectedProviders
    .map((id) => allProviders.find((p) => p.id === id)?.name)
    .filter(Boolean)
    .slice(0, 3);

  const remaining = selectedProviders.length - 3;

  if (selectedProviders.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Zap className="w-4 h-4" />
        <span>No providers selected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
      <Zap className="w-4 h-4 text-primary shrink-0" />
      <span>
        <span className="text-foreground font-medium">Providers:</span>{' '}
        {selectedNames.join(', ')}
        {remaining > 0 && (
          <span className="text-muted-foreground"> +{remaining} more</span>
        )}
      </span>
      {locked.length > 0 && (
        <Badge variant="outline" className="text-xs gap-1">
          <Crown className="w-3 h-3" />
          +{locked.length} with upgrade
        </Badge>
      )}
    </div>
  );
}
