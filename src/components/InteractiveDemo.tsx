import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { EnrichmentMockup } from './demo-mockups/EnrichmentMockup';
import { DarkWebMockup } from './demo-mockups/DarkWebMockup';
import { BulkScanMockup } from './demo-mockups/BulkScanMockup';
import { APIMockup } from './demo-mockups/APIMockup';
import { AIMockup } from './demo-mockups/AIMockup';
import { TeamMockup } from './demo-mockups/TeamMockup';
import { ReportMockup } from './demo-mockups/ReportMockup';
import { SSOMockup } from './demo-mockups/SSOMockup';

interface Step {
  label: string;
  screenshot?: string;
  description: string;
}

interface InteractiveDemoProps {
  title: string;
  steps: Step[];
  demoType: 'enrichment' | 'darkweb' | 'bulk' | 'api' | 'ai' | 'team' | 'report' | 'sso';
}

export function InteractiveDemo({ title, steps, demoType }: InteractiveDemoProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const renderMockup = () => {
    const props = { step: currentStep };
    
    switch (demoType) {
      case 'enrichment':
        return <EnrichmentMockup {...props} />;
      case 'darkweb':
        return <DarkWebMockup {...props} />;
      case 'bulk':
        return <BulkScanMockup {...props} />;
      case 'api':
        return <APIMockup {...props} />;
      case 'ai':
        return <AIMockup {...props} />;
      case 'team':
        return <TeamMockup {...props} />;
      case 'report':
        return <ReportMockup {...props} />;
      case 'sso':
        return <SSOMockup {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">{title}</h3>
        <Button
          variant="outline"
          size="sm"
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

      <div className="relative rounded-lg border-2 border-border overflow-hidden bg-muted/20 min-h-[400px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full h-full"
          >
            {renderMockup()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold">Step {currentStep + 1} of {steps.length}</span>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {steps[currentStep].description}
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {steps.map((step, index) => (
            <Button
              key={index}
              variant={currentStep === index ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStepClick(index)}
              className={cn(
                'transition-all',
                currentStep === index && 'ring-2 ring-primary/20'
              )}
            >
              {index + 1}. {step.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
