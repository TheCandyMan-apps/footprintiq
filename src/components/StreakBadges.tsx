import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Flame, Award, Share2, Trophy, Shield, Sparkles, Copy, Check } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface StreakBadgesProps {
  userId: string | undefined;
}

export const StreakBadges = ({ userId }: StreakBadgesProps) => {
  const { achievements, loading } = useAchievements(userId);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareMessage = "I'm a Privacy Pro 🛡️ — scan your digital footprint at footprintiq.app";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FootprintIQ',
          text: shareMessage,
          url: 'https://footprintiq.app',
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      await handleCopy();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Share message copied to clipboard',
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Unable to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Streak Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Daily Streak
            </CardTitle>
            <div className="flex items-center gap-1">
              <span className="text-3xl font-bold text-primary">{achievements.currentStreak}</span>
              <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
            </div>
          </div>
          <CardDescription>
            Longest streak: {achievements.longestStreak} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Scans</p>
              <p className="text-2xl font-bold">{achievements.totalScans}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Removals Requested</p>
              <p className="text-2xl font-bold">{achievements.totalRemovals}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Achievements
            </CardTitle>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              {achievements.badges.length}
            </Badge>
          </div>
          <CardDescription>
            Unlock badges by completing scans and protecting your privacy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.badges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <TooltipProvider>
                {achievements.badges.map((badge) => (
                  <Tooltip key={badge.id}>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center p-3 rounded-lg border bg-card hover:bg-accent/10 transition-colors cursor-pointer">
                        <span className="text-3xl mb-1">{badge.icon}</span>
                        <span className="text-xs font-medium text-center">{badge.name}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-medium">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Complete your first scan to start earning badges!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Card */}
      {achievements.badges.length > 0 && (
        <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-4 h-4 text-accent" />
              Share Your Achievement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{shareMessage}</p>
            <div className="flex gap-2">
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button onClick={handleCopy} variant="outline" size="icon">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
