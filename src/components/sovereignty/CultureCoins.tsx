import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SovereigntyRequest } from '@/hooks/useSovereignty';
import { Coins, Trophy, Target, Shield, Zap, Star } from 'lucide-react';

interface CultureCoinsProps {
  requests: SovereigntyRequest[];
  score: number;
  totalScans?: number;
}

interface Achievement {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  coins: number;
}

export function CultureCoins({ requests, score, totalScans = 0 }: CultureCoinsProps) {
  const stats = useMemo(() => ({
    completed: requests.filter(r => r.status === 'completed').length,
    submitted: requests.filter(r => r.status === 'submitted').length,
    total: requests.length,
  }), [requests]);

  // Calculate coins earned
  const coins = useMemo(() => {
    let total = 0;
    total += stats.completed * 50;   // 50 coins per successful removal
    total += stats.submitted * 10;   // 10 coins per submitted request
    total += totalScans * 5;         // 5 coins per scan
    total += score >= 70 ? 100 : 0;  // 100 coin bonus for high score
    total += score >= 90 ? 200 : 0;  // 200 coin bonus for excellent score
    return total;
  }, [stats, totalScans, score]);

  const level = useMemo(() => {
    if (coins >= 1000) return { name: 'Sovereign', tier: 5, nextAt: null };
    if (coins >= 500) return { name: 'Guardian', tier: 4, nextAt: 1000 };
    if (coins >= 200) return { name: 'Defender', tier: 3, nextAt: 500 };
    if (coins >= 50) return { name: 'Aware', tier: 2, nextAt: 200 };
    return { name: 'Rookie', tier: 1, nextAt: 50 };
  }, [coins]);

  const progressToNext = level.nextAt ? Math.min(100, (coins / level.nextAt) * 100) : 100;

  const achievements: Achievement[] = useMemo(() => [
    { id: 'first_scan', label: 'First Scan', description: 'Complete your first OSINT scan', icon: <Target className="h-4 w-4" />, earned: totalScans > 0, coins: 10 },
    { id: 'first_removal', label: 'First Removal', description: 'Complete your first erasure request', icon: <Shield className="h-4 w-4" />, earned: stats.completed >= 1, coins: 50 },
    { id: 'five_removals', label: 'Privacy Champion', description: 'Complete 5 successful removals', icon: <Zap className="h-4 w-4" />, earned: stats.completed >= 5, coins: 100 },
    { id: 'high_score', label: 'Sovereignty Elite', description: 'Reach a sovereignty score of 70+', icon: <Star className="h-4 w-4" />, earned: score >= 70, coins: 100 },
    { id: 'perfect_score', label: 'Digital Sovereign', description: 'Reach a sovereignty score of 90+', icon: <Trophy className="h-4 w-4" />, earned: score >= 90, coins: 200 },
  ], [totalScans, stats.completed, score]);

  const earnedCount = achievements.filter(a => a.earned).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Coins className="h-4 w-4 text-yellow-500" />
          Culture Coins
          <Badge variant="outline" className="ml-auto text-yellow-600 border-yellow-500/30 text-xs font-bold">
            {coins} 🪙
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level progress */}
        <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-primary" />
              Level {level.tier}: {level.name}
            </span>
            {level.nextAt && (
              <span className="text-xs text-muted-foreground">{coins}/{level.nextAt}</span>
            )}
          </div>
          <Progress value={progressToNext} className="h-2" />
          {level.nextAt && (
            <p className="text-xs text-muted-foreground">
              {level.nextAt - coins} coins to next level
            </p>
          )}
        </div>

        {/* Achievements */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Achievements ({earnedCount}/{achievements.length})
            </span>
          </div>
          <div className="space-y-1.5">
            {achievements.map(a => (
              <div
                key={a.id}
                className={`flex items-center gap-2 rounded-md border p-2 text-sm transition-opacity ${
                  a.earned ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <span className={a.earned ? 'text-primary' : 'text-muted-foreground'}>{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-xs">{a.label}</span>
                  <p className="text-[10px] text-muted-foreground truncate">{a.description}</p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0 text-yellow-600">
                  +{a.coins} 🪙
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
