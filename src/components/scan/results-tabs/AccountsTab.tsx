import { useMemo, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, User, ArrowUpDown } from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';
import { useLensAnalysis } from '@/hooks/useLensAnalysis';
import { useInvestigation } from '@/contexts/InvestigationContext';
import { LensVerificationResult } from '@/hooks/useForensicVerification';
import { RESULTS_SPACING } from './styles';
import { AccountFilters, QuickFilterOption } from './accounts/AccountFilters';
import { AccountRow } from './accounts/AccountRow';

interface AccountsTabProps {
  results: ScanResult[];
  jobId: string;
}

type SortOption = 'platform' | 'confidence' | 'status';

// Helper to extract platform name for search/sort
const extractPlatformName = (result: ScanResult): string => {
  if (result.site && result.site !== 'Unknown') return result.site;
  const meta = (result.meta || result.metadata || {}) as Record<string, any>;
  if (meta.platform) return meta.platform;
  if (meta.site) return meta.site;
  return 'Unknown';
};


export function AccountsTab({ results, jobId }: AccountsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('confidence');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [quickFilter, setQuickFilter] = useState<QuickFilterOption>('all');

  const lensAnalysis = useLensAnalysis(results);
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
      all: results.length,
      high_confidence: 0,
      low_confidence: 0,
      claimed: 0,
      unclaimed: 0,
      verified: 0,
    };

    results.forEach(result => {
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
  }, [results, lensAnalysis.resultScores, claimedEntities, verifiedEntities]);

  const filteredResults = useMemo(() => {
    let filtered = results.filter(result => {
      // Text search
      const matchesSearch = searchQuery === '' || 
        result.site?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.url?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || result.status?.toLowerCase() === statusFilter;
      
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

    return filtered;
  }, [results, searchQuery, statusFilter, sortBy, quickFilter, lensAnalysis.resultScores, claimedEntities, verifiedEntities]);

// Derive status from result data (kind field, evidence, or status)
  const deriveResultStatus = useCallback((result: ScanResult): string => {
    // Check explicit status field first
    if (result.status) return result.status.toLowerCase();
    
    // Check kind field for profile_presence findings
    const kind = (result as any).kind || '';
    if (kind === 'profile_presence' || kind === 'presence.hit' || kind === 'account_found') {
      return 'found';
    }
    if (kind === 'presence.miss' || kind === 'not_found') {
      return 'not_found';
    }
    
    // Check evidence array for exists key
    if (result.evidence && Array.isArray(result.evidence)) {
      const existsEvidence = result.evidence.find((e: any) => e.key === 'exists');
      if (existsEvidence?.value === true) return 'found';
      if (existsEvidence?.value === false) return 'not_found';
    }
    
    // Check meta for status indicators
    const meta = (result.meta || result.metadata || {}) as Record<string, any>;
    if (meta.status) return meta.status.toLowerCase();
    if (meta.exists === true) return 'found';
    if (meta.exists === false) return 'not_found';
    
    return 'unknown';
  }, []);

  const statusCounts = useMemo(() => {
    const counts = { found: 0, claimed: 0, not_found: 0 };
    results.forEach(r => {
      const status = deriveResultStatus(r);
      if (status in counts) counts[status as keyof typeof counts]++;
    });
    return counts;
  }, [results, deriveResultStatus]);

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
      {/* Quick Filters */}
      <AccountFilters
        activeFilter={quickFilter}
        onFilterChange={setQuickFilter}
        counts={filterCounts}
      />

      {/* Search + Sort Controls - Compact */}
      <div className="flex flex-col sm:flex-row gap-1">
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
            <SelectItem value="all" className="text-[10px]">All ({results.length})</SelectItem>
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
      </div>

      {/* Inline Stats - Minimal */}
      <div className="flex items-center gap-1 text-[10px]">
        <span className="px-1.5 py-0.5 rounded bg-green-600/10 text-green-600 dark:text-green-400 font-medium">
          {statusCounts.found} found
        </span>
        <span className="text-muted-foreground/50">
          {statusCounts.claimed} claimed
        </span>
        <span className="text-muted-foreground/40 ml-auto text-[9px]">
          {filteredResults.length}/{results.length}
        </span>
      </div>

      {/* Account Rows - Dense feed */}
      <div className="border border-border/20 rounded overflow-hidden bg-card">
        {filteredResults.length === 0 ? (
          <div className="p-4 text-center">
            <User className="w-5 h-5 mx-auto text-muted-foreground/30 mb-1" />
            <p className="text-[11px] text-muted-foreground/60">
              {searchQuery || statusFilter !== 'all' || quickFilter !== 'all' ? 'No matches' : 'No accounts found'}
            </p>
          </div>
        ) : (
          filteredResults.map((result) => {
            const lensScore = lensAnalysis.resultScores.get(result.id);
            const score = lensScore?.score || 50;
            const isExpanded = expandedRows.has(result.id);
            const isFocused = focusedEntityId === result.id;
            const verificationResult = verifiedEntities.get(result.id) || null;
            const claimStatus = claimedEntities.get(result.id) || null;

            return (
              <AccountRow
                key={result.id}
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
            );
          })
        )}
      </div>
    </div>
  );
}

export default AccountsTab;
