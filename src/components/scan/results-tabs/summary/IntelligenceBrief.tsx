import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, HelpCircle, Shield, Globe, Users, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeyFindingItem {
  id: string;
  text: string;
  confidence: 'high' | 'medium' | 'low';
  severity?: 'critical' | 'warning' | 'info';
}

interface IntelligenceBriefProps {
  username: string;
  accountsFound: number;
  platformsCount: number;
  breachCount: number;
  reuseScore: number;
  aliases: string[];
  scanComplete: boolean;
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
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400' 
  },
  low: { 
    label: 'Low', 
    icon: AlertCircle, 
    className: 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400' 
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
}: IntelligenceBriefProps) {
  // Generate the plain-English summary
  const summary = useMemo(() => {
    const parts: string[] = [];
    
    if (accountsFound === 0) {
      parts.push(`No active accounts were found for "${username}".`);
      parts.push('This could indicate a low digital footprint or use of different identifiers.');
    } else {
      const presenceLevel = accountsFound > 15 ? 'significant' : accountsFound > 5 ? 'moderate' : 'limited';
      parts.push(`The identifier "${username}" has a ${presenceLevel} online presence across ${accountsFound} platforms.`);
      
      if (breachCount > 0) {
        parts.push(`${breachCount} breach ${breachCount === 1 ? 'exposure was' : 'exposures were'} identified, indicating potential credential compromise.`);
      } else if (accountsFound > 3) {
        parts.push('No known breach exposures were detected for this identifier.');
      }
      
      if (reuseScore >= 60 && accountsFound > 3) {
        parts.push('High identifier consistency suggests these accounts likely belong to the same individual.');
      }
    }
    
    return parts.join(' ');
  }, [username, accountsFound, breachCount, reuseScore]);

  // Generate key findings with confidence
  const keyFindings = useMemo((): KeyFindingItem[] => {
    const findings: KeyFindingItem[] = [];

    if (breachCount > 0) {
      findings.push({
        id: 'breach',
        text: `${breachCount} breach ${breachCount === 1 ? 'exposure' : 'exposures'} detected — credentials may be compromised`,
        confidence: 'high',
        severity: 'critical',
      });
    }

    if (accountsFound > 0) {
      const confidence = accountsFound > 10 ? 'high' : accountsFound > 3 ? 'medium' : 'low';
      findings.push({
        id: 'presence',
        text: `Active presence confirmed on ${accountsFound} platform${accountsFound !== 1 ? 's' : ''}`,
        confidence,
      });
    }

    if (reuseScore >= 60) {
      findings.push({
        id: 'reuse',
        text: `High identifier reuse (${reuseScore}%) — strong correlation between accounts`,
        confidence: reuseScore >= 80 ? 'high' : 'medium',
      });
    } else if (reuseScore >= 30 && accountsFound > 3) {
      findings.push({
        id: 'reuse',
        text: `Moderate identifier reuse (${reuseScore}%) — some account correlation`,
        confidence: 'low',
      });
    }

    if (aliases.length > 0) {
      findings.push({
        id: 'aliases',
        text: `${aliases.length} alternate name${aliases.length !== 1 ? 's' : ''} detected: ${aliases.slice(0, 2).join(', ')}${aliases.length > 2 ? '...' : ''}`,
        confidence: 'medium',
      });
    }

    if (findings.length === 0) {
      findings.push({
        id: 'limited',
        text: 'Limited or no digital footprint detected for this identifier',
        confidence: 'low',
      });
    }

    return findings.slice(0, 5);
  }, [accountsFound, breachCount, reuseScore, aliases]);

  return (
    <div className="space-y-3">
      {/* Section: What We Found */}
      <section>
        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Shield className="w-3 h-3" />
          What We Found
        </h3>
        <p className="text-[13px] leading-relaxed text-foreground/90">
          {summary}
        </p>
      </section>

      {/* Section: Key Findings */}
      <section>
        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3" />
          Key Findings
        </h3>
        <ul className="space-y-1">
          {keyFindings.map((finding) => {
            const conf = confidenceConfig[finding.confidence];
            const ConfIcon = conf.icon;
            
            return (
              <li 
                key={finding.id} 
                className={cn(
                  "flex items-start gap-2 py-1.5 px-2 -mx-2 rounded text-[12px]",
                  finding.severity === 'critical' && 'bg-destructive/5'
                )}
              >
                <span className={cn(
                  "mt-0.5 shrink-0",
                  finding.severity === 'critical' ? 'text-destructive' : 'text-muted-foreground'
                )}>
                  •
                </span>
                <span className={cn(
                  "flex-1 leading-snug",
                  finding.severity === 'critical' ? 'text-destructive font-medium' : 'text-foreground/85'
                )}>
                  {finding.text}
                </span>
                <Badge 
                  variant="outline" 
                  className={cn('h-4 px-1 text-[8px] shrink-0 gap-0.5', conf.className)}
                >
                  <ConfIcon className="w-2 h-2" />
                  {conf.label}
                </Badge>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
