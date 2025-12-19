import { useState, useEffect, useMemo, useRef } from 'react';
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
} from 'lucide-react';
import {
  PHONE_PROVIDERS,
  PhoneProviderConfig,
  PhoneProviderTier,
  ProviderStatus,
  getProvidersForTier,
  getDefaultProviders,
  calculateTotalCredits,
  loadPersistedProviders,
  persistProviders,
  mapSubscriptionToPhoneTier,
  groupProvidersByCategory,
  getCategoryLabel,
} from '@/lib/phone/providerConfig';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

interface PhoneProviderSelectorProps {
  selectedProviders: string[];
  onSelectionChange: (providers: string[]) => void;
  disabled?: boolean;
  /** Optional provider results to show status after scan */
  providerResults?: Record<string, { status: ProviderStatus; message?: string }>;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  carrier: <Phone className="w-4 h-4" />,
  messaging: <MessageCircle className="w-4 h-4" />,
  osint: <Search className="w-4 h-4" />,
  risk: <ShieldAlert className="w-4 h-4" />,
};

export function PhoneProviderSelector({
  selectedProviders,
  onSelectionChange,
  disabled = false,
  providerResults,
}: PhoneProviderSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { subscriptionTier } = useSubscription();
  const navigate = useNavigate();

  const userTier = useMemo(
    () => mapSubscriptionToPhoneTier(subscriptionTier),
    [subscriptionTier]
  );

  const availableProviders = useMemo(
    () => getProvidersForTier(userTier),
    [userTier]
  );

  const lockedProviders = useMemo(
    () => PHONE_PROVIDERS.filter((p) => !availableProviders.some((ap) => ap.id === p.id)),
    [availableProviders]
  );

  const groupedProviders = useMemo(
    () => groupProvidersByCategory(availableProviders),
    [availableProviders]
  );

  const groupedLockedProviders = useMemo(
    () => groupProvidersByCategory(lockedProviders),
    [lockedProviders]
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

    const persisted = loadPersistedProviders();
    if (persisted && persisted.length > 0) {
      // Filter to only include available providers
      const validSelection = persisted.filter((id) =>
        availableProviders.some((p) => p.id === id)
      );
      if (validSelection.length > 0) {
        onSelectionChange(validSelection);
        return;
      }
    }
    // Fall back to defaults
    onSelectionChange(getDefaultProviders(userTier));
  }, [userTier, availableProviders, onSelectionChange]);

  const toggleProvider = (providerId: string) => {
    if (disabled) return;

    const newSelection = selectedProviders.includes(providerId)
      ? selectedProviders.filter((id) => id !== providerId)
      : [...selectedProviders, providerId];

    onSelectionChange(newSelection);
    persistProviders(newSelection);
  };

  const selectAll = () => {
    if (disabled) return;
    const allIds = availableProviders.map((p) => p.id);
    onSelectionChange(allIds);
    persistProviders(allIds);
  };

  const selectNone = () => {
    if (disabled) return;
    onSelectionChange([]);
    persistProviders([]);
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

  const renderProviderCard = (provider: PhoneProviderConfig, isLocked = false) => {
    const isSelected = selectedProviders.includes(provider.id);
    const statusBadge = getProviderStatusBadge(provider.id);

    return (
      <div
        key={provider.id}
        className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
          isLocked
            ? 'opacity-50 bg-muted/30 border-border cursor-not-allowed'
            : isSelected
            ? 'border-primary bg-primary/5 cursor-pointer'
            : 'border-border hover:border-muted-foreground/50 cursor-pointer'
        }`}
        onClick={() => !isLocked && toggleProvider(provider.id)}
      >
        {isLocked ? (
          <Lock className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
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
            {isLocked && (
              <Badge variant="secondary" className="text-xs">
                {provider.tier === 'medium' ? 'Pro+' : 'Business+'}
              </Badge>
            )}
            {statusBadge}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {provider.description}
          </p>
          {provider.requiresKey && (
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              Requires: {provider.requiresKey}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderCategory = (
    category: string,
    providers: PhoneProviderConfig[],
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

  return (
    <Card className="p-4 space-y-4">
      {/* Header with cost estimate */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          <Label className="text-base font-semibold">Phone Scan Providers</Label>
        </div>
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            Est. {totalCredits} credits
          </span>
        </div>
      </div>

      {/* Summary bar */}
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            {selectedProviders.length} of {availableProviders.length} providers
            selected
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
          {Object.entries(groupedProviders).map(([category, providers]) =>
            renderCategory(category, providers)
          )}

          {/* Locked providers (upgrade teaser) */}
          {Object.keys(groupedLockedProviders).length > 0 && (
            <div className="pt-4 border-t border-border space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>Upgrade to unlock more providers</span>
              </div>
              {Object.entries(groupedLockedProviders).map(([category, providers]) =>
                renderCategory(category, providers, true)
              )}
            </div>
          )}

          {/* Tier indicator */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your tier:</span>
              <Badge
                variant={
                  userTier === 'advanced'
                    ? 'default'
                    : userTier === 'medium'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {userTier.charAt(0).toUpperCase() + userTier.slice(1)}
              </Badge>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
