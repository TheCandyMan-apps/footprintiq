/**
 * ProfilesExposureSection Component
 * 
 * Unified UI section displaying aggregated profiles and exposures.
 * Replaces raw provider cards with clean, deduplicated data.
 * 
 * Free: Shows counts + 2-3 example profiles + "+ N more (Pro)"
 * Pro: Shows full list with confidence and source context
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Globe, Lock, ChevronRight, AlertTriangle, CheckCircle, 
  User, ExternalLink, Shield, Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  aggregateResults, 
  getDisplayProfiles, 
  getExposureSummaries,
  type AggregatedProfile,
  type AggregatedResults 
} from '@/lib/results/resultsAggregator';
import { PlatformIconBadge } from '@/components/ui/PlatformIcon';

interface ProfilesExposureSectionProps {
  results: any[];
  isFullAccess: boolean;
  onUpgradeClick?: () => void;
  onViewAllClick?: () => void;
  className?: string;
}

// Profile row component
function ProfileRow({ 
  profile, 
  isFullAccess,
  showSources = false,
}: { 
  profile: AggregatedProfile; 
  isFullAccess: boolean;
  showSources?: boolean;
}) {
  const confidenceConfig = useMemo(() => {
    if (profile.confidence >= 80) return { label: 'High', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10' };
    if (profile.confidence >= 60) return { label: 'Medium', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' };
    return { label: 'Low', color: 'text-muted-foreground', bg: 'bg-muted/30' };
  }, [profile.confidence]);

  return (
    <div className="flex items-center gap-3 py-2 px-3 hover:bg-muted/30 rounded-lg transition-colors group">
      {/* Platform Icon + Avatar */}
      <div className="relative shrink-0">
        <PlatformIconBadge 
          platform={profile.platform} 
          url={profile.url} 
          size="md"
          position="top-left"
        />
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted/20 border border-border/30 ml-1 mt-1">
          {profile.avatarUrl ? (
            <img 
              src={profile.avatarUrl} 
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <User className="w-4 h-4 text-primary/40" />
            </div>
          )}
        </div>
      </div>

      {/* Platform + Username + Bio */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-semibold text-sm capitalize">{profile.platform}</span>
          {profile.username && (
            <span className="text-xs text-muted-foreground">@{profile.username}</span>
          )}
        </div>
        {profile.bio ? (
          <p className="text-xs text-muted-foreground truncate max-w-sm">
            {profile.bio.slice(0, 60)}{profile.bio.length > 60 ? '…' : ''}
          </p>
        ) : profile.displayName && (
          <p className="text-xs text-muted-foreground truncate">
            {profile.displayName}
          </p>
        )}
        
        {/* Source providers (Pro only) */}
        {showSources && isFullAccess && profile.sources.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] text-muted-foreground/60">via</span>
            {profile.sources.slice(0, 2).map((source, i) => (
              <Badge key={i} variant="outline" className="text-[9px] px-1 py-0 h-4">
                {source}
              </Badge>
            ))}
            {profile.sources.length > 2 && (
              <span className="text-[9px] text-muted-foreground/60">
                +{profile.sources.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Confidence Badge (Pro only) */}
      {isFullAccess && (
        <Badge 
          variant="outline" 
          className={cn('text-[10px] px-1.5 py-0 h-5 shrink-0', confidenceConfig.bg, confidenceConfig.color)}
        >
          {profile.confidence}%
        </Badge>
      )}

      {/* External Link */}
      {profile.url && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          asChild
        >
          <a href={profile.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </Button>
      )}
    </div>
  );
}

// Exposure row component  
function ExposureRow({ 
  profile, 
  isFullAccess,
}: { 
  profile: AggregatedProfile; 
  isFullAccess: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 bg-destructive/5 hover:bg-destructive/10 rounded-lg transition-colors border border-destructive/20">
      <div className="p-2 rounded-lg bg-destructive/10 shrink-0">
        <AlertTriangle className="w-4 h-4 text-destructive" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-sm text-destructive capitalize">
            {profile.exposureDetails?.breachName || profile.platform}
          </span>
          {profile.exposureDetails?.breachDate && (
            <span className="text-xs text-muted-foreground">
              {profile.exposureDetails.breachDate}
            </span>
          )}
        </div>
        {isFullAccess && profile.exposureDetails?.exposedDataTypes && 
         profile.exposureDetails.exposedDataTypes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.exposureDetails.exposedDataTypes.slice(0, 4).map((type, i) => (
              <Badge key={i} variant="outline" className="text-[9px] px-1 py-0 h-4 text-destructive/80">
                {type}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProfilesExposureSection({
  results,
  isFullAccess,
  onUpgradeClick,
  onViewAllClick,
  className,
}: ProfilesExposureSectionProps) {
  // Aggregate results
  const aggregated = useMemo(() => aggregateResults(results), [results]);
  
  // Get display data based on plan
  const profileData = useMemo(() => 
    getDisplayProfiles(aggregated, isFullAccess, isFullAccess ? 50 : 3),
    [aggregated, isFullAccess]
  );
  
  const exposureData = useMemo(() => 
    getExposureSummaries(aggregated, isFullAccess, isFullAccess ? 20 : 2),
    [aggregated, isFullAccess]
  );

  if (aggregated.counts.totalProfiles === 0) {
    return (
      <Card className={cn('border-border/50', className)}>
        <CardContent className="py-8 text-center">
          <Shield className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-base font-medium mb-2">No profiles detected</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            We didn't find any public profiles or exposures for this identifier.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-border/50 overflow-hidden', className)}>
      {/* Header with authoritative counts */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Profiles & Exposure
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {aggregated.counts.totalProfiles} found
            </Badge>
            {aggregated.counts.totalExposures > 0 && (
              <Badge variant="destructive" className="text-xs">
                {aggregated.counts.totalExposures} exposed
              </Badge>
            )}
          </div>
        </div>
        
        {/* Summary stats for Pro users */}
        {isFullAccess && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              {aggregated.counts.highConfidence} high confidence
            </span>
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {aggregated.counts.publicProfiles} public profiles
            </span>
            {aggregated.deduplication.mergedCount > 0 && (
              <span className="text-muted-foreground/60">
                {aggregated.deduplication.mergedCount} cross-validated
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Exposures section (shown first if any) */}
        {exposureData.totalCount > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-destructive flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" />
              Data Exposures
            </h4>
            <div className="space-y-1.5">
              {exposureData.visible.map((profile) => (
                <ExposureRow 
                  key={profile.id} 
                  profile={profile} 
                  isFullAccess={isFullAccess}
                />
              ))}
            </div>
            {!isFullAccess && exposureData.hiddenCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-xs text-muted-foreground hover:text-primary"
                onClick={onUpgradeClick}
              >
                <Lock className="h-3 w-3 mr-1.5" />
                + {exposureData.hiddenCount} more exposures (Pro)
                <ChevronRight className="h-3 w-3 ml-auto" />
              </Button>
            )}
          </div>
        )}

        {/* Profiles section */}
        {profileData.totalCount > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <User className="h-3 w-3" />
              Public Profiles
            </h4>
            <div className="space-y-1">
              {profileData.visible.map((profile) => (
                <ProfileRow 
                  key={profile.id} 
                  profile={profile} 
                  isFullAccess={isFullAccess}
                  showSources={isFullAccess}
                />
              ))}
            </div>
            
            {/* Locked indicator for Free users */}
            {!isFullAccess && profileData.hiddenCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-xs text-muted-foreground hover:text-primary"
                onClick={onUpgradeClick}
              >
                <Lock className="h-3 w-3 mr-1.5" />
                + {profileData.hiddenCount} more profiles (Pro)
                <ChevronRight className="h-3 w-3 ml-auto" />
              </Button>
            )}
            
            {/* View all for Pro users */}
            {isFullAccess && profileData.totalCount > profileData.visible.length && onViewAllClick && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-xs"
                onClick={onViewAllClick}
              >
                View all {profileData.totalCount} profiles
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        )}

        {/* Upgrade prompt for Free users */}
        {!isFullAccess && (profileData.hiddenCount > 0 || exposureData.hiddenCount > 0) && (
          <div className="pt-2 border-t border-border/30">
            <Button
              size="sm"
              className="w-full gap-2"
              onClick={onUpgradeClick}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Unlock Full Report
            </Button>
            <p className="text-[10px] text-center text-muted-foreground mt-2">
              Pro shows all {aggregated.counts.totalProfiles} profiles with confidence scoring and source details.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ProfilesExposureSection;
