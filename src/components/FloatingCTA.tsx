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
        onClick={() => navigate('/free-scan')}
        className="group relative px-6 py-4 h-auto shadow-elevated hover:shadow-soft transition-all duration-200"
      >
        <div className="relative flex items-center gap-3">
          <Scan className="w-5 h-5" />
          <span className="font-semibold">Start Free Scan</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </Button>

      {/* Tooltip hint */}
      <div
        className={cn(
          "absolute -top-10 right-0 px-3 py-1.5 bg-card border border-border rounded-lg shadow-card text-sm whitespace-nowrap transition-all duration-200",
          showCTA ? "opacity-100 delay-500" : "opacity-0"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-muted-foreground">Get started in 30 seconds</span>
        </div>
        {/* Arrow pointing down to button */}
        <div className="absolute -bottom-2 right-8 w-3 h-3 bg-card border-r border-b border-border rotate-45" />
      </div>
    </div>
  );
};
