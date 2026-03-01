/**
 * WhatsAppTab – WhatsApp Messaging Intelligence tab.
 *
 * Sections:
 *  - Core Intelligence (Free users): presence detection, basic profile info
 *  - Advanced Signals (Pro only): web mentions, scam DB, breaches, cross-platform
 *  - Experimental (feature-flagged, Pro only): best-effort beta signals
 *
 * Privacy: Does NOT display privacy settings, linked devices, or invasive fields.
 */

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Lock, Phone, Shield, Info, MessageCircle, Globe, AlertTriangle,
  ShieldCheck, ShieldAlert, ShieldX, Sparkles, ChevronRight, CheckCircle2,
  XCircle, Building2, Search, Link2, Beaker, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { flags } from '@/lib/featureFlags';
import { ProUpgradeModal } from '@/components/results/ProUpgradeModal';
import type {
  WhatsAppSignalBundle,
  WhatsAppSignal,
  WhatsAppSignalCategory,
} from '@/lib/messaging/whatsapp_signal_adapter';
import {
  processWhatsAppSignals,
  getVisibleSignals,
  groupSignalsByCategory,
  calculateWhatsAppRiskScore,
} from '@/lib/messaging/whatsapp_signal_adapter';

interface WhatsAppTabProps {
  scanId: string;
  isPro: boolean;
  phoneNumber?: string;
}

// ── Category config ─────────────────────────────────────────────

const CATEGORY_CONFIG: Record<WhatsAppSignalCategory, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  proOnly: boolean;
}> = {
  presence: {
    label: 'Presence Detection',
    icon: Phone,
    description: 'WhatsApp registration and public profile signals',
    proOnly: false,
  },
  business_profile: {
    label: 'Business Profile',
    icon: Building2,
    description: 'Public business account information',
    proOnly: false,
  },
  web_mentions: {
    label: 'Web Mentions',
    icon: Globe,
    description: 'Public references to this number across the web',
    proOnly: true,
  },
  scam_db: {
    label: 'Scam Database',
    icon: AlertTriangle,
    description: 'Reports from public scam and spam databases',
    proOnly: true,
  },
  breach_linkage: {
    label: 'Breach Linkage',
    icon: ShieldAlert,
    description: 'Appearances in known data breaches',
    proOnly: true,
  },
  cross_platform: {
    label: 'Cross-Platform Reuse',
    icon: Link2,
    description: 'Same number found on other messaging platforms',
    proOnly: true,
  },
  experimental: {
    label: 'Experimental Signals',
    icon: Beaker,
    description: 'Best-effort / Beta — accuracy may vary',
    proOnly: true,
  },
};

// ── Exposure Snapshot ───────────────────────────────────────────

function WhatsAppExposureSnapshot({
  bundle,
  isPro,
  onUpgrade,
}: {
  bundle: WhatsAppSignalBundle;
  isPro: boolean;
  onUpgrade: () => void;
}) {
  const coreSignals = bundle.signals.filter(s => !s.proOnly && !s.experimental);
  const advancedSignals = bundle.signals.filter(s => s.proOnly && !s.experimental);
  const experimentalSignals = bundle.signals.filter(s => s.experimental);

  const riskLevel = useMemo(() => {
    const score = bundle.riskContribution;
    if (score >= 60) return 'elevated' as const;
    if (score >= 30) return 'moderate' as const;
    return 'minimal' as const;
  }, [bundle.riskContribution]);

  const levelConfig = {
    minimal: { label: 'Minimal', icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', dot: 'bg-green-500' },
    moderate: { label: 'Moderate', icon: ShieldAlert, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-500' },
    elevated: { label: 'Elevated', icon: ShieldX, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-500' },
  };

  const level = levelConfig[riskLevel];
  const LevelIcon = level.icon;

  const stats = [
    { label: 'Core Signals', value: coreSignals.length, proOnly: false },
    { label: 'Advanced Signals', value: advancedSignals.length, proOnly: true },
    { label: 'Risk Score', value: `${bundle.riskContribution}/100`, proOnly: true },
    { label: 'Confidence', value: `${Math.round(bundle.overallConfidence * 100)}%`, proOnly: true },
  ];

  return (
    <Card className="border-primary/15 bg-gradient-to-br from-primary/[0.03] to-transparent shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-green-500/10">
            <MessageCircle className="h-4 w-4 text-green-600" />
          </div>
          <CardTitle className="text-sm font-semibold text-foreground">
            WhatsApp Exposure Snapshot
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className={cn('flex items-center gap-2.5 rounded-lg border px-3 py-2', level.bg, level.border)}>
          <LevelIcon className={cn('h-4 w-4', level.color)} />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">Exposure Level</span>
            <div className={cn('h-1.5 w-1.5 rounded-full', level.dot)} />
            <span className={cn('text-xs font-semibold', level.color)}>{level.label}</span>
          </div>
          {!isPro && (
            <Badge
              variant="outline"
              className="ml-auto text-[8px] h-3.5 px-1 border-primary/30 text-primary/70 gap-0.5 cursor-pointer"
              onClick={onUpgrade}
            >
              <Lock className="h-2 w-2" /> Pro
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat) => {
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
                onClick={isLocked ? onUpgrade : undefined}
              >
                <div className={cn(
                  'text-lg font-bold leading-none tracking-tight',
                  isLocked ? 'blur-[5px] select-none text-muted-foreground' : 'text-foreground'
                )}>
                  {stat.value}
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">{stat.label}</p>
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
  );
}

// ── Signal Card ─────────────────────────────────────────────────

function SignalCard({ signal }: { signal: WhatsAppSignal }) {
  const displayValue = typeof signal.value === 'boolean'
    ? (signal.value ? 'Detected' : 'Not detected')
    : String(signal.value);

  const ValueIcon = typeof signal.value === 'boolean'
    ? (signal.value ? CheckCircle2 : XCircle)
    : Eye;

  const valueColor = typeof signal.value === 'boolean'
    ? (signal.value ? 'text-amber-500' : 'text-green-500')
    : 'text-foreground';

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-card/30">
      <ValueIcon className={cn('h-4 w-4 mt-0.5 shrink-0', valueColor)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{signal.label}</span>
          {signal.experimental && (
            <Badge variant="outline" className="text-[8px] h-3.5 px-1 border-amber-500/30 text-amber-600 dark:text-amber-400">
              Beta
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{displayValue}</p>
        {signal.evidence && signal.evidence.length > 0 && (
          <div className="mt-2 space-y-0.5">
            {signal.evidence.map((ev, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="font-medium text-foreground/70">{ev.key}:</span>
                <span className="truncate">{ev.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 shrink-0">
              <Badge
                variant="outline"
                className={cn(
                  'text-[8px] h-3.5 px-1',
                  signal.confidence === 'high' ? 'border-green-500/30 text-green-600' :
                  signal.confidence === 'medium' ? 'border-amber-500/30 text-amber-600' :
                  'border-muted-foreground/30 text-muted-foreground'
                )}
              >
                {signal.confidence}
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs max-w-[200px]">
            Confidence: {Math.round(signal.confidenceScore * 100)}% — reflects signal strength, not identity certainty.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

// ── Category Section ────────────────────────────────────────────

function CategorySection({
  category,
  signals,
  isPro,
  onUpgrade,
}: {
  category: WhatsAppSignalCategory;
  signals: WhatsAppSignal[];
  isPro: boolean;
  onUpgrade: () => void;
}) {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;
  const isLocked = config.proOnly && !isPro;

  return (
    <Card className={cn(
      'transition-all',
      isLocked ? 'border-border/30 bg-muted/10' : 'border-border/40'
    )}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              'flex items-center justify-center w-6 h-6 rounded-md',
              isLocked ? 'bg-muted/40' : 'bg-primary/10'
            )}>
              <Icon className={cn('h-3.5 w-3.5', isLocked ? 'text-muted-foreground/60' : 'text-primary')} />
            </div>
            <CardTitle className="text-sm font-semibold">{config.label}</CardTitle>
            {category === 'experimental' && (
              <Badge variant="outline" className="text-[8px] h-3.5 px-1 border-amber-500/30 text-amber-600 dark:text-amber-400">
                <Beaker className="h-2 w-2 mr-0.5" />
                Best-effort / Beta
              </Badge>
            )}
          </div>
          {isLocked && (
            <Button size="sm" variant="outline" className="text-xs h-6 px-2" onClick={onUpgrade}>
              <Lock className="h-3 w-3 mr-1" /> Unlock
            </Button>
          )}
        </div>
        <CardDescription className="text-xs ml-8">{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {isLocked ? (
          <div className="relative">
            <div className="space-y-2 blur-[4px] select-none pointer-events-none">
              {signals.slice(0, 2).map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
              {signals.length === 0 && (
                <div className="h-16 rounded-lg bg-muted/20 border border-border/20" />
              )}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/40 rounded-lg">
              <Lock className="h-5 w-5 text-muted-foreground/60" />
              <p className="text-xs font-medium text-muted-foreground">Pro plan required</p>
              <Button size="sm" variant="default" className="text-xs h-7" onClick={onUpgrade}>
                Upgrade to Pro
              </Button>
            </div>
          </div>
        ) : signals.length > 0 ? (
          <div className="space-y-2">
            {signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground py-3 text-center">
            No signals detected in this category.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Component ──────────────────────────────────────────────

export function WhatsAppTab({ scanId, isPro, phoneNumber }: WhatsAppTabProps) {
  const [showModal, setShowModal] = useState(false);

  // Process signals from adapter (currently uses demo data — will be wired to backend)
  const bundle = useMemo<WhatsAppSignalBundle>(() => {
    if (!flags.whatsappBasic || !phoneNumber) {
      return {
        phoneNumber: phoneNumber || '',
        signals: [],
        riskContribution: 0,
        overallConfidence: 0,
        generatedAt: new Date().toISOString(),
        featureFlags: { basic: false, experimental: false },
      };
    }

    // Process through the adapter with available data
    return processWhatsAppSignals({
      phoneNumber,
      presence: {
        registered: true,
        hasProfilePhoto: true,
        hasAboutText: false,
        isBusinessAccount: false,
      },
    });
  }, [phoneNumber]);

  const visibleSignals = useMemo(
    () => getVisibleSignals(bundle, isPro),
    [bundle, isPro],
  );

  const grouped = useMemo(
    () => groupSignalsByCategory(bundle.signals),
    [bundle.signals],
  );

  // Order categories: core first, then advanced, experimental last
  const categoryOrder: WhatsAppSignalCategory[] = [
    'presence',
    'business_profile',
    'web_mentions',
    'scam_db',
    'breach_linkage',
    'cross_platform',
    'experimental',
  ];

  const activeCategories = categoryOrder.filter(
    cat => (grouped[cat]?.length ?? 0) > 0 || CATEGORY_CONFIG[cat].proOnly,
  );

  // Don't render if feature flag is off
  if (!flags.whatsappBasic) {
    return null;
  }

  const handleUpgrade = () => setShowModal(true);

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-green-500/10">
            <MessageCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">WhatsApp Intelligence</h2>
            <p className="text-[11px] text-muted-foreground">Public OSINT signals from WhatsApp presence and web exposure</p>
          </div>
          <Badge variant="outline" className="ml-auto text-[9px] h-4 px-1.5 border-green-500/30 text-green-600 dark:text-green-400">
            <Shield className="h-2.5 w-2.5 mr-0.5" />Public data only
          </Badge>
        </div>

        {/* Compliance notice */}
        <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-[11px] text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground/70">
            <Shield className="h-3 w-3 inline mr-1" />
            Enterprise-safe:
          </span>{' '}
          All signals are derived from publicly accessible sources. No private data, privacy settings,
          or linked device information is collected or displayed. Confidence reflects signal strength,
          not identity certainty.
        </div>

        {/* Exposure Snapshot */}
        <WhatsAppExposureSnapshot
          bundle={bundle}
          isPro={isPro}
          onUpgrade={handleUpgrade}
        />

        {/* Core Intelligence (Free) */}
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            Core Intelligence
          </h3>
          <p className="text-[10px] text-muted-foreground mb-3">Available on all plans</p>
        </div>

        {activeCategories
          .filter(cat => !CATEGORY_CONFIG[cat].proOnly)
          .map(cat => (
            <CategorySection
              key={cat}
              category={cat}
              signals={grouped[cat] || []}
              isPro={isPro}
              onUpgrade={handleUpgrade}
            />
          ))}

        {/* Advanced Signals (Pro) */}
        <div className="space-y-1 pt-2">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Advanced Signals
            {!isPro && (
              <Badge variant="outline" className="text-[8px] h-3.5 px-1 border-primary/30 text-primary/70">
                <Lock className="h-2 w-2 mr-0.5" /> Pro
              </Badge>
            )}
          </h3>
          <p className="text-[10px] text-muted-foreground mb-3">
            Deep intelligence from web, breach, and cross-platform sources
          </p>
        </div>

        {activeCategories
          .filter(cat => CATEGORY_CONFIG[cat].proOnly && cat !== 'experimental')
          .map(cat => (
            <CategorySection
              key={cat}
              category={cat}
              signals={grouped[cat] || []}
              isPro={isPro}
              onUpgrade={handleUpgrade}
            />
          ))}

        {/* Experimental Signals */}
        {flags.whatsappExperimental && (grouped.experimental?.length ?? 0) > 0 && (
          <>
            <div className="space-y-1 pt-2">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Beaker className="h-3.5 w-3.5 text-amber-500" />
                Experimental
                <Badge variant="outline" className="text-[8px] h-3.5 px-1 border-amber-500/30 text-amber-600">
                  Best-effort / Beta
                </Badge>
              </h3>
              <p className="text-[10px] text-muted-foreground mb-3">
                These signals use emerging techniques. Accuracy and availability may vary.
              </p>
            </div>
            <CategorySection
              category="experimental"
              signals={grouped.experimental || []}
              isPro={isPro}
              onUpgrade={handleUpgrade}
            />
          </>
        )}
      </div>

      <ProUpgradeModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
}

export default WhatsAppTab;
