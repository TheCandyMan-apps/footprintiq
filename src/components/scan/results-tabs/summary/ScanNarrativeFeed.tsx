import React from 'react';
import { Search, Check, Database, Shield, AlertTriangle, Loader2, Link2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NarrativeItem } from '@/hooks/useScanNarrative';

interface ScanNarrativeFeedProps {
  items: NarrativeItem[];
  summary: string;
  isLoading?: boolean;
  isComplete?: boolean;
}

const iconMap = {
  search: Search,
  check: Check,
  database: Database,
  shield: Shield,
  alert: AlertTriangle,
  link: Link2,
  loader: Loader2,
};

export function ScanNarrativeFeed({ items, summary, isLoading, isComplete }: ScanNarrativeFeedProps) {
  if (isLoading && items.length === 0) {
    return (
      <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span className="text-xs">Loading scan details...</span>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !summary) {
    return null;
  }

  return (
    <div className="p-3 rounded-lg bg-muted/20 border border-border/40 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          {isComplete ? 'What we did' : "What we're doing"}
        </h4>
        {!isComplete && (
          <span className="text-[10px] text-primary font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* Timeline items - compact */}
      <div className="space-y-1">
        {items.map((item, index) => {
          const Icon = iconMap[item.icon] || Check;
          const isActive = item.isActive;
          const isFirst = index === 0;
          const isLast = index === items.length - 1 && isComplete;

          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-2 text-xs transition-all duration-300',
                isActive ? 'text-foreground font-medium bg-primary/5 -mx-1 px-1 py-0.5 rounded' : 'text-muted-foreground',
                isLast && !isActive && 'text-foreground'
              )}
            >
              {/* Icon */}
              <div className={cn(
                'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0',
                isActive ? 'bg-primary/20 text-primary' : 
                isLast ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                isFirst ? 'bg-muted text-muted-foreground' : 'bg-muted/50 text-muted-foreground'
              )}>
                <Icon className={cn(
                  'w-2.5 h-2.5',
                  isActive && item.icon === 'loader' && 'animate-spin'
                )} />
              </div>

              {/* Text */}
              <span className={cn(
                'flex-1 truncate',
                (isActive || isLast) && 'font-medium'
              )}>
                {item.text}
              </span>

              {/* Timestamp */}
              {item.timestamp && (
                <span className="text-[10px] text-muted-foreground/70 tabular-nums">
                  {item.timestamp}
                </span>
              )}

              {/* Findings count badge */}
              {item.findingsCount !== undefined && item.findingsCount > 0 && (
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  {item.findingsCount}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary - only show if complete */}
      {summary && isComplete && (
        <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 border-t border-border/30">
          {summary}
        </p>
      )}
    </div>
  );
}