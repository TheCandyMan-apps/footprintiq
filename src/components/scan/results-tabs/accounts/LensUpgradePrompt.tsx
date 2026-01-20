import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LensUpgradePromptProps {
  variant?: 'inline' | 'banner';
  context?: 'verify' | 'unclear';
  className?: string;
}

const COPY = {
  verify: {
    headline: 'LENS Verification available',
    description: 'Reduces false positives and confirms whether this account belongs to the same person.',
    cta: 'Upgrade to verify',
  },
  unclear: {
    headline: 'Insufficient evidence to confirm',
    description: 'LENS analysis can help determine if this account matches the identity you are investigating.',
    cta: 'Unlock LENS',
  },
};

export function LensUpgradePrompt({ 
  variant = 'inline', 
  context = 'verify',
  className 
}: LensUpgradePromptProps) {
  const navigate = useNavigate();
  const copy = COPY[context];

  const handleUpgrade = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/pricing');
  };

  if (variant === 'banner') {
    return (
      <div className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md',
        'bg-primary/5 border border-primary/20',
        className
      )}>
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-foreground">{copy.headline}</p>
          <p className="text-[10px] text-muted-foreground leading-snug">{copy.description}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2.5 text-[10px] gap-1 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary shrink-0"
          onClick={handleUpgrade}
        >
          {copy.cta}
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  // Inline variant - minimal button
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        'h-6 px-2 text-[10px] gap-1 text-primary hover:text-primary hover:bg-primary/10',
        className
      )}
      onClick={handleUpgrade}
    >
      <Sparkles className="w-3 h-3" />
      {copy.cta}
    </Button>
  );
}
