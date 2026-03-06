import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Fingerprint, Link2, UserSearch, AtSign, Eye, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IdentitySignal {
  label: string;
  description: string;
  confidence: number;
  category: 'interest' | 'reuse' | 'linkage' | 'naming' | 'metadata';
  platforms?: string[];
}

interface IdentitySignalsDetectedProps {
  username: string;
  profileCount: number;
  platforms: string[];
  highConfidenceCount: number;
  onUpgradeClick: () => void;
  onInteraction?: () => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  interest: <Eye className="h-3.5 w-3.5" />,
  reuse: <Link2 className="h-3.5 w-3.5" />,
  linkage: <Fingerprint className="h-3.5 w-3.5" />,
  naming: <AtSign className="h-3.5 w-3.5" />,
  metadata: <UserSearch className="h-3.5 w-3.5" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  interest: 'Interest Area',
  reuse: 'Username Reuse',
  linkage: 'Cross-Platform Link',
  naming: 'Naming Pattern',
  metadata: 'Metadata Signal',
};

function inferSignals(username: string, platforms: string[], profileCount: number, highConfidenceCount: number): IdentitySignal[] {
  const signals: IdentitySignal[] = [];
  const lower = username.toLowerCase();

  // Interest area inference from platform categories
  const gamingPlatforms = ['steam', 'twitch', 'xbox', 'playstation', 'epicgames', 'roblox', 'discord'];
  const devPlatforms = ['github', 'gitlab', 'stackoverflow', 'bitbucket', 'npm', 'hackernews', 'dev.to'];
  const socialPlatforms = ['instagram', 'twitter', 'x', 'tiktok', 'facebook', 'snapchat', 'threads'];
  const academicPlatforms = ['researchgate', 'academia', 'orcid', 'scholar'];

  const gaming = platforms.filter(p => gamingPlatforms.includes(p.toLowerCase()));
  const dev = platforms.filter(p => devPlatforms.includes(p.toLowerCase()));
  const social = platforms.filter(p => socialPlatforms.includes(p.toLowerCase()));
  const academic = platforms.filter(p => academicPlatforms.includes(p.toLowerCase()));

  if (gaming.length >= 1) {
    signals.push({
      label: 'Gaming community presence',
      description: `Active across ${gaming.length} gaming platform${gaming.length > 1 ? 's' : ''}, suggesting engagement in gaming communities.`,
      confidence: Math.min(0.9, 0.5 + gaming.length * 0.15),
      category: 'interest',
      platforms: gaming,
    });
  }

  if (dev.length >= 1) {
    signals.push({
      label: 'Developer / technical forums',
      description: `Found on ${dev.length} developer-oriented platform${dev.length > 1 ? 's' : ''}, indicating technical interests.`,
      confidence: Math.min(0.9, 0.5 + dev.length * 0.15),
      category: 'interest',
      platforms: dev,
    });
  }

  if (academic.length >= 1) {
    signals.push({
      label: 'Academic network presence',
      description: `Profile detected on ${academic.length} academic network${academic.length > 1 ? 's' : ''}.`,
      confidence: Math.min(0.85, 0.5 + academic.length * 0.2),
      category: 'interest',
      platforms: academic,
    });
  }

  // Username reuse
  if (profileCount >= 3) {
    signals.push({
      label: 'Username reuse detected',
      description: `The same identifier appears on ${profileCount} platforms, increasing cross-platform traceability.`,
      confidence: Math.min(0.95, 0.4 + profileCount * 0.08),
      category: 'reuse',
    });
  }

  // Cross-platform linkage
  if (highConfidenceCount >= 2) {
    signals.push({
      label: 'Cross-platform identity linkage',
      description: `${highConfidenceCount} high-confidence matches suggest a single identity operates these accounts.`,
      confidence: Math.min(0.9, 0.5 + highConfidenceCount * 0.1),
      category: 'linkage',
    });
  }

  // Naming pattern detection
  const hasNumbers = /\d{2,4}$/.test(lower);
  const hasYear = /(?:19|20)\d{2}/.test(lower);
  const hasUnderscore = lower.includes('_');
  const hasDot = lower.includes('.');

  if (hasYear) {
    const year = lower.match(/(?:19|20)\d{2}/)?.[0];
    signals.push({
      label: 'Possible birth year in username',
      description: `The pattern "${year}" may indicate a birth year, adding a personal identifier to the handle.`,
      confidence: 0.55,
      category: 'naming',
    });
  } else if (hasNumbers) {
    signals.push({
      label: 'Numeric suffix pattern',
      description: 'Trailing numbers may represent a personal identifier or iteration of a preferred handle.',
      confidence: 0.45,
      category: 'naming',
    });
  }

  if (hasDot || hasUnderscore) {
    signals.push({
      label: 'Structured naming convention',
      description: `Use of "${hasDot ? '.' : '_'}" suggests a deliberate, structured handle format (e.g., first.last).`,
      confidence: 0.5,
      category: 'naming',
    });
  }

  // Metadata signals
  if (social.length >= 2) {
    signals.push({
      label: 'Social media bio/avatar signals',
      description: 'Multiple social platforms may contain consistent bio text, profile images, or linked accounts.',
      confidence: Math.min(0.85, 0.4 + social.length * 0.12),
      category: 'metadata',
      platforms: social,
    });
  }

  // Sort by confidence descending
  return signals.sort((a, b) => b.confidence - a.confidence);
}

export function IdentitySignalsDetected({
  username,
  profileCount,
  platforms,
  highConfidenceCount,
  onUpgradeClick,
  onInteraction,
}: IdentitySignalsDetectedProps) {
  const signals = useMemo(
    () => inferSignals(username, platforms, profileCount, highConfidenceCount),
    [username, platforms, profileCount, highConfidenceCount]
  );

  if (signals.length === 0) return null;

  const FREE_SIGNAL_LIMIT = 2;
  const freeSignals = signals.slice(0, FREE_SIGNAL_LIMIT);
  const lockedCount = Math.max(0, signals.length - FREE_SIGNAL_LIMIT);

  return (
    <Card className="overflow-hidden border-border/50">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Identity Signals Detected</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Patterns across detected profiles can reveal attributes about the person behind the username.
          </p>
        </div>

        {/* Free signals */}
        <div className="space-y-2.5">
          {freeSignals.map((signal, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30"
            >
              <div className="mt-0.5 text-muted-foreground">
                {CATEGORY_ICONS[signal.category]}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">{signal.label}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    {CATEGORY_LABELS[signal.category]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {signal.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Locked signals preview */}
        {lockedCount > 0 && (
          <div className="space-y-2">
            {/* Blurred previews */}
            <div className="space-y-2">
              {signals.slice(FREE_SIGNAL_LIMIT, FREE_SIGNAL_LIMIT + 2).map((signal, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/20 blur-[5px] select-none pointer-events-none opacity-50"
                >
                  <div className="mt-0.5 text-muted-foreground">
                    {CATEGORY_ICONS[signal.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">{signal.label}</span>
                    <p className="text-xs text-muted-foreground">{signal.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Lock divider + CTA */}
            <div className="relative pt-2">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-3">
                <Lock className="h-3 w-3" />
                <span>+{lockedCount} more signal{lockedCount > 1 ? 's' : ''} with platform attribution & confidence scores</span>
              </div>
              <Button
                size="sm"
                className="w-full gap-2 bg-primary hover:bg-primary/90 h-10"
                onClick={() => {
                  onInteraction?.();
                  onUpgradeClick();
                }}
              >
                <Lock className="h-3.5 w-3.5" />
                Unlock Full Identity Intelligence
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* If few signals, still show CTA */}
        {lockedCount === 0 && (
          <div className="pt-1">
            <p className="text-[10px] text-muted-foreground/60 text-center">
              Pro users see confidence scores and platform attribution for each signal.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
