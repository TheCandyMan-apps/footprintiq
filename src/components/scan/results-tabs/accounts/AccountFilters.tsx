import { Badge } from '@/components/ui/badge';
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
    <div className="flex flex-wrap items-center gap-1.5 py-1">
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
              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors',
              'border hover:bg-accent/50',
              isActive 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-background text-muted-foreground border-border hover:text-foreground'
            )}
          >
            <Icon className="w-3 h-3" />
            <span>{config.label}</span>
            <Badge 
              variant="secondary" 
              className={cn(
                'h-4 px-1 text-[10px] ml-0.5',
                isActive && 'bg-primary-foreground/20 text-primary-foreground'
              )}
            >
              {count}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
