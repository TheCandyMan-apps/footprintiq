import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  CheckCircle, HelpCircle, AlertCircle, Info, Globe, Clock,
  Users, MapPin, Zap, Sparkles, ExternalLink,
  Crosshair, UserCheck, UserX, Loader2,
} from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';
import { LensVerificationResult } from '@/hooks/useForensicVerification';
import { cn } from '@/lib/utils';
import { RESULTS_SEMANTIC_COLORS } from '../styles';
import { LensStatusBadge } from './LensStatusBadge';
import { ForensicModal } from '@/components/forensic/ForensicModal';
import { ConfidenceBreakdown } from './ConfidenceBreakdown';
import { LensUpgradePrompt } from './LensUpgradePrompt';
import { useTierGating } from '@/hooks/useTierGating';
import { PlatformIconBadge } from '@/components/ui/PlatformIcon';
import { useAIEnrichment } from '@/hooks/useAIEnrichment';
import { QuickAnalysisDialog } from '@/components/scan/QuickAnalysisDialog';
import { EnrichmentDialog } from '@/components/scan/EnrichmentDialog';
import { useForensicVerification } from '@/hooks/useForensicVerification';
import {
  extractPlatformName,
  extractUrl,
  extractUsername,
  extractFullBio,
  getInitials,
} from '@/lib/results/extractors';

type ClaimType = 'me' | 'not_me';

const getMatchConfidence = (score: number) => {
  if (score >= 80) return { label: 'High Confidence', ...RESULTS_SEMANTIC_COLORS.confidenceHigh, icon: CheckCircle };
  if (score >= 60) return { label: 'Moderate', ...RESULTS_SEMANTIC_COLORS.confidenceMedium, icon: HelpCircle };
  return { label: 'Needs Review', ...RESULTS_SEMANTIC_COLORS.confidenceLow, icon: AlertCircle };
};

interface AccountPreviewPanelProps {
  result: ScanResult | null;
  jobId: string;
  lensScore: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFocused: boolean;
  verificationResult: LensVerificationResult | null;
  claimStatus: ClaimType | null;
  isClaimLoading: boolean;
  onFocus: () => void;
  onVerificationComplete: (result: LensVerificationResult) => void;
  onClaimChange: (claim: ClaimType | null) => void;
}

export function AccountPreviewPanel({
  result,
  jobId,
  lensScore,
  open,
  onOpenChange,
  isFocused,
  verificationResult,
  claimStatus,
  isClaimLoading,
  onFocus,
  onVerificationComplete,
  onClaimChange,
}: AccountPreviewPanelProps) {
  const [lensModalOpen, setLensModalOpen] = useState(false);
  const { isFree } = useTierGating();
  const { verify, isVerifying } = useForensicVerification();

  const meta = useMemo(() => (result?.meta || result?.metadata || {}) as Record<string, any>, [result]);
  const platformName = useMemo(() => result ? extractPlatformName(result) : '', [result]);
  const profileUrl = useMemo(() => result ? extractUrl(result) : null, [result]);
  const username = useMemo(() => result ? extractUsername(result) : '', [result]);
  const fullBio = useMemo(() => result ? extractFullBio(result) : '', [result]);
  const profileImage = meta.avatar_cached || meta.avatar_url || meta.avatar || meta.profile_image || meta.image || meta.pfp_image;

  const {
    isAnalyzing, analysisOpen, setAnalysisOpen, analysisData, handleQuickAnalysis,
    isEnriching, enrichmentOpen, setEnrichmentOpen, enrichmentData, handleDeepEnrichment,
  } = useAIEnrichment(result?.id || '');

  if (!result) return null;

  const confidence = getMatchConfidence(lensScore);
  const ConfidenceIcon = confidence.icon;
  const isUnclearConfidence = lensScore < 60 && !verificationResult;

  const handleVerify = async () => {
    if (!profileUrl || isVerifying) return;
    const res = await verify({ url: profileUrl, platform: platformName, scanId: jobId, findingId: result.id });
    if (res) onVerificationComplete(res);
  };

  const handleClaimToggle = (claim: ClaimType) => {
    onClaimChange(claimStatus === claim ? null : claim);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="sm:max-w-md w-full overflow-y-auto p-0"
          aria-label="Account preview panel"
        >
          {/* Header */}
          <SheetHeader className="px-4 pt-4 pb-3 border-b border-border/20">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <PlatformIconBadge platform={platformName} url={profileUrl} size="lg" position="top-left" />
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted/20 border border-border/30 ml-1 mt-1">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={`${platformName} profile`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fb = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fb) fb.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={cn('absolute inset-0 flex items-center justify-center bg-primary/4', profileImage ? 'hidden' : 'flex')}>
                    <span className="text-sm font-semibold text-primary/40">{getInitials(username || platformName)}</span>
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-sm font-semibold truncate">{platformName}</SheetTitle>
                {username ? <p className="text-xs text-muted-foreground truncate">@{username}</p> : <p className="text-xs text-muted-foreground/50 truncate italic">Username not publicly listed</p>}
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="outline" className={cn('h-5 px-1.5 gap-0.5 text-[9px] font-medium', confidence.bg, confidence.text, confidence.border)}>
                    <ConfidenceIcon className="w-2.5 h-2.5" />
                    {confidence.label}
                  </Badge>
                  {verificationResult && (
                    <button onClick={() => setLensModalOpen(true)}>
                      <LensStatusBadge status={null} score={verificationResult.confidenceScore} compact={false} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="px-4 py-3 space-y-4">
            {/* LENS upsell for unclear accounts */}
            {isUnclearConfidence && isFree && (
              <LensUpgradePrompt variant="banner" context="unclear" />
            )}

            {/* Confidence Breakdown */}
            <div>
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Info className="w-3 h-3" />
                Confidence Breakdown
              </h4>
              <ConfidenceBreakdown
                score={lensScore}
                username={username}
                platformName={platformName}
                meta={meta}
                hasProfileImage={!!profileImage}
              />
            </div>

            {/* Full bio */}
            {fullBio && (
              <div>
                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Bio</h4>
                <p className="text-xs text-foreground/90 leading-relaxed">{fullBio}</p>
              </div>
            )}

            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-2.5 text-[11px]">
              {meta.followers !== undefined && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="w-3 h-3 shrink-0" />
                  <span><span className="text-foreground font-medium">{Number(meta.followers).toLocaleString()}</span> followers</span>
                </div>
              )}
              {meta.following !== undefined && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="w-3 h-3 shrink-0" />
                  <span><span className="text-foreground font-medium">{Number(meta.following).toLocaleString()}</span> following</span>
                </div>
              )}
              {meta.location && meta.location !== 'Unknown' && meta.location.toLowerCase() !== 'unknown' && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{meta.location}</span>
                </div>
              )}
              {meta.joined && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>Joined {meta.joined}</span>
                </div>
              )}
              {meta.website && (
                <a
                  href={meta.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-primary hover:underline col-span-2"
                >
                  <Globe className="w-3 h-3 shrink-0" />
                  <span className="truncate">{String(meta.website).replace(/^https?:\/\//, '').slice(0, 40)}</span>
                </a>
              )}
            </div>

            {/* Profile URL */}
            {profileUrl && (
              <div className="pt-2 border-t border-border/15">
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary hover:underline truncate"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  {profileUrl}
                </a>
              </div>
            )}

            {/* Actions: LENS Verify, Focus, Claim */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/15">
              {/* LENS Verify */}
              {profileUrl && !verificationResult && !isFree && (
                <Button variant="outline" size="sm" onClick={handleVerify} disabled={isVerifying} className="gap-1.5 text-[11px] h-7">
                  {isVerifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  LENS Verify
                </Button>
              )}

              {/* Focus */}
              <Button
                variant={isFocused ? 'default' : 'outline'}
                size="sm"
                onClick={onFocus}
                className="gap-1.5 text-[11px] h-7"
              >
                <Crosshair className="h-3.5 w-3.5" />
                {isFocused ? 'Focused' : 'Focus'}
              </Button>

              {/* Claim toggle */}
              <div className="flex gap-1">
                <Button
                  variant={claimStatus === 'me' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleClaimToggle('me')}
                  disabled={isClaimLoading}
                  className="gap-1 text-[11px] h-7"
                >
                  {isClaimLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserCheck className="h-3 w-3" />}
                  Mine
                </Button>
                <Button
                  variant={claimStatus === 'not_me' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => handleClaimToggle('not_me')}
                  disabled={isClaimLoading}
                  className="gap-1 text-[11px] h-7"
                >
                  <UserX className="h-3 w-3" />
                  Not me
                </Button>
              </div>
            </div>

            {/* AI Enrichment Buttons */}
            {!isFree && (
              <div className="flex gap-2 pt-2 border-t border-border/15">
                <Button variant="outline" size="sm" onClick={handleQuickAnalysis} disabled={isAnalyzing} className="flex-1 gap-1.5 text-[11px] h-8">
                  <Zap className="h-3.5 w-3.5" />
                  {isAnalyzing ? 'Analyzing...' : 'Quick Analysis (2 credits)'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeepEnrichment} disabled={isEnriching} className="flex-1 gap-1.5 text-[11px] h-8">
                  <Sparkles className="h-3.5 w-3.5" />
                  {isEnriching ? 'Enriching...' : 'Deep Enrichment (5 credits)'}
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* LENS Modal */}
      <ForensicModal
        open={lensModalOpen}
        onOpenChange={setLensModalOpen}
        result={verificationResult}
        url={profileUrl || undefined}
        platform={platformName}
        scanId={jobId}
      />

      {/* AI Dialogs */}
      <QuickAnalysisDialog open={analysisOpen} onOpenChange={setAnalysisOpen} analysis={analysisData} isLoading={isAnalyzing} creditsSpent={2} />
      <EnrichmentDialog open={enrichmentOpen} onOpenChange={setEnrichmentOpen} enrichment={enrichmentData} isLoading={isEnriching} creditsSpent={5} />
    </>
  );
}
