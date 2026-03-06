import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, ExternalLink } from 'lucide-react';

interface Platform {
  name: string;
  url?: string;
  username?: string;
  confidence?: number;
}

interface PlatformTeaserProps {
  platforms: Platform[];
  onUpgradeClick: () => void;
  onInteraction?: () => void;
}

const VISIBLE_LIMIT = 3;

export function PlatformTeaser({ platforms, onUpgradeClick, onInteraction }: PlatformTeaserProps) {
  if (platforms.length === 0) return null;

  const visible = platforms.slice(0, VISIBLE_LIMIT);
  const hiddenCount = Math.max(0, platforms.length - VISIBLE_LIMIT);

  return (
    <Card className="overflow-hidden border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Detected Platforms</h3>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
            {platforms.length} found
          </Badge>
        </div>

        <div className="space-y-2">
          {visible.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/30"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">
                  {p.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium capitalize text-foreground">{p.name}</span>
                {p.username && (
                  <span className="ml-2 text-[10px] font-mono text-muted-foreground">@{p.username}</span>
                )}
              </div>
              {p.url && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />}
            </div>
          ))}
        </div>

        {hiddenCount > 0 && (
          <button
            onClick={() => { onInteraction?.(); onUpgradeClick(); }}
            className="w-full rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 p-4 text-center space-y-2.5 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-center gap-2 text-sm text-foreground">
              <Lock className="h-4 w-4 text-primary" />
              <span className="font-semibold">{hiddenCount} more platform{hiddenCount > 1 ? 's' : ''} detected</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Including social media, forums, and niche communities
            </p>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all duration-200">
              Unlock Full Platform List
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </button>
        )}
      </CardContent>
    </Card>
  );
}
