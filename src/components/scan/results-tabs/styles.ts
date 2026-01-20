/**
 * Design tokens for results UI - professional intelligence dashboard density
 * Compact, information-dense layout optimized for investigation workflows
 */

// Spacing tokens - tight for dashboard density
export const RESULTS_SPACING = {
  cardPadding: 'p-2',
  cardPaddingLg: 'p-2.5',
  sectionGap: 'gap-2',
  sectionGapSm: 'gap-1.5',
  rowGap: 'gap-1',
  rowPadding: 'py-1 px-2',
  contentMargin: 'space-y-2',
  contentMarginSm: 'space-y-1.5',
};

// Typography tokens - professional compact scale
export const RESULTS_TYPOGRAPHY = {
  sectionTitle: 'text-[9px] font-semibold text-muted-foreground/80 uppercase tracking-wider',
  cardTitle: 'text-[12px] font-medium',
  bodyText: 'text-[12px]',
  bodyTextMuted: 'text-[12px] text-muted-foreground',
  caption: 'text-[10px] text-muted-foreground',
  captionMuted: 'text-[9px] text-muted-foreground/60',
  label: 'text-[10px] font-medium',
  labelMuted: 'text-[10px] text-muted-foreground',
};

// Border tokens - minimal separators
export const RESULTS_BORDERS = {
  cardBorder: 'border-border/25',
  divider: 'border-border/15',
  dividerVertical: 'border-l border-border/15',
  subtleBorder: 'border border-border/15',
};

// Semantic color type
interface SemanticColor {
  bg: string;
  text: string;
  border: string;
}

// Color-for-meaning tokens - subtle but clear
export const RESULTS_SEMANTIC_COLORS: Record<string, SemanticColor> = {
  critical: { bg: 'bg-destructive/8', text: 'text-destructive', border: 'border-destructive/15' },
  high: { bg: 'bg-orange-500/8', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/15' },
  medium: { bg: 'bg-yellow-500/8', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/15' },
  low: { bg: 'bg-blue-500/8', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/15' },
  info: { bg: 'bg-muted/30', text: 'text-muted-foreground', border: 'border-border/20' },
  confidenceHigh: { bg: 'bg-green-500/8', text: 'text-green-600 dark:text-green-400', border: 'border-green-500/15' },
  confidenceMedium: { bg: 'bg-yellow-500/8', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/15' },
  confidenceLow: { bg: 'bg-orange-500/8', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/15' },
};

// Background tokens - subtle layering
export const RESULTS_BACKGROUNDS = {
  card: 'bg-card',
  muted: 'bg-muted/15',
  subtle: 'bg-muted/8',
  elevated: 'bg-background',
};

// Common component styles - compact intelligence dashboard
export const RESULTS_COMPONENTS = {
  compactRow: 'flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/20 transition-colors',
  subtleCard: 'border border-border/20 rounded bg-card',
  sectionHeader: 'flex items-center gap-1 mb-1',
  emptyState: 'flex flex-col items-center justify-center py-6 text-center',
  filterBar: 'flex flex-wrap items-center gap-1',
  statsRow: 'flex items-center justify-between py-0.5 px-1.5 rounded bg-muted/15 text-[11px]',
};

// Row tokens for account list - dense feed layout
export const RESULTS_ROW = {
  base: 'flex items-center gap-2 px-2 py-1 min-h-[44px] border-l-2 transition-all duration-75',
  default: 'border-l-transparent hover:border-l-muted-foreground/25 hover:bg-muted/10',
  expanded: 'bg-muted/8 border-l-muted-foreground/20',
  focused: 'bg-primary/4 border-l-primary',
};

// Icon container tokens - compact profile elements
export const RESULTS_ICON_CONTAINER = {
  platform: 'w-8 h-8 rounded bg-muted/20 flex items-center justify-center shrink-0 border border-border/20',
  avatar: 'w-8 h-8 rounded object-cover border border-border/30 shrink-0',
  avatarFallback: 'w-8 h-8 rounded bg-primary/4 flex items-center justify-center border border-border/30 shrink-0',
  platformBadge: 'absolute -top-0.5 -left-0.5 z-10 w-3 h-3 rounded-sm bg-background border border-border/40 shadow-sm flex items-center justify-center',
};

// Action cluster tokens - compact inline actions
export const RESULTS_ACTION_CLUSTER = {
  container: 'flex items-center gap-px rounded bg-muted/20 p-px',
  button: 'h-4.5 w-4.5 rounded text-muted-foreground hover:text-foreground hover:bg-background/50 transition-colors',
  buttonActive: 'bg-primary/12 text-primary',
  divider: 'w-px h-3 bg-border/30',
};

// Helper to combine classes
export function resultStyles(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
