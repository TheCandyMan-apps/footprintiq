import { Finding, generateFindingId } from "../ufm";

export const enrichEmail = async (email: string): Promise<Finding[]> => {
  const findings: Finding[] = [];
  
  // Extract domain
  const domain = email.split('@')[1];
  
  // Basic validation finding
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  if (!isValid) {
    findings.push({
      id: generateFindingId('email-plugin', 'validation', email),
      type: 'identity' as const,
      title: 'Invalid Email Format',
      description: `The email ${email} does not follow standard format.`,
      severity: 'low',
      confidence: 0.95,
      provider: 'Email Plugin',
      providerCategory: 'Validation',
      evidence: [
        { key: 'Email', value: email },
        { key: 'Valid', value: false }
      ],
      impact: 'Email may be mistyped or fake',
      remediation: ['Verify email address format', 'Check for typos'],
      tags: ['email', 'validation'],
      observedAt: new Date().toISOString()
    });
  }
  
  // Domain reputation finding (placeholder - would use actual API)
  if (domain) {
    findings.push({
      id: generateFindingId('email-plugin', 'domain', domain),
      type: 'domain_reputation' as const,
      title: `Email Domain: ${domain}`,
      description: `Email is associated with domain ${domain}`,
      severity: 'info',
      confidence: 1.0,
      provider: 'Email Plugin',
      providerCategory: 'Domain Analysis',
      evidence: [
        { key: 'Domain', value: domain },
        { key: 'Email', value: email }
      ],
      impact: 'Domain association identified',
      remediation: [],
      tags: ['email', 'domain'],
      observedAt: new Date().toISOString()
    });
  }
  
  return findings;
};