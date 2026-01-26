import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Zap, Loader2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

export const UpgradeDialog = ({ open, onOpenChange, feature = "this feature" }: UpgradeDialogProps) => {
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      // Refresh session before checkout to prevent 401 errors
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        throw new Error(`Session refresh failed: ${refreshError.message}`);
      }

      // Try primary checkout function
      let url: string | undefined;
      const primary = await supabase.functions.invoke("billing-checkout", { body: { plan: 'pro' } });
      if (!primary.error && primary.data?.url) {
        url = primary.data.url;
      } else {
        // Fallback to namespaced function
        const fallback = await supabase.functions.invoke("billing/checkout", { body: { plan: 'pro' } });
        if (!fallback.error && fallback.data?.url) {
          url = fallback.data.url;
        }
      }
      if (!url) throw new Error(primary.error?.message || 'Checkout failed');
      window.open(url, "_blank");
      onOpenChange(false);

      
      // Show success message after brief delay
      setTimeout(() => {
        toast({
          title: "Upgrade complete - enjoy premium features! 🎉",
          description: "Your subscription has been activated successfully.",
        });
      }, 2000);
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout error",
        description: error instanceof Error ? error.message : "We couldn't start the checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {feature} is a Pro feature. Upgrade now to unlock unlimited privacy protection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="bg-gradient-card border border-primary/50 rounded-xl p-6 shadow-glow">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold">£14.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <h3 className="text-xl font-semibold mb-4">Pro Plan Benefits</h3>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Unlimited scans - no restrictions</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Advanced OSINT detection across 100+ sources</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">AI-powered catfish detection</span>
              </li>
              <li className="flex items-start gap-3 opacity-60">
                <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">Removal guidance (coming soon)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Continuous monitoring & alerts</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Social media profile analysis</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Priority email support</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Monthly privacy reports</span>
              </li>
            </ul>

            <Button 
              onClick={handleUpgrade} 
              size="lg" 
              className="w-full"
              disabled={isUpgrading}
            >
              {isUpgrading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade to Pro Now
                </>
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Cancel anytime • No long-term commitment • Instant access
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
