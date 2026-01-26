import { AlertCircle, Settings, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProviderHealthFinding } from '@/lib/providerHealthUtils';

interface ProviderHealthPanelProps {
  findings: ProviderHealthFinding[];
  variant?: 'compact' | 'full';
}

const STATUS_CONFIG: Record<ProviderHealthFinding['status'], { label: string; color: string }> = {
  not_configured: { label: 'Not connected', color: 'text-amber-600 dark:text-amber-400' },
  tier_restricted: { label: 'Upgrade required', color: 'text-blue-600 dark:text-blue-400' },
  limit_exceeded: { label: 'Limit reached', color: 'text-orange-600 dark:text-orange-400' },
  error: { label: 'Error', color: 'text-destructive' },
  skipped: { label: 'Skipped', color: 'text-muted-foreground' },
};

export function ProviderHealthPanel({ findings, variant = 'compact' }: ProviderHealthPanelProps) {
  if (findings.length === 0) return null;

  const handleConnectClick = () => {
    // Navigate to settings or open provider settings modal
    window.location.href = '/settings/api-keys';
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 bg-amber-500/5 border border-amber-500/20 rounded text-[10px]">
        <Plug className="h-3 w-3 text-amber-500 shrink-0" />
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground">{findings.length}</span> source{findings.length !== 1 ? 's' : ''} not connected
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-2 text-[10px] ml-auto"
          onClick={handleConnectClick}
        >
          <Settings className="h-2.5 w-2.5 mr-1" />
          Connect
        </Button>
      </div>
    );
  }

  return (
    <div className="border border-amber-500/20 rounded bg-amber-500/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-amber-500/20 bg-amber-500/10">
        <div className="flex items-center gap-1.5">
          <AlertCircle className="h-3 w-3 text-amber-500" />
          <span className="text-[11px] font-medium">Source Health</span>
          <Badge variant="outline" className="h-4 px-1 text-[9px] border-amber-500/30 text-amber-600 dark:text-amber-400">
            {findings.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-2 text-[10px]"
          onClick={handleConnectClick}
        >
          <Settings className="h-2.5 w-2.5 mr-1" />
          Settings
        </Button>
      </div>

      {/* Provider list */}
      <div className="divide-y divide-amber-500/10">
        {findings.map((finding) => {
          const config = STATUS_CONFIG[finding.status];
          return (
            <div key={finding.id} className="flex items-center justify-between px-2.5 py-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <Plug className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-[11px] font-medium truncate">{finding.provider}</span>
              </div>
              <Badge variant="outline" className={`h-4 px-1.5 text-[9px] font-normal ${config.color}`}>
                {config.label}
              </Badge>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="px-2.5 py-2 bg-amber-500/5 border-t border-amber-500/20">
        <p className="text-[10px] text-muted-foreground mb-1.5">
          Connect additional sources to expand your scan coverage and get more results.
        </p>
        <Button
          size="sm"
          className="h-6 text-[10px] w-full"
          onClick={handleConnectClick}
        >
          <Plug className="h-3 w-3 mr-1.5" />
          Connect Sources
        </Button>
      </div>
    </div>
  );
}

export default ProviderHealthPanel;
