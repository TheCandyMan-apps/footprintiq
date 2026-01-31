/**
 * Step definitions for Free tier quick scan progress UI
 * These steps create a SherlockEye-style progress experience
 * with scan-type-specific terminology
 */

export type ScanStepType = 'username' | 'email' | 'phone';

export interface ScanStep {
  id: string;
  title: string;
  description: string;
}

/**
 * Username scan steps (default)
 */
const USERNAME_STEPS: ScanStep[] = [
  {
    id: 'reputation_check',
    title: 'Checking username reputation...',
    description: 'Evaluating public presence, uniqueness, and trust indicators across open sources...'
  },
  {
    id: 'platform_search',
    title: 'Searching social and public platforms...',
    description: 'Detecting the username across social networks, forums, marketplaces, and other public platforms...'
  },
  {
    id: 'cross_reference',
    title: 'Cross-referencing related data...',
    description: 'Linking the username to emails, phone numbers, or profiles found in open sources...'
  },
  {
    id: 'entity_mapping',
    title: 'Mapping associated entities...',
    description: 'Identifying connected domains, accounts, and organizations linked to the username...'
  },
  {
    id: 'georeferencing',
    title: 'Georeferencing online activity...',
    description: 'Analyzing posting times, language, and content context to infer probable regions of activity...'
  },
  {
    id: 'timeline',
    title: 'Building activity timeline...',
    description: 'Chronologically organizing public posts, updates, and mentions to trace behavioral evolution...'
  }
];

/**
 * Email scan steps
 */
const EMAIL_STEPS: ScanStep[] = [
  {
    id: 'reputation_check',
    title: 'Checking email reputation...',
    description: 'Evaluating deliverability, domain trust, and sender reputation indicators...'
  },
  {
    id: 'breach_scan',
    title: 'Scanning breach databases...',
    description: 'Searching known data breaches for exposure records linked to this email address...'
  },
  {
    id: 'cross_reference',
    title: 'Cross-referencing related accounts...',
    description: 'Identifying linked profiles, usernames, and social accounts associated with this email...'
  },
  {
    id: 'entity_mapping',
    title: 'Mapping associated identities...',
    description: 'Discovering connected domains, organizations, and alternative email addresses...'
  },
  {
    id: 'registration_check',
    title: 'Analyzing registration patterns...',
    description: 'Checking for account presence across popular services and platforms...'
  },
  {
    id: 'timeline',
    title: 'Building exposure timeline...',
    description: 'Chronologically organizing breach events and data leak occurrences...'
  }
];

/**
 * Phone scan steps
 */
const PHONE_STEPS: ScanStep[] = [
  {
    id: 'format_validation',
    title: 'Validating phone format...',
    description: 'Checking number syntax, country code, and international format compliance...'
  },
  {
    id: 'carrier_check',
    title: 'Checking carrier intelligence...',
    description: 'Identifying carrier name, line type, and regional assignment details...'
  },
  {
    id: 'messaging_scan',
    title: 'Scanning messaging platforms...',
    description: 'Detecting registration presence on messaging services and social platforms...'
  },
  {
    id: 'cross_reference',
    title: 'Cross-referencing public records...',
    description: 'Searching for associated names, addresses, or business listings...'
  },
  {
    id: 'risk_analysis',
    title: 'Analyzing risk indicators...',
    description: 'Evaluating fraud signals, spam reports, and VOIP detection markers...'
  },
  {
    id: 'summary',
    title: 'Building intelligence summary...',
    description: 'Compiling carrier data, risk scores, and presence indicators into final report...'
  }
];

/**
 * Get steps for a specific scan type
 */
export function getStepsForScanType(scanType: ScanStepType): ScanStep[] {
  switch (scanType) {
    case 'email':
      return EMAIL_STEPS;
    case 'phone':
      return PHONE_STEPS;
    case 'username':
    default:
      return USERNAME_STEPS;
  }
}

/**
 * Get total steps count for a scan type
 */
export function getTotalStepsForScanType(scanType: ScanStepType): number {
  return getStepsForScanType(scanType).length;
}

// Legacy exports for backwards compatibility
export const FREE_SCAN_STEPS = USERNAME_STEPS;
export const TOTAL_FREE_SCAN_STEPS = USERNAME_STEPS.length;

/**
 * Get step by provider ID (matches n8n workflow step IDs)
 */
export function getStepByProvider(providerId: string, scanType: ScanStepType = 'username'): ScanStep | undefined {
  return getStepsForScanType(scanType).find(step => step.id === providerId);
}

/**
 * Get step by index (1-based to match n8n)
 */
export function getStepByIndex(index: number, scanType: ScanStepType = 'username'): ScanStep | undefined {
  return getStepsForScanType(scanType)[index - 1];
}
