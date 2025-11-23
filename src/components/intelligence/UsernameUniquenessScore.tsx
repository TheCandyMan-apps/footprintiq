import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fingerprint } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface UsernameUniquenessScoreProps {
  username: string;
  platformCount: number;
  providerDensity: number; // How many providers found it (0-1)
}

function calculateUniqueness({
  username,
  platformCount,
  providerDensity,
}: UsernameUniquenessScoreProps): number {
  // Base score on username characteristics
  const length = username.length;
  const hasNumbers = /\d/.test(username);
  const hasSpecialChars = /[^a-zA-Z0-9]/.test(username);
  
  // Length score (0-30): shorter = more unique
  const lengthScore = Math.max(0, 30 - length * 2);
  
  // Complexity score (0-20)
  let complexityScore = 0;
  if (hasNumbers) complexityScore += 10;
  if (hasSpecialChars) complexityScore += 10;
  
  // Platform scarcity (0-30): fewer platforms = more unique
  const platformScore = Math.max(0, 30 - platformCount);
  
  // Provider density penalty (0-20): fewer providers finding it = more unique
  const densityScore = (1 - providerDensity) * 20;
  
  const total = lengthScore + complexityScore + platformScore + densityScore;
  return Math.max(0, Math.min(100, total));
}

export function UsernameUniquenessScore(props: UsernameUniquenessScoreProps) {
  const score = calculateUniqueness(props);
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: 'Very Unique', color: 'text-green-600 dark:text-green-400' };
    if (score >= 60) return { label: 'Unique', color: 'text-blue-600 dark:text-blue-400' };
    if (score >= 40) return { label: 'Common', color: 'text-yellow-600 dark:text-yellow-400' };
    if (score >= 20) return { label: 'Very Common', color: 'text-orange-600 dark:text-orange-400' };
    return { label: 'Extremely Common', color: 'text-red-600 dark:text-red-400' };
  };
  
  const scoreInfo = getScoreLabel(score);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Username Uniqueness</CardTitle>
          </div>
          <Badge variant="outline" className={scoreInfo.color}>
            {scoreInfo.label}
          </Badge>
        </div>
        <CardDescription>
          Global usage pattern analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-primary">{score}</span>
          <span className="text-muted-foreground">/100</span>
        </div>
        <Progress value={score} className="h-2" />
        
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Found on {props.platformCount} platforms</div>
          <div>{Math.round(props.providerDensity * 100)}% provider coverage</div>
          <div className="pt-2 text-xs">
            {score >= 60 ? '✓ Low collision risk' : '⚠ High collision risk'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
