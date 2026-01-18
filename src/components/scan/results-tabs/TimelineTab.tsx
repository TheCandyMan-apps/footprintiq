import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, Clock, AlertTriangle, User, Shield, 
  Activity, Eye, Lock, Info, ChevronDown, ChevronUp,
  Download, Filter
} from 'lucide-react';
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { ScanResult } from '@/hooks/useScanResultsData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface TimelineTabProps {
  scanId: string;
  results: ScanResult[];
  username: string;
  isPremium?: boolean;
}

type TimelineEventType = 'account_created' | 'last_activity' | 'breach_detected' | 'profile_updated';

interface TimelineEvent {
  id: string;
  date: Date;
  type: TimelineEventType;
  platform: string;
  title: string;
  description: string;
  url?: string;
  confidence: 'high' | 'medium' | 'low';
  metadata?: Record<string, any>;
}

const EVENT_CONFIG: Record<TimelineEventType, { icon: typeof Calendar; color: string; label: string }> = {
  account_created: {
    icon: User,
    color: 'text-green-600 bg-green-500/10 border-green-500/20',
    label: 'Account Created'
  },
  last_activity: {
    icon: Activity,
    color: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
    label: 'Last Activity'
  },
  breach_detected: {
    icon: Shield,
    color: 'text-red-600 bg-red-500/10 border-red-500/20',
    label: 'Breach Detected'
  },
  profile_updated: {
    icon: Eye,
    color: 'text-purple-600 bg-purple-500/10 border-purple-500/20',
    label: 'Profile Updated'
  }
};

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
          description: `Profile "${username}" was registered on this platform`,
          url: result.url,
          confidence: 'high',
          metadata: { raw_date: createdDate }
        });
      }
    }

    // Last activity / last seen
    const lastSeen = meta.last_seen || meta.last_active || meta.last_login || meta.updated_at || meta.last_post;
    if (lastSeen) {
      const parsed = parseDate(lastSeen);
      if (parsed) {
        events.push({
          id: `${result.id}-activity`,
          date: parsed,
          type: 'last_activity',
          platform,
          title: `Last activity on ${platform}`,
          description: meta.last_post ? 'Last post or update detected' : 'Most recent account activity',
          url: result.url,
          confidence: meta.last_seen ? 'high' : 'medium',
          metadata: { raw_date: lastSeen }
        });
      }
    }

    // Breach dates
    const breachDate = meta.breach_date || meta.pwned_date || meta.leak_date || meta.exposed_at;
    if (breachDate) {
      const parsed = parseDate(breachDate);
      if (parsed) {
        events.push({
          id: `${result.id}-breach`,
          date: parsed,
          type: 'breach_detected',
          platform,
          title: `Data breach involving ${platform}`,
          description: meta.breach_name 
            ? `Part of the "${meta.breach_name}" breach`
            : 'Credentials or data exposed in a security incident',
          url: result.url,
          confidence: 'high',
          metadata: { breach_name: meta.breach_name, raw_date: breachDate }
        });
      }
    }

    // Profile updates (from timestamps in metadata)
    const profileUpdated = meta.profile_updated || meta.bio_updated;
    if (profileUpdated) {
      const parsed = parseDate(profileUpdated);
      if (parsed) {
        events.push({
          id: `${result.id}-updated`,
          date: parsed,
          type: 'profile_updated',
          platform,
          title: `Profile updated on ${platform}`,
          description: 'Bio, avatar, or profile information was changed',
          url: result.url,
          confidence: 'medium',
          metadata: { raw_date: profileUpdated }
        });
      }
    }
  });

  // Sort by date descending (most recent first)
  return events.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Parse various date formats
function parseDate(input: any): Date | null {
  if (!input) return null;

  // If already a Date
  if (input instanceof Date && isValid(input)) {
    return input;
  }

  // If a number (timestamp)
  if (typeof input === 'number') {
    // Handle both seconds and milliseconds
    const ts = input > 1e12 ? input : input * 1000;
    const d = new Date(ts);
    return isValid(d) ? d : null;
  }

  // If a string
  if (typeof input === 'string') {
    // Try ISO format
    try {
      const d = parseISO(input);
      if (isValid(d)) return d;
    } catch {}

    // Try natural date parsing
    try {
      const d = new Date(input);
      if (isValid(d)) return d;
    } catch {}

    // Try extracting year (e.g., "Member since 2019")
    const yearMatch = input.match(/\b(20\d{2}|19\d{2})\b/);
    if (yearMatch) {
      return new Date(parseInt(yearMatch[1]), 0, 1);
    }
  }

  return null;
}

// Group events by year for display
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

type FilterType = 'all' | TimelineEventType;

export function TimelineTab({ scanId, results, username, isPremium = false }: TimelineTabProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  // Extract timeline events from results
  const allEvents = useMemo(() => extractTimelineEvents(results, username), [results, username]);

  // Filter events
  const filteredEvents = useMemo(() => {
    if (filter === 'all') return allEvents;
    return allEvents.filter(e => e.type === filter);
  }, [allEvents, filter]);

  // Group by year
  const groupedEvents = useMemo(() => groupEventsByYear(filteredEvents), [filteredEvents]);

  // Event type counts
  const eventCounts = useMemo(() => {
    const counts: Record<TimelineEventType, number> = {
      account_created: 0,
      last_activity: 0,
      breach_detected: 0,
      profile_updated: 0
    };
    allEvents.forEach(e => counts[e.type]++);
    return counts;
  }, [allEvents]);

  const hasEvents = allEvents.length > 0;
  const hasBreaches = eventCounts.breach_detected > 0;

  const toggleYear = (year: number) => {
    setExpandedYears(prev => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  };

  // Initialize expanded years to show recent ones
  useMemo(() => {
    if (groupedEvents.size > 0 && expandedYears.size === 0) {
      const years = Array.from(groupedEvents.keys()).sort((a, b) => b - a);
      setExpandedYears(new Set(years.slice(0, 2))); // Expand 2 most recent years
    }
  }, [groupedEvents]);

  const exportTimeline = () => {
    const csv = [
      ['Date', 'Type', 'Platform', 'Title', 'Description', 'URL', 'Confidence'],
      ...filteredEvents.map(e => [
        format(e.date, 'yyyy-MM-dd'),
        e.type,
        e.platform,
        e.title,
        e.description,
        e.url || '',
        e.confidence
      ])
    ].map(row => row.map(c => `"${c}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeline-${username}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Empty state for no timeline data
  if (!hasEvents) {
    return (
      <Card className="p-8 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">No Timeline Data Available</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We couldn't find any chronological signals for this identity. This can happen when:
            </p>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2 text-left bg-muted/50 p-4 rounded-lg">
            <li className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Platforms don't expose account creation dates publicly</span>
            </li>
            <li className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Activity timestamps aren't available in profile metadata</span>
            </li>
            <li className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>No known data breaches are associated with this identity</span>
            </li>
          </ul>
          <p className="text-xs text-muted-foreground">
            The Accounts and Connections tabs may still contain valuable information about this identity.
          </p>
        </div>
      </Card>
    );
  }

  // Limited view for free users with breaches
  if (!isPremium && hasBreaches && allEvents.length > 3) {
    const previewEvents = allEvents.slice(0, 3);

    return (
      <div className="space-y-4">
        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Identity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {previewEvents.map(event => (
              <TimelineEventCard key={event.id} event={event} />
            ))}
          </CardContent>
        </Card>

        {/* Upgrade CTA */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6 text-center space-y-4">
            <Lock className="w-10 h-10 mx-auto text-primary" />
            <div>
              <h3 className="font-semibold text-lg mb-1">
                {allEvents.length - 3} more events available
              </h3>
              <p className="text-sm text-muted-foreground">
                Upgrade to Premium to see the full chronological timeline, including 
                {hasBreaches ? ` ${eventCounts.breach_detected} breach alerts` : ''}.
              </p>
            </div>
            <Button className="gap-2">
              <Shield className="w-4 h-4" />
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with explanation */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            About This Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This timeline shows chronological signals extracted from discovered profiles for 
            "<strong>{username}</strong>". Events include account registrations, recent activity, 
            and any known data breaches. Dates are derived from platform metadata and may have 
            varying accuracy.
          </p>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(EVENT_CONFIG).map(([type, config]) => {
            const count = eventCounts[type as TimelineEventType];
            if (count === 0) return null;
            const Icon = config.icon;
            return (
              <Badge
                key={type}
                variant={filter === type ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-colors gap-1.5',
                  filter !== type && config.color
                )}
                onClick={() => setFilter(filter === type ? 'all' : type as FilterType)}
              >
                <Icon className="w-3 h-3" />
                {config.label} ({count})
              </Badge>
            );
          })}
        </div>

        <div className="flex gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
            <SelectTrigger className="w-[160px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events ({allEvents.length})</SelectItem>
              {Object.entries(EVENT_CONFIG).map(([type, config]) => (
                <SelectItem key={type} value={type}>
                  {config.label} ({eventCounts[type as TimelineEventType]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportTimeline} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Timeline by Year */}
      <div className="space-y-4">
        {Array.from(groupedEvents.entries())
          .sort(([a], [b]) => b - a)
          .map(([year, events]) => {
            const isExpanded = expandedYears.has(year);
            return (
              <Collapsible key={year} open={isExpanded} onOpenChange={() => toggleYear(year)}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          {year}
                          <Badge variant="secondary" className="ml-2">
                            {events.length} event{events.length !== 1 ? 's' : ''}
                          </Badge>
                        </CardTitle>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-3">
                      {events.map(event => (
                        <TimelineEventCard key={event.id} event={event} />
                      ))}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
      </div>

      {filteredEvents.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No events match the selected filter.
          </p>
        </Card>
      )}
    </div>
  );
}

// Individual timeline event card
function TimelineEventCard({ event }: { event: TimelineEvent }) {
  const config = EVENT_CONFIG[event.type];
  const Icon = config.icon;

  return (
    <div className={cn(
      'flex items-start gap-4 p-4 rounded-lg border',
      config.color
    )}>
      <div className={cn(
        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
        event.type === 'breach_detected' ? 'bg-red-500/20' :
        event.type === 'account_created' ? 'bg-green-500/20' :
        event.type === 'last_activity' ? 'bg-blue-500/20' : 'bg-purple-500/20'
      )}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-medium text-sm">{event.title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-sm font-medium">
              {format(event.date, 'MMM d, yyyy')}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(event.date, { addSuffix: true })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {event.platform}
          </Badge>
          <Badge variant="outline" className={cn(
            'text-xs',
            event.confidence === 'high' ? 'border-green-500/50 text-green-600' :
            event.confidence === 'medium' ? 'border-yellow-500/50 text-yellow-600' :
            'border-orange-500/50 text-orange-600'
          )}>
            {event.confidence} confidence
          </Badge>
          {event.url && (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" asChild>
              <a href={event.url} target="_blank" rel="noopener noreferrer">
                View Profile
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TimelineTab;
