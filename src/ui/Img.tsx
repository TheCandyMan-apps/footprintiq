/**
 * Optimized Image Component
 * Automatically handles lazy loading, aspect ratio, and responsive sizing
 * Improves Core Web Vitals (CLS, LCP)
 */

import { ImgHTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";

interface ImgProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  aspectRatio?: string;
  className?: string;
}

export function Img({
  src,
  alt,
  width,
  height,
  priority = false,
  aspectRatio,
  className,
  ...props
}: ImgProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Calculate aspect ratio for CLS prevention
  const ratio = aspectRatio || (width && height ? `${width}/${height}` : undefined);

  return (
    <div
      className={cn("relative overflow-hidden bg-muted", className)}
      style={{
        aspectRatio: ratio,
      }}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "auto" : "async"}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          hasError && "opacity-0"
        )}
        {...props}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
          Failed to load image
        </div>
      )}
    </div>
  );
}
