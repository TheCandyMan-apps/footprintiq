/**
 * FreeVsProComparison
 * 
 * Personalized comparison showing what the user sees vs what Pro reveals
 * for THEIR specific scan. Uses actual scan metrics to create urgency.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Check, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface FreeVsProComparisonProps {
  visiblePlatforms: number;
  totalPlatforms: number;
  username: string;
  onUpgradeClick: () => void;
}

export function FreeVsProComparison({
  visiblePlatforms,
  totalPlatforms,
  username,
  onUpgradeClick,
}: FreeVsProComparisonProps) {
  const hiddenCount = totalPlatforms - visiblePlatforms;

  if (hiddenCount <= 0) return null;

  const rows = [
    {
      label: 'Platforms shown',
      free: `${visiblePlatforms} of ${totalPlatforms}`,
      pro: `All ${totalPlatforms}`,
      locked: true,
    },
    {
      label: 'Risk analysis',
      free: 'Overview only',
      pro: 'Per-platform risk score',
      locked: true,
    },
    {
      label: 'Identity correlation',
      free: 'Hidden',
      pro: 'Full correlation map',
      locked: true,
    },
    {
      label: 'AI attribution',
      free: 'Blurred preview',
      pro: 'Detailed insights',
      locked: true,
    },
    {
      label: 'Remediation plan',
      free: 'Not available',
      pro: 'Prioritised action steps',
      locked: true,
    },
  ];

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardContent className="p-0">
        {/* Header */}
        <div className="px-4 py-3 bg-primary/5 border-b border-primary/10">
          <h3 className="text-sm font-semibold text-foreground">
            Your scan for <span className="text-primary">@{username}</span>
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Compare what you see vs what's available
          </p>
        </div>

        {/* Comparison table */}
        <div className="divide-y divide-border/30">
          {/* Column headers */}
          <div className="grid grid-cols-3 px-4 py-2 bg-muted/20">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider" />
            <div className="flex items-center justify-center gap-1">
              <Eye className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Free</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4 bg-primary">Pro</Badge>
            </div>
          </div>

          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-3 items-center px-4 py-2.5 hover:bg-muted/10 transition-colors">
              <span className="text-xs text-foreground font-medium">{row.label}</span>
              <div className="flex items-center justify-center">
                <span className="text-[11px] text-muted-foreground text-center flex items-center gap-1">
                  <EyeOff className="h-3 w-3 text-muted-foreground/50 shrink-0 hidden sm:block" />
                  {row.free}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-[11px] text-primary font-medium text-center flex items-center gap-1">
                  <Check className="h-3 w-3 text-primary shrink-0" />
                  {row.pro}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-4 py-3 bg-gradient-to-r from-primary/5 to-primary/10 border-t border-primary/10">
          <Button
            className="w-full gap-2 h-12 text-base bg-primary hover:bg-primary/90 active:scale-[0.97] transition-transform duration-130"
            onClick={onUpgradeClick}
          >
            <Lock className="h-4 w-4" />
            See all {totalPlatforms} platforms
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
