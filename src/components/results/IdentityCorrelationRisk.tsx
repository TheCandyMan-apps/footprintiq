import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Info } from 'lucide-react';

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface IdentityCorrelationRiskProps {
  profileCount: number;
  highConfidenceCount: number;
  uniquePlatforms: number;
}

function computeRiskLevel(
  profileCount: number,
  highConfidence: number,
  platforms: number,
): RiskLevel {
  if (profileCount >= 8 || highConfidence >= 5 || platforms >= 6) return 'HIGH';
  if (profileCount >= 4 || highConfidence >= 2 || platforms >= 3) return 'MEDIUM';
  return 'LOW';
}

const RISK_CONFIG: Record<RiskLevel, { color: string; bg: string; border: string; icon: typeof Shield; label: string; description: string }> = {
  LOW: {
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    icon: Shield,
    label: 'Low Correlation Risk',
    description: 'Few matching profiles found. Identity linkage is limited.',
  },
  MEDIUM: {
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: AlertTriangle,
    label: 'Medium Correlation Risk',
    description: 'Multiple matching profiles detected. An investigator could connect these accounts.',
  },
  HIGH: {
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    icon: AlertTriangle,
    label: 'High Correlation Risk',
    description: 'Strong identity linkage across many platforms. This identifier is highly discoverable.',
  },
};

export function IdentityCorrelationRisk({
  profileCount,
  highConfidenceCount,
  uniquePlatforms,
}: IdentityCorrelationRiskProps) {
  const level = computeRiskLevel(profileCount, highConfidenceCount, uniquePlatforms);
  const config = RISK_CONFIG[level];
  const Icon = config.icon;

  return (
    <Card className={`overflow-hidden border ${config.border}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
              <Icon className={`h-4 w-4 ${config.color}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Identity Correlation Risk</h3>
              <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 mt-0.5 ${config.color} border-current`}>
                {level}
              </Badge>
            </div>
          </div>
        </div>

        <p className={`text-xs ${config.color} font-medium`}>
          {config.description}
        </p>

        <div className="grid grid-cols-3 gap-2">
          <div className={`text-center p-2 rounded-lg ${config.bg} border ${config.border}`}>
            <div className="text-lg font-bold text-foreground">{profileCount}</div>
            <div className="text-[9px] text-muted-foreground">Profiles</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${config.bg} border ${config.border}`}>
            <div className="text-lg font-bold text-foreground">{highConfidenceCount}</div>
            <div className="text-[9px] text-muted-foreground">High Confidence</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${config.bg} border ${config.border}`}>
            <div className="text-lg font-bold text-foreground">{uniquePlatforms}</div>
            <div className="text-[9px] text-muted-foreground">Platforms</div>
          </div>
        </div>

        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/30">
          <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-[10px] text-muted-foreground">
            Correlation risk measures how easily separate profiles can be linked to the same person. Higher risk means greater discoverability.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
