/**
 * ScanDepthIndicator Component
 * 
 * Shows users what percentage of the full scan they're seeing.
 * Creates urgency by visualizing how much is hidden.
 */

import { Layers, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ScanDepthIndicatorProps {
  /** Number of visible profiles (Free limit) */
  visibleCount: number;
  /** Total profiles found */
  totalCount: number;
  className?: string;
}

export function ScanDepthIndicator({
  visibleCount,
  totalCount,
  className,
}: ScanDepthIndicatorProps) {
  const navigate = useNavigate();
  
  // Calculate depth percentage (what % of results user can see)
  const depthPercentage = totalCount > 0 
    ? Math.round((visibleCount / totalCount) * 100) 
    : 0;
  
  // Hidden count
  const hiddenCount = Math.max(0, totalCount - visibleCount);
  
  // Don't render if nothing is hidden
  if (hiddenCount <= 0) return null;
  
  return (
    <Card className={cn('overflow-hidden border-border/50', className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
            <Layers className="h-3 w-3 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Scan Depth</h3>
        </div>
        
        {/* Progress bar */}
        <div className="space-y-2 mb-4">
          <Progress 
            value={depthPercentage} 
            className="h-2.5"
          />
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              Viewing {depthPercentage}% of results
            </span>
            <span className="font-medium text-primary">
              {visibleCount} of {totalCount}
            </span>
          </div>
        </div>
        
        {/* CTA area */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-dashed border-border/50">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {hiddenCount} findings hidden
            </span>
          </div>
          <Button 
            variant="ghost"
            size="sm"
            className="h-7 px-3 gap-1 text-primary hover:text-primary"
            onClick={() => navigate('/pricing')}
          >
            Reveal all
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Tagline */}
        <p className="text-center text-[10px] text-muted-foreground/70 mt-3">
          Free shows presence. Pro reveals context.
        </p>
      </CardContent>
    </Card>
  );
}
