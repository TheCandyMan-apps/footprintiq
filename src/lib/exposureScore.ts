import { Finding } from "@/lib/ufm";

export interface ExposureCategory {
  id: string;
  label: string;
  detected: boolean;
  evidence?: Finding[];
}

export type ExposureLevel = 'low' | 'moderate' | 'high';

export interface ExposureScoreResult {
  score: number;
  level: ExposureLevel;
  insight: string;
  categories: ExposureCategory[];
}

// Category definitions
const CATEGORY_DEFINITIONS = [
  { id: 'public_profiles', label: 'Public profile discoverability' },
  { id: 'identifier_reuse', label: 'Identifier reuse' },
  { id: 'data_broker', label: 'Data broker–linked exposure' },
  { id: 'breach_association', label: 'Breach association' },
  { id: 'metadata_signals', label: 'Metadata & infrastructure signals' },
] as const;

// Insight sentences mapped to highest contributing category
const INSIGHTS: Record<string, string> = {
  public_profiles: "Most of your exposure comes from publicly discoverable profiles.",
  identifier_reuse: "Identifier reuse significantly increases your exposure.",
  breach_association: "Your email appears in multiple historical breach datasets.",
  data_broker: "Your exposure pattern matches common data aggregation profiles.",
  metadata_signals: "Infrastructure signals contribute to your digital footprint.",
  default: "Your digital footprint has been analyzed across multiple public sources.",
};

// Calculate category scores from findings
function calculateCategoryScores(findings: Finding[]): Record<string, { score: number; evidence: Finding[] }> {
  const categories: Record<string, { score: number; evidence: Finding[] }> = {
    public_profiles: { score: 0, evidence: [] },
    identifier_reuse: { score: 0, evidence: [] },
    data_broker: { score: 0, evidence: [] },
    breach_association: { score: 0, evidence: [] },
    metadata_signals: { score: 0, evidence: [] },
  };

  // Track unique providers for identifier reuse detection
  const providersByType: Record<string, Set<string>> = {
    social_media: new Set(),
    identity: new Set(),
  };

  for (const finding of findings) {
    const severityMultiplier = {
      critical: 1.5,
      high: 1.2,
      medium: 1.0,
      low: 0.6,
      info: 0.3,
    }[finding.severity] || 1.0;

    const baseScore = finding.confidence * severityMultiplier * 10;

    // Categorize findings
    switch (finding.type) {
      case 'social_media':
        categories.public_profiles.score += baseScore;
        categories.public_profiles.evidence.push(finding);
        providersByType.social_media.add(finding.provider);
        break;

      case 'identity':
        categories.public_profiles.score += baseScore * 0.5;
        categories.public_profiles.evidence.push(finding);
        providersByType.identity.add(finding.provider);
        
        // Check for data broker indicators
        if (finding.provider.toLowerCase().includes('broker') || 
            finding.tags?.some(t => t.includes('data_broker'))) {
          categories.data_broker.score += baseScore;
          categories.data_broker.evidence.push(finding);
        }
        break;

      case 'breach':
        categories.breach_association.score += baseScore * 1.5;
        categories.breach_association.evidence.push(finding);
        break;

      case 'ip_exposure':
      case 'domain_reputation':
      case 'dns_history':
      case 'domain_tech':
        categories.metadata_signals.score += baseScore;
        categories.metadata_signals.evidence.push(finding);
        break;

      case 'phone_intelligence':
        categories.public_profiles.score += baseScore * 0.3;
        categories.data_broker.score += baseScore * 0.7;
        categories.data_broker.evidence.push(finding);
        break;

      default:
        // Generic exposure contribution
        categories.metadata_signals.score += baseScore * 0.5;
    }
  }

  // Calculate identifier reuse based on cross-platform presence
  const totalProviders = providersByType.social_media.size + providersByType.identity.size;
  if (totalProviders >= 5) {
    categories.identifier_reuse.score = Math.min(30, totalProviders * 3);
    // Add all social/identity findings as evidence for reuse
    categories.identifier_reuse.evidence = findings.filter(
      f => f.type === 'social_media' || f.type === 'identity'
    );
  } else if (totalProviders >= 3) {
    categories.identifier_reuse.score = totalProviders * 2;
    categories.identifier_reuse.evidence = findings.filter(
      f => f.type === 'social_media' || f.type === 'identity'
    );
  }

  return categories;
}

// Get level from score
export function getExposureLevel(score: number): ExposureLevel {
  if (score <= 29) return 'low';
  if (score <= 59) return 'moderate';
  return 'high';
}

// Get color class for level
export function getExposureLevelColor(level: ExposureLevel): string {
  switch (level) {
    case 'low':
      return 'text-green-500';
    case 'moderate':
      return 'text-yellow-500';
    case 'high':
      return 'text-red-500';
  }
}

export function getExposureLevelBgColor(level: ExposureLevel): string {
  switch (level) {
    case 'low':
      return 'bg-green-500/10 border-green-500/30';
    case 'moderate':
      return 'bg-yellow-500/10 border-yellow-500/30';
    case 'high':
      return 'bg-red-500/10 border-red-500/30';
  }
}

export function getExposureLevelLabel(level: ExposureLevel): string {
  switch (level) {
    case 'low':
      return 'Low exposure';
    case 'moderate':
      return 'Moderate exposure';
    case 'high':
      return 'High exposure';
  }
}

// Main calculation function
export function calculateExposureScore(findings: Finding[]): ExposureScoreResult {
  if (!findings || findings.length === 0) {
    return {
      score: 0,
      level: 'low',
      insight: INSIGHTS.default,
      categories: CATEGORY_DEFINITIONS.map(cat => ({
        id: cat.id,
        label: cat.label,
        detected: false,
        evidence: [],
      })),
    };
  }

  const categoryScores = calculateCategoryScores(findings);

  // Weighted score calculation (sum normalized to 100)
  const weights = {
    public_profiles: 0.25,
    identifier_reuse: 0.20,
    data_broker: 0.20,
    breach_association: 0.25,
    metadata_signals: 0.10,
  };

  // Normalize each category to 0-100 range, then apply weights
  const maxCategoryScore = 50; // Cap per category before normalization
  let totalScore = 0;
  let highestCategory = '';
  let highestCategoryScore = 0;

  for (const [catId, catData] of Object.entries(categoryScores)) {
    const normalizedScore = Math.min(catData.score, maxCategoryScore) / maxCategoryScore * 100;
    const weightedScore = normalizedScore * (weights[catId as keyof typeof weights] || 0.1);
    totalScore += weightedScore;

    if (catData.score > highestCategoryScore && catData.score > 0) {
      highestCategoryScore = catData.score;
      highestCategory = catId;
    }
  }

  // Clamp final score to 0-100
  const finalScore = Math.round(Math.min(100, Math.max(0, totalScore)));
  const level = getExposureLevel(finalScore);
  const insight = INSIGHTS[highestCategory] || INSIGHTS.default;

  // Build categories array
  const categories: ExposureCategory[] = CATEGORY_DEFINITIONS.map(cat => ({
    id: cat.id,
    label: cat.label,
    detected: categoryScores[cat.id].score > 0,
    evidence: categoryScores[cat.id].evidence,
  }));

  return {
    score: finalScore,
    level,
    insight,
    categories,
  };
}
