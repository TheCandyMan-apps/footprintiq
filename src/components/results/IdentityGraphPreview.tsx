import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, Share2 } from 'lucide-react';
import { useMemo } from 'react';

interface IdentityGraphPreviewProps {
  profileCount: number;
  platforms: string[];
  username: string;
  onUpgradeClick: () => void;
  onInteraction?: () => void;
}

/**
 * Renders a static blurred SVG identity graph for Free users.
 * No Cytoscape or heavy libraries — pure SVG with CSS blur.
 */
export function IdentityGraphPreview({
  profileCount,
  platforms,
  username,
  onUpgradeClick,
  onInteraction,
}: IdentityGraphPreviewProps) {
  // Generate deterministic node positions from platform names
  const nodes = useMemo(() => {
    const centerX = 150;
    const centerY = 100;
    const radius = 70;
    const displayPlatforms = platforms.slice(0, 8);
    return displayPlatforms.map((p, i) => {
      const angle = (2 * Math.PI * i) / displayPlatforms.length - Math.PI / 2;
      return {
        name: p,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  }, [platforms]);

  return (
    <Card className="overflow-hidden border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-semibold text-foreground">Identity Correlation Map</h3>
          </div>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">Preview</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          How discovered profiles connect to this identity.
        </p>

        {/* Blurred SVG graph */}
        <div className="relative rounded-lg bg-muted/10 border border-border/30 overflow-hidden">
          <svg
            viewBox="0 0 300 200"
            className="w-full h-40 filter blur-[3px] opacity-60"
            aria-hidden="true"
          >
            {/* Edges from center to nodes */}
            {nodes.map((node, i) => (
              <line
                key={`edge-${i}`}
                x1={150}
                y1={100}
                x2={node.x}
                y2={node.y}
                stroke="hsl(var(--primary))"
                strokeWidth="1"
                strokeOpacity="0.3"
              />
            ))}
            {/* Cross-connections */}
            {nodes.slice(0, -1).map((node, i) => (
              <line
                key={`cross-${i}`}
                x1={node.x}
                y1={node.y}
                x2={nodes[i + 1].x}
                y2={nodes[i + 1].y}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="0.5"
                strokeOpacity="0.2"
                strokeDasharray="3,3"
              />
            ))}
            {/* Center node */}
            <circle cx={150} cy={100} r={14} fill="hsl(var(--primary))" fillOpacity="0.2" stroke="hsl(var(--primary))" strokeWidth="1.5" />
            <text x={150} y={104} textAnchor="middle" fontSize="7" fill="hsl(var(--primary))" fontWeight="600">
              {username.slice(0, 6)}
            </text>
            {/* Outer nodes */}
            {nodes.map((node, i) => (
              <g key={`node-${i}`}>
                <circle cx={node.x} cy={node.y} r={10} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1" />
                <text x={node.x} y={node.y + 3} textAnchor="middle" fontSize="5" fill="hsl(var(--muted-foreground))">
                  {node.name.slice(0, 4)}
                </text>
              </g>
            ))}
          </svg>

          {/* Overlay lock */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/30">
            <Lock className="h-5 w-5 text-muted-foreground/70" />
            <p className="text-xs font-medium text-muted-foreground">{profileCount} connections mapped</p>
            <Button size="sm" onClick={() => { onInteraction?.(); onUpgradeClick(); }} className="gap-1.5 h-8 text-xs">
              Unlock Full Graph <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/60 text-center">
          Pro users get an interactive, labeled graph with relationship analysis.
        </p>
      </CardContent>
    </Card>
  );
}
