import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Bug } from 'lucide-react';
import type { ScanLog } from '@/hooks/useUsernameScan';

interface UsernameScanDebugProps {
  logs: ScanLog[];
  onClear: () => void;
}

export const UsernameScanDebug = ({ logs, onClear }: UsernameScanDebugProps) => {
  if (logs.length === 0) return null;

  return (
    <Card className="p-4 space-y-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Debug Console</h3>
          <Badge variant="secondary" className="text-xs">
            {logs.length} events
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      <ScrollArea className="h-48 w-full rounded-md border bg-background p-3">
        <div className="space-y-2">
          {logs.map((log, idx) => (
            <div
              key={idx}
              className="text-xs font-mono flex items-start gap-2 border-b border-border/50 pb-2 last:border-0"
            >
              <span className="text-muted-foreground shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <Badge
                variant={
                  log.level === 'error'
                    ? 'destructive'
                    : log.level === 'warn'
                    ? 'secondary'
                    : 'outline'
                }
                className="text-xs shrink-0"
              >
                {log.level}
              </Badge>
              {log.provider && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  {log.provider}
                </Badge>
              )}
              <span className="flex-1">{log.message}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
