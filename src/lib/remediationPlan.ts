import type { ExposureDriver } from '@/lib/exposureScoreDrivers';
import type { ExposureLevel } from '@/lib/exposureScore';

export type Impact = 'high' | 'med' | 'low';
export type Effort = 'easy' | 'med' | 'hard';

export interface RemediationStep {
  title: string;
  description: string;
  impact: Impact;
  effort: Effort;
  category: string;
}

export interface RemediationPlan {
  steps: RemediationStep[];
  summary: string;
}

const CATEGORY_STEPS: Record<string, RemediationStep[]> = {
  public_profiles: [
    {
      title: 'Audit active public profiles',
      description: 'Review each platform where your identifier was found. Remove or deactivate accounts you no longer use.',
      impact: 'high',
      effort: 'med',
      category: 'public_profiles',
    },
    {
      title: 'Tighten privacy settings',
      description: 'On platforms you keep, restrict profile visibility, disable public search indexing, and limit what is shown to non-contacts.',
      impact: 'med',
      effort: 'easy',
      category: 'public_profiles',
    },
    {
      title: 'Remove unused accounts',
      description: 'Delete dormant accounts that increase your discoverable surface area without providing value.',
      impact: 'high',
      effort: 'med',
      category: 'public_profiles',
    },
  ],
  identifier_reuse: [
    {
      title: 'Rotate shared usernames',
      description: 'Where possible, change usernames that are identical across platforms to reduce cross-platform correlation.',
      impact: 'high',
      effort: 'hard',
      category: 'identifier_reuse',
    },
    {
      title: 'Separate personal and professional identities',
      description: 'Use distinct identifiers for personal, professional, and sensitive accounts to compartmentalise your digital presence.',
      impact: 'med',
      effort: 'med',
      category: 'identifier_reuse',
    },
  ],
  breach_association: [
    {
      title: 'Reset compromised passwords',
      description: 'Change passwords on any account associated with a known breach. Prioritise email and financial accounts.',
      impact: 'high',
      effort: 'easy',
      category: 'breach_association',
    },
    {
      title: 'Enable multi-factor authentication',
      description: 'Add MFA (preferably hardware key or authenticator app) to all accounts linked to breach records.',
      impact: 'high',
      effort: 'easy',
      category: 'breach_association',
    },
    {
      title: 'Adopt a password manager',
      description: 'Use a reputable password manager to generate unique credentials for every account, preventing credential reuse.',
      impact: 'med',
      effort: 'easy',
      category: 'breach_association',
    },
  ],
  metadata_signals: [
    {
      title: 'Review domain and IP exposure',
      description: 'Check DNS records, WHOIS data, and hosting configurations for unintended information disclosure.',
      impact: 'med',
      effort: 'med',
      category: 'metadata_signals',
    },
    {
      title: 'Tighten infrastructure visibility',
      description: 'Enable WHOIS privacy, review SSL certificate details, and minimise metadata leakage from public-facing services.',
      impact: 'med',
      effort: 'hard',
      category: 'metadata_signals',
    },
  ],
  data_broker: [
    {
      title: 'Submit data broker opt-out requests',
      description: 'Identify data aggregation services listing your information and submit removal or opt-out requests where available.',
      impact: 'high',
      effort: 'hard',
      category: 'data_broker',
    },
  ],
  high_risk: [
    {
      title: 'Prioritise review of high-severity signals',
      description: 'Focus on findings flagged as high or critical severity first — these represent the most actionable exposure points.',
      impact: 'high',
      effort: 'med',
      category: 'high_risk',
    },
  ],
};

const LEVEL_SUMMARIES: Record<ExposureLevel, string> = {
  low: 'Your exposure is limited. A few small steps can help maintain your privacy posture.',
  moderate: 'Several areas contribute to your public footprint. Targeted actions can meaningfully reduce your exposure.',
  high: 'Your identifier has significant public visibility. Prioritise the high-impact steps below.',
  severe: 'Extensive exposure detected. We recommend working through these steps systematically, starting with the highest-impact items.',
};

export function buildRemediationPlan(
  drivers: ExposureDriver[],
  level: ExposureLevel,
): RemediationPlan {
  if (!drivers || drivers.length === 0) {
    return {
      steps: [],
      summary: LEVEL_SUMMARIES.low,
    };
  }

  const seenCategories = new Set<string>();
  const steps: RemediationStep[] = [];

  for (const driver of drivers) {
    if (seenCategories.has(driver.category)) continue;
    seenCategories.add(driver.category);

    const categorySteps = CATEGORY_STEPS[driver.category];
    if (categorySteps) {
      steps.push(...categorySteps);
    }
  }

  // Sort: high impact first, then by effort (easy first)
  const impactOrder: Record<Impact, number> = { high: 0, med: 1, low: 2 };
  const effortOrder: Record<Effort, number> = { easy: 0, med: 1, hard: 2 };
  steps.sort((a, b) => {
    const impactDiff = impactOrder[a.impact] - impactOrder[b.impact];
    if (impactDiff !== 0) return impactDiff;
    return effortOrder[a.effort] - effortOrder[b.effort];
  });

  return {
    steps,
    summary: LEVEL_SUMMARIES[level] || LEVEL_SUMMARIES.low,
  };
}
