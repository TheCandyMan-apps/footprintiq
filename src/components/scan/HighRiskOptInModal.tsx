import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Lock, Sparkles } from 'lucide-react';
import { useTierGating } from '@/hooks/useTierGating';

interface HighRiskOptInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (optIn: boolean) => void;
  entityType?: string;
}

export function HighRiskOptInModal({
  open,
  onOpenChange,
  onConfirm,
  entityType = 'target',
}: HighRiskOptInModalProps) {
  const [understood, setUnderstood] = useState(false);
  const [optIn, setOptIn] = useState(false);
  const { isFree, isPro, isBusiness } = useTierGating();

  const canAccess = isPro || isBusiness;

  const handleConfirm = () => {
    if (canAccess && understood) {
      onConfirm(optIn);
      onOpenChange(false);
    } else if (!canAccess) {
      // Just close without opt-in for free users
      onConfirm(false);
      onOpenChange(false);
    }
  };

  const handleSkip = () => {
    onConfirm(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-amber-500/10">
              <Lock className="h-5 w-5 text-amber-500" />
            </div>
            <DialogTitle className="text-lg">
              Enable High-Risk Intelligence Sources?
            </DialogTitle>
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="h-3 w-3 mr-1" />
              Pro+
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!canAccess ? (
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">
                    Upgrade to unlock High-Risk Intelligence
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This feature includes enhanced threat detection from additional 
                    OSINT sources. Available on Pro and Business plans.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  This scan can include limited references from high-risk public sources 
                  (including parts of the dark web).
                </p>
                <p>
                  FootprintIQ does not monitor, track, or interact with these sources.
                  <br />
                  Results are AI-filtered, summarized, and shown only when relevant.
                </p>
                <p className="text-foreground/70 italic">
                  Most scans return no actionable findings.
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="optIn"
                    checked={optIn}
                    onCheckedChange={(checked) => {
                      setOptIn(checked === true);
                      setUnderstood(checked === true);
                    }}
                  />
                  <Label
                    htmlFor="optIn"
                    className="text-sm text-foreground cursor-pointer"
                  >
                    I understand and want to include advanced OSINT sources
                  </Label>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={handleSkip}
          >
            Skip
          </Button>
          {canAccess ? (
            <Button
              onClick={handleConfirm}
              disabled={!optIn}
            >
              Continue Scan
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={() => {
                window.location.href = '/pricing';
              }}
            >
              View Plans
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
