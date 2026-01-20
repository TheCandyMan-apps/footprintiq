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
    <Card className="border-border/30">
      <CardContent className="p-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            LENS Verification
          </h4>
          {stats.totalVerified > 0 && (
            <Badge variant="outline" className="h-3.5 px-1 text-[8px] text-muted-foreground/70">
              {stats.verificationRate}%
            </Badge>
          )}
        </div>

        {/* Stats Row */}
        {stats.totalVerified > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            {stats.verified > 0 && (
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20">
                <CheckCircle className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                <span className="text-[10px] font-medium text-green-700 dark:text-green-300">
                  {stats.verified}
                </span>
              </div>
            )}
            {stats.likely > 0 && (
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                <HelpCircle className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300">
                  {stats.likely}
                </span>
              </div>
            )}
            {stats.unclear > 0 && (
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted/40 border border-border/30">
                <AlertTriangle className="w-2.5 h-2.5 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground">
                  {stats.unclear}
                </span>
              </div>
            )}
            {stats.unverified > 0 && (
              <span className="text-[9px] text-muted-foreground/50 ml-auto">
                {stats.unverified} pending
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-muted-foreground/60">
            <Shield className="w-3 h-3" />
            <span className="text-[10px]">
              Use LENS Verify in Accounts tab
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}