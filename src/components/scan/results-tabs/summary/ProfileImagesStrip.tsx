import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileImagesStripProps {
  images: string[];
  maxImages?: number;
}

export function ProfileImagesStrip({ images, maxImages = 6 }: ProfileImagesStripProps) {
  const displayImages = images.slice(0, maxImages);
  const emptySlots = Math.max(0, 4 - displayImages.length);

  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Profile Images
      </h4>
      <div className="flex gap-1.5">
        {displayImages.map((img, idx) => (
          <div 
            key={idx} 
            className="w-10 h-10 rounded-md overflow-hidden bg-muted border border-border/50 shrink-0"
          >
            <img 
              src={img} 
              alt={`Profile ${idx + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.parentElement!.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-muted">
                    <svg class="w-4 h-4 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                `;
              }}
            />
          </div>
        ))}
        {displayImages.length === 0 && (
          <>
            {Array.from({ length: 4 }).map((_, idx) => (
              <div 
                key={idx} 
                className="w-10 h-10 rounded-md bg-muted/50 border border-dashed border-border flex items-center justify-center shrink-0"
              >
                <User className="w-4 h-4 text-muted-foreground/30" />
              </div>
            ))}
          </>
        )}
        {displayImages.length > 0 && displayImages.length < 4 && (
          <>
            {Array.from({ length: emptySlots }).map((_, idx) => (
              <div 
                key={`empty-${idx}`} 
                className="w-10 h-10 rounded-md bg-muted/30 border border-dashed border-border/50 shrink-0"
              />
            ))}
          </>
        )}
        {images.length > maxImages && (
          <div className="w-10 h-10 rounded-md bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground font-medium shrink-0">
            +{images.length - maxImages}
          </div>
        )}
      </div>
    </div>
  );
}
