import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, Circle, ExternalLink, Lock, 
  Search, Shield, Trash2, UserX 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Action {
  id: string;
  label: string;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
}

interface RecommendedActionsCardProps {
  breachCount: number;
  foundCount: number;
  claimedCount: number;
}

const priorityConfig = {
  high: 'text-destructive',
  medium: 'text-orange-600',
  low: 'text-muted-foreground',
};

export function RecommendedActionsCard({ 
  breachCount, 
  foundCount, 
  claimedCount 
}: RecommendedActionsCardProps) {
  // Generate contextual actions based on scan results
  const actions: Action[] = [];

  if (breachCount > 0) {
    actions.push({
      id: 'review-breaches',
      label: 'Review data breach exposures and change affected passwords',
      priority: 'high',
    });
  }

  if (foundCount > 5) {
    actions.push({
      id: 'audit-accounts',
      label: 'Audit active accounts and remove unused ones',
      priority: 'medium',
    });
  }

  if (claimedCount > 0) {
    actions.push({
      id: 'claim-review',
      label: 'Review reserved usernames for potential impersonation risk',
      priority: 'low',
    });
  }

  actions.push({
    id: 'enable-2fa',
    label: 'Enable two-factor authentication on critical accounts',
    priority: breachCount > 0 ? 'high' : 'medium',
  });

  if (foundCount > 0) {
    actions.push({
      id: 'privacy-settings',
      label: 'Review privacy settings on discovered profiles',
      priority: 'low',
    });
  }

  // Ensure we have at least 3 actions, max 5
  const displayActions = actions.slice(0, 5);
  if (displayActions.length < 3) {
    displayActions.push({
      id: 'schedule-rescan',
      label: 'Schedule periodic re-scans to monitor changes',
      priority: 'low',
    });
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Recommended Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-0">
        <ul className="space-y-1.5">
          {displayActions.map((action) => (
            <li 
              key={action.id}
              className="flex items-start gap-2 text-sm py-1.5 px-2 rounded-md bg-muted/30"
            >
              <Circle className={cn(
                'w-3 h-3 mt-0.5 shrink-0',
                priorityConfig[action.priority]
              )} />
              <span className="flex-1 text-foreground/90 leading-tight">
                {action.label}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
