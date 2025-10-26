import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { TourHighlight } from "@/components/tour/TourHighlight";
import { useTour } from "@/hooks/useTour";
import { TOURS } from "@/lib/tour/steps";

export default function Onboarding() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tourId = searchParams.get("tour") || "onboarding";
  
  const tour = TOURS[tourId];
  const {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    startTour,
    nextStep,
    prevStep,
    endTour
  } = useTour(tour);

  useEffect(() => {
    // Auto-start tour after a brief delay
    const timer = setTimeout(() => {
      startTour();
    }, 500);
    return () => clearTimeout(timer);
  }, [startTour]);

  const handleEnd = () => {
    endTour();
    navigate("/");
  };

  if (!tour) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Welcome to FootprintIQ</h1>
          <p className="text-muted-foreground mb-8">
            Let's take a quick tour to get you started with your first OSINT investigation.
          </p>

          {/* Tour demonstration area */}
          <div className="grid gap-6">
            <div 
              data-tour="search-bar" 
              className="p-6 border border-border rounded-lg bg-card"
            >
              <h2 className="text-xl font-semibold mb-2">Search</h2>
              <p className="text-muted-foreground">
                Start your investigation by entering any artifact to search.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div 
                data-tour="search-input" 
                className="p-6 border border-border rounded-lg bg-card"
              >
                <h3 className="font-semibold mb-2">Auto-Detection</h3>
                <p className="text-sm text-muted-foreground">
                  We automatically detect what you're searching for.
                </p>
              </div>

              <div 
                data-tour="provider-select" 
                className="p-6 border border-border rounded-lg bg-card"
              >
                <h3 className="font-semibold mb-2">Provider Selection</h3>
                <p className="text-sm text-muted-foreground">
                  Choose which data sources to query.
                </p>
              </div>
            </div>

            <div 
              data-tour="scan-button" 
              className="p-6 border border-border rounded-lg bg-card"
            >
              <h3 className="font-semibold mb-2">Launch Investigation</h3>
              <p className="text-sm text-muted-foreground">
                Start scanning and see real-time results.
              </p>
            </div>

            <div 
              data-tour="command-palette" 
              className="p-6 border border-border rounded-lg bg-card"
            >
              <h3 className="font-semibold mb-2">Quick Actions</h3>
              <p className="text-sm text-muted-foreground">
                Press ⌘K or Ctrl+K for fast navigation.
              </p>
            </div>
          </div>
        </div>
      </main>

      {isActive && currentStep && (
        <TourHighlight
          step={currentStep}
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={handleEnd}
        />
      )}
    </div>
  );
}
