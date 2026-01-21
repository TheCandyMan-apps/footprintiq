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
import { AlertTriangle, Shield, Lock, Info, Sparkles } from 'lucide-react';
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
              <Shield className="h-5 w-5 text-amber-500" />
            </div>
            <DialogTitle className="text-lg">
              High-Risk Intelligence
            </DialogTitle>
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="h-3 w-3 mr-1" />
              Pro+
            </Badge>
          </div>
          <DialogDescription className="text-left pt-2">
            Optional deep-scan module for enhanced exposure detection.
          </DialogDescription>
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
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  What this includes
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Breach compilation index references
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Paste site aggregator scanning
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Dark forum mention detection (filtered)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    LENS AI-powered signal filtering
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">
                      Important considerations
                    </p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• Results are filtered by AI—no raw data is exposed</li>
                      <li>• Dark web signals are inherently unreliable</li>
                      <li>• Finding a reference does not confirm active exposure</li>
                      <li>• We recommend calm review, not panic</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="understood"
                    checked={understood}
                    onCheckedChange={(checked) => setUnderstood(checked === true)}
                  />
                  <Label
                    htmlFor="understood"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    I understand that high-risk intelligence results require careful 
                    interpretation and may not represent confirmed threats.
                  </Label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="optIn"
                    checked={optIn}
                    onCheckedChange={(checked) => setOptIn(checked === true)}
                    disabled={!understood}
                  />
                  <Label
                    htmlFor="optIn"
                    className={`text-sm cursor-pointer ${
                      understood ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    Enable High-Risk Intelligence for this scan
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
            {canAccess ? 'Skip' : 'Continue without'}
          </Button>
          {canAccess ? (
            <Button
              onClick={handleConfirm}
              disabled={!understood}
            >
              {optIn ? 'Enable & Continue' : 'Continue'}
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={() => {
                // Could navigate to upgrade page
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
