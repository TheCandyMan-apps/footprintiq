import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, User, UserCheck, Shield } from 'lucide-react';

export type QuickFilterOption = 'all' | 'high_confidence' | 'low_confidence' | 'claimed' | 'unclaimed' | 'verified';

interface FilterCounts {
  all: number;
  high_confidence: number;
  low_confidence: number;
  claimed: number;
  unclaimed: number;
  verified: number;
}

interface AccountFiltersProps {
  activeFilter: QuickFilterOption;
  onFilterChange: (filter: QuickFilterOption) => void;
  counts: FilterCounts;
}

const FILTER_CONFIG: Record<QuickFilterOption, { label: string; icon: typeof CheckCircle }> = {
  all: { label: 'All', icon: User },
  high_confidence: { label: 'High Conf', icon: CheckCircle },
  low_confidence: { label: 'Low Conf', icon: AlertTriangle },
  claimed: { label: 'Claimed', icon: UserCheck },
  unclaimed: { label: 'Unclaimed', icon: User },
  verified: { label: 'Verified', icon: Shield },
};

export function AccountFilters({ activeFilter, onFilterChange, counts }: AccountFiltersProps) {
  return (
    <div
      className={cn(
        // Mobile: horizontal scroll, no wrap, hide scrollbar
        'flex items-center gap-1.5 py-1 overflow-x-auto scrollbar-hide',
        // Desktop: wrap normally
        'md:flex-wrap md:overflow-x-visible md:gap-1 md:py-0.5'
      )}
    >
      {(Object.entries(FILTER_CONFIG) as [QuickFilterOption, typeof FILTER_CONFIG['all']][]).map(([key, config]) => {
        const count = counts[key];
        const isActive = activeFilter === key;
        const Icon = config.icon;
        
        // Hide filters with 0 count (except 'all')
        if (count === 0 && key !== 'all') return null;

        return (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className={cn(
              // Mobile: larger thumb-friendly chips with 44px min-height
              'inline-flex items-center gap-1 px-3 min-h-[44px] rounded-full text-xs font-medium transition-colors shrink-0',
              'border whitespace-nowrap',
              // Desktop: revert to compact size
              'md:px-1.5 md:min-h-0 md:py-0.5 md:text-[10px] md:gap-0.5',
              isActive 
                ? 'bg-primary/15 text-primary border-primary/40 md:bg-primary md:text-primary-foreground md:border-primary' 
                : 'bg-background text-muted-foreground border-border/50 hover:bg-accent/40 hover:text-foreground'
            )}
          >
            <Icon className="w-3.5 h-3.5 md:w-2.5 md:h-2.5" />
            <span>{config.label}</span>
            <span className={cn(
              'text-[10px] ml-0.5 md:text-[9px]',
              isActive ? 'text-primary/70 md:text-primary-foreground/70' : 'text-muted-foreground/60'
            )}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
