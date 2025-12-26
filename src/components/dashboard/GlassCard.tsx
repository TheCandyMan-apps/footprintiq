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
  ({ className, intensity = 'medium', glowColor = 'none', disableHover = false, delay = 0, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.4, 
          delay,
          ease: [0.22, 1, 0.36, 1]
        }}
        whileHover={!disableHover ? { 
          y: -2,
          transition: { duration: 0.2, ease: "easeOut" }
        } : undefined}
        className={cn(
          "rounded-2xl border border-border/60 bg-white shadow-sm",
          "transition-shadow duration-200 ease-out",
          !disableHover && "hover:shadow-md",
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
