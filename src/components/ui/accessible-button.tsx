import { Button, ButtonProps } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccessibleButtonProps extends ButtonProps {
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  ariaLabel?: string;
}

/**
 * Accessible button with proper ARIA labels and keyboard support
 */
export function AccessibleButton({
  icon: Icon,
  iconPosition = "left",
  ariaLabel,
  children,
  className,
  ...props
}: AccessibleButtonProps) {
  return (
    <Button
      className={cn("transition-all hover:scale-105 focus:ring-2 focus:ring-primary focus:ring-offset-2", className)}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      {...props}
    >
      {Icon && iconPosition === "left" && (
        <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
      )}
      {children}
      {Icon && iconPosition === "right" && (
        <Icon className="ml-2 h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  );
}
