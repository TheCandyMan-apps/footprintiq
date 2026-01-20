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
    <Card className="border-border/30">
      <CardContent className="p-2">
        {/* Header inline */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <Images className="w-2.5 h-2.5 text-muted-foreground" />
          <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
            Profile Images
          </span>
          <span className="text-[9px] text-muted-foreground/50">({validImages.length})</span>
        </div>

        {/* Horizontal strip */}
        <div className="flex items-center gap-1 flex-wrap">
          {visibleImages.map((url, index) => {
            const isFailed = failedImages.has(index);

            return (
              <Avatar 
                key={index} 
                className="h-8 w-8 rounded-md border border-border/40"
              >
                {!isFailed && (
                  <AvatarImage
                    src={url}
                    alt={`Profile ${index + 1}`}
                    className="object-cover rounded-md"
                    onError={() => handleImageError(index)}
                  />
                )}
                <AvatarFallback className="rounded-md bg-muted/30">
                  <User className="h-3 w-3 text-muted-foreground/50" />
                </AvatarFallback>
              </Avatar>
            );
          })}

          {remainingCount > 0 && (
            <div
              className={cn(
                'h-8 w-8 rounded-md bg-muted/40 border border-border/30 flex items-center justify-center',
                'text-[9px] font-medium text-muted-foreground'
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
