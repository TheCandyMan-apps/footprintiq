import { Finding, generateFindingId } from "../ufm";

export const enrichPhone = async (phone: string): Promise<Finding[]> => {
  const findings: Finding[] = [];
  
  // Basic phone number validation
  const cleaned = phone.replace(/\D/g, '');
  const isValid = cleaned.length >= 10 && cleaned.length <= 15;
  
  if (!isValid) {
    findings.push({
      id: generateFindingId('phone-plugin', 'validation', phone),
      type: 'phone_intelligence' as const,
      title: 'Invalid Phone Number Format',
      description: `Phone number ${phone} does not match expected format.`,
      severity: 'low',
      confidence: 0.9,
      provider: 'Phone Plugin',
      providerCategory: 'Validation',
      evidence: [
        { key: 'Phone', value: phone },
        { key: 'Cleaned', value: cleaned },
        { key: 'Valid', value: false }
      ],
      impact: 'Phone number may be incomplete or incorrectly formatted',
      remediation: ['Verify phone number format', 'Include country code if international'],
      tags: ['phone', 'validation'],
      observedAt: new Date().toISOString()
    });
  } else {
    // Extract country code (basic)
    let countryCode = '';
    if (cleaned.length > 10) {
      countryCode = cleaned.substring(0, cleaned.length - 10);
    }
    
    findings.push({
      id: generateFindingId('phone-plugin', 'info', phone),
      type: 'phone_intelligence' as const,
      title: 'Phone Number Information',
      description: `Validated phone number format.`,
      severity: 'info',
      confidence: 1.0,
      provider: 'Phone Plugin',
      providerCategory: 'Info',
      evidence: [
        { key: 'Phone', value: phone },
        { key: 'Cleaned', value: cleaned },
        { key: 'Country Code', value: countryCode || 'N/A' }
      ],
      impact: 'Phone number format validated',
      remediation: [],
      tags: ['phone', 'info'],
      observedAt: new Date().toISOString()
    });
  }
  
  return findings;
};