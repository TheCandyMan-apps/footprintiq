/**
 * Monitoring Diff Engine
 * Compares scan results and identifies changes
 */

import { Finding } from "@/lib/ufm";

export interface ScanDiff {
  newFindings: Finding[];
  removedFindings: Finding[];
  changedFindings: {
    finding: Finding;
    changes: string[];
  }[];
  summary: {
    totalNew: number;
    totalRemoved: number;
    totalChanged: number;
    severityChanges: {
      increased: number;
      decreased: number;
    };
    riskScoreChange: number;
  };
}

export interface DiffThresholds {
  highSeverityThreshold: boolean; // Alert on any high/critical finding
  newProviderThreshold: number; // Alert if N+ new providers
  riskScoreChangeThreshold: number; // Alert if score changes by N+
  darkWebScoreThreshold: number; // Alert if dark-web score >= N
}

/**
 * Compare two sets of findings
 */
export function compareFindings(
  previousFindings: Finding[],
  currentFindings: Finding[]
): ScanDiff {
  const prevMap = new Map(previousFindings.map(f => [f.id, f]));
  const currMap = new Map(currentFindings.map(f => [f.id, f]));

  // Identify new findings
  const newFindings = currentFindings.filter(f => !prevMap.has(f.id));

  // Identify removed findings
  const removedFindings = previousFindings.filter(f => !currMap.has(f.id));

  // Identify changed findings
  const changedFindings: ScanDiff["changedFindings"] = [];
  currentFindings.forEach(curr => {
    const prev = prevMap.get(curr.id);
    if (prev) {
      const changes: string[] = [];
      
      if (prev.severity !== curr.severity) {
        changes.push(`Severity: ${prev.severity} → ${curr.severity}`);
      }
      
      if (prev.confidence !== curr.confidence) {
        changes.push(`Confidence: ${prev.confidence} → ${curr.confidence}`);
      }

      if (changes.length > 0) {
        changedFindings.push({ finding: curr, changes });
      }
    }
  });

  // Calculate severity changes
  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
  let severityIncreased = 0;
  let severityDecreased = 0;

  changedFindings.forEach(({ finding, changes }) => {
    const prev = prevMap.get(finding.id)!;
    const prevLevel = severityOrder[prev.severity];
    const currLevel = severityOrder[finding.severity];
    
    if (currLevel > prevLevel) severityIncreased++;
    if (currLevel < prevLevel) severityDecreased++;
  });

  return {
    newFindings,
    removedFindings,
    changedFindings,
    summary: {
      totalNew: newFindings.length,
      totalRemoved: removedFindings.length,
      totalChanged: changedFindings.length,
      severityChanges: {
        increased: severityIncreased,
        decreased: severityDecreased,
      },
      riskScoreChange: 0, // To be computed from entity nodes
    },
  };
}

/**
 * Check if diff triggers an alert
 */
export function shouldAlert(
  diff: ScanDiff,
  thresholds: DiffThresholds
): {
  shouldAlert: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  // Check for high-severity new findings
  if (thresholds.highSeverityThreshold) {
    const highSeverityNew = diff.newFindings.filter(
      f => f.severity === "critical" || f.severity === "high"
    );
    
    if (highSeverityNew.length > 0) {
      reasons.push(`${highSeverityNew.length} new high/critical finding(s)`);
    }
  }

  // Check for new provider count
  const newProviders = new Set(diff.newFindings.map(f => f.provider));
  if (newProviders.size >= thresholds.newProviderThreshold) {
    reasons.push(`${newProviders.size} new data provider(s) detected`);
  }

  // Check severity increases
  if (diff.summary.severityChanges.increased > 0) {
    reasons.push(`${diff.summary.severityChanges.increased} finding(s) severity increased`);
  }

  return {
    shouldAlert: reasons.length > 0,
    reasons,
  };
}

/**
 * Format diff for display
 */
export function formatDiffSummary(diff: ScanDiff): string {
  const parts: string[] = [];

  if (diff.summary.totalNew > 0) {
    parts.push(`${diff.summary.totalNew} new finding(s)`);
  }

  if (diff.summary.totalRemoved > 0) {
    parts.push(`${diff.summary.totalRemoved} removed finding(s)`);
  }

  if (diff.summary.severityChanges.increased > 0) {
    parts.push(`${diff.summary.severityChanges.increased} severity increase(s)`);
  }

  if (parts.length === 0) {
    return "No significant changes detected";
  }

  return parts.join(", ");
}
