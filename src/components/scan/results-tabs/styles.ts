/**
 * Design tokens for results UI - professional dashboard density
 */

// Spacing tokens - tighter for dashboard feel
export const RESULTS_SPACING = {
  cardPadding: 'p-2.5',
  cardPaddingLg: 'p-3',
  sectionGap: 'gap-3',
  sectionGapSm: 'gap-2',
  rowGap: 'gap-1.5',
  rowPadding: 'py-1.5 px-2.5',
  contentMargin: 'space-y-3',
  contentMarginSm: 'space-y-2',
};

// Typography tokens - professional scale
export const RESULTS_TYPOGRAPHY = {
  sectionTitle: 'text-[10px] font-semibold text-muted-foreground uppercase tracking-wider',
  cardTitle: 'text-[13px] font-medium',
  bodyText: 'text-[13px]',
  bodyTextMuted: 'text-[13px] text-muted-foreground',
  caption: 'text-[11px] text-muted-foreground',
  captionMuted: 'text-[10px] text-muted-foreground/70',
  label: 'text-[11px] font-medium',
  labelMuted: 'text-[11px] text-muted-foreground',
};

// Border tokens - subtle separators
export const RESULTS_BORDERS = {
  cardBorder: 'border-border/30',
  divider: 'border-border/20',
  dividerVertical: 'border-l border-border/20',
  subtleBorder: 'border border-border/20',
};

// Semantic color type
interface SemanticColor {
  bg: string;
  text: string;
  border: string;
}

// Color-for-meaning tokens
export const RESULTS_SEMANTIC_COLORS: Record<string, SemanticColor> = {
  critical: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/20' },
  low: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
  info: { bg: 'bg-muted/40', text: 'text-muted-foreground', border: 'border-border/30' },
  confidenceHigh: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', border: 'border-green-500/20' },
  confidenceMedium: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/20' },
  confidenceLow: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20' },
};

// Background tokens - subtle
export const RESULTS_BACKGROUNDS = {
  card: 'bg-card',
  muted: 'bg-muted/20',
  subtle: 'bg-muted/10',
  elevated: 'bg-background',
};

// Common component styles - compact
export const RESULTS_COMPONENTS = {
  compactRow: 'flex items-center gap-2.5 py-1.5 px-2.5 rounded hover:bg-muted/30 transition-colors',
  subtleCard: 'border border-border/30 rounded-md bg-card',
  sectionHeader: 'flex items-center gap-1.5 mb-1.5',
  emptyState: 'flex flex-col items-center justify-center py-8 text-center',
  filterBar: 'flex flex-wrap items-center gap-1.5',
  statsRow: 'flex items-center justify-between py-1 px-2 rounded bg-muted/20 text-[12px]',
};

// Row tokens for account list - compact feed
export const RESULTS_ROW = {
  base: 'flex items-center gap-2.5 px-2.5 py-1.5 min-h-[52px] border-l-2 transition-all duration-100',
  default: 'border-l-transparent hover:border-l-muted-foreground/30 hover:bg-muted/15',
  expanded: 'bg-muted/10 border-l-muted-foreground/25',
  focused: 'bg-primary/5 border-l-primary',
};

// Icon container tokens - compact profile style
export const RESULTS_ICON_CONTAINER = {
  platform: 'w-9 h-9 rounded-md bg-muted/30 flex items-center justify-center shrink-0 border border-border/30',
  avatar: 'w-9 h-9 rounded-md object-cover border border-border/40 shrink-0',
  avatarFallback: 'w-9 h-9 rounded-md bg-primary/5 flex items-center justify-center border border-border/40 shrink-0',
  platformBadge: 'absolute -top-0.5 -left-0.5 z-10 w-3.5 h-3.5 rounded bg-background border border-border/50 shadow-sm flex items-center justify-center',
};

// Action cluster tokens - minimal
export const RESULTS_ACTION_CLUSTER = {
  container: 'flex items-center gap-0.5 rounded bg-muted/30 p-0.5',
  button: 'h-5 w-5 rounded text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors',
  buttonActive: 'bg-primary/15 text-primary',
  divider: 'w-px h-4 bg-border/40',
};

// Helper to combine classes
export function resultStyles(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
