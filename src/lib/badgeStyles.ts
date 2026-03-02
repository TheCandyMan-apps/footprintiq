/**
 * Unified badge style tokens for risk bands and score context labels.
 *
 * Usage:
 *   import { riskBadgeClass, scoreBadgeClass } from '@/lib/badgeStyles';
 *   <Badge className={riskBadgeClass('elevated')}>Elevated</Badge>
 *   <Badge className={scoreBadgeClass('strong')}>Strong</Badge>
 */

// ── Risk-band badges ────────────────────────────────────────────
// low  → green   |  moderate → amber   |  elevated → red
// Also supports aliases: minimal, high, critical

const RISK_BAND: Record<string, string> = {
  low:      'rounded-md bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 font-medium',
  minimal:  'rounded-md bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 font-medium',
  moderate: 'rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 font-medium',
  elevated: 'rounded-md bg-destructive/10 text-destructive border-destructive/20 font-medium',
  high:     'rounded-md bg-destructive/10 text-destructive border-destructive/20 font-medium',
  critical: 'rounded-md bg-destructive/10 text-destructive border-destructive/20 font-medium',
};

export function riskBadgeClass(level: string): string {
  return RISK_BAND[level.toLowerCase()] ?? RISK_BAND.low;
}

// ── Score-context badges ────────────────────────────────────────
// weak, moderate, strong, very unique, unique, common, etc.

const SCORE_CONTEXT: Record<string, string> = {
  'very weak':         'rounded-md bg-destructive/10 text-destructive border-destructive/20 font-medium',
  weak:                'rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 font-medium',
  moderate:            'rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 font-medium',
  strong:              'rounded-md bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 font-medium',
  'very strong':       'rounded-md bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 font-medium',
  'extremely common':  'rounded-md bg-destructive/10 text-destructive border-destructive/20 font-medium',
  'very common':       'rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 font-medium',
  common:              'rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 font-medium',
  unique:              'rounded-md bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 font-medium',
  'very unique':       'rounded-md bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 font-medium',
};

export function scoreBadgeClass(label: string): string {
  return SCORE_CONTEXT[label.toLowerCase()] ?? SCORE_CONTEXT.moderate;
}

// ── Shared sizing token ─────────────────────────────────────────
export const BADGE_SIZE = 'text-[10px] h-5 px-2';
