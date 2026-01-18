import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { ForensicConfidenceGauge } from '@/components/forensic/ForensicConfidenceGauge';
import { cn } from '@/lib/utils';

interface LensSummaryCardProps {
  /** Overall confidence score 0-100 */
  overallScore: number;
  /** High confidence findings count */
  highConfidence: number;
  /** Moderate confidence findings count */
  moderateConfidence: number;
  /** Low confidence findings count */
  lowConfidence: number;
  /** Total findings analyzed */
  totalFindings: number;
  /** Optional className */
  className?: string;
}

export function LensSummaryCard({
  overallScore,
  highConfidence,
  moderateConfidence,
  lowConfidence,
  totalFindings,
  className
}: LensSummaryCardProps) {
  const recommendation = useMemo(() => {
    if (overallScore >= 80) {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        text: 'High reliability scan. Most findings are corroborated across multiple sources.'
      };
    } else if (overallScore >= 60) {
      return {
        icon: Info,
        color: 'text-yellow-600',
        text: 'Moderate reliability. Consider verifying findings marked with lower confidence.'
      };
    } else {
      return {
        icon: AlertTriangle,
        color: 'text-orange-600',
        text: 'Low reliability scan. Manual verification strongly recommended for critical findings.'
      };
    }
  }, [overallScore]);

  const RecommendationIcon = recommendation.icon;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-primary" />
          LENS Analysis Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Gauge */}
          <ForensicConfidenceGauge score={overallScore} size={120} />
          
          {/* Stats */}
          <div className="flex-1 grid grid-cols-3 gap-3 w-full">
            <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-2xl font-bold text-green-600">{highConfidence}</div>
              <div className="text-xs text-muted-foreground">High</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-600">{moderateConfidence}</div>
              <div className="text-xs text-muted-foreground">Moderate</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="text-2xl font-bold text-orange-600">{lowConfidence}</div>
              <div className="text-xs text-muted-foreground">Low</div>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border">
          <RecommendationIcon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', recommendation.color)} />
          <div className="space-y-1">
            <p className="text-sm text-foreground">
              {recommendation.text}
            </p>
            <p className="text-xs text-muted-foreground">
              Analyzed {totalFindings} findings with LENS (Layered Entity & Network Scoring)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default LensSummaryCard;
