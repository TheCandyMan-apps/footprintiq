import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Globe, Clock, CheckCircle2, FileText } from 'lucide-react';
import { format } from 'date-fns';

import { ScanJob, ScanResult } from '@/hooks/useScanResultsData';
import { useInvestigation } from '@/contexts/InvestigationContext';

import { IntelligenceBrief } from './summary/IntelligenceBrief';
import { NextStepsPanel } from './summary/NextStepsPanel';
import { FocusedEntityBanner } from './summary/FocusedEntityBanner';

interface SummaryTabProps {
  jobId: string;
  job: ScanJob;
  grouped: {
    found: any[];
    claimed: any[];
    not_found: any[];
    unknown: any[];
  };
  resultsCount: number;
  results: ScanResult[];
  onExportJSON?: () => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
}

function getUniquePlatforms(results: ScanResult[]): string[] {
  const platforms = new Set<string>();
  results.forEach(r => {
    const site = r.site || '';
    const meta = (r.meta || r.metadata || {}) as Record<string, any>;
    const platform = site || meta.platform || meta.site || meta.provider || '';
    if (platform) platforms.add(platform);
  });
  return Array.from(platforms);
}

function getProfileImages(results: any[]): string[] {
  const images: string[] = [];
  results.forEach(r => {
    const meta = r.meta || r.metadata || {};
    if (meta.avatar_url) images.push(meta.avatar_url);
    if (meta.profile_image) images.push(meta.profile_image);
    if (meta.image) images.push(meta.image);
  });
  return images.filter(url => url && url.startsWith('http')).slice(0, 4);
}

function calculateReuseScore(found: number, platforms: number): number {
  if (platforms === 0) return 0;
  return Math.round((found / Math.max(platforms, found)) * 100);
}

export function SummaryTab({ 
  jobId, 
  job, 
  grouped, 
  resultsCount, 
  results,
  onExportJSON,
  onExportCSV,
  onExportPDF,
}: SummaryTabProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Investigation context
  let focusedEntityId: string | null = null;
  let setFocusedEntity: ((id: string | null) => void) | null = null;
  let verifiedEntities: Map<string, any> = new Map();
  
  try {
    const investigation = useInvestigation();
    focusedEntityId = investigation.focusedEntityId;
    setFocusedEntity = investigation.setFocusedEntity;
    verifiedEntities = investigation.verifiedEntities;
  } catch {
    // Context not available
  }

  const focusedResult = useMemo(() => {
    if (!focusedEntityId) return null;
    return results.find(r => r.id === focusedEntityId) || null;
  }, [focusedEntityId, results]);

  const platforms = useMemo(() => getUniquePlatforms(results), [results]);
  const profileImages = useMemo(() => getProfileImages(results), [results]);

  const breachCount = useMemo(() => {
    return results.filter((r: any) => {
      const kind = (r.kind || '').toLowerCase();
      const site = (r.site || '').toLowerCase();
      return kind.includes('breach') || kind.includes('leak') || site.includes('breach') || site.includes('hibp');
    }).length;
  }, [results]);

  const reuseScore = useMemo(() => 
    calculateReuseScore(grouped.found.length, platforms.length),
    [grouped.found.length, platforms.length]
  );

  const aliases = useMemo(() => {
    const aliasSet = new Set<string>();
    results.forEach(r => {
      const meta = (r.meta || r.metadata || {}) as Record<string, unknown>;
      if (meta.display_name && typeof meta.display_name === 'string' && meta.display_name !== job?.username) {
        aliasSet.add(meta.display_name);
      }
      if (meta.name && typeof meta.name === 'string' && meta.name !== job?.username) {
        aliasSet.add(meta.name);
      }
    });
    return Array.from(aliasSet).slice(0, 5);
  }, [results, job?.username]);

  const scanComplete = (job?.status || '').toLowerCase().includes('complete');
  const scanTime = job?.finished_at || job?.started_at;
  const formattedTime = scanTime ? format(new Date(scanTime), 'MMM d, yyyy • HH:mm') : null;

  // Navigation helpers
  const navigateToTab = (tab: string) => {
    const params = new URLSearchParams(location.search);
    params.set('tab', tab);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const handleClearFocus = () => setFocusedEntity?.(null);
  
  const handleViewFocused = () => {
    const params = new URLSearchParams(location.search);
    params.set('tab', 'accounts');
    if (focusedEntityId) params.set('focus', focusedEntityId);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  // Scan type config
  const typeConfig: Record<string, { label: string; icon: React.ElementType }> = {
    username: { label: 'Username', icon: User },
    email: { label: 'Email', icon: Mail },
    phone: { label: 'Phone', icon: Phone },
    domain: { label: 'Domain', icon: Globe },
  };
  const scanType = (job as any)?.scan_type || 'username';
  const config = typeConfig[scanType] || typeConfig.username;
  const TypeIcon = config.icon;

  return (
    <div className="space-y-2">
      {/* Brief Header - Minimal scan identifier */}
      <div className="flex items-center justify-between gap-3 px-1 py-1.5 border-b border-border/20">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded bg-muted/50 flex items-center justify-center shrink-0">
            <TypeIcon className="h-3 w-3 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[13px] font-semibold truncate">{job?.username || 'Unknown'}</span>
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal uppercase tracking-wide">
              {config.label}
            </Badge>
            {aliases.length > 0 && (
              <span className="text-[10px] text-muted-foreground hidden sm:inline">
                aka {aliases.slice(0, 2).join(', ')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground shrink-0">
          {scanComplete && (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-3 h-3" />
            </span>
          )}
          {formattedTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="hidden sm:inline">{formattedTime}</span>
            </span>
          )}
        </div>
      </div>

      {/* Intelligence Brief Card */}
      <Card className="border-border/30">
        <CardContent className="p-3 space-y-4">
          {/* 1) What We Found - plain English summary */}
          <IntelligenceBrief
            username={job?.username || 'Unknown'}
            accountsFound={grouped.found.length}
            platformsCount={platforms.length}
            breachCount={breachCount}
            reuseScore={reuseScore}
            aliases={aliases}
            scanComplete={scanComplete}
            profileImages={profileImages}
            verifiedCount={verifiedEntities.size}
          />

          {/* 2) Focused Entity (if active) */}
          {focusedResult && (
            <FocusedEntityBanner
              result={focusedResult}
              onView={handleViewFocused}
              onClear={handleClearFocus}
            />
          )}

          {/* 3) Recommended Next Steps */}
          <NextStepsPanel
            accountsFound={grouped.found.length}
            breachCount={breachCount}
            hasFocusedEntity={!!focusedEntityId}
            verifiedCount={verifiedEntities.size}
            onNavigateToAccounts={() => navigateToTab('accounts')}
            onNavigateToConnections={() => navigateToTab('connections')}
            onNavigateToBreaches={() => navigateToTab('breaches')}
            onExport={onExportPDF}
          />
        </CardContent>
      </Card>

      {/* Compact Footer Stats */}
      <div className="flex items-center justify-between px-1 py-1 text-[10px] text-muted-foreground/60">
        <div className="flex items-center gap-3">
          <span><strong className="text-foreground/70">{grouped.found.length}</strong> accounts</span>
          <span><strong className="text-foreground/70">{platforms.length}</strong> platforms</span>
          {breachCount > 0 && (
            <span className="text-destructive/80"><strong>{breachCount}</strong> breaches</span>
          )}
          {verifiedEntities.size > 0 && (
            <span className="text-green-600/80 dark:text-green-400/80"><strong>{verifiedEntities.size}</strong> verified</span>
          )}
        </div>
        <span className="flex items-center gap-1">
          <FileText className="w-3 h-3" />
          {resultsCount} results
        </span>
      </div>
    </div>
  );
}

export default SummaryTab;
