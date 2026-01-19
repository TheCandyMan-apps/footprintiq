import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ForensicVerifyButton } from '@/components/forensic';
import { 
  ExternalLink, Search, Filter, ChevronRight,
  User, Users, Clock, Globe,
  CheckCircle, HelpCircle, AlertCircle, ArrowUpDown
} from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';
import { useLensAnalysis } from '@/hooks/useLensAnalysis';
import { cn } from '@/lib/utils';
import { 
  RESULTS_SPACING, 
  RESULTS_TYPOGRAPHY, 
  RESULTS_BORDERS,
  RESULTS_SEMANTIC_COLORS 
} from './styles';

interface AccountsTabProps {
  results: ScanResult[];
  jobId: string;
}

// Extract platform name from various data structures
const extractPlatformName = (result: ScanResult): string => {
  // Priority 1: Direct site field
  if (result.site && result.site !== 'Unknown') return result.site;
  
  // Priority 2: meta.platform (from Sherlock/n8n)
  const meta = (result.meta || result.metadata || {}) as Record<string, any>;
  if (meta.platform && meta.platform !== 'Unknown') return meta.platform;
  if (meta.site && meta.site !== 'Unknown') return meta.site;
  
  // Priority 3: Evidence array {key: 'site', value: 'Platform'}
  if (result.evidence && Array.isArray(result.evidence)) {
    const siteEvidence = result.evidence.find(
      (e: any) => e.key === 'site' || e.key === 'platform'
    );
    if (siteEvidence?.value) return siteEvidence.value;
  }
  
  // Priority 4: Extract from URL domain
  const url = result.url || meta.url;
  if (url) {
    try {
      const hostname = new URL(url).hostname;
      const parts = hostname.replace('www.', '').split('.');
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    } catch {}
  }
  
  // Fallback to provider name
  if (meta.provider) return meta.provider;
  
  return 'Unknown';
};

// Extract URL from various data structures
const extractUrl = (result: ScanResult): string | null => {
  if (result.url) return result.url;
  
  const meta = (result.meta || result.metadata || {}) as Record<string, any>;
  if (meta.url) return meta.url;
  
  if (result.evidence && Array.isArray(result.evidence)) {
    const urlEvidence = result.evidence.find((e: any) => e.key === 'url');
    if (urlEvidence?.value) return urlEvidence.value;
  }
  
  return null;
};

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
  if (p.includes('chaturbate') || p.includes('chatur')) return '🔞';
  if (p.includes('onlyfans')) return '💎';
  if (p.includes('twitch')) return '🎮';
  if (p.includes('spotify')) return '🎧';
  return '🌐';
};

const getMatchConfidence = (score: number) => {
  if (score >= 80) return { 
    label: 'Likely', 
    ...RESULTS_SEMANTIC_COLORS.confidenceHigh,
    icon: CheckCircle 
  };
  if (score >= 60) return { 
    label: 'Possible', 
    ...RESULTS_SEMANTIC_COLORS.confidenceMedium,
    icon: HelpCircle 
  };
  return { 
    label: 'Weak', 
    ...RESULTS_SEMANTIC_COLORS.confidenceLow,
    icon: AlertCircle 
  };
};

const extractKeyFields = (result: ScanResult): string[] => {
  const meta = (result.meta || result.metadata || {}) as Record<string, any>;
  const fields: string[] = [];

  if (meta.bio) fields.push(meta.bio.slice(0, 50) + (meta.bio.length > 50 ? '…' : ''));
  else if (meta.description) fields.push(meta.description.slice(0, 50) + (meta.description.length > 50 ? '…' : ''));
  
  if (meta.followers !== undefined) fields.push(`${meta.followers} followers`);
  if (meta.location) fields.push(meta.location);
  if (meta.joined) fields.push(`Joined ${meta.joined}`);

  return fields.slice(0, 3);
};

type SortOption = 'platform' | 'confidence' | 'status';

export function AccountsTab({ results, jobId }: AccountsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('confidence');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const lensAnalysis = useLensAnalysis(results);

  const filteredResults = useMemo(() => {
    let filtered = results.filter(result => {
      const matchesSearch = searchQuery === '' || 
        result.site?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.url?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || result.status?.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'platform') return (a.site || '').localeCompare(b.site || '');
      if (sortBy === 'confidence') {
        const scoreA = lensAnalysis.resultScores.get(a.id)?.score || 0;
        const scoreB = lensAnalysis.resultScores.get(b.id)?.score || 0;
        return scoreB - scoreA;
      }
      if (sortBy === 'status') {
        const order: Record<string, number> = { found: 0, claimed: 1, not_found: 2 };
        return (order[a.status?.toLowerCase() || ''] ?? 3) - (order[b.status?.toLowerCase() || ''] ?? 3);
      }
      return 0;
    });

    return filtered;
  }, [results, searchQuery, statusFilter, sortBy, lensAnalysis.resultScores]);

  const statusCounts = useMemo(() => {
    const counts = { found: 0, claimed: 0, not_found: 0 };
    results.forEach(r => {
      const status = r.status?.toLowerCase() || '';
      if (status in counts) counts[status as keyof typeof counts]++;
    });
    return counts;
  }, [results]);

  const toggleExpanded = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className={RESULTS_SPACING.contentMarginSm}>
      {/* Compact Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search platforms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-full sm:w-[130px] text-xs">
            <Filter className="h-3 w-3 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All ({results.length})</SelectItem>
            <SelectItem value="found" className="text-xs">Found ({statusCounts.found})</SelectItem>
            <SelectItem value="claimed" className="text-xs">Claimed ({statusCounts.claimed})</SelectItem>
            <SelectItem value="not_found" className="text-xs">Not Found ({statusCounts.not_found})</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="h-8 w-full sm:w-[120px] text-xs">
            <ArrowUpDown className="h-3 w-3 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="confidence" className="text-xs">Confidence</SelectItem>
            <SelectItem value="platform" className="text-xs">Platform</SelectItem>
            <SelectItem value="status" className="text-xs">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats */}
      <div className="flex items-center gap-2 text-xs">
        <Badge variant="default" className="h-5 px-1.5 bg-green-600 hover:bg-green-600">
          {statusCounts.found} found
        </Badge>
        <Badge variant="secondary" className="h-5 px-1.5">
          {statusCounts.claimed} claimed
        </Badge>
        <span className="text-muted-foreground ml-auto">
          {filteredResults.length} of {results.length}
        </span>
      </div>

      {/* Account Rows */}
      <div className="border rounded-lg divide-y overflow-hidden">
        {filteredResults.length === 0 ? (
          <div className="p-8 text-center">
            <User className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all' ? 'No matching accounts' : 'No accounts found'}
            </p>
          </div>
        ) : (
          filteredResults.map((result) => {
            const lensScore = lensAnalysis.resultScores.get(result.id);
            const score = lensScore?.score || 50;
            const confidence = getMatchConfidence(score);
            const ConfidenceIcon = confidence.icon;
            const keyFields = extractKeyFields(result);
            const isExpanded = expandedRows.has(result.id);
            const meta = (result.meta || result.metadata || {}) as Record<string, any>;
            const profileImage = meta.avatar_url || meta.profile_image || meta.image;
            const platformName = extractPlatformName(result);
            const profileUrl = extractUrl(result);

            return (
              <Collapsible key={result.id} open={isExpanded} onOpenChange={() => toggleExpanded(result.id)}>
                {/* Compact Row - 72-88px height */}
                <div className={cn(
                  'flex items-center gap-3 px-3 py-2.5 bg-background hover:bg-muted/50 transition-colors',
                  'min-h-[72px] max-h-[88px]',
                  isExpanded && 'bg-muted/30'
                )}>
                  {/* Left: Platform icon + profile image */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-lg" title={platformName}>
                      {getPlatformIcon(platformName)}
                    </span>
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-border"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center border border-border">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Center: Platform name + key fields */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {platformName}
                      </span>
                      {result.status === 'found' && (
                        <Badge className="h-4 px-1 text-[10px] bg-green-600">Active</Badge>
                      )}
                      {result.status === 'claimed' && (
                        <Badge variant="secondary" className="h-4 px-1 text-[10px]">Claimed</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {keyFields.length > 0 ? (
                        <p className="text-xs text-muted-foreground truncate">
                          {keyFields.join(' · ')}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground truncate">
                          {profileUrl ? new URL(profileUrl).pathname.replace(/^\//, '') : 'No details'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Confidence badge + actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge 
                      variant="outline" 
                      className={cn('h-6 px-1.5 gap-1 text-[10px]', confidence.bg, confidence.text, confidence.border)}
                    >
                      <ConfidenceIcon className="w-3 h-3" />
                      <span className="hidden sm:inline">{confidence.label}</span>
                      <span className="sm:hidden">{score}%</span>
                    </Badge>
                    
                    {profileUrl && (
                      <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0">
                        <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                    )}
                    
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <ChevronRight className={cn(
                          'w-4 h-4 transition-transform',
                          isExpanded && 'rotate-90'
                        )} />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>

                {/* Expanded Panel */}
                <CollapsibleContent>
                  <div className="bg-muted/20 border-t px-4 py-3 space-y-3">
                    {/* Profile Signals Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {meta.bio && (
                        <div className="col-span-2 sm:col-span-4 p-2 rounded bg-background border text-xs">
                          <span className="text-muted-foreground">Bio: </span>
                          <span>{meta.bio}</span>
                        </div>
                      )}
                      {meta.followers !== undefined && (
                        <div className="flex items-center gap-1.5 p-2 rounded bg-background border text-xs">
                          <Users className="w-3 h-3 text-primary" />
                          <span className="text-muted-foreground">Followers:</span>
                          <span className="font-medium">{meta.followers}</span>
                        </div>
                      )}
                      {meta.following !== undefined && (
                        <div className="flex items-center gap-1.5 p-2 rounded bg-background border text-xs">
                          <Users className="w-3 h-3 text-primary" />
                          <span className="text-muted-foreground">Following:</span>
                          <span className="font-medium">{meta.following}</span>
                        </div>
                      )}
                      {meta.location && (
                        <div className="flex items-center gap-1.5 p-2 rounded bg-background border text-xs">
                          <Globe className="w-3 h-3 text-primary" />
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium truncate">{meta.location}</span>
                        </div>
                      )}
                      {(meta.joined || meta.created_at) && (
                        <div className="flex items-center gap-1.5 p-2 rounded bg-background border text-xs">
                          <Clock className="w-3 h-3 text-primary" />
                          <span className="text-muted-foreground">Joined:</span>
                          <span className="font-medium">{meta.joined || meta.created_at}</span>
                        </div>
                      )}
                    </div>

                    {/* Raw Fields (collapsed by default in nested accordion) */}
                    {Object.keys(meta).length > 0 && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground py-1">
                          View raw fields ({Object.keys(meta).length})
                        </summary>
                        <div className="mt-2 p-2 rounded bg-background border font-mono space-y-1 max-h-48 overflow-auto">
                          {Object.entries(meta).map(([key, value]) => (
                            <div key={key} className="flex gap-2">
                              <span className="text-muted-foreground shrink-0">{key}:</span>
                              <span className="truncate">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      {result.url && (
                        <ForensicVerifyButton
                          findingId={result.id}
                          url={result.url}
                          platform={result.site || 'Unknown'}
                          scanId={jobId}
                        />
                      )}
                      <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                        <a href={result.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Profile
                        </a>
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AccountsTab;
