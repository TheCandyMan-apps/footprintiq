import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: 'light' | 'medium' | 'heavy';
  glowColor?: 'purple' | 'pink' | 'cyan' | 'none';
  disableHover?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, intensity = 'medium', glowColor = 'purple', disableHover = false, ...props }, ref) => {
    const intensityClasses = {
      light: 'bg-background/30',
      medium: 'bg-background/40',
      heavy: 'bg-background/60',
    };

    const glowClasses = {
      purple: 'shadow-[0_0_40px_hsl(280_70%_60%/0.2)] hover:shadow-[0_0_60px_hsl(280_70%_60%/0.4)]',
      pink: 'shadow-[0_0_40px_hsl(320_70%_60%/0.2)] hover:shadow-[0_0_60px_hsl(320_70%_60%/0.4)]',
      cyan: 'shadow-[0_0_40px_hsl(188_95%_52%/0.2)] hover:shadow-[0_0_60px_hsl(188_95%_52%/0.4)]',
      none: '',
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border backdrop-blur-xl",
          intensityClasses[intensity],
          "border-border/50",
          "transition-all duration-300 ease-out",
          !disableHover && "hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/50",
          glowColor !== 'none' && glowClasses[glowColor],
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
