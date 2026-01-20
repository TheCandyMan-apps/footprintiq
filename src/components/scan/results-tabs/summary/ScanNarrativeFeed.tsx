import React from 'react';
import { Search, Check, Database, Shield, AlertTriangle, Loader2, Link2, Clock, Timer, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NarrativeItem } from '@/hooks/useScanNarrative';

interface ScanNarrativeFeedProps {
  items: NarrativeItem[];
  summary: string;
  isLoading?: boolean;
  isComplete?: boolean;
  estimatedTimeRemaining?: string;
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

export function ScanNarrativeFeed({ items, summary, isLoading, isComplete, estimatedTimeRemaining }: ScanNarrativeFeedProps) {
  if (isLoading && items.length === 0) {
    return (
      <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="text-xs">Initializing scan...</span>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !summary) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border/40 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border/30">
        <h4 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <Activity className="w-3 h-3" />
          {isComplete ? 'Investigation Steps' : 'Live Progress'}
        </h4>
        <div className="flex items-center gap-2">
          {/* ETA Badge */}
          {!isComplete && estimatedTimeRemaining && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 bg-muted/60 px-1.5 py-0.5 rounded">
              <Timer className="w-2.5 h-2.5" />
              ~{estimatedTimeRemaining}
            </span>
          )}
          {!isComplete && (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">Live</span>
            </span>
          )}
        </div>
      </div>

      {/* Timeline items - compact feed */}
      <div className="px-3 py-2 space-y-0.5">
        {items.map((item, index) => {
          const Icon = iconMap[item.icon] || Check;
          const isActive = item.isActive;
          const isLast = index === items.length - 1 && isComplete;

          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-2.5 py-1.5 px-2 -mx-2 rounded transition-all duration-200',
                isActive && 'bg-primary/5 animate-pulse-subtle',
                !isActive && !isLast && 'opacity-80',
                isLast && 'opacity-100'
              )}
            >
              {/* Icon with status indicator */}
              <div className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center shrink-0',
                isActive ? 'bg-primary/15 text-primary' : 
                isLast ? 'bg-green-500/15 text-green-600 dark:text-green-400' :
                'bg-muted/60 text-muted-foreground'
              )}>
                <Icon className={cn(
                  'w-3 h-3',
                  isActive && item.icon === 'loader' && 'animate-spin'
                )} />
              </div>

              {/* Text */}
              <span className={cn(
                'flex-1 text-xs leading-snug',
                isActive && 'text-foreground font-medium',
                isLast && 'text-foreground font-medium',
                !isActive && !isLast && 'text-muted-foreground'
              )}>
                {item.text}
              </span>

              {/* Per-provider ETA */}
              {isActive && item.eta && (
                <span className="text-[10px] text-muted-foreground/70 tabular-nums flex items-center gap-0.5 shrink-0">
                  <Timer className="w-2 h-2" />
                  {item.eta}
                </span>
              )}

              {/* Timestamp (completed items) */}
              {item.timestamp && !item.eta && !isActive && (
                <span className="text-[10px] text-muted-foreground/60 tabular-nums shrink-0">
                  {item.timestamp}
                </span>
              )}

              {/* Findings count badge */}
              {item.findingsCount !== undefined && item.findingsCount > 0 && (
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                  +{item.findingsCount}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary - only show if complete */}
      {summary && isComplete && (
        <div className="px-3 py-2 border-t border-border/30 bg-muted/10">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {summary}
          </p>
        </div>
      )}
    </div>
  );
}