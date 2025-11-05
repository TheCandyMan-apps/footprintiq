import { Button } from "@/components/ui/button";
import { Scan, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScrollPastElement } from "@/hooks/useScrollPastElement";
import { cn } from "@/lib/utils";

export const FloatingCTA = () => {
  const navigate = useNavigate();
  const showCTA = useScrollPastElement(800); // Show after scrolling 800px (past hero)

  return (
    <div
      className={cn(
        "fixed bottom-8 right-8 z-50 transition-all duration-500 ease-out",
        showCTA
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-16 scale-95 pointer-events-none"
      )}
    >
      <Button
        size="lg"
        variant="hero"
        onClick={() => navigate('/auth')}
        className="group relative px-8 py-6 h-auto text-lg shadow-elevated hover:shadow-glow transition-all duration-300 hover:scale-105 animate-pulse-glow"
      >
        {/* Animated glow background */}
        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary via-accent to-primary opacity-75 blur-xl group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Button content */}
        <div className="relative flex items-center gap-3">
          <Scan className="w-5 h-5 animate-pulse" />
          <span className="font-semibold">Start Free Scan</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 rounded-md overflow-hidden">
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </Button>

      {/* Tooltip hint */}
      <div
        className={cn(
          "absolute -top-12 right-0 px-4 py-2 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg text-sm whitespace-nowrap transition-all duration-300",
          showCTA ? "opacity-100 delay-500" : "opacity-0"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-muted-foreground">Get started in 30 seconds</span>
        </div>
        {/* Arrow pointing down to button */}
        <div className="absolute -bottom-2 right-8 w-3 h-3 bg-card border-r border-b border-border rotate-45" />
      </div>
    </div>
  );
};
