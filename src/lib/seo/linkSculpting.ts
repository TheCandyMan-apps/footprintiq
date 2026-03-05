/**
 * Internal link sculpting rules for templates.
 * Returns curated links for each template type, ensuring
 * consistent, non-duplicated cross-linking across the site.
 */

export interface SculptedLinks {
  topicHub?: string;
  platforms: string[];
  comparisons: string[];
  guides: string[];
  glossary: string[];
}

/** Links for tool landing pages */
export function getToolSculptedLinks(currentPath: string): SculptedLinks {
  const base: SculptedLinks = {
    topicHub: "/topics/username-search",
    platforms: ["/platforms/instagram/username-search", "/platforms/tiktok/username-search"],
    comparisons: ["/comparisons/sherlock"],
    guides: ["/guides/what-is-username-osint", "/guides/how-to-trace-a-username"],
    glossary: ["/glossary/username-osint"],
  };

  // Avoid self-links
  const filter = (paths: string[]) => paths.filter(p => p !== currentPath);
  return {
    ...base,
    platforms: filter(base.platforms),
    comparisons: filter(base.comparisons),
    guides: filter(base.guides),
    glossary: filter(base.glossary),
  };
}

/** Links for platform pages */
export function getPlatformSculptedLinks(currentPath: string): SculptedLinks {
  return {
    topicHub: undefined,
    platforms: [],
    comparisons: ["/comparisons/sherlock", "/comparisons/maigret"].filter(p => p !== currentPath),
    guides: ["/guides/what-is-username-osint"],
    glossary: ["/glossary/digital-footprint"],
  };
}

/** Links for comparison pages */
export function getComparisonSculptedLinks(currentPath: string): SculptedLinks {
  return {
    topicHub: undefined,
    platforms: [],
    comparisons: [],
    guides: ["/guides/what-is-username-osint"],
    glossary: [],
  };
}

/** Links for guide pages */
export function getGuideSculptedLinks(currentPath: string): SculptedLinks {
  return {
    topicHub: "/topics/username-search",
    platforms: [],
    comparisons: [],
    guides: [],
    glossary: ["/glossary/username-osint"],
  };
}

/** Flatten sculpted links into a deduplicated array of paths */
export function flattenSculptedLinks(links: SculptedLinks, exclude: string[] = []): string[] {
  const all = [
    links.topicHub,
    ...links.platforms,
    ...links.comparisons,
    ...links.guides,
    ...links.glossary,
  ].filter((p): p is string => !!p && !exclude.includes(p));

  return [...new Set(all)];
}
