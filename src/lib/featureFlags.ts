/**
 * Feature Flag System
 * 
 * Lightweight feature flags for safe rollout and hot-toggling of new features.
 * Flags can be controlled via environment variables without redeploying edge logic.
 * 
 * Usage:
 * ```typescript
 * import { flags } from '@/lib/featureFlags';
 * 
 * if (flags.scanTimelineV2) {
 *   // Show new timeline UI
 * }
 * ```
 */

export const flags = {
  /** Enhanced scan timeline with real-time provider progress */
  scanTimelineV2: import.meta.env.VITE_FLAG_SCAN_TIMELINE_V2 === "true",
  
  /** Provider health admin console */
  providerHealthAdmin: import.meta.env.VITE_FLAG_PROVIDER_HEALTH === "true",
  
  /** Weekly digest email system */
  weeklyDigest: import.meta.env.VITE_FLAG_WEEKLY_DIGEST === "true",
  
  /** Referral reward system */
  referrals: import.meta.env.VITE_FLAG_REFERRALS === "true",
  
  /** Advanced admin ops console v2 */
  adminOpsV2: import.meta.env.VITE_FLAG_ADMIN_OPS_V2 === "true",
  
  /** Performance monitoring and bundle optimization */
  perfMonitoring: import.meta.env.VITE_FLAG_PERF_MONITORING === "true",
} as const;

/**
 * Check if a feature is enabled
 * @param flag Feature flag name
 * @returns true if feature is enabled
 */
export function isFeatureEnabled(flag: keyof typeof flags): boolean {
  return flags[flag] === true;
}

/**
 * Get all enabled features
 * @returns Array of enabled feature names
 */
export function getEnabledFeatures(): string[] {
  return Object.entries(flags)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);
}
