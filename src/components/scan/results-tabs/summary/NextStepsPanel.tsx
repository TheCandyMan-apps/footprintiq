import { 
  Crosshair, 
  Sparkles, 
  Network, 
  FileWarning,
  ChevronRight,
  Download,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NextStep {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  priority: 'primary' | 'secondary';
  action: () => void;
}

interface NextStepsPanelProps {
  accountsFound: number;
  breachCount: number;
  hasFocusedEntity: boolean;
  verifiedCount: number;
  onNavigateToAccounts: () => void;
  onNavigateToConnections: () => void;
  onNavigateToBreaches: () => void;
  onExport?: () => void;
}

export function NextStepsPanel({
  accountsFound,
  breachCount,
  hasFocusedEntity,
  verifiedCount,
  onNavigateToAccounts,
  onNavigateToConnections,
  onNavigateToBreaches,
  onExport,
}: NextStepsPanelProps) {
  // Generate contextual next steps
  const steps: NextStep[] = [];

  // High-priority: Breach review
  if (breachCount > 0) {
    steps.push({
      id: 'breaches',
      label: 'Investigate breach exposures',
      description: `${breachCount} compromised credential${breachCount === 1 ? '' : 's'} require${breachCount === 1 ? 's' : ''} immediate review`,
      icon: FileWarning,
      priority: 'primary',
      action: onNavigateToBreaches,
    });
  }

  // Verify accounts if few verified
  if (accountsFound > 0 && verifiedCount < Math.min(3, accountsFound)) {
    steps.push({
      id: 'verify',
      label: 'Confirm account ownership',
      description: 'Run LENS verification on priority accounts',
      icon: Sparkles,
      priority: breachCount > 0 ? 'secondary' : 'primary',
      action: onNavigateToAccounts,
    });
  }

  // Focus on account
  if (accountsFound > 0 && !hasFocusedEntity) {
    steps.push({
      id: 'focus',
      label: 'Select primary entity',
      description: 'Focus investigation on a specific account',
      icon: Crosshair,
      priority: 'secondary',
      action: onNavigateToAccounts,
    });
  }

  // Explore connections
  if (accountsFound > 2) {
    steps.push({
      id: 'connections',
      label: 'Analyse account relationships',
      description: 'Map connections between discovered profiles',
      icon: Network,
      priority: 'secondary',
      action: onNavigateToConnections,
    });
  }

  // Export if results exist
  if (accountsFound > 0 && onExport) {
    steps.push({
      id: 'export',
      label: 'Generate report',
      description: 'Export findings for documentation or review',
      icon: Download,
      priority: 'secondary',
      action: onExport,
    });
  }

  if (steps.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border/15 pt-2">
      <h3 className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1.5 flex items-center gap-1">
        <ArrowRight className="w-2.5 h-2.5" />
        Next Steps
      </h3>
      <div className="grid grid-cols-2 gap-1">
        {steps.slice(0, 4).map((step) => {
          const Icon = step.icon;
          const isPrimary = step.priority === 'primary';
          
          return (
            <button
              key={step.id}
              onClick={step.action}
              className={cn(
                "flex items-center gap-2 py-1.5 px-2 rounded text-left transition-colors group",
                isPrimary 
                  ? "bg-primary/4 hover:bg-primary/8 border border-primary/10" 
                  : "bg-muted/15 hover:bg-muted/30 border border-transparent"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded flex items-center justify-center shrink-0",
                isPrimary ? "bg-primary/8 text-primary" : "bg-muted/40 text-muted-foreground"
              )}>
                <Icon className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={cn(
                  "text-[10px] font-medium block leading-tight truncate",
                  isPrimary ? "text-primary" : "text-foreground"
                )}>
                  {step.label}
                </span>
                <span className="text-[9px] text-muted-foreground/70 leading-tight line-clamp-1">
                  {step.description}
                </span>
              </div>
              <ChevronRight className={cn(
                "w-2.5 h-2.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
                isPrimary ? "text-primary" : "text-muted-foreground"
              )} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
