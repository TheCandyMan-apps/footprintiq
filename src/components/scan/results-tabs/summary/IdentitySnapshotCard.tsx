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
    <Card className="border-border/40 bg-gradient-to-r from-muted/20 to-transparent">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Identity info */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Icon container */}
            <div className="w-10 h-10 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Identity details */}
            <div className="min-w-0">
              {/* Type label + searched value */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{config.label}</span>
                <span className="text-sm font-semibold text-foreground truncate">{searchedValue}</span>
              </div>

              {/* Aliases inline */}
              {aliases.length > 0 && (
                <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground">aka:</span>
                  {aliases.slice(0, 3).map((alias, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-[9px] px-1 py-0 h-3.5 font-normal"
                    >
                      {alias}
                    </Badge>
                  ))}
                  {aliases.length > 3 && (
                    <span className="text-[9px] text-muted-foreground">+{aliases.length - 3}</span>
                  )}
                </div>
              )}

              {/* Scan metadata */}
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                {formattedTime && <span>{formattedTime}</span>}
                {formattedDuration && (
                  <>
                    <span>•</span>
                    <span>{formattedDuration}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Status and confidence - stacked compact */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {/* Status badge */}
            <div className={cn('flex items-center gap-1 text-[11px]', status.color)}>
              <StatusIcon className="h-3 w-3" />
              <span className="font-medium">{status.label}</span>
            </div>

            {/* Confidence score - inline bar */}
            {overallScore !== undefined && overallScore > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-muted-foreground">Conf.</span>
                <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
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
                <span className="text-[10px] font-medium tabular-nums w-6 text-right">{overallScore}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
