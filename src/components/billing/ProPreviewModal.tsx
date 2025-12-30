import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Check } from "lucide-react";
import { useProPreview } from "@/hooks/useProPreview";
import { useState } from "react";

interface ProPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * ProPreviewModal - Modal for starting the 72-hour Pro Preview trial.
 * Uses exact copy provided in spec.
 */
export function ProPreviewModal({ open, onOpenChange }: ProPreviewModalProps) {
  const { startTrialCheckout, isTrialEligible, loading } = useProPreview();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartTrial = async () => {
    setIsStarting(true);
    try {
      await startTrialCheckout();
    } finally {
      setIsStarting(false);
    }
  };

  const benefits = [
    "Limited Pro scans",
    "Full Pro insight on preview scans",
    "Auto-converts unless cancelled",
    "Cancel anytime",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center pb-2">
          {/* Icon header */}
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>

          <DialogTitle className="text-xl font-semibold leading-tight">
            Try Pro with confidence
          </DialogTitle>

          <DialogDescription className="pt-4 text-base text-muted-foreground">
            Get temporary access to FootprintIQ Pro — including deeper context, 
            confidence scoring, and linked identity analysis.
            <span className="block mt-2 font-medium text-foreground">
              Perfect for evaluating accuracy before committing.
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Benefits list */}
        <div className="py-4">
          <ul className="space-y-2.5">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={handleStartTrial}
            disabled={isStarting || loading || !isTrialEligible}
            size="lg"
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isStarting ? "Processing..." : "Start Pro Preview"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            Maybe later
          </Button>
        </div>

        {/* Trust line */}
        <p className="text-[11px] text-muted-foreground/60 text-center pt-2">
          Ethical OSINT only • Public data sources • No monitoring
        </p>
      </DialogContent>
    </Dialog>
  );
}
