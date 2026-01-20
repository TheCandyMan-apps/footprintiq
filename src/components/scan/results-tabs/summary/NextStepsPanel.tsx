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
    <section className="border-t border-border/20 pt-3">
      <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <ArrowRight className="w-3 h-3" />
        Recommended Next Steps
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {steps.slice(0, 4).map((step) => {
          const Icon = step.icon;
          const isPrimary = step.priority === 'primary';
          
          return (
            <button
              key={step.id}
              onClick={step.action}
              className={cn(
                "flex items-center gap-2.5 py-2 px-2.5 rounded-md text-left transition-colors group",
                isPrimary 
                  ? "bg-primary/5 hover:bg-primary/10 border border-primary/15" 
                  : "bg-muted/20 hover:bg-muted/40 border border-transparent"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                isPrimary ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
              )}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={cn(
                  "text-[11px] font-medium block leading-tight",
                  isPrimary ? "text-primary" : "text-foreground"
                )}>
                  {step.label}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight line-clamp-1">
                  {step.description}
                </span>
              </div>
              <ChevronRight className={cn(
                "w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
                isPrimary ? "text-primary" : "text-muted-foreground"
              )} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
