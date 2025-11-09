import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Shield } from "lucide-react";
import { useState } from "react";

interface WhatsMyNameConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

export const WhatsMyNameConsentModal = ({
  open,
  onOpenChange,
  onAccept,
}: WhatsMyNameConsentModalProps) => {
  const [understood, setUnderstood] = useState(false);

  const handleAccept = () => {
    if (understood) {
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            WhatsMyName Ethical Use Policy
          </DialogTitle>
          <DialogDescription className="text-left space-y-3 pt-4">
            <p>
              <strong>WhatsMyName</strong> is a powerful OSINT tool that searches for usernames across 500+ social media platforms and websites.
            </p>
            
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-semibold text-amber-700 dark:text-amber-400">
                    Ethical Use Requirements
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Only use for legitimate OSINT investigations and privacy audits</li>
                    <li>Respect privacy and terms of service of all platforms</li>
                    <li>Do not use for harassment, stalking, or malicious purposes</li>
                    <li>Comply with all applicable laws and regulations</li>
                    <li>Do not attempt to access private or restricted accounts</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-semibold">Acceptable Uses:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Personal privacy audits and digital footprint analysis</li>
                <li>Security research and vulnerability assessments</li>
                <li>Open-source intelligence gathering for legitimate purposes</li>
                <li>Compliance investigations with proper authorization</li>
              </ul>
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-semibold text-destructive">Prohibited Uses:</p>
              <ul className="list-disc list-inside space-y-1 text-destructive">
                <li>Stalking, harassment, or doxxing individuals</li>
                <li>Identity theft or impersonation</li>
                <li>Unauthorized access to accounts or systems</li>
                <li>Any illegal or unethical activities</li>
              </ul>
            </div>

            <p className="text-xs text-muted-foreground italic">
              By proceeding, you acknowledge that you are responsible for your use of this tool and agree to use it ethically and lawfully.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 py-4">
          <Checkbox
            id="consent"
            checked={understood}
            onCheckedChange={(checked) => setUnderstood(checked === true)}
          />
          <Label
            htmlFor="consent"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            I understand and agree to use WhatsMyName only for ethical OSINT and privacy purposes
          </Label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAccept} disabled={!understood}>
            Accept and Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
