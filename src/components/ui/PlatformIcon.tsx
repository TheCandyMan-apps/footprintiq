import { useState } from 'react';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PlatformIconSize = 'xs' | 'sm' | 'md' | 'lg';

interface PlatformIconProps {
  platform: string;
  url?: string | null;
  size?: PlatformIconSize;
  className?: string;
  showBorder?: boolean;
}

// Size configurations for consistent icon sizing
const SIZE_CONFIG: Record<PlatformIconSize, {
  container: string;
  icon: string;
  fontSize: string;
}> = {
  xs: { container: 'w-4 h-4', icon: 'w-3 h-3', fontSize: 'text-[8px]' },
  sm: { container: 'w-5 h-5', icon: 'w-4 h-4', fontSize: 'text-[9px]' },
  md: { container: 'w-6 h-6', icon: 'w-5 h-5', fontSize: 'text-[10px]' },
  lg: { container: 'w-7 h-7', icon: 'w-6 h-6', fontSize: 'text-[11px]' },
};

// Map platform name to domain for favicon lookup
const getPlatformDomain = (platform: string, url?: string | null): string => {
  if (url) {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '');
    } catch {}
  }
  
  const p = platform?.toLowerCase() || '';
  const domainMap: Record<string, string> = {
    'github': 'github.com',
    'gitlab': 'gitlab.com',
    'twitter': 'twitter.com',
    'x': 'x.com',
    'linkedin': 'linkedin.com',
    'facebook': 'facebook.com',
    'instagram': 'instagram.com',
    'reddit': 'reddit.com',
    'youtube': 'youtube.com',
    'tiktok': 'tiktok.com',
    'discord': 'discord.com',
    'telegram': 'telegram.org',
    'pinterest': 'pinterest.com',
    'medium': 'medium.com',
    'stackoverflow': 'stackoverflow.com',
    'twitch': 'twitch.tv',
    'spotify': 'spotify.com',
    'snapchat': 'snapchat.com',
    'tumblr': 'tumblr.com',
    'flickr': 'flickr.com',
    'vimeo': 'vimeo.com',
    'steam': 'store.steampowered.com',
    'patreon': 'patreon.com',
    'behance': 'behance.net',
    'dribbble': 'dribbble.com',
    'deviantart': 'deviantart.com',
    'soundcloud': 'soundcloud.com',
    'quora': 'quora.com',
    'mastodon': 'mastodon.social',
    'threads': 'threads.net',
    'bluesky': 'bsky.app',
  };

  for (const [key, domain] of Object.entries(domainMap)) {
    if (p.includes(key)) return domain;
  }

  return `${p.replace(/\s+/g, '')}.com`;
};

// Get platform initial for fallback
const getPlatformInitial = (platform: string): string => {
  if (!platform || platform === 'Unknown') return '?';
  // Get first letter of platform name
  return platform.charAt(0).toUpperCase();
};

export function PlatformIcon({ 
  platform, 
  url, 
  size = 'md', 
  className,
  showBorder = true,
}: PlatformIconProps) {
  const [faviconError, setFaviconError] = useState(false);
  const config = SIZE_CONFIG[size];
  const domain = getPlatformDomain(platform, url);
  
  // Request larger favicon for better quality (32px source, displayed smaller)
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  return (
    <div 
      className={cn(
        'rounded flex items-center justify-center bg-muted/50 shrink-0',
        showBorder && 'border border-border/40',
        config.container,
        className
      )}
    >
      {!faviconError ? (
        <img 
          src={faviconUrl}
          alt={`${platform} icon`}
          className={cn(config.icon, 'object-contain')}
          onError={() => setFaviconError(true)}
          loading="lazy"
        />
      ) : (
        // Fallback: Platform initial or globe icon
        platform && platform !== 'Unknown' ? (
          <span className={cn(
            'font-bold text-muted-foreground/70',
            config.fontSize
          )}>
            {getPlatformInitial(platform)}
          </span>
        ) : (
          <Globe className={cn(config.icon, 'text-muted-foreground/50')} />
        )
      )}
    </div>
  );
}

// Overlay variant for placing platform icon as badge on top of another element
interface PlatformIconBadgeProps extends PlatformIconProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function PlatformIconBadge({ 
  position = 'top-left',
  size = 'sm',
  ...props 
}: PlatformIconBadgeProps) {
  const positionClasses: Record<string, string> = {
    'top-left': '-top-1 -left-1',
    'top-right': '-top-1 -right-1',
    'bottom-left': '-bottom-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
  };

  return (
    <div className={cn('absolute z-10', positionClasses[position])}>
      <PlatformIcon {...props} size={size} showBorder className="shadow-sm bg-background" />
    </div>
  );
}
