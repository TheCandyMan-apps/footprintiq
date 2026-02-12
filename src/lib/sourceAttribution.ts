/**
 * Source Attribution Utilities
 * 
 * Generates provider-agnostic language for results presentation.
 * Main results should use aggregated source counts, NOT individual provider names.
 * 
 * Provider names are ONLY shown in:
 * - Technical details (Pro only)
 * - Source transparency sections (Pro only)
 */

// ============ TYPE DEFINITIONS ============

export interface SourceContext {
  /** Number of unique sources that contributed to this finding */
  sourceCount: number;
  /** Whether this is from a single source or multiple */
  isCorroborated: boolean;
  /** Confidence level based on source agreement */
  agreementLevel: 'single' | 'partial' | 'consensus';
}

// ============ AGGREGATED LANGUAGE GENERATORS ============

/**
 * Generate attribution language for profile/account findings
 * Uses source counts, NOT provider names
 */
export function getProfileAttribution(sourceCount: number): string {
  if (sourceCount === 0) return 'No sources found';
  if (sourceCount === 1) return 'Detected by automated analysis';
  if (sourceCount === 2) return 'Confirmed by multiple sources';
  return `Cross-validated by ${sourceCount} sources`;
}

/**
 * Generate attribution for exposure/breach findings
 */
export function getExposureAttribution(sourceCount: number): string {
  if (sourceCount === 0) return 'No exposures detected';
  if (sourceCount === 1) return 'Identified in public database';
  return `Identified across ${sourceCount} public databases`;
}

/**
 * Generate summary language for cross-source analysis
 */
export function getCrossSourceSummary(
  totalProfiles: number,
  uniqueSources: number
): string {
  if (totalProfiles === 0) return 'No signals detected';
  
  if (uniqueSources === 1) {
    return totalProfiles === 1
      ? 'One profile detected'
      : `${totalProfiles} profiles detected`;
  }
  
  return `Cross-source analysis found ${totalProfiles} profiles`;
}

/**
 * Generate evidence confidence statement
 */
export function getConfidenceStatement(
  confidence: number,
  sourceCount: number
): string {
  if (sourceCount >= 3 && confidence >= 80) {
    return 'High confidence — multiple sources agree';
  }
  if (sourceCount >= 2 && confidence >= 60) {
    return 'Moderate confidence — corroborated by sources';
  }
  if (confidence >= 50) {
    return 'Detected — pending verification';
  }
  return 'Low confidence — limited source data';
}

/**
 * Generate risk assessment language without provider specifics
 */
export function getRiskAssessmentLanguage(
  exposureCount: number,
  profileCount: number,
  breachCount: number
): string {
  const parts: string[] = [];
  
  if (breachCount > 0) {
    parts.push(
      breachCount === 1
        ? '1 breach exposure detected'
        : `${breachCount} breach exposures detected`
    );
  }
  
  if (exposureCount > 0 && exposureCount !== breachCount) {
    parts.push(
      exposureCount === 1
        ? '1 data exposure identified'
        : `${exposureCount} data exposures identified`
    );
  }
  
  if (profileCount > 0) {
    parts.push(
      profileCount === 1
        ? '1 public profile discovered'
        : `${profileCount} public profiles discovered`
    );
  }
  
  if (parts.length === 0) {
    return 'No significant exposures detected';
  }
  
  return parts.join('. ');
}

// ============ SOURCE CONTEXT HELPERS ============

/**
 * Derive source context from aggregated data
 */
export function deriveSourceContext(sources: string[]): SourceContext {
  const uniqueSources = new Set(sources).size;
  
  return {
    sourceCount: uniqueSources,
    isCorroborated: uniqueSources > 1,
    agreementLevel: uniqueSources >= 3 ? 'consensus' : uniqueSources === 2 ? 'partial' : 'single',
  };
}

/**
 * Get source transparency text (Pro only)
 */
export function getSourceTransparencyText(
  sources: string[],
  isFullAccess: boolean
): string {
  if (!isFullAccess) {
    return 'Switch to Pro Intelligence to view source details';
  }
  
  const uniqueSources = [...new Set(sources)];
  if (uniqueSources.length === 0) return 'No source data available';
  if (uniqueSources.length === 1) return `Source: ${uniqueSources[0]}`;
  return `Sources: ${uniqueSources.join(', ')}`;
}

// ============ NARRATIVE GENERATORS ============

/**
 * Generate narrative bucket description
 * Uses source-agnostic language
 */
export function getBucketNarrativeDescription(
  bucketType: 'PublicProfiles' | 'ExposureSignals' | 'ReuseIndicators' | 'Connections',
  count: number,
  sourceCount: number
): string {
  const narratives: Record<string, (c: number, s: number) => string> = {
    PublicProfiles: (c, s) => {
      if (c === 0) return 'No public profiles detected';
      if (s > 1) return `Multiple public sources indicate ${c} account${c > 1 ? 's' : ''}`;
      return `Public presence detected on ${c} platform${c > 1 ? 's' : ''}`;
    },
    ExposureSignals: (c, s) => {
      if (c === 0) return 'No data exposures found';
      if (s > 1) return `Cross-source analysis suggests ${c} potential exposure${c > 1 ? 's' : ''}`;
      return `${c} exposure signal${c > 1 ? 's' : ''} identified`;
    },
    ReuseIndicators: (c, s) => {
      if (c === 0) return 'No credential reuse patterns detected';
      if (s > 1) return `Pattern analysis indicates ${c} reuse indicator${c > 1 ? 's' : ''}`;
      return `${c} potential reuse pattern${c > 1 ? 's' : ''} flagged`;
    },
    Connections: (c, s) => {
      if (c === 0) return 'No cross-platform connections found';
      if (s > 1) return `Cross-source analysis reveals ${c} connection${c > 1 ? 's' : ''}`;
      return `${c} connection${c > 1 ? 's' : ''} identified`;
    },
  };
  
  return narratives[bucketType]?.(count, sourceCount) || `${count} item${count !== 1 ? 's' : ''} found`;
}

/**
 * Generate overall scan summary narrative
 */
export function getScanSummaryNarrative(
  totalProfiles: number,
  totalExposures: number,
  totalConnections: number
): string {
  const parts: string[] = [];
  
  if (totalProfiles > 0) {
    parts.push(`${totalProfiles} public profile${totalProfiles > 1 ? 's' : ''}`);
  }
  
  if (totalExposures > 0) {
    parts.push(`${totalExposures} exposure${totalExposures > 1 ? 's' : ''}`);
  }
  
  if (totalConnections > 0) {
    parts.push(`${totalConnections} connection${totalConnections > 1 ? 's' : ''}`);
  }
  
  if (parts.length === 0) {
    return 'No significant digital footprint detected';
  }
  
  if (parts.length === 1) {
    return `Analysis identified ${parts[0]}`;
  }
  
  const lastPart = parts.pop();
  return `Analysis identified ${parts.join(', ')} and ${lastPart}`;
}

/**
 * Get example sentence for a bucket (used in Free results)
 */
export function getBucketExampleSentence(
  bucketType: 'PublicProfiles' | 'ExposureSignals' | 'ReuseIndicators' | 'Connections',
  platformName?: string
): string {
  const templates: Record<string, (p?: string) => string> = {
    PublicProfiles: (p) => p ? `Found on ${p}` : 'Account presence detected',
    ExposureSignals: (p) => p ? `Data exposed on ${p}` : 'Exposure detected in public database',
    ReuseIndicators: (p) => p ? `Pattern found on ${p}` : 'Credential pattern detected',
    Connections: (p) => p ? `Linked to ${p}` : 'Cross-platform link identified',
  };
  
  return templates[bucketType]?.(platformName) || 'Finding detected';
}
