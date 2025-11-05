import { useState, useEffect } from "react";
import { X, Sparkles, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AnnouncementBarProps {
  message: string;
  link?: string;
  linkText?: string;
  storageKey?: string;
  variant?: "default" | "promo" | "update";
}

export const AnnouncementBar = ({
  message,
  link,
  linkText = "Learn More",
  storageKey = "announcement-dismissed",
  variant = "default",
}: AnnouncementBarProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if announcement was previously dismissed
    const isDismissed = localStorage.getItem(storageKey) === "true";
    if (!isDismissed) {
      // Delay showing to allow page to load
      setTimeout(() => setIsVisible(true), 500);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setIsClosing(true);
    // Save dismissal to localStorage
    localStorage.setItem(storageKey, "true");
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  if (!isVisible) return null;

  const variantStyles = {
    default: "bg-gradient-to-r from-primary/90 to-accent/90",
    promo: "bg-gradient-to-r from-accent/90 to-primary/90",
    update: "bg-gradient-to-r from-primary/80 via-purple-600/80 to-accent/80",
  };

  const Icon = variant === "promo" ? Gift : Sparkles;

  return (
    <div
      className={cn(
        "sticky top-0 z-[60] w-full backdrop-blur-md border-b border-white/10 shadow-lg transition-all duration-300 ease-out",
        variantStyles[variant],
        isClosing ? "translate-y-[-100%] opacity-0" : "translate-y-0 opacity-100"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Icon and Message */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Icon className="w-5 h-5 text-white flex-shrink-0 animate-pulse" />
            <p className="text-sm md:text-base text-white font-medium truncate">
              {message}
            </p>
          </div>

          {/* Link and Dismiss */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {link && (
              <a
                href={link}
                className="text-sm font-semibold text-white hover:text-white/80 transition-colors underline underline-offset-4 hover:underline-offset-2 hidden sm:inline-block"
              >
                {linkText}
              </a>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8 rounded-full hover:bg-white/20 text-white hover:text-white transition-colors"
              aria-label="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Link */}
        {link && (
          <a
            href={link}
            className="block sm:hidden mt-2 text-sm font-semibold text-white hover:text-white/80 transition-colors underline underline-offset-4"
          >
            {linkText}
          </a>
        )}
      </div>

      {/* Animated shine effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 translate-x-[-100%] animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"
          style={{
            animation: "shimmer 3s infinite",
          }}
        />
      </div>
    </div>
  );
};
