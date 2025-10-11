import { useState } from "react";
import { Hero } from "@/components/Hero";
import { ScanForm, type ScanFormData } from "@/components/ScanForm";
import { ScanProgress } from "@/components/ScanProgress";
import { ScanResults } from "@/components/ScanResults";

type Step = "hero" | "form" | "scanning" | "results";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>("hero");
  const [scanData, setScanData] = useState<ScanFormData | null>(null);

  const handleStartScan = () => {
    setCurrentStep("form");
  };

  const handleFormSubmit = (data: ScanFormData) => {
    setScanData(data);
    setCurrentStep("scanning");
  };

  const handleScanComplete = () => {
    setCurrentStep("results");
  };

  return (
    <main className="min-h-screen bg-background">
      {currentStep === "hero" && <Hero onStartScan={handleStartScan} />}
      {currentStep === "form" && <ScanForm onSubmit={handleFormSubmit} />}
      {currentStep === "scanning" && <ScanProgress onComplete={handleScanComplete} />}
      {currentStep === "results" && <ScanResults />}
    </main>
  );
};

export default Index;
