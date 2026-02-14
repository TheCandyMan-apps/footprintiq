/**
 * Exposure Reduction Score™
 * 
 * Inverse health score (0–100): higher = better digital health.
 * 
 * Calculation factors:
 * - Number of active exposures (base deduction)
 * - Severity weighting (high/critical findings cost more)
 * - Data broker exposure multiplier
 * - Breach linkage multiplier
 * - Public search index multiplier
 * - Resolved vs unresolved items ratio (bonus)
 */

import type { Finding } from '@/lib/ufm';

export type ReductionLevel = 'high_risk' | 'moderate' | 'good' | 'strong';

export interface ExposureReductionResult {
  score: number;
  level: ReductionLevel;
  factors: ReductionFactor[];
}

export interface ReductionFactor {
  id: string;
  label: string;
  impact: number; // negative = deduction, positive = bonus
  description: string;
}

export function getReductionLevel(score: number): ReductionLevel {
  if (score < 40) return 'high_risk';
  if (score < 70) return 'moderate';
  if (score < 90) return 'good';
  return 'strong';
}

export function getReductionLevelLabel(level: ReductionLevel): string {
  switch (level) {
    case 'high_risk': return 'High Risk';
    case 'moderate': return 'Moderate Risk';
    case 'good': return 'Good';
    case 'strong': return 'Strong';
  }
}

export function getReductionColor(level: ReductionLevel): string {
  switch (level) {
    case 'high_risk': return 'text-red-500';
    case 'moderate': return 'text-amber-500';
    case 'good': return 'text-emerald-400';
    case 'strong': return 'text-green-500';
  }
}

export function getReductionBgColor(level: ReductionLevel): string {
  switch (level) {
    case 'high_risk': return 'bg-red-500/10 border-red-500/30';
    case 'moderate': return 'bg-amber-500/10 border-amber-500/30';
    case 'good': return 'bg-emerald-400/10 border-emerald-400/30';
    case 'strong': return 'bg-green-500/10 border-green-500/30';
  }
}

export function getReductionStrokeColor(level: ReductionLevel): string {
  switch (level) {
    case 'high_risk': return 'hsl(0, 84%, 60%)';
    case 'moderate': return 'hsl(38, 92%, 50%)';
    case 'good': return 'hsl(160, 60%, 45%)';
    case 'strong': return 'hsl(142, 71%, 45%)';
  }
}

export function calculateExposureReductionScore(findings: Finding[]): ExposureReductionResult {
  if (!findings || findings.length === 0) {
    return {
      score: 100,
      level: 'strong',
      factors: [],
    };
  }

  const factors: ReductionFactor[] = [];
  let deductions = 0;

  // 1. Active exposures base deduction
  const activeCount = findings.filter(f => 
    f.type === 'social_media' || f.type === 'identity'
  ).length;
  
  if (activeCount > 0) {
    const impact = Math.min(30, Math.round(activeCount * 0.6));
    deductions += impact;
    factors.push({
      id: 'active_exposures',
      label: `${activeCount} active exposure${activeCount !== 1 ? 's' : ''} detected`,
      impact: -impact,
      description: 'Public profiles and identity signals found across platforms.',
    });
  }

  // 2. Severity weighting
  const highSevCount = findings.filter(
    f => f.severity === 'high' || f.severity === 'critical'
  ).length;
  
  if (highSevCount > 0) {
    const impact = Math.min(20, highSevCount * 4);
    deductions += impact;
    factors.push({
      id: 'severity',
      label: `${highSevCount} high/critical severity finding${highSevCount !== 1 ? 's' : ''}`,
      impact: -impact,
      description: 'High-severity signals carry more weight in the score.',
    });
  }

  // 3. Data broker exposure multiplier
  const dataBrokerFindings = findings.filter(f => {
    const provider = (f.provider || '').toLowerCase();
    const tags = (f.tags || []).map(t => t.toLowerCase());
    return provider.includes('data_broker') || 
           provider.includes('databroker') ||
           tags.includes('data_broker') ||
           (f as any).kind === 'data_broker';
  });
  
  if (dataBrokerFindings.length > 0) {
    const impact = Math.min(15, dataBrokerFindings.length * 5);
    deductions += impact;
    factors.push({
      id: 'data_broker',
      label: `Data broker exposure (${dataBrokerFindings.length} source${dataBrokerFindings.length !== 1 ? 's' : ''})`,
      impact: -impact,
      description: 'Data broker listings amplify your public surface area.',
    });
  }

  // 4. Breach linkage multiplier
  const breachFindings = findings.filter(f => {
    if (f.type === 'breach') return true;
    const kind = (f as any).kind as string | undefined;
    if (kind === 'breach.hit') return true;
    if ((f.provider || '').toLowerCase().includes('hibp')) return true;
    return false;
  });
  
  if (breachFindings.length > 0) {
    const impact = Math.min(20, breachFindings.length * 4);
    deductions += impact;
    factors.push({
      id: 'breach_linkage',
      label: `${breachFindings.length} breach linkage${breachFindings.length !== 1 ? 's' : ''} found`,
      impact: -impact,
      description: 'Credentials exposed in known data breaches.',
    });
  }

  // 5. Public search index multiplier
  const searchIndexed = findings.filter(f => {
    const provider = (f.provider || '').toLowerCase();
    return provider.includes('google') || 
           provider.includes('search') ||
           provider.includes('bing') ||
           (f as any).kind === 'search_indexed';
  });
  
  if (searchIndexed.length > 0) {
    const impact = Math.min(10, searchIndexed.length * 3);
    deductions += impact;
    factors.push({
      id: 'search_index',
      label: `Indexed in ${searchIndexed.length} public search result${searchIndexed.length !== 1 ? 's' : ''}`,
      impact: -impact,
      description: 'Your information appears in public search engine results.',
    });
  }

  // 6. Resolved items bonus (positive)
  const resolvedCount = findings.filter(f => 
    (f as any).status === 'resolved' || 
    (f as any).status === 'removed' ||
    (f as any).is_resolved === true
  ).length;
  
  if (resolvedCount > 0) {
    const bonus = Math.min(15, resolvedCount * 3);
    deductions -= bonus;
    factors.push({
      id: 'resolved',
      label: `${resolvedCount} exposure${resolvedCount !== 1 ? 's' : ''} resolved`,
      impact: bonus,
      description: 'Resolved exposures improve your score.',
    });
  }

  const score = Math.round(Math.min(100, Math.max(0, 100 - deductions)));
  const level = getReductionLevel(score);

  return { score, level, factors };
}
