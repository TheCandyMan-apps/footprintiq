import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ShieldAlert } from "lucide-react";

interface SensitiveConsentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (categories: string[]) => void;
  loading?: boolean;
}

export function SensitiveConsentModal({
  open,
  onClose,
  onConfirm,
  loading = false,
}: SensitiveConsentModalProps) {
  const [categories, setCategories] = React.useState<string[]>([]);
  
  const toggle = (category: string) => {
    setCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleConfirm = () => {
    if (categories.length > 0) {
      onConfirm(categories);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-warning" />
            Sensitive Source Consent Required
          </DialogTitle>
          <DialogDescription>
            You are about to enable scanning of sensitive sources
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Legal Notice:</strong> By enabling these sources, you confirm that you:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Have a legitimate and lawful purpose</li>
                <li>Will comply with all applicable laws and regulations</li>
                <li>Will respect platform terms of service</li>
                <li>Understand that illegal content is strictly forbidden</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Select the sensitive source categories you need:
            </p>
            
            <div className="space-y-3 border rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded">
                <Checkbox
                  checked={categories.includes('dating')}
                  onCheckedChange={() => toggle('dating')}
                />
                <div className="flex-1">
                  <div className="font-medium">Dating Platforms</div>
                  <div className="text-xs text-muted-foreground">
                    Tinder, Bumble, Hinge, Match, OkCupid, and 10+ more
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded">
                <Checkbox
                  checked={categories.includes('nsfw')}
                  onCheckedChange={() => toggle('nsfw')}
                />
                <div className="flex-1">
                  <div className="font-medium">Adult Content Platforms</div>
                  <div className="text-xs text-muted-foreground">
                    OnlyFans, Fansly, and other legal adult content sites (18+ only)
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded">
                <Checkbox
                  checked={categories.includes('darkweb')}
                  onCheckedChange={() => toggle('darkweb')}
                />
                <div className="flex-1">
                  <div className="font-medium">Dark Web Monitoring</div>
                  <div className="text-xs text-muted-foreground">
                    Tor hidden services and darknet marketplaces (read-only)
                  </div>
                </div>
              </label>
            </div>
          </div>

          <Alert>
            <AlertDescription className="text-xs">
              <strong>Privacy Note:</strong> FootprintIQ only queries publicly available information. 
              We never access private accounts or password-protected content. All scans are logged 
              for compliance and audit purposes.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={categories.length === 0 || loading}
          >
            {loading ? "Processing..." : "I Understand & Agree"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
