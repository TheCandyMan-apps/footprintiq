import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles, ShieldCheck, Shield, ShieldAlert, Info, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LensConfidenceBadgeProps {
  /** Confidence score 0-100 */
  score: number;
  /** Optional reasoning/explanation for the score */
  reasoning?: string;
  /** Show the explain icon for AI explanation */
  showExplain?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Additional class name */
  className?: string;
}

const LENS_TIPS = {
  high: "High confidence match confirmed by LENS analysis. Multiple data points corroborate this finding.",
  moderate: "Moderate confidence. Some indicators match but additional verification recommended.",
  low: "Low confidence match. This may be a false positive — manual verification advised."
};

export function LensConfidenceBadge({ 
  score, 
  reasoning,
  showExplain = true,
  size = 'sm',
  className 
}: LensConfidenceBadgeProps) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  const { color, bgColor, label, icon: Icon, tip } = useMemo(() => {
    if (normalizedScore >= 80) {
      return { 
        color: 'text-green-600 dark:text-green-400', 
        bgColor: 'bg-green-500/10 border-green-500/20',
        label: 'High', 
        icon: ShieldCheck,
        tip: LENS_TIPS.high
      };
    } else if (normalizedScore >= 60) {
      return { 
        color: 'text-yellow-600 dark:text-yellow-400', 
        bgColor: 'bg-yellow-500/10 border-yellow-500/20',
        label: 'Moderate', 
        icon: Shield,
        tip: LENS_TIPS.moderate
      };
    } else {
      return { 
        color: 'text-orange-600 dark:text-orange-400', 
        bgColor: 'bg-orange-500/10 border-orange-500/20',
        label: 'Low', 
        icon: ShieldAlert,
        tip: LENS_TIPS.low
      };
    }
  }, [normalizedScore]);

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 gap-1' 
    : 'text-sm px-2.5 py-1 gap-1.5';

  const iconClasses = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn(
              'cursor-help font-medium border transition-colors',
              sizeClasses,
              bgColor,
              color,
              className
            )}
          >
            <Sparkles className={cn(iconClasses, 'text-primary')} />
            <span>LENS</span>
            <Icon className={iconClasses} />
            <span>{normalizedScore}%</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3" side="top">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-semibold text-sm">LENS Confidence: {label}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {tip}
            </p>
            {reasoning && (
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-start gap-1.5">
                  <Info className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground italic">
                    {reasoning}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-1 pt-1 text-[10px] text-muted-foreground/70">
              <HelpCircle className="h-2.5 w-2.5" />
              <span>LENS = Layered Entity & Network Scoring</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default LensConfidenceBadge;
