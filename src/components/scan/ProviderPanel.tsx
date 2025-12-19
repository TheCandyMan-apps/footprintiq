import { useState, useMemo, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Phone,
  MessageCircle,
  Search,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Coins,
  Lock,
  Info,
  Settings,
  Users,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import {
  type ScanType,
  type ProviderConfig,
  type ProviderCategory,
  type ProviderStatus,
  getProvidersForPlan,
  calculateTotalCredits,
  getDefaultProviders,
  loadPersistedProviders,
  persistProviders,
  groupProvidersByCategory,
  getCategoryLabel,
  getProviderTierLabel,
} from '@/lib/providers/registry';
import type { PlanTier } from '@/lib/billing/planCapabilities';
import { enforceProviderAccess } from '@/lib/billing/planCapabilities';

interface ProviderPanelProps {
  scanType: ScanType;
  selectedProviders: string[];
  onSelectionChange: (providers: string[]) => void;
  disabled?: boolean;
  /** Optional provider results to show status after scan */
  providerResults?: Record<string, { status: ProviderStatus; message?: string }>;
}

const CATEGORY_ICONS: Record<ProviderCategory, React.ReactNode> = {
  carrier: <Phone className="w-4 h-4" />,
  messaging: <MessageCircle className="w-4 h-4" />,
  osint: <Search className="w-4 h-4" />,
  risk: <ShieldAlert className="w-4 h-4" />,
  broker: <AlertTriangle className="w-4 h-4" />,
  breach: <Zap className="w-4 h-4" />,
  social: <Users className="w-4 h-4" />,
};

export function ProviderPanel({
  scanType,
  selectedProviders,
  onSelectionChange,
  disabled = false,
  providerResults,
}: ProviderPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { subscriptionTier } = useSubscription();
  const navigate = useNavigate();

  const userPlan = (subscriptionTier || 'free') as PlanTier;

  const { available, locked } = useMemo(
    () => getProvidersForPlan(scanType, userPlan),
    [scanType, userPlan]
  );

  const groupedAvailable = useMemo(
    () => groupProvidersByCategory(available),
    [available]
  );

  const groupedLocked = useMemo(
    () => groupProvidersByCategory(locked),
    [locked]
  );

  const totalCredits = useMemo(
    () => calculateTotalCredits(selectedProviders),
    [selectedProviders]
  );

  // Track if we've initialized
  const hasInitialized = useRef(false);

  // Load persisted selection on mount (only once)
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const persisted = loadPersistedProviders(scanType);
    if (persisted && persisted.length > 0) {
      // Filter to only include available providers
      const validSelection = persisted.filter((id) =>
        available.some((p) => p.id === id)
      );
      if (validSelection.length > 0) {
        onSelectionChange(validSelection);
        return;
      }
    }
    // Fall back to defaults
    onSelectionChange(getDefaultProviders(scanType, userPlan));
  }, [scanType, userPlan, available, onSelectionChange]);

  const toggleProvider = (providerId: string) => {
    if (disabled) return;

    const newSelection = selectedProviders.includes(providerId)
      ? selectedProviders.filter((id) => id !== providerId)
      : [...selectedProviders, providerId];

    onSelectionChange(newSelection);
    persistProviders(scanType, newSelection);
  };

  const selectAll = () => {
    if (disabled) return;
    const allIds = available.map((p) => p.id);
    onSelectionChange(allIds);
    persistProviders(scanType, allIds);
  };

  const selectNone = () => {
    if (disabled) return;
    onSelectionChange([]);
    persistProviders(scanType, []);
  };

  const getProviderStatusBadge = (providerId: string) => {
    if (!providerResults) return null;
    const result = providerResults[providerId];
    if (!result) return null;

    switch (result.status) {
      case 'not_configured':
        return (
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/50">
              Not configured
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-1 text-xs text-amber-500 hover:text-amber-600"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/settings/integrations');
              }}
            >
              <Settings className="w-3 h-3 mr-1" />
              Connect
            </Button>
          </div>
        );
      case 'tier_restricted':
        return (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Upgrade required
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="text-xs">
            Failed
          </Badge>
        );
      case 'success':
        return (
          <Badge variant="outline" className="text-xs text-green-500 border-green-500/50">
            ✓
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderProviderCard = (provider: ProviderConfig, isLocked = false) => {
    const isSelected = selectedProviders.includes(provider.id);
    const statusBadge = getProviderStatusBadge(provider.id);
    const tierLabel = getProviderTierLabel(provider.minTier);

    return (
      <div
        key={provider.id}
        className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
          isLocked
            ? 'opacity-60 bg-muted/30 border-border cursor-not-allowed'
            : isSelected
            ? 'border-primary bg-primary/5 cursor-pointer'
            : 'border-border hover:border-muted-foreground/50 cursor-pointer'
        }`}
        onClick={() => !isLocked && toggleProvider(provider.id)}
      >
        {isLocked ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Lock className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Available on {tierLabel} plan and above</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Checkbox
            checked={isSelected}
            disabled={disabled}
            className="mt-0.5"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{provider.name}</span>
            <Badge variant="outline" className="text-xs">
              {provider.creditCost} cr
            </Badge>
            {isLocked && tierLabel && (
              <Badge variant="secondary" className="text-xs">
                {tierLabel}+
              </Badge>
            )}
            {statusBadge}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {provider.description}
          </p>
        </div>
      </div>
    );
  };

  const renderCategory = (
    category: ProviderCategory,
    providers: ProviderConfig[],
    isLocked = false
  ) => (
    <div key={category} className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {CATEGORY_ICONS[category]}
        <span>{getCategoryLabel(category)}</span>
        {isLocked && <Lock className="w-3 h-3" />}
      </div>
      <div className="space-y-1">
        {providers.map((p) => renderProviderCard(p, isLocked))}
      </div>
    </div>
  );

  const scanTypeLabels: Record<ScanType, string> = {
    phone: 'Phone Scan',
    username: 'Username Scan',
    email: 'Email Scan',
    domain: 'Domain Scan',
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Header with cost estimate */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">{scanTypeLabels[scanType]} Providers</Label>
        </div>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-sm">
                  <Coins className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">
                    Est. {totalCredits} credits
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Estimated credit cost for selected providers</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Actual cost may vary based on results
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Summary bar */}
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            {selectedProviders.length} of {available.length} providers selected
            {locked.length > 0 && (
              <span className="text-muted-foreground ml-1">
                ({locked.length} locked)
              </span>
            )}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={selectAll}
              disabled={disabled}
              className="text-xs h-7"
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={selectNone}
              disabled={disabled}
              className="text-xs h-7"
            >
              Clear
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {/* Collapsible provider list */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            disabled={disabled}
          >
            <span>Configure Providers</span>
            {isOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4 space-y-6">
          {/* Available providers by category */}
          {Object.entries(groupedAvailable).map(([category, providers]) =>
            renderCategory(category as ProviderCategory, providers)
          )}

          {/* Locked providers (upgrade teaser) */}
          {Object.keys(groupedLocked).length > 0 && (
            <div className="pt-4 border-t border-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  <span>Upgrade to unlock more providers</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/pricing')}
                  className="text-xs"
                >
                  View Plans
                </Button>
              </div>
              {Object.entries(groupedLocked).map(([category, providers]) =>
                renderCategory(category as ProviderCategory, providers, true)
              )}
            </div>
          )}

          {/* Tier indicator */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your plan:</span>
              <Badge
                variant={
                  userPlan === 'business'
                    ? 'default'
                    : userPlan === 'pro'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}
              </Badge>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
