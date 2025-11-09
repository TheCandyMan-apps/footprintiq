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
import { Shield, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface HarvesterConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConsent: () => void;
}

export const HarvesterConsentDialog = ({
  open,
  onOpenChange,
  onConsent,
}: HarvesterConsentDialogProps) => {
  const [agreed, setAgreed] = useState(false);

  const handleConsent = () => {
    if (agreed) {
      onConsent();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Ethical Use Agreement
          </DialogTitle>
          <DialogDescription>
            Please read and agree to the following terms before using Harvester Recon
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg border border-warning/50 bg-warning/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Passive OSINT Only</h4>
                <p className="text-xs text-muted-foreground">
                  This tool performs passive open-source intelligence gathering only.
                  It collects publicly available information from legitimate sources.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Acceptable Use:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Security research and vulnerability assessment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Privacy protection and digital footprint analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Corporate security auditing and compliance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Academic research and education</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Prohibited Use:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-destructive">✗</span>
                <span>Malicious hacking or unauthorized access attempts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">✗</span>
                <span>Spamming, phishing, or social engineering attacks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">✗</span>
                <span>Harassment, stalking, or invasion of privacy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">✗</span>
                <span>Any illegal or unethical activities</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <h4 className="font-semibold text-sm">Data Sources</h4>
            <p className="text-xs text-muted-foreground">
              All data is collected from publicly accessible sources including search engines,
              professional networking platforms, certificate transparency logs, and DNS records.
              No private data is accessed or collected.
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <Checkbox
              id="consent"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <label
              htmlFor="consent"
              className="text-sm leading-relaxed cursor-pointer"
            >
              I understand and agree that I will use Harvester Recon responsibly for legitimate
              security research, privacy protection, or educational purposes only. I will not use
              this tool for any malicious, illegal, or unethical activities.
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConsent} disabled={!agreed}>
            <Shield className="w-4 h-4 mr-2" />
            I Agree - Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
