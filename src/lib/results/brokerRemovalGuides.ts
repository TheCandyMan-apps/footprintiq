/**
 * Maps known data broker / people-search platform names to their
 * corresponding public removal-guide page on FootprintIQ.
 *
 * Only platforms with a published guide should appear here.
 * Matching is case-insensitive on the normalised key.
 */

const BROKER_REMOVAL_GUIDES: Record<string, string> = {
  mylife: '/remove-mylife-profile',
  // Future guides — uncomment as pages are published:
  // spokeo: '/remove-spokeo-profile',
  // beenverified: '/remove-beenverified-profile',
  // whitepages: '/remove-whitepages-profile',
};

/**
 * Returns the removal-guide path for a given platform name, or null if none exists.
 */
export function getBrokerRemovalGuide(platformName: string): string | null {
  const key = platformName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return BROKER_REMOVAL_GUIDES[key] ?? null;
}
