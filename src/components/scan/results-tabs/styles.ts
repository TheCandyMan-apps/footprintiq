/**
 * Design tokens for results UI - ensures consistency across all tabs
 */

// Spacing tokens
export const RESULTS_SPACING = {
  cardPadding: 'p-3',
  cardPaddingLg: 'p-4',
  sectionGap: 'gap-4',
  sectionGapSm: 'gap-3',
  rowGap: 'gap-2',
  rowPadding: 'py-2 px-3',
  contentMargin: 'space-y-4',
  contentMarginSm: 'space-y-3',
};

// Typography tokens
export const RESULTS_TYPOGRAPHY = {
  sectionTitle: 'text-xs font-medium text-muted-foreground uppercase tracking-wide',
  cardTitle: 'text-sm font-medium',
  bodyText: 'text-sm',
  bodyTextMuted: 'text-sm text-muted-foreground',
  caption: 'text-xs text-muted-foreground',
  captionMuted: 'text-[11px] text-muted-foreground/80',
  label: 'text-xs font-medium',
  labelMuted: 'text-xs text-muted-foreground',
};

// Border tokens
export const RESULTS_BORDERS = {
  cardBorder: 'border-border/50',
  divider: 'border-border/40',
  dividerVertical: 'border-l border-border/40',
  subtleBorder: 'border border-border/30',
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
  info: { bg: 'bg-muted/50', text: 'text-muted-foreground', border: 'border-border/50' },
  confidenceHigh: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', border: 'border-green-500/20' },
  confidenceMedium: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/20' },
  confidenceLow: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20' },
};

// Background tokens
export const RESULTS_BACKGROUNDS = {
  card: 'bg-card',
  muted: 'bg-muted/30',
  subtle: 'bg-muted/20',
  elevated: 'bg-background',
};

// Common component styles
export const RESULTS_COMPONENTS = {
  compactRow: 'flex items-center gap-3 py-2 px-3 rounded-md bg-muted/20 hover:bg-muted/40 transition-colors',
  subtleCard: 'border border-border/50 rounded-lg bg-card',
  sectionHeader: 'flex items-center gap-2 mb-2',
  emptyState: 'flex flex-col items-center justify-center py-12 text-center',
  filterBar: 'flex flex-wrap items-center gap-2',
  statsRow: 'flex items-center justify-between py-1.5 px-2 rounded bg-muted/30 text-sm',
};

// Row tokens for account list - investigative feed style
export const RESULTS_ROW = {
  base: 'flex items-center gap-3 px-3 py-2 min-h-[56px] border-l-2 transition-all duration-100',
  default: 'border-l-transparent hover:border-l-muted-foreground/40 hover:bg-muted/20',
  expanded: 'bg-muted/15 border-l-muted-foreground/30',
  focused: 'bg-primary/5 border-l-primary shadow-sm',
};

// Icon container tokens - profile card style
export const RESULTS_ICON_CONTAINER = {
  platform: 'w-10 h-10 rounded-lg bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center shrink-0 border border-border/40',
  avatar: 'w-10 h-10 rounded-lg object-cover border border-border/50 shrink-0',
  avatarFallback: 'w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center border border-border/50 shrink-0',
  platformBadge: 'absolute -top-1 -left-1 z-10 w-4 h-4 rounded bg-background border border-border shadow-sm flex items-center justify-center',
};

// Action cluster tokens - compact investigative actions
export const RESULTS_ACTION_CLUSTER = {
  container: 'flex items-center gap-0.5 rounded-md bg-muted/40 p-0.5',
  button: 'h-6 w-6 rounded text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors',
  buttonActive: 'bg-primary/15 text-primary',
  divider: 'w-px h-5 bg-border/50',
};

// Helper to combine classes
export function resultStyles(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
