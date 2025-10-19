/**
 * AI Recommendations Engine
 * Suggests mitigations and next actions for corporate users
 */

export interface Recommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  estimatedImpact: string;
  estimatedEffort: string;
  actionSteps: string[];
}

/**
 * Generate recommendations based on risk categories
 */
export function generateRecommendations(
  dataSources: any[],
  riskBreakdown: { high: number; medium: number; low: number }
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Analyze data sources by category
  const categories = dataSources.reduce((acc, ds: any) => {
    if (!acc[ds.category]) {
      acc[ds.category] = [];
    }
    acc[ds.category].push(ds);
    return acc;
  }, {} as Record<string, any[]>);

  // Generate recommendations for each high-risk category
  Object.entries(categories).forEach(([category, sources]: [string, any[]]) => {
    const highRiskCount = sources.filter((s: any) => s.risk_level === 'high').length;
    
    if (highRiskCount > 0 && Array.isArray(sources)) {
      recommendations.push({
        id: `rec-${category}-${Date.now()}`,
        priority: 'critical',
        category,
        title: `Address ${category} Exposures`,
        description: `Found ${highRiskCount} high-risk exposures in ${category}. Immediate action required.`,
        estimatedImpact: 'High - Reduces exposure by 30-40%',
        estimatedEffort: 'Medium - 2-4 weeks',
        actionSteps: [
          `Review all ${sources.length} ${category} exposures`,
          'Request data removal from high-risk sources',
          'Implement monitoring for new exposures',
          'Update privacy settings on affected platforms',
        ],
      });
    }
  });

  // Email breach recommendations
  const emailBreaches = dataSources.filter(ds => 
    ds.category === 'Email Breach' || ds.name.includes('Have I Been Pwned')
  );
  if (emailBreaches.length > 0) {
    recommendations.push({
      id: 'rec-email-breach',
      priority: 'critical',
      category: 'Data Breach',
      title: 'Respond to Email Breaches',
      description: `Your email was found in ${emailBreaches.length} data breaches. Take immediate action to secure accounts.`,
      estimatedImpact: 'Critical - Prevents account takeover',
      estimatedEffort: 'Low - 1-2 hours',
      actionSteps: [
        'Change passwords for all affected accounts',
        'Enable two-factor authentication (2FA)',
        'Monitor for suspicious activity',
        'Consider using a password manager',
        'Review and close unused accounts',
      ],
    });
  }

  // Social media privacy recommendations
  const socialProfiles = dataSources.filter(ds => 
    ds.category === 'Social Media' || ds.category === 'Username'
  );
  if (socialProfiles.length > 5) {
    recommendations.push({
      id: 'rec-social-privacy',
      priority: 'high',
      category: 'Social Media',
      title: 'Consolidate Social Media Presence',
      description: `Found ${socialProfiles.length} social profiles. Reduce attack surface by consolidating.`,
      estimatedImpact: 'Medium - Reduces exposure by 20-30%',
      estimatedEffort: 'Medium - 1-2 weeks',
      actionSteps: [
        'Audit all social media accounts',
        'Delete or deactivate unused profiles',
        'Review privacy settings on active accounts',
        'Remove personal information from public profiles',
        'Set up Google Alerts for your name',
      ],
    });
  }

  // Domain/website recommendations
  const domainExposures = dataSources.filter(ds => 
    ds.category === 'Domain' || ds.category === 'Website'
  );
  if (domainExposures.length > 0) {
    recommendations.push({
      id: 'rec-domain-security',
      priority: 'high',
      category: 'Technical Security',
      title: 'Secure Domain Infrastructure',
      description: 'Found exposed domains and websites that may leak sensitive information.',
      estimatedImpact: 'High - Protects business reputation',
      estimatedEffort: 'High - 2-4 weeks',
      actionSteps: [
        'Enable WHOIS privacy protection',
        'Review DNS records for leaks',
        'Implement SSL/TLS certificates',
        'Set up security headers (CSP, HSTS)',
        'Regular security audits',
      ],
    });
  }

  // General ongoing monitoring recommendation
  if (recommendations.length > 0) {
    recommendations.push({
      id: 'rec-monitoring',
      priority: 'medium',
      category: 'Ongoing Protection',
      title: 'Enable Continuous Monitoring',
      description: 'Set up automated monitoring to detect new exposures before they become problems.',
      estimatedImpact: 'High - Prevents future exposures',
      estimatedEffort: 'Low - 30 minutes setup',
      actionSteps: [
        'Enable FootprintIQ Pro monitoring',
        'Set up email alerts for new findings',
        'Schedule quarterly privacy audits',
        'Train team on privacy best practices',
        'Document your privacy procedures',
      ],
    });
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return recommendations.sort((a, b) => 
    priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

/**
 * Get recommendation by ID
 */
export function getRecommendationById(
  recommendations: Recommendation[],
  id: string
): Recommendation | undefined {
  return recommendations.find(rec => rec.id === id);
}

/**
 * Filter recommendations by priority
 */
export function filterByPriority(
  recommendations: Recommendation[],
  priority: Recommendation['priority']
): Recommendation[] {
  return recommendations.filter(rec => rec.priority === priority);
}

/**
 * Get actionable recommendations (critical + high priority)
 */
export function getActionableRecommendations(
  recommendations: Recommendation[]
): Recommendation[] {
  return recommendations.filter(rec => 
    rec.priority === 'critical' || rec.priority === 'high'
  );
}
