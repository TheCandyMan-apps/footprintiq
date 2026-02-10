import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PlatformIconBadge } from '@/components/ui/PlatformIcon';
import { getInitials } from '@/lib/results/extractors';

interface ProfileThumbnailProps {
  profileImage: string | null | undefined;
  platformName: string;
  profileUrl: string | null;
  username: string;
  size: 'row' | 'card' | 'panel';
}

const SIZE_MAP = {
  row: { container: 'w-11 h-11', imgPx: 44, text: 'text-[12px]', wrapper: 'w-12', ml: 'ml-1 mt-1', rounded: 'rounded', iconSize: 'lg' as const },
  card: { container: 'w-8 h-8', imgPx: 32, text: 'text-[10px]', wrapper: '', ml: 'ml-0.5 mt-0.5', rounded: 'rounded', iconSize: 'md' as const },
  panel: { container: 'w-12 h-12', imgPx: 48, text: 'text-sm', wrapper: '', ml: 'ml-1 mt-1', rounded: 'rounded-lg', iconSize: 'lg' as const },
};

export function ProfileThumbnail({ profileImage, platformName, profileUrl, username, size }: ProfileThumbnailProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const config = SIZE_MAP[size];

  const showFallback = !profileImage || imageError;

  return (
    <div className={cn('relative shrink-0', config.wrapper)}>
      <PlatformIconBadge platform={platformName} url={profileUrl} size={config.iconSize} position="top-left" />
      <div className={cn(config.container, config.rounded, 'overflow-hidden bg-muted/20 border border-border/30 relative', config.ml)}>
        {profileImage && !imageError && (
          <img
            src={profileImage}
            alt={`${platformName} profile photo`}
            width={config.imgPx}
            height={config.imgPx}
            className={cn('w-full h-full object-cover transition-opacity duration-150', imageLoaded ? 'opacity-100' : 'opacity-0')}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
        <div className={cn(
          'absolute inset-0 flex items-center justify-center bg-primary/4 transition-opacity duration-150',
          showFallback ? 'opacity-100' : 'opacity-0'
        )}>
          <span className={cn(config.text, 'font-semibold text-primary/40')}>
            {getInitials(username || platformName)}
          </span>
        </div>
      </div>
    </div>
  );
}
