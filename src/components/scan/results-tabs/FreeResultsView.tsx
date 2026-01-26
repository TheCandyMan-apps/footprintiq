/**
 * FreeResultsView Component
 * 
 * Dedicated results view for Free users - completely separate from Pro/Advanced layout.
 * Consumes aggregated Advanced scan data but presents a simplified narrative UI.
 * 
 * INCLUDES:
 * - Header: "Here's what we found"
 * - Subtext: "You're viewing a limited summary of an advanced scan."
 * - Risk Snapshot (counts only, no charts)
 * - Profiles & Exposure section (total count + 2-3 examples + "+ N more (Pro)")
 * - Connections preview (small graph teaser, no labels)
 * - Inline Pro upgrade block
 * 
 * EXCLUDES:
 * - Privacy Score
 * - Digital Footprint DNA
 * - Timeline Analysis
 * - Full Relationship Graph
 * - Data Analytics Overview
 * - Data Quality & Source Analysis
 * - Anomaly Detection
 * - Continuous Monitoring
 * - Export options
 * - Raw provider cards
 * - Request Removal buttons
 */

import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, Shield, HelpCircle, Lock, ArrowRight, Network, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScanJob, ScanResult } from '@/hooks/useScanResultsData';
import { aggregateResults, type AggregatedProfile } from '@/lib/results/resultsAggregator';
import { filterOutProviderHealth } from '@/lib/providerHealthUtils';
import { PostScanUpgradeModal } from '@/components/upsell/PostScanUpgradeModal';

interface FreeResultsViewProps {
  jobId: string;
  job: ScanJob;
  results: ScanResult[];
}

// Pro benefits for upgrade block
const PRO_BENEFITS = [
  'Confidence scoring & false-positive filtering',
  'Full source list & evidence context',
  'Labeled connections graph',
  'Exposure timeline (historical vs active)',
  'Recommended next steps',
];

export function FreeResultsView({ jobId, job, results }: FreeResultsViewProps) {
  const navigate = useNavigate();
  
  // Post-scan upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const hasShownModalRef = useRef(false);

  // Filter out provider health findings for display
  const displayResults = useMemo(() => filterOutProviderHealth(results), [results]);
  
  // Get aggregated results for authoritative counts
  const aggregated = useMemo(() => aggregateResults(displayResults), [displayResults]);
  
  const scanComplete = (job?.status || '').toLowerCase().includes('complete');
  const username = job?.username || 'Unknown';
  
  // Calculate metrics
  const signalsFound = aggregated.counts.totalProfiles + aggregated.counts.totalExposures;
  const highConfidenceCount = aggregated.counts.highConfidence;
  const totalProfiles = aggregated.counts.totalProfiles;
  const totalBreaches = aggregated.counts.totalBreaches;
  const previewProfiles = aggregated.profiles.slice(0, 3);
  const hiddenCount = Math.max(0, totalProfiles - 3);
  
  // Calculate connections (simplified)
  const totalConnections = Math.min(aggregated.profiles.length, 12);
  const visibleConnections = Math.min(3, totalConnections);
  const lockedConnections = totalConnections - visibleConnections;

  // Show upgrade modal after scan completes (with delay)
  useEffect(() => {
    if (scanComplete && signalsFound > 0 && !hasShownModalRef.current) {
      const timer = setTimeout(() => {
        setShowUpgradeModal(true);
        hasShownModalRef.current = true;
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanComplete, signalsFound]);

  const handleUpgradeClick = () => {
    navigate('/pricing');
  };

  return (
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

      {/* ===== RISK SNAPSHOT (Counts only, no charts) ===== */}
      <Card className="overflow-hidden border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Risk Snapshot</h3>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Signals Detected */}
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {signalsFound}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Signals detected
              </div>
            </div>

            {/* High-Confidence Matches */}
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {highConfidenceCount}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                High-confidence
              </div>
            </div>

            {/* Overall Risk - "Unclear" for Free */}
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

      {/* ===== PROFILES & EXPOSURE SECTION ===== */}
      <Card className="overflow-hidden border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-semibold">Profiles & Exposure</h3>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {totalProfiles}
              </Badge>
            </div>
          </div>

          {/* Example profiles (2-3) */}
          {previewProfiles.length > 0 ? (
            <div className="space-y-2">
              {previewProfiles.map((profile, index) => (
                <ProfilePreviewRow key={profile.id} profile={profile} index={index} />
              ))}
              
              {/* "+ N more profiles (Pro)" */}
              {hiddenCount > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-dashed border-border/50">
                  <div className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      + {hiddenCount} more profiles
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

      {/* ===== CONNECTIONS PREVIEW (Small graph teaser, no labels) ===== */}
      {totalConnections > 0 && (
        <Card className="overflow-hidden border-border/50">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-semibold">Connections</h3>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  {totalConnections}
                </Badge>
              </div>
            </div>

            {/* Visual preview area */}
            <div className="relative min-h-[160px] bg-gradient-to-b from-muted/30 to-muted/5">
              {/* Node grid visualization */}
              <div className="flex flex-wrap gap-2 justify-center p-6 relative z-10">
                {/* Visible nodes (unlabeled - just "Account N") */}
                {Array.from({ length: visibleConnections }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-muted/60 border border-border/30"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span className="text-xs text-muted-foreground">
                      Account {i + 1}
                    </span>
                  </div>
                ))}

                {/* Blurred/skeleton nodes */}
                {Array.from({ length: Math.min(3, lockedConnections) }).map((_, i) => (
                  <div
                    key={`blur-${i}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-muted/40 border border-border/20 blur-[2px] opacity-50"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                    <span className="text-xs font-medium truncate max-w-[80px]">
                      ••••••
                    </span>
                  </div>
                ))}

                {/* Placeholder for more locked */}
                {lockedConnections > 3 && (
                  <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-muted/20 border border-dashed border-border/30">
                    <Lock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      +{lockedConnections - 3} more
                    </span>
                  </div>
                )}
              </div>

              {/* Connection lines (decorative) */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="freeConnLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                <line x1="25%" y1="35%" x2="50%" y2="50%" stroke="url(#freeConnLineGradient)" strokeWidth="1" />
                <line x1="75%" y1="35%" x2="50%" y2="50%" stroke="url(#freeConnLineGradient)" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="35%" y2="75%" stroke="url(#freeConnLineGradient)" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="65%" y2="75%" stroke="url(#freeConnLineGradient)" strokeWidth="1" />
              </svg>

              {/* Gradient fade overlay */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-20" />
              
              {/* Centered overlay text */}
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 z-30">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Connections detected but hidden on Free
                </p>
                <Button 
                  variant="default"
                  size="sm" 
                  className="h-8 text-xs gap-1.5"
                  onClick={handleUpgradeClick}
                >
                  Unlock full connections graph
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== INLINE PRO UPGRADE BLOCK ===== */}
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

      {/* Post-Scan Upgrade Modal */}
      <PostScanUpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        lockedSectionsCount={hiddenCount}
        signalsFound={signalsFound}
        highRiskCount={totalBreaches}
      />
    </div>
  );
}

/**
 * Simple profile preview row for Free users
 */
function ProfilePreviewRow({ profile, index }: { profile: AggregatedProfile; index: number }) {
  const platformInitial = profile.platform.charAt(0).toUpperCase();
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
      {/* Avatar placeholder */}
      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
        <span className="text-xs font-semibold text-muted-foreground">
          {platformInitial}
        </span>
      </div>
      
      {/* Profile info */}
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

export default FreeResultsView;
