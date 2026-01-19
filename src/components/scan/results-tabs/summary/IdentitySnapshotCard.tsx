import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Globe, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface IdentitySnapshotCardProps {
  searchedValue: string;
  scanType?: 'username' | 'email' | 'phone' | 'domain' | string;
  aliases?: string[];
  overallScore?: number;
  scanTime?: string;
  scanDuration?: number;
  scanStatus?: 'completed' | 'running' | 'failed' | 'partial' | string;
}

export function IdentitySnapshotCard({
  searchedValue,
  scanType = 'username',
  aliases = [],
  overallScore,
  scanTime,
  scanDuration,
  scanStatus = 'completed',
}: IdentitySnapshotCardProps) {
  const typeConfig: Record<string, { label: string; icon: React.ElementType }> = {
    username: { label: 'Username', icon: User },
    email: { label: 'Email', icon: Mail },
    phone: { label: 'Phone', icon: Phone },
    domain: { label: 'Domain', icon: Globe },
  };

  const config = typeConfig[scanType] || typeConfig.username;
  const Icon = config.icon;

  const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    completed: { label: 'Complete', color: 'text-green-500', icon: CheckCircle2 },
    running: { label: 'Running', color: 'text-primary', icon: Clock },
    failed: { label: 'Failed', color: 'text-destructive', icon: AlertCircle },
    partial: { label: 'Partial', color: 'text-yellow-500', icon: AlertCircle },
  };

  const status = statusConfig[scanStatus] || statusConfig.completed;
  const StatusIcon = status.icon;

  const formattedTime = scanTime ? format(new Date(scanTime), 'MMM d, yyyy • HH:mm') : null;
  const formattedDuration = scanDuration ? `${(scanDuration / 1000).toFixed(1)}s` : null;

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Identity info */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Type label */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium uppercase tracking-wide">{config.label}</span>
            </div>

            {/* Searched value */}
            <div className="font-semibold text-lg text-foreground truncate">{searchedValue}</div>

            {/* Aliases */}
            {aliases.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-muted-foreground">Aliases:</span>
                {aliases.slice(0, 3).map((alias, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-4 font-normal"
                  >
                    {alias}
                  </Badge>
                ))}
                {aliases.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{aliases.length - 3}</span>
                )}
              </div>
            )}

            {/* Scan metadata */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
              {formattedTime && <span>{formattedTime}</span>}
              {formattedDuration && (
                <>
                  <span>•</span>
                  <span>{formattedDuration}</span>
                </>
              )}
            </div>
          </div>

          {/* Right: Status and confidence */}
          <div className="flex flex-col items-end gap-2">
            {/* Status badge */}
            <div className={cn('flex items-center gap-1.5 text-xs', status.color)}>
              <StatusIcon className="h-3.5 w-3.5" />
              <span className="font-medium">{status.label}</span>
            </div>

            {/* Confidence score */}
            {overallScore !== undefined && overallScore > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] text-muted-foreground text-right">Confidence</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        overallScore >= 75
                          ? 'bg-green-500'
                          : overallScore >= 50
                            ? 'bg-yellow-500'
                            : 'bg-orange-500'
                      )}
                      style={{ width: `${overallScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium tabular-nums">{overallScore}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
