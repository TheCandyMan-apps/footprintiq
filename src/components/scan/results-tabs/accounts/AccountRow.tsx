import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { CheckCircle, HelpCircle, AlertCircle, Globe, Clock, Users, MapPin } from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';
import { LensVerificationResult } from '@/hooks/useForensicVerification';
import { cn } from '@/lib/utils';
import { RESULTS_SEMANTIC_COLORS, RESULTS_ROW, RESULTS_ICON_CONTAINER, RESULTS_ACTION_CLUSTER } from '../styles';
import { AccountRowActions } from './AccountRowActions';
import { LensStatusBadge } from './LensStatusBadge';
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

const getPlatformIcon = (platform: string) => {
  const p = platform?.toLowerCase() || '';
  if (p.includes('github') || p.includes('gitlab')) return '🐙';
  if (p.includes('twitter') || p.includes('x.com')) return '🐦';
  if (p.includes('linkedin')) return '💼';
  if (p.includes('facebook') || p.includes('meta')) return '📘';
  if (p.includes('instagram')) return '📷';
  if (p.includes('reddit')) return '🤖';
  if (p.includes('youtube')) return '▶️';
  if (p.includes('tiktok')) return '🎵';
  if (p.includes('discord')) return '💬';
  if (p.includes('telegram')) return '✈️';
  if (p.includes('pinterest')) return '📌';
  if (p.includes('medium')) return '📝';
  if (p.includes('stackoverflow')) return '📚';
  if (p.includes('chaturbate') || p.includes('chatur')) return '🔞';
  if (p.includes('onlyfans')) return '💎';
  if (p.includes('twitch')) return '🎮';
  if (p.includes('spotify')) return '🎧';
  return '🌐';
};

const getMatchConfidence = (score: number) => {
  if (score >= 80) return { 
    label: 'Strong', 
    ...RESULTS_SEMANTIC_COLORS.confidenceHigh,
    icon: CheckCircle 
  };
  if (score >= 60) return { 
    label: 'Medium', 
    ...RESULTS_SEMANTIC_COLORS.confidenceMedium,
    icon: HelpCircle 
  };
  return { 
    label: 'Weak', 
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

// Extract truncated bio for display
const extractBio = (result: ScanResult): string | null => {
  const meta = (result.meta || result.metadata || {}) as Record<string, any>;
  const bio = meta.bio || meta.description || meta.about || meta.summary;
  if (!bio) return null;
  
  if (bio.length > 60) {
    return bio.slice(0, 57) + '...';
  }
  return bio;
};

// Extract full bio for tooltip
const extractFullBio = (result: ScanResult): string | null => {
  const meta = (result.meta || result.metadata || {}) as Record<string, any>;
  return meta.bio || meta.description || meta.about || meta.summary || null;
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
      {/* Main Row */}
      <div className={cn(
        RESULTS_ROW.base,
        !isFocused && !isExpanded && RESULTS_ROW.default,
        isExpanded && !isFocused && RESULTS_ROW.expanded,
        isFocused && RESULTS_ROW.focused
      )}>
        {/* Left: Platform icon in container */}
        <div className={RESULTS_ICON_CONTAINER.platform}>
          <span className="text-2xl" title={platformName}>
            {getPlatformIcon(platformName)}
          </span>
        </div>

        {/* Profile Avatar */}
        {profileImage ? (
          <img 
            src={profileImage} 
            alt=""
            className={RESULTS_ICON_CONTAINER.avatar}
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
            profileImage ? 'hidden' : 'flex'
          )}
        >
          <span className="text-sm font-semibold text-primary">
            {getInitials(username || platformName)}
          </span>
        </div>

        {/* Center: Content */}
        <div className="flex-1 min-w-0">
          {/* Line 1: Platform + Username */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{platformName}</span>
            {username && (
              <>
                <span className="text-muted-foreground text-sm">·</span>
                <span className="text-muted-foreground text-sm truncate">@{username}</span>
              </>
            )}
            {claimStatus === 'me' && (
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" title="This is you" />
            )}
            {claimStatus === 'not_me' && (
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Not you" />
            )}
          </div>
          
          {/* Line 2: Bio with tooltip */}
          <TooltipProvider delayDuration={400}>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className={cn(
                  "text-xs mt-0.5 truncate max-w-md cursor-default",
                  bio ? "text-muted-foreground" : "text-muted-foreground/60 italic"
                )}>
                  {bio || "No bio available"}
                </p>
              </TooltipTrigger>
              {fullBio && fullBio.length > 60 && (
                <TooltipContent side="bottom" className="max-w-sm">
                  <p className="text-xs">{fullBio}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Right: Badges + Divider + Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Badges Group */}
          <div className="flex items-center gap-2">
            {/* Confidence Badge */}
            <Badge 
              variant="outline" 
              className={cn(
                'h-6 px-2 gap-1 text-xs font-medium',
                confidence.bg, 
                confidence.text, 
                confidence.border
              )}
            >
              <ConfidenceIcon className="w-3 h-3" />
              <span className="hidden sm:inline">{confidence.label}</span>
            </Badge>

            {/* LENS Badge (if verified) */}
            {verificationResult && (
              <LensStatusBadge 
                status={null}
                score={verificationResult.confidenceScore}
                compact={false}
              />
            )}
          </div>
          
          {/* Subtle Divider */}
          <div className={RESULTS_ACTION_CLUSTER.divider} />
          
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

      {/* Expanded Panel */}
      <CollapsibleContent>
        <div className="bg-muted/20 border-t border-border/50 px-4 py-3 ml-14 space-y-3">
          {/* Profile Signals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {meta.bio && (
              <div className="col-span-2 sm:col-span-4">
                <span className="text-xs text-muted-foreground block mb-1">Bio</span>
                <p className="text-sm">{meta.bio}</p>
              </div>
            )}
            {meta.followers !== undefined && (
              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" /> Followers
                </span>
                <p className="text-sm font-medium">{meta.followers.toLocaleString()}</p>
              </div>
            )}
            {meta.following !== undefined && (
              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" /> Following
                </span>
                <p className="text-sm font-medium">{meta.following.toLocaleString()}</p>
              </div>
            )}
            {meta.location && (
              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Location
                </span>
                <p className="text-sm">{meta.location}</p>
              </div>
            )}
            {meta.joined && (
              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Joined
                </span>
                <p className="text-sm">{meta.joined}</p>
              </div>
            )}
            {meta.website && (
              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Website
                </span>
                <a 
                  href={meta.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate block"
                >
                  {meta.website}
                </a>
              </div>
            )}
          </div>

          {/* URL */}
          {profileUrl && (
            <div className="pt-2 border-t border-border/30">
              <span className="text-xs text-muted-foreground block mb-1">Profile URL</span>
              <a 
                href={profileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline break-all"
              >
                {profileUrl}
              </a>
            </div>
          )}

          {/* Raw Data Toggle */}
          {Object.keys(meta).length > 0 && (
            <details className="pt-2 border-t border-border/30">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                View raw metadata
              </summary>
              <pre className="mt-2 text-xs bg-muted/50 rounded p-2 overflow-x-auto max-h-40">
                {JSON.stringify(meta, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
