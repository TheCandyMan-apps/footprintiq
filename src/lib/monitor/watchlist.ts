/**
 * Watchlist Management
 * 
 * Allows users to monitor specific targets for changes.
 * Currently uses localStorage; future versions will sync to backend.
 */

export interface WatchlistTarget {
  id: string;
  type: "username" | "email" | "domain" | "phone";
  value: string;
  addedAt: string;
  lastChecked?: string;
  alertOnChange: boolean;
  notes?: string;
}

export interface WatchlistAlert {
  id: string;
  targetId: string;
  detectedAt: string;
  changeType: "new_finding" | "severity_increase" | "new_platform";
  summary: string;
  read: boolean;
}

const WATCHLIST_KEY = "footprintiq_watchlist";
const ALERTS_KEY = "footprintiq_watchlist_alerts";

/**
 * Get all watchlist targets
 */
export function getWatchlist(): WatchlistTarget[] {
  const json = sessionStorage.getItem(WATCHLIST_KEY);
  if (!json) return [];
  
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

/**
 * Add target to watchlist
 */
export function addToWatchlist(target: Omit<WatchlistTarget, "id" | "addedAt">): WatchlistTarget {
  const watchlist = getWatchlist();
  
  // Check for duplicates
  const existing = watchlist.find(
    (t) => t.type === target.type && t.value === target.value
  );
  if (existing) {
    return existing;
  }

  const newTarget: WatchlistTarget = {
    ...target,
    id: crypto.randomUUID(),
    addedAt: new Date().toISOString(),
  };

  watchlist.push(newTarget);
  sessionStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  
  return newTarget;
}

/**
 * Remove target from watchlist
 */
export function removeFromWatchlist(targetId: string): void {
  const watchlist = getWatchlist();
  const filtered = watchlist.filter((t) => t.id !== targetId);
  sessionStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered));
}

/**
 * Update target in watchlist
 */
export function updateWatchlistTarget(
  targetId: string,
  updates: Partial<WatchlistTarget>
): void {
  const watchlist = getWatchlist();
  const index = watchlist.findIndex((t) => t.id === targetId);
  
  if (index !== -1) {
    watchlist[index] = { ...watchlist[index], ...updates };
    sessionStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }
}

/**
 * Mark target as checked
 */
export function markTargetChecked(targetId: string): void {
  updateWatchlistTarget(targetId, { lastChecked: new Date().toISOString() });
}

/**
 * Get all alerts
 */
export function getAlerts(): WatchlistAlert[] {
  const json = sessionStorage.getItem(ALERTS_KEY);
  if (!json) return [];
  
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

/**
 * Add a new alert
 */
export function addAlert(alert: Omit<WatchlistAlert, "id" | "detectedAt" | "read">): void {
  const alerts = getAlerts();
  
  const newAlert: WatchlistAlert = {
    ...alert,
    id: crypto.randomUUID(),
    detectedAt: new Date().toISOString(),
    read: false,
  };

  alerts.push(newAlert);
  sessionStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
}

/**
 * Mark alert as read
 */
export function markAlertRead(alertId: string): void {
  const alerts = getAlerts();
  const alert = alerts.find((a) => a.id === alertId);
  
  if (alert) {
    alert.read = true;
    sessionStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  }
}

/**
 * Clear all alerts
 */
export function clearAlerts(): void {
  sessionStorage.setItem(ALERTS_KEY, JSON.stringify([]));
}

/**
 * Get unread alert count
 */
export function getUnreadAlertCount(): number {
  return getAlerts().filter((a) => !a.read).length;
}
