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
    <Card className="border-border/50">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">Key Findings</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 space-y-1">
        {findings.slice(0, 5).map((finding) => {
          const Icon = iconMap[finding.icon] || Eye;
          const styles = severityStyles[finding.severity];

          return (
            <div
              key={finding.id}
              className="group flex items-start gap-3 py-2.5 px-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              {/* Icon */}
              <div className={cn('mt-0.5 flex-shrink-0', styles.icon)}>
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {finding.title}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] px-1.5 py-0 h-4 capitalize', styles.badge)}
                  >
                    {finding.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{finding.explanation}</p>
              </div>

              {/* View action */}
              {finding.deepLink && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleViewClick(finding)}
                >
                  View
                  <ChevronRight className="h-3 w-3 ml-0.5" />
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
