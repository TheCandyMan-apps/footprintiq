import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface IdentityStrengthScoreProps {
  platformCount: number;
  categoryDiversity: number; // 0-6 categories found
  avgConfidence: number; // 0-1
  nsfwCount: number;
  providerConsistency: number; // How many providers found the same platforms (0-1)
}

function calculateIdentityStrength({
  platformCount,
  categoryDiversity,
  avgConfidence,
  nsfwCount,
  providerConsistency,
}: IdentityStrengthScoreProps): number {
  // Platform count (0-40 points): More platforms = stronger identity
  const platformScore = Math.min(platformCount * 2, 40);
  
  // Category diversity (0-20 points): More diverse = real person
  const diversityScore = (categoryDiversity / 6) * 20;
  
  // Confidence (0-20 points)
  const confidenceScore = avgConfidence * 20;
  
  // Provider consistency (0-15 points): Multiple providers finding same = stronger
  const consistencyScore = providerConsistency * 15;
  
  // NSFW penalty (0 to -10 points)
  const nsfwPenalty = Math.min(nsfwCount * 5, 10);
  
  const total = platformScore + diversityScore + confidenceScore + consistencyScore - nsfwPenalty;
  return Math.max(0, Math.min(100, total));
}

export function IdentityStrengthScore(props: IdentityStrengthScoreProps) {
  const score = calculateIdentityStrength(props);
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: 'Very Strong', color: 'text-green-600 dark:text-green-400' };
    if (score >= 60) return { label: 'Strong', color: 'text-blue-600 dark:text-blue-400' };
    if (score >= 40) return { label: 'Moderate', color: 'text-yellow-600 dark:text-yellow-400' };
    if (score >= 20) return { label: 'Weak', color: 'text-orange-600 dark:text-orange-400' };
    return { label: 'Very Weak', color: 'text-red-600 dark:text-red-400' };
  };
  
  const scoreInfo = getScoreLabel(score);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Identity Strength</CardTitle>
          </div>
          <Badge variant="outline" className={scoreInfo.color}>
            {scoreInfo.label}
          </Badge>
        </div>
        <CardDescription>
          Digital footprint robustness score
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-primary">{score}</span>
          <span className="text-muted-foreground">/100</span>
        </div>
        <Progress value={score} className="h-2" />
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            {props.platformCount} platforms
          </div>
          <div className="text-muted-foreground">
            {props.categoryDiversity} categories
          </div>
          <div className="text-muted-foreground">
            {Math.round(props.avgConfidence * 100)}% avg confidence
          </div>
          <div className="text-muted-foreground">
            {Math.round(props.providerConsistency * 100)}% consistency
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
