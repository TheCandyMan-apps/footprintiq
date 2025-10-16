import { Finding, generateFindingId } from "../ufm";

export const enrichUsername = async (username: string): Promise<Finding[]> => {
  const findings: Finding[] = [];
  
  // Username pattern analysis
  const hasNumbers = /\d/.test(username);
  const hasSpecialChars = /[^a-zA-Z0-9_]/.test(username);
  const length = username.length;
  
  let severity: 'info' | 'low' = 'info';
  let recommendations: string[] = [];
  
  if (length < 3) {
    severity = 'low';
    recommendations.push('Username is very short and may be easily guessed');
  }
  
  if (!hasNumbers && !hasSpecialChars) {
    recommendations.push('Consider using numbers or special characters for uniqueness');
  }
  
  findings.push({
    id: generateFindingId('username-plugin', 'analysis', username),
    type: 'identity' as const,
    title: `Username Pattern Analysis: ${username}`,
    description: `Analysis of username structure and characteristics.`,
    severity,
    confidence: 0.85,
    provider: 'Username Plugin',
    providerCategory: 'Pattern Analysis',
    evidence: [
      { key: 'Username', value: username },
      { key: 'Length', value: length },
      { key: 'Has Numbers', value: hasNumbers },
      { key: 'Has Special Chars', value: hasSpecialChars }
    ],
    impact: 'Username pattern may affect online security',
    remediation: recommendations.length > 0 ? recommendations : ['Username structure is adequate'],
    tags: ['username', 'pattern', 'analysis'],
    observedAt: new Date().toISOString()
  });
  
  return findings;
};