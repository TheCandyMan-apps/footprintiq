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
    <Card
      className={cn(
        'p-6 bg-gradient-card border-border transition-all',
        onClick && 'cursor-pointer hover:shadow-glow hover:border-primary/50'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        <Icon className="w-5 h-5 text-primary opacity-70" />
      </div>

      {loading ? (
        <div className="h-9 w-24 animate-pulse bg-muted rounded" />
      ) : (
        <>
          <div className="text-3xl font-bold mb-2">{formattedValue}</div>
          
          {deltaInfo && (
            <Badge variant="secondary" className={cn('gap-1', deltaInfo.color)}>
              <span className="text-sm">{deltaInfo.icon}</span>
              <span>{deltaInfo.text}</span>
              <span className="text-xs text-muted-foreground">vs prev</span>
            </Badge>
          )}
        </>
      )}
    </Card>
  );
}
