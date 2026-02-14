import { useMemo, useState, useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useExposureStatuses } from '@/hooks/useExposureStatuses';
import type { ExposureStatus } from '@/hooks/useExposureStatuses';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Search, Filter, User, ArrowUpDown, Lock, Sparkles, Eye, EyeOff, List, LayoutGrid, SearchX, Download } from 'lucide-react';
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
import { AccountPreviewPanel } from './accounts/AccountPreviewPanel';
import { ProviderHealthPanel } from './ProviderHealthPanel';
import { cn } from '@/lib/utils';
import { extractPlatformName, deriveResultStatus } from '@/lib/results/extractors';
import { EmptyState } from '@/components/EmptyState';
import { AccountsExportMenu } from './accounts/AccountsExportMenu';
import { LowResultsNotice } from '@/components/scan/LowResultsNotice';

interface AccountsTabProps {
  results: ScanResult[];
  jobId: string;
}

type SortOption = 'platform' | 'confidence' | 'status';

export function AccountsTab({ results, jobId }: AccountsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('confidence');
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const { getStatus, updateStatus } = useExposureStatuses(jobId);
  const handleExposureStatusChange = useCallback(async (findingId: string, platformName: string, newStatus: ExposureStatus) => {
    await updateStatus(findingId, platformName, newStatus);
  }, [updateStatus]);
  const [quickFilter, setQuickFilter] = useState<QuickFilterOption>('all');
  const [focusMode, setFocusMode] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  // Filter out provider health findings
  const baseResults = useMemo(() => filterOutProviderHealth(results), [results]);
  const providerHealthFindings = useMemo(() => extractProviderHealthFindings(results), [results]);

  // Apply Focus Mode filtering
  const displayResults = useMemo(() => {
    if (!focusMode) return baseResults;
    return filterFindings(baseResults as any, { hideSearch: true, focusMode: true }) as ScanResult[];
  }, [baseResults, focusMode]);

  const hiddenByFocusMode = baseResults.length - displayResults.length;

  const { isFullAccess, buckets, plan } = useResultsViewModel(results);
  const freeAccountLimit = isFullAccess ? Infinity : 5;

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

  const filterCounts = useMemo(() => {
    const counts = { all: displayResults.length, high_confidence: 0, low_confidence: 0, claimed: 0, unclaimed: 0, verified: 0 };
    displayResults.forEach(result => {
      const score = lensAnalysis.resultScores.get(result.id)?.score || 50;
      if (score >= 75) counts.high_confidence++;
      if (score < 50) counts.low_confidence++;
      if (claimedEntities.has(result.id)) counts.claimed++;
      else counts.unclaimed++;
      if (verifiedEntities.has(result.id)) counts.verified++;
    });
    return counts;
  }, [displayResults, lensAnalysis.resultScores, claimedEntities, verifiedEntities]);

  const filteredResults = useMemo(() => {
    let filtered = displayResults.filter(result => {
      const matchesSearch = searchQuery === '' || 
        result.site?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.url?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || deriveResultStatus(result) === statusFilter;
      let matchesQuickFilter = true;
      const score = lensAnalysis.resultScores.get(result.id)?.score || 50;
      switch (quickFilter) {
        case 'high_confidence': matchesQuickFilter = score >= 75; break;
        case 'low_confidence': matchesQuickFilter = score < 50; break;
        case 'claimed': matchesQuickFilter = claimedEntities.has(result.id); break;
        case 'unclaimed': matchesQuickFilter = !claimedEntities.has(result.id); break;
        case 'verified': matchesQuickFilter = verifiedEntities.has(result.id); break;
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

    if (!isFullAccess) filtered = filtered.slice(0, freeAccountLimit);
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

  const handleSelect = useCallback((id: string) => {
    setSelectedResultId(prev => prev === id ? null : id);
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

  // Selected result data for preview panel
  const selectedResult = useMemo(() => {
    if (!selectedResultId) return null;
    return filteredResults.find(r => r.id === selectedResultId) || displayResults.find(r => r.id === selectedResultId) || null;
  }, [selectedResultId, filteredResults, displayResults]);

  const selectedScore = selectedResultId ? (lensAnalysis.resultScores.get(selectedResultId)?.score || 50) : 50;

  return (
    <div className={RESULTS_SPACING.contentMarginSm}>
      {/* Provider Health Panel */}
      {providerHealthFindings.length > 0 && (
        <ProviderHealthPanel findings={providerHealthFindings} variant="compact" />
      )}

      {/* Quick Filters */}
      <AccountFilters activeFilter={quickFilter} onFilterChange={setQuickFilter} counts={filterCounts} />

      {/* Focus Mode Toggle + Search/Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-1 items-start sm:items-center">
        <div className="flex items-center gap-1.5 mr-2 shrink-0">
          <Switch checked={focusMode} onCheckedChange={setFocusMode} className="scale-75 data-[state=checked]:bg-primary" />
          <div className="flex items-center gap-0.5">
            {focusMode ? <Eye className="h-2.5 w-2.5 text-primary" /> : <EyeOff className="h-2.5 w-2.5 text-muted-foreground" />}
            <span className="text-[10px] text-muted-foreground">Focus</span>
          </div>
          {focusMode && hiddenByFocusMode > 0 && (
            <span className="text-[9px] text-amber-600">{hiddenByFocusMode} hidden</span>
          )}
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-muted-foreground" />
          <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-6 pl-6 text-[11px]" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-6 w-full sm:w-[100px] text-[10px]">
            <Filter className="h-2 w-2 mr-1" /><SelectValue />
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
            <ArrowUpDown className="h-2 w-2 mr-1" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="confidence" className="text-[10px]">Confidence</SelectItem>
            <SelectItem value="platform" className="text-[10px]">Platform</SelectItem>
            <SelectItem value="status" className="text-[10px]">Status</SelectItem>
          </SelectContent>
        </Select>
        <ToggleGroup type="single" value={viewMode} onValueChange={(v) => { if (v) setViewMode(v as 'list' | 'grid'); }} className="h-6 shrink-0">
          <ToggleGroupItem value="list" aria-label="List view" className="h-6 w-6 p-0"><List className="h-3 w-3" /></ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="Grid view" className="h-6 w-6 p-0"><LayoutGrid className="h-3 w-3" /></ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Results Summary Bar */}
      <div className="flex items-center gap-1.5 text-[10px] flex-wrap">
        <span className="px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground font-medium">{displayResults.length} total</span>
        <span className="px-1.5 py-0.5 rounded bg-green-600/10 text-green-600 dark:text-green-400 font-medium">{statusCounts.found} found</span>
        {filterCounts.high_confidence > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">{filterCounts.high_confidence} high conf</span>
        )}
        {focusMode && hiddenByFocusMode > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">{hiddenByFocusMode} hidden</span>
        )}
        {!isFullAccess && displayResults.length > freeAccountLimit && (
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground/60">
            <Lock className="h-2.5 w-2.5" />+{displayResults.length - freeAccountLimit} locked
          </span>
        )}
        <span className="text-muted-foreground/40 ml-auto text-[9px] flex items-center gap-1">
          {statusFilter !== 'all' && <span className="mr-1">{statusFilter}</span>}
          {sortBy !== 'confidence' && <span className="mr-1">by {sortBy}</span>}
          {filteredResults.length}/{displayResults.length}
          <AccountsExportMenu
            filteredResults={filteredResults}
            allResults={displayResults}
            jobId={jobId}
            scoreMap={new Map(Array.from(lensAnalysis.resultScores.entries()).map(([id, s]) => [id, s.score]))}
            isFullAccess={isFullAccess}
          />
        </span>
      </div>

      {/* Account Results */}
      {filteredResults.length === 0 ? (
        displayResults.length === 0 ? (
          <div className="py-8">
            <LowResultsNotice variant="zero" />
          </div>
        ) : (
          <EmptyState
            icon={SearchX}
            title="No matching accounts"
            description="No accounts match your current search or filter criteria."
            action={{ label: 'Reset Filters', onClick: () => { setSearchQuery(''); setStatusFilter('all'); setQuickFilter('all'); } }}
          />
        )
      ) : viewMode === 'list' ? (
        <VirtualizedAccountList
          filteredResults={filteredResults}
          jobId={jobId}
          lensAnalysis={lensAnalysis}
          selectedResultId={selectedResultId}
          focusedEntityId={focusedEntityId}
          verifiedEntities={verifiedEntities}
          claimedEntities={claimedEntities}
          isClaimLoading={isClaimLoading}
          handleFocus={handleFocus}
          handleSelect={handleSelect}
          handleVerificationComplete={handleVerificationComplete}
          handleClaimChange={handleClaimChange}
          isFullAccess={isFullAccess}
          displayResults={displayResults}
          freeAccountLimit={freeAccountLimit}
          getExposureStatus={getStatus}
          onExposureStatusChange={handleExposureStatusChange}
        />
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
            {filteredResults.map((result) => {
              const score = lensAnalysis.resultScores.get(result.id)?.score || 50;
              return (
                <AccountCard
                  key={result.id}
                  result={result}
                  jobId={jobId}
                  lensScore={score}
                  isFocused={focusedEntityId === result.id}
                  isSelected={selectedResultId === result.id}
                  verificationResult={verifiedEntities.get(result.id) || null}
                  claimStatus={claimedEntities.get(result.id) || null}
                  onFocus={() => handleFocus(result.id)}
                  onSelect={() => handleSelect(result.id)}
                  onVerificationComplete={(r) => handleVerificationComplete(result.id, r)}
                  onClaimChange={(claim) => handleClaimChange(result.id, claim)}
                />
              );
            })}
          </div>
          {!isFullAccess && displayResults.length > freeAccountLimit && (
            <div className="p-3 bg-muted/30 border border-border/20 rounded mt-2 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">{displayResults.length - freeAccountLimit} more accounts</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">Activate Pro Intelligence Mode for full correlation and confidence scoring.</p>
              <Button size="sm" className="h-7 text-[10px] gap-1"><Sparkles className="h-3 w-3" />Activate Pro Intelligence</Button>
            </div>
          )}
        </div>
      )}

      {/* Preview Panel */}
      <AccountPreviewPanel
        result={selectedResult}
        jobId={jobId}
        lensScore={selectedScore}
        open={!!selectedResult}
        onOpenChange={(open) => { if (!open) setSelectedResultId(null); }}
        isFocused={selectedResultId ? focusedEntityId === selectedResultId : false}
        verificationResult={selectedResultId ? (verifiedEntities.get(selectedResultId) || null) : null}
        claimStatus={selectedResultId ? (claimedEntities.get(selectedResultId) || null) : null}
        isClaimLoading={isClaimLoading}
        onFocus={() => { if (selectedResultId) handleFocus(selectedResultId); }}
        onVerificationComplete={(r) => { if (selectedResultId) handleVerificationComplete(selectedResultId, r); }}
        onClaimChange={(claim) => { if (selectedResultId) handleClaimChange(selectedResultId, claim); }}
      />
    </div>
  );
}


/* Virtualized list sub-component */
interface VirtualizedAccountListProps {
  filteredResults: ScanResult[];
  jobId: string;
  lensAnalysis: ReturnType<typeof useLensAnalysis>;
  selectedResultId: string | null;
  focusedEntityId: string | null;
  verifiedEntities: Map<string, LensVerificationResult>;
  claimedEntities: Map<string, 'me' | 'not_me'>;
  isClaimLoading: boolean;
  handleFocus: (id: string) => void;
  handleSelect: (id: string) => void;
  handleVerificationComplete: (findingId: string, result: LensVerificationResult) => void;
  handleClaimChange: (findingId: string, claim: 'me' | 'not_me' | null) => void;
  isFullAccess: boolean;
  displayResults: ScanResult[];
  freeAccountLimit: number;
  getExposureStatus: (findingId: string) => ExposureStatus;
  onExposureStatusChange: (findingId: string, platformName: string, status: ExposureStatus) => void;
}

function VirtualizedAccountList({
  filteredResults,
  jobId,
  lensAnalysis,
  selectedResultId,
  focusedEntityId,
  verifiedEntities,
  claimedEntities,
  isClaimLoading,
  handleFocus,
  handleSelect,
  handleVerificationComplete,
  handleClaimChange,
  isFullAccess,
  displayResults,
  freeAccountLimit,
  getExposureStatus,
  onExposureStatusChange,
}: VirtualizedAccountListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: filteredResults.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });

  return (
    <div ref={parentRef} className="border border-border/20 rounded overflow-auto bg-card" style={{ maxHeight: '70vh' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const result = filteredResults[virtualRow.index];
          const score = lensAnalysis.resultScores.get(result.id)?.score || 50;

          return (
            <div
              key={result.id}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${virtualRow.start}px)` }}
            >
              <AccountRow
                result={result}
                jobId={jobId}
                lensScore={score}
                isFocused={focusedEntityId === result.id}
                isSelected={selectedResultId === result.id}
                verificationResult={verifiedEntities.get(result.id) || null}
                claimStatus={claimedEntities.get(result.id) || null}
                isClaimLoading={isClaimLoading}
                onFocus={() => handleFocus(result.id)}
                onSelect={() => handleSelect(result.id)}
                onVerificationComplete={(r) => handleVerificationComplete(result.id, r)}
                onClaimChange={(claim) => handleClaimChange(result.id, claim)}
                exposureStatus={getExposureStatus(result.id)}
                onExposureStatusChange={onExposureStatusChange}
              />
            </div>
          );
        })}
      </div>

      {!isFullAccess && displayResults.length > freeAccountLimit && (
        <div className="p-3 bg-muted/30 border-t border-border/20 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">{displayResults.length - freeAccountLimit} more accounts</span>
          </div>
          <p className="text-[10px] text-muted-foreground mb-2">Activate Pro Intelligence Mode for full correlation and confidence scoring.</p>
          <Button size="sm" className="h-7 text-[10px] gap-1"><Sparkles className="h-3 w-3" />Activate Pro Intelligence</Button>
        </div>
      )}
    </div>
  );
}

export default AccountsTab;
