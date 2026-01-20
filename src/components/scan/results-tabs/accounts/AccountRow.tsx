import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { CheckCircle, HelpCircle, AlertCircle, Globe, Clock, Users, MapPin, Info } from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';
import { LensVerificationResult } from '@/hooks/useForensicVerification';
import { cn } from '@/lib/utils';
import { RESULTS_SEMANTIC_COLORS } from '../styles';
import { AccountRowActions } from './AccountRowActions';
import { LensStatusBadge } from './LensStatusBadge';
import { ForensicModal } from '@/components/forensic/ForensicModal';
import { ConfidenceBreakdown, ConfidenceTooltipContent } from './ConfidenceBreakdown';
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
  
  // Prefer explicit metadata fields
  if (meta.username && meta.username !== 'user') return meta.username;
  if (meta.handle && meta.handle !== 'user') return meta.handle;
  if (meta.screen_name && meta.screen_name !== 'user') return meta.screen_name;
  if (meta.display_name) return meta.display_name;
  if (meta.name) return meta.name;
  
  // Try to extract from URL path - but filter out generic patterns
  const url = extractUrl(result);
  if (url) {
    try {
      const pathname = new URL(url).pathname;
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        const candidate = parts[parts.length - 1]; // Get last segment
        // Filter out generic/useless usernames
        const genericPatterns = ['user', 'profile', 'users', 'people', 'account', 'member', 'id', 'u', 'p'];
        if (!genericPatterns.includes(candidate.toLowerCase()) && candidate.length > 1) {
          return candidate;
        }
        // Try first segment as fallback
        if (parts.length > 1 && !genericPatterns.includes(parts[0].toLowerCase()) && parts[0].length > 1) {
          return parts[0];
        }
      }
    } catch {}
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
  const meta = (result.meta || result.metadata || {}) as Record<string, any>;
  
  // Check various bio fields
  const bioFields = [meta.bio, meta.about, meta.summary, meta.headline, meta.tagline];
  for (const bio of bioFields) {
    if (bio && typeof bio === 'string' && !isGenericDescription(bio)) {
      return bio.length > 80 ? bio.slice(0, 77) + '…' : bio;
    }
  }
  
  if (meta.description && !isGenericDescription(meta.description)) {
    return meta.description.length > 80 ? meta.description.slice(0, 77) + '…' : meta.description;
  }
  
  // Try location or other context as fallback
  if (meta.location && meta.location !== 'Unknown') {
    return `📍 ${meta.location}`;
  }
  
  return null;
};

const extractFullBio = (result: ScanResult): string | null => {
  const meta = (result.meta || result.metadata || {}) as Record<string, any>;
  
  const bioFields = [meta.bio, meta.about, meta.summary, meta.headline, meta.tagline];
  for (const bio of bioFields) {
    if (bio && typeof bio === 'string' && !isGenericDescription(bio)) return bio;
  }
  
  if (meta.description && !isGenericDescription(meta.description)) return meta.description;
  
  return null;
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
  const [faviconError, setFaviconError] = useState(false);
  const meta = useMemo(() => (result.meta || result.metadata || {}) as Record<string, any>, [result]);
  const platformName = useMemo(() => extractPlatformName(result), [result]);
  const profileUrl = useMemo(() => extractUrl(result), [result]);
  const username = useMemo(() => extractUsername(result), [result]);
  const bio = useMemo(() => extractBio(result), [result]);
  const fullBio = useMemo(() => extractFullBio(result), [result]);
  const profileImage = meta.avatar_url || meta.profile_image || meta.image;
  const confidence = getMatchConfidence(lensScore);
  const ConfidenceIcon = confidence.icon;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
      {/* Main Row - Profile investigation style */}
      <div 
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 min-h-[72px] max-h-[88px] border-l-2 transition-all duration-100 cursor-pointer group',
          'border-b border-border/20 last:border-b-0',
          !isFocused && !isExpanded && 'border-l-transparent hover:border-l-primary/30 hover:bg-muted/10',
          isExpanded && !isFocused && 'bg-muted/10 border-l-muted-foreground/20',
          isFocused && 'bg-primary/5 border-l-primary'
        )}
        onClick={onToggleExpand}
      >
        {/* LEFT: Platform Icon + Profile Thumbnail */}
        <div className="relative shrink-0">
          {/* Platform favicon badge - positioned top-left */}
          <div className="absolute -top-1 -left-1 z-10 w-4 h-4 rounded-sm bg-background border border-border/50 shadow-sm flex items-center justify-center">
            {!faviconError ? (
              <img 
                src={`https://www.google.com/s2/favicons?domain=${getPlatformDomain(platformName, profileUrl)}&sz=16`}
                alt=""
                className="w-2.5 h-2.5"
                onError={() => setFaviconError(true)}
              />
            ) : (
              <Globe className="w-2.5 h-2.5 text-muted-foreground" />
            )}
          </div>
          
          {/* Profile thumbnail - larger for investigation feel */}
          <div className="w-11 h-11 rounded-lg overflow-hidden bg-muted/30 border border-border/40 relative">
            {profileImage ? (
              <img 
                src={profileImage} 
                alt=""
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
                'absolute inset-0 flex items-center justify-center bg-primary/5',
                profileImage ? 'hidden' : 'flex'
              )}
            >
              <span className="text-sm font-semibold text-primary/50">
                {getInitials(username || platformName)}
              </span>
            </div>
          </div>
        </div>

        {/* CENTER: Platform + Username + Bio */}
        <div className="flex-1 min-w-0 py-0.5">
          {/* Primary line: Platform name + username */}
          <div className="flex items-center gap-1.5 leading-none mb-1">
            <span className="font-semibold text-[13px] text-foreground truncate">{platformName}</span>
            {username && (
              <span className="text-muted-foreground text-[12px] truncate">@{username}</span>
            )}
            {claimStatus && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={cn(
                      'w-1.5 h-1.5 rounded-full shrink-0',
                      claimStatus === 'me' ? 'bg-green-500' : 'bg-red-500'
                    )} />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[10px]">
                    {claimStatus === 'me' ? 'Claimed as yours' : 'Marked as not you'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          {/* Secondary line: Bio snippet */}
          <TooltipProvider delayDuration={400}>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className={cn(
                  "text-[11px] leading-snug truncate max-w-md",
                  bio ? "text-muted-foreground" : "text-muted-foreground/50 italic"
                )}>
                  {bio || "No public bio available"}
                </p>
              </TooltipTrigger>
              {fullBio && fullBio.length > 80 && (
                <TooltipContent side="bottom" className="max-w-xs text-[11px]">
                  {fullBio}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* RIGHT: Badges + Actions - clear separation with divider */}
        <div className="flex items-center gap-2 shrink-0 pl-2 border-l border-border/20">
          {/* Confidence Badge with explainable tooltip */}
          <Popover>
            <PopoverTrigger asChild>
              <Badge 
                variant="outline" 
                className={cn(
                  'h-6 px-2 gap-1 text-[10px] font-medium cursor-pointer hover:opacity-80 transition-opacity',
                  confidence.bg, confidence.text, confidence.border
                )}
              >
                <ConfidenceIcon className="w-3 h-3" />
                <span className="hidden sm:inline">{confidence.label}</span>
                <span className="sm:hidden">{confidence.shortLabel}</span>
                <Info className="w-2.5 h-2.5 opacity-60 ml-0.5" />
              </Badge>
            </PopoverTrigger>
            <PopoverContent 
              side="top" 
              align="end" 
              className="w-auto p-2.5"
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

          {/* Profile URL + Raw fields in compact footer */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/15 text-[10px]">
            {profileUrl && (
              <a 
                href={profileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary/70 hover:text-primary hover:underline truncate flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                {profileUrl}
              </a>
            )}
            
            {Object.keys(meta).length > 0 && (
              <details 
                className="shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <summary className="text-[9px] uppercase tracking-wider text-muted-foreground/50 cursor-pointer hover:text-muted-foreground select-none font-medium">
                  Raw OSINT
                </summary>
                <pre className="absolute right-4 mt-1 text-[10px] bg-popover border border-border rounded-md p-2 shadow-lg overflow-x-auto max-h-32 max-w-sm text-muted-foreground/80 leading-tight z-20">
                  {JSON.stringify(meta, null, 2)}
                </pre>
              </details>
            )}
          </div>
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
    </Collapsible>
  );
}
