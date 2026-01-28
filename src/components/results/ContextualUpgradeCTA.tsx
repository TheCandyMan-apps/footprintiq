/**
 * ContextualUpgradeCTA Component
 * 
 * Replaces generic "Pro" badges with action-oriented microcopy.
 * Used inline within sections to create targeted upgrade prompts.
 */

import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

type CTAVariant = 'badge' | 'inline' | 'button';

interface ContextualUpgradeCTAProps {
  /** Number of hidden items */
  hiddenCount: number;
  /** Context-specific message */
  context: 'profiles' | 'connections' | 'insights' | 'breaches' | 'generic';
  /** Visual variant */
  variant?: CTAVariant;
  className?: string;
}

/**
 * Get contextual copy based on the section
 */
function getContextualCopy(context: string, count: number): { primary: string; secondary: string } {
  switch (context) {
    case 'profiles':
      return {
        primary: `${count} more profiles`,
        secondary: 'See which are real →',
      };
    case 'connections':
      return {
        primary: `${count} linked accounts found`,
        secondary: 'Understand how they connect →',
      };
    case 'insights':
      return {
        primary: `${count} AI insights ready`,
        secondary: 'See what they reveal →',
      };
    case 'breaches':
      return {
        primary: `${count} exposures detected`,
        secondary: 'Check if you\'re at risk →',
      };
    default:
      return {
        primary: `${count} more findings`,
        secondary: 'Unlock full analysis →',
      };
  }
}

export function ContextualUpgradeCTA({
  hiddenCount,
  context,
  variant = 'inline',
  className,
}: ContextualUpgradeCTAProps) {
  const navigate = useNavigate();
  const { primary, secondary } = getContextualCopy(context, hiddenCount);
  
  const handleClick = () => navigate('/pricing');
  
  if (variant === 'badge') {
    return (
      <Badge 
        variant="secondary" 
        className={cn(
          'cursor-pointer hover:bg-primary/10 transition-colors gap-1.5',
          className
        )}
        onClick={handleClick}
      >
        <Lock className="h-2.5 w-2.5" />
        <span>{primary}</span>
      </Badge>
    );
  }
  
  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn('h-8 gap-2', className)}
        onClick={handleClick}
      >
        <Lock className="h-3 w-3" />
        {primary}
        <ArrowRight className="h-3 w-3" />
      </Button>
    );
  }
  
  // Default: inline variant
  return (
    <div 
      className={cn(
        'flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-dashed border-border/50 cursor-pointer hover:bg-muted/50 transition-colors group',
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="flex items-center gap-2">
        <Lock className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          🔒 {primary}
        </span>
      </div>
      <span className="text-xs text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {secondary}
        <ArrowRight className="h-3 w-3" />
      </span>
    </div>
  );
}
