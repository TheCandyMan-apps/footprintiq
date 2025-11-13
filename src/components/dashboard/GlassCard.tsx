import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, 'children'> {
  intensity?: 'light' | 'medium' | 'heavy';
  glowColor?: 'purple' | 'pink' | 'cyan' | 'none';
  disableHover?: boolean;
  delay?: number;
  children?: React.ReactNode;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, intensity = 'medium', glowColor = 'purple', disableHover = false, delay = 0, children, ...props }, ref) => {
    const intensityClasses = {
      light: 'bg-background/30',
      medium: 'bg-background/40',
      heavy: 'bg-background/60',
    };

    const glowClasses = {
      purple: 'shadow-[0_0_40px_hsl(280_70%_60%/0.2)]',
      pink: 'shadow-[0_0_40px_hsl(320_70%_60%/0.2)]',
      cyan: 'shadow-[0_0_40px_hsl(188_95%_52%/0.2)]',
      none: '',
    };

    const hoverGlowClasses = {
      purple: 'hover:shadow-[0_0_80px_hsl(280_70%_60%/0.5)]',
      pink: 'hover:shadow-[0_0_80px_hsl(320_70%_60%/0.5)]',
      cyan: 'hover:shadow-[0_0_80px_hsl(188_95%_52%/0.5)]',
      none: '',
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          delay,
          ease: [0.22, 1, 0.36, 1]
        }}
        whileHover={!disableHover ? { 
          y: -4,
          scale: 1.02,
          transition: { duration: 0.2, ease: "easeOut" }
        } : undefined}
        className={cn(
          "rounded-lg border backdrop-blur-xl",
          intensityClasses[intensity],
          "border-border/50",
          "transition-all duration-300 ease-out",
          !disableHover && "hover:border-primary/50",
          glowColor !== 'none' && glowClasses[glowColor],
          glowColor !== 'none' && !disableHover && hoverGlowClasses[glowColor],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
