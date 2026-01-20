import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, HelpCircle, AlertTriangle, Sparkles, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LensVerificationResult } from '@/hooks/useForensicVerification';

interface VerificationStatusCardProps {
  totalAccounts: number;
  verifiedEntities: Map<string, LensVerificationResult>;
}

export function VerificationStatusCard({ 
  totalAccounts, 
  verifiedEntities 
}: VerificationStatusCardProps) {
  const stats = useMemo(() => {
    let verified = 0;
    let likely = 0;
    let unclear = 0;

    verifiedEntities.forEach((result) => {
      const score = result.confidenceScore;
      if (score >= 75) verified++;
      else if (score >= 50) likely++;
      else unclear++;
    });

    const totalVerified = verified + likely + unclear;
    const unverified = totalAccounts - totalVerified;
    const verificationRate = totalAccounts > 0 
      ? Math.round((totalVerified / totalAccounts) * 100) 
      : 0;

    return { verified, likely, unclear, unverified, totalVerified, verificationRate };
  }, [totalAccounts, verifiedEntities]);

  // Don't show if no accounts or no verifications
  if (totalAccounts === 0) return null;

  return (
    <Card className="border-border/40">
      <CardContent className="p-2.5">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            LENS Verification
          </h4>
          {stats.totalVerified > 0 && (
            <Badge variant="outline" className="h-4 px-1.5 text-[9px] text-muted-foreground">
              {stats.verificationRate}% coverage
            </Badge>
          )}
        </div>

        {/* Stats Row */}
        {stats.totalVerified > 0 ? (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Verified */}
            {stats.verified > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-500/10 border border-green-500/20">
                <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                <span className="text-[11px] font-medium text-green-700 dark:text-green-300">
                  {stats.verified} Verified
                </span>
              </div>
            )}

            {/* Likely */}
            {stats.likely > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                <HelpCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
                  {stats.likely} Likely
                </span>
              </div>
            )}

            {/* Unclear */}
            {stats.unclear > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted border border-border">
                <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  {stats.unclear} Unclear
                </span>
              </div>
            )}

            {/* Unverified count */}
            {stats.unverified > 0 && (
              <span className="text-[10px] text-muted-foreground/60 ml-auto">
                {stats.unverified} pending
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground/70">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[11px]">
              No accounts verified yet. Use LENS Verify in Accounts tab.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}