/**
 * TelegramExposureSnapshot – High-level exposure metrics card.
 * Shows tier-aware stat blocks above the Telegram Intelligence findings.
 */

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Users, Hash, Network, Lock, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProUpgradeModal } from '@/components/results/ProUpgradeModal';
import type { TelegramFinding } from '@/hooks/useTelegramFindings';

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
      {
        label: 'Public profile detected',
        value: hasProfile ? 'Yes' : 'No',
        icon: User,
        proOnly: false,
      },
      {
        label: 'Public associations',
        value: associationCount,
        icon: Users,
        proOnly: true,
      },
      {
        label: 'Channel mentions',
        value: channelCount,
        icon: Hash,
        proOnly: true,
      },
      {
        label: 'Relationship nodes',
        value: entityCount,
        icon: Network,
        proOnly: true,
      },
    ];
  }, [findings]);

  return (
    <>
      <Card className="border-primary/15 bg-gradient-to-br from-primary/[0.03] to-transparent shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-semibold text-foreground">
              Telegram Exposure Snapshot
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              const isLocked = stat.proOnly && !isPro;

              return (
                <div
                  key={stat.label}
                  className={cn(
                    'relative flex flex-col gap-1.5 rounded-lg border p-3 transition-colors',
                    isLocked
                      ? 'border-border/30 bg-muted/20 cursor-pointer hover:border-primary/20 group'
                      : 'border-border/40 bg-card/50'
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
