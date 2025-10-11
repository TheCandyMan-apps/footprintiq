import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Search, Database, Globe, Shield } from "lucide-react";

interface ScanProgressProps {
  onComplete: () => void;
}

const scanSteps = [
  { icon: Search, label: "Searching public records", duration: 2000 },
  { icon: Database, label: "Scanning data broker sites", duration: 2500 },
  { icon: Globe, label: "Checking social networks", duration: 2000 },
  { icon: Shield, label: "Analyzing exposure risk", duration: 1500 },
];

export const ScanProgress = ({ onComplete }: ScanProgressProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let totalTime = 0;
    const totalDuration = scanSteps.reduce((sum, step) => sum + step.duration, 0);

    scanSteps.forEach((step, index) => {
      totalTime += step.duration;
      setTimeout(() => {
        setCurrentStep(index);
        setProgress((totalTime / totalDuration) * 100);
      }, totalTime);
    });

    setTimeout(() => {
      onComplete();
    }, totalDuration + 500);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <Card className="w-full max-w-2xl p-8 bg-gradient-card border-border shadow-card">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Scanning Your Digital Footprint</h2>
          <p className="text-muted-foreground">
            This may take a few moments while we search across the web
          </p>
        </div>

        <div className="space-y-8">
          <Progress value={progress} className="h-2" />
          
          <div className="space-y-4">
            {scanSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div 
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 ${
                    isActive ? 'bg-primary/10 border border-primary/20' : 
                    isCompleted ? 'bg-secondary/50' : 'bg-secondary/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive ? 'bg-primary text-primary-foreground shadow-glow' :
                    isCompleted ? 'bg-accent text-accent-foreground' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`transition-all duration-300 ${
                    isActive ? 'text-foreground font-medium' : 
                    isCompleted ? 'text-foreground/80' : 
                    'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                  {isActive && (
                    <div className="ml-auto flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-100" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-200" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};
