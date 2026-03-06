import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, ArrowRight, Layers } from 'lucide-react';

const CATEGORY_MAP: Record<string, string> = {
  github: 'Developer Communities', gitlab: 'Developer Communities', stackoverflow: 'Developer Communities',
  bitbucket: 'Developer Communities', npm: 'Developer Communities', hackernews: 'Developer Communities',
  'dev.to': 'Developer Communities', codepen: 'Developer Communities', replit: 'Developer Communities',
  steam: 'Gaming Platforms', twitch: 'Gaming Platforms', xbox: 'Gaming Platforms',
  playstation: 'Gaming Platforms', epicgames: 'Gaming Platforms', roblox: 'Gaming Platforms',
  discord: 'Gaming Platforms', 'battle.net': 'Gaming Platforms',
  researchgate: 'Academic Networks', academia: 'Academic Networks', orcid: 'Academic Networks',
  scholar: 'Academic Networks',
  reddit: 'Discussion Forums', quora: 'Discussion Forums', medium: 'Discussion Forums',
  instagram: 'Social Media', twitter: 'Social Media', x: 'Social Media', tiktok: 'Social Media',
  facebook: 'Social Media', snapchat: 'Social Media', threads: 'Social Media', pinterest: 'Social Media',
  linkedin: 'Professional Networks', behance: 'Professional Networks', dribbble: 'Professional Networks',
  youtube: 'Content Platforms', vimeo: 'Content Platforms', soundcloud: 'Content Platforms',
  spotify: 'Content Platforms', bandcamp: 'Content Platforms',
};

interface PlatformCategoriesDetectedProps {
  platforms: string[];
  onUpgradeClick: () => void;
  onInteraction?: () => void;
}

export function PlatformCategoriesDetected({ platforms, onUpgradeClick, onInteraction }: PlatformCategoriesDetectedProps) {
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of platforms) {
      const cat = CATEGORY_MAP[p.toLowerCase()] || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return Object.entries(counts)
      .filter(([cat]) => cat !== 'Other')
      .sort((a, b) => b[1] - a[1]);
  }, [platforms]);

  if (categories.length === 0) return null;

  const topCategory = categories[0];
  const lockedCount = Math.max(0, categories.length - 1);

  return (
    <Card className="overflow-hidden border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Platform Categories Detected</h3>
            <p className="text-xs text-muted-foreground">
              Higher-level intelligence about where this username appears.
            </p>
          </div>
        </div>

        {/* Top category - visible */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
          <span className="text-sm font-medium text-foreground">{topCategory[0]}</span>
          <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5">
            {topCategory[1]} platform{topCategory[1] > 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Blurred remaining categories */}
        {lockedCount > 0 && (
          <div className="space-y-2">
            {categories.slice(1, 4).map(([cat, count], i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/20 blur-[5px] select-none pointer-events-none opacity-50"
              >
                <span className="text-sm font-medium text-foreground">{cat}</span>
                <span className="text-xs text-muted-foreground">{count} platforms</span>
              </div>
            ))}

            <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>+{lockedCount} more categor{lockedCount > 1 ? 'ies' : 'y'} with platform counts</span>
            </div>

            <Button
              size="sm"
              className="w-full gap-2 bg-primary hover:bg-primary/90 h-10"
              onClick={() => {
                onInteraction?.();
                onUpgradeClick();
              }}
            >
              <Lock className="h-3.5 w-3.5" />
              Unlock Full Platform Intelligence
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {lockedCount === 0 && (
          <p className="text-[10px] text-muted-foreground/60 text-center">
            Pro users see full category distribution with platform-level attribution.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
