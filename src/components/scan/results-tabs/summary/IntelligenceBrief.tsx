import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, AlertTriangle, HelpCircle, AlertCircle, 
  ChevronRight, Globe, Users, Shield, Fingerprint, User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeyFindingItem {
  id: string;
  text: string;
  confidence: 'high' | 'medium' | 'low';
  severity?: 'critical' | 'warning' | 'info';
  icon: React.ElementType;
  deepLink?: {
    tab: string;
    filter?: string;
  };
}

interface IntelligenceBriefProps {
  username: string;
  accountsFound: number;
  platformsCount: number;
  breachCount: number;
  reuseScore: number;
  aliases: string[];
  scanComplete: boolean;
  profileImages: string[];
  verifiedCount: number;
}

const confidenceConfig = {
  high: { 
    label: 'High', 
    icon: CheckCircle, 
    className: 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400' 
  },
  medium: { 
    label: 'Med', 
    icon: HelpCircle, 
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400' 
  },
  low: { 
    label: 'Low', 
    icon: AlertCircle, 
    className: 'bg-muted text-muted-foreground border-border/50' 
  },
};

export function IntelligenceBrief({
  username,
  accountsFound,
  platformsCount,
  breachCount,
  reuseScore,
  aliases,
  scanComplete,
  profileImages,
  verifiedCount,
}: IntelligenceBriefProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Generate the plain-English summary (2-3 sentences)
  const summary = useMemo(() => {
    if (accountsFound === 0) {
      return `No active accounts were found for "${username}". This may indicate a low digital footprint or use of alternate identifiers.`;
    }
    
    const presenceLevel = accountsFound > 15 ? 'extensive' : accountsFound > 8 ? 'significant' : accountsFound > 3 ? 'moderate' : 'limited';
    let text = `The identifier "${username}" shows ${presenceLevel} online presence across ${accountsFound} platform${accountsFound !== 1 ? 's' : ''}.`;
    
    if (breachCount > 0) {
      text += ` ${breachCount} breach exposure${breachCount !== 1 ? 's were' : ' was'} detected, requiring immediate review.`;
    } else if (accountsFound > 5) {
      text += ' No known breach exposures were identified.';
    }
    
    if (reuseScore >= 70 && accountsFound > 4) {
      text += ' High identifier consistency suggests these accounts belong to the same individual.';
    }
    
    return text;
  }, [username, accountsFound, breachCount, reuseScore]);

  // Generate key findings (3-5 items with icons and confidence)
  const keyFindings = useMemo((): KeyFindingItem[] => {
    const findings: KeyFindingItem[] = [];

    // Critical: Breach exposures
    if (breachCount > 0) {
      findings.push({
        id: 'breach',
        text: `${breachCount} breach exposure${breachCount !== 1 ? 's' : ''} — credentials may be compromised`,
        confidence: 'high',
        severity: 'critical',
        icon: AlertTriangle,
        deepLink: { tab: 'breaches' },
      });
    }

    // Platform presence
    if (accountsFound > 0) {
      const confidence = accountsFound > 10 ? 'high' : accountsFound > 4 ? 'medium' : 'low';
      findings.push({
        id: 'presence',
        text: `Active on ${accountsFound} platform${accountsFound !== 1 ? 's' : ''} including ${getTopPlatforms(platformsCount)}`,
        confidence,
        icon: Globe,
        deepLink: { tab: 'accounts' },
      });
    }

    // Account correlation
    if (reuseScore >= 50 && accountsFound > 2) {
      findings.push({
        id: 'correlation',
        text: `${reuseScore}% identifier correlation — ${reuseScore >= 70 ? 'strong' : 'moderate'} account linkage`,
        confidence: reuseScore >= 70 ? 'high' : 'medium',
        icon: Fingerprint,
        deepLink: { tab: 'connections' },
      });
    }

    // Aliases detected
    if (aliases.length > 0) {
      findings.push({
        id: 'aliases',
        text: `${aliases.length} alternate identifier${aliases.length !== 1 ? 's' : ''}: ${aliases.slice(0, 2).join(', ')}${aliases.length > 2 ? '…' : ''}`,
        confidence: 'medium',
        icon: Users,
        deepLink: { tab: 'accounts' },
      });
    }

    // Verification status
    if (verifiedCount > 0) {
      findings.push({
        id: 'verified',
        text: `${verifiedCount} account${verifiedCount !== 1 ? 's' : ''} LENS verified`,
        confidence: 'high',
        icon: Shield,
        deepLink: { tab: 'accounts', filter: 'verified' },
      });
    }

    // Fallback for empty results
    if (findings.length === 0) {
      findings.push({
        id: 'limited',
        text: 'Limited digital footprint detected for this identifier',
        confidence: 'low',
        icon: User,
      });
    }

    return findings.slice(0, 5);
  }, [accountsFound, platformsCount, breachCount, reuseScore, aliases, verifiedCount]);

  const handleFindingClick = (finding: KeyFindingItem) => {
    if (finding.deepLink) {
      const params = new URLSearchParams(location.search);
      params.set('tab', finding.deepLink.tab);
      if (finding.deepLink.filter) {
        params.set('filter', finding.deepLink.filter);
      }
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  };

  function getTopPlatforms(count: number): string {
    if (count === 0) return 'various services';
    if (count === 1) return '1 service';
    if (count <= 3) return `${count} services`;
    return `${count} services`;
  }

  return (
    <div className="space-y-4">
      {/* Section: What We Found */}
      <section>
        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Shield className="w-3 h-3" />
          What We Found
        </h3>
        
        {/* Profile images strip - inline with summary */}
        <div className="flex gap-3">
          {profileImages.length > 0 && (
            <div className="flex -space-x-2 shrink-0">
              {profileImages.slice(0, 3).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt=""
                  className="w-8 h-8 rounded-full border-2 border-background object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ))}
            </div>
          )}
          <p className="text-[13px] leading-relaxed text-foreground/90">
            {summary}
          </p>
        </div>
      </section>

      {/* Section: Key Findings */}
      <section>
        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3" />
          Key Findings
        </h3>
        <div className="space-y-0.5">
          {keyFindings.map((finding) => {
            const conf = confidenceConfig[finding.confidence];
            const ConfIcon = conf.icon;
            const FindingIcon = finding.icon;
            const hasLink = !!finding.deepLink;
            
            return (
              <div 
                key={finding.id} 
                className={cn(
                  "group flex items-center gap-2 py-1.5 px-2 -mx-2 rounded transition-colors",
                  finding.severity === 'critical' && 'bg-destructive/5',
                  hasLink && 'hover:bg-muted/30 cursor-pointer'
                )}
                onClick={() => hasLink && handleFindingClick(finding)}
                role={hasLink ? 'button' : undefined}
                tabIndex={hasLink ? 0 : undefined}
                onKeyDown={(e) => {
                  if (hasLink && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleFindingClick(finding);
                  }
                }}
              >
                {/* Finding icon */}
                <FindingIcon className={cn(
                  "w-3.5 h-3.5 shrink-0",
                  finding.severity === 'critical' ? 'text-destructive' : 'text-muted-foreground'
                )} />
                
                {/* Finding text */}
                <span className={cn(
                  "flex-1 text-[12px] leading-snug",
                  finding.severity === 'critical' ? 'text-destructive font-medium' : 'text-foreground/85'
                )}>
                  {finding.text}
                </span>
                
                {/* Confidence badge */}
                <Badge 
                  variant="outline" 
                  className={cn('h-4 px-1.5 text-[9px] shrink-0 gap-0.5', conf.className)}
                >
                  <ConfIcon className="w-2 h-2" />
                  {conf.label}
                </Badge>
                
                {/* Link indicator */}
                {hasLink && (
                  <ChevronRight className="w-3 h-3 text-muted-foreground/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
