import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { CheckCircle, HelpCircle, AlertCircle, Clock, Users, MapPin, Info, Globe, Zap, Sparkles } from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';
import { LensVerificationResult } from '@/hooks/useForensicVerification';
import { cn } from '@/lib/utils';
import { RESULTS_SEMANTIC_COLORS } from '../styles';
import { AccountRowActions } from './AccountRowActions';
import { LensStatusBadge } from './LensStatusBadge';
import { ForensicModal } from '@/components/forensic/ForensicModal';
import { ConfidenceBreakdown, ConfidenceTooltipContent } from './ConfidenceBreakdown';
import { LensUpgradePrompt } from './LensUpgradePrompt';
import { useTierGating } from '@/hooks/useTierGating';
import { PlatformIconBadge } from '@/components/ui/PlatformIcon';
import { useAIEnrichment } from '@/hooks/useAIEnrichment';
import { QuickAnalysisDialog } from '@/components/scan/QuickAnalysisDialog';
import { EnrichmentDialog } from '@/components/scan/EnrichmentDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type ClaimType = 'me' | 'not_me';

interface AccountRowProps {
  result: ScanResult;
  jobId: string;
  lensScore: number;
  isFocused: boolean;
  isExpanded: boolean;
  verificationResult: LensVerificationResult | null;
  claimStatus: ClaimType | null;
  isClaimLoading: boolean;
  onFocus: () => void;
  onToggleExpand: () => void;
  onVerificationComplete: (result: LensVerificationResult) => void;
  onClaimChange: (claim: ClaimType | null) => void;
}

// Extract platform name from various data structures
const extractPlatformName = (result: ScanResult): string => {
  if (result.site && result.site !== 'Unknown') return result.site;
  
  const meta = (result.meta || result.metadata || {}) as Record<string, any>;
  if (meta.platform && meta.platform !== 'Unknown') return meta.platform;
  if (meta.site && meta.site !== 'Unknown') return meta.site;
  
  if (result.evidence && Array.isArray(result.evidence)) {
    const siteEvidence = result.evidence.find(
      (e: any) => e.key === 'site' || e.key === 'platform'
    );
    if (siteEvidence?.value) return siteEvidence.value;
  }
  
  const url = result.url || meta.url;
  if (url) {
    try {
      const hostname = new URL(url).hostname;
      const parts = hostname.replace('www.', '').split('.');
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    } catch {}
  }
  
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

// Map platform name to domain for favicon lookup
const getPlatformDomain = (platform: string, url?: string | null): string => {
  if (url) {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '');
    } catch {}
  }
  
  const p = platform?.toLowerCase() || '';
  const domainMap: Record<string, string> = {
    'github': 'github.com',
    'gitlab': 'gitlab.com',
    'twitter': 'twitter.com',
    'x': 'x.com',
    'linkedin': 'linkedin.com',
    'facebook': 'facebook.com',
    'instagram': 'instagram.com',
    'reddit': 'reddit.com',
    'youtube': 'youtube.com',
    'tiktok': 'tiktok.com',
    'discord': 'discord.com',
    'telegram': 'telegram.org',
    'pinterest': 'pinterest.com',
    'medium': 'medium.com',
    'stackoverflow': 'stackoverflow.com',
    'twitch': 'twitch.tv',
    'spotify': 'spotify.com',
    'snapchat': 'snapchat.com',
    'tumblr': 'tumblr.com',
    'flickr': 'flickr.com',
    'vimeo': 'vimeo.com',
    'steam': 'store.steampowered.com',
    'patreon': 'patreon.com',
    'behance': 'behance.net',
    'dribbble': 'dribbble.com',
    'deviantart': 'deviantart.com',
    'soundcloud': 'soundcloud.com',
    'quora': 'quora.com',
    'mastodon': 'mastodon.social',
    'threads': 'threads.net',
    'bluesky': 'bsky.app',
  };

  for (const [key, domain] of Object.entries(domainMap)) {
    if (p.includes(key)) return domain;
  }

  return `${p.replace(/\s+/g, '')}.com`;
};

const getMatchConfidence = (score: number) => {
  if (score >= 80) return { 
    label: 'High Confidence', 
    shortLabel: 'High',
    ...RESULTS_SEMANTIC_COLORS.confidenceHigh,
    icon: CheckCircle 
  };
  if (score >= 60) return { 
    label: 'Moderate', 
    shortLabel: 'Med',
    ...RESULTS_SEMANTIC_COLORS.confidenceMedium,
    icon: HelpCircle 
  };
  return { 
    label: 'Needs Review', 
    shortLabel: 'Low',
    ...RESULTS_SEMANTIC_COLORS.confidenceLow,
    icon: AlertCircle 
  };
};

const getInitials = (name: string): string => {
  if (!name) return '??';
  const cleaned = name.replace(/[_-]/g, ' ');
  const words = cleaned.split(' ').filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const extractUsername = (result: ScanResult): string | null => {
  const meta = (result.meta || result.metadata || {}) as Record<string, any>;
  
  // Generic patterns to filter out
  const genericPatterns = ['user', 'profile', 'users', 'people', 'account', 'member', 'id', 'u', 'p', 'unknown'];
  const isGeneric = (val: string | undefined) => {
    if (!val) return true;
    const lower = val.toLowerCase().trim();
    return lower.length < 2 || genericPatterns.includes(lower) || lower === '@user';
  };
  
  // Prefer explicit metadata fields
  if (!isGeneric(meta.username)) return meta.username;
  if (!isGeneric(meta.handle)) return meta.handle;
  if (!isGeneric(meta.screen_name)) return meta.screen_name;
  if (!isGeneric(meta.display_name)) return meta.display_name;
  if (!isGeneric(meta.name)) return meta.name;
  if (!isGeneric(meta.login)) return meta.login; // GitHub style
  if (!isGeneric(meta.user)) return meta.user;
  
  // Try to extract from URL path
  const url = extractUrl(result);
  if (url) {
    try {
      const pathname = new URL(url).pathname;
      const parts = pathname.split('/').filter(Boolean);
      
      // Try each path segment, preferring the one that looks like a username
      for (const part of parts) {
        const cleaned = part.replace(/[?#].*$/, ''); // Remove query/hash
        if (!isGeneric(cleaned) && cleaned.length >= 2 && cleaned.length <= 30) {
          // Skip numeric-only or file-like segments
          if (!/^\d+$/.test(cleaned) && !/\.\w{2,4}$/.test(cleaned)) {
            return cleaned;
          }
        }
      }
    } catch {}
  }
  
  return null;
};

const extractBioText = (result: ScanResult): string | null => {
  const meta = (result.meta || result.metadata || {}) as Record<string, any>;
  
  // Check various bio fields - prioritize actual user content
  const bioFields = [meta.bio, meta.about, meta.summary, meta.headline, meta.tagline];
  for (const bio of bioFields) {
    if (bio && typeof bio === 'string' && !isGenericDescription(bio)) {
      return bio;
    }
  }
  
  // Description is lower priority as it's often system-generated
  if (meta.description && !isGenericDescription(meta.description)) {
    return meta.description;
  }
  
  return null;
};

const isGenericDescription = (text: string): boolean => {
  const genericPatterns = [
    'unknown platform',
    'profile found on',
    'account detected',
  ];
  const lowerText = text.toLowerCase();
  return genericPatterns.some(pattern => lowerText.includes(pattern));
};

const extractBio = (result: ScanResult): string | null => {
  const bio = extractBioText(result);
  if (bio) {
    return bio.length > 80 ? bio.slice(0, 77) + '…' : bio;
  }
  
  // Try location as fallback context
  const meta = (result.meta || result.metadata || {}) as Record<string, any>;
  if (meta.location && meta.location !== 'Unknown' && meta.location.toLowerCase() !== 'unknown') {
    return `📍 ${meta.location}`;
  }
  
  return null;
};

const extractFullBio = (result: ScanResult): string | null => {
  return extractBioText(result);
};

export function AccountRow({
  result,
  jobId,
  lensScore,
  isFocused,
  isExpanded,
  verificationResult,
  claimStatus,
  isClaimLoading,
  onFocus,
  onToggleExpand,
  onVerificationComplete,
  onClaimChange,
}: AccountRowProps) {
  const [lensModalOpen, setLensModalOpen] = useState(false);
  const { isFree } = useTierGating();
  const meta = useMemo(() => (result.meta || result.metadata || {}) as Record<string, any>, [result]);
  const platformName = useMemo(() => extractPlatformName(result), [result]);
  const profileUrl = useMemo(() => extractUrl(result), [result]);
  const username = useMemo(() => extractUsername(result), [result]);
  const bio = useMemo(() => extractBio(result), [result]);
  const fullBio = useMemo(() => extractFullBio(result), [result]);
  const profileImage = meta.avatar_cached || meta.avatar_url || meta.avatar || meta.profile_image || meta.image || meta.pfp_image;
  const confidence = getMatchConfidence(lensScore);
  const ConfidenceIcon = confidence.icon;
  
  // AI enrichment
  const {
    isAnalyzing,
    analysisOpen,
    setAnalysisOpen,
    analysisData,
    handleQuickAnalysis,
    isEnriching,
    enrichmentOpen,
    setEnrichmentOpen,
    enrichmentData,
    handleDeepEnrichment,
  } = useAIEnrichment(result.id);
  
  // Determine if this is an "unclear" account that needs review
  const isUnclearConfidence = lensScore < 60 && !verificationResult;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
      {/* Main Row - Compact investigation style */}
      <div 
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 min-h-[52px] border-l-2 transition-all duration-75 cursor-pointer group',
          'border-b border-border/15 last:border-b-0',
          !isFocused && !isExpanded && 'border-l-transparent hover:border-l-primary/20 hover:bg-muted/8',
          isExpanded && !isFocused && 'bg-muted/6 border-l-muted-foreground/15',
          isFocused && 'bg-primary/4 border-l-primary'
        )}
        onClick={onToggleExpand}
      >
        {/* LEFT: Platform Icon + Profile Thumbnail */}
        <div className="relative shrink-0 w-12">
          {/* Platform favicon badge - larger and more prominent */}
          <PlatformIconBadge 
            platform={platformName} 
            url={profileUrl} 
            size="lg"
            position="top-left"
          />
          
          {/* Profile thumbnail - sized to work with larger icon */}
          <div className="w-11 h-11 rounded overflow-hidden bg-muted/20 border border-border/30 relative ml-1 mt-1">
            {profileImage ? (
              <img 
                src={profileImage} 
                alt={`${platformName} profile photo`}
                className="w-full h-full object-cover"
                onError={(e) => { 
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={cn(
                'absolute inset-0 flex items-center justify-center bg-primary/4',
                profileImage ? 'hidden' : 'flex'
              )}
            >
              <span className="text-[12px] font-semibold text-primary/40">
                {getInitials(username || platformName)}
              </span>
            </div>
          </div>
        </div>

        {/* CENTER: Platform + Username + Bio */}
        <div className="flex-1 min-w-0">
          {/* Primary line: Platform name + username */}
          <div className="flex items-center gap-1 leading-none mb-0.5">
            <span className="font-semibold text-[12px] text-foreground truncate">{platformName}</span>
            {username && (
              <span className="text-muted-foreground/70 text-[10px] truncate">@{username}</span>
            )}
            {claimStatus && (
              <span className={cn(
                'w-1 h-1 rounded-full shrink-0',
                claimStatus === 'me' ? 'bg-green-500' : 'bg-red-500'
              )} />
            )}
          </div>
          
          {/* Secondary line: Bio snippet or URL hint */}
          {bio ? (
            <p className="text-[10px] leading-snug truncate max-w-sm text-muted-foreground/70">
              {bio}
            </p>
          ) : profileUrl ? (
            <p className="text-[10px] leading-snug truncate max-w-sm text-muted-foreground/40">
              {new URL(profileUrl).hostname.replace('www.', '')}
            </p>
          ) : null}
        </div>

        {/* RIGHT: Badges + Actions - compact */}
        <div className="flex items-center gap-1.5 shrink-0 pl-1.5 border-l border-border/15">
          {/* Confidence Badge */}
          <Popover>
            <PopoverTrigger asChild>
              <Badge 
                variant="outline" 
                className={cn(
                  'h-5 px-1.5 gap-0.5 text-[9px] font-medium cursor-pointer hover:opacity-80 transition-opacity',
                  confidence.bg, confidence.text, confidence.border
                )}
              >
                <ConfidenceIcon className="w-2.5 h-2.5" />
                <span className="hidden sm:inline">{confidence.shortLabel}</span>
                <Info className="w-2 h-2 opacity-50" />
              </Badge>
            </PopoverTrigger>
            <PopoverContent 
              side="top" 
              align="end" 
              className="w-auto p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <ConfidenceTooltipContent
                score={lensScore}
                username={username}
                platformName={platformName}
                meta={meta}
                hasProfileImage={!!profileImage}
              />
            </PopoverContent>
          </Popover>

          {/* LENS Badge - visible when verified */}
          {verificationResult && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setLensModalOpen(true);
                    }}
                  >
                    <LensStatusBadge 
                      status={null}
                      score={verificationResult.confidenceScore}
                      compact={false}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">View LENS Analysis</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Action cluster */}
          <AccountRowActions
            findingId={result.id}
            url={profileUrl}
            platform={platformName}
            scanId={jobId}
            isFocused={isFocused}
            onFocus={onFocus}
            verificationResult={verificationResult}
            onVerificationComplete={onVerificationComplete}
            claimStatus={claimStatus}
            onClaimChange={onClaimChange}
            isClaimLoading={isClaimLoading}
            isExpanded={isExpanded}
            onToggleExpand={onToggleExpand}
          />
        </div>
      </div>

      {/* Expanded Panel - OSINT fields + Confidence Breakdown */}
      <CollapsibleContent>
        <div className="bg-muted/5 border-b border-border/20 px-4 py-3 ml-[56px] space-y-3">
          {/* Inline LENS upsell for unclear confidence accounts (Free users only) */}
          {isUnclearConfidence && isFree && (
            <LensUpgradePrompt variant="banner" context="unclear" />
          )}
          
          {/* Confidence Breakdown Section */}
          <div className="pb-3 border-b border-border/20">
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

          {/* Full bio if longer */}
          {fullBio && fullBio.length > 80 && (
            <p className="text-[12px] text-foreground/90 leading-relaxed">{fullBio}</p>
          )}
          
          {/* Profile signals grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            {meta.followers !== undefined && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-3 h-3 shrink-0" />
                <span><span className="text-foreground font-medium">{meta.followers.toLocaleString()}</span> followers</span>
              </div>
            )}
            {meta.following !== undefined && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-3 h-3 shrink-0" />
                <span><span className="text-foreground font-medium">{meta.following.toLocaleString()}</span> following</span>
              </div>
            )}
            {meta.location && meta.location !== 'Unknown' && (
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
                onClick={(e) => e.stopPropagation()}
              >
                <Globe className="w-3 h-3 shrink-0" />
                <span className="truncate">{meta.website.replace(/^https?:\/\//, '').slice(0, 40)}</span>
              </a>
            )}
          </div>

          {/* Profile URL */}
          {profileUrl && (
            <div className="pt-2 border-t border-border/15 text-[10px]">
              <a 
                href={profileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary/70 hover:text-primary hover:underline truncate block"
                onClick={(e) => e.stopPropagation()}
              >
                {profileUrl}
              </a>
            </div>
          )}

          {/* AI Enrichment Buttons */}
          {!isFree && (
            <div className="flex gap-2 pt-2 border-t border-border/15" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickAnalysis}
                disabled={isAnalyzing}
                className="gap-1.5 text-[11px] h-7"
              >
                <Zap className="h-3.5 w-3.5" />
                {isAnalyzing ? 'Analyzing...' : 'Quick Analysis (2 credits)'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeepEnrichment}
                disabled={isEnriching}
                className="gap-1.5 text-[11px] h-7"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {isEnriching ? 'Enriching...' : 'Deep Enrichment (5 credits)'}
              </Button>
            </div>
          )}
        </div>
      </CollapsibleContent>

      {/* LENS Analysis Modal */}
      <ForensicModal
        open={lensModalOpen}
        onOpenChange={setLensModalOpen}
        result={verificationResult}
        url={profileUrl || undefined}
        platform={platformName}
        scanId={jobId}
      />

      {/* AI Dialogs */}
      <QuickAnalysisDialog
        open={analysisOpen}
        onOpenChange={setAnalysisOpen}
        analysis={analysisData}
        isLoading={isAnalyzing}
        creditsSpent={2}
      />
      <EnrichmentDialog
        open={enrichmentOpen}
        onOpenChange={setEnrichmentOpen}
        enrichment={enrichmentData}
        isLoading={isEnriching}
        creditsSpent={5}
      />
    </Collapsible>
  );
}
