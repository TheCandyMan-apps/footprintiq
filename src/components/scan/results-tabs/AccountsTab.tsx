import { useMemo, useState, useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Search, Filter, User, ArrowUpDown, Lock, Sparkles, Eye, EyeOff, List, LayoutGrid } from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';
import { useLensAnalysis } from '@/hooks/useLensAnalysis';
import { useInvestigation } from '@/contexts/InvestigationContext';
import { LensVerificationResult } from '@/hooks/useForensicVerification';
import { extractProviderHealthFindings, filterOutProviderHealth } from '@/lib/providerHealthUtils';
import { useResultsViewModel } from '@/hooks/useResultsViewModel';
import { filterFindings } from '@/lib/findingFilters';
import { RESULTS_SPACING } from './styles';
import { AccountFilters, QuickFilterOption } from './accounts/AccountFilters';
import { AccountRow } from './accounts/AccountRow';
import { AccountCard } from './accounts/AccountCard';
import { ProviderHealthPanel } from './ProviderHealthPanel';
import { cn } from '@/lib/utils';
import { extractPlatformName, deriveResultStatus } from '@/lib/results/extractors';

interface AccountsTabProps {
  results: ScanResult[];
  jobId: string;
}

type SortOption = 'platform' | 'confidence' | 'status';



export function AccountsTab({ results, jobId }: AccountsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('confidence');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [quickFilter, setQuickFilter] = useState<QuickFilterOption>('all');
  const [focusMode, setFocusMode] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Filter out provider health findings
  const baseResults = useMemo(() => filterOutProviderHealth(results), [results]);
  const providerHealthFindings = useMemo(() => extractProviderHealthFindings(results), [results]);

  // Apply Focus Mode filtering
  const displayResults = useMemo(() => {
    if (!focusMode) return baseResults;
    return filterFindings(baseResults as any, { hideSearch: true, focusMode: true }) as ScanResult[];
  }, [baseResults, focusMode]);

  // Count hidden items for UI feedback
  const hiddenByFocusMode = baseResults.length - displayResults.length;

  // Get plan-aware view model for redaction
  const { isFullAccess, buckets, plan } = useResultsViewModel(results);
  const freeAccountLimit = isFullAccess ? Infinity : 5; // Show 5 accounts for Free users

  const lensAnalysis = useLensAnalysis(displayResults);
  const {
    focusedEntityId,
    setFocusedEntity,
    claimedEntities,
    setClaim,
    isClaimLoading,
    verifiedEntities,
    setVerification,
  } = useInvestigation();

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    const counts = {
      all: displayResults.length,
      high_confidence: 0,
      low_confidence: 0,
      claimed: 0,
      unclaimed: 0,
      verified: 0,
    };

    displayResults.forEach(result => {
      const score = lensAnalysis.resultScores.get(result.id)?.score || 50;
      if (score >= 75) counts.high_confidence++;
      if (score < 50) counts.low_confidence++;
      
      if (claimedEntities.has(result.id)) {
        counts.claimed++;
      } else {
        counts.unclaimed++;
      }
      
      if (verifiedEntities.has(result.id)) {
        counts.verified++;
      }
    });

    return counts;
  }, [displayResults, lensAnalysis.resultScores, claimedEntities, verifiedEntities]);

  const filteredResults = useMemo(() => {
    let filtered = displayResults.filter(result => {
      // Text search
      const matchesSearch = searchQuery === '' || 
        result.site?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.url?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || deriveResultStatus(result) === statusFilter;
      
      // Quick filter
      let matchesQuickFilter = true;
      const score = lensAnalysis.resultScores.get(result.id)?.score || 50;
      
      switch (quickFilter) {
        case 'high_confidence':
          matchesQuickFilter = score >= 75;
          break;
        case 'low_confidence':
          matchesQuickFilter = score < 50;
          break;
        case 'claimed':
          matchesQuickFilter = claimedEntities.has(result.id);
          break;
        case 'unclaimed':
          matchesQuickFilter = !claimedEntities.has(result.id);
          break;
        case 'verified':
          matchesQuickFilter = verifiedEntities.has(result.id);
          break;
      }
      
      return matchesSearch && matchesStatus && matchesQuickFilter;
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

    // Apply Free tier limit
    if (!isFullAccess) {
      filtered = filtered.slice(0, freeAccountLimit);
    }

    return filtered;
  }, [displayResults, searchQuery, statusFilter, sortBy, quickFilter, lensAnalysis.resultScores, claimedEntities, verifiedEntities, isFullAccess, freeAccountLimit]);

  const statusCounts = useMemo(() => {
    const counts = { found: 0, claimed: 0, not_found: 0 };
    displayResults.forEach(r => {
      const status = deriveResultStatus(r);
      if (status in counts) counts[status as keyof typeof counts]++;
    });
    return counts;
  }, [displayResults]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleFocus = useCallback((id: string) => {
    setFocusedEntity(focusedEntityId === id ? null : id);
  }, [focusedEntityId, setFocusedEntity]);

  const handleVerificationComplete = useCallback((findingId: string, result: LensVerificationResult) => {
    setVerification(findingId, result);
  }, [setVerification]);

  const handleClaimChange = useCallback((findingId: string, claim: 'me' | 'not_me' | null) => {
    setClaim(findingId, claim);
  }, [setClaim]);

  return (
    <div className={RESULTS_SPACING.contentMarginSm}>
      {/* Provider Health Panel */}
      {providerHealthFindings.length > 0 && (
        <ProviderHealthPanel findings={providerHealthFindings} variant="compact" />
      )}

      {/* Quick Filters */}
      <AccountFilters
        activeFilter={quickFilter}
        onFilterChange={setQuickFilter}
        counts={filterCounts}
      />

      {/* Focus Mode Toggle + Search/Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-1 items-start sm:items-center">
        {/* Focus Mode Toggle */}
        <div className="flex items-center gap-1.5 mr-2 shrink-0">
          <Switch 
            checked={focusMode} 
            onCheckedChange={setFocusMode}
            className="scale-75 data-[state=checked]:bg-primary"
          />
          <div className="flex items-center gap-0.5">
            {focusMode ? (
              <Eye className="h-2.5 w-2.5 text-primary" />
            ) : (
              <EyeOff className="h-2.5 w-2.5 text-muted-foreground" />
            )}
            <span className="text-[10px] text-muted-foreground">Focus</span>
          </div>
          {focusMode && hiddenByFocusMode > 0 && (
            <span className="text-[9px] text-amber-600">
              {hiddenByFocusMode} hidden
            </span>
          )}
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-6 pl-6 text-[11px]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-6 w-full sm:w-[100px] text-[10px]">
            <Filter className="h-2 w-2 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[10px]">All ({displayResults.length})</SelectItem>
            <SelectItem value="found" className="text-[10px]">Found ({statusCounts.found})</SelectItem>
            <SelectItem value="claimed" className="text-[10px]">Claimed ({statusCounts.claimed})</SelectItem>
            <SelectItem value="not_found" className="text-[10px]">Not Found ({statusCounts.not_found})</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="h-6 w-full sm:w-[90px] text-[10px]">
            <ArrowUpDown className="h-2 w-2 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="confidence" className="text-[10px]">Confidence</SelectItem>
            <SelectItem value="platform" className="text-[10px]">Platform</SelectItem>
            <SelectItem value="status" className="text-[10px]">Status</SelectItem>
          </SelectContent>
        </Select>
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => { if (v) setViewMode(v as 'list' | 'grid'); }}
          className="h-6 shrink-0"
        >
          <ToggleGroupItem value="list" aria-label="List view" className="h-6 w-6 p-0">
            <List className="h-3 w-3" />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="Grid view" className="h-6 w-6 p-0">
            <LayoutGrid className="h-3 w-3" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Inline Stats - Minimal */}
      <div className="flex items-center gap-1 text-[10px]">
        <span className="px-1.5 py-0.5 rounded bg-green-600/10 text-green-600 dark:text-green-400 font-medium">
          {statusCounts.found} found
        </span>
        <span className="text-muted-foreground/50">
          {statusCounts.claimed} claimed
        </span>
        {!isFullAccess && displayResults.length > freeAccountLimit && (
          <span className="flex items-center gap-0.5 text-muted-foreground/50 ml-1">
            <Lock className="h-2.5 w-2.5" />
            +{displayResults.length - freeAccountLimit} hidden
          </span>
        )}
        <span className="text-muted-foreground/40 ml-auto text-[9px]">
          {filteredResults.length}/{displayResults.length}
        </span>
      </div>

      {/* Account Results */}
      {filteredResults.length === 0 ? (
        <div className="border border-border/20 rounded overflow-hidden bg-card p-4 text-center">
          <User className="w-5 h-5 mx-auto text-muted-foreground/30 mb-1" />
          <p className="text-[11px] text-muted-foreground/60">
            {searchQuery || statusFilter !== 'all' || quickFilter !== 'all' ? 'No matches' : 'No accounts found'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        /* List View - Virtualized */
        <VirtualizedAccountList
          filteredResults={filteredResults}
          jobId={jobId}
          lensAnalysis={lensAnalysis}
          expandedRows={expandedRows}
          focusedEntityId={focusedEntityId}
          verifiedEntities={verifiedEntities}
          claimedEntities={claimedEntities}
          isClaimLoading={isClaimLoading}
          handleFocus={handleFocus}
          toggleExpanded={toggleExpanded}
          handleVerificationComplete={handleVerificationComplete}
          handleClaimChange={handleClaimChange}
          isFullAccess={isFullAccess}
          displayResults={displayResults}
          freeAccountLimit={freeAccountLimit}
        />
      ) : (
        /* Grid View */
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
            {filteredResults.map((result) => {
              const lensScore = lensAnalysis.resultScores.get(result.id);
              const score = lensScore?.score || 50;
              const isFocused = focusedEntityId === result.id;
              const verificationResult = verifiedEntities.get(result.id) || null;
              const claimStatus = claimedEntities.get(result.id) || null;

              return (
                <AccountCard
                  key={result.id}
                  result={result}
                  jobId={jobId}
                  lensScore={score}
                  isFocused={isFocused}
                  verificationResult={verificationResult}
                  claimStatus={claimStatus}
                  onFocus={() => handleFocus(result.id)}
                  onVerificationComplete={(r) => handleVerificationComplete(result.id, r)}
                  onClaimChange={(claim) => handleClaimChange(result.id, claim)}
                />
              );
            })}
          </div>

          {/* Free tier upgrade prompt */}
          {!isFullAccess && displayResults.length > freeAccountLimit && (
            <div className="p-3 bg-muted/30 border border-border/20 rounded mt-2 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">
                  {displayResults.length - freeAccountLimit} more accounts
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">
                Upgrade to Pro to view all accounts with full confidence scoring.
              </p>
              <Button size="sm" className="h-7 text-[10px] gap-1">
                <Sparkles className="h-3 w-3" />
                Upgrade to Pro
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


/* Virtualized list sub-component */
interface VirtualizedAccountListProps {
  filteredResults: ScanResult[];
  jobId: string;
  lensAnalysis: ReturnType<typeof useLensAnalysis>;
  expandedRows: Set<string>;
  focusedEntityId: string | null;
  verifiedEntities: Map<string, LensVerificationResult>;
  claimedEntities: Map<string, 'me' | 'not_me'>;
  isClaimLoading: boolean;
  handleFocus: (id: string) => void;
  toggleExpanded: (id: string) => void;
  handleVerificationComplete: (findingId: string, result: LensVerificationResult) => void;
  handleClaimChange: (findingId: string, claim: 'me' | 'not_me' | null) => void;
  isFullAccess: boolean;
  displayResults: ScanResult[];
  freeAccountLimit: number;
}

function VirtualizedAccountList({
  filteredResults,
  jobId,
  lensAnalysis,
  expandedRows,
  focusedEntityId,
  verifiedEntities,
  claimedEntities,
  isClaimLoading,
  handleFocus,
  toggleExpanded,
  handleVerificationComplete,
  handleClaimChange,
  isFullAccess,
  displayResults,
  freeAccountLimit,
}: VirtualizedAccountListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: filteredResults.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 10,
  });

  return (
    <div
      ref={parentRef}
      className="border border-border/20 rounded overflow-auto bg-card"
      style={{ maxHeight: '70vh' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const result = filteredResults[virtualRow.index];
          const score = lensAnalysis.resultScores.get(result.id)?.score || 50;
          const isExpanded = expandedRows.has(result.id);
          const isFocused = focusedEntityId === result.id;
          const verificationResult = verifiedEntities.get(result.id) || null;
          const claimStatus = claimedEntities.get(result.id) || null;

          return (
            <div
              key={result.id}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <AccountRow
                result={result}
                jobId={jobId}
                lensScore={score}
                isFocused={isFocused}
                isExpanded={isExpanded}
                verificationResult={verificationResult}
                claimStatus={claimStatus}
                isClaimLoading={isClaimLoading}
                onFocus={() => handleFocus(result.id)}
                onToggleExpand={() => toggleExpanded(result.id)}
                onVerificationComplete={(r) => handleVerificationComplete(result.id, r)}
                onClaimChange={(claim) => handleClaimChange(result.id, claim)}
              />
            </div>
          );
        })}
      </div>

      {/* Free tier upgrade prompt */}
      {!isFullAccess && displayResults.length > freeAccountLimit && (
        <div className="p-3 bg-muted/30 border-t border-border/20 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">
              {displayResults.length - freeAccountLimit} more accounts
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mb-2">
            Upgrade to Pro to view all accounts with full confidence scoring.
          </p>
          <Button size="sm" className="h-7 text-[10px] gap-1">
            <Sparkles className="h-3 w-3" />
            Upgrade to Pro
          </Button>
        </div>
      )}
    </div>
  );
}

export default AccountsTab;
