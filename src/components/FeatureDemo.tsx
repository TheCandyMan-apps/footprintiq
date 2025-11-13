import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

const getImagePaths = (pngPath: string) => {
  const webpPath = pngPath.replace(/\.png$/, '.webp');
  return { pngPath, webpPath };
};

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
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
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

  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [currentStep]);

  // Prefetch next and previous images
  useEffect(() => {
    const prefetchImage = (index: number) => {
      const step = steps[index];
      if (!step) return;
      
      const { pngPath, webpPath } = getImagePaths(step.screenshot);
      
      // Prefetch WebP
      const webpImg = new Image();
      webpImg.src = webpPath;
      
      // Prefetch PNG fallback
      const pngImg = new Image();
      pngImg.src = pngPath;
    };

    // Prefetch next step
    const nextStep = (currentStep + 1) % steps.length;
    prefetchImage(nextStep);

    // Prefetch previous step
    const prevStep = (currentStep - 1 + steps.length) % steps.length;
    prefetchImage(prevStep);
  }, [currentStep, steps]);

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
        <div className="absolute inset-0">
          {/* Loading State */}
          {imageLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 animate-pulse">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Loading demo...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm">
              <div className="text-center p-8 max-w-md">
                <div className="w-full max-w-2xl mx-auto bg-card/80 backdrop-blur-sm rounded-lg border border-border/50 p-8 shadow-xl">
                  <div className="space-y-4">
                    <div className="h-8 bg-gradient-to-r from-primary/20 to-accent/20 rounded" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-32 bg-gradient-card rounded border border-border/50" />
                      <div className="h-32 bg-gradient-card rounded border border-border/50" />
                    </div>
                    <div className="h-4 bg-gradient-to-r from-primary/10 to-transparent rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-gradient-to-r from-primary/10 to-transparent rounded w-1/2 mx-auto" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">Demo preview placeholder</p>
              </div>
            </div>
          )}

          {/* Image with WebP support */}
          <picture>
            <source 
              type="image/webp" 
              srcSet={getImagePaths(steps[currentStep].screenshot).webpPath}
            />
            <img
              src={getImagePaths(steps[currentStep].screenshot).pngPath}
              alt={steps[currentStep].label}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 768px) 100vw, 1280px"
              className={cn(
                "w-full h-full object-contain transition-opacity duration-300",
                imageLoading || imageError ? "opacity-0" : "opacity-100 animate-fade-in"
              )}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
              key={currentStep}
            />
          </picture>

          {/* Step Indicator */}
          <div className="absolute top-4 left-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            Step {currentStep + 1} of {steps.length}
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
