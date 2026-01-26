import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, Circle, ExternalLink, Lock, 
  Search, Shield, Trash2, UserX, Info 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { shouldRenderSection, canShowSeverity, type EvidencePayload } from '@/lib/evidenceGating';

interface Action {
  id: string;
  label: string;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
  evidenceCount?: number;
}

interface RecommendedActionsCardProps {
  breachCount: number;
  foundCount: number;
  claimedCount: number;
}

// Only show priority indicators if evidence supports it
const getPriorityConfig = (priority: 'high' | 'medium' | 'low', evidenceCount: number) => {
  const evidencePayload: EvidencePayload = { evidenceCount, confidence: evidenceCount > 0 ? 60 : 0 };
  
  // Map priority to severity
  const severityMap: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
    high: 'high',
    medium: 'medium', 
    low: 'low',
  };
  
  const canShow = canShowSeverity(severityMap[priority], evidencePayload);
  
  if (!canShow) {
    return 'text-muted-foreground'; // Neutral if can't show severity
  }
  
  switch (priority) {
    case 'high': return 'text-destructive';
    case 'medium': return 'text-orange-600';
    case 'low': return 'text-muted-foreground';
  }
};

export function RecommendedActionsCard({ 
  breachCount, 
  foundCount, 
  claimedCount 
}: RecommendedActionsCardProps) {
  // Evidence gating: Don't render if no data at all
  const totalEvidence = breachCount + foundCount + claimedCount;
  
  if (!shouldRenderSection({ evidenceCount: totalEvidence, confidence: totalEvidence > 0 ? 50 : 0 })) {
    return null; // Don't render if no evidence
  }

  // Generate contextual actions based on scan results - include evidence counts
  const actions: Action[] = [];

  if (breachCount > 0) {
    actions.push({
      id: 'review-breaches',
      label: 'Review data breach exposures and change affected passwords',
      priority: 'high',
      evidenceCount: breachCount,
    });
  }

  if (foundCount > 5) {
    actions.push({
      id: 'audit-accounts',
      label: 'Audit active accounts and remove unused ones',
      priority: 'medium',
      evidenceCount: foundCount,
    });
  }

  if (claimedCount > 0) {
    actions.push({
      id: 'claim-review',
      label: 'Review reserved usernames for potential impersonation risk',
      priority: 'low',
      evidenceCount: claimedCount,
    });
  }

  // Only show 2FA action with evidence-appropriate priority
  actions.push({
    id: 'enable-2fa',
    label: 'Enable two-factor authentication on critical accounts',
    priority: breachCount > 0 ? 'high' : 'medium',
    evidenceCount: breachCount > 0 ? breachCount : 1,
  });

  if (foundCount > 0) {
    actions.push({
      id: 'privacy-settings',
      label: 'Review privacy settings on discovered profiles',
      priority: 'low',
      evidenceCount: foundCount,
    });
  }

  // Ensure we have at least 3 actions, max 5
  const displayActions = actions.slice(0, 5);
  if (displayActions.length < 3) {
    displayActions.push({
      id: 'schedule-rescan',
      label: 'Schedule periodic re-scans to monitor changes',
      priority: 'low',
      evidenceCount: 1,
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
                getPriorityConfig(action.priority, action.evidenceCount || 1)
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
