/**
 * Confidence Score Calculation Utilities
 * Computes dynamic confidence scores based on provider match percentages,
 * data quality, and cross-validation between sources
 */

export interface ProviderMatch {
  provider: string;
  dataPoints: string[];
  quality: 'high' | 'medium' | 'low';
}

export interface ConfidenceFactors {
  providerCount: number;
  providerAgreement: number; // 0-1, percentage of providers that agree
  dataQuality: number; // 0-1, average quality of data
  crossValidation: number; // 0-1, how well data cross-validates
  verificationStatus?: boolean;
}

/**
 * Calculate base confidence score from provider matches
 * @param providers Array of providers that found this data
 * @param totalProviders Total number of providers queried
 * @returns Confidence score between 0-100
 */
export function calculateProviderConfidence(
  providers: string[],
  totalProviders: number
): number {
  if (providers.length === 0 || totalProviders === 0) return 0;
  
  const matchPercentage = providers.length / totalProviders;
  
  // Apply weighted scoring:
  // 1 provider: 40-60%
  // 2 providers: 70-80%
  // 3+ providers: 85-95%
  let baseScore = 0;
  
  if (providers.length === 1) {
    baseScore = 50;
  } else if (providers.length === 2) {
    baseScore = 75;
  } else if (providers.length >= 3) {
    baseScore = 90;
  }
  
  // Add bonus for higher match percentage
  const matchBonus = matchPercentage * 10;
  
  return Math.min(95, baseScore + matchBonus);
}

/**
 * Calculate data quality score based on completeness and verification
 * @param dataFound Array of data fields found
 * @param isVerified Whether the data has been verified
 * @param source Source name/provider
 * @returns Quality score between 0-100
 */
export function calculateDataQualityScore(
  dataFound: string[],
  isVerified: boolean,
  source?: string
): number {
  let qualityScore = 50; // Base score
  
  // More data fields = higher quality
  const dataFieldBonus = Math.min(30, dataFound.length * 3);
  qualityScore += dataFieldBonus;
  
  // Verified data gets significant bonus
  if (isVerified) {
    qualityScore += 20;
  }
  
  // Trusted sources get bonus
  const trustedSources = [
    'Have I Been Pwned',
    'Hunter.io',
    'Clearbit',
    'FullContact',
    'Pipl',
  ];
  
  if (source && trustedSources.some(ts => source.toLowerCase().includes(ts.toLowerCase()))) {
    qualityScore += 10;
  }
  
  return Math.min(100, qualityScore);
}

/**
 * Calculate cross-validation score by checking data consistency
 * @param allDataSources All data sources for comparison
 * @param currentSource Current data source being scored
 * @returns Cross-validation score between 0-100
 */
export function calculateCrossValidationScore(
  allDataSources: Array<{ name: string; data_found: string[]; category: string }>,
  currentSource: { name: string; data_found: string[]; category: string }
): number {
  if (allDataSources.length <= 1) return 50; // No comparison possible
  
  let validationScore = 0;
  let comparisonCount = 0;
  
  // Compare with other sources in same category
  const sameCategorySources = allDataSources.filter(
    ds => ds.category === currentSource.category && ds.name !== currentSource.name
  );
  
  for (const otherSource of sameCategorySources) {
    // Check overlap in data fields
    const overlap = currentSource.data_found.filter(field =>
      otherSource.data_found.some(otherField =>
        otherField.toLowerCase().includes(field.toLowerCase()) ||
        field.toLowerCase().includes(otherField.toLowerCase())
      )
    );
    
    if (overlap.length > 0) {
      const overlapPercentage = overlap.length / Math.max(
        currentSource.data_found.length,
        otherSource.data_found.length
      );
      validationScore += overlapPercentage * 100;
      comparisonCount++;
    }
  }
  
  if (comparisonCount === 0) return 60; // No validation but not a penalty
  
  return Math.min(100, validationScore / comparisonCount);
}

/**
 * Calculate final confidence score with all factors
 * @param factors All confidence factors
 * @returns Final confidence score between 0-100
 */
export function calculateFinalConfidence(factors: ConfidenceFactors): number {
  const {
    providerCount,
    providerAgreement,
    dataQuality,
    crossValidation,
    verificationStatus,
  } = factors;
  
  // Weighted average of all factors
  let confidence = 0;
  
  // Provider count weight: 30%
  const providerScore = Math.min(100, (providerCount / 3) * 100);
  confidence += providerScore * 0.30;
  
  // Provider agreement weight: 25%
  confidence += providerAgreement * 100 * 0.25;
  
  // Data quality weight: 25%
  confidence += dataQuality * 0.25;
  
  // Cross-validation weight: 15%
  confidence += crossValidation * 0.15;
  
  // Verification bonus: +5% if verified
  if (verificationStatus) {
    confidence += 5;
  }
  
  return Math.round(Math.min(100, Math.max(0, confidence)));
}

/**
 * Calculate social profile confidence based on profile completeness
 * @param profile Social profile data
 * @param matchingProfiles Number of other platforms with same username
 * @returns Confidence score between 0-100
 */
export function calculateSocialProfileConfidence(
  profile: {
    username: string;
    found: boolean;
    is_verified?: boolean;
    followers?: number | null;
    full_name?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
  },
  matchingProfiles: number
): number {
  if (!profile.found) return 0;
  
  let confidence = 40; // Base score for found profile
  
  // Profile completeness
  if (profile.full_name) confidence += 10;
  if (profile.bio) confidence += 10;
  if (profile.avatar_url) confidence += 10;
  if (profile.followers && profile.followers > 0) confidence += 5;
  
  // Verification bonus
  if (profile.is_verified) confidence += 15;
  
  // Cross-platform validation
  if (matchingProfiles > 0) {
    confidence += Math.min(20, matchingProfiles * 5);
  }
  
  return Math.min(100, confidence);
}

/**
 * Calculate data source confidence for single provider result
 * @param source Data source information
 * @param allSources All data sources for cross-validation
 * @returns Confidence score between 0-100
 */
export function calculateDataSourceConfidence(
  source: {
    name: string;
    category: string;
    risk_level: string;
    data_found: string[];
    metadata?: any;
  },
  allSources: Array<{ name: string; data_found: string[]; category: string }>
): number {
  // Get unique providers that contributed to this data
  const providers = [source.name];
  const similarSources = allSources.filter(
    s => s.category === source.category && s.name !== source.name
  );
  
  // Calculate individual scores
  const providerScore = calculateProviderConfidence(providers, Math.max(3, allSources.length));
  const qualityScore = calculateDataQualityScore(
    source.data_found,
    source.metadata?.is_verified || false,
    source.name
  );
  const validationScore = calculateCrossValidationScore(allSources, source);
  
  // Weighted combination
  const confidence = (
    providerScore * 0.35 +
    qualityScore * 0.40 +
    validationScore * 0.25
  );
  
  return Math.round(Math.min(100, Math.max(20, confidence)));
}
