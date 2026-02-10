import { Badge } from '@/components/ui/badge';
import { CheckCircle, HelpCircle, AlertTriangle, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type LensStatus = 'verified' | 'likely' | 'unclear' | 'pending' | null;

interface LensStatusBadgeProps {
  status: LensStatus;
  score?: number;
  className?: string;
  compact?: boolean;
}

function getStatusFromScore(score: number): Exclude<LensStatus, 'pending' | null> {
  if (score >= 75) return 'verified';
  if (score >= 50) return 'likely';
  return 'unclear';
}

const STATUS_CONFIG = {
  verified: {
    label: 'Identity Confirmed',
    shortLabel: 'Confirmed',
    icon: CheckCircle,
    className: 'bg-green-500/15 text-green-600 border-green-500/30 dark:text-green-400',
  },
  likely: {
    label: 'Probable Match',
    shortLabel: 'Probable',
    icon: HelpCircle,
    className: 'bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400',
  },
  unclear: {
    label: 'Insufficient Evidence',
    shortLabel: 'Unconfirmed',
    icon: AlertTriangle,
    className: 'bg-muted text-muted-foreground border-border',
  },
  pending: {
    label: 'Analysing',
    shortLabel: 'Analysing',
    icon: Loader2,
    className: 'bg-primary/10 text-primary border-primary/30',
  },
};

export function LensStatusBadge({ status, score, className, compact = false }: LensStatusBadgeProps) {
  // Derive status from score if score is provided and status is not 'pending'
  const effectiveStatus = status === 'pending' ? 'pending' : (score !== undefined ? getStatusFromScore(score) : status);
  
  if (!effectiveStatus) return null;

  const config = STATUS_CONFIG[effectiveStatus];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'gap-1 font-medium',
        compact ? 'h-5 px-1.5 text-[10px]' : 'h-6 px-2 text-xs',
        config.className,
        className
      )}
    >
      <Icon className={cn(
        compact ? 'w-2.5 h-2.5' : 'w-3 h-3',
        effectiveStatus === 'pending' && 'animate-spin'
      )} />
      {!compact && <span>{compact ? config.shortLabel : config.label}</span>}
      {score !== undefined && effectiveStatus !== 'pending' && (
        <span className="opacity-70">{score}%</span>
      )}
    </Badge>
  );
}
