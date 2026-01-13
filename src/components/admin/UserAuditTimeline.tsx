import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Search, 
  CreditCard, 
  Activity, 
  Building2,
  Loader2, 
  CheckCircle,
  XCircle,
  Clock,
  Gift,
  Coins,
  ScanSearch,
  Plus,
  History,
  Filter,
  ChevronDown
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserAuditTimelineProps {
  userId: string;
  userEmail: string;
}

type TimelineEventType = 'scan' | 'credit' | 'workspace' | 'activity';

interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: Date;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  status?: 'success' | 'pending' | 'failed' | 'info';
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const eventTypeConfig: Record<TimelineEventType, { icon: React.ElementType; color: string; label: string }> = {
  scan: { icon: ScanSearch, color: 'text-blue-500', label: 'Scan' },
  credit: { icon: Coins, color: 'text-amber-500', label: 'Credit' },
  workspace: { icon: Building2, color: 'text-purple-500', label: 'Workspace' },
  activity: { icon: Activity, color: 'text-muted-foreground', label: 'Activity' },
};

export function UserAuditTimeline({ userId, userEmail }: UserAuditTimelineProps) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<TimelineEventType[]>(['scan', 'credit', 'workspace', 'activity']);

  useEffect(() => {
    fetchTimelineData();
  }, [userId]);

  const fetchTimelineData = async () => {
    setLoading(true);
    const allEvents: TimelineEvent[] = [];

    try {
      // Get user's workspaces
      const { data: workspacesData } = await supabase
        .from('workspaces')
        .select('id, name, created_at, plan, subscription_tier')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      // Add workspace creation events
      workspacesData?.forEach(ws => {
        allEvents.push({
          id: `ws-${ws.id}`,
          type: 'workspace',
          timestamp: new Date(ws.created_at),
          title: 'Workspace created',
          description: ws.name,
          badge: ws.plan || ws.subscription_tier || 'free',
          badgeVariant: 'secondary',
          status: 'success',
        });
      });

      const workspaceIds = workspacesData?.map(w => w.id) || [];

      if (workspaceIds.length > 0) {
        // Get scans
        const { data: scansData } = await supabase
          .from('scans')
          .select('id, scan_type, username, email, phone, status, created_at, completed_at')
          .in('workspace_id', workspaceIds)
          .order('created_at', { ascending: false })
          .limit(100);

        scansData?.forEach(scan => {
          const target = scan.username || scan.email || scan.phone || 'Unknown';
          allEvents.push({
            id: `scan-${scan.id}`,
            type: 'scan',
            timestamp: new Date(scan.created_at),
            title: `${scan.scan_type} scan`,
            description: target,
            badge: scan.status,
            badgeVariant: scan.status === 'completed' ? 'default' : scan.status === 'failed' ? 'destructive' : 'secondary',
            status: scan.status === 'completed' ? 'success' : scan.status === 'failed' ? 'failed' : 'pending',
          });
        });

        // Get credit transactions
        const { data: creditsData } = await supabase
          .from('credits_ledger')
          .select('id, delta, reason, created_at, meta')
          .in('workspace_id', workspaceIds)
          .order('created_at', { ascending: false })
          .limit(100);

        creditsData?.forEach(tx => {
          const isGrant = tx.delta > 0;
          const meta = tx.meta as Record<string, any> | null;
          const isGoodwill = meta?.description?.toLowerCase().includes('goodwill') || 
                            meta?.type === 'admin_grant';
          allEvents.push({
            id: `credit-${tx.id}`,
            type: 'credit',
            timestamp: new Date(tx.created_at),
            title: isGoodwill ? 'Goodwill credits granted' : isGrant ? 'Credits added' : 'Credits spent',
            description: tx.reason + (meta?.description ? ` - ${meta.description}` : ''),
            badge: `${tx.delta > 0 ? '+' : ''}${tx.delta}`,
            badgeVariant: tx.delta > 0 ? 'default' : 'destructive',
            status: isGrant ? 'success' : 'info',
            metadata: meta || undefined,
          });
        });
      }

      // Get activity logs
      const { data: activityData } = await supabase
        .from('activity_logs')
        .select('id, action, entity_type, entity_id, metadata, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      activityData?.forEach(log => {
        const metadata = log.metadata as Record<string, any> | null;
        allEvents.push({
          id: `activity-${log.id}`,
          type: 'activity',
          timestamp: new Date(log.created_at),
          title: log.action.replace(/_/g, ' ').replace(/\./g, ' › '),
          description: `${log.entity_type}${log.entity_id ? ` (${log.entity_id.slice(0, 8)}...)` : ''}`,
          badge: log.entity_type,
          badgeVariant: 'outline',
          status: 'info',
          metadata: metadata || undefined,
        });
      });

      // Also check audit_activity for workspace-level events
      if (workspaceIds.length > 0) {
        const { data: auditData } = await supabase
          .from('audit_activity')
          .select('id, action, meta, created_at')
          .in('workspace_id', workspaceIds)
          .order('created_at', { ascending: false })
          .limit(50);

        auditData?.forEach(log => {
          const meta = log.meta as Record<string, any> | null;
          // Avoid duplicates - skip if we already have this event from activity_logs
          if (!allEvents.some(e => e.title.toLowerCase().includes(log.action.toLowerCase()) && 
              Math.abs(e.timestamp.getTime() - new Date(log.created_at).getTime()) < 1000)) {
            allEvents.push({
              id: `audit-${log.id}`,
              type: 'activity',
              timestamp: new Date(log.created_at),
              title: log.action.replace(/_/g, ' '),
              description: meta?.description || JSON.stringify(meta || {}).slice(0, 50),
              badge: 'audit',
              badgeVariant: 'outline',
              status: 'info',
              metadata: meta || undefined,
            });
          }
        });
      }

      // Sort all events by timestamp descending
      allEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesType = selectedTypes.includes(event.type);
      const matchesSearch = searchQuery === '' || 
        (event.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [events, selectedTypes, searchQuery]);

  const toggleType = (type: TimelineEventType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'failed':
        return <XCircle className="h-3 w-3 text-destructive" />;
      case 'pending':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      default:
        return null;
    }
  };

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    filteredEvents.forEach(event => {
      const dateKey = format(event.timestamp, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });
    return groups;
  }, [filteredEvents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="h-4 w-4 mr-1" />
              Filter
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(eventTypeConfig) as TimelineEventType[]).map(type => {
              const config = eventTypeConfig[type];
              const Icon = config.icon;
              return (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() => toggleType(type)}
                >
                  <Icon className={`h-4 w-4 mr-2 ${config.color}`} />
                  {config.label}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(eventTypeConfig) as TimelineEventType[]).map(type => {
          const config = eventTypeConfig[type];
          const Icon = config.icon;
          const count = events.filter(e => e.type === type).length;
          return (
            <div key={type} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border">
              <Icon className={`h-4 w-4 ${config.color}`} />
              <div className="text-sm">
                <span className="font-medium">{count}</span>
                <span className="text-muted-foreground ml-1">{config.label}s</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      <ScrollArea className="h-[400px] pr-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No events found
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            
            {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
              <div key={dateKey} className="mb-6">
                {/* Date header */}
                <div className="flex items-center gap-2 mb-3 ml-8">
                  <Badge variant="outline" className="text-xs font-normal">
                    {format(new Date(dateKey), 'MMM d, yyyy')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Day's events */}
                {dayEvents.map((event, idx) => {
                  const config = eventTypeConfig[event.type];
                  const Icon = config.icon;
                  
                  return (
                    <div key={event.id} className="relative flex items-start gap-3 mb-3 group">
                      {/* Timeline dot */}
                      <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 ${
                        event.status === 'success' ? 'border-green-500' :
                        event.status === 'failed' ? 'border-destructive' :
                        event.status === 'pending' ? 'border-yellow-500' :
                        'border-border'
                      }`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      
                      {/* Event content */}
                      <div className="flex-1 min-w-0 py-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{event.title}</span>
                          {getStatusIcon(event.status)}
                          {event.badge && (
                            <Badge variant={event.badgeVariant} className="text-xs">
                              {event.badge}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          {event.description}
                        </div>
                        <div className="text-xs text-muted-foreground/70 mt-0.5">
                          {format(event.timestamp, 'HH:mm:ss')} • {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// Dialog wrapper for easy integration
export function UserAuditTimelineDialog({ userId, userEmail, trigger }: UserAuditTimelineProps & { trigger?: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <History className="h-4 w-4 mr-1" />
            Audit Timeline
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Audit Timeline
          </DialogTitle>
          <DialogDescription>
            Complete activity history for {userEmail}
          </DialogDescription>
        </DialogHeader>
        <UserAuditTimeline userId={userId} userEmail={userEmail} />
      </DialogContent>
    </Dialog>
  );
}
