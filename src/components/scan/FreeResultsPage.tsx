/**
 * FreeResultsPage Component
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * CONTENT CONTRACT - STRICTLY ENFORCED
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This component MUST be the ONLY page rendered for users with plan === "free".
 * It is architecturally separate from AdvancedResultsPage.
 * 
 * ─────────────────────────────────────────────────────────────────────────────────
 * ALLOWED CONTENT (exhaustive list):
 * ─────────────────────────────────────────────────────────────────────────────────
 * 1. Header + Subtext:
 *    - "Here's what we found"
 *    - "You're viewing a limited summary of an advanced scan."
 * 
 * 2. Risk Snapshot:
 *    - Counts ONLY (Signals detected, High-confidence, Overall risk = "Unclear")
 *    - NO charts, gauges, graphs, or visualizations
 * 
 * 3. Profiles & Exposure Summary:
 *    - Total profile count (aggregated)
 *    - 2–3 example profiles (max 3)
 *    - "+ N more profiles (Pro)" indicator
 * 
 * 4. Connections Teaser:
 *    - Static placeholder card only
 *    - Text: "Connections detected" / "Related profiles and entities were found..."
 *    - NO Cytoscape, NO graph initialization, NO live visualization
 * 
 * 5. Single Pro Upgrade Block:
 *    - Benefits list
 *    - "Unlock Pro" CTA
 * 
 * ─────────────────────────────────────────────────────────────────────────────────
 * EXCLUDED CONTENT (never import, mount, or render):
 * ─────────────────────────────────────────────────────────────────────────────────
 * - Timeline Analysis component
 * - Relationship Graph / Connections graph (live Cytoscape)
 * - Digital Footprint DNA widget
 * - Privacy Score widget
 * - Catfish Detection component
 * - Anomaly Detection component
 * - Continuous Monitoring component
 * - Data Analytics Overview charts
 * - Data Quality & Source Analysis
 * - Export Artifacts / Export buttons
 * - Provider cards (Predicta, Maigret, etc.)
 * - "View Detailed Metadata" panels
 * - Any expandable JSON blocks
 * - Share / Removal action buttons
 * 
 * ─────────────────────────────────────────────────────────────────────────────────
 * EMPTY STATE HANDLING:
 * ─────────────────────────────────────────────────────────────────────────────────
 * If data is missing, show simple text empty states, NOT charts or complex UI.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useScanResultsData, ScanJob, ScanResult } from '@/hooks/useScanResultsData';
import { ScanProgress } from './ScanProgress';
import { Loader2, Shield, Eye, HelpCircle, Lock, ArrowRight, Check, User } from 'lucide-react';
import { aggregateResults, type AggregatedProfile } from '@/lib/results/resultsAggregator';
import { filterOutProviderHealth } from '@/lib/providerHealthUtils';
import { PostScanUpgradeModal } from '@/components/upsell/PostScanUpgradeModal';
import { useNavigate } from 'react-router-dom';

interface FreeResultsPageProps {
  jobId: string;
}

// Pro benefits for upgrade block
const PRO_BENEFITS = [
  'Confidence scoring & false-positive filtering',
  'Full source list & evidence context',
  'Labeled connections graph',
  'Exposure timeline (historical vs active)',
  'Recommended next steps',
];

export function FreeResultsPage({ jobId }: FreeResultsPageProps) {
  // TEMP VERIFICATION LOG (remove after confirming routing split)
  // eslint-disable-next-line no-console
  console.log('FREE RESULTS PAGE');

  const navigate = useNavigate();
  const [job, setJob] = useState<ScanJob | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [broadcastResultCount, setBroadcastResultCount] = useState(0);
  const { toast } = useToast();
  const jobChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const progressChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Use centralized data hook
  const { 
    results, 
    loading: resultsLoading, 
    breachResults 
  } = useScanResultsData(jobId);

  // Post-scan upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const hasShownModalRef = useRef(false);

  // Filter out provider health findings for display
  const displayResults = useMemo(() => filterOutProviderHealth(results), [results]);
  
  // Get aggregated results for authoritative counts
  const aggregated = useMemo(() => aggregateResults(displayResults), [displayResults]);
  
  const scanComplete = (job?.status || '').toLowerCase().includes('complete');
  const username = job?.username || job?.target || 'Unknown';
  
  // Calculate metrics from aggregated data (single source of truth)
  const signalsFound = aggregated.counts.totalProfiles;
  const highConfidenceCount = aggregated.counts.highConfidence;
  const totalProfiles = aggregated.counts.totalProfiles;
  const totalBreaches = aggregated.counts.totalBreaches;
  
  // Filter to only 'found' profiles for display (limit to 3 for Free)
  const foundProfiles = aggregated.profiles.filter(p => p.status === 'found' || p.status === 'claimed');
  const previewProfiles = foundProfiles.slice(0, 3);
  const hiddenCount = Math.max(0, foundProfiles.length - 3);
  
  // Connections count for teaser display
  const totalConnections = foundProfiles.length;

  useEffect(() => {
    loadJob();

    // Subscribe to scan status updates
    const channel = supabase
      .channel(`scan_${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scans',
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          const updatedScan = payload.new as any;
          const target = updatedScan.username || updatedScan.email || updatedScan.phone || '';
          
          const mappedJob: ScanJob = {
            id: updatedScan.id,
            username: target,
            target: target,
            scan_type: updatedScan.scan_type || undefined,
            status: updatedScan.status,
            created_at: updatedScan.created_at,
            started_at: updatedScan.created_at,
            finished_at: updatedScan.completed_at || null,
            error: updatedScan.error_message || null,
            all_sites: false,
            requested_by: updatedScan.user_id
          };
          setJob(mappedJob);
          
          const terminalStatuses = ['finished', 'error', 'cancelled', 'partial', 'completed', 'completed_partial', 'failed', 'failed_timeout'];
          if (terminalStatuses.includes(updatedScan.status) && jobChannelRef.current) {
            supabase.removeChannel(jobChannelRef.current);
            jobChannelRef.current = null;
          }
        }
      )
      .subscribe();

    jobChannelRef.current = channel;

    // Subscribe to progress broadcasts
    const progressChannel = supabase
      .channel(`scan_progress_${jobId}`)
      .on('broadcast', { event: 'provider_update' }, (payload) => {
        if (payload.payload?.resultCount !== undefined) {
          setBroadcastResultCount(payload.payload.resultCount);
        }
      })
      .on('broadcast', { event: 'scan_complete' }, () => {
        loadJob();
      })
      .subscribe();

    progressChannelRef.current = progressChannel;

    return () => {
      if (jobChannelRef.current) supabase.removeChannel(jobChannelRef.current);
      if (progressChannelRef.current) supabase.removeChannel(progressChannelRef.current);
    };
  }, [jobId]);

  // Show upgrade modal after scan completes
  useEffect(() => {
    if (scanComplete && signalsFound > 0 && !hasShownModalRef.current) {
      const timer = setTimeout(() => {
        setShowUpgradeModal(true);
        hasShownModalRef.current = true;
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanComplete, signalsFound]);

  const loadJob = async () => {
    try {
      const { data: scanData } = await supabase
        .from('scans')
        .select('id, username, email, phone, scan_type, status, created_at, completed_at, user_id')
        .eq('id', jobId)
        .maybeSingle();

      if (scanData) {
        const target = scanData.username || scanData.email || scanData.phone || '';
        
        const mappedJob: ScanJob = {
          id: scanData.id,
          username: target,
          target: target,
          scan_type: scanData.scan_type || undefined,
          status: scanData.status,
          created_at: scanData.created_at,
          started_at: scanData.created_at,
          finished_at: scanData.completed_at || null,
          error: null,
          all_sites: false,
          requested_by: scanData.user_id
        };
        setJob(mappedJob);
        setJobLoading(false);
        return;
      }

      // Fallback to legacy scan_jobs table
      const { data, error } = await supabase
        .from('scan_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error: any) {
      console.error('Failed to load job:', error);
      
      const isNotFound = error?.code === 'PGRST116' || error?.message?.includes('not found');
      toast({
        title: isNotFound ? 'Scan Not Found' : 'Error',
        description: isNotFound 
          ? 'This scan may have failed to start. Check your scan quota and credits, then try again.'
          : 'Failed to load scan job details',
        variant: 'destructive',
      });
    } finally {
      setJobLoading(false);
    }
  };

  const handleUpgradeClick = () => {
    navigate('/pricing');
  };

  if (jobLoading) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!job) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            <h2 className="text-lg font-semibold">Scan Not Found</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This scan could not be found. It may have failed to start due to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Monthly scan limit reached</li>
            <li>Insufficient credits</li>
            <li>Tier restrictions on selected providers</li>
            <li>System error during scan creation</li>
          </ul>
          <div className="flex gap-2 pt-4">
            <Button onClick={() => window.location.href = '/scan/advanced'}>
              Start New Scan
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/billing'}>
              Check Quota & Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 p-2.5 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <Shield className="h-8 w-8 text-primary/60 hidden sm:block" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-0.5">Scan Results for:</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="default" className="text-sm sm:text-base px-3 py-1 font-semibold">
                    {job.target ?? job.username}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ({job.scan_type === 'email' ? 'Email' : job.scan_type === 'phone' ? 'Phone' : 'Username'})
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant={['finished', 'completed', 'completed_partial'].includes(job.status) ? 'default' : 'secondary'} className="text-xs">
                {job.status === 'completed_partial' ? 'Partial' : job.status}
              </Badge>
              {job.started_at && (
                <span>Started: {new Date(job.started_at).toLocaleString()}</span>
              )}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-accent/10 ring-1 ring-accent/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <Shield className="w-3 h-3 text-accent" />
                <span className="text-[10px] font-medium text-accent">Secured & Compliant</span>
              </div>
            </div>
            {job.error && (
              <p className="text-xs text-destructive mt-1">{job.error}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-4 sm:p-6 md:p-8 space-y-4">
        {/* Progress Indicator */}
        <ScanProgress
          startedAt={job.started_at}
          finishedAt={job.finished_at}
          status={job.status}
          resultCount={Math.max(results.length, broadcastResultCount)}
          allSites={job.all_sites || false}
        />

        {job.status === 'pending' && job.started_at && Date.now() - new Date(job.started_at).getTime() > 120000 && (
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 animate-pulse">
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
              ⚠️ Scan taking longer than usual - workers still processing results
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Large scans can take up to 2 minutes. Results will appear as providers complete.
            </p>
          </div>
        )}

        {resultsLoading && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              {job.status === 'running' ? 'Scanning in progress...' : 'Loading results...'}
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {job.status === 'finished'
                ? 'No results captured—try again later or adjust tags.'
                : 'Waiting for results...'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* ===== HEADER: "Here's what we found" ===== */}
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Here's what we found
                </h1>
                <p className="text-sm text-muted-foreground">
                  You're viewing a limited summary of an advanced scan.
                </p>
              </div>

              {/* Searched identifier badge */}
              <div className="flex items-center justify-center">
                <Badge 
                  variant="secondary" 
                  className="h-7 px-4 gap-2 text-sm font-medium"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {username}
                </Badge>
              </div>

              {/* Trust line */}
              <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground/70">
                <span className="flex items-center gap-1">
                  <Shield className="h-2.5 w-2.5" />
                  Public sources only
                </span>
                <span>•</span>
                <span>Ethical OSINT</span>
                <span>•</span>
                <span>No monitoring</span>
              </div>
            </div>

            {/* ===== RISK SNAPSHOT ===== */}
            <Card className="overflow-hidden border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">Risk Snapshot</h3>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {signalsFound}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Signals detected
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {highConfidenceCount}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      High-confidence
                    </div>
                  </div>

                  <div className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-flex items-center gap-1 cursor-help">
                            <span className="text-lg font-semibold text-muted-foreground">
                              Unclear
                            </span>
                            <HelpCircle className="h-3 w-3 text-muted-foreground/60" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent 
                          side="top" 
                          className="max-w-[220px] text-center p-3"
                        >
                          <p className="text-xs">
                            Free scans confirm presence. Pro clarifies risk and relevance.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Overall risk
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ===== PUBLIC PROFILES FOUND (Aggregated - No provider names) ===== */}
            <Card className="overflow-hidden border-border/50">
              <CardContent className="p-4">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-semibold">Public profiles found</h3>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                      {totalProfiles}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Multiple public sources indicate this identifier appears on public platforms.
                  </p>
                </div>

                {previewProfiles.length > 0 ? (
                  <div className="space-y-2">
                    {previewProfiles.map((profile) => (
                      <ProfilePreviewRow key={profile.id} profile={profile} />
                    ))}
                    
                    {hiddenCount > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-dashed border-border/50">
                        <div className="flex items-center gap-2">
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            + {hiddenCount} more (Pro)
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Pro
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No profiles detected in this scan.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* ===== CONNECTIONS TEASER (Static placeholder - NO Cytoscape/graph logic) ===== */}
            {totalConnections > 1 && (
              <Card className="overflow-hidden border-border/50">
                <CardContent className="p-4">
                  {/* Static placeholder card - no graph initialization */}
                  <div className="relative rounded-lg bg-muted/20 border border-dashed border-border/50 p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      {/* Lock icon */}
                      <div className="w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-base font-semibold text-foreground">
                        Connections detected
                      </h3>
                      
                      {/* Body text */}
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Related profiles and entities were found, but details are hidden on Free.
                      </p>
                      
                      {/* CTA Button */}
                      <Button 
                        variant="default"
                        size="sm" 
                        className="h-9 px-5 gap-2"
                        onClick={handleUpgradeClick}
                      >
                        Unlock Pro to view connections
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ===== PRO UPGRADE BLOCK ===== */}
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-5">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-1">Unlock the full analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Free shows what exists. Pro explains what it means.
                  </p>
                </div>

                <ul className="space-y-2.5 mb-5">
                  {PRO_BENEFITS.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full" size="lg" onClick={handleUpgradeClick}>
                  Unlock Pro
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <p className="mt-4 text-center text-[10px] text-muted-foreground/70 flex items-center justify-center gap-1.5">
                  <Shield className="h-2.5 w-2.5" />
                  Public sources only • Ethical OSINT • Cancel anytime
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>

      {/* Post-Scan Upgrade Modal */}
      <PostScanUpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        lockedSectionsCount={hiddenCount}
        signalsFound={signalsFound}
        highRiskCount={totalBreaches}
      />
    </Card>
  );
}

/**
 * Simple profile preview row for Free users
 */
function ProfilePreviewRow({ profile }: { profile: AggregatedProfile }) {
  const platformInitial = profile.platform.charAt(0).toUpperCase();
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
        <span className="text-xs font-semibold text-muted-foreground">
          {platformInitial}
        </span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {profile.platform}
          </span>
          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
            {profile.username}
          </Badge>
        </div>
        {profile.bio && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {profile.bio.slice(0, 60)}{profile.bio.length > 60 ? '...' : ''}
          </p>
        )}
      </div>
    </div>
  );
}

export default FreeResultsPage;
