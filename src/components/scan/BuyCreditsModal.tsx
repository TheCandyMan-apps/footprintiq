import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/useWorkspace";

interface BuyCreditsModalProps {
  open: boolean;
  onClose: () => void;
}

const CREDIT_PACKAGES = [
  {
    packType: 'starter' as const,
    credits: 500,
    priceLabel: '£29',
    popular: false,
    name: 'OSINT Starter Pack',
  },
  {
    packType: 'pro' as const,
    credits: 2000,
    priceLabel: '£99',
    popular: true,
    name: 'Pro Pack',
  },
];

export function BuyCreditsModal({ open, onClose }: BuyCreditsModalProps) {
  const [loading, setLoading] = useState<number | null>(null);
  const [verifying, setVerifying] = useState(false);
  const { workspace } = useWorkspace();

  // Check for success/cancel params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("credits_success");
    const canceled = params.get("credits_canceled");
    const credits = params.get("credits");

    if (success === "true") {
      setVerifying(true);
      // Show verification loader for 300ms
      setTimeout(() => {
        setVerifying(false);
        toast.success(`${credits || "0"} credits added!`, {
          description: "Your credits are now available to use",
        });
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 300);
    } else if (canceled === "true") {
      toast.error("Payment canceled", {
        description: "No charges were made to your account",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handlePurchase = async (packType: (typeof CREDIT_PACKAGES)[number]['packType']) => {
    try {
      setLoading(packType === 'starter' ? 500 : 2000);

      // Validate and refresh session
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          toast.error("Session expired. Please log in again.");
          setLoading(null);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to purchase credits");
        setLoading(null);
        return;
      }

      if (!workspace?.id) {
        toast.error("No workspace found", {
          description: "Please select a workspace first",
        });
        setLoading(null);
        return;
      }

      // Call backend function to create checkout session
      const { data, error } = await supabase.functions.invoke("purchase-credit-pack", {
        body: {
          packType,
          workspaceId: workspace.id,
        },
      });

      if (error) {
        console.error("Checkout error:", error);
        throw error;
      }

      if (!data?.url) {
        throw new Error("No checkout URL returned");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Purchase failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Coins className="w-6 h-6 text-primary" />
            Purchase Credits
          </DialogTitle>
          <DialogDescription>
            Choose a credit package to unlock premium features
          </DialogDescription>
        </DialogHeader>

        {verifying && (
          <Card className="p-4 bg-primary/10 border-primary">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <p className="text-sm font-medium">Verifying payment...</p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card
              key={pkg.packType}
              className={`p-6 relative transition-all hover:shadow-lg ${
                pkg.popular ? "border-primary shadow-md" : ""
              }`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-2 right-4 bg-primary">
                  Most Popular
                </Badge>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{pkg.name}</h3>
                    <p className="text-sm text-muted-foreground">{pkg.credits} credits</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{pkg.priceLabel}</p>
                    <p className="text-xs text-muted-foreground">One-time purchase</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Credits never expire</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Instant activation after payment</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handlePurchase(pkg.packType)}
                  disabled={loading !== null}
                  variant={pkg.popular ? "default" : "outline"}
                >
                  {loading !== null && (pkg.packType === 'starter' ? loading === 500 : loading === 2000) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Purchase"
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-sm text-muted-foreground space-y-2 border-t pt-4">
          <p>• Credits never expire and can be used anytime</p>
          <p>• Secure payment processing via Stripe</p>
          <p>• Instant credit activation after payment</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
