import { useMemo } from 'react';
import { 
  User, Image, FileText, Activity, Shield, 
  CheckCircle, AlertCircle, Minus, HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ConfidenceSignal {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  score: number; // 0-100
  weight: number; // How much this contributes
}

interface ConfidenceBreakdownProps {
  score: number;
  username: string | null;
  platformName: string;
  meta: Record<string, any>;
  hasProfileImage: boolean;
  className?: string;
}

// Platform reliability scores (well-known = more reliable)
const PLATFORM_RELIABILITY: Record<string, number> = {
  'github': 90,
  'linkedin': 95,
  'twitter': 80,
  'x': 80,
  'facebook': 85,
  'instagram': 75,
  'reddit': 70,
  'youtube': 85,
  'stackoverflow': 90,
  'medium': 80,
  'twitch': 75,
  'discord': 65,
  'telegram': 60,
  'tiktok': 70,
  'pinterest': 65,
  'tumblr': 60,
  'mastodon': 70,
  'bluesky': 70,
  'threads': 75,
};

function getPlatformReliability(platform: string): number {
  const p = platform.toLowerCase();
  for (const [key, score] of Object.entries(PLATFORM_RELIABILITY)) {
    if (p.includes(key)) return score;
  }
  return 50; // Unknown platforms get neutral score
}

function getSignalIcon(score: number) {
  if (score >= 70) return { icon: CheckCircle, color: 'text-green-600 dark:text-green-400' };
  if (score >= 40) return { icon: Minus, color: 'text-amber-600 dark:text-amber-400' };
  return { icon: AlertCircle, color: 'text-muted-foreground' };
}

export function ConfidenceBreakdown({
  score,
  username,
  platformName,
  meta,
  hasProfileImage,
  className,
}: ConfidenceBreakdownProps) {
  // Calculate individual signals
  const signals = useMemo((): ConfidenceSignal[] => {
    const result: ConfidenceSignal[] = [];
    
    // 1. Username match strength
    const usernameScore = username ? 
      (username.length > 3 ? 85 : 60) : 30;
    result.push({
      id: 'username',
      label: 'Username match',
       description: username 
        ? `Username "@${username}" matches the searched identifier`
        : 'Username not publicly listed by this platform',
      icon: User,
      score: usernameScore,
      weight: 25,
    });
    
    // 2. Profile image presence
    const imageScore = hasProfileImage ? 80 : 20;
    result.push({
      id: 'image',
      label: 'Profile image',
      description: hasProfileImage 
        ? 'Custom profile image present — can be used for visual comparison'
        : 'No profile image available for visual verification',
      icon: Image,
      score: imageScore,
      weight: 20,
    });
    
    // 3. Bio/profile completeness
    const hasBio = !!(meta.bio || meta.description || meta.about || meta.summary);
    const hasLocation = !!(meta.location && meta.location !== 'Unknown');
    const hasWebsite = !!meta.website;
    const profileFields = [hasBio, hasLocation, hasWebsite].filter(Boolean).length;
    const bioScore = Math.min(30 + (profileFields * 25), 90);
    result.push({
      id: 'bio',
      label: 'Profile completeness',
      description: profileFields > 0 
        ? `Profile contains ${profileFields === 3 ? 'bio, location, and website link' : profileFields === 2 ? 'multiple identifying details' : 'some identifying information'}`
        : 'Limited public information on this profile',
      icon: FileText,
      score: bioScore,
      weight: 20,
    });
    
    // 4. Activity signals
    const hasFollowers = meta.followers !== undefined && meta.followers > 0;
    const hasJoinDate = !!meta.joined;
    const hasPosts = meta.posts !== undefined || meta.tweets !== undefined;
    const activityCount = [hasFollowers, hasJoinDate, hasPosts].filter(Boolean).length;
    const activityScore = activityCount > 0 ? 40 + (activityCount * 20) : 30;
    result.push({
      id: 'activity',
      label: 'Activity indicators',
      description: activityCount > 0 
        ? `Account shows ${activityCount === 3 ? 'consistent activity patterns' : activityCount === 2 ? 'moderate engagement history' : 'some usage indicators'}`
        : 'Insufficient activity data for analysis',
      icon: Activity,
      score: activityScore,
      weight: 15,
    });
    
    // 5. Platform reliability
    const platformScore = getPlatformReliability(platformName);
    result.push({
      id: 'platform',
      label: 'Platform reliability',
      description: platformScore >= 80 
        ? `${platformName} is a verified, well-established platform`
        : platformScore >= 60 
          ? `${platformName} is a recognised platform with moderate verification`
          : `${platformName} has limited identity verification processes`,
      icon: Shield,
      score: platformScore,
      weight: 20,
    });
    
    return result;
  }, [username, meta, hasProfileImage, platformName]);

  // Get overall confidence explanation
  const confidenceExplanation = useMemo(() => {
    if (score >= 80) {
      return 'High confidence — multiple data points strongly suggest this account belongs to the same individual';
    }
    if (score >= 60) {
      return 'Moderate confidence — some indicators align, but additional verification recommended';
    }
    return 'Low confidence — insufficient evidence to confirm identity; manual review suggested';
  }, [score]);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Summary */}
      <div className="text-[12px] text-foreground/80 leading-relaxed">
        {confidenceExplanation}
      </div>
      
      {/* Signals breakdown */}
      <div className="space-y-2">
        {signals.map((signal) => {
          const { icon: StatusIcon, color } = getSignalIcon(signal.score);
          const SignalIcon = signal.icon;
          
          return (
            <div key={signal.id} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <SignalIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[11px] font-medium text-foreground truncate">
                    {signal.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <StatusIcon className={cn('w-3 h-3', color)} />
                  <span className={cn('text-[10px] font-medium', color)}>
                    {signal.score >= 70 ? 'Confirmed' : signal.score >= 40 ? 'Partial' : 'Insufficient'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={signal.score} 
                  className="h-1 flex-1" 
                />
                <span className="text-[9px] text-muted-foreground/60 w-6 text-right">
                  {signal.weight}%
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug pl-5">
                {signal.description}
              </p>
            </div>
          );
        })}
      </div>
      
      {/* Weight explanation */}
      <p className="text-[9px] text-muted-foreground/60 pt-1 border-t border-border/20">
        Each signal contributes to the overall score based on its weight (shown as %)
      </p>
    </div>
  );
}

// Compact tooltip version
export function ConfidenceTooltipContent({
  score,
  username,
  platformName,
  meta,
  hasProfileImage,
}: Omit<ConfidenceBreakdownProps, 'className'>) {
  const signals = useMemo(() => {
    const items: { label: string; status: 'confirmed' | 'partial' | 'insufficient' }[] = [];
    
    // Username
    if (username && username.length > 2) {
      items.push({ label: 'Username match', status: 'confirmed' });
    } else {
      items.push({ label: 'Username match', status: 'insufficient' });
    }
    
    // Image
    items.push({ 
      label: 'Profile image', 
      status: hasProfileImage ? 'confirmed' : 'insufficient' 
    });
    
    // Bio
    const hasBio = !!(meta.bio || meta.description || meta.about);
    items.push({ 
      label: 'Profile details', 
      status: hasBio ? 'confirmed' : 'insufficient' 
    });
    
    // Platform
    const platformScore = getPlatformReliability(platformName);
    items.push({ 
      label: 'Platform trust', 
      status: platformScore >= 80 ? 'confirmed' : platformScore >= 60 ? 'partial' : 'insufficient' 
    });
    
    return items;
  }, [username, hasProfileImage, meta, platformName]);

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return 'High confidence';
    if (score >= 60) return 'Moderate confidence';
    return 'Low confidence — may require manual verification';
  };

  return (
    <div className="space-y-1.5 min-w-[200px]">
      <div className="font-medium text-[11px]">
        {getConfidenceLabel(score)}
      </div>
      <div className="text-[10px] text-muted-foreground mb-1">
        Based on {signals.filter(s => s.status === 'confirmed').length} of {signals.length} indicators
      </div>
      <div className="space-y-1">
        {signals.map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-3 text-[10px]">
            <span className="text-foreground/80">{s.label}</span>
            <span className={cn(
              'font-medium',
              s.status === 'confirmed' && 'text-green-600 dark:text-green-400',
              s.status === 'partial' && 'text-amber-600 dark:text-amber-400',
              s.status === 'insufficient' && 'text-muted-foreground'
            )}>
              {s.status === 'confirmed' ? 'Confirmed' : s.status === 'partial' ? 'Partial' : 'Insufficient'}
            </span>
          </div>
        ))}
      </div>
      <div className="text-[9px] text-muted-foreground pt-1 border-t border-border/30">
        Expand for detailed analysis
      </div>
    </div>
  );
}
