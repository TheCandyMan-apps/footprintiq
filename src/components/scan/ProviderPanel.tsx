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
  Crown,
  Bug,
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import {
  type ScanType,
  type ProviderConfig,
  type ProviderCategory,
  type ProviderStatus,
  getProvidersForPlan,
  getProvidersForScanType,
  calculateTotalCredits,
  getDefaultProviders,
  loadPersistedProviders,
  persistProviders,
  groupProvidersByCategory,
  getCategoryLabel,
  getProviderTierLabel,
} from '@/lib/providers/registry';
import { normalizePlanTier, CAPABILITIES_BY_PLAN } from '@/lib/billing/planCapabilities';

// Known configured API keys based on actual Supabase secrets
// Update this list as keys are added to the system
const KNOWN_CONFIGURED_KEYS: string[] = [
  'ABSTRACTAPI_PHONE_VALIDATION_KEY',
  'IPQS_API_KEY',
  'NUMVERIFY_API_KEY',
  'HIBP_API_KEY',
  'FULLCONTACT_API_KEY',
  // Add more keys as they get configured
];

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

  const userPlan = normalizePlanTier(subscriptionTier);
  const { user } = useSubscription();

  // Get plan capabilities for provider limits
  const planCapabilities = CAPABILITIES_BY_PLAN[userPlan];
  const maxProviders = scanType === 'phone' 
    ? planCapabilities.phoneProvidersMax 
    : planCapabilities.usernameProvidersMax;

  const { available, locked } = useMemo(
    () => getProvidersForPlan(scanType, userPlan),
    [scanType, userPlan]
  );

  // All providers for this scan type (for debug panel)
  const allProvidersForType = useMemo(
    () => getProvidersForScanType(scanType),
    [scanType]
  );

  // Debug logging in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[PhoneProviders] tier:', userPlan, 'user:', user?.id);
      console.log('[PhoneProviders] available:', available.length, 'locked:', locked.length);
      console.log('[PhoneProviders] available providers:', available.map(p => p.id).join(', '));
      console.log('[PhoneProviders] configured keys:', KNOWN_CONFIGURED_KEYS);
    }
  }, [userPlan, user?.id, available, locked]);

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

  // Check if provider limit is reached (for free plan)
  const isLimitReached = maxProviders !== -1 && selectedProviders.length >= maxProviders;

  // Track if we've initialized
  const hasInitialized = useRef(false);

  // Load persisted selection on mount (only once)
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const persisted = loadPersistedProviders(scanType, userPlan);
    if (persisted && persisted.length > 0) {
      // Filter to only include available providers and respect limit
      let validSelection = persisted.filter((id) =>
        available.some((p) => p.id === id)
      );
      // Enforce max providers for free tier
      if (maxProviders !== -1 && validSelection.length > maxProviders) {
        validSelection = validSelection.slice(0, maxProviders);
      }
      if (validSelection.length > 0) {
        onSelectionChange(validSelection);
        return;
      }
    }
    // Fall back to defaults (limited by plan)
    let defaults = getDefaultProviders(scanType, userPlan);
    if (maxProviders !== -1 && defaults.length > maxProviders) {
      defaults = defaults.slice(0, maxProviders);
    }
    onSelectionChange(defaults);
  }, [scanType, userPlan, available, onSelectionChange, maxProviders]);

  const toggleProvider = (providerId: string) => {
    if (disabled) return;

    const isCurrentlySelected = selectedProviders.includes(providerId);
    
    // If trying to add and limit reached, prevent it
    if (!isCurrentlySelected && isLimitReached) return;

    const newSelection = isCurrentlySelected
      ? selectedProviders.filter((id) => id !== providerId)
      : [...selectedProviders, providerId];

    onSelectionChange(newSelection);
    persistProviders(scanType, newSelection, userPlan);
  };

  const selectAll = () => {
    if (disabled) return;
    let allIds = available.map((p) => p.id);
    // Enforce limit for free tier
    if (maxProviders !== -1 && allIds.length > maxProviders) {
      allIds = allIds.slice(0, maxProviders);
    }
    onSelectionChange(allIds);
    persistProviders(scanType, allIds, userPlan);
  };

  const selectNone = () => {
    if (disabled) return;
    onSelectionChange([]);
    persistProviders(scanType, [], userPlan);
  };

  // Check if provider requires an API key that is not configured
  const isProviderConfigured = (provider: ProviderConfig): boolean => {
    if (!provider.requiresKey) return true;
    return KNOWN_CONFIGURED_KEYS.includes(provider.requiresKey);
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
    const isConfigured = isProviderConfigured(provider);
    
    // Check if this provider cannot be selected (limit reached and not already selected)
    const isDisabledByLimit = !isLocked && !isSelected && isLimitReached;

    return (
      <div
        key={provider.id}
        className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
          isLocked
            ? 'opacity-60 bg-muted/30 border-border cursor-not-allowed'
            : isDisabledByLimit
            ? 'opacity-50 border-border cursor-not-allowed'
            : isSelected
            ? 'border-primary bg-primary/5 cursor-pointer hover:bg-primary/10'
            : 'border-border hover:border-muted-foreground/50 cursor-pointer hover:bg-muted/30'
        }`}
        onClick={() => !isLocked && !isDisabledByLimit && toggleProvider(provider.id)}
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
            disabled={disabled || isDisabledByLimit}
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
            {/* Show not-configured badge before scan */}
            {!isLocked && !isConfigured && !statusBadge && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/50">
                      <Settings className="w-3 h-3 mr-1" />
                      Not configured
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Connect API key in Settings → Integrations</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {statusBadge}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
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

      {/* Unknown plan warning */}
      {subscriptionTier === null && (
        <Alert variant="default" className="border-amber-500/30 bg-amber-500/5">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-sm">
            Plan unknown — showing Free providers.{' '}
            <Button
              variant="link"
              className="h-auto p-0 text-sm text-primary"
              onClick={() => navigate('/pricing')}
            >
              View plans
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Free plan limit message */}
      {userPlan === 'free' && subscriptionTier !== null && (
        <Alert variant="default" className="border-amber-500/30 bg-amber-500/5">
          <Crown className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-sm">
            Free plan runs core checks only (max {maxProviders} providers).{' '}
            <Button
              variant="link"
              className="h-auto p-0 text-sm text-primary"
              onClick={() => navigate('/pricing')}
            >
              Upgrade for more
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary bar */}
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            {selectedProviders.length}
            {maxProviders !== -1 ? ` / ${maxProviders}` : ` of ${available.length}`} providers selected
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
              {maxProviders !== -1 ? `Select ${maxProviders}` : 'Select All'}
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

          {/* Debug Panel (dev/admin only) */}
          {process.env.NODE_ENV === 'development' && (
            <Collapsible className="pt-4 border-t border-border">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Bug className="w-3 h-3" />
                    Provider Inventory (Dev)
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 p-3 bg-muted/30 rounded-lg text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total {scanType} providers:</span>
                  <span className="font-mono">{allProvidersForType.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Eligible for {userPlan}:</span>
                  <span className="font-mono text-green-500">{available.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Locked (higher tier):</span>
                  <span className="font-mono text-amber-500">{locked.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Missing API keys:</span>
                  <span className="font-mono text-red-500">
                    {available.filter(p => p.requiresKey && !KNOWN_CONFIGURED_KEYS.includes(p.requiresKey)).length}
                  </span>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <span className="text-muted-foreground block mb-1">Configured keys:</span>
                  <code className="text-[10px] break-all">{KNOWN_CONFIGURED_KEYS.join(', ') || 'None'}</code>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <span className="text-muted-foreground block mb-1">Missing keys:</span>
                  <code className="text-[10px] break-all text-red-400">
                    {available
                      .filter(p => p.requiresKey && !KNOWN_CONFIGURED_KEYS.includes(p.requiresKey))
                      .map(p => p.requiresKey)
                      .join(', ') || 'None'}
                  </code>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
