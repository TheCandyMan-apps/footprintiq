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
import { AlertTriangle } from 'lucide-react';

interface MaltegoConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConsent: () => void;
}

export function MaltegoConsentModal({ open, onOpenChange, onConsent }: MaltegoConsentModalProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToEthics, setAgreedToEthics] = useState(false);

  const handleProceed = () => {
    if (agreedToTerms && agreedToEthics) {
      onConsent();
      onOpenChange(false);
      setAgreedToTerms(false);
      setAgreedToEthics(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <DialogTitle>Ethical Use Agreement</DialogTitle>
          </div>
          <DialogDescription>
            Please review and accept the terms before proceeding with Maltego AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-4 border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              Important: Ethical OSINT Guidelines
            </h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Maltego AI is a powerful tool designed for legitimate OSINT and privacy research only.
              Misuse of this tool may violate laws and ethical standards.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                I confirm this tool will be used <strong>exclusively for lawful purposes</strong>, including:
                <ul className="mt-2 ml-4 list-disc space-y-1">
                  <li>Personal privacy protection and security research</li>
                  <li>Authorized investigations with proper consent</li>
                  <li>Academic research within ethical guidelines</li>
                  <li>Legitimate threat intelligence and cybersecurity</li>
                </ul>
              </Label>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="ethics"
                checked={agreedToEthics}
                onCheckedChange={(checked) => setAgreedToEthics(checked as boolean)}
              />
              <Label htmlFor="ethics" className="text-sm leading-relaxed cursor-pointer">
                I understand and agree <strong>NOT to use this tool for</strong>:
                <ul className="mt-2 ml-4 list-disc space-y-1">
                  <li>Stalking, harassment, or any form of abuse</li>
                  <li>Unauthorized surveillance or privacy invasion</li>
                  <li>Identity theft or fraudulent activities</li>
                  <li>Any activities that violate local, state, or federal laws</li>
                </ul>
              </Label>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Legal Notice:</strong> Users are solely responsible for ensuring their use of this tool
              complies with all applicable laws and regulations. FootprintIQ disclaims any liability for
              misuse of this tool.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            disabled={!agreedToTerms || !agreedToEthics}
          >
            I Understand & Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
