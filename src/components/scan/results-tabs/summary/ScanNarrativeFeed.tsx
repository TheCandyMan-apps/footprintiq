import React from 'react';
import { Search, Check, Database, Shield, AlertTriangle, Loader2, Link2, Timer, Activity, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import type { NarrativeItem } from '@/hooks/useScanNarrative';

interface ScanNarrativeFeedProps {
  items: NarrativeItem[];
  summary: string;
  isLoading?: boolean;
  isComplete?: boolean;
  estimatedTimeRemaining?: string;
  variant?: 'default' | 'compact';
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

export function ScanNarrativeFeed({ 
  items, 
  summary, 
  isLoading, 
  isComplete, 
  estimatedTimeRemaining,
  variant = 'default'
}: ScanNarrativeFeedProps) {
  const isCompact = variant === 'compact';
  const isMobile = useIsMobile();

  if (isLoading && items.length === 0) {
    return (
      <div className={cn(
        "rounded-md bg-muted/15 border border-border/30",
        isCompact ? "p-2" : "p-2.5"
      )}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="text-[10px]">Initializing scan...</span>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !summary) {
    return null;
  }

  return (
    <div className={cn(
      "rounded-md border overflow-hidden",
      isCompact ? "border-border/20" : "border-border/30"
    )}>
      {/* Mobile label above header */}
      {isMobile && (
        <div className="px-2.5 pt-1.5 pb-0">
          <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40 leading-none">
            Analysis Process
          </span>
        </div>
      )}

      {/* Header bar */}
      <div className={cn(
        "flex items-center justify-between border-b border-border/20",
        isCompact ? "px-2 py-1" : "px-2.5 py-1.5",
        isMobile ? "bg-muted/7" : "bg-muted/20"
      )}>
        <h4 className={cn(
          "font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1",
          isCompact ? "text-[9px]" : "text-[10px]"
        )}>
          {isComplete ? (
            <>
              <CheckCircle2 className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
              What We Did
            </>
          ) : (
            <>
              <Activity className="w-2.5 h-2.5" />
              Investigation Progress
            </>
          )}
        </h4>
        <div className="flex items-center gap-1.5">
          {/* ETA Badge */}
          {!isComplete && estimatedTimeRemaining && (
            <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 bg-muted/40 px-1 py-0.5 rounded">
              <Timer className="w-2 h-2" />
              ~{estimatedTimeRemaining}
            </span>
          )}
          {!isComplete && (
            <span className="flex items-center gap-0.5">
              <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] text-green-600 dark:text-green-400 font-medium">Live</span>
            </span>
          )}
        </div>
      </div>

      {/* Timeline items - compact feed */}
      <div className={cn(
        "space-y-0",
        isCompact ? "px-2 py-1" : "px-2.5 py-1.5"
      )}>
        {items.map((item, index) => {
          const Icon = iconMap[item.icon] || Check;
          const isActive = item.isActive;
          const isLast = index === items.length - 1 && isComplete;
          const isCompleted = !isActive && !isLast;

          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-2 rounded transition-all duration-200',
                isCompact ? "py-0.5 px-1 -mx-1" : "py-1 px-1.5 -mx-1.5",
                isActive && 'bg-primary/5',
                /* Mobile: reduce completed step opacity */
                isCompleted && isMobile && 'opacity-50',
                isCompleted && !isMobile && 'opacity-70',
                (isLast || isActive) && 'opacity-100'
              )}
            >
              {/* Icon with status indicator */}
              <div className={cn(
                'rounded-full flex items-center justify-center shrink-0',
                isCompact ? 'w-4 h-4' : 'w-5 h-5',
                isActive ? 'bg-primary/15 text-primary' : 
                isLast ? 'bg-green-500/15 text-green-600 dark:text-green-400' :
                'bg-muted/40 text-muted-foreground'
              )}>
                {/* Mobile: show check icon for completed steps */}
                {isCompleted && isMobile ? (
                  <Check className={cn(isCompact ? 'w-2 h-2' : 'w-2.5 h-2.5', 'text-green-600/60 dark:text-green-400/60')} />
                ) : (
                  <Icon className={cn(
                    isCompact ? 'w-2 h-2' : 'w-2.5 h-2.5',
                    isActive && item.icon === 'loader' && 'animate-spin'
                  )} />
                )}
              </div>

              {/* Text */}
              <span className={cn(
                'flex-1 leading-tight',
                isCompact ? 'text-[10px]' : 'text-[11px]',
                isActive && 'text-foreground font-medium',
                isLast && 'text-foreground font-medium',
                !isActive && !isLast && 'text-muted-foreground'
              )}>
                {item.text}
              </span>

              {/* Per-provider ETA */}
              {isActive && item.eta && (
                <span className="text-[9px] text-muted-foreground/60 tabular-nums flex items-center gap-0.5 shrink-0">
                  <Timer className="w-2 h-2" />
                  {item.eta}
                </span>
              )}

              {/* Timestamp (completed items) */}
              {item.timestamp && !item.eta && !isActive && (
                <span className="text-[9px] text-muted-foreground/50 tabular-nums shrink-0">
                  {item.timestamp}
                </span>
              )}

              {/* Findings count badge */}
              {item.findingsCount !== undefined && item.findingsCount > 0 && (
                <span className={cn(
                  "font-medium text-primary bg-primary/10 rounded shrink-0",
                  isCompact ? "text-[8px] px-1 py-0" : "text-[9px] px-1.5 py-0.5"
                )}>
                  +{item.findingsCount}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary - only show if complete and not compact */}
      {summary && isComplete && !isCompact && (
        <div className="px-2.5 py-1.5 border-t border-border/20 bg-muted/10">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {summary}
          </p>
        </div>
      )}
    </div>
  );
}