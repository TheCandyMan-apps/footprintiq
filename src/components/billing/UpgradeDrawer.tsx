import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap, Crown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpgradeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: string;
}

const PLANS = [
  {
    id: "pro",
    name: "Pro",
    price: "14.99",
    icon: Zap,
    features: [
      "100 scans per month",
      "Multi-tool OSINT (Maigret + Sherlock)",
      "IPQS Email & Phone Intelligence",
      "Full results view",
      "PDF & CSV export",
      "Priority queue",
      "Risk scoring",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "49.99",
    icon: Crown,
    popular: true,
    features: [
      "Unlimited scans",
      "All multi-tool providers (incl. GoSearch)",
      "Shared workspaces",
      "Audit logs",
      "API access",
      "Case notes & tagging",
      "Early access to premium providers",
    ],
  },
];

export const UpgradeDrawer = ({ open, onOpenChange, currentPlan }: UpgradeDrawerProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    setLoading(planId);
    try {
      // Refresh session before checkout to prevent 401 errors
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        throw new Error(`Session refresh failed: ${refreshError.message}`);
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Please sign in first");
        return;
      }

      const { data, error } = await supabase.functions.invoke("billing-checkout", {
        body: { plan: planId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        
        // Show success message after brief delay
        setTimeout(() => {
          toast.success("Upgrade complete - enjoy premium features! 🎉", {
            description: "Your subscription has been activated successfully.",
          });
        }, 2000);
      }
    } catch (error: any) {
      toast.error("Failed to start checkout: " + error.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Upgrade Your Plan</SheetTitle>
          <SheetDescription>
            Choose the plan that fits your needs
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = currentPlan === plan.id;

            return (
              <Card
                key={plan.id}
                className={plan.popular ? "border-primary shadow-lg" : ""}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {plan.name}
                          {plan.popular && (
                            <Badge variant="default">Most Popular</Badge>
                          )}
                          {isCurrent && (
                            <Badge variant="outline">Current Plan</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {plan.price === "Contact" ? (
                            "Custom pricing"
                          ) : (
                            <>
                              <span className="text-2xl font-bold text-foreground">
                                £{plan.price}
                              </span>
                              /month
                            </>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    disabled={isCurrent || loading === plan.id}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {loading === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrent ? (
                      "Current Plan"
                    ) : plan.price === "Contact" ? (
                      "Contact Sales"
                    ) : (
                      "Upgrade"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
