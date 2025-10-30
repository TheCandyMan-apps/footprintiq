import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, ChevronLeft, Sparkles, CheckCircle2, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
}

interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

interface RightRailProps {
  aiSummary?: string;
  tasks?: Task[];
  notifications?: Notification[];
  loading?: boolean;
}

export function RightRail({ 
  aiSummary, 
  tasks = [], 
  notifications = [],
  loading 
}: RightRailProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="w-12 border-l border-border bg-card">
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-12"
          onClick={() => setCollapsed(false)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-border bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold">Insights</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(true)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="p-4 space-y-6">
          {/* AI Summary */}
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                What Changed?
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-4/5" />
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {aiSummary || 'No changes detected in the selected time period.'}
                </p>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Tasks */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              My Tasks
            </h3>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending tasks</p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <Card 
                    key={task.id} 
                    className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        {task.dueDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Due {task.dueDate}
                          </p>
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'shrink-0',
                          task.priority === 'high' && 'border-destructive text-destructive',
                          task.priority === 'medium' && 'border-primary text-primary',
                          task.priority === 'low' && 'border-muted-foreground text-muted-foreground'
                        )}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Notifications */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
              {notifications.filter(n => !n.read).length > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {notifications.filter(n => !n.read).length}
                </Badge>
              )}
            </h3>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No new notifications</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <Card 
                    key={notif.id} 
                    className={cn(
                      'p-3 cursor-pointer transition-colors',
                      notif.read ? 'opacity-60' : 'bg-primary/5 hover:bg-primary/10'
                    )}
                  >
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
