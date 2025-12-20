/**
 * Client-side deterministic phone insights fallback
 * Used when AI service is unavailable or for Free tier users
 */

import { Finding } from '@/lib/ufm';

export interface DeterministicPhoneInsights {
  summary: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  keySignals: string[];
  recommendedActions: string[];
  confidence: number;
  fallbackMode: true;
  fallbackReason: string;
}

/**
 * Generate deterministic phone insights from findings
 * Mirrors the edge function's fallback logic for consistency
 */
export function generateDeterministicPhoneInsights(
  findings: Finding[],
  reason: string = 'free_tier'
): DeterministicPhoneInsights {
  let riskScore = 0;
  const keySignals: string[] = [];
  const recommendedActions: string[] = [];

  // Categorize findings by providerCategory and type
  const riskSignals = findings.filter(f => 
    f.providerCategory === 'risk' || 
    f.providerCategory === 'risk_signal' ||
    f.severity === 'high' ||
    f.severity === 'critical'
  );
  
  const brokerFlags = findings.filter(f => 
    f.providerCategory === 'broker' ||
    f.providerCategory === 'data_broker' ||
    f.providerCategory === 'broker_flag'
  );
  
  const carrierIntel = findings.filter(f => 
    f.type === 'phone_intelligence' ||
    f.providerCategory === 'carrier' ||
    f.providerCategory === 'carrier_intel'
  );
  
  const messagingPresence = findings.filter(f => 
    f.providerCategory === 'messaging' ||
    f.providerCategory === 'messaging_presence'
  );

  // Check for VOIP/disposable indicators
  const hasVoip = riskSignals.some(f => {
    const desc = (f.description || f.title || '').toLowerCase();
    return desc.includes('voip') || 
           desc.includes('disposable') || 
           desc.includes('burner') ||
           desc.includes('virtual');
  });
  
  if (hasVoip) {
    riskScore += 40;
    keySignals.push('VOIP/disposable phone indicator detected');
    recommendedActions.push('Verify phone ownership through alternative channels');
  }

  // Check for scam/spam indicators
  const hasScamIndicator = riskSignals.some(f => {
    const desc = (f.description || f.title || '').toLowerCase();
    return desc.includes('scam') || 
           desc.includes('spam') || 
           desc.includes('fraud') ||
           desc.includes('suspicious');
  });
  
  if (hasScamIndicator) {
    riskScore += 20;
    keySignals.push('Spam/scam reports associated with this number');
    recommendedActions.push('Exercise caution with communications from this number');
  }

  // Check broker density
  if (brokerFlags.length > 3) {
    riskScore += 25;
    keySignals.push(`High data broker presence (${brokerFlags.length} sources)`);
    recommendedActions.push('Consider data removal requests to reduce exposure');
  } else if (brokerFlags.length > 0) {
    riskScore += 10;
    keySignals.push(`Data broker presence detected (${brokerFlags.length} source${brokerFlags.length > 1 ? 's' : ''})`);
  }

  // Check for high-risk severity findings
  const highRiskCount = findings.filter(f => 
    f.severity === 'critical' || 
    f.severity === 'high'
  ).length;
  
  if (highRiskCount > 0) {
    riskScore += Math.min(highRiskCount * 10, 30);
    if (!keySignals.some(s => s.includes('high-risk'))) {
      keySignals.push(`${highRiskCount} high-risk indicator${highRiskCount > 1 ? 's' : ''} found`);
    }
  }

  // Neutral signals (don't penalize, but mention)
  if (messagingPresence.length > 0) {
    keySignals.push(`Active on ${messagingPresence.length} messaging platform${messagingPresence.length > 1 ? 's' : ''}`);
  }
  
  if (carrierIntel.length > 0) {
    const carrier = carrierIntel[0];
    const carrierName = carrier.description || carrier.title;
    if (carrierName) {
      keySignals.push(`Carrier: ${carrierName}`);
    }
  }

  // Default recommendation if none added
  if (recommendedActions.length === 0) {
    recommendedActions.push('Continue standard verification procedures');
  }

  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high';
  if (riskScore >= 60) {
    riskLevel = 'high';
  } else if (riskScore >= 30) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // Generate summary
  const summary = `Basic phone analysis identified ${findings.length} signals. Risk assessment: ${riskLevel.toUpperCase()} (${riskScore}/100). ${keySignals.length > 0 ? keySignals[0] + '.' : 'No significant risk indicators detected.'}`;

  return {
    summary,
    riskScore,
    riskLevel,
    keySignals,
    recommendedActions,
    confidence: 0.5, // Lower confidence for deterministic
    fallbackMode: true,
    fallbackReason: reason,
  };
}

/**
 * Generate a short summary for non-phone scans (Free tier)
 */
export function generateDeterministicScanSummary(findings: Finding[]): {
  summary: string;
  riskLevel: 'low' | 'medium' | 'high';
  keyPoints: string[];
} {
  const breachCount = findings.filter(f => 
    f.type === 'breach' ||
    f.providerCategory === 'breach'
  ).length;
  
  const exposureCount = findings.filter(f => 
    f.providerCategory === 'exposure' ||
    f.providerCategory === 'data_exposure'
  ).length;
  
  const socialProfiles = findings.filter(f => 
    f.type === 'social_media' ||
    f.providerCategory === 'social'
  ).length;

  const keyPoints: string[] = [];
  let riskScore = 0;

  if (breachCount > 5) {
    riskScore += 40;
    keyPoints.push(`High breach exposure: ${breachCount} breaches found`);
  } else if (breachCount > 0) {
    riskScore += breachCount * 5;
    keyPoints.push(`${breachCount} breach${breachCount > 1 ? 'es' : ''} detected`);
  }

  if (exposureCount > 3) {
    riskScore += 25;
    keyPoints.push(`Data exposure across ${exposureCount} sources`);
  } else if (exposureCount > 0) {
    riskScore += exposureCount * 5;
    keyPoints.push(`${exposureCount} data source${exposureCount > 1 ? 's' : ''} found`);
  }

  if (socialProfiles > 10) {
    keyPoints.push(`Large digital footprint: ${socialProfiles} profiles`);
  } else if (socialProfiles > 0) {
    keyPoints.push(`${socialProfiles} social profile${socialProfiles > 1 ? 's' : ''} discovered`);
  }

  riskScore = Math.min(riskScore, 100);
  
  let riskLevel: 'low' | 'medium' | 'high';
  if (riskScore >= 60) {
    riskLevel = 'high';
  } else if (riskScore >= 30) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  const summary = `Analyzed ${findings.length} findings. ${keyPoints.length > 0 ? keyPoints[0] : 'No significant issues detected.'}`;

  return { summary, riskLevel, keyPoints };
}
