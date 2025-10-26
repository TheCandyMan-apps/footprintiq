import { useEffect, useRef, useState } from "react";
import { TourStep } from "@/lib/tour/types";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TourHighlightProps {
  step: TourStep;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export function TourHighlight({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip
}: TourHighlightProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.querySelector(step.sel);
    if (!target) {
      console.warn(`Tour target not found: ${step.sel}`);
      return;
    }

    const rect = target.getBoundingClientRect();
    setTargetRect(rect);

    // Scroll target into view if needed
    target.scrollIntoView({ behavior: "smooth", block: "center" });

    // Add highlight class
    target.classList.add("tour-highlight");
    return () => target.classList.remove("tour-highlight");
  }, [step.sel]);

  if (!targetRect) {
    return null;
  }

  const placement = step.placement || "bottom";
  const getPopoverPosition = () => {
    const padding = 16;
    const popoverWidth = 320;
    const popoverHeight = 200; // estimated

    switch (placement) {
      case "top":
        return {
          left: targetRect.left + targetRect.width / 2 - popoverWidth / 2,
          top: targetRect.top - popoverHeight - padding,
        };
      case "bottom":
        return {
          left: targetRect.left + targetRect.width / 2 - popoverWidth / 2,
          top: targetRect.bottom + padding,
        };
      case "left":
        return {
          left: targetRect.left - popoverWidth - padding,
          top: targetRect.top + targetRect.height / 2 - popoverHeight / 2,
        };
      case "right":
        return {
          left: targetRect.right + padding,
          top: targetRect.top + targetRect.height / 2 - popoverHeight / 2,
        };
    }
  };

  const popoverPos = getPopoverPosition();

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] animate-in fade-in duration-300"
        onClick={onSkip}
      />

      {/* Spotlight cutout */}
      <div
        className="fixed z-[9999] pointer-events-none"
        style={{
          left: targetRect.left - 8,
          top: targetRect.top - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 20px 8px hsl(var(--primary) / 0.5)",
          borderRadius: "8px",
          transition: "all 0.3s ease-in-out"
        }}
      >
        {/* Animated pulse ring */}
        <div className="absolute inset-0 rounded-lg border-2 border-primary animate-pulse" />
      </div>

      {/* Popover */}
      <div
        ref={popoverRef}
        className="fixed z-[10000] w-80 bg-card border border-border rounded-lg shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300"
        style={{
          left: Math.max(16, Math.min(popoverPos.left, window.innerWidth - 320 - 16)),
          top: Math.max(16, Math.min(popoverPos.top, window.innerHeight - 250)),
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-border">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground">{step.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Step {currentStepIndex + 1} of {totalSteps}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSkip}
            className="h-8 w-8 -mt-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step.body}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip Tour
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
              disabled={currentStepIndex === 0}
              className="gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </Button>
            <Button
              size="sm"
              onClick={onNext}
              className="gap-1"
            >
              {currentStepIndex === totalSteps - 1 ? "Finish" : "Next"}
              {currentStepIndex < totalSteps - 1 && <ArrowRight className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pb-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === currentStepIndex
                  ? "w-6 bg-primary"
                  : i < currentStepIndex
                  ? "w-1.5 bg-primary/50"
                  : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>

      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 10000;
        }
      `}</style>
    </>
  );
}
