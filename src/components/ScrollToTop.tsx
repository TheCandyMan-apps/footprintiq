import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { useScrollPastElement } from "@/hooks/useScrollPastElement";
import { cn } from "@/lib/utils";

export const ScrollToTop = () => {
  const showButton = useScrollPastElement(300); // Show after scrolling 300px

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-8 left-8 z-50 p-4 rounded-full bg-card/80 backdrop-blur-sm border-2 border-border hover:border-accent shadow-card hover:shadow-glow transition-all duration-500 ease-out group",
        showButton
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-16 scale-95 pointer-events-none"
      )}
      aria-label="Scroll to top"
    >
      {/* Animated glow on hover */}
      <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon */}
      <ArrowUp className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors duration-300 relative z-10 group-hover:-translate-y-1 transition-transform" />
      
      {/* Pulse ring on hover */}
      <div className="absolute inset-0 rounded-full border-2 border-accent opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500" />
    </button>
  );
};
