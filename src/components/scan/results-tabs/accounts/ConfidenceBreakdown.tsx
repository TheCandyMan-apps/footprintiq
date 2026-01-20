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
        ? `Username "${username}" found on profile`
        : 'No username could be extracted',
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
        ? 'Profile has a custom image'
        : 'No profile image found',
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
        ? `Profile includes ${profileFields === 3 ? 'bio, location, and website' : profileFields === 2 ? 'multiple details' : 'some details'}`
        : 'Minimal profile information',
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
      label: 'Activity signals',
      description: activityCount > 0 
        ? `Account shows ${activityCount === 3 ? 'strong activity' : activityCount === 2 ? 'moderate activity' : 'some activity'}`
        : 'Limited activity data available',
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
        ? `${platformName} is a well-established platform`
        : platformScore >= 60 
          ? `${platformName} is a known platform`
          : `${platformName} has limited verification`,
      icon: Shield,
      score: platformScore,
      weight: 20,
    });
    
    return result;
  }, [username, meta, hasProfileImage, platformName]);

  // Get overall confidence explanation
  const confidenceExplanation = useMemo(() => {
    if (score >= 80) {
      return 'Strong match — multiple signals indicate this is likely the same person';
    }
    if (score >= 60) {
      return 'Moderate match — some signals align but not all data is consistent';
    }
    return 'Weak match — limited evidence to confirm account ownership';
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
                    {signal.score >= 70 ? 'Strong' : signal.score >= 40 ? 'Partial' : 'Weak'}
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
    const items: { label: string; status: 'strong' | 'partial' | 'weak' }[] = [];
    
    // Username
    if (username && username.length > 2) {
      items.push({ label: 'Username match', status: 'strong' });
    } else {
      items.push({ label: 'Username match', status: 'weak' });
    }
    
    // Image
    items.push({ 
      label: 'Profile image', 
      status: hasProfileImage ? 'strong' : 'weak' 
    });
    
    // Bio
    const hasBio = !!(meta.bio || meta.description || meta.about);
    items.push({ 
      label: 'Bio present', 
      status: hasBio ? 'strong' : 'weak' 
    });
    
    // Platform
    const platformScore = getPlatformReliability(platformName);
    items.push({ 
      label: 'Platform reliability', 
      status: platformScore >= 80 ? 'strong' : platformScore >= 60 ? 'partial' : 'weak' 
    });
    
    return items;
  }, [username, hasProfileImage, meta, platformName]);

  return (
    <div className="space-y-1.5 min-w-[180px]">
      <div className="font-medium text-[11px]">
        {score}% confidence — Why?
      </div>
      <div className="space-y-1">
        {signals.map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-3 text-[10px]">
            <span className="text-foreground/80">{s.label}</span>
            <span className={cn(
              'font-medium',
              s.status === 'strong' && 'text-green-600 dark:text-green-400',
              s.status === 'partial' && 'text-amber-600 dark:text-amber-400',
              s.status === 'weak' && 'text-muted-foreground'
            )}>
              {s.status === 'strong' ? '✓' : s.status === 'partial' ? '~' : '—'}
            </span>
          </div>
        ))}
      </div>
      <div className="text-[9px] text-muted-foreground pt-1 border-t border-border/30">
        Expand row for full breakdown
      </div>
    </div>
  );
}
