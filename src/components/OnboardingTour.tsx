import { useState, useEffect } from "react";
import { getAIResponse } from "@/lib/aiRouter";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
  title: string;
  description: string;
  target?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Dashboard Overview",
    description: "Your security command center",
    target: "dashboard",
  },
  {
    title: "Run Security Scan",
    description: "Discover your digital footprint",
    target: "scan-button",
  },
  {
    title: "View Insights",
    description: "AI-powered recommendations",
    target: "insights-panel",
  },
  {
    title: "Risk Score",
    description: "Monitor your security posture",
    target: "risk-score",
  },
];

interface OnboardingTourProps {
  onComplete?: () => void;
  onDismiss?: () => void;
}

export function OnboardingTour({ onComplete, onDismiss }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipContent, setTooltipContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>("user");

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("user_preferences")
          .select("ai_preferred_model")
          .eq("user_id", user.id)
          .single();
        
        setUserRole(data?.ai_preferred_model || "user");
      }
    };
    fetchUserRole();
  }, []);

  // Generate AI tooltip for current step
  useEffect(() => {
    const generateTooltip = async () => {
      setIsLoading(true);
      try {
        const step = TOUR_STEPS[currentStep];
        const { content } = await getAIResponse({
          systemPrompt: "One-sentence benefit for the current step.",
          userPrompt: `User role: ${userRole}. Step: ${step.title}`,
        });
        setTooltipContent(content);
      } catch (error) {
        console.error("Failed to generate tooltip:", error);
        setTooltipContent(TOUR_STEPS[currentStep].description);
      } finally {
        setIsLoading(false);
      }
    };

    generateTooltip();
  }, [currentStep, userRole]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDismiss = () => {
    onDismiss?.();
  };

  const step = TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="relative w-full max-w-lg mx-4 p-6 shadow-2xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Step {currentStep + 1} of {TOUR_STEPS.length}</span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mb-8 min-h-[80px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <p className="text-base text-foreground/90 leading-relaxed">
              {tooltipContent}
            </p>
          )}
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            className="gap-2"
          >
            {currentStep === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
            {currentStep < TOUR_STEPS.length - 1 && (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
