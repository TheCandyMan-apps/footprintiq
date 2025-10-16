import { Finding, generateFindingId } from "../ufm";

export const enrichDomain = async (domain: string): Promise<Finding[]> => {
  const findings: Finding[] = [];
  
  // TLD analysis
  const tld = domain.split('.').pop() || '';
  const suspiciousTLDs = ['tk', 'ml', 'ga', 'cf', 'gq'];
  
  if (suspiciousTLDs.includes(tld)) {
    findings.push({
      id: generateFindingId('domain-plugin', 'tld', domain),
      type: 'domain_reputation' as const,
      title: `Suspicious TLD Detected: .${tld}`,
      description: `Domain ${domain} uses a TLD commonly associated with spam or malicious activity.`,
      severity: 'medium',
      confidence: 0.7,
      provider: 'Domain Plugin',
      providerCategory: 'TLD Analysis',
      evidence: [
        { key: 'Domain', value: domain },
        { key: 'TLD', value: tld }
      ],
      impact: 'Domain may be associated with suspicious activity',
      remediation: [
        'Verify domain legitimacy',
        'Check domain registration date',
        'Look for trust indicators'
      ],
      tags: ['domain', 'tld', 'reputation'],
      observedAt: new Date().toISOString()
    });
  }
  
  return findings;
};