import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { Badge } from '@/components/ui/badge';
import { Activity, Shield, LogIn, UserCog, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

const actionIcons: Record<string, any> = {
  'auth.login': LogIn,
  'auth.logout': LogIn,
  'user.updated': UserCog,
  'security.alert': AlertTriangle,
  default: Activity,
};

const actionColors: Record<string, string> = {
  'auth.login': 'bg-green-500/10 text-green-500',
  'auth.logout': 'bg-blue-500/10 text-blue-500',
  'user.updated': 'bg-purple-500/10 text-purple-500',
  'security.alert': 'bg-red-500/10 text-red-500',
  default: 'bg-gray-500/10 text-gray-500',
};

export function ActivityLogs() {
  const { logs, loading } = useActivityLogs();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Activity Logs
          </CardTitle>
          <CardDescription>Loading activity logs...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Activity Logs
        </CardTitle>
        <CardDescription>
          Track user actions, login history, and security events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {logs?.map((log) => {
              const Icon = actionIcons[log.action] || actionIcons.default;
              const colorClass = actionColors[log.action] || actionColors.default;

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                >
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {(log as any).profile?.email || 'Unknown user'}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {log.ip_address && (
                        <Badge variant="outline" className="font-mono">
                          IP: {log.ip_address}
                        </Badge>
                      )}
                      {log.entity_type && (
                        <Badge variant="outline">
                          {log.entity_type}
                        </Badge>
                      )}
                    </div>

                    {log.user_agent && (
                      <p className="text-xs text-muted-foreground truncate">
                        {log.user_agent}
                      </p>
                    )}

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View metadata
                        </summary>
                        <pre className="mt-2 p-2 rounded bg-muted overflow-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
