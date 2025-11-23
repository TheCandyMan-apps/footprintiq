/**
 * Platform Category Mapping for OSINT results
 * Maps platforms to categories: Social, Developer, Games, NSFW, Crypto, Marketplaces
 */

export type PlatformCategory = 'Social' | 'Developer' | 'Games' | 'NSFW' | 'Crypto' | 'Marketplaces' | 'Forums' | 'Other';

export const PLATFORM_CATEGORIES: Record<string, PlatformCategory> = {
  // Social Media
  'facebook': 'Social',
  'twitter': 'Social',
  'instagram': 'Social',
  'linkedin': 'Social',
  'reddit': 'Social',
  'tiktok': 'Social',
  'snapchat': 'Social',
  'pinterest': 'Social',
  'tumblr': 'Social',
  'vk': 'Social',
  'telegram': 'Social',
  'discord': 'Social',
  'mastodon': 'Social',
  'youtube': 'Social',
  'twitch': 'Games',
  
  // Developer Platforms
  'github': 'Developer',
  'gitlab': 'Developer',
  'bitbucket': 'Developer',
  'stackoverflow': 'Developer',
  'codepen': 'Developer',
  'replit': 'Developer',
  'hackerrank': 'Developer',
  'leetcode': 'Developer',
  'kaggle': 'Developer',
  
  // Gaming
  'steam': 'Games',
  'xbox': 'Games',
  'playstation': 'Games',
  'nintendo': 'Games',
  'epicgames': 'Games',
  'roblox': 'Games',
  'minecraft': 'Games',
  
  // NSFW
  'onlyfans': 'NSFW',
  'fansly': 'NSFW',
  'manyvids': 'NSFW',
  'pornhub': 'NSFW',
  
  // Crypto
  'coinbase': 'Crypto',
  'binance': 'Crypto',
  'opensea': 'Crypto',
  'etherscan': 'Crypto',
  
  // Marketplaces
  'ebay': 'Marketplaces',
  'amazon': 'Marketplaces',
  'etsy': 'Marketplaces',
  'mercari': 'Marketplaces',
  
  // Forums
  'hackernews': 'Forums',
  '4chan': 'Forums',
  'slashdot': 'Forums',
};

export function getPlatformCategory(platform: string): PlatformCategory {
  const normalized = platform.toLowerCase().replace(/\s+/g, '').replace(/\.com$/, '');
  return PLATFORM_CATEGORIES[normalized] || 'Other';
}

export function getCategoryColor(category: PlatformCategory): string {
  const colors: Record<PlatformCategory, string> = {
    'Social': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    'Developer': 'bg-green-500/10 text-green-600 dark:text-green-400',
    'Games': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    'NSFW': 'bg-red-500/10 text-red-600 dark:text-red-400',
    'Crypto': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    'Marketplaces': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    'Forums': 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    'Other': 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  };
  return colors[category];
}
