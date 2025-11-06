import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  showPercentage?: boolean;
  animated?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, showPercentage = false, animated = true, ...props }, ref) => (
  <div className="relative w-full">
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary/50 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 bg-gradient-to-r from-primary via-primary/90 to-primary relative",
          animated && "transition-all duration-500 ease-out"
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      >
        {/* Animated shine effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
        />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
    {showPercentage && (
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <span className="text-xs font-semibold text-primary-foreground drop-shadow-sm">
          {Math.round(value || 0)}%
        </span>
      </div>
    )}
  </div>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
