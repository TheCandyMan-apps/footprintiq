/**
 * RemediationPlanTab Component
 * 
 * Displays finding-level remediation cards with severity, priority score,
 * action type, effort estimate, and remediation guidance.
 * 
 * Free users see 3 items fully visible, rest blurred.
 * Pro users see full roadmap with export capability.
 */

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Shield,
  Lock,
  ArrowRight,
  ExternalLink,
  Eye,
  Wrench,
  AlertTriangle,
  Clock,
  Target,
  FileDown,
  ChevronRight,
} from 'lucide-react';

export interface RemediationFinding {
  id: string;
  platform: string;
  url?: string;
  severity: 'low' | 'medium' | 'high';
  priorityScore: number;
  actionType: 'monitor' | 'manual_removal' | 'removal_service';
  effort: 'low' | 'medium' | 'high';
  guidance: {
    optOutLink?: string;
    steps: string[];
    timeline: string;
  };
}

interface RemediationPlanTabProps {
  results: any[];
  isLocked?: boolean;
  onUpgradeClick?: () => void;
  onExportPDF?: () => void;
}

const SEVERITY_CONFIG = {
  low: { label: 'Low', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  medium: { label: 'Medium', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  high: { label: 'High', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const EFFORT_CONFIG = {
  low: { label: 'Low effort', icon: '⚡' },
  medium: { label: 'Medium effort', icon: '🔧' },
  high: { label: 'High effort', icon: '🏗️' },
};

const ACTION_CONFIG = {
  monitor: { label: 'Monitor Only', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', icon: Eye },
  manual_removal: { label: 'Manual Removal Recommended', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: Wrench },
  removal_service: { label: 'Removal Service Recommended', className: 'bg-destructive/10 text-destructive', icon: AlertTriangle },
};

// Known opt-out links for common platforms
const OPT_OUT_LINKS: Record<string, string> = {
  spokeo: 'https://www.spokeo.com/optout',
  beenverified: 'https://www.beenverified.com/faq/opt-out/',
  whitepages: 'https://www.whitepages.com/suppression-requests',
  mylife: 'https://www.mylife.com/privacy-policy#opt-out',
  intelius: 'https://www.intelius.com/optout',
  peoplefinder: 'https://www.peoplefinder.com/optout.php',
  pipl: 'https://pipl.com/personal-information-removal-request',
  radaris: 'https://radaris.com/page/how-to-remove',
  instantcheckmate: 'https://www.instantcheckmate.com/opt-out/',
  truepeoplesearch: 'https://www.truepeoplesearch.com/removal',
  facebook: 'https://www.facebook.com/help/224562897555674',
  twitter: 'https://help.twitter.com/en/managing-your-account/how-to-deactivate-twitter-account',
  instagram: 'https://help.instagram.com/370452623149242',
  linkedin: 'https://www.linkedin.com/help/linkedin/answer/a1339367',
  reddit: 'https://support.reddithelp.com/hc/en-us/articles/16880053428372',
  tiktok: 'https://support.tiktok.com/en/account-and-privacy/deleting-an-account',
};

function deriveRemediationFindings(results: any[]): RemediationFinding[] {
  return results
    .filter(r => {
      const status = (r.status || '').toLowerCase();
      return status === 'found' || status === 'claimed';
    })
    .map((r, index) => {
      const platform = (r.site || r.platform || 'Unknown').toLowerCase();
      const kind = (r.kind || '').toLowerCase();
      const severity = (r.severity || 'info').toLowerCase();
      const confidence = typeof r.confidence === 'number' ? r.confidence : 0.5;

      // Determine exposure severity
      let exposureSeverity: 'low' | 'medium' | 'high' = 'low';
      if (severity === 'high' || severity === 'critical' || kind.includes('breach')) {
        exposureSeverity = 'high';
      } else if (severity === 'medium' || confidence > 0.7) {
        exposureSeverity = 'medium';
      }

      // Calculate priority score (1-100)
      let priorityScore = 30;
      if (kind.includes('breach') || kind.includes('leak')) priorityScore += 40;
      if (exposureSeverity === 'high') priorityScore += 25;
      else if (exposureSeverity === 'medium') priorityScore += 15;
      if (confidence > 0.8) priorityScore += 10;
      priorityScore = Math.min(100, Math.max(1, priorityScore));

      // Determine action type
      let actionType: 'monitor' | 'manual_removal' | 'removal_service' = 'monitor';
      const isDataBroker = ['spokeo', 'beenverified', 'whitepages', 'mylife', 'intelius', 'peoplefinder', 'pipl', 'radaris', 'instantcheckmate', 'truepeoplesearch'].some(b => platform.includes(b));
      if (isDataBroker) {
        actionType = 'removal_service';
      } else if (kind.includes('breach') || exposureSeverity === 'high') {
        actionType = 'manual_removal';
      }

      // Determine effort
      let effort: 'low' | 'medium' | 'high' = 'low';
      if (isDataBroker) effort = 'high';
      else if (actionType === 'manual_removal') effort = 'medium';

      // Build guidance
      const optOutLink = OPT_OUT_LINKS[platform] || undefined;
      const displayPlatform = (r.site || r.platform || 'Unknown');
      let steps: string[] = [];
      let timeline = '1–3 days';

      if (isDataBroker) {
        steps = [
          `Visit ${displayPlatform}'s opt-out page`,
          'Submit your removal request with required verification',
          'Follow up if not removed within 30 days',
        ];
        timeline = '7–45 days';
      } else if (kind.includes('breach')) {
        steps = [
          'Change your password immediately on this service',
          'Enable multi-factor authentication if available',
          'Check for credential reuse on other accounts',
        ];
        timeline = 'Immediate action recommended';
      } else if (actionType === 'manual_removal') {
        steps = [
          `Log into ${displayPlatform} and review privacy settings`,
          'Restrict profile visibility or delete the account',
          'Verify removal after 24–48 hours',
        ];
        timeline = '1–7 days';
      } else {
        steps = [
          `Review your ${displayPlatform} profile visibility`,
          'No immediate action required — monitor for changes',
        ];
        timeline = 'Ongoing monitoring';
      }

      return {
        id: r.id || `finding-${index}`,
        platform: displayPlatform,
        url: r.url || undefined,
        severity: exposureSeverity,
        priorityScore,
        actionType,
        effort,
        guidance: { optOutLink, steps, timeline },
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

function RemediationCard({ finding, isBlurred = false }: { finding: RemediationFinding; isBlurred?: boolean }) {
  const sevConfig = SEVERITY_CONFIG[finding.severity];
  const actionConfig = ACTION_CONFIG[finding.actionType];
  const effortConfig = EFFORT_CONFIG[finding.effort];
  const ActionIcon = actionConfig.icon;

  return (
    <Card className={`overflow-hidden border-border/50 transition-all ${isBlurred ? 'blur-[6px] pointer-events-none select-none' : ''}`}>
      <CardContent className="p-4 space-y-3">
        {/* Header: Platform + Severity + Priority */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">{finding.platform.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold capitalize">{finding.platform}</span>
                {finding.url && (
                  <a href={finding.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${sevConfig.className}`}>
              {sevConfig.label} Severity
            </Badge>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              <Target className="h-3 w-3" />
              <span className="text-xs font-bold">{finding.priorityScore}</span>
            </div>
          </div>
        </div>

        {/* Action Type + Effort */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${actionConfig.className}`}>
            <ActionIcon className="h-3.5 w-3.5" />
            {actionConfig.label}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{effortConfig.icon}</span>
            <span>{effortConfig.label}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{finding.guidance.timeline}</span>
          </div>
        </div>

        <Separator className="opacity-50" />

        {/* Remediation Guidance */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Wrench className="h-3 w-3 text-muted-foreground" />
            Remediation Steps
          </h4>
          <ol className="space-y-1.5 pl-4">
            {finding.guidance.steps.map((step, i) => (
              <li key={i} className="text-xs text-muted-foreground list-decimal">
                {step}
              </li>
            ))}
          </ol>
          {finding.guidance.optOutLink && (
            <a
              href={finding.guidance.optOutLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Official opt-out page
              <ChevronRight className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const FREE_VISIBLE_LIMIT = 3;

export default function RemediationPlanTab({ results, isLocked = false, onUpgradeClick, onExportPDF }: RemediationPlanTabProps) {
  const findings = useMemo(() => deriveRemediationFindings(results), [results]);
  const visibleFindings = isLocked ? findings.slice(0, FREE_VISIBLE_LIMIT) : findings;
  const lockedFindings = isLocked ? findings.slice(FREE_VISIBLE_LIMIT, FREE_VISIBLE_LIMIT + 3) : [];

  if (findings.length === 0) {
    return (
      <div className="py-12 text-center space-y-3">
        <Shield className="h-10 w-10 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground">No actionable findings to remediate.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-foreground">Your Strategic Remediation Plan</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          FootprintIQ maps and prioritises your exposure so you can reduce it efficiently. We do not directly remove data — we provide the intelligence to act with precision.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-destructive">{findings.filter(f => f.severity === 'high').length}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">High Severity</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{findings.filter(f => f.actionType === 'manual_removal').length}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Manual Removal</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 text-center">
            <div className="text-xl font-bold text-primary">{findings.filter(f => f.actionType === 'removal_service').length}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Service Removal</div>
          </CardContent>
        </Card>
      </div>

      {/* Pro: Export + Progress badge */}
      {!isLocked && (
        <div className="flex items-center gap-3 flex-wrap">
          {onExportPDF && (
            <Button variant="outline" size="sm" onClick={onExportPDF} className="gap-2">
              <FileDown className="h-4 w-4" />
              Export Remediation Plan (PDF)
            </Button>
          )}
          <Badge variant="secondary" className="gap-1.5 py-1 px-3 text-xs">
            <Target className="h-3 w-3" />
            Risk Reduction Tracking — Coming Soon
          </Badge>
        </div>
      )}

      {/* Finding cards */}
      <div className="space-y-3">
        {visibleFindings.map(finding => (
          <RemediationCard key={finding.id} finding={finding} />
        ))}
      </div>

      {/* Blurred locked findings for Free */}
      {isLocked && lockedFindings.length > 0 && (
        <div className="relative">
          <div className="space-y-3">
            {lockedFindings.map(finding => (
              <RemediationCard key={finding.id} finding={finding} isBlurred />
            ))}
          </div>
          {/* Overlay CTA */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3 p-6 rounded-xl bg-background/80 backdrop-blur-sm border border-border shadow-lg max-w-sm">
              <Lock className="h-8 w-8 text-primary mx-auto" />
              <h3 className="text-sm font-bold text-foreground">
                {findings.length - FREE_VISIBLE_LIMIT} more remediation steps available
              </h3>
               <p className="text-xs text-muted-foreground">
                Upgrade to unlock your full remediation roadmap.
              </p>
              <Button onClick={onUpgradeClick} className="gap-2 w-full">
                <Lock className="h-4 w-4" />
                Upgrade to Unlock Full Exposure Reduction Plan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA for Free */}
      {isLocked && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5 text-center space-y-3">
            <h3 className="text-base font-bold text-foreground">
              Upgrade to Unlock Full Exposure Reduction Plan
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Get priority-sorted remediation steps, official opt-out links, effort estimates, risk reduction tracking, and exportable PDF plans.
            </p>
            <Button onClick={onUpgradeClick} size="lg" className="gap-2">
              <Shield className="h-4 w-4" />
              Upgrade to Unlock Full Exposure Reduction Plan
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
