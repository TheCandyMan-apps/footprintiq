/**
 * Unified metric formatting utilities for consistent display across the platform.
 */

/** Format a score as "X / 100" with at most 1 decimal, no trailing zeros. */
export function formatScore(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const display = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${display} / 100`;
}

/** Format confidence as "XX% confidence". Input 0–1 or 0–100 (auto-detected). */
export function formatConfidence(value: number): string {
  const pct = value <= 1 ? Math.round(value * 100) : Math.round(value);
  return `${pct}% confidence`;
}

/** Format signal count as "N signals detected". */
export function formatSignals(count: number): string {
  return `${count} signal${count !== 1 ? 's' : ''} detected`;
}
