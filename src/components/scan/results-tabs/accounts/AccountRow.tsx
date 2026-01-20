import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { CheckCircle, HelpCircle, AlertCircle, Globe, Clock, Users, MapPin, User } from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';
import { LensVerificationResult } from '@/hooks/useForensicVerification';
import { cn } from '@/lib/utils';
import { RESULTS_SEMANTIC_COLORS } from '../styles';
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
      {/* Main Row - Compact investigative feed style */}
      <div 
        className={cn(
          // Base row styles - compact feed layout
          'group flex items-center gap-3 px-3 py-2.5 min-h-[68px]',
          'border-b border-border/40 last:border-b-0',
          'transition-all duration-150 cursor-pointer',
          // Left accent border for focus state
          'border-l-2',
          // Default state
          !isFocused && !isExpanded && 'border-l-transparent hover:bg-muted/30 hover:border-l-muted-foreground/40',
          // Expanded state
          isExpanded && !isFocused && 'bg-muted/20 border-l-muted-foreground/30',
          // Focused state - primary accent
          isFocused && 'bg-primary/5 border-l-primary'
        )}
        onClick={onToggleExpand}
      >
        {/* Left Section: Platform Icon + Profile Avatar Stack */}
        <div className="relative flex items-center shrink-0">
          {/* Platform Favicon - small, top-left overlay */}
          <div className="absolute -top-0.5 -left-0.5 z-10">
            {!faviconError ? (
              <img 
                src={`https://www.google.com/s2/favicons?domain=${getPlatformDomain(platformName, profileUrl)}&sz=16`}
                alt=""
                className="w-4 h-4 rounded-sm bg-background border border-border shadow-sm"
                onError={() => setFaviconError(true)}
              />
            ) : (
              <div className="w-4 h-4 rounded-sm bg-muted border border-border flex items-center justify-center">
                <Globe className="w-2.5 h-2.5 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {/* Profile Avatar - main visual */}
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted/50 border border-border/50 shadow-sm">
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
                'w-full h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5',
                profileImage ? 'hidden' : 'flex'
              )}
            >
              <User className="w-5 h-5 text-primary/60" />
            </div>
          </div>
        </div>

        {/* Center: Content - Platform + Username + Bio */}
        <div className="flex-1 min-w-0 py-0.5">
          {/* Line 1: Platform name + username + claim indicator */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm leading-tight">{platformName}</span>
            {username && (
              <>
                <span className="text-muted-foreground/60">·</span>
                <span className="text-muted-foreground text-sm truncate max-w-[140px]">@{username}</span>
              </>
            )}
            {/* Claim status dot */}
            {claimStatus && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span 
                      className={cn(
                        'w-1.5 h-1.5 rounded-full shrink-0 ml-0.5',
                        claimStatus === 'me' && 'bg-green-500',
                        claimStatus === 'not_me' && 'bg-red-500'
                      )} 
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {claimStatus === 'me' ? 'Claimed as you' : 'Marked as not you'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          {/* Line 2: Bio snippet */}
          <TooltipProvider delayDuration={400}>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className={cn(
                  "text-xs leading-snug mt-0.5 truncate cursor-default",
                  bio ? "text-muted-foreground" : "text-muted-foreground/50 italic"
                )}>
                  {bio || "No bio"}
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

        {/* Right Section: Badges + Divider + Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Badge Group */}
          <div className="hidden sm:flex items-center gap-1.5">
            {/* Confidence Badge - compact */}
            <Badge 
              variant="outline" 
              className={cn(
                'h-5 px-1.5 gap-1 text-[10px] font-medium border',
                confidence.bg, 
                confidence.text, 
                confidence.border
              )}
            >
              <ConfidenceIcon className="w-2.5 h-2.5" />
              <span>{confidence.shortLabel}</span>
            </Badge>

            {/* LENS Badge (if verified) */}
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
          
          {/* Subtle Divider */}
          <div className="w-px h-5 bg-border/50 hidden sm:block" />
          
          {/* Action Cluster */}
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

      {/* Expanded Panel - Compact details */}
      <CollapsibleContent>
        <div className="bg-muted/10 border-b border-border/40 px-3 py-3 ml-[52px] space-y-2.5">
          {/* Profile Signals - Horizontal flow */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
            {meta.bio && (
              <div className="w-full mb-1">
                <p className="text-sm text-foreground/90">{meta.bio}</p>
              </div>
            )}
            {meta.followers !== undefined && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3 h-3" />
                <span className="font-medium text-foreground">{meta.followers.toLocaleString()}</span>
                <span>followers</span>
              </div>
            )}
            {meta.following !== undefined && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3 h-3" />
                <span className="font-medium text-foreground">{meta.following.toLocaleString()}</span>
                <span>following</span>
              </div>
            )}
            {meta.location && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{meta.location}</span>
              </div>
            )}
            {meta.joined && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Joined {meta.joined}</span>
              </div>
            )}
            {meta.website && (
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-muted-foreground" />
                <a 
                  href={meta.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate max-w-[200px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {meta.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>

          {/* Profile URL - Compact */}
          {profileUrl && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/30">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">URL</span>
              <a 
                href={profileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline truncate flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                {profileUrl}
              </a>
            </div>
          )}

          {/* Raw Metadata - Collapsible */}
          {Object.keys(meta).length > 0 && (
            <details 
              className="pt-2 border-t border-border/30"
              onClick={(e) => e.stopPropagation()}
            >
              <summary className="text-[10px] uppercase tracking-wide text-muted-foreground/70 cursor-pointer hover:text-muted-foreground select-none">
                Raw metadata
              </summary>
              <pre className="mt-2 text-[10px] bg-muted/30 rounded p-2 overflow-x-auto max-h-32 text-muted-foreground">
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
