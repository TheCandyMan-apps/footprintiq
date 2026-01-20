import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ExternalLink, X, Link2, Image, FileText, Users, Sparkles,
  MapPin, Calendar, User, Crosshair, Loader2, CheckCircle, HelpCircle, AlertCircle
} from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';
import { LensVerificationResult, useForensicVerification } from '@/hooks/useForensicVerification';
import { useTierGating } from '@/hooks/useTierGating';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { LensStatusBadge } from '../accounts/LensStatusBadge';
import { LensUpgradePrompt } from '../accounts/LensUpgradePrompt';
import { RESULTS_SEMANTIC_COLORS, RESULTS_ACTION_CLUSTER } from '../styles';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type ClaimType = 'me' | 'not_me';

interface ConnectionsInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProfile: ScanResult | null;
  username: string;
  categoryStats: Record<string, number>;
  connectionStats: Record<string, number>;
  totalProfiles: number;
  scanId?: string;
  // Investigation props
  isFocused?: boolean;
  onFocus?: () => void;
  verificationResult?: LensVerificationResult | null;
  onVerificationComplete?: (result: LensVerificationResult) => void;
  lensScore?: number;
}

const CONNECTION_LABELS: Record<string, { label: string; icon: typeof Link2 }> = {
  username_reuse: { label: 'Username Reuse', icon: Link2 },
  image_match: { label: 'Image Match', icon: Image },
  bio_similarity: { label: 'Bio Similarity', icon: FileText },
  email_link: { label: 'Email Link', icon: Users },
  cross_reference: { label: 'Cross-Reference', icon: Sparkles },
};

const CATEGORY_COLORS: Record<string, string> = {
  social: '#3b82f6',
  professional: '#8b5cf6',
  media: '#ec4899',
  gaming: '#10b981',
  forum: '#f59e0b',
  other: '#6b7280',
};

const CATEGORY_LABELS: Record<string, string> = {
  social: 'Social Media',
  professional: 'Professional',
  media: 'Media & Content',
  gaming: 'Gaming',
  forum: 'Forums',
  other: 'Other',
};

function getMatchConfidence(score: number) {
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
}

export function ConnectionsInspector({
  isOpen,
  onClose,
  selectedProfile,
  username,
  categoryStats,
  connectionStats,
  totalProfiles,
  scanId,
  isFocused = false,
  onFocus,
  verificationResult,
  onVerificationComplete,
  lensScore = 70,
}: ConnectionsInspectorProps) {
  const meta = (selectedProfile?.meta || selectedProfile?.metadata || {}) as Record<string, any>;
  const profileImage = meta.avatar_url || meta.profile_image || meta.image;
  const extractedUsername = meta.username || meta.handle || meta.screen_name;
  
  const { verify, isVerifying } = useForensicVerification();
  const { isFree } = useTierGating();
  const [localVerifying, setLocalVerifying] = useState(false);
  const [showUpgradePopover, setShowUpgradePopover] = useState(false);
  
  const handleVerify = async () => {
    if (!selectedProfile?.url || isVerifying || localVerifying || !scanId) return;
    
    // Show upgrade prompt for free users
    if (isFree) {
      setShowUpgradePopover(true);
      return;
    }
    
    setLocalVerifying(true);
    const result = await verify({ 
      url: selectedProfile.url, 
      platform: selectedProfile.site || 'Unknown', 
      scanId, 
      findingId: selectedProfile.id 
    });
    if (result && onVerificationComplete) {
      onVerificationComplete(result);
    }
    setLocalVerifying(false);
  };
  
  const isVerifyingNow = isVerifying || localVerifying;
  const confidence = getMatchConfidence(lensScore);
  const ConfidenceIcon = confidence.icon;

  return (
    <div
      className={cn(
        "flex-shrink-0 border-l border-border bg-card transition-all duration-200 overflow-hidden",
        isOpen ? "w-72" : "w-0"
      )}
    >
      {isOpen && (
        <div className="w-72 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            <span className="text-sm font-medium">
              {selectedProfile ? 'Node Details' : 'Inspector'}
            </span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {selectedProfile ? (
                <>
                  {/* Profile Header with Image */}
                  <div className="flex items-center gap-3">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt=""
                        className="w-12 h-12 rounded-full object-cover border border-border shadow-sm"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-border">
                        <span className="text-sm font-semibold text-primary">
                          {(selectedProfile.site || 'UN').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: CATEGORY_COLORS[categorizePlatform(selectedProfile.site || '')] }}
                        />
                        <span className="font-semibold text-sm truncate">{selectedProfile.site}</span>
                      </div>
                      {extractedUsername && (
                        <span className="text-xs text-muted-foreground">@{extractedUsername}</span>
                      )}
                    </div>
                  </div>

                  {/* Confidence + LENS Badge */}
                  <div className="flex items-center gap-2">
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
                      {confidence.label}
                    </Badge>
                    {verificationResult && (
                      <LensStatusBadge 
                        status={null}
                        score={verificationResult.confidenceScore}
                        compact={false}
                      />
                    )}
                  </div>

                  {/* Key Fields */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Key Fields
                    </h4>
                    <div className="p-2.5 rounded-lg bg-muted/40 space-y-2">
                      {meta.bio && (
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase">Bio</span>
                          <p className="text-xs line-clamp-3">{meta.bio}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {meta.followers !== undefined && (
                          <Badge variant="outline" className="text-[10px] gap-1 h-5">
                            <User className="w-2.5 h-2.5" />
                            {meta.followers.toLocaleString()}
                          </Badge>
                        )}
                        {meta.location && (
                          <Badge variant="outline" className="text-[10px] gap-1 h-5">
                            <MapPin className="w-2.5 h-2.5" />
                            {meta.location}
                          </Badge>
                        )}
                        {(meta.created_at || meta.joined) && (
                          <Badge variant="outline" className="text-[10px] gap-1 h-5">
                            <Calendar className="w-2.5 h-2.5" />
                            {meta.joined || new Date(meta.created_at).getFullYear()}
                          </Badge>
                        )}
                      </div>
                      {!meta.bio && !meta.followers && !meta.location && (
                        <p className="text-xs text-muted-foreground/60 italic">No metadata available</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Actions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {onFocus && (
                        <Button
                          variant={isFocused ? "default" : "outline"}
                          size="sm"
                          className="flex-1 gap-1.5 text-xs h-8"
                          onClick={onFocus}
                        >
                          <Crosshair className="w-3.5 h-3.5" />
                          {isFocused ? 'Focused' : 'Focus'}
                        </Button>
                      )}
                      {selectedProfile.url && !verificationResult && onVerificationComplete && (
                        isFree ? (
                          <Popover open={showUpgradePopover} onOpenChange={setShowUpgradePopover}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-1.5 text-xs h-8 text-primary border-primary/30 hover:bg-primary/10"
                                onClick={() => setShowUpgradePopover(true)}
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                LENS Verify
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent side="top" align="center" className="w-72 p-0">
                              <LensUpgradePrompt variant="banner" context="verify" />
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1.5 text-xs h-8"
                            onClick={handleVerify}
                            disabled={isVerifyingNow}
                          >
                            {isVerifyingNow ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5" />
                            )}
                            LENS Verify
                          </Button>
                        )
                      )}
                      {selectedProfile.url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5 text-xs h-8"
                          onClick={() => window.open(selectedProfile.url, '_blank')}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* URL */}
                  {selectedProfile.url && (
                    <div className="pt-2 border-t border-border/30">
                      <span className="text-[10px] text-muted-foreground uppercase block mb-1">Profile URL</span>
                      <a 
                        href={selectedProfile.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline break-all line-clamp-2"
                      >
                        {selectedProfile.url}
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Overview Stats */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Graph Summary
                    </h4>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="text-2xl font-bold text-primary">{totalProfiles}</div>
                      <div className="text-xs text-muted-foreground">Connected Profiles</div>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      By Category
                    </h4>
                    <div className="space-y-1.5">
                      {Object.entries(categoryStats)
                        .filter(([_, count]) => count > 0)
                        .sort((a, b) => b[1] - a[1])
                        .map(([category, count]) => (
                          <div key={category} className="flex items-center gap-2 text-xs">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: CATEGORY_COLORS[category] }}
                            />
                            <span className="flex-1">{CATEGORY_LABELS[category] || category}</span>
                            <span className="text-muted-foreground">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Connection Types */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Connection Types
                    </h4>
                    <div className="space-y-1.5">
                      {Object.entries(connectionStats)
                        .filter(([_, count]) => count > 0)
                        .map(([type, count]) => {
                          const info = CONNECTION_LABELS[type];
                          if (!info) return null;
                          const Icon = info.icon;
                          return (
                            <div key={type} className="flex items-center gap-2 text-xs">
                              <Icon className="w-3 h-3 text-muted-foreground" />
                              <span className="flex-1">{info.label}</span>
                              <span className="text-muted-foreground">{count}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </>
              )}

              {/* Tips */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Tips
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Click nodes to inspect</li>
                  <li>• Focus to highlight connections</li>
                  <li>• Double-click to open profile</li>
                </ul>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

function categorizePlatform(site: string): string {
  const siteLower = site.toLowerCase();
  const categories: Record<string, string[]> = {
    social: ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok', 'snapchat', 'mastodon', 'threads', 'pinterest'],
    professional: ['linkedin', 'github', 'gitlab', 'behance', 'dribbble', 'stackoverflow', 'npm', 'pypi'],
    media: ['youtube', 'vimeo', 'soundcloud', 'spotify', 'deviantart', 'flickr', 'medium', 'substack'],
    gaming: ['steam', 'xbox', 'playstation', 'twitch', 'discord', 'roblox', 'epic', 'battlenet', 'minecraft'],
    forum: ['reddit', 'quora', 'hackernews', 'lobsters', '4chan', 'discourse'],
  };
  
  for (const [category, platforms] of Object.entries(categories)) {
    if (platforms.some(p => siteLower.includes(p))) {
      return category;
    }
  }
  return 'other';
}

export default ConnectionsInspector;