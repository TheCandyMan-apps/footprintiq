import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Images } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileImagesStripProps {
  images: string[];
  maxImages?: number;
}

export function ProfileImagesStrip({ images, maxImages = 6 }: ProfileImagesStripProps) {
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const validImages = images.filter((url) => url && url.startsWith('http'));
  const visibleImages = validImages.slice(0, maxImages);
  const remainingCount = validImages.length - maxImages;

  const handleImageError = (index: number) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  if (validImages.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/40">
      <CardContent className="p-2.5">
        {/* Header inline with images */}
        <div className="flex items-center gap-2 mb-2">
          <Images className="w-3 h-3 text-muted-foreground" />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Profile Images
          </span>
          <span className="text-[10px] text-muted-foreground/60">({validImages.length})</span>
        </div>

        {/* Horizontal strip of avatars */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {visibleImages.map((url, index) => {
            const isFailed = failedImages.has(index);

            return (
              <Avatar 
                key={index} 
                className="h-10 w-10 rounded-lg border border-border/50 shadow-sm"
              >
                {!isFailed && (
                  <AvatarImage
                    src={url}
                    alt={`Profile ${index + 1}`}
                    className="object-cover rounded-lg"
                    onError={() => handleImageError(index)}
                  />
                )}
                <AvatarFallback className="rounded-lg bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            );
          })}

          {remainingCount > 0 && (
            <div
              className={cn(
                'h-10 w-10 rounded-lg bg-muted/60 border border-border/50 flex items-center justify-center',
                'text-[10px] font-medium text-muted-foreground'
              )}
            >
              +{remainingCount}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
