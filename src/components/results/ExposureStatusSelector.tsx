/**
 * ExposureStatusSelector
 * 
 * Dropdown for marking exposures as Resolved / In Progress / Ignored.
 * Shows current status with color-coded badge.
 */
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, EyeOff, ChevronDown, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExposureStatus } from '@/hooks/useExposureStatuses';

interface ExposureStatusSelectorProps {
  currentStatus: ExposureStatus;
  onStatusChange: (status: ExposureStatus) => void;
  disabled?: boolean;
  compact?: boolean;
}

const STATUS_CONFIG: Record<ExposureStatus, {
  label: string;
  icon: typeof CheckCircle2;
  color: string;
  bgColor: string;
}> = {
  active: {
    label: 'Active',
    icon: Circle,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 border-green-500/30',
  },
  in_progress: {
    label: 'In Progress',
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
  },
  ignored: {
    label: 'Ignored',
    icon: EyeOff,
    color: 'text-muted-foreground/60',
    bgColor: 'bg-muted/30 border-muted-foreground/20',
  },
};

export function ExposureStatusSelector({
  currentStatus,
  onStatusChange,
  disabled = false,
  compact = false,
}: ExposureStatusSelectorProps) {
  const [open, setOpen] = useState(false);
  const config = STATUS_CONFIG[currentStatus];
  const Icon = config.icon;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={cn(
            'gap-1.5 h-7 px-2 text-xs font-medium border',
            config.bgColor,
            config.color,
            compact && 'h-6 px-1.5 text-[10px]'
          )}
        >
          <Icon className={cn('h-3 w-3', compact && 'h-2.5 w-2.5')} />
          {!compact && config.label}
          <ChevronDown className={cn('h-3 w-3 opacity-50', compact && 'h-2.5 w-2.5')} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {(Object.entries(STATUS_CONFIG) as [ExposureStatus, typeof config][]).map(([status, cfg]) => {
          const ItemIcon = cfg.icon;
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => {
                onStatusChange(status);
                setOpen(false);
              }}
              className={cn(
                'gap-2 text-xs cursor-pointer',
                currentStatus === status && 'bg-accent'
              )}
            >
              <ItemIcon className={cn('h-3.5 w-3.5', cfg.color)} />
              <span>{cfg.label}</span>
              {currentStatus === status && (
                <CheckCircle2 className="h-3 w-3 ml-auto text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Badge showing score improvement after resolution */
export function ExposureReducedBadge({ points }: { points: number }) {
  if (points <= 0) return null;
  
  return (
    <Badge
      variant="outline"
      className="text-[10px] px-1.5 py-0 font-medium bg-green-500/10 border-green-500/30 text-green-500 animate-in fade-in-0 slide-in-from-left-2 duration-300"
    >
      Exposure Reduced +{points} points
    </Badge>
  );
}
