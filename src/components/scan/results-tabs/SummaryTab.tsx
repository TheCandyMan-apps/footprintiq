import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Globe, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

import { ScanJob, ScanResult } from '@/hooks/useScanResultsData';
import { useInvestigation } from '@/contexts/InvestigationContext';

import { IntelligenceBrief } from './summary/IntelligenceBrief';
import { NextStepsPanel } from './summary/NextStepsPanel';
import { FocusedEntityBanner } from './summary/FocusedEntityBanner';
import { ProfileImagesStrip } from './summary/ProfileImagesStrip';
import { SummaryActions } from './summary/SummaryActions';
import { VerificationStatusCard } from './summary/VerificationStatusCard';

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
    // Check multiple fields for platform name
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
  return images.filter(url => url && url.startsWith('http')).slice(0, 6);
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

  const handleNewScan = () => navigate('/');

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
    <div className="space-y-3">
      {/* Brief Header - Compact scan info */}
      <Card className="border-border/40">
        <CardContent className="p-2.5">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Identity */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-md bg-muted/50 border border-border/50 flex items-center justify-center shrink-0">
                <TypeIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{config.label}</span>
                  <span className="text-[13px] font-semibold truncate">{job?.username || 'Unknown'}</span>
                </div>
                {aliases.length > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[9px] text-muted-foreground">aka:</span>
                    {aliases.slice(0, 2).map((alias, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[8px] px-1 py-0 h-3 font-normal">
                        {alias}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Scan metadata */}
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground shrink-0">
              {scanComplete && (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-3 h-3" />
                  Complete
                </span>
              )}
              {formattedTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formattedTime}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Brief Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left: Intelligence Brief (8 cols) */}
        <div className="lg:col-span-8">
          <Card className="border-border/40">
            <CardContent className="p-3 space-y-4">
              {/* Focused Entity (if active) */}
              {focusedResult && (
                <FocusedEntityBanner
                  result={focusedResult}
                  onView={handleViewFocused}
                  onClear={handleClearFocus}
                />
              )}

              {/* Intelligence Brief Sections */}
              <IntelligenceBrief
                username={job?.username || 'Unknown'}
                accountsFound={grouped.found.length}
                platformsCount={platforms.length}
                breachCount={breachCount}
                reuseScore={reuseScore}
                aliases={aliases}
                scanComplete={scanComplete}
              />

              {/* Recommended Next Steps */}
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
        </div>

        {/* Right: Supporting Info (4 cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          {/* Profile Images */}
          {profileImages.length > 0 && (
            <ProfileImagesStrip images={profileImages} maxImages={4} />
          )}

          {/* Quick Stats */}
          <Card className="border-border/40">
            <CardContent className="p-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center py-1.5 px-2 rounded bg-muted/30">
                  <div className="text-lg font-semibold tabular-nums">{grouped.found.length}</div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Accounts</div>
                </div>
                <div className="text-center py-1.5 px-2 rounded bg-muted/30">
                  <div className="text-lg font-semibold tabular-nums">{platforms.length || '—'}</div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Platforms</div>
                </div>
                <div className="text-center py-1.5 px-2 rounded bg-muted/30">
                  <div className="text-lg font-semibold tabular-nums text-destructive">{breachCount}</div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Breaches</div>
                </div>
                <div className="text-center py-1.5 px-2 rounded bg-muted/30">
                  <div className="text-lg font-semibold tabular-nums">{verifiedEntities.size}</div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Verified</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LENS Verification Status */}
          <VerificationStatusCard
            totalAccounts={grouped.found.length}
            verifiedEntities={verifiedEntities}
          />

          {/* Actions */}
          <SummaryActions
            onExportJSON={onExportJSON}
            onExportCSV={onExportCSV}
            onExportPDF={onExportPDF}
            onNewScan={handleNewScan}
            disabled={results.length === 0}
          />
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="text-[10px] text-muted-foreground/60 text-center pt-1 border-t border-border/20">
        {grouped.found.length > 0 ? `${grouped.found.length} accounts found` : 'Multiple sources'} • {resultsCount} results
      </div>
    </div>
  );
}

export default SummaryTab;
