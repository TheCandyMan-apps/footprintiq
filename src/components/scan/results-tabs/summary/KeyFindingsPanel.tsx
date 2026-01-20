import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Globe,
  RefreshCw,
  Users,
  Shield,
  Eye,
  Database,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

export interface KeyFinding {
  id: string;
  icon: 'breach' | 'platforms' | 'reuse' | 'aliases' | 'verified' | 'database' | 'locked';
  title: string;
  explanation: string;
  severity: 'high' | 'medium' | 'low' | 'info';
  deepLink?: {
    tab: string;
    filter?: string;
  };
}

interface KeyFindingsPanelProps {
  findings: KeyFinding[];
  scanId: string;
}

const iconMap = {
  breach: AlertTriangle,
  platforms: Globe,
  reuse: RefreshCw,
  aliases: Users,
  verified: Shield,
  database: Database,
  locked: Lock,
};

const severityStyles: Record<string, { badge: string; icon: string }> = {
  high: {
    badge: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: 'text-destructive',
  },
  medium: {
    badge: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    icon: 'text-orange-500',
  },
  low: {
    badge: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    icon: 'text-yellow-500',
  },
  info: {
    badge: 'bg-primary/10 text-primary border-primary/20',
    icon: 'text-primary',
  },
};

export function KeyFindingsPanel({ findings, scanId }: KeyFindingsPanelProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleViewClick = (finding: KeyFinding) => {
    if (finding.deepLink) {
      const params = new URLSearchParams(location.search);
      params.set('tab', finding.deepLink.tab);
      if (finding.deepLink.filter) {
        params.set('filter', finding.deepLink.filter);
      }
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  };

  if (findings.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-1.5 pt-2.5 px-3">
        <CardTitle className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <Eye className="w-3 h-3" />
          Key Findings
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-2.5 space-y-0.5">
        {findings.slice(0, 5).map((finding) => {
          const Icon = iconMap[finding.icon] || Eye;
          const styles = severityStyles[finding.severity];

          return (
            <div
              key={finding.id}
              className="group flex items-center gap-2.5 py-1.5 px-2 -mx-2 rounded hover:bg-muted/40 transition-colors"
            >
              {/* Icon */}
              <div className={cn('shrink-0', styles.icon)}>
                <Icon className="h-3.5 w-3.5" />
              </div>

              {/* Content - single line */}
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span className="text-xs font-medium text-foreground truncate">
                  {finding.title}
                </span>
                <Badge
                  variant="outline"
                  className={cn('text-[9px] px-1 py-0 h-3.5 capitalize shrink-0', styles.badge)}
                >
                  {finding.severity}
                </Badge>
              </div>

              {/* Explanation on hover */}
              <span className="hidden sm:block text-[10px] text-muted-foreground truncate max-w-[120px] opacity-0 group-hover:opacity-100 transition-opacity">
                {finding.explanation}
              </span>

              {/* View action */}
              {finding.deepLink && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={() => handleViewClick(finding)}
                >
                  View
                  <ChevronRight className="h-2.5 w-2.5 ml-0.5" />
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// Helper to generate key findings from scan results
export function generateKeyFindings(
  accountsFound: number,
  platformsChecked: number,
  breachCount: number,
  reuseScore: number,
  aliases: string[]
): KeyFinding[] {
  const findings: KeyFinding[] = [];

  // Breach exposure (highest priority if present)
  if (breachCount > 0) {
    findings.push({
      id: 'breach-exposure',
      icon: 'breach',
      title: `${breachCount} breach ${breachCount === 1 ? 'exposure' : 'exposures'} detected`,
      explanation: 'Personal data may have been compromised in known data breaches',
      severity: 'high',
      deepLink: { tab: 'breaches' },
    });
  }

  // Platform presence
  if (accountsFound > 0) {
    const presenceLevel = accountsFound > 20 ? 'high' : accountsFound > 10 ? 'medium' : 'low';
    findings.push({
      id: 'platform-presence',
      icon: 'platforms',
      title: `Active on ${accountsFound} platforms`,
      explanation: `Found across social, professional, and content platforms`,
      severity: presenceLevel === 'high' ? 'medium' : 'info',
      deepLink: { tab: 'accounts' },
    });
  }

  // Username reuse
  if (reuseScore >= 70) {
    findings.push({
      id: 'username-reuse',
      icon: 'reuse',
      title: `High username reuse (${reuseScore}%)`,
      explanation: 'Same identifier used across most discovered platforms',
      severity: 'medium',
      deepLink: { tab: 'accounts' },
    });
  } else if (reuseScore >= 40) {
    findings.push({
      id: 'username-reuse',
      icon: 'reuse',
      title: `Moderate username reuse (${reuseScore}%)`,
      explanation: 'Identifier reused on some platforms',
      severity: 'low',
      deepLink: { tab: 'accounts' },
    });
  }

  // Aliases detected
  if (aliases.length > 0) {
    findings.push({
      id: 'aliases-detected',
      icon: 'aliases',
      title: `${aliases.length} ${aliases.length === 1 ? 'alias' : 'aliases'} detected`,
      explanation: aliases.slice(0, 3).join(', ') + (aliases.length > 3 ? '...' : ''),
      severity: 'info',
      deepLink: { tab: 'accounts' },
    });
  }

  // No findings fallback
  if (findings.length === 0 && accountsFound === 0) {
    findings.push({
      id: 'no-results',
      icon: 'verified',
      title: 'Limited online presence',
      explanation: 'No accounts found matching this identifier',
      severity: 'info',
    });
  }

  return findings.slice(0, 5);
}
