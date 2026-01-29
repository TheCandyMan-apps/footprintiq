/**
 * TimelinePreview Component
 * 
 * A read-only timeline preview for Free users.
 * Shows real timeline data but disables interactions
 * like hover details, click-through, and filtering.
 */

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, Clock, User, Shield, 
  Activity, Eye, Lock, ArrowRight
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { ScanResult } from '@/hooks/useScanResultsData';
import { cn } from '@/lib/utils';

// Maximum events to display in preview mode
const PREVIEW_EVENT_LIMIT = 8;

type TimelineEventType = 'account_created' | 'last_activity' | 'breach_detected' | 'profile_updated';

interface TimelineEvent {
  id: string;
  date: Date;
  type: TimelineEventType;
  platform: string;
  title: string;
}

const EVENT_CONFIG: Record<TimelineEventType, { 
  icon: typeof Calendar; 
  colors: { bg: string; text: string; border: string }; 
  label: string 
}> = {
  account_created: {
    icon: User,
    colors: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', border: 'border-green-500/20' },
    label: 'Account Created'
  },
  last_activity: {
    icon: Activity,
    colors: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
    label: 'Last Activity'
  },
  breach_detected: {
    icon: Shield,
    colors: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/20' },
    label: 'Breach Detected'
  },
  profile_updated: {
    icon: Eye,
    colors: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
    label: 'Profile Updated'
  },
};

// Parse various date formats
function parseDate(input: any): Date | null {
  if (!input) return null;

  if (input instanceof Date && isValid(input)) {
    return input;
  }

  if (typeof input === 'number') {
    const ts = input > 1e12 ? input : input * 1000;
    const d = new Date(ts);
    return isValid(d) ? d : null;
  }

  if (typeof input === 'string') {
    try {
      const d = parseISO(input);
      if (isValid(d)) return d;
    } catch {}

    try {
      const d = new Date(input);
      if (isValid(d)) return d;
    } catch {}

    const yearMatch = input.match(/\b(20\d{2}|19\d{2})\b/);
    if (yearMatch) {
      return new Date(parseInt(yearMatch[1]), 0, 1);
    }
  }

  return null;
}

// Extract timeline events from scan results
function extractTimelineEvents(results: ScanResult[], username: string): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  results.forEach(result => {
    const meta = (result.meta || result.metadata || {}) as Record<string, any>;
    const platform = result.site || 'Unknown';

    // Account creation date
    const createdDate = meta.created_at || meta.joined || meta.registered || meta.member_since;
    if (createdDate) {
      const parsed = parseDate(createdDate);
      if (parsed) {
        events.push({
          id: `${result.id}-created`,
          date: parsed,
          type: 'account_created',
          platform,
          title: `Account created on ${platform}`,
        });
      }
    }

    // Last activity
    const lastSeen = meta.last_seen || meta.last_active || meta.last_login || meta.updated_at;
    if (lastSeen) {
      const parsed = parseDate(lastSeen);
      if (parsed) {
        events.push({
          id: `${result.id}-activity`,
          date: parsed,
          type: 'last_activity',
          platform,
          title: `Last activity on ${platform}`,
        });
      }
    }

    // Breach dates
    const breachDate = meta.breach_date || meta.pwned_date || meta.leak_date;
    if (breachDate) {
      const parsed = parseDate(breachDate);
      if (parsed) {
        events.push({
          id: `${result.id}-breach`,
          date: parsed,
          type: 'breach_detected',
          platform,
          title: `Data breach on ${platform}`,
        });
      }
    }
  });

  // Sort by date descending
  return events.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Group events by year
function groupEventsByYear(events: TimelineEvent[]): Map<number, TimelineEvent[]> {
  const grouped = new Map<number, TimelineEvent[]>();
  
  events.forEach(event => {
    const year = event.date.getFullYear();
    if (!grouped.has(year)) {
      grouped.set(year, []);
    }
    grouped.get(year)!.push(event);
  });

  return grouped;
}

interface TimelinePreviewProps {
  results: ScanResult[];
  username: string;
  onUpgradeClick: () => void;
  className?: string;
}

export function TimelinePreview({
  results,
  username,
  onUpgradeClick,
  className,
}: TimelinePreviewProps) {
  // Extract timeline events
  const allEvents = useMemo(() => extractTimelineEvents(results, username), [results, username]);
  const previewEvents = allEvents.slice(0, PREVIEW_EVENT_LIMIT);
  const hiddenCount = Math.max(0, allEvents.length - PREVIEW_EVENT_LIMIT);

  // Group by year for display
  const groupedEvents = useMemo(() => groupEventsByYear(previewEvents), [previewEvents]);
  const sortedYears = Array.from(groupedEvents.keys()).sort((a, b) => b - a);

  // Event type counts for summary
  const eventCounts = useMemo(() => {
    const counts: Record<TimelineEventType, number> = {
      account_created: 0,
      last_activity: 0,
      breach_detected: 0,
      profile_updated: 0,
    };
    allEvents.forEach(e => counts[e.type]++);
    return counts;
  }, [allEvents]);

  const hasBreaches = eventCounts.breach_detected > 0;

  if (allEvents.length === 0) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-4 text-center">
          <div className="w-10 h-10 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No timeline data found for this identity.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          {/* Summary badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              {allEvents.length} event{allEvents.length !== 1 ? 's' : ''}
            </Badge>
            {hasBreaches && (
              <Badge variant="destructive" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                {eventCounts.breach_detected} breach{eventCounts.breach_detected !== 1 ? 'es' : ''}
              </Badge>
            )}
            {eventCounts.account_created > 0 && (
              <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400">
                <User className="w-3 h-3 mr-1" />
                {eventCounts.account_created} account{eventCounts.account_created !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Timeline - Read-only, no interactions */}
          <div className="relative pl-4 border-l-2 border-border/50 space-y-4 pointer-events-none select-none">
            {sortedYears.map(year => {
              const yearEvents = groupedEvents.get(year) || [];
              
              return (
                <div key={year}>
                  {/* Year marker */}
                  <div className="flex items-center gap-2 mb-2 -ml-[21px]">
                    <div className="w-3 h-3 rounded-full bg-primary border-2 border-background" />
                    <span className="text-sm font-semibold text-foreground">{year}</span>
                  </div>
                  
                  {/* Events for this year */}
                  <div className="space-y-2 ml-2">
                    {yearEvents.map(event => {
                      const config = EVENT_CONFIG[event.type];
                      const Icon = config.icon;
                      
                      return (
                        <div 
                          key={event.id}
                          className={cn(
                            'flex items-center gap-2 p-2 rounded-md border',
                            config.colors.bg,
                            config.colors.border
                          )}
                        >
                          <div className={cn('p-1 rounded', config.colors.bg)}>
                            <Icon className={cn('w-3 h-3', config.colors.text)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{event.title}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {format(event.date, 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Preview mode overlay */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Preview mode — Pro unlocks detailed timeline analysis
              </span>
            </div>
            
            {hiddenCount > 0 && (
              <p className="text-xs text-muted-foreground text-center mb-3">
                {hiddenCount} more event{hiddenCount !== 1 ? 's' : ''} hidden
              </p>
            )}
            
            <Button 
              onClick={onUpgradeClick}
              size="sm"
              className="w-full gap-2"
            >
              <Lock className="h-3.5 w-3.5" />
              Unlock Pro for full timeline
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TimelinePreview;
