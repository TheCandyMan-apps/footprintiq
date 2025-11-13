import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureDemoProps {
  title: string;
  steps: {
    label: string;
    screenshot: string;
    description: string;
  }[];
}

export const FeatureDemo = ({ title, steps }: FeatureDemoProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearAnimation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearAnimation();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          const next = (prev + 1) % steps.length;
          if (next === 0) {
            clearAnimation();
            setIsPlaying(false);
          }
          return next;
        });
      }, 3000);
    } else {
      clearAnimation();
    }
  }, [isPlaying, steps.length]);

  const handleStepClick = (index: number) => {
    clearAnimation();
    setCurrentStep(index);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-gradient-card rounded-xl border border-border/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-lg">{title}</h4>
        <Button
          size="sm"
          variant="outline"
          onClick={handlePlayPause}
          className="gap-2"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Play Demo
            </>
          )}
        </Button>
      </div>

      {/* Demo Display */}
      <div className="relative rounded-lg overflow-hidden bg-background/50 border border-border mb-4 aspect-video">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* Animated Screenshot */}
            <div
              className="absolute inset-0 flex items-center justify-center p-8 animate-fade-in"
              key={currentStep}
            >
              <div className="text-center">
                <div className="w-full max-w-2xl mx-auto bg-card/80 backdrop-blur-sm rounded-lg border border-primary/20 p-8 shadow-2xl">
                  <div className="space-y-4">
                    <div className="h-8 bg-gradient-to-r from-primary/20 to-accent/20 rounded animate-pulse" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-32 bg-gradient-card rounded border border-border/50" />
                      <div className="h-32 bg-gradient-card rounded border border-border/50" />
                    </div>
                    <div className="h-4 bg-gradient-to-r from-primary/10 to-transparent rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-gradient-to-r from-primary/10 to-transparent rounded w-1/2 mx-auto" />
                  </div>
                </div>
              </div>
            </div>

            {/* Step Indicator */}
            <div className="absolute top-4 left-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
        </div>
      </div>

      {/* Step Description */}
      <div className="mb-4 min-h-[60px]">
        <p className="text-sm text-muted-foreground">
          {steps[currentStep].description}
        </p>
      </div>

      {/* Step Navigation */}
      <div className="flex gap-2 flex-wrap">
        {steps.map((step, index) => (
          <button
            key={index}
            onClick={() => handleStepClick(index)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              currentStep === index
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {step.label}
          </button>
        ))}
      </div>
    </div>
  );
};
