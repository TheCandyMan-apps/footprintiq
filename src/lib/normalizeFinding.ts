/**
 * Centralized normalization layer for OSINT findings
 * Transforms raw findings from various sources into a consistent shape
 */

export interface NormalizedFinding {
  id?: string;
  platformName: string;
  platformUrl: string;
  pageType: string;
  tags: string[];
  confidence: number | null;
  severity: string | null;
  verdict: string | null;
  sourceProviders: string[];
  evidence: any[];
  raw: any;
}

/**
 * Known site name mappings for common OSINT targets
 */
const SITE_NAME_MAP: Record<string, string> = {
  // Social Media
  'github.com': 'GitHub',
  'gitlab.com': 'GitLab',
  'bitbucket.org': 'Bitbucket',
  'linkedin.com': 'LinkedIn',
  'facebook.com': 'Facebook',
  'instagram.com': 'Instagram',
  'twitter.com': 'Twitter',
  'x.com': 'X',
  'reddit.com': 'Reddit',
  'tumblr.com': 'Tumblr',
  'medium.com': 'Medium',
  'pinterest.com': 'Pinterest',
  'tiktok.com': 'TikTok',
  'snapchat.com': 'Snapchat',
  'whatsapp.com': 'WhatsApp',
  'telegram.org': 'Telegram',
  'discord.com': 'Discord',
  'twitch.tv': 'Twitch',
  'youtube.com': 'YouTube',
  'vimeo.com': 'Vimeo',
  'flickr.com': 'Flickr',
  'deviantart.com': 'DeviantArt',
  'behance.net': 'Behance',
  'dribbble.com': 'Dribbble',
  'mastodon.social': 'Mastodon',
  'threads.net': 'Threads',
  'bluesky.social': 'Bluesky',
  
  // Developer / Tech
  'stackoverflow.com': 'Stack Overflow',
  'stackexchange.com': 'Stack Exchange',
  'codepen.io': 'CodePen',
  'replit.com': 'Replit',
  'hackerrank.com': 'HackerRank',
  'leetcode.com': 'LeetCode',
  'kaggle.com': 'Kaggle',
  'dev.to': 'DEV Community',
  'hashnode.com': 'Hashnode',
  'npmjs.com': 'npm',
  'pypi.org': 'PyPI',
  
  // Gaming
  'steamcommunity.com': 'Steam Community',
  'store.steampowered.com': 'Steam',
  'xbox.com': 'Xbox',
  'playstation.com': 'PlayStation',
  'boardgamegeek.com': 'BoardGameGeek',
  'itch.io': 'itch.io',
  'epicgames.com': 'Epic Games',
  'gog.com': 'GOG',
  'roblox.com': 'Roblox',
  'minecraft.net': 'Minecraft',
  
  // Crypto / NFT
  'opensea.io': 'OpenSea',
  'rarible.com': 'Rarible',
  'foundation.app': 'Foundation',
  'niftygateway.com': 'Nifty Gateway',
  'superrare.com': 'SuperRare',
  'coinbase.com': 'Coinbase',
  'binance.com': 'Binance',
  'kraken.com': 'Kraken',
  'metamask.io': 'MetaMask',
  'etherscan.io': 'Etherscan',
  
  // Fandom / Wiki
  'fandom.com': 'Fandom',
  'wikia.com': 'Fandom',
  'wikipedia.org': 'Wikipedia',
  'fandom.wiki': 'Fandom',
  
  // Writing / Creative
  'archiveofourown.org': 'Archive of Our Own',
  'ao3.org': 'Archive of Our Own',
  'fanfiction.net': 'FanFiction.net',
  'wattpad.com': 'Wattpad',
  'goodreads.com': 'Goodreads',
  'letterboxd.com': 'Letterboxd',
  'last.fm': 'Last.fm',
  'soundcloud.com': 'SoundCloud',
  'bandcamp.com': 'Bandcamp',
  'spotify.com': 'Spotify',
  
  // Business / Professional
  'about.me': 'About.me',
  'angel.co': 'AngelList',
  'crunchbase.com': 'Crunchbase',
  'producthunt.com': 'Product Hunt',
  'glassdoor.com': 'Glassdoor',
  'indeed.com': 'Indeed',
  'fiverr.com': 'Fiverr',
  'upwork.com': 'Upwork',
  
  // Forums / Communities
  'quora.com': 'Quora',
  'disqus.com': 'Disqus',
  'slack.com': 'Slack',
  'keybase.io': 'Keybase',
  'news.ycombinator.com': 'Hacker News',
  'lobste.rs': 'Lobsters',
  
  // OSINT-specific / Security
  'haveibeenpwned.com': 'Have I Been Pwned',
  'intelx.io': 'Intelligence X',
  'pastebin.com': 'Pastebin',
  'gist.github.com': 'GitHub Gist',
  
  // People Search / Data Brokers
  'whitepages.com': 'Whitepages',
  'spokeo.com': 'Spokeo',
  'intelius.com': 'Intelius',
  'beenverified.com': 'BeenVerified',
  'truthfinder.com': 'TruthFinder',
  'pipl.com': 'Pipl',
  'radaris.com': 'Radaris',
  'fastpeoplesearch.com': 'FastPeopleSearch',
  'peoplefinder.com': 'PeopleFinder',
  'ussearch.com': 'USSearch',
  'peekyou.com': 'PeekYou',
  'mylife.com': 'MyLife',
  
  // Other / Social Apps
  'clubhouse.com': 'Clubhouse',
  'clubhouseapp.com': 'Clubhouse',
  'codecademy.com': 'Codecademy',
  'chaturbate.com': 'Chaturbate',
  'onlyfans.com': 'OnlyFans',
  'fansly.com': 'Fansly',
  'manyvids.com': 'ManyVids',
  'pornhub.com': 'Pornhub',
  'xvideos.com': 'XVideos',
  'gravatar.com': 'Gravatar',
  'wordpress.com': 'WordPress',
  'blogger.com': 'Blogger',
  'substack.com': 'Substack',
  'linktree.com': 'Linktree',
  'linktr.ee': 'Linktree',
  'buymeacoffee.com': 'Buy Me a Coffee',
  'patreon.com': 'Patreon',
  'ko-fi.com': 'Ko-fi',
  'venmo.com': 'Venmo',
  'paypal.com': 'PayPal',
  'cashapp.com': 'Cash App',
  'etsy.com': 'Etsy',
  'ebay.com': 'eBay',
  'amazon.com': 'Amazon',
};

/**
 * Convert a URL hostname to a pretty display name
 * Uses known mappings or derives from domain label
 */
export function prettySiteNameFromUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return 'Unknown Site';
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase();

    // Check exact match first
    if (SITE_NAME_MAP[hostname]) {
      return SITE_NAME_MAP[hostname];
    }

    // Check subdomain matches (e.g., "user.github.io" → "GitHub")
    for (const [domain, name] of Object.entries(SITE_NAME_MAP)) {
      if (hostname.endsWith(`.${domain}`) || hostname === domain) {
        return name;
      }
    }

    // Check partial matches for subdomains
    const baseDomain = hostname.split('.').slice(-2).join('.');
    if (SITE_NAME_MAP[baseDomain]) {
      return SITE_NAME_MAP[baseDomain];
    }

    // Default: Title Case the second-level domain
    const parts = hostname.split('.');
    const mainPart = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
    
    // Handle common patterns
    if (mainPart) {
      // Title case: first letter uppercase, rest lowercase
      return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
    }

    return 'Unknown Site';
  } catch {
    // If URL parsing fails, try to extract something useful
    try {
      // Maybe it's just a domain without protocol
      const withProtocol = url.includes('://') ? url : `https://${url}`;
      const parsed = new URL(withProtocol);
      const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase();
      const parts = hostname.split('.');
      const mainPart = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
      return mainPart ? mainPart.charAt(0).toUpperCase() + mainPart.slice(1) : 'Unknown Site';
    } catch {
      return 'Unknown Site';
    }
  }
}

/**
 * Normalize a single finding into a consistent shape
 */
export function normalizeFinding(input: any): NormalizedFinding {
  if (!input) {
    return {
      platformName: 'Unknown',
      platformUrl: '',
      pageType: '',
      tags: [],
      confidence: null,
      severity: null,
      verdict: null,
      sourceProviders: [],
      evidence: [],
      raw: input,
    };
  }

  // Extract platformUrl from various field names
  const platformUrl = String(
    input.platform_url ??
    input.primary_url ??
    input.url ??
    input.primaryUrl ??
    input.platformUrl ??
    input.raw?.platform_url ??
    input.raw?.primary_url ??
    input.raw?.url ??
    ''
  );

  // Extract platformName from various field names
  let platformName = String(
    input.platform_name ??
    input.platformName ??
    input.site_name ??
    input.site ??
    input.provider ??
    input.raw?.platform_name ??
    input.raw?.platformName ??
    input.raw?.site ??
    ''
  );

  // If platformName is empty or "Other", derive from URL
  if (!platformName || platformName.toLowerCase() === 'other' || platformName.toLowerCase() === 'unknown') {
    if (platformUrl) {
      platformName = prettySiteNameFromUrl(platformUrl);
    } else {
      platformName = 'Unknown';
    }
  }

  // Extract pageType from various field names
  const pageType = String(
    input.pageType ??
    input.page_type ??
    input.raw?.page_type ??
    input.raw?.pageType ??
    ''
  );

  // Build tags array, ensuring it's always an array
  let tags: string[] = [];
  if (Array.isArray(input.tags)) {
    tags = [...input.tags];
  }

  // Add search-result tag if pageType is "search"
  if (pageType === 'search' && !tags.includes('search-result')) {
    tags.push('search-result');
  }

  // Add lookup tag if pageType is "lookup"
  if (pageType === 'lookup' && !tags.includes('lookup')) {
    tags.push('lookup');
  }

  // Extract confidence (must be a number)
  const confidence = typeof input.confidence === 'number' 
    ? input.confidence 
    : (typeof input.raw?.confidence === 'number' ? input.raw.confidence : null);

  // Extract severity
  const severity = String(
    input.severity ??
    input.raw?.severity ??
    ''
  ) || null;

  // Extract verdict
  const verdict = String(
    input.verdict ??
    input.raw?.verdict ??
    ''
  ) || null;

  // Extract sourceProviders (must be an array)
  let sourceProviders: string[] = [];
  const rawProviders = 
    input.source_providers ??
    input.sourceProviders ??
    input.providers ??
    input.raw?.source_providers ??
    input.raw?.providers ??
    [];
  
  if (Array.isArray(rawProviders)) {
    sourceProviders = rawProviders.filter((p: any) => typeof p === 'string');
  }

  // Normalize evidence to always be an array
  const evidence = Array.isArray(input.evidence) 
    ? input.evidence 
    : (Array.isArray(input.raw?.evidence) ? input.raw.evidence : []);

  return {
    id: input.id,
    platformName,
    platformUrl,
    pageType,
    tags,
    confidence,
    severity: severity || null,
    verdict: verdict || null,
    sourceProviders,
    evidence,
    raw: input,
  };
}

/**
 * Normalize an array of findings
 */
export function normalizeFindings(inputs: any[]): NormalizedFinding[] {
  if (!Array.isArray(inputs)) {
    return [];
  }
  return inputs.map(normalizeFinding);
}
