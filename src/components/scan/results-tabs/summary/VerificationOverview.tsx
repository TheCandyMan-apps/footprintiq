import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, HelpCircle, AlertTriangle, Sparkles, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LensVerificationResult } from '@/hooks/useForensicVerification';

interface VerificationOverviewProps {
  totalAccounts: number;
  verifiedEntities: Map<string, LensVerificationResult>;
  onNavigateToAccounts?: () => void;
}

function getStatusFromScore(score: number): 'verified' | 'likely' | 'unclear' {
  if (score >= 75) return 'verified';
  if (score >= 50) return 'likely';
  return 'unclear';
}

const STATUS_CONFIG = {
  verified: {
    label: 'Verified',
    icon: CheckCircle,
    bg: 'bg-green-500/10',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-500/20',
  },
  likely: {
    label: 'Likely',
    icon: HelpCircle,
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
  },
  unclear: {
    label: 'Unclear',
    icon: AlertTriangle,
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
  },
};

export function VerificationOverview({ 
  totalAccounts, 
  verifiedEntities,
  onNavigateToAccounts 
}: VerificationOverviewProps) {
  const stats = useMemo(() => {
    const counts = { verified: 0, likely: 0, unclear: 0 };
    
    verifiedEntities.forEach((result) => {
      const status = getStatusFromScore(result.confidenceScore);
      counts[status]++;
    });
    
    return counts;
  }, [verifiedEntities]);

  const totalVerified = verifiedEntities.size;
  const unverified = totalAccounts - totalVerified;
  const verifiedPercent = totalAccounts > 0 ? Math.round((totalVerified / totalAccounts) * 100) : 0;

  // Don't render if nothing to show
  if (totalAccounts === 0) return null;

  return (
    <section>
      <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <Shield className="w-3 h-3" />
        LENS Verification
      </h3>
      
      <Card className="border-border/40">
        <CardContent className="p-2.5">
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 via-amber-500 to-muted-foreground transition-all duration-300"
                style={{ 
                  width: `${verifiedPercent}%`,
                  background: totalVerified > 0 
                    ? `linear-gradient(90deg, 
                        hsl(142 76% 36%) 0%, 
                        hsl(142 76% 36%) ${(stats.verified / Math.max(totalVerified, 1)) * 100}%,
                        hsl(45 93% 47%) ${(stats.verified / Math.max(totalVerified, 1)) * 100}%,
                        hsl(45 93% 47%) ${((stats.verified + stats.likely) / Math.max(totalVerified, 1)) * 100}%,
                        hsl(0 0% 60%) ${((stats.verified + stats.likely) / Math.max(totalVerified, 1)) * 100}%
                      )`
                    : undefined
                }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {totalVerified}/{totalAccounts}
            </span>
          </div>

          {/* Status counts */}
          <div className="flex items-center gap-1.5">
            {(Object.entries(STATUS_CONFIG) as [keyof typeof STATUS_CONFIG, typeof STATUS_CONFIG.verified][]).map(([status, config]) => {
              const count = stats[status];
              const Icon = config.icon;
              
              return (
                <Badge
                  key={status}
                  variant="outline"
                  className={cn(
                    'h-5 px-1.5 gap-1 text-[10px] font-medium',
                    config.bg,
                    config.text,
                    config.border,
                    count === 0 && 'opacity-40'
                  )}
                >
                  <Icon className="w-2.5 h-2.5" />
                  <span>{count}</span>
                  <span className="opacity-70">{config.label}</span>
                </Badge>
              );
            })}
          </div>

          {/* CTA if many unverified */}
          {unverified > 0 && totalVerified < totalAccounts * 0.5 && (
            <div className="mt-2 pt-2 border-t border-border/30">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-7 text-[11px] gap-1.5 text-primary hover:text-primary"
                onClick={onNavigateToAccounts}
              >
                <Sparkles className="w-3 h-3" />
                Verify {unverified} more account{unverified !== 1 ? 's' : ''}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}