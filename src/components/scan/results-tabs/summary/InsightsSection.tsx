import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  AlertTriangle, CheckCircle, ChevronDown, ChevronRight,
  Eye, ExternalLink, FileWarning, Globe, Info, 
  Link2, RefreshCw, Shield, Users, type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Insight {
  id: string;
  icon: 'alert' | 'warning' | 'info' | 'success' | 'users' | 'globe' | 'link' | 'refresh' | 'shield' | 'eye';
  title: string;
  explanation: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  detailsUrl?: string;
  detailsAction?: () => void;
}

interface InsightsSectionProps {
  insights: Insight[];
  maxVisible?: number;
}

const iconMap: Record<Insight['icon'], LucideIcon> = {
  alert: AlertTriangle,
  warning: FileWarning,
  info: Info,
  success: CheckCircle,
  users: Users,
  globe: Globe,
  link: Link2,
  refresh: RefreshCw,
  shield: Shield,
  eye: Eye,
};

const severityConfig: Record<Insight['severity'], { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/20' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/20' },
  low: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
  info: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' },
};

function InsightRow({ insight }: { insight: Insight }) {
  const Icon = iconMap[insight.icon] || Info;
  const severity = severityConfig[insight.severity];

  return (
    <div 
      className={cn(
        'flex items-center gap-3 py-2.5 px-3 rounded-md border',
        'hover:bg-muted/50 transition-colors',
        severity.border,
        'max-h-[72px]'
      )}
    >
      {/* Icon */}
      <div className={cn('p-1.5 rounded shrink-0', severity.bg)}>
        <Icon className={cn('w-4 h-4', severity.text)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{insight.title}</p>
        <p className="text-xs text-muted-foreground truncate">{insight.explanation}</p>
      </div>

      {/* Severity Badge */}
      <Badge 
        variant="outline" 
        className={cn(
          'text-[10px] px-1.5 py-0 h-5 font-normal capitalize shrink-0',
          severity.bg, severity.text, severity.border
        )}
      >
        {insight.severity}
      </Badge>

      {/* Optional Details Link */}
      {(insight.detailsUrl || insight.detailsAction) && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
          onClick={insight.detailsAction}
          asChild={!!insight.detailsUrl}
        >
          {insight.detailsUrl ? (
            <a href={insight.detailsUrl}>
              <span className="hidden sm:inline mr-1">View</span>
              <ChevronRight className="w-3 h-3" />
            </a>
          ) : (
            <>
              <span className="hidden sm:inline mr-1">View</span>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export function InsightsSection({ insights, maxVisible = 5 }: InsightsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleInsights = insights.slice(0, maxVisible);
  const hiddenInsights = insights.slice(maxVisible);
  const hasMore = hiddenInsights.length > 0;

  if (insights.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        No significant insights detected
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
        Insights
      </h4>

      {/* Visible Insights */}
      <div className="space-y-1.5">
        {visibleInsights.map((insight) => (
          <InsightRow key={insight.id} insight={insight} />
        ))}
      </div>

      {/* Hidden Insights (Collapsible) */}
      {hasMore && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-1.5 pt-1.5">
            {hiddenInsights.map((insight) => (
              <InsightRow key={insight.id} insight={insight} />
            ))}
          </CollapsibleContent>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 mt-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className={cn(
                'w-3.5 h-3.5 mr-1.5 transition-transform',
                isExpanded && 'rotate-180'
              )} />
              {isExpanded ? 'Show less' : `Show ${hiddenInsights.length} more`}
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      )}
    </div>
  );
}

// Helper to generate insights from scan data
export function generateInsights(
  found: number,
  claimed: number,
  breachCount: number,
  platforms: number,
  reuseScore: number,
  overallScore: number
): Insight[] {
  const insights: Insight[] = [];

  // Critical/High severity insights first
  if (breachCount > 5) {
    insights.push({
      id: 'critical-breach',
      icon: 'alert',
      title: `${breachCount} data breaches detected`,
      explanation: 'Multiple data exposures found — immediate action recommended',
      severity: 'critical',
    });
  } else if (breachCount > 2) {
    insights.push({
      id: 'high-breach',
      icon: 'warning',
      title: `${breachCount} data breaches detected`,
      explanation: 'Your credentials may have been exposed in known breaches',
      severity: 'high',
    });
  } else if (breachCount > 0) {
    insights.push({
      id: 'breach',
      icon: 'warning',
      title: `${breachCount} breach${breachCount !== 1 ? 'es' : ''} detected`,
      explanation: 'Review affected accounts and update passwords',
      severity: 'medium',
    });
  }

  // Reuse patterns
  if (reuseScore > 80) {
    insights.push({
      id: 'reuse-critical',
      icon: 'refresh',
      title: 'Very high username reuse',
      explanation: 'Username appears on 80%+ of checked platforms — easy to track',
      severity: 'high',
    });
  } else if (reuseScore > 50) {
    insights.push({
      id: 'reuse-high',
      icon: 'refresh',
      title: 'High username reuse pattern',
      explanation: 'Username used consistently across many platforms',
      severity: 'medium',
    });
  } else if (reuseScore > 25) {
    insights.push({
      id: 'reuse-mod',
      icon: 'refresh',
      title: 'Moderate username reuse',
      explanation: 'Username appears on multiple platforms',
      severity: 'low',
    });
  }

  // Presence insights
  if (found > 20) {
    insights.push({
      id: 'wide-presence',
      icon: 'globe',
      title: `Extensive digital footprint`,
      explanation: `Active presence confirmed on ${found} platforms`,
      severity: 'info',
    });
  } else if (found > 10) {
    insights.push({
      id: 'presence-high',
      icon: 'globe',
      title: `Significant online presence`,
      explanation: `Active on ${found} platforms across the web`,
      severity: 'info',
    });
  } else if (found > 0) {
    insights.push({
      id: 'presence',
      icon: 'users',
      title: `${found} active profile${found !== 1 ? 's' : ''} found`,
      explanation: 'Confirmed active accounts on these platforms',
      severity: 'info',
    });
  }

  // Claimed usernames
  if (claimed > 10) {
    insights.push({
      id: 'claimed-high',
      icon: 'link',
      title: `${claimed} reserved usernames`,
      explanation: 'Many usernames claimed but appear inactive — possible squatting',
      severity: 'low',
    });
  } else if (claimed > 3) {
    insights.push({
      id: 'claimed',
      icon: 'link',
      title: `${claimed} inactive accounts`,
      explanation: 'Usernames reserved but not actively used',
      severity: 'info',
    });
  }

  // Confidence insights
  if (overallScore >= 90) {
    insights.push({
      id: 'confidence-high',
      icon: 'shield',
      title: 'High analysis confidence',
      explanation: 'Results verified with strong cross-validation',
      severity: 'info',
    });
  } else if (overallScore < 50) {
    insights.push({
      id: 'confidence-low',
      icon: 'eye',
      title: 'Lower analysis confidence',
      explanation: 'Some results may require manual verification',
      severity: 'low',
    });
  }

  // Platform coverage
  if (platforms > 50) {
    insights.push({
      id: 'coverage',
      icon: 'globe',
      title: `Scanned ${platforms} platforms`,
      explanation: 'Comprehensive coverage across major services',
      severity: 'info',
    });
  }

  // Positive insight if nothing concerning
  if (breachCount === 0 && found < 5 && reuseScore < 30) {
    insights.push({
      id: 'low-exposure',
      icon: 'success',
      title: 'Minimal digital footprint',
      explanation: 'Limited online presence with no detected breaches',
      severity: 'info',
    });
  }

  return insights;
}
