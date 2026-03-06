import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, Search, Shield } from 'lucide-react';
import { useMemo } from 'react';

interface InvestigatorInsightProps {
  username: string;
  profileCount: number;
  scanType?: string;
  onUpgradeClick: () => void;
  onInsightExpand?: () => void;
}

function generateInsights(username: string, profileCount: number, scanType?: string): string[] {
  const insights: string[] = [];

  // Username pattern analysis
  if (/\d{2,4}$/.test(username)) {
    insights.push('Username ends with numbers — often a birth year or significant date, useful for identity narrowing.');
  }
  if (/^[a-z]+\.[a-z]+$/i.test(username)) {
    insights.push('Username follows a "firstname.lastname" pattern — a strong real-name indicator.');
  }
  if (/^[a-z]+_[a-z]+$/i.test(username)) {
    insights.push('Underscore naming pattern detected — common in professional or older platform accounts.');
  }
  if (username.length <= 4) {
    insights.push('Short username — these are typically claimed early, suggesting a long-standing online presence.');
  }

  // Profile-based insights
  if (profileCount >= 8) {
    insights.push('High profile count across platforms indicates heavy digital footprint and increased correlation risk.');
  } else if (profileCount >= 4) {
    insights.push('Moderate spread across platforms — enough to build a behavioral profile.');
  }

  // Scan type specific
  if (scanType === 'email') {
    insights.push('Email addresses can be cross-referenced against breach databases and registration records.');
  } else if (scanType === 'phone') {
    insights.push('Phone numbers are strong identity anchors, often linking to messaging apps and registration data.');
  }

  // Always include a general insight
  insights.push('Username reuse across platforms is one of the most reliable signals in open-source investigations.');

  return insights.slice(0, 3);
}

export function InvestigatorInsight({
  username,
  profileCount,
  scanType,
  onUpgradeClick,
  onInsightExpand,
}: InvestigatorInsightProps) {
  const insights = useMemo(
    () => generateInsights(username, profileCount, scanType),
    [username, profileCount, scanType],
  );

  return (
    <Card className="overflow-hidden border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Search className="h-4 w-4 text-primary/70" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Investigator Insight</h3>
            <p className="text-[10px] text-muted-foreground">What signals this username reveals</p>
          </div>
        </div>

        <div className="space-y-2">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/20 border border-border/30">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-primary">{i + 1}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>

        {/* Locked deeper analysis */}
        <div className="rounded-lg bg-muted/30 border border-border/30 p-3 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span className="font-medium">Full behavioral analysis available in Pro</span>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {['Behavioral Patterns', 'Timeline Inference', 'Risk Assessment'].map((tag) => (
              <Badge key={tag} variant="outline" className="text-[8px] px-1.5 py-0 h-3.5">
                {tag}
              </Badge>
            ))}
          </div>
          <Button size="sm" variant="outline" className="text-xs h-7 gap-1.5" onClick={() => { onInsightExpand?.(); onUpgradeClick(); }}>
            Unlock Full Analysis <ArrowRight className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
          <Shield className="h-2.5 w-2.5" />
          <span>Based on public data only. No private information accessed.</span>
        </div>
      </CardContent>
    </Card>
  );
}
