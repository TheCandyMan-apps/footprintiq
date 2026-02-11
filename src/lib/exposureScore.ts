import { Finding } from "@/lib/ufm";

export interface ExposureCategory {
  id: string;
  label: string;
  detected: boolean;
  evidence?: Finding[];
}

export type ExposureLevel = 'low' | 'moderate' | 'high' | 'severe';

export interface ExposureScoreResult {
  score: number;
  level: ExposureLevel;
  insight: string;
  categories: ExposureCategory[];
}

// Category definitions (unchanged shape)
const CATEGORY_DEFINITIONS = [
  { id: 'public_profiles', label: 'Public profile discoverability' },
  { id: 'identifier_reuse', label: 'Identifier reuse' },
  { id: 'data_broker', label: 'Data broker–linked exposure' },
  { id: 'breach_association', label: 'Breach association' },
  { id: 'metadata_signals', label: 'Metadata & infrastructure signals' },
] as const;

// Insight sentences mapped to highest contributing bucket
const INSIGHTS: Record<string, string> = {
  public_profiles: "Most of your exposure comes from publicly discoverable profiles.",
  identifier_reuse: "Identifier reuse significantly increases your exposure.",
  breach_association: "Your email appears in multiple historical breach datasets.",
  data_broker: "Your exposure pattern matches common data aggregation profiles.",
  metadata_signals: "Infrastructure signals contribute to your digital footprint.",
  default: "Your digital footprint has been analyzed across multiple public sources.",
};

// --- Level helpers ---

export function getExposureLevel(score: number): ExposureLevel {
  if (score <= 24) return 'low';
  if (score <= 49) return 'moderate';
  if (score <= 74) return 'high';
  return 'severe';
}

export function getExposureLevelColor(level: ExposureLevel): string {
  switch (level) {
    case 'low':
      return 'text-green-500';
    case 'moderate':
      return 'text-yellow-500';
    case 'high':
      return 'text-red-500';
    case 'severe':
      return 'text-red-600';
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
    case 'severe':
      return 'bg-red-600/10 border-red-600/30';
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
    case 'severe':
      return 'Severe exposure';
  }
}

// --- Additive surface-area scoring ---

function getProfileContribution(findings: Finding[]): { score: number; evidence: Finding[] } {
  const profileFindings = findings.filter(
    f => f.type === 'social_media' || f.type === 'identity'
  );
  const count = profileFindings.length;

  let score = 0;
  if (count > 100) score = 60;
  else if (count > 50) score = 45;
  else if (count > 20) score = 30;
  else if (count > 5) score = 15;
  else if (count > 0) score = 5;

  return { score, evidence: profileFindings };
}

function getBreachContribution(findings: Finding[]): { score: number; evidence: Finding[] } {
  const breachFindings = findings.filter(f => {
    if (f.type === 'breach') return true;
    const kind = (f as any).kind as string | undefined;
    if (kind === 'breach.hit') return true;
    if ((f.provider || '').toLowerCase().includes('hibp')) return true;
    return false;
  });
  const count = breachFindings.length;

  let score = 0;
  if (count > 5) score = 35;
  else if (count >= 2) score = 25;
  else if (count === 1) score = 15;

  return { score, evidence: breachFindings };
}

function getSeverityContribution(findings: Finding[]): { score: number; evidence: Finding[] } {
  const highSevFindings = findings.filter(
    f => f.severity === 'high' || f.severity === 'critical'
  );
  const score = Math.min(20, highSevFindings.length * 5);
  return { score, evidence: highSevFindings };
}

function getReuseContribution(findings: Finding[]): { score: number; evidence: Finding[] } {
  const profileFindings = findings.filter(
    f => f.type === 'social_media' || f.type === 'identity'
  );
  const uniqueProviders = new Set(profileFindings.map(f => f.provider).filter(Boolean));
  const score = uniqueProviders.size >= 3 ? 10 : 0;
  return { score, evidence: score > 0 ? profileFindings : [] };
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

  // Calculate each bucket
  const profile = getProfileContribution(findings);
  const breach = getBreachContribution(findings);
  const severity = getSeverityContribution(findings);
  const reuse = getReuseContribution(findings);

  // Additive score, clamped 0-100
  const rawScore = profile.score + breach.score + severity.score + reuse.score;
  const finalScore = Math.round(Math.min(100, Math.max(0, rawScore)));
  const level = getExposureLevel(finalScore);

  // Determine highest contributing bucket for insight
  const buckets = [
    { id: 'public_profiles', score: profile.score },
    { id: 'breach_association', score: breach.score },
    { id: 'metadata_signals', score: severity.score },
    { id: 'identifier_reuse', score: reuse.score },
  ];
  const highestBucket = buckets.reduce((a, b) => (b.score > a.score ? b : a), buckets[0]);
  const insight = highestBucket.score > 0
    ? (INSIGHTS[highestBucket.id] || INSIGHTS.default)
    : INSIGHTS.default;

  // Map buckets to category output (preserving CATEGORY_DEFINITIONS shape)
  const bucketMap: Record<string, { score: number; evidence: Finding[] }> = {
    public_profiles: profile,
    identifier_reuse: reuse,
    data_broker: { score: 0, evidence: [] }, // Not scored in surface-area model
    breach_association: breach,
    metadata_signals: severity,
  };

  const categories: ExposureCategory[] = CATEGORY_DEFINITIONS.map(cat => ({
    id: cat.id,
    label: cat.label,
    detected: (bucketMap[cat.id]?.score ?? 0) > 0,
    evidence: bucketMap[cat.id]?.evidence ?? [],
  }));

  return {
    score: finalScore,
    level,
    insight,
    categories,
  };
}
