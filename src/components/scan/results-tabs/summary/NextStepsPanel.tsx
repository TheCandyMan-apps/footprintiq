import { Button } from '@/components/ui/button';
import { 
  Crosshair, 
  Sparkles, 
  Network, 
  Shield, 
  FileWarning,
  ChevronRight,
  Download
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
      label: 'Review breach exposures',
      description: `${breachCount} credential ${breachCount === 1 ? 'leak' : 'leaks'} need attention`,
      icon: FileWarning,
      priority: 'primary',
      action: onNavigateToBreaches,
    });
  }

  // Verify accounts if few verified
  if (accountsFound > 0 && verifiedCount < Math.min(3, accountsFound)) {
    steps.push({
      id: 'verify',
      label: 'Verify key accounts',
      description: 'Use LENS to confirm account ownership',
      icon: Sparkles,
      priority: breachCount > 0 ? 'secondary' : 'primary',
      action: onNavigateToAccounts,
    });
  }

  // Focus on account
  if (accountsFound > 0 && !hasFocusedEntity) {
    steps.push({
      id: 'focus',
      label: 'Focus on an entity',
      description: 'Select a primary account to investigate',
      icon: Crosshair,
      priority: 'secondary',
      action: onNavigateToAccounts,
    });
  }

  // Explore connections
  if (accountsFound > 2) {
    steps.push({
      id: 'connections',
      label: 'Explore connections',
      description: 'Map relationships between accounts',
      icon: Network,
      priority: 'secondary',
      action: onNavigateToConnections,
    });
  }

  // Export if results exist
  if (accountsFound > 0 && onExport) {
    steps.push({
      id: 'export',
      label: 'Export findings',
      description: 'Download report for documentation',
      icon: Download,
      priority: 'secondary',
      action: onExport,
    });
  }

  if (steps.length === 0) {
    return null;
  }

  return (
    <section>
      <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <Shield className="w-3 h-3" />
        Recommended Next Steps
      </h3>
      <div className="space-y-1">
        {steps.slice(0, 4).map((step) => {
          const Icon = step.icon;
          const isPrimary = step.priority === 'primary';
          
          return (
            <button
              key={step.id}
              onClick={step.action}
              className={cn(
                "w-full flex items-center gap-2.5 py-1.5 px-2 -mx-2 rounded text-left transition-colors group",
                isPrimary 
                  ? "bg-primary/5 hover:bg-primary/10" 
                  : "hover:bg-muted/40"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded flex items-center justify-center shrink-0",
                isPrimary ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={cn(
                  "text-[12px] font-medium block leading-tight",
                  isPrimary ? "text-primary" : "text-foreground"
                )}>
                  {step.label}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
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
