import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, TrendingUp, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getPlatformCategory } from '@/lib/categoryMapping';
import { parseEvidence, extractPlatform, isNSFW } from '@/lib/evidenceParser';

interface IdentityStrengthScoreProps {
  scanId: string;
}

function calculateIdentityStrength({
  platformCount,
  categoryDiversity,
  avgConfidence,
  nsfwCount,
  providerConsistency,
}: {
  platformCount: number;
  categoryDiversity: number;
  avgConfidence: number;
  nsfwCount: number;
  providerConsistency: number;
}): number {
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

export function IdentityStrengthScore({ scanId }: IdentityStrengthScoreProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['identity-strength', scanId],
    queryFn: async () => {
      const { data: findings } = await supabase
        .from('findings')
        .select('provider, kind, confidence, evidence, meta')
        .eq('scan_id', scanId)
        .neq('kind', 'provider.error')
        .neq('kind', 'provider.timeout');

      if (!findings || findings.length === 0) {
        return { platformCount: 0, categoryDiversity: 0, avgConfidence: 0, nsfwCount: 0, providerConsistency: 0 };
      }

      // Calculate metrics
      const platformNames = new Set(findings.map(f => extractPlatform(f)));

      const categories = new Set(
        Array.from(platformNames).map(name => getPlatformCategory(name))
      );

      const confidences = findings
        .map(f => f.confidence)
        .filter((c): c is number => typeof c === 'number');
      const avgConfidence = confidences.length > 0
        ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
        : 0;

      const nsfwCount = findings.filter(f => isNSFW(f)).length;

      // Provider consistency: check how many unique providers found similar platforms
      const providersByPlatform = new Map<string, Set<string>>();
      findings.forEach(f => {
        const platform = extractPlatform(f);
        
        if (!providersByPlatform.has(platform)) {
          providersByPlatform.set(platform, new Set());
        }
        providersByPlatform.get(platform)!.add(f.provider);
      });

      const multiProviderPlatforms = Array.from(providersByPlatform.values())
        .filter(providers => providers.size > 1).length;
      const providerConsistency = platformNames.size > 0 
        ? multiProviderPlatforms / platformNames.size 
        : 0;

      return {
        platformCount: platformNames.size,
        categoryDiversity: categories.size,
        avgConfidence,
        nsfwCount,
        providerConsistency
      };
    },
    enabled: !!scanId
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const props = data || { platformCount: 0, categoryDiversity: 0, avgConfidence: 0, nsfwCount: 0, providerConsistency: 0 };
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
    <Card className="min-h-[420px]">
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
          <span className="text-4xl font-bold text-primary truncate">{score.toFixed(1)}</span>
          <span className="text-muted-foreground">/100</span>
        </div>
        <Progress value={score} className="h-2" />
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-xs">
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
