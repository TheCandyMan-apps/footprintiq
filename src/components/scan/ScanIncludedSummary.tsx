import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  ChevronDown,
  ChevronUp,
  Check,
  Lock,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProviderInfo {
  id: string;
  name: string;
  status: 'enabled' | 'disabled' | 'locked' | 'not_configured';
  tier?: 'free' | 'pro' | 'business';
}

interface ScanIncludedSummaryProps {
  scanType: 'phone' | 'username' | 'email';
  currentTier: 'free' | 'pro' | 'business';
  enabledProviders: ProviderInfo[];
  lockedProviders: ProviderInfo[];
  className?: string;
}

export function ScanIncludedSummary({
  scanType,
  currentTier,
  enabledProviders,
  lockedProviders,
  className = '',
}: ScanIncludedSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeCount = enabledProviders.filter(p => p.status === 'enabled').length;
  const totalCount = enabledProviders.length + lockedProviders.length;

  const getStatusIcon = (status: ProviderInfo['status']) => {
    switch (status) {
      case 'enabled':
        return <Check className="w-3.5 h-3.5 text-green-500" />;
      case 'disabled':
        return <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />;
      case 'locked':
        return <Lock className="w-3.5 h-3.5 text-muted-foreground" />;
      case 'not_configured':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusTooltip = (status: ProviderInfo['status']) => {
    switch (status) {
      case 'enabled':
        return 'Ready to scan';
      case 'disabled':
        return 'Disabled - click to enable';
      case 'locked':
        return 'Upgrade to unlock';
      case 'not_configured':
        return 'Requires API key setup';
      default:
        return '';
    }
  };

  const getUpgradeFeatures = () => {
    if (currentTier === 'business') return [];
    
    const features = [];
    
    if (currentTier === 'free') {
      features.push(
        { tier: 'pro', text: 'AI-powered risk analysis' },
        { tier: 'pro', text: 'Additional carrier intel providers' },
        { tier: 'pro', text: 'PDF & CSV exports' },
      );
    }
    
    features.push(
      { tier: 'business', text: 'Identity graph visualization' },
      { tier: 'business', text: 'Evidence pack exports' },
      { tier: 'business', text: 'Advanced fraud detection APIs' },
    );
    
    return features;
  };

  const upgradeFeatures = getUpgradeFeatures();

  return (
    <Card className={`border-border/50 ${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-4 py-3 h-auto hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">What's included in this scan?</span>
              <Badge variant="secondary" className="text-xs">
                {activeCount}/{totalCount} providers
              </Badge>
            </div>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="px-4 pb-4 space-y-4">
          {/* Enabled Providers */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Active Providers
            </p>
            <div className="grid gap-1.5">
              <TooltipProvider delayDuration={200}>
                {enabledProviders.map((provider) => (
                  <Tooltip key={provider.id}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 text-sm py-1">
                        {getStatusIcon(provider.status)}
                        <span className={provider.status !== 'enabled' ? 'text-muted-foreground' : ''}>
                          {provider.name}
                        </span>
                        {provider.status === 'not_configured' && (
                          <Link 
                            to="/settings/integrations" 
                            className="text-xs text-primary hover:underline"
                          >
                            Connect
                          </Link>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs">
                      {getStatusTooltip(provider.status)}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>

          {/* Locked Providers */}
          {lockedProviders.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Upgrade to Unlock
              </p>
              <div className="grid gap-1.5">
                <TooltipProvider delayDuration={200}>
                  {lockedProviders.map((provider) => (
                    <Tooltip key={provider.id}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 text-sm py-1 text-muted-foreground">
                          <Lock className="w-3.5 h-3.5" />
                          <span>{provider.name}</span>
                          <Badge variant="outline" className="text-xs py-0">
                            {provider.tier === 'business' ? 'Business' : 'Pro'}
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        Requires {provider.tier === 'business' ? 'Business' : 'Pro'} plan
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          )}

          {/* Upgrade Teaser */}
          {upgradeFeatures.length > 0 && (
            <div className="pt-3 border-t border-border/50">
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Unlock with {currentTier === 'free' ? 'Pro' : 'Business'}</span>
                </div>
                <ul className="space-y-1">
                  {upgradeFeatures.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="w-3 h-3 text-primary" />
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs text-primary"
                  asChild
                >
                  <Link to="/pricing">View all features →</Link>
                </Button>
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
