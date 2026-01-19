import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Check, Database, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NarrativeItem } from '@/hooks/useScanNarrative';

interface ScanNarrativeFeedProps {
  items: NarrativeItem[];
  summary: string;
  isLoading?: boolean;
}

const iconMap = {
  search: Search,
  check: Check,
  database: Database,
  shield: Shield,
  alert: AlertTriangle,
};

export function ScanNarrativeFeed({ items, summary, isLoading }: ScanNarrativeFeedProps) {
  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">Scan Narrative</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading scan details...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0 && !summary) {
    return null;
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">Scan Narrative</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {/* Timeline items */}
        <div className="space-y-2">
          {items.map((item, index) => {
            const Icon = iconMap[item.icon] || Check;
            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-start gap-2.5 text-sm',
                  index === 0 ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                <div className="mt-0.5 flex-shrink-0">
                  <div
                    className={cn(
                      'h-4 w-4 rounded-full flex items-center justify-center',
                      index === 0 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icon className="h-2.5 w-2.5" />
                  </div>
                </div>
                <span className={cn(index === 0 && 'font-medium')}>{item.text}</span>
              </div>
            );
          })}
        </div>

        {/* Summary paragraph */}
        {summary && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
