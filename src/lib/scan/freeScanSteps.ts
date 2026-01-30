/**
 * Step definitions for Free tier quick scan progress UI
 * These steps create a SherlockEye-style progress experience
 */

export interface ScanStep {
  id: string;
  title: string;
  description: string;
}

export const FREE_SCAN_STEPS: ScanStep[] = [
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

export const TOTAL_FREE_SCAN_STEPS = FREE_SCAN_STEPS.length;

/**
 * Get step by provider ID (matches n8n workflow step IDs)
 */
export function getStepByProvider(providerId: string): ScanStep | undefined {
  return FREE_SCAN_STEPS.find(step => step.id === providerId);
}

/**
 * Get step by index (1-based to match n8n)
 */
export function getStepByIndex(index: number): ScanStep | undefined {
  return FREE_SCAN_STEPS[index - 1];
}
