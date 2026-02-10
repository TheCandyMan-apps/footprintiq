/**
 * Shared extraction and derivation helpers for scan results.
 * Single source of truth used by AccountRow, AccountCard, AccountsTab, etc.
 */

import type { ScanResult } from '@/hooks/useScanResultsData';

// ── Metadata helper ──────────────────────────────────────────────

export const getMeta = (result: ScanResult): Record<string, any> =>
  (result.meta || result.metadata || {}) as Record<string, any>;

// ── Platform name ────────────────────────────────────────────────

export function extractPlatformName(result: ScanResult): string {
  if (result.site && result.site !== 'Unknown') return result.site;

  const meta = getMeta(result);
  if (meta.platform && meta.platform !== 'Unknown') return meta.platform;
  if (meta.site && meta.site !== 'Unknown') return meta.site;

  if (result.evidence && Array.isArray(result.evidence)) {
    const siteEvidence = result.evidence.find(
      (e: any) => e.key === 'site' || e.key === 'platform',
    );
    if (siteEvidence?.value) return siteEvidence.value;
  }

  const url = result.url || meta.url;
  if (url) {
    try {
      const hostname = new URL(url).hostname;
      const parts = hostname.replace('www.', '').split('.');
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    } catch {}
  }

  if (meta.provider) return meta.provider;

  return 'Unidentified site';
}

// ── URL ──────────────────────────────────────────────────────────

export function extractUrl(result: ScanResult): string | null {
  if (result.url) return result.url;

  const meta = getMeta(result);
  if (meta.url) return meta.url;

  if (result.evidence && Array.isArray(result.evidence)) {
    const urlEvidence = result.evidence.find((e: any) => e.key === 'url');
    if (urlEvidence?.value) return urlEvidence.value;
  }

  return null;
}

// ── Username ─────────────────────────────────────────────────────

const GENERIC_PATTERNS = [
  'user', 'profile', 'users', 'people', 'account', 'member', 'id', 'u', 'p', 'unknown',
];

function isGenericUsername(val: string | undefined): boolean {
  if (!val) return true;
  const lower = val.toLowerCase().trim();
  return lower.length < 2 || GENERIC_PATTERNS.includes(lower) || lower === '@user';
}

export function extractUsername(result: ScanResult): string | null {
  const meta = getMeta(result);

  if (!isGenericUsername(meta.username)) return meta.username;
  if (!isGenericUsername(meta.handle)) return meta.handle;
  if (!isGenericUsername(meta.screen_name)) return meta.screen_name;
  if (!isGenericUsername(meta.display_name)) return meta.display_name;
  if (!isGenericUsername(meta.name)) return meta.name;
  if (!isGenericUsername(meta.login)) return meta.login;
  if (!isGenericUsername(meta.user)) return meta.user;

  const url = extractUrl(result);
  if (url) {
    try {
      const pathname = new URL(url).pathname;
      const parts = pathname.split('/').filter(Boolean);
      for (const part of parts) {
        const cleaned = part.replace(/[?#].*$/, '');
        if (!isGenericUsername(cleaned) && cleaned.length >= 2 && cleaned.length <= 30) {
          if (!/^\d+$/.test(cleaned) && !/\.\w{2,4}$/.test(cleaned)) {
            return cleaned;
          }
        }
      }
    } catch {}
  }

  return null; // Caller should show "Username not publicly listed" when null
}

// ── Bio ──────────────────────────────────────────────────────────

function isGenericDescription(text: string): boolean {
  const patterns = ['unknown platform', 'profile found on', 'account detected'];
  const lowerText = text.toLowerCase();
  return patterns.some((p) => lowerText.includes(p));
}

/** Returns the raw, full bio text (no truncation). */
export function extractBioText(result: ScanResult): string | null {
  const meta = getMeta(result);
  const bioFields = [meta.bio, meta.about, meta.summary, meta.headline, meta.tagline];
  for (const bio of bioFields) {
    if (bio && typeof bio === 'string' && !isGenericDescription(bio)) return bio;
  }
  if (meta.description && !isGenericDescription(meta.description)) return meta.description;
  return null;
}

/** Returns a truncated bio (≤80 chars) or location fallback. */
export function extractBio(result: ScanResult): string | null {
  const bio = extractBioText(result);
  if (bio) return bio.length > 80 ? bio.slice(0, 77) + '…' : bio;

  const meta = getMeta(result);
  if (meta.location && meta.location !== 'Unknown' && meta.location.toLowerCase() !== 'unknown') {
    return `📍 ${meta.location}`;
  }
  return null;
}

/** Alias – returns full untruncated bio. */
export function extractFullBio(result: ScanResult): string | null {
  return extractBioText(result);
}

// ── Platform domain (favicon) ────────────────────────────────────

const PLATFORM_DOMAIN_MAP: Record<string, string> = {
  github: 'github.com',
  gitlab: 'gitlab.com',
  twitter: 'twitter.com',
  x: 'x.com',
  linkedin: 'linkedin.com',
  facebook: 'facebook.com',
  instagram: 'instagram.com',
  reddit: 'reddit.com',
  youtube: 'youtube.com',
  tiktok: 'tiktok.com',
  discord: 'discord.com',
  telegram: 'telegram.org',
  pinterest: 'pinterest.com',
  medium: 'medium.com',
  stackoverflow: 'stackoverflow.com',
  twitch: 'twitch.tv',
  spotify: 'spotify.com',
  snapchat: 'snapchat.com',
  tumblr: 'tumblr.com',
  flickr: 'flickr.com',
  vimeo: 'vimeo.com',
  steam: 'store.steampowered.com',
  patreon: 'patreon.com',
  behance: 'behance.net',
  dribbble: 'dribbble.com',
  deviantart: 'deviantart.com',
  soundcloud: 'soundcloud.com',
  quora: 'quora.com',
  mastodon: 'mastodon.social',
  threads: 'threads.net',
  bluesky: 'bsky.app',
};

export function getPlatformDomain(platform: string, url?: string | null): string {
  if (url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {}
  }
  const p = platform?.toLowerCase() || '';
  for (const [key, domain] of Object.entries(PLATFORM_DOMAIN_MAP)) {
    if (p.includes(key)) return domain;
  }
  return `${p.replace(/\s+/g, '')}.com`;
}

// ── Initials ─────────────────────────────────────────────────────

export function getInitials(name: string): string {
  if (!name) return '??';
  const cleaned = name.replace(/[_-]/g, ' ');
  const words = cleaned.split(' ').filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ── Status derivation ────────────────────────────────────────────

/**
 * Derive a normalised status string from a scan result.
 * Used for filtering, counting, and display across the Accounts tab.
 */
export function deriveResultStatus(result: ScanResult): string {
  if (result.status) return result.status.toLowerCase();

  const kind = (result as any).kind || '';
  if (kind === 'profile_presence' || kind === 'presence.hit' || kind === 'account_found') {
    return 'found';
  }
  if (kind === 'presence.miss' || kind === 'not_found') {
    return 'not_found';
  }

  if (result.evidence && Array.isArray(result.evidence)) {
    const existsEvidence = result.evidence.find((e: any) => e.key === 'exists');
    if (existsEvidence?.value === true) return 'found';
    if (existsEvidence?.value === false) return 'not_found';
  }

  const meta = getMeta(result);
  if (meta.status) return meta.status.toLowerCase();
  if (meta.exists === true) return 'found';
  if (meta.exists === false) return 'not_found';

  return 'pending_review';
}

// ── Risk context explanation ─────────────────────────────────────

/**
 * Generate a concise, human-readable explanation of why a result was
 * found and how strong the linkage is, using existing confidence and
 * signal data only.  Tone: neutral, factual, non-alarmist.
 */
export function generateRiskContext(
  result: ScanResult,
  lensScore: number,
): string {
  const meta = getMeta(result);
  const platform = extractPlatformName(result);
  const username = extractUsername(result);
  const hasAvatar = !!(meta.avatar_cached || meta.avatar_url || meta.avatar || meta.profile_image || meta.image || meta.pfp_image);
  const hasBio = !!extractBioText(result);
  const hasFollowers = meta.followers !== undefined && Number(meta.followers) > 0;
  const hasLocation = !!(meta.location && meta.location !== 'Unknown' && meta.location.toLowerCase() !== 'unknown');

  const signals: string[] = [];
  if (username) signals.push('matching username');
  if (hasAvatar) signals.push('profile image');
  if (hasBio) signals.push('public bio');
  if (hasFollowers) signals.push('follower data');
  if (hasLocation) signals.push('location info');

  const signalSummary =
    signals.length === 0
      ? 'Limited public information was available for this profile.'
      : signals.length === 1
        ? `A ${signals[0]} was identified on ${platform}.`
        : `Multiple signals were identified on ${platform}, including ${signals.slice(0, -1).join(', ')} and ${signals[signals.length - 1]}.`;

  let strength: string;
  if (lensScore >= 80) {
    strength = 'These signals strongly suggest this profile is associated with the search query.';
  } else if (lensScore >= 60) {
    strength = 'Some indicators align, but the linkage could not be fully confirmed from public data alone.';
  } else {
    strength = 'The available evidence is limited; manual review is recommended to confirm relevance.';
  }

  return `${signalSummary} ${strength}`;
}

// ── Recommended actions ──────────────────────────────────────────

export interface RecommendedAction {
  label: string;
  description: string;
}

const SOCIAL_PLATFORMS = new Set([
  'facebook', 'instagram', 'twitter', 'x', 'tiktok', 'snapchat',
  'linkedin', 'threads', 'bluesky', 'mastodon', 'pinterest', 'tumblr',
]);

const CODE_PLATFORMS = new Set([
  'github', 'gitlab', 'bitbucket', 'stackoverflow', 'codepen',
]);

/**
 * Suggest safe, reasonable next steps based on confidence level
 * and platform type. Framed as optional guidance, never requirements.
 */
export function generateRecommendedActions(
  result: ScanResult,
  lensScore: number,
  claimStatus: 'me' | 'not_me' | null,
): RecommendedAction[] {
  const platform = extractPlatformName(result).toLowerCase();
  const isSocial = SOCIAL_PLATFORMS.has(platform);
  const isCode = CODE_PLATFORMS.has(platform);
  const meta = getMeta(result);
  const hasPublicBio = !!extractBioText(result);
  const actions: RecommendedAction[] = [];

  // Already claimed — tailor advice
  if (claimStatus === 'me') {
    if (isSocial) {
      actions.push({
        label: 'Review privacy settings',
        description: `Consider reviewing your privacy settings on ${extractPlatformName(result)} to ensure your profile visibility matches your preferences.`,
      });
    }
    if (hasPublicBio || (meta.followers !== undefined && Number(meta.followers) > 0)) {
      actions.push({
        label: 'Audit public information',
        description: 'You may want to check what personal details are publicly visible on this profile.',
      });
    }
    if (isCode) {
      actions.push({
        label: 'Check repository visibility',
        description: 'Verify that any repositories or contributions align with what you intend to be public.',
      });
    }
    return actions;
  }

  if (claimStatus === 'not_me') {
    actions.push({
      label: 'No action needed',
      description: 'You have indicated this account is not yours. No further steps are necessary unless you believe it is being used to impersonate you.',
    });
    return actions;
  }

  // Unclaimed — base on confidence
  if (lensScore >= 80) {
    actions.push({
      label: 'Confirm ownership',
      description: 'This profile has a strong match to the search query. Consider marking it as yours or not yours to keep your results organised.',
    });
    if (isSocial) {
      actions.push({
        label: 'Review privacy settings',
        description: `If this is your account, reviewing the privacy settings on ${extractPlatformName(result)} can help you control what information is publicly accessible.`,
      });
    }
  } else if (lensScore >= 60) {
    actions.push({
      label: 'Verify this profile',
      description: 'Some signals match but the linkage is not certain. Visiting the profile can help you determine whether this account is relevant.',
    });
  } else {
    actions.push({
      label: 'No immediate action needed',
      description: 'The connection to the search query is weak. You can review the profile if you wish, but no action is required at this time.',
    });
  }

  return actions;
}
