import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { CheckCircle, HelpCircle, AlertCircle, Globe, Clock, Users, MapPin, User } from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';
import { LensVerificationResult } from '@/hooks/useForensicVerification';
import { cn } from '@/lib/utils';
import { RESULTS_SEMANTIC_COLORS, RESULTS_ROW, RESULTS_ICON_CONTAINER } from '../styles';
import { AccountRowActions } from './AccountRowActions';
import { LensStatusBadge } from './LensStatusBadge';
import { ForensicModal } from '@/components/forensic/ForensicModal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
    label: 'Strong', 
    shortLabel: 'High',
    ...RESULTS_SEMANTIC_COLORS.confidenceHigh,
    icon: CheckCircle 
  };
  if (score >= 60) return { 
    label: 'Medium', 
    shortLabel: 'Med',
    ...RESULTS_SEMANTIC_COLORS.confidenceMedium,
    icon: HelpCircle 
  };
  return { 
    label: 'Weak', 
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
  
  if (meta.username) return meta.username;
  if (meta.handle) return meta.handle;
  if (meta.screen_name) return meta.screen_name;
  
  const url = extractUrl(result);
  if (url) {
    try {
      const pathname = new URL(url).pathname;
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length > 0) return parts[0];
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
  
  const bio = meta.bio || meta.about || meta.summary;
  if (bio && !isGenericDescription(bio)) {
    return bio.length > 80 ? bio.slice(0, 77) + '…' : bio;
  }
  
  if (meta.description && !isGenericDescription(meta.description)) {
    return meta.description.length > 80 ? meta.description.slice(0, 77) + '…' : meta.description;
  }
  
  return null;
};

const extractFullBio = (result: ScanResult): string | null => {
  const meta = (result.meta || result.metadata || {}) as Record<string, any>;
  
  const bio = meta.bio || meta.about || meta.summary;
  if (bio && !isGenericDescription(bio)) return bio;
  
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
      {/* Main Row - Profile card style */}
      <div 
        className={cn(
          RESULTS_ROW.base,
          'border-b border-border/30 last:border-b-0 cursor-pointer group',
          !isFocused && !isExpanded && RESULTS_ROW.default,
          isExpanded && !isFocused && RESULTS_ROW.expanded,
          isFocused && RESULTS_ROW.focused
        )}
        onClick={onToggleExpand}
      >
        {/* Left: Platform Icon + Profile Thumbnail Stack */}
        <div className="relative shrink-0">
          {/* Platform favicon badge */}
          <div className={RESULTS_ICON_CONTAINER.platformBadge}>
            {!faviconError ? (
              <img 
                src={`https://www.google.com/s2/favicons?domain=${getPlatformDomain(platformName, profileUrl)}&sz=16`}
                alt=""
                className="w-3 h-3"
                onError={() => setFaviconError(true)}
              />
            ) : (
              <Globe className="w-2.5 h-2.5 text-muted-foreground" />
            )}
          </div>
          
          {/* Profile thumbnail */}
          <div className={cn(RESULTS_ICON_CONTAINER.avatar, 'overflow-hidden')}>
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
                RESULTS_ICON_CONTAINER.avatarFallback,
                'absolute inset-0',
                profileImage ? 'hidden' : 'flex'
              )}
            >
              <User className="w-4 h-4 text-primary/50" />
            </div>
          </div>
        </div>

        {/* Center: Platform + Username + Bio */}
        <div className="flex-1 min-w-0">
          {/* Primary line */}
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-semibold text-[13px] truncate">{platformName}</span>
            {username && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-muted-foreground text-[13px] truncate max-w-[120px]">@{username}</span>
              </>
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
                  <TooltipContent side="top" className="text-xs">
                    {claimStatus === 'me' ? 'Claimed as yours' : 'Marked as not you'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          {/* Bio line */}
          <TooltipProvider delayDuration={400}>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className={cn(
                  "text-[11px] leading-tight mt-0.5 truncate",
                  bio ? "text-muted-foreground" : "text-muted-foreground/40 italic"
                )}>
                  {bio || "No bio available"}
                </p>
              </TooltipTrigger>
              {fullBio && fullBio.length > 80 && (
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-xs">{fullBio}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Right: Badges + Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Badges - hide on mobile */}
          <div className="hidden sm:flex items-center gap-1">
            <Badge 
              variant="outline" 
              className={cn(
                'h-[18px] px-1.5 gap-0.5 text-[9px] font-medium',
                confidence.bg, confidence.text, confidence.border
              )}
            >
              <ConfidenceIcon className="w-2.5 h-2.5" />
              {confidence.shortLabel}
            </Badge>

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
                        compact
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">View LENS Analysis</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
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

      {/* Expanded Panel - Compact raw fields */}
      <CollapsibleContent>
        <div className="bg-muted/5 border-b border-border/30 px-3 py-2 ml-[46px] space-y-1.5">
          {/* Full bio if available */}
          {meta.bio && (
            <p className="text-xs text-foreground/85 leading-relaxed">{meta.bio}</p>
          )}
          
          {/* Profile signals - inline compact */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {meta.followers !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span className="text-foreground font-medium">{meta.followers.toLocaleString()}</span> followers
              </span>
            )}
            {meta.following !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span className="text-foreground font-medium">{meta.following.toLocaleString()}</span> following
              </span>
            )}
            {meta.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {meta.location}
              </span>
            )}
            {meta.joined && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Joined {meta.joined}
              </span>
            )}
            {meta.website && (
              <a 
                href={meta.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <Globe className="w-3 h-3" />
                {meta.website.replace(/^https?:\/\//, '').slice(0, 30)}
              </a>
            )}
          </div>

          {/* Profile URL */}
          {profileUrl && (
            <div className="flex items-center gap-2 pt-1.5 border-t border-border/20 mt-1.5">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-medium">URL</span>
              <a 
                href={profileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[11px] text-primary/80 hover:text-primary hover:underline truncate flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                {profileUrl}
              </a>
            </div>
          )}

          {/* Raw fields toggle */}
          {Object.keys(meta).length > 0 && (
            <details 
              className="pt-1.5 border-t border-border/20 mt-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <summary className="text-[9px] uppercase tracking-wider text-muted-foreground/50 cursor-pointer hover:text-muted-foreground select-none font-medium">
                Raw fields
              </summary>
              <pre className="mt-1.5 text-[10px] bg-muted/20 rounded p-2 overflow-x-auto max-h-24 text-muted-foreground/80 leading-tight">
                {JSON.stringify(meta, null, 2)}
              </pre>
            </details>
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
    </Collapsible>
  );
}
