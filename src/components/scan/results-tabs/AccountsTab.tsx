import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ForensicVerifyButton } from '@/components/forensic';
import { 
  ExternalLink, Search, Filter, ChevronDown, ChevronUp,
  User, Users, MessageSquare, Activity, Clock, Globe,
  CheckCircle, HelpCircle, AlertCircle, ArrowUpDown, Tag
} from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';
import { useLensAnalysis } from '@/hooks/useLensAnalysis';
import { cn } from '@/lib/utils';

interface AccountsTabProps {
  results: ScanResult[];
  jobId: string;
}

// Platform icon mapping (simplified - would use actual icons in production)
const getPlatformIcon = (platform: string) => {
  const p = platform?.toLowerCase() || '';
  if (p.includes('github') || p.includes('gitlab')) return '🐙';
  if (p.includes('twitter') || p.includes('x.com')) return '🐦';
  if (p.includes('linkedin')) return '💼';
  if (p.includes('facebook') || p.includes('meta')) return '📘';
  if (p.includes('instagram')) return '📷';
  if (p.includes('reddit')) return '🤖';
  if (p.includes('youtube')) return '▶️';
  if (p.includes('tiktok')) return '🎵';
  if (p.includes('discord')) return '💬';
  if (p.includes('telegram')) return '✈️';
  if (p.includes('pinterest')) return '📌';
  if (p.includes('medium')) return '📝';
  if (p.includes('stackoverflow')) return '📚';
  return '🌐';
};

// Get match confidence label based on LENS score
const getMatchConfidence = (score: number): { label: string; color: string; icon: typeof CheckCircle } => {
  if (score >= 80) {
    return { label: 'Likely match', color: 'text-green-600 bg-green-500/10 border-green-500/20', icon: CheckCircle };
  }
  if (score >= 60) {
    return { label: 'Possible match', color: 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20', icon: HelpCircle };
  }
  return { label: 'Weak signal', color: 'text-orange-600 bg-orange-500/10 border-orange-500/20', icon: AlertCircle };
};

// Extract metadata signals
const extractSignals = (result: ScanResult) => {
  const meta = (result.meta || result.metadata || {}) as Record<string, any>;
  const signals: Array<{ icon: typeof Users; label: string; value: string }> = [];
  
  if (meta.bio || meta.description) {
    signals.push({ icon: MessageSquare, label: 'Bio', value: 'Present' });
  }
  if (meta.followers !== undefined) {
    signals.push({ icon: Users, label: 'Followers', value: String(meta.followers) });
  }
  if (meta.following !== undefined) {
    signals.push({ icon: Users, label: 'Following', value: String(meta.following) });
  }
  if (meta.posts !== undefined || meta.tweets !== undefined) {
    signals.push({ icon: Activity, label: 'Posts', value: String(meta.posts || meta.tweets) });
  }
  if (meta.joined || meta.created_at) {
    signals.push({ icon: Clock, label: 'Joined', value: meta.joined || 'Available' });
  }
  if (meta.location) {
    signals.push({ icon: Globe, label: 'Location', value: meta.location });
  }
  
  return signals;
};

type SortOption = 'platform' | 'confidence' | 'status';

export function AccountsTab({ results, jobId }: AccountsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('confidence');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // LENS Analysis
  const lensAnalysis = useLensAnalysis(results);

  // Filter results
  const filteredResults = useMemo(() => {
    let filtered = results.filter(result => {
      const matchesSearch = searchQuery === '' || 
        result.site?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.url?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        result.status?.toLowerCase() === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort results
    filtered.sort((a, b) => {
      if (sortBy === 'platform') {
        return (a.site || '').localeCompare(b.site || '');
      }
      if (sortBy === 'confidence') {
        const scoreA = lensAnalysis.resultScores.get(a.id)?.score || 0;
        const scoreB = lensAnalysis.resultScores.get(b.id)?.score || 0;
        return scoreB - scoreA;
      }
      if (sortBy === 'status') {
        const statusOrder: Record<string, number> = { found: 0, claimed: 1, not_found: 2 };
        return (statusOrder[a.status?.toLowerCase() || ''] ?? 3) - (statusOrder[b.status?.toLowerCase() || ''] ?? 3);
      }
      return 0;
    });

    return filtered;
  }, [results, searchQuery, statusFilter, sortBy, lensAnalysis.resultScores]);

  // Count by status
  const statusCounts = useMemo(() => {
    const counts = { found: 0, claimed: 0, not_found: 0, unknown: 0 };
    results.forEach(r => {
      const status = r.status?.toLowerCase() || 'unknown';
      if (status in counts) {
        counts[status as keyof typeof counts]++;
      } else {
        counts.unknown++;
      }
    });
    return counts;
  }, [results]);

  const toggleExpanded = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters & Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search platforms or usernames..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({results.length})</SelectItem>
            <SelectItem value="found">Found ({statusCounts.found})</SelectItem>
            <SelectItem value="claimed">Claimed ({statusCounts.claimed})</SelectItem>
            <SelectItem value="not_found">Not Found ({statusCounts.not_found})</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="confidence">Confidence</SelectItem>
            <SelectItem value="platform">Platform</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats Bar */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="default" className="bg-green-600 hover:bg-green-600">
          {statusCounts.found} found
        </Badge>
        <Badge variant="secondary">
          {statusCounts.claimed} claimed
        </Badge>
        <Badge variant="outline">
          {statusCounts.not_found} not found
        </Badge>
        <span className="text-muted-foreground ml-auto">
          Showing {filteredResults.length} of {results.length}
        </span>
      </div>

      {/* Account Cards */}
      <div className="space-y-3">
        {filteredResults.length === 0 ? (
          <Card className="p-8 text-center">
            <User className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all' 
                ? 'No accounts match your filters'
                : 'No accounts found'}
            </p>
          </Card>
        ) : (
          filteredResults.map((result) => {
            const lensScore = lensAnalysis.resultScores.get(result.id);
            const score = lensScore?.score || 50;
            const matchConfidence = getMatchConfidence(score);
            const MatchIcon = matchConfidence.icon;
            const signals = extractSignals(result);
            const isExpanded = expandedCards.has(result.id);
            const meta = (result.meta || result.metadata || {}) as Record<string, any>;
            const profileImage = meta.avatar_url || meta.profile_image || meta.image;

            return (
              <Collapsible key={result.id} open={isExpanded} onOpenChange={() => toggleExpanded(result.id)}>
                <Card className={cn(
                  'overflow-hidden transition-all',
                  isExpanded && 'ring-1 ring-primary/20'
                )}>
                  <CardContent className="p-0">
                    {/* Main Card Row */}
                    <div className="flex items-center gap-4 p-4">
                      {/* Profile Image */}
                      <div className="flex-shrink-0">
                        {profileImage ? (
                          <img 
                            src={profileImage} 
                            alt={result.site || 'Profile'}
                            className="w-12 h-12 rounded-full object-cover border-2 border-border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={cn(
                          "w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl border-2 border-border",
                          profileImage && "hidden"
                        )}>
                          {getPlatformIcon(result.site)}
                        </div>
                      </div>

                      {/* Platform & Username */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">
                            {result.site || 'Unknown Platform'}
                          </span>
                          {result.status === 'found' && (
                            <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-600">
                              Active
                            </Badge>
                          )}
                          {result.status === 'claimed' && (
                            <Badge variant="secondary" className="text-xs">
                              Claimed
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {result.url ? new URL(result.url).pathname.replace(/^\//, '') || 'Profile' : 'No URL'}
                        </p>
                      </div>

                      {/* Key Signals (visible on md+) */}
                      <div className="hidden md:flex items-center gap-3">
                        {signals.slice(0, 3).map((signal, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-xs text-muted-foreground">
                            <signal.icon className="h-3 w-3" />
                            <span>{signal.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Match Confidence Badge */}
                      <div className="flex-shrink-0">
                        <Badge 
                          variant="outline" 
                          className={cn('gap-1 font-medium', matchConfidence.color)}
                        >
                          <MatchIcon className="h-3 w-3" />
                          <span className="hidden sm:inline">{matchConfidence.label}</span>
                          <span className="sm:hidden">{score}%</span>
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {result.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 w-8 p-0"
                          >
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Open profile"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <CollapsibleContent>
                      <div className="border-t bg-muted/30 p-4 space-y-4">
                        {/* Signals Grid (visible on mobile when expanded) */}
                        {signals.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                              Profile Signals
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {signals.map((signal, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 rounded-md bg-background border text-sm">
                                  <signal.icon className="h-4 w-4 text-primary" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">{signal.label}</p>
                                    <p className="font-medium">{signal.value}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Raw OSINT Fields */}
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Raw OSINT Data
                          </h4>
                          <div className="bg-background border rounded-md p-3 space-y-2 font-mono text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">id:</span>
                              <span className="truncate ml-4">{result.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">site:</span>
                              <span>{result.site}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">status:</span>
                              <span>{result.status}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">url:</span>
                              <span className="truncate ml-4 max-w-[200px]">{result.url || 'null'}</span>
                            </div>
                            {Object.keys(meta).length > 0 && (
                              <>
                                <div className="border-t pt-2 mt-2">
                                  <span className="text-muted-foreground">metadata:</span>
                                </div>
                                {Object.entries(meta).slice(0, 10).map(([key, value]) => (
                                  <div key={key} className="flex justify-between pl-4">
                                    <span className="text-muted-foreground">{key}:</span>
                                    <span className="truncate ml-4 max-w-[200px]">
                                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </span>
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center gap-2 pt-2">
                          {result.url && (
                            <ForensicVerifyButton
                              findingId={result.id}
                              url={result.url}
                              platform={result.site || 'Unknown'}
                              scanId={jobId}
                            />
                          )}
                          <Button variant="outline" size="sm" className="gap-1">
                            <Tag className="h-3 w-3" />
                            Add Tag
                          </Button>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </CardContent>
                </Card>
              </Collapsible>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AccountsTab;
