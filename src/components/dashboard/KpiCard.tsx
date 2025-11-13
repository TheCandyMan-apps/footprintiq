import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpIcon } from '@/components/ui/help-icon';
import { formatNumber, formatDelta } from '@/lib/format';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: number;
  delta?: number;
  icon: LucideIcon;
  format?: 'number' | 'percent' | 'currency';
  help?: string;
  onClick?: () => void;
  loading?: boolean;
}

export function KpiCard({
  title,
  value,
  delta,
  icon: Icon,
  format = 'number',
  help,
  onClick,
  loading,
}: KpiCardProps) {
  const formattedValue = 
    format === 'percent' ? `${value}%` :
    format === 'currency' ? `$${formatNumber(value)}` :
    formatNumber(value);

  const deltaInfo = delta !== undefined ? formatDelta(delta) : null;

  return (
    <div
      className={cn(
        'relative p-6 rounded-lg backdrop-blur-xl bg-background/40 border border-border/50',
        'transition-all duration-300 ease-out',
        'shadow-[0_0_40px_hsl(280_70%_60%/0.2)]',
        onClick && 'cursor-pointer hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/50 hover:shadow-[0_0_60px_hsl(280_70%_60%/0.4)]'
      )}
      onClick={onClick}
    >
      {/* Icon with gradient background */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent rounded-lg blur-md opacity-60" />
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 backdrop-blur-sm">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-9 w-24 animate-pulse bg-muted rounded" />
      ) : (
        <>
          <div className="text-3xl font-bold mb-2 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            {formattedValue}
          </div>
          
          {deltaInfo && (
            <Badge variant="secondary" className={cn('gap-1', deltaInfo.color)}>
              <span className="text-sm">{deltaInfo.icon}</span>
              <span>{deltaInfo.text}</span>
              <span className="text-xs text-muted-foreground">vs prev</span>
            </Badge>
          )}
        </>
      )}
    </div>
  );
}
