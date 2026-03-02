/**
 * TelegramExposureSnapshot – High-level exposure metrics card.
 * Shows tier-aware stat blocks above the Telegram Intelligence findings.
 */

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Users, Hash, Network, Lock, Sparkles, ChevronRight, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProUpgradeModal } from '@/components/results/ProUpgradeModal';
import type { TelegramFinding } from '@/hooks/useTelegramFindings';
import { riskBadgeClass, BADGE_SIZE } from '@/lib/badgeStyles';

interface TelegramExposureSnapshotProps {
  findings: TelegramFinding[];
  isPro: boolean;
}

interface StatBlock {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  proOnly: boolean;
}

export function TelegramExposureSnapshot({ findings, isPro }: TelegramExposureSnapshotProps) {
  const [showModal, setShowModal] = useState(false);

  const stats = useMemo<StatBlock[]>(() => {
    const profileKinds = ['profile', 'profile_presence', 'telegram_username'];
    const channelKinds = ['channel', 'channel_footprint', 'channel_profile'];
    const entityKinds = ['entity', 'related_entity'];
    const associationKinds = ['activity_intel', ...entityKinds];

    const hasProfile = findings.some(f => profileKinds.includes(f.kind || ''));
    const channelCount = findings.filter(f => channelKinds.includes(f.kind || '')).length;
    const associationCount = findings.filter(f => associationKinds.includes(f.kind || '')).length;
    const entityCount = findings.filter(f => entityKinds.includes(f.kind || '')).length;

    return [
      { label: 'Public profile detected', value: hasProfile ? 'Yes' : 'No', icon: User, proOnly: false },
      { label: 'Public associations', value: associationCount, icon: Users, proOnly: true },
      { label: 'Channel mentions', value: channelCount, icon: Hash, proOnly: true },
      { label: 'Relationship nodes', value: entityCount, icon: Network, proOnly: true },
    ];
  }, [findings]);

  const exposureLevel = useMemo(() => {
    const assoc = typeof stats[1]?.value === 'number' ? stats[1].value : 0;
    const mentions = typeof stats[2]?.value === 'number' ? stats[2].value : 0;
    const nodes = typeof stats[3]?.value === 'number' ? stats[3].value : 0;
    const total = assoc + mentions + nodes;

    if (total >= 6) return 'elevated' as const;
    if (total >= 2) return 'moderate' as const;
    return 'minimal' as const;
  }, [stats]);

  const levelConfig = {
    minimal:  { label: 'Minimal',  key: 'low' as const,      icon: ShieldCheck, color: 'text-green-700 dark:text-green-400',  bg: 'bg-green-500/5', border: 'border-green-500/15', dot: 'bg-green-500' },
    moderate: { label: 'Moderate', key: 'moderate' as const,  icon: ShieldAlert, color: 'text-amber-700 dark:text-amber-400',  bg: 'bg-amber-500/5', border: 'border-amber-500/15', dot: 'bg-amber-500' },
    elevated: { label: 'Elevated', key: 'elevated' as const,  icon: ShieldX,     color: 'text-destructive',                    bg: 'bg-destructive/5', border: 'border-destructive/15', dot: 'bg-destructive' },
  };

  const level = levelConfig[exposureLevel];
  const LevelIcon = level.icon;

  return (
    <>
      <Card className="border-border/30 bg-card">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-semibold tracking-[0.01em] text-foreground">
              Telegram Exposure Snapshot
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          {/* Exposure Level Indicator */}
          <div className={cn('flex items-center gap-2.5 rounded-xl border px-3 py-2', level.bg, level.border)}>
            <LevelIcon className={cn('h-4 w-4', level.color)} />
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-foreground">Exposure Level</span>
              <div className={cn('h-1.5 w-1.5 rounded-full', level.dot)} />
              <Badge variant="outline" className={cn(BADGE_SIZE, riskBadgeClass(level.key))}>{level.label}</Badge>
            </div>
            {!isPro && (
              <Badge
                variant="outline"
                className="ml-auto text-[8px] h-3.5 px-1 border-primary/30 text-primary/70 gap-0.5 cursor-pointer"
                onClick={() => setShowModal(true)}
              >
                <Lock className="h-2 w-2" /> Pro
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              const isLocked = stat.proOnly && !isPro;

              return (
                <div
                  key={stat.label}
                  className={cn(
                    'relative flex flex-col gap-1.5 rounded-xl border p-3 transition-colors',
                    isLocked
                      ? 'border-border/25 bg-muted/15 cursor-pointer hover:border-primary/20 group'
                      : 'border-border/30 bg-card/50'
                  )}
                  onClick={isLocked ? () => setShowModal(true) : undefined}
                >
                  {/* Icon + Pro badge */}
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      'flex items-center justify-center w-7 h-7 rounded-md',
                      isLocked ? 'bg-muted/40' : 'bg-primary/10'
                    )}>
                      <Icon className={cn(
                        'h-3.5 w-3.5',
                        isLocked ? 'text-muted-foreground/60' : 'text-primary'
                      )} />
                    </div>
                    {isLocked && (
                      <Badge
                        variant="outline"
                        className="text-[8px] h-3.5 px-1 border-primary/30 text-primary/70 gap-0.5 group-hover:text-primary"
                      >
                        <Lock className="h-2 w-2" />
                        Pro
                      </Badge>
                    )}
                  </div>

                  {/* Value */}
                  <div className={cn(
                    'text-lg font-bold leading-none tracking-tight',
                    isLocked ? 'blur-[5px] select-none text-muted-foreground' : 'text-foreground'
                  )}>
                    {stat.value}
                  </div>

                  {/* Label */}
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {stat.label}
                  </p>

                  {/* Hover CTA for locked stats */}
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/60 rounded-lg">
                      <span className="flex items-center gap-1 text-[10px] font-medium text-primary">
                        Unlock <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <ProUpgradeModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
}
