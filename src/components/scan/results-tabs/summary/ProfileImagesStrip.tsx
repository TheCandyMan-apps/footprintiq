import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
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
    <Card className="border-border/50">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">Profile Images</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-2">
          {visibleImages.map((url, index) => {
            const isFailed = failedImages.has(index);

            if (isFailed) {
              return (
                <Avatar key={index} className="h-12 w-12 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-muted">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
              );
            }

            return (
              <Avatar key={index} className="h-12 w-12 rounded-lg">
                <AvatarImage
                  src={url}
                  alt={`Profile ${index + 1}`}
                  className="object-cover rounded-lg"
                  onError={() => handleImageError(index)}
                />
                <AvatarFallback className="rounded-lg bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            );
          })}

          {remainingCount > 0 && (
            <div
              className={cn(
                'h-12 w-12 rounded-lg bg-muted flex items-center justify-center',
                'text-xs font-medium text-muted-foreground'
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
